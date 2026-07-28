import assert from 'node:assert/strict';
import test from 'node:test';
import type { DomainDatabase } from '../src/types.js';
import { createFakeScanDependencies, resolveScanPolicy, runScanBatch, type ScanDependencies } from '../src/scan-engine.js';

function databaseWith(...domains: string[]): DomainDatabase {
  const records = Object.fromEntries(
    domains.map((domain) => [
      domain,
      {
        domain,
        number: domain.replace(/\.xyz$/, ''),
        score: 90,
        category: '测试号码',
        patternDesc: '测试 Numeric Domain',
        status: 'unchecked' as const,
        detail: '',
        updatedAt: null
      }
    ])
  );

  return {
    domains: records,
    stats: { total: domains.length, checked: 0, unchecked: domains.length, available: 0, registered: 0, error: 0 },
    config: { delay: 2000, exclude4: true, minLength: 6, maxLength: 8, minScore: 60, tld: '.xyz' }
  };
}

test('Blind Scan marks active Numeric Domains registered without WHOIS Verification', async () => {
  const database = databaseWith('888888.xyz');
  const whoisCalls: string[] = [];
  const checkpoints: DomainDatabase[] = [];

  const dependencies: ScanDependencies = {
    dns: { isRegistered: async () => true },
    whois: {
      verify: async (domain) => {
        whoisCalls.push(domain);
        return { registered: false, detail: 'unused' };
      }
    },
    timing: { sleep: async () => undefined },
    checkpoint: { save: async (snapshot) => checkpoints.push(structuredClone(snapshot)) }
  };

  const outcome = await runScanBatch(database, {}, dependencies);

  assert.equal(outcome.database.domains['888888.xyz'].status, 'registered');
  assert.equal(whoisCalls.length, 0);
  assert.equal(outcome.blindScan.registered, 1);
  assert.equal(outcome.whois.attempted, 0);
  assert.equal(checkpoints.length, 1);
  assert.deepEqual(outcome.database.stats, {
    total: 1,
    checked: 1,
    unchecked: 0,
    available: 0,
    registered: 1,
    error: 0
  });
});

test('WHOIS Verification records availability, errors, default throttle, progress, and checkpoint state', async () => {
  const database = databaseWith('666666.xyz', '999999.xyz');
  const delays: number[] = [];
  const checkpoints: DomainDatabase[] = [];
  const progress: string[] = [];

  const outcome = await runScanBatch(database, {}, {
    dns: { isRegistered: async () => false },
    whois: {
      verify: async (domain) => {
        if (domain === '666666.xyz') return { registered: false, detail: 'Available' };
        throw new Error('WHOIS query failed');
      }
    },
    timing: { sleep: async (milliseconds) => delays.push(milliseconds) },
    checkpoint: { save: async (snapshot) => checkpoints.push(structuredClone(snapshot)) },
    progress: { report: async (event) => progress.push(`${event.stage}:${event.processed}/${event.total}`) }
  });

  assert.equal(outcome.database.domains['666666.xyz'].status, 'available');
  assert.equal(outcome.database.domains['999999.xyz'].status, 'error');
  assert.deepEqual(delays, [2000]);
  assert.equal(outcome.whois.attempted, 2);
  assert.equal(outcome.whois.available, 1);
  assert.equal(outcome.whois.errors, 1);
  assert.deepEqual(progress, [
    'blind-scan:1/2',
    'blind-scan:2/2',
    'whois-verification:1/2',
    'whois-verification:2/2'
  ]);
  assert.equal(checkpoints.length, 3);
  assert.equal(checkpoints[1].domains['666666.xyz'].status, 'available');
  assert.equal(checkpoints[2].domains['999999.xyz'].status, 'error');
  assert.deepEqual(outcome.database.stats, {
    total: 2,
    checked: 1,
    unchecked: 0,
    available: 1,
    registered: 0,
    error: 1
  });
});

test('Scan policy limits WHOIS Verification without changing unchecked Numeric Domains', async () => {
  const database = databaseWith('111111.xyz', '222222.xyz', '333333.xyz');
  const whoisCalls: string[] = [];

  const outcome = await runScanBatch(database, { maxWhois: 1 }, {
    dns: { isRegistered: async () => false },
    whois: {
      verify: async (domain) => {
        whoisCalls.push(domain);
        return { registered: false, detail: 'Available' };
      }
    },
    timing: { sleep: async () => undefined },
    checkpoint: { save: async () => undefined }
  });

  assert.deepEqual(whoisCalls, ['111111.xyz']);
  assert.equal(outcome.whois.skippedByLimit, 2);
  assert.equal(outcome.database.domains['111111.xyz'].status, 'available');
  assert.equal(outcome.database.domains['222222.xyz'].status, 'unchecked');
  assert.equal(outcome.database.domains['333333.xyz'].status, 'unchecked');
});

