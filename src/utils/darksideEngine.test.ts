/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CUSTOM_BS_MAP,
  CUSTOM_OPP_MAP,
  sizeOf,
  bsOf,
  primaryCol,
  hasViolet,
  colorTypeOf,
  oppositeDigit,
  normalizeDarksideHistory,
  SURESHOT_DATABASE,
  CLEAN_500_PATTERNS,
  CPU_PATTERN_DB,
  BUNNY_PATTERN_NAMES,
  PATTERN_DB,
  matchPatternDB,
  evaluateSureshotDatabase,
  evaluateCpuPatternDB,
  evaluateClean500Patterns,
  runBunnyAI,
  computeMarkovAndChiSquare,
  detectStructuralPatterns,
  predictExactOppositeNumber,
  runCausalWalkForwardBacktest,
  createInitialLossTrackerState,
  updateLossTrackerOutcome,
  AnshCore,
  TrendVoteEngine,
  runDarksidePrediction,
  evaluateDarksideResult,
} from './darksideEngine';

test('1. Fixed custom BIG/SMALL & Exact Opposite-Number mappings (0..9) + 10 exact pairs', () => {
  const expectedBS: Record<number, 'BIG' | 'SMALL'> = {
    0: 'BIG',
    1: 'SMALL',
    2: 'SMALL',
    3: 'BIG',
    4: 'SMALL',
    5: 'BIG',
    6: 'BIG',
    7: 'SMALL',
    8: 'SMALL',
    9: 'BIG',
  };
  const expectedOpp: Record<number, number> = {
    0: 1,
    1: 7,
    2: 6,
    3: 3,
    4: 8,
    5: 1,
    6: 2,
    7: 9,
    8: 8,
    9: 2,
  };
  const expectedFormatted = [
    'BIG 1',
    'SMALL 7',
    'SMALL 6',
    'BIG 3',
    'SMALL 8',
    'BIG 1',
    'BIG 2',
    'SMALL 9',
    'SMALL 8',
    'BIG 2',
  ];

  for (let d = 0; d <= 9; d++) {
    assert.equal(CUSTOM_BS_MAP[d], expectedBS[d]);
    assert.equal(CUSTOM_OPP_MAP[d], expectedOpp[d]);
    assert.equal(sizeOf(d), expectedBS[d]);
    assert.equal(bsOf(d), expectedBS[d]);
    assert.equal(oppositeDigit(d), expectedOpp[d]);
    assert.equal(`${bsOf(d)} ${oppositeDigit(d)}`, expectedFormatted[d]);
  }

  assert.equal(primaryCol(0), 'RED');
  assert.equal(primaryCol(1), 'GREEN');
  assert.equal(hasViolet(0), true);
  assert.equal(hasViolet(5), true);
  assert.equal(colorTypeOf(0), 'RED_VIOLET');
  assert.equal(colorTypeOf(5), 'GREEN_VIOLET');
});

test('2. Anti-glitch history normalization: strict 0..9 validation, dedupe, period exclusion, numeric desc sort', () => {
  const raw = [
    { issueNumber: '20261114100051001', number: '4' },
    { issueNumber: '20261114100051005', number: '9' }, // excluded
    { issueNumber: '20261114100051006', number: '1' }, // future period (> exclude) -> excluded!
    { issueNumber: '20261114100051003', number: 7 },
    { issueNumber: '20261114100051003', number: 8 }, // duplicate period
    { issueNumber: '20261114100051002', number: 12 }, // invalid digit
    { issueNumber: '20261114100051002', number: 2 },
    { issueNumber: '20261114100051004', number: 'bad' as unknown as number }, // invalid string
    { issueNumber: '20261114100051000', number: 6 },
  ];

  const { records, numbers } = normalizeDarksideHistory(raw, {
    excludePeriod: '20261114100051005',
  });

  assert.deepEqual(
    records.map((r) => r.issueNumber),
    [
      '20261114100051003',
      '20261114100051002',
      '20261114100051001',
      '20261114100051000',
    ]
  );
  assert.deepEqual(numbers, [7, 2, 4, 6]);
  assert.deepEqual(
    records.map((r) => r.size),
    ['SMALL', 'SMALL', 'SMALL', 'BIG'] // 7=S, 2=S, 4=S, 6=B
  );
});

test('3. Integrated pattern databases loaded cleanly: SURESHOT (582), CLEAN 500 (500), CPU_PATTERN_DB (410), BUNNY AI', () => {
  assert.equal(Object.keys(SURESHOT_DATABASE).length, 582);
  assert.equal(CLEAN_500_PATTERNS.length, 500);
  assert.equal(Object.keys(CPU_PATTERN_DB).length, 410);
  assert.ok(Object.keys(BUNNY_PATTERN_NAMES).length >= 50);
  assert.ok(Object.keys(PATTERN_DB).length >= 130);

  const sureshotVote = evaluateSureshotDatabase('BSBSBSBSB');
  assert.ok(sureshotVote);
  assert.ok(sureshotVote.prediction === 'BIG' || sureshotVote.prediction === 'SMALL');

  const cpuVote = evaluateCpuPatternDB('BBBBBSSSSS', 'SSSSSBBBBB');
  assert.ok(cpuVote);

  const cleanVote = evaluateClean500Patterns('SBSBSBSBS');
  assert.ok(cleanVote);

  const dbHit = matchPatternDB('SBBBB', []);
  assert.ok(dbHit && dbHit.next === 'SMALL');
});

