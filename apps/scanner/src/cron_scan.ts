import { runScheduledScan } from './scheduled-scan.js';

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

const API_URL = process.env.API_URL || 'http://localhost:8787';
const SYNC_SECRET = process.env.SYNC_SECRET || 'digitx-sync-secret-default';
const MAX_CANDIDATES = readPositiveInteger('SCAN_MAX_CANDIDATES', Number.MAX_SAFE_INTEGER);
const DNS_CONCURRENCY = readPositiveInteger('SCAN_DNS_CONCURRENCY', 50);
const MAX_WHOIS_PER_RUN = readPositiveInteger('SCAN_MAX_WHOIS_PER_RUN', 50);

async function runScan() {
  const outcome = await runScheduledScan({
    apiUrl: API_URL,
    syncSecret: SYNC_SECRET,
    maxCandidates: MAX_CANDIDATES,
    dnsConcurrency: DNS_CONCURRENCY,
    maxWhois: MAX_WHOIS_PER_RUN,
    databasePath: process.env.DIGITX_DB_PATH
  });
  console.log(
    `Batch scan finished: ${outcome.blindScan.registered} DNS registered, ${outcome.whois.available} available, ${outcome.whois.errors} errors.`
  );
}

runScan().catch((err) => {
  console.error('Fatal scan error:', err);
  process.exit(1);
});
