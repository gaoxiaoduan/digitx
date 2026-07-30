import assert from 'node:assert/strict';
import test from 'node:test';
import {
  runScheduledScan,
  type ScheduledScanOptions
} from '../src/scheduled-scan.js';
import { GENERATOR_VERSION, type DomainDatabase } from '@digitx/core';

function databaseWith(...domains: string[]): DomainDatabase {
  const records = Object.fromEntries(
    domains.map((domain) => [
      domain,
      {
        domain,
        number: domain.replace(/\.xyz$/, ''),
        score: 90,
        category: '极品结构号',
        patternDesc: '测试 Numeric Domain',
        status: 'unchecked' as const,
        detail: '',
        updatedAt: null
      }
    ])
  );

  return {
    generatorVersion: GENERATOR_VERSION,
    domains: records,
    stats: { total: domains.length, checked: 0, unchecked: domains.length, available: 0, registered: 0, error: 0 },
    config: { delay: 2000, minScore: 85, tld: '.xyz' }
  };
}

test('连续 Scheduled Scan 仅继续处理远端检查点中仍为 unchecked 的 Numeric Domain', async () => {
  const initial = databaseWith('111111.xyz', '222222.xyz');
  const dnsCalls: string[] = [];
  const whoisCalls: string[] = [];
  const synchronized: DomainDatabase[] = [];
  let remoteCheckpoint = initial;

  const fetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    if (init?.method === 'POST') {
      synchronized.push(JSON.parse(String(init.body)) as DomainDatabase);
      remoteCheckpoint = synchronized.at(-1)!;
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    assert.equal(url, 'https://api.example.com/api/domains');
    return new Response(JSON.stringify(remoteCheckpoint), { status: 200 });
  };

  const options: ScheduledScanOptions = {
    apiUrl: 'https://api.example.com',
    syncSecret: 'secret',
    maxWhois: 1,
    fetch,
    scanDependencies: {
      dns: {
        isRegistered: async (domain) => {
          dnsCalls.push(domain);
          return false;
        }
      },
      whois: {
        verify: async (domain) => {
          whoisCalls.push(domain);
          return { registered: false, detail: 'Available' };
        }
      },
      timing: { sleep: async () => undefined },
      checkpoint: { save: async () => undefined }
    },
    generateCandidates: () => {
      throw new Error('matching generator version must resume without regeneration');
    },
    log: () => undefined
  };

  await runScheduledScan(options);
  await runScheduledScan(options);

  assert.deepEqual(dnsCalls, ['111111.xyz', '222222.xyz', '222222.xyz']);
  assert.deepEqual(whoisCalls, ['111111.xyz', '222222.xyz']);
  assert.equal(synchronized.length, 2);
  assert.equal(synchronized[0].domains['222222.xyz'].status, 'unchecked');
  assert.equal(synchronized[1].domains['111111.xyz'].status, 'available');
  assert.equal(synchronized[1].domains['222222.xyz'].status, 'available');
});

test('KV 没有有效检查点时生成初始 Numeric Domain 并同步结果', async () => {
  const synchronized: DomainDatabase[] = [];
  const fetch = async (_input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    if (init?.method !== 'POST') {
      return new Response(JSON.stringify({ domains: {} }), { status: 200 });
    }

    synchronized.push(JSON.parse(String(init.body)) as DomainDatabase);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  };

  await runScheduledScan({
    apiUrl: 'https://api.example.com',
    syncSecret: 'secret',
    fetch,
    generateCandidates: () => [
      {
        domain: '888888.xyz',
        number: '888888',
        score: 100,
        category: '极品结构号',
        patternDesc: '测试 Numeric Domain',
        tags: ['纯重复'],
        scoreBreakdown: [{ id: 'pure-repeat', label: '纯重复结构', points: 94 }]
      }
    ],
    scanDependencies: {
      dns: { isRegistered: async () => false },
      whois: { verify: async () => ({ registered: false, detail: 'Available' }) },
      timing: { sleep: async () => undefined },
      checkpoint: { save: async () => undefined }
    },
    log: () => undefined
  });

  assert.equal(synchronized.length, 1);
  assert.equal(synchronized[0].domains['888888.xyz'].status, 'available');
  assert.equal(synchronized[0].stats.checked, 1);
});

test('生成规则版本变化时先协调候选集，再继续扫描并同步', async () => {
  const remote = databaseWith('888888.xyz', '274472.xyz');
  remote.generatorVersion = '1.0.0';
  remote.domains['888888.xyz'].status = 'available';
  remote.domains['888888.xyz'].detail = 'Available from old scan';
  remote.domains['888888.xyz'].updatedAt = '2026-07-01T00:00:00.000Z';
  remote.domains['274472.xyz'].status = 'available';

  let generatorCalls = 0;
  let synchronized: DomainDatabase | null = null;
  const fetch = async (_input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    if (init?.method === 'POST') {
      synchronized = JSON.parse(String(init.body)) as DomainDatabase;
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    return new Response(JSON.stringify(remote), { status: 200 });
  };

  await runScheduledScan({
    apiUrl: 'https://api.example.com',
    syncSecret: 'secret',
    fetch,
    generateCandidates: () => {
      generatorCalls += 1;
      return [
        {
          domain: '888888.xyz',
          number: '888888',
          score: 100,
          category: '极品结构号',
          patternDesc: '纯重复',
          tags: ['纯重复'],
          scoreBreakdown: [{ id: 'pure-repeat', label: '纯重复结构', points: 94 }]
        },
        {
          domain: '444444.xyz',
          number: '444444',
          score: 98,
          category: '极品结构号',
          patternDesc: '纯重复',
          tags: ['纯重复'],
          scoreBreakdown: [{ id: 'pure-repeat', label: '纯重复结构', points: 92 }]
        }
      ];
    },
    scanDependencies: {
      dns: { isRegistered: async () => true },
      whois: { verify: async () => ({ registered: false, detail: 'unused' }) },
      timing: { sleep: async () => undefined },
      checkpoint: { save: async () => undefined }
    },
    log: () => undefined
  });

  assert.equal(generatorCalls, 1);
  assert.ok(synchronized);
  assert.equal(synchronized.generatorVersion, GENERATOR_VERSION);
  assert.deepEqual(Object.keys(synchronized.domains).sort(), ['444444.xyz', '888888.xyz']);
  assert.equal(synchronized.domains['888888.xyz'].status, 'available');
  assert.equal(synchronized.domains['888888.xyz'].detail, 'Available from old scan');
  assert.equal(synchronized.domains['444444.xyz'].status, 'registered');
});

test('无法读取远端检查点时中止扫描，且绝不以空数据同步覆盖 KV', async () => {
  let calls = 0;

  await assert.rejects(
    () =>
      runScheduledScan({
        apiUrl: 'https://api.example.com',
        syncSecret: 'secret',
        fetch: async () => {
          calls += 1;
          throw new Error('network unavailable');
        },
        log: () => undefined
      }),
    /Unable to load the remote Scan Engine checkpoint: network unavailable/
  );

  assert.equal(calls, 1);
});