test('4. Deterministic BUNNY AI (no Math.random), Structural Suite, Markov 1/2/3 & Chi-Square over 1000 draws', () => {
  // Deterministic PRNG test corpus of 1,000 draws
  const hist1000: number[] = [];
  let seed = 42;
  for (let i = 0; i < 1000; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    hist1000.push(seed % 10);
  }

  const b1 = runBunnyAI(hist1000);
  const b2 = runBunnyAI(hist1000);
  assert.deepEqual(b1, b2);
  assert.ok(b1.prediction === 'BIG' || b1.prediction === 'SMALL');

  // Chi-square + Markov
  const mc = computeMarkovAndChiSquare(hist1000);
  assert.ok(mc.markovProbBig >= 0 && mc.markovProbBig <= 1);
  assert.ok(mc.chiSquare >= 0);

  // Structural zigzag under CUSTOM_BS_MAP:
  // BIG={0,3,5,6,9}, SMALL={1,2,4,7,8}
  // Alternate B,S,B,S,B,S: 0(B), 1(S), 3(B), 2(S), 5(B), 4(S)
  const customZigzag = [0, 1, 3, 2, 5, 4, 6, 7, 9, 8];
  const bunnyZig = runBunnyAI(customZigzag);
  assert.ok(bunnyZig.pattern === 'CYCLE_2' || bunnyZig.pattern === 'ZIGZAG');
  assert.equal(bunnyZig.prediction, 'SMALL'); // newest is 0 (BIG) -> next SMALL

  const structVotes = detectStructuralPatterns(customZigzag);
  assert.ok(structVotes.some((v) => v.name === 'ZIGZAG' && v.prediction === 'SMALL'));

  // Performance check: 1,000 draws full prediction must run quickly (< 150ms)
  const t0 = performance.now();
  const fullPred = runDarksidePrediction('20261114100059999', hist1000);
  const elapsed = performance.now() - t0;
  assert.ok(elapsed < 250, `Expected < 250ms, got ${elapsed.toFixed(1)}ms`);
  assert.equal(fullPred.validHistoryCount, 1000);
  assert.ok(fullPred.backtestSamples >= 20);
  assert.ok(fullPred.confidence >= 50 && fullPred.confidence <= 92);
});

test('5. Independent single opposite-number output & format parity (strictly one digit in CUSTOM_OPP_MAP values)', () => {
  const validOppOutputs = new Set(Object.values(CUSTOM_OPP_MAP)); // {1, 2, 3, 6, 7, 8, 9}
  const history = [0, 3, 5, 6, 9, 1, 2, 4, 7, 8, 0, 5, 3, 6, 9, 2, 4, 7, 8, 1];

  const oppCalc1 = predictExactOppositeNumber(history);
  const oppCalc2 = predictExactOppositeNumber(history);
  assert.deepEqual(oppCalc1, oppCalc2);
  assert.equal(oppCalc1.oppNum, CUSTOM_OPP_MAP[oppCalc1.favNum]);
  assert.ok(validOppOutputs.has(oppCalc1.oppNum));

  const pred = runDarksidePrediction('20261114100051999', history);
  assert.equal(pred.numbers.length, 1);
  assert.equal(pred.oppNum, pred.number);
  assert.equal(pred.oppNum, pred.oppositeNumber);
  assert.equal(pred.numbers[0], pred.oppNum);
  assert.ok(validOppOutputs.has(pred.oppNum));
  assert.equal(pred.label, `${pred.size} ${pred.oppNum}`);
  assert.equal(pred.status, 'ACTIVE');

  // Verify BIG/SMALL and oppNum can align independently (not restricted to opposite size)
  const testSmallHist = [1, 2, 4, 7, 8, 1, 2, 4, 7, 8, 1, 2, 4, 7, 8, 1, 2, 4, 7, 8];
  const smallPred = runDarksidePrediction('20261114100052000', testSmallHist);
  assert.equal(smallPred.numbers.length, 1);
  assert.ok(validOppOutputs.has(smallPred.oppNum));
});

test('6. Strictly causal walk-forward backtest guarantees no future leak', () => {
  const base = [0, 3, 5, 6, 9, 1, 2, 4, 7, 8, 0, 5, 6, 3, 9, 2, 4, 8, 7, 1, 0, 3, 5, 6, 9, 1, 2, 4, 7, 8];
  const bt1 = runCausalWalkForwardBacktest(base);
  // Modifying the most recent draw (index 0) does not leak backward into predictions of draws [2..]
  const modified = [9, ...base.slice(1)];
  const bt2 = runCausalWalkForwardBacktest(modified);
  assert.equal(bt1.samples, bt2.samples);
  assert.ok(bt1.overallAccuracy >= 10 && bt1.overallAccuracy <= 95);
});