test('WHOIS Verification marks confirmed registrations and resumes only unchecked Numeric Domains', async () => {
  const database = databaseWith('555555.xyz', '777777.xyz');
  database.domains['555555.xyz'].status = 'registered';
  database.domains['555555.xyz'].detail = 'existing checkpoint';
  const dnsCalls: string[] = [];
  const whoisCalls: string[] = [];

  const outcome = await runScanBatch(database, {}, {
    dns: {
      isRegistered: async (domain) => {
        dnsCalls.push(domain);
        return false;
      }
    },
    whois: {
      verify: async (domain) => {
        whoisCalls.push(domain);
        return { registered: true, detail: 'Confirmed registration' };
      }
    },
    timing: { sleep: async () => undefined },
    checkpoint: { save: async () => undefined }
  });

  assert.deepEqual(dnsCalls, ['777777.xyz']);
  assert.deepEqual(whoisCalls, ['777777.xyz']);
  assert.equal(outcome.database.domains['555555.xyz'].status, 'registered');
  assert.equal(outcome.database.domains['777777.xyz'].status, 'registered');
  assert.equal(outcome.database.stats.checked, 2);
  assert.equal(outcome.database.stats.registered, 2);
});

test('Scan policy rejects unsafe values before adapters run', async () => {
  const database = databaseWith('888888.xyz');
  let adapterCalled = false;

  await assert.rejects(
    () =>
      runScanBatch(database, { dnsConcurrency: 0 }, {
        dns: {
          isRegistered: async () => {
            adapterCalled = true;
            return false;
          }
        },
        whois: { verify: async () => ({ registered: false, detail: 'unused' }) },
        timing: { sleep: async () => undefined },
        checkpoint: { save: async () => undefined }
      }),
    /dnsConcurrency must be a positive safe integer/
  );

  assert.equal(adapterCalled, false);
});

test('Scan policy never reduces the 2000ms WHOIS safety throttle', () => {
  assert.equal(resolveScanPolicy({ whoisDelayMs: 1 }).whoisDelayMs, 2000);
  assert.equal(resolveScanPolicy({ whoisDelayMs: 5000 }).whoisDelayMs, 5000);
});

test('Scan policy accepts an explicit unlimited WHOIS Verification selection', () => {
  assert.equal(resolveScanPolicy({ maxWhois: null }).maxWhois, null);
});

test('WHOIS Verification checkpoints an error before advancing to the next Numeric Domain', async () => {
  const checkpoints: DomainDatabase[] = [];

  await runScanBatch(databaseWith('111111.xyz', '222222.xyz'), {}, {
    dns: { isRegistered: async () => false },
    whois: {
      verify: async (domain) => {
        if (domain === '111111.xyz') throw new Error('temporary WHOIS failure');
        assert.equal(checkpoints.at(-1)?.domains['111111.xyz'].status, 'error');
        return { registered: false, detail: 'Available' };
      }
    },
    timing: { sleep: async () => undefined },
    checkpoint: { save: async (database) => checkpoints.push(structuredClone(database)) }
  });

  assert.equal(checkpoints.at(-1)?.domains['222222.xyz'].status, 'available');
});

test('Fake adapters record a complete Scan Engine run without network, files, or real time', async () => {
  const dependencies = createFakeScanDependencies({
    dns: { isRegistered: async () => false },
    whois: { verify: async () => ({ registered: false, detail: 'Available from fake' }) }
  });

  const outcome = await runScanBatch(databaseWith('888888.xyz', '999999.xyz'), {}, dependencies);

  assert.deepEqual(dependencies.dnsCalls, ['888888.xyz', '999999.xyz']);
  assert.deepEqual(dependencies.whoisCalls, ['888888.xyz', '999999.xyz']);
  assert.deepEqual(dependencies.delays, [2000]);
  assert.equal(dependencies.checkpoints.length, 3);
  assert.equal(dependencies.progressEvents.length, 4);
  assert.equal(outcome.database.stats.available, 2);
});

test('Blind Scan respects configured concurrency while WHOIS Verification remains unnecessary', async () => {
  const database = databaseWith('111111.xyz', '222222.xyz', '333333.xyz', '444444.xyz');
  let inFlight = 0;
  let maxInFlight = 0;
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  const scan = runScanBatch(database, { dnsConcurrency: 2 }, {
    dns: {
      isRegistered: async () => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await gate;
        inFlight -= 1;
        return true;
      }
    },
    whois: { verify: async () => ({ registered: false, detail: 'unused' }) },
    timing: { sleep: async () => undefined },
    checkpoint: { save: async () => undefined }
  });

  assert.equal(maxInFlight, 2);
  release();
  const outcome = await scan;

  assert.equal(outcome.blindScan.registered, 4);
  assert.equal(outcome.whois.attempted, 0);
});
