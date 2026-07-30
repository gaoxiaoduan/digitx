import assert from 'node:assert/strict';
import test from 'node:test';
import {
  evaluateNumber,
  type GeneratedCandidate
} from '../src/generator.js';
import { GENERATOR_VERSION } from '../src/candidate-contract.js';
import { reconcileCandidateDatabase } from '../src/candidate-database.js';
import type { DomainDatabase } from '../src/types.js';

function candidate(number: string): GeneratedCandidate {
  const evaluation = evaluateNumber(number);
  assert.ok(evaluation.category);
  return {
    domain: `${number}.xyz`,
    number,
    score: evaluation.score,
    category: evaluation.category,
    patternDesc: evaluation.patternDesc,
    tags: evaluation.tags,
    scoreBreakdown: evaluation.scoreBreakdown
  };
}

test('generator version mismatch reconciles scan state against the new Candidate Set', () => {
  const checkpoint: DomainDatabase = {
    domains: {
      '888888.xyz': {
        ...candidate('888888'),
        score: 1,
        category: '极品结构号',
        status: 'available',
        detail: 'Available from old scan',
        updatedAt: '2026-07-01T00:00:00.000Z'
      },
      '274472.xyz': {
        domain: '274472.xyz',
        number: '274472',
        score: 90,
        category: '极品结构号',
        patternDesc: '旧规则误收',
        status: 'available',
        detail: 'Must be retired',
        updatedAt: '2026-07-02T00:00:00.000Z'
      }
    },
    stats: { total: 2, checked: 2, unchecked: 0, available: 2, registered: 0, error: 0 },
    config: { delay: 2000, minScore: 60, tld: '.xyz' }
  };

  const database = reconcileCandidateDatabase(checkpoint, [candidate('888888'), candidate('444444')]);

  assert.equal(database.generatorVersion, GENERATOR_VERSION);
  assert.deepEqual(Object.keys(database.domains).sort(), ['444444.xyz', '888888.xyz']);
  assert.equal(database.domains['888888.xyz'].status, 'available');
  assert.equal(database.domains['888888.xyz'].detail, 'Available from old scan');
  assert.equal(database.domains['888888.xyz'].score, 100);
  assert.equal(database.domains['444444.xyz'].status, 'unchecked');
  assert.equal(database.domains['444444.xyz'].updatedAt, null);
  assert.deepEqual(database.stats, {
    total: 2,
    checked: 1,
    unchecked: 1,
    available: 1,
    registered: 0,
    error: 0
  });
  assert.deepEqual(database.config, { delay: 2000, minScore: 85, tld: '.xyz' });
});