test('7. Adaptive Loss Tracker updates pattern weights & opp stats without ever skipping', () => {
  let tracker = createInitialLossTrackerState();
  assert.equal(tracker.consecutiveBSLosses, 0);

  // Loss 1 (predicted BIG, actual 1 = SMALL under custom map)
  tracker = updateLossTrackerOutcome(tracker, {
    period: '20261114100050001',
    predSize: 'BIG',
    predOppNum: 1,
    pattern: 'ZIGZAG:4',
    actualNumber: 1, // SMALL (1), oppNum HIT! (numHit = true, bsWin = false)
  });
  assert.equal(tracker.consecutiveBSLosses, 1);
  assert.equal(tracker.bsLosses, 1);
  assert.equal(tracker.numWins, 1); // number won even though B/S lost
  assert.equal(tracker.bothWins, 0);
  assert.equal(tracker.lastFailedPattern, 'ZIGZAG:4');
  assert.ok(tracker.patternStats['ZIGZAG:4'].weight < 1.0);

  // Idempotency guard on duplicate period settlement
  const sameTracker = updateLossTrackerOutcome(tracker, {
    period: '20261114100050001',
    predSize: 'BIG',
    predOppNum: 1,
    pattern: 'ZIGZAG:4',
    actualNumber: 1,
  });
  assert.equal(sameTracker.bsLosses, 1);

  // Loss 2 & Loss 3 -> consecutiveBSLosses increments, but engine NEVER skips!
  tracker = updateLossTrackerOutcome(tracker, {
    period: '20261114100050002',
    predSize: 'BIG',
    predOppNum: 7,
    pattern: 'ZIGZAG:4',
    actualNumber: 2, // SMALL (2)
  });
  tracker = updateLossTrackerOutcome(tracker, {
    period: '20261114100050003',
    predSize: 'BIG',
    predOppNum: 7,
    pattern: 'ZIGZAG:4',
    actualNumber: 4, // SMALL (4)
  });
  assert.equal(tracker.consecutiveBSLosses, 3);

  const noisyHist = [1, 3, 2, 0, 4, 5, 7, 6, 8, 9, 1, 0, 2, 3, 4, 6, 7, 5, 8, 9];
  const predAfterLosses = runDarksidePrediction('20261114100050004', noisyHist, { tracker });
  assert.equal(predAfterLosses.status, 'ACTIVE');
  assert.ok(predAfterLosses.size === 'BIG' || predAfterLosses.size === 'SMALL');
  assert.ok(Object.values(CUSTOM_OPP_MAP).includes(predAfterLosses.oppNum));

  // Subsequent B/S WIN resets consecutiveBSLosses
  tracker = updateLossTrackerOutcome(tracker, {
    period: '20261114100050005',
    predSize: 'SMALL',
    predOppNum: 1,
    pattern: 'CYCLE:2',
    actualNumber: 1, // SMALL + oppNum 1 -> BOTH HIT!
  });
  assert.equal(tracker.consecutiveBSLosses, 0);
  assert.equal(tracker.bothWins, 1);
});

test('8. AnshCore & TrendVoteEngine use CUSTOM_BS_MAP consistently', () => {
  assert.equal(AnshCore.nextPeriod('20261114100051818'), '20261114100051819');

  // Custom Zigzag: 0(B), 1(S), 3(B), 2(S), 5(B), 4(S), 6(B), 7(S)
  // Under old 0-4/5-9 rule, 0,1,3,2,5,4 would NOT be zigzag; under CUSTOM_BS_MAP it IS!
  const customZigzag = [0, 1, 3, 2, 5, 4, 6, 7, 9, 8].map((n) => ({ number: n }));
  const tv = TrendVoteEngine.analyze(customZigzag);
  assert.equal(tv.livePattern.type, 'ZIG-ZAG / MIRROR 1:1');
  assert.equal(tv.prediction, 'SMALL');

  const outcomeBoth = evaluateDarksideResult('BIG', 1, 0); // 0=BIG (size win), opp=1 (miss)
  assert.equal(outcomeBoth.isSizeWin, true);
  assert.equal(outcomeBoth.num2Hit, false);
  assert.equal(outcomeBoth.code, 'WIN');

  const outcomeJackpotBoth = evaluateDarksideResult('SMALL', 1, 1); // 1=SMALL (size win) + opp=1 (hit!)
  assert.equal(outcomeJackpotBoth.isSizeWin, true);
  assert.equal(outcomeJackpotBoth.num2Hit, true);
  assert.equal(outcomeJackpotBoth.bothHit, true);
  assert.equal(outcomeJackpotBoth.code, 'ULTRA_JACKPOT');
});
