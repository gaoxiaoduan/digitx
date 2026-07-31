import assert from 'node:assert/strict';
import test from 'node:test';
import {
  generateCandidates,
  evaluateNumber
} from '../src/generator.js';
import {
  GENERATOR_VERSION,
  MAX_CANDIDATES
} from '../src/candidate-contract.js';

test('Quality Score rewards brevity while keeping leading zero and digit four neutral', () => {
  const six = evaluateNumber('888888');
  const seven = evaluateNumber('8888888');
  const eight = evaluateNumber('88888888');
  const withFour = evaluateNumber('444444');
  const leadingZero = evaluateNumber('012345');

  assert.deepEqual([six.score, seven.score, eight.score], [100, 97, 94]);
  assert.equal(withFour.eligible, true);
  assert.equal(leadingZero.eligible, true);
  assert.equal(withFour.category, '极品结构号');
  assert.equal(leadingZero.category, '极品结构号');
});

test('Semantic Anchors select one of the six Primary Categories and retain explanatory tags', () => {
  const examples = [
    ['102488', '极客神号'],
    ['123068', '大众记忆号'],
    ['5201314', '吉祥寓意号'],
    ['20200202', '纪念日期号'],
    ['0108888', '城市名片号']
  ] as const;

  for (const [number, category] of examples) {
    const result = evaluateNumber(number);
    assert.equal(result.eligible, true, number);
    assert.equal(result.category, category, number);
    assert.ok(result.tags.length > 0, number);
    assert.ok(result.scoreBreakdown.length > 0, number);
  }
});

test('Supporting patterns and arbitrary anchor padding do not qualify by themselves', () => {
  for (const number of ['274472', '274274', '11224466', '19970316', '102401', '955123', '888848']) {
    assert.equal(evaluateNumber(number).eligible, false, number);
  }
});

test('Candidate generation is curated, deterministic, bounded, and covers all six categories', () => {
  const first = generateCandidates();
  const second = generateCandidates({ tld: 'xyz' });
  const numbers = new Set(first.map((candidate) => candidate.number));
  const categories = new Set(first.map((candidate) => candidate.category));

  assert.equal(GENERATOR_VERSION, '3.0.0');
  assert.deepEqual(first, second);
  assert.ok(first.length > 0);
  assert.ok(first.length < MAX_CANDIDATES);
  assert.ok(first.every((candidate) => candidate.number.length >= 6 && candidate.number.length <= 8));
  assert.ok(first.every((candidate) => candidate.score >= 85));
  assert.deepEqual(
    [...categories].sort(),
    ['吉祥寓意号', '城市名片号', '大众记忆号', '极品结构号', '极客神号', '纪念日期号'].sort()
  );

  for (const number of [
    '888888',
    '444444',
    '012345',
    '123321',
    '102488',
    '123068',
    '5201314',
    '20200202',
    '0108888'
  ]) {
    assert.equal(numbers.has(number), true, number);
  }
  assert.equal(numbers.has('123066'), true);
  assert.equal(numbers.has('1230666'), true);
  assert.equal(numbers.has('010999'), true);
});

test('Candidate Set includes every supported City Signature suffix form', () => {
  const candidates = new Map(
    generateCandidates().map((candidate) => [candidate.number, candidate])
  );

  for (const number of [
    '010123',
    '021789',
    '028111',
    '0755123',
    '05719876',
    '0101212',
    '07551212'
  ]) {
    const candidate = candidates.get(number);
    assert.ok(candidate, number);
    assert.equal(candidate.category, '城市名片号', number);
    assert.equal(candidate.score, evaluateNumber(number).score, number);
    assert.equal(candidate.patternDesc, evaluateNumber(number).patternDesc, number);
  }
});

test('Candidate Set includes supported Lucky Meaning mirrors and strict padding', () => {
  const candidates = new Map(
    generateCandidates().map((candidate) => [candidate.number, candidate])
  );

  for (const number of ['518815', '520025', '13144131', '520000', '000518', '999168']) {
    const candidate = candidates.get(number);
    const evaluation = evaluateNumber(number);
    assert.ok(candidate, number);
    assert.equal(candidate.category, '吉祥寓意号', number);
    assert.equal(candidate.score, evaluation.score, number);
    assert.deepEqual(candidate.tags, evaluation.tags, number);
    assert.deepEqual(candidate.scoreBreakdown, evaluation.scoreBreakdown, number);
  }
});

test('every supported rule family can contribute a representative Premium Candidate', () => {
  const candidates = new Map(
    generateCandidates({ minScore: 80 }).map((candidate) => [candidate.number, candidate])
  );
  const representatives = [
    ['444444', '极品结构号'],
    ['111110', '极品结构号'],
    ['211111', '极品结构号'],
    ['1111112', '极品结构号'],
    ['012345', '极品结构号'],
    ['111222', '极品结构号'],
    ['11112222', '极品结构号'],
    ['121212', '极品结构号'],
    ['123321', '极品结构号'],
    ['112233', '极品结构号'],
    ['223344', '极品结构号'],
    ['11223344', '极品结构号'],
    ['123123', '极品结构号'],
    ['518815', '吉祥寓意号'],
    ['000404', '极客神号'],
    ['000110', '大众记忆号'],
    ['20200202', '纪念日期号'],
    ['010123', '城市名片号']
  ] as const;

  for (const [number, category] of representatives) {
    const candidate = candidates.get(number);
    assert.ok(candidate, number);
    assert.equal(candidate.category, category, number);
    assert.equal(candidate.score, evaluateNumber(number).score, number);
  }
});

test('Expansion mode starts at 80 while unsupported thresholds are rejected', () => {
  const defaults = new Set(generateCandidates().map((candidate) => candidate.number));
  const expanded = new Set(generateCandidates({ minScore: 80 }).map((candidate) => candidate.number));

  assert.equal(defaults.has('123123'), false);
  assert.equal(expanded.has('123123'), true);
  assert.throws(() => generateCandidates({ minScore: 79 }), /between 80 and 100/);
});

test('Approved golden corpus remains eligible with additive score explanations', () => {
  for (const number of [
    '123321',
    '168861',
    '112233',
    '998877',
    '168168',
    '10241024',
    '404404',
    '33063306',
    '110110',
    '119119',
    '120120',
    '1314520',
    '520520',
    '13141314',
    '888168',
    '518888',
    '20211202',
    '20080808',
    '07556666'
  ]) {
    const result = evaluateNumber(number);
    assert.equal(result.eligible, true, number);
    assert.equal(
      result.scoreBreakdown.reduce((total, contribution) => total + contribution.points, 0),
      result.score,
      number
    );
  }

  assert.equal(evaluateNumber('20250231').eligible, false);
});

test('secondary independent features remain visible and contribute without changing the Primary Category', () => {
  const result = evaluateNumber('123456');

  assert.equal(result.category, '大众记忆号');
  assert.ok(result.tags.includes('完整顺子'));
  assert.ok(result.scoreBreakdown.some((contribution) => contribution.id === 'support-full-straight'));
  assert.equal(
    result.scoreBreakdown.reduce((total, contribution) => total + contribution.points, 0),
    result.score
  );
});
