import fs from 'node:fs/promises';
import { checkDNS, checkWHOIS, recalculateStats, updateDomainStatus } from './checker.js';
import type { DomainDatabase } from './types.js';

export interface DNSAdapter {
  isRegistered(domain: string): Promise<boolean>;
}

export interface WHOISAdapter {
  verify(domain: string): Promise<{ registered: boolean; detail: string }>;
}

export interface TimingAdapter {
  sleep(milliseconds: number): Promise<void>;
}

export interface CheckpointAdapter {
  save(database: DomainDatabase): Promise<void>;
}

export interface ScanProgress {
  stage: 'blind-scan' | 'whois-verification';
  processed: number;
  total: number;
  domain: string;
}

export interface ProgressAdapter {
  report(progress: ScanProgress): void | Promise<void>;
}

export interface ScanDependencies {
  dns: DNSAdapter;
  whois: WHOISAdapter;
  timing: TimingAdapter;
  checkpoint: CheckpointAdapter;
  progress?: ProgressAdapter;
}

export interface ScanPolicy {
  dnsConcurrency?: number;
  maxWhois?: number;
  whoisDelayMs?: number;
}

export interface ResolvedScanPolicy {
  dnsConcurrency: number;
  maxWhois: number | null;
  whoisDelayMs: number;
}

export interface ScanOutcome {
  database: DomainDatabase;
  policy: ResolvedScanPolicy;
  blindScan: {
    attempted: number;
    registered: number;
  };
  whois: {
    candidates: number;
    attempted: number;
    available: number;
    registered: number;
    errors: number;
    skippedByLimit: number;
  };
}

export interface FakeScanDependencies extends ScanDependencies {
  dnsCalls: string[];
  whoisCalls: string[];
  delays: number[];
  checkpoints: DomainDatabase[];
  progressEvents: ScanProgress[];
}

const DEFAULT_DNS_CONCURRENCY = 50;
const DEFAULT_WHOIS_DELAY_MS = 2000;

function positiveSafeInteger(value: number | undefined, name: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive safe integer.`);
  }
  return value;
}

export function resolveScanPolicy(policy: ScanPolicy = {}): ResolvedScanPolicy {
  const dnsConcurrency = positiveSafeInteger(policy.dnsConcurrency, 'dnsConcurrency') ?? DEFAULT_DNS_CONCURRENCY;
  const maxWhois = positiveSafeInteger(policy.maxWhois, 'maxWhois') ?? null;
  const requestedWhoisDelay = positiveSafeInteger(policy.whoisDelayMs, 'whoisDelayMs') ?? DEFAULT_WHOIS_DELAY_MS;
  const whoisDelayMs = Math.max(DEFAULT_WHOIS_DELAY_MS, requestedWhoisDelay);

  return { dnsConcurrency, maxWhois, whoisDelayMs };
}

export async function runScanBatch(
  database: DomainDatabase,
  policy: ScanPolicy,
  dependencies: ScanDependencies
): Promise<ScanOutcome> {
  const resolvedPolicy = resolveScanPolicy(policy);
  recalculateStats(database);

  const unchecked = Object.values(database.domains).filter((domain) => domain.status === 'unchecked');
  let blindScanRegistered = 0;
  let blindScanProcessed = 0;

  await runConcurrently(unchecked, resolvedPolicy.dnsConcurrency, async (domain) => {
    if (await dependencies.dns.isRegistered(domain.domain)) {
      updateDomainStatus(database, domain.domain, 'registered', '已注册 (DNS: 检测到活跃 NS 解析)');
      blindScanRegistered += 1;
    }

    blindScanProcessed += 1;
    await dependencies.progress?.report({
      stage: 'blind-scan',
      processed: blindScanProcessed,
      total: unchecked.length,
      domain: domain.domain
    });
  });

  recalculateStats(database);
  await dependencies.checkpoint.save(database);

  const whoisCandidates = Object.values(database.domains).filter((domain) => domain.status === 'unchecked');
  const whoisLimit = resolvedPolicy.maxWhois ?? whoisCandidates.length;
  const selectedForWhois = whoisCandidates.slice(0, whoisLimit);
  let whoisAvailable = 0;
  let whoisRegistered = 0;
  let whoisErrors = 0;

  for (const [index, domain] of selectedForWhois.entries()) {
    if (index > 0) {
      await dependencies.timing.sleep(resolvedPolicy.whoisDelayMs);
    }

    try {
      const result = await dependencies.whois.verify(domain.domain);
      if (result.registered) {
        updateDomainStatus(database, domain.domain, 'registered', result.detail);
        whoisRegistered += 1;
      } else {
        updateDomainStatus(database, domain.domain, 'available', result.detail);
        whoisAvailable += 1;
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      updateDomainStatus(database, domain.domain, 'error', detail);
      whoisErrors += 1;
    }

    await dependencies.progress?.report({
      stage: 'whois-verification',
      processed: index + 1,
      total: selectedForWhois.length,
      domain: domain.domain
    });
  }

  recalculateStats(database);
  await dependencies.checkpoint.save(database);

  return {
    database,
    policy: resolvedPolicy,
    blindScan: { attempted: unchecked.length, registered: blindScanRegistered },
    whois: {
      candidates: whoisCandidates.length,
      attempted: selectedForWhois.length,
      available: whoisAvailable,
      registered: whoisRegistered,
      errors: whoisErrors,
      skippedByLimit: whoisCandidates.length - selectedForWhois.length
    }
  };
}

export const nodeDNSAdapter: DNSAdapter = { isRegistered: checkDNS };
export const nodeWHOISAdapter: WHOISAdapter = { verify: checkWHOIS };

export const nodeTimingAdapter: TimingAdapter = {
  sleep: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
};

export function createFileCheckpointAdapter(path: string): CheckpointAdapter {
  return {
    save: async (database) => {
      await fs.writeFile(path, JSON.stringify(database, null, 2), 'utf-8');
    }
  };
}

export function createConsoleProgressAdapter(write: (message: string) => void = console.log): ProgressAdapter {
  return {
    report: ({ stage, processed, total, domain }) => {
      write(`${stage} ${processed}/${total}: ${domain}`);
    }
  };
}

export function createFakeScanDependencies(overrides: Partial<Pick<ScanDependencies, 'dns' | 'whois'>> = {}): FakeScanDependencies {
  const dnsCalls: string[] = [];
  const whoisCalls: string[] = [];
  const delays: number[] = [];
  const checkpoints: DomainDatabase[] = [];
  const progressEvents: ScanProgress[] = [];

  return {
    dnsCalls,
    whoisCalls,
    delays,
    checkpoints,
    progressEvents,
    dns: {
      isRegistered: async (domain) => {
        dnsCalls.push(domain);
        return overrides.dns?.isRegistered(domain) ?? false;
      }
    },
    whois: {
      verify: async (domain) => {
        whoisCalls.push(domain);
        return overrides.whois?.verify(domain) ?? { registered: false, detail: 'Available (fake)' };
      }
    },
    timing: {
      sleep: async (milliseconds) => {
        delays.push(milliseconds);
      }
    },
    checkpoint: {
      save: async (database) => {
        checkpoints.push(structuredClone(database));
      }
    },
    progress: {
      report: (event) => {
        progressEvents.push(event);
      }
    }
  };
}

async function runConcurrently<T>(items: T[], concurrency: number, run: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const item = items[cursor];
      cursor += 1;
      await run(item);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
}
