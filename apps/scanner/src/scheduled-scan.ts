import path from 'node:path';
import {
  DEFAULT_MIN_SCORE,
  GENERATOR_VERSION,
  createConsoleProgressAdapter,
  createFileCheckpointAdapter,
  generateCandidates,
  nodeDNSAdapter,
  nodeTimingAdapter,
  nodeWHOISAdapter,
  reconcileCandidateDatabase,
  runScanBatch,
  type DomainDatabase,
  type DomainRecord,
  type ScanDependencies,
  type ScanOutcome
} from '@digitx/core';

type CandidateGenerator = typeof generateCandidates;

export interface ScheduledScanOptions {
  apiUrl: string;
  syncSecret: string;
  maxCandidates?: number;
  dnsConcurrency?: number;
  maxWhois?: number;
  databasePath?: string;
  fetch?: typeof globalThis.fetch;
  scanDependencies?: ScanDependencies;
  generateCandidates?: CandidateGenerator;
  log?: (message: string) => void;
}

export async function runScheduledScan(options: ScheduledScanOptions): Promise<ScanOutcome> {
  const log = options.log ?? console.log;
  const checkpoint = await loadRemoteCheckpoint(options.apiUrl, options.fetch ?? globalThis.fetch);
  const database = prepareCandidateDatabase(
    checkpoint,
    options.maxCandidates,
    options.generateCandidates ?? generateCandidates,
    log
  );
  log(`Starting scan batch. Total domains: ${database.stats.total}, Unchecked: ${database.stats.unchecked}`);
  const dependencies = options.scanDependencies ?? createProductionDependencies(options.databasePath, log);
  const outcome = await runScanBatch(
    database,
    {
      dnsConcurrency: options.dnsConcurrency ?? 50,
      maxWhois: options.maxWhois ?? 50,
      whoisDelayMs: database.config.delay
    },
    dependencies
  );

  await syncToCloudflare(options.apiUrl, options.syncSecret, outcome.database, options.fetch ?? globalThis.fetch);
  return outcome;
}

export async function loadRemoteCheckpoint(apiUrl: string, fetchImplementation: typeof globalThis.fetch): Promise<DomainDatabase | null> {
  let response: Response;
  try {
    response = await fetchImplementation(`${apiUrl}/api/domains`);
  } catch (error) {
    throw new Error(`Unable to load the remote Scan Engine checkpoint: ${errorMessage(error)}`);
  }

  if (!response.ok) {
    throw new Error(`Unable to load the remote Scan Engine checkpoint: HTTP ${response.status}.`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(`Unable to read the remote Scan Engine checkpoint: ${errorMessage(error)}`);
  }

  if (!isDomainDatabase(payload)) return null;

  return Object.keys(payload.domains).length === 0 ? null : payload;
}

function prepareCandidateDatabase(
  checkpoint: DomainDatabase | null,
  maxCandidates: number | undefined,
  candidateGenerator: CandidateGenerator,
  log: (message: string) => void
): DomainDatabase {
  if (checkpoint?.generatorVersion === GENERATOR_VERSION) {
    return checkpoint;
  }

  log(
    checkpoint
      ? `Candidate generator changed from ${checkpoint.generatorVersion ?? 'legacy'} to ${GENERATOR_VERSION}; reconciling scan state.`
      : 'No remote checkpoint found; generating initial Numeric Domain candidates.'
  );
  const tld = checkpoint?.config.tld ?? '.xyz';
  const generatedCandidates = candidateGenerator({
    minScore: DEFAULT_MIN_SCORE,
    tld
  });
  const candidates = generatedCandidates.slice(0, maxCandidates ?? Number.MAX_SAFE_INTEGER);

  return reconcileCandidateDatabase(checkpoint, candidates, {
    generatorVersion: GENERATOR_VERSION,
    delay: checkpoint?.config.delay ?? 2000,
    minScore: DEFAULT_MIN_SCORE,
    tld
  });
}

function createProductionDependencies(databasePath: string | undefined, log: (message: string) => void): ScanDependencies {
  const checkpointPath = path.resolve(process.cwd(), databasePath ?? 'domains_db.json');
  return {
    dns: nodeDNSAdapter,
    whois: nodeWHOISAdapter,
    timing: nodeTimingAdapter,
    checkpoint: createFileCheckpointAdapter(checkpointPath),
    progress: createConsoleProgressAdapter((message) => log(`Scan Engine ${message}`))
  };
}

async function syncToCloudflare(
  apiUrl: string,
  syncSecret: string,
  database: DomainDatabase,
  fetchImplementation: typeof globalThis.fetch
): Promise<void> {
  let response: Response;
  try {
    response = await fetchImplementation(`${apiUrl}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${syncSecret}`
      },
      body: JSON.stringify(database)
    });
  } catch (error) {
    throw new Error(`Unable to sync the Scan Engine checkpoint: ${errorMessage(error)}`);
  }

  if (!response.ok) {
    throw new Error(`Unable to sync the Scan Engine checkpoint: HTTP ${response.status}.`);
  }
}

function isDomainDatabase(value: unknown): value is DomainDatabase {
  if (!isRecord(value) || !isRecord(value.domains) || !isStats(value.stats) || !isConfig(value.config)) return false;
  if (value.generatorVersion !== undefined && typeof value.generatorVersion !== 'string') return false;
  return Object.values(value.domains).every(isDomainRecord);
}

function isDomainRecord(value: unknown): value is DomainRecord {
  return (
    isRecord(value) &&
    typeof value.domain === 'string' &&
    typeof value.number === 'string' &&
    typeof value.score === 'number' &&
    typeof value.category === 'string' &&
    typeof value.patternDesc === 'string' &&
    (value.tags === undefined || (Array.isArray(value.tags) && value.tags.every((tag) => typeof tag === 'string'))) &&
    (value.scoreBreakdown === undefined ||
      (Array.isArray(value.scoreBreakdown) && value.scoreBreakdown.every(isScoreContribution))) &&
    ['unchecked', 'checking', 'available', 'registered', 'error'].includes(String(value.status)) &&
    typeof value.detail === 'string' &&
    (typeof value.updatedAt === 'string' || value.updatedAt === null)
  );
}

function isStats(value: unknown): boolean {
  return isRecord(value) && ['total', 'checked', 'unchecked', 'available', 'registered', 'error'].every((key) => typeof value[key] === 'number');
}

function isConfig(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.delay === 'number' &&
    typeof value.minScore === 'number' &&
    typeof value.tld === 'string'
  );
}

function isScoreContribution(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    typeof value.points === 'number'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
