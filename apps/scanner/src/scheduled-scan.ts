import path from 'node:path';
import {
  createConsoleProgressAdapter,
  createFileCheckpointAdapter,
  generateCandidates,
  nodeDNSAdapter,
  nodeTimingAdapter,
  nodeWHOISAdapter,
  recalculateStats,
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
  const database = checkpoint ?? createInitialDatabase(options.maxCandidates, options.generateCandidates ?? generateCandidates, log);
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

function createInitialDatabase(
  maxCandidates: number | undefined,
  candidateGenerator: CandidateGenerator,
  log: (message: string) => void
): DomainDatabase {
  log('No remote checkpoint found; generating initial Numeric Domain candidates.');
  const generatedCandidates = candidateGenerator({
    minLength: 6,
    maxLength: 8,
    excludeUnlucky4: true,
    minScore: 60,
    tld: '.xyz'
  });
  const candidates = generatedCandidates.slice(0, maxCandidates ?? Number.MAX_SAFE_INTEGER);

  const database: DomainDatabase = {
    domains: {},
    stats: { total: 0, checked: 0, unchecked: 0, available: 0, registered: 0, error: 0 },
    config: { delay: 2000, exclude4: true, minLength: 6, maxLength: 8, minScore: 60, tld: '.xyz' }
  };

  for (const candidate of candidates) {
    database.domains[candidate.domain] = {
      ...candidate,
      status: 'unchecked',
      detail: '',
      updatedAt: null
    };
  }

  recalculateStats(database);
  return database;
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
    typeof value.exclude4 === 'boolean' &&
    typeof value.minLength === 'number' &&
    typeof value.maxLength === 'number' &&
    typeof value.minScore === 'number' &&
    typeof value.tld === 'string'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
