import fs from 'node:fs';
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
  type DomainDatabase
} from '@digitx/core';

function readPositiveInteger(name: string, fallback: number): number {
  const rawValue = process.env[name];
  if (!rawValue) return fallback;

  if (/^[1-9]\d*$/.test(rawValue)) {
    const value = Number(rawValue);
    if (Number.isSafeInteger(value)) return value;
  }

  console.warn(`Ignoring invalid ${name}=${rawValue}; using ${fallback}.`);
  return fallback;
}

const DB_PATH = path.resolve(process.cwd(), process.env.DIGITX_DB_PATH || 'domains_db.json');
const API_URL = process.env.API_URL || 'http://localhost:8787';
const SYNC_SECRET = process.env.SYNC_SECRET || 'digitx-sync-secret-default';
const MAX_CANDIDATES = readPositiveInteger('SCAN_MAX_CANDIDATES', Number.MAX_SAFE_INTEGER);
const DNS_CONCURRENCY = readPositiveInteger('SCAN_DNS_CONCURRENCY', 50);
const MAX_WHOIS_PER_RUN = readPositiveInteger('SCAN_MAX_WHOIS_PER_RUN', 50);

function loadDatabase(): DomainDatabase {
  if (fs.existsSync(DB_PATH)) {
    try {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Fallback
    }
  }

  // Initial candidate generation
  console.log('Generating initial domain candidates...');
  const generatedCandidates = generateCandidates({
    minLength: 6,
    maxLength: 8,
    excludeUnlucky4: true,
    minScore: 60,
    tld: '.xyz'
  });
  const candidates = generatedCandidates.slice(0, MAX_CANDIDATES);

  if (candidates.length < generatedCandidates.length) {
    console.log(`Limiting local candidate set to ${candidates.length}/${generatedCandidates.length} domains.`);
  }

  const db: DomainDatabase = {
    domains: {},
    stats: { total: 0, checked: 0, unchecked: 0, available: 0, registered: 0, error: 0 },
    config: { delay: 2000, exclude4: true, minLength: 6, maxLength: 8, minScore: 60, tld: '.xyz' }
  };

  for (const cand of candidates) {
    db.domains[cand.domain] = {
      ...cand,
      status: 'unchecked',
      detail: '',
      updatedAt: null
    };
  }

  recalculateStats(db);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  return db;
}

async function syncToCloudflare(db: DomainDatabase) {
  if (!API_URL) return;
  console.log(`📡 Syncing domain data to Cloudflare KV API at ${API_URL}/api/sync...`);
  try {
    const res = await fetch(`${API_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SYNC_SECRET}`
      },
      body: JSON.stringify(db)
    });
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Cloudflare KV Sync Successful:', data);
    } else {
      console.warn(`⚠️ Cloudflare Sync failed with status ${res.status}:`, await res.text());
    }
  } catch (err: any) {
    console.warn('⚠️ Could not sync to Cloudflare KV API:', err.message);
  }
}

async function runScan() {
  const db = loadDatabase();
  console.log(`Starting scan batch. Total domains: ${db.stats.total}, Unchecked: ${db.stats.unchecked}`);

  const outcome = await runScanBatch(
    db,
    {
      dnsConcurrency: DNS_CONCURRENCY,
      maxWhois: MAX_WHOIS_PER_RUN,
      whoisDelayMs: db.config.delay
    },
    {
      dns: nodeDNSAdapter,
      whois: nodeWHOISAdapter,
      timing: nodeTimingAdapter,
      checkpoint: createFileCheckpointAdapter(DB_PATH),
      progress: createConsoleProgressAdapter((message) => console.log(`Scan Engine ${message}`))
    }
  );

  await syncToCloudflare(outcome.database);
  console.log(
    `Batch scan finished: ${outcome.blindScan.registered} DNS registered, ${outcome.whois.available} available, ${outcome.whois.errors} errors.`
  );
}

runScan().catch((err) => {
  console.error('Fatal scan error:', err);
  process.exit(1);
});
