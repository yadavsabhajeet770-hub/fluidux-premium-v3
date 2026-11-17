/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NOVEXA AI — FULL LOGIC WINGO ANALYSIS & ADAPTIVE PREDICTION ENGINE
 * Combines:
 * 1. Fixed Custom BIG/SMALL Mapping (0,3,5,6,9 => BIG; 1,2,4,7,8 => SMALL)
 * 2. Fixed Custom Opposite-Number Mapping (0→1, 1→7, 2→6, 3→3, 4→8, 5→1, 6→2, 7→9, 8→8, 9→2)
 * 3. Independent Multi-Factor Opposite-Number Calculator (10/20/50/100/1000 freq, repetition, gap, 10x10 transitions, opp-hit accuracy)
 * 4. Full Logic Pattern Engines: SURESHOT_DATABASE (582), CLEAN_500_PATTERNS (500), CPU_PATTERN_DB (410),
 *    Deterministic BUNNY AI, Structural Suite (Zigzag, Double/Triple, 2B+2S/3B+3S/4B+4S, Wave, Mirror, Palindrome, Cycle, Triangle, Momentum),
 *    DARKSIDE Pattern DB, AnshCore, HimanshuV25, TrendVoteEngine
 * 5. Mathematical Engines (up to 1000 draws): Multi-window freq & drift, Markov 1st/2nd/3rd order, Chi-Square significance
 * 6. Strictly Causal Walk-Forward Historical Backtester + Adaptive Pattern Weight Tracker
 */

import {
  SURESHOT_DATABASE,
  CLEAN_500_PATTERNS,
  CPU_PATTERN_DB,
  BUNNY_PATTERN_NAMES,
} from './patternDatabases';

export { SURESHOT_DATABASE, CLEAN_500_PATTERNS, CPU_PATTERN_DB, BUNNY_PATTERN_NAMES };

export type DarksideSize = 'BIG' | 'SMALL';
export type DarksideParity = 'EVEN' | 'ODD';
export type DarksideColorType = 'GREEN' | 'RED' | 'GREEN_VIOLET' | 'RED_VIOLET';
export type DarksideGrade = 'CHAOS' | 'DANGER' | 'STRONG' | 'MEDIUM' | 'WEAK';
export type PredictionStatus = 'ACTIVE';

export interface DarksideHistoryRecord {
  issueNumber: string;
  number: number;
  size: DarksideSize;
  parity: DarksideParity;
  colorType: DarksideColorType;
  time?: string;
}

export interface RawHistoryInput {
  issueNumber?: string | number;
  issue?: string | number;
  periodNumber?: string | number;
  period?: string | number;
  roundId?: string | number;
  gameNo?: string | number;
  id?: string | number;
  number?: number | string;
  openNumber?: number | string;
  num?: number | string;
  result?: number | string;
  open?: number | string;
  winNumber?: number | string;
  openCode?: number | string;
  color?: string;
  time?: string;
}

export interface PatternDBEntry {
  next: DarksideSize;
  confidence: number;
}

export interface PatternDBMatch {
  pattern: string;
  next: DarksideSize;
  confidence: number;
  source:
    | 'PATTERN_DB'
    | 'ANSH_LIVE'
    | 'ANSH_MARKOV'
    | 'SURESHOT_DB'
    | 'CPU_DB'
    | 'CLEAN_500'
    | 'BUNNY_AI'
    | 'STRUCTURAL'
    | 'MARKOV_CHI';
}

export interface MultiWindowStats {
  trend: DarksideSize;
  dominance: number;
  volatility: number;
  pressure: number;
}

export interface MultiWindowBreakdown {
  w5: MultiWindowStats;
  w10: MultiWindowStats;
  w20: MultiWindowStats;
  w50: MultiWindowStats;
  w100: MultiWindowStats;
  w500?: MultiWindowStats;
  w1000?: MultiWindowStats;
}

export interface LivePatternInfo {
  type: 'STREAK BREAK' | 'DRAGON' | 'ZIG-ZAG / MIRROR 1:1' | 'DOUBLE 2:2' | null;
  length: number;
  nextSide: DarksideSize | null;
  dragonLength: number;
  zigzagLength: number;
  doubleLength: number;
  breakRunLength: number;
}

export interface RunTransitionStats {
  context: string | null;
  big: number;
  small: number;
  samples: number;
  side: DarksideSize | null;
  rate: number;
}

export interface StaircaseInfo {
  side: DarksideSize;
  direction: 1 | -1;
  length: number;
  nextNumber: number;
}

export interface UltraSignalResult {
  prediction: DarksideSize | null;
  alignment: number | null;
  power: number;
  streak: number;
  volatility: number;
  description: string;
  strategyCount?: number;
  signals?: Array<{ name: string; prediction: DarksideSize; confidence: number; weight: number }>;
}

export interface AnshCoreAnalysis {
  prediction: DarksideSize;
  confidence: number;
  signalLevel: 'ELITE' | 'STRONG' | 'MEDIUM' | 'LOW';
  sampleNumbers: string;
  bigNum: number;
  smallNum: number;
  period: string;
  engines: Array<{ name: string; prediction: DarksideSize; confidence: number; weight: number }>;
}

export interface HimanshuAnalysisResult {
  prediction: DarksideSize;
  jodi: [number, number];
  analysis: {
    algorithmVotes: string;
    strategy: string;
    confidence: number;
    patternMatches: number;
    patternScanned: number;
  };
}

export interface TrendVoteAnalysis {
  prediction: DarksideSize | 'WAIT';
  patternName: string;
  strategy: string;
  voteShare: number;
  patternMatches: number;
  patternScanned: number;
  bigWeight: number;
  smallWeight: number;
  alternatingOverride: boolean;
  transitionOverride: DarksideSize | null;
  transitionStats: RunTransitionStats;
  livePattern: LivePatternInfo;
  staircaseInfo: StaircaseInfo | null;
  staircaseSide: DarksideSize | null;
  gap2Side: DarksideSize | null;
  gap3Side: DarksideSize | null;
  ultraSignal: UltraSignalResult | null;
  voteBreakdown: Array<{ name: string; side: DarksideSize | 'WAIT' }>;
  matchedCandidates: string[];
  historyCount: number;
  anshCore: AnshCoreAnalysis | null;
  himanshu: HimanshuAnalysisResult | null;
}

export interface DarksideEngineAnalysis {
  trendScore: number;
  momentumScore: number;
  patternScore: number;
  volatilityScore: number;
  reverseScore: number;
  totalAiScore: number;
  volatilityValue: number;
  volatilityState: 'STABLE' | 'NORMAL' | 'UNSTABLE' | 'CHAOTIC';
  momentumPressure: DarksideSize;
  momentumMultiplier: number;
  streakCount: number;
  streakSide: DarksideSize;
  streakStatus: 'NORMAL' | 'STRONG' | 'OVEREXTENDED' | 'EXTREME_EXHAUSTION';
  exhaustionScore: number;
  reversalRisk: number;
  reversalType: 'NONE' | 'SOFT' | 'HARD' | 'EXHAUSTION';
  heatIndex: number;
  heatState: 'LOW' | 'NORMAL' | 'HIGH' | 'OVERHEATED';
  chaosDetected: boolean;
  chaosScore: number;
  pressureSide: DarksideSize;
  pressureDominance: number;
  stabilityScore: number;
  signalGrade: DarksideGrade;
  matchedPattern: PatternDBMatch | null;
  backtestAccuracy?: number;
  backtestSamples?: number;
  chiSquare?: number;
  chiPValueBand?: 'HIGH' | 'SIGNIFICANT' | 'NEUTRAL';
  markovProbBig?: number;
  patternQuality?: number;
}

export interface PatternPerformance {
  wins: number;
  losses: number;
  consecutiveLosses: number;
  weight: number;
  recent: boolean[];
}

export interface PatternLossTrackerState {
  consecutiveBSLosses: number;
  lastEvaluatedPeriod: string;
  bsWins: number;
  bsLosses: number;
  numWins: number;
  numLosses: number;
  bothWins: number;
  lastFailedPattern: string | null;
  patternStats: Record<string, PatternPerformance>;
  oppDigitStats: Record<number, { wins: number; losses: number }>;
  recentOutcomes: Array<{
    period: string;
    pattern: string;
    bsWin: boolean;
    numHit: boolean;
    bothHit: boolean;
    failedPattern: string | null;
  }>;
}

export interface DarksidePredictionResult {
  period: string;
  status: PredictionStatus;
  source: 'DRAGON' | 'PATTERN' | 'FUSION' | 'BUNNY_AI' | 'MARKOV';
  size: DarksideSize;
  bs: DarksideSize;
  number: number; // Single exact opposite number (CUSTOM_OPP_MAP)
  favNum: number; // Selected trigger digit (0..9)
  oppNum: number; // Single exact opposite number (CUSTOM_OPP_MAP[favNum])
  oppositeNumber: number; // Alias of oppNum
  numbers: [number];
  color: 'RED' | 'GREEN';
  violet: boolean;
  label: string;
  confidence: number;
  backtestAccuracy: number;
  backtestSamples: number;
  patternQuality: number;
  pattern: string;
  patternName: string;
  patternDetail: string;
  patternPriority: number;
  isDragon: boolean;
  analysis: string;
  lockedAt: number;
  validHistoryCount: number;
  engineAnalysis: DarksideEngineAnalysis;
  multiWindow: MultiWindowBreakdown;
  anshAnalysis: TrendVoteAnalysis | null;
  anshCore: AnshCoreAnalysis | null;
  himanshu: HimanshuAnalysisResult | null;
  logics: Array<{ k: string; bs: DarksideSize }>;
  breakdown: Record<string, { bs: DarksideSize; score: number; num?: number }>;
  winRate: number;
  signalStr: number;
  patAcc: number;
  trendStr: number;
  sentiment: 'BULLISH' | 'NEUTRAL';
  momentum: number;
  vol: number;
  aiScore: number;
  isSureshot: boolean;
  reasoning: string;
  analysisSummary: string;
}

export interface DarksideOutcomeEvaluation {
  status: string;
  code: 'ULTRA_JACKPOT' | 'JACKPOT' | 'WIN' | 'LOSS';
  isWin: boolean;
  isSizeWin: boolean;
  num1Hit: boolean;
  num2Hit: boolean;
  isJackpot: boolean;
  isUltraJackpot: boolean;
  bothHit: boolean;
}

// ============================================================
// 1. FIXED CUSTOM WINGO MAPPINGS (NON-NEGOTIABLE)
// ============================================================
export const CUSTOM_BS_MAP: Readonly<Record<number, DarksideSize>> = {
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

export const CUSTOM_OPP_MAP: Readonly<Record<number, number>> = {
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

const CUSTOM_BIG_DIGITS: readonly number[] = [0, 3, 5, 6, 9];
const CUSTOM_SMALL_DIGITS: readonly number[] = [1, 2, 4, 7, 8];

const normalizeDigit = (n: number): number => {
  const v = Math.trunc(n);
  if (!Number.isFinite(v)) return 0;
  return ((v % 10) + 10) % 10;
};

export const sizeOf = (n: number): DarksideSize => CUSTOM_BS_MAP[normalizeDigit(n)] ?? 'SMALL';
export const bsOf = sizeOf;
export const parityOf = (n: number): DarksideParity => (normalizeDigit(n) % 2 === 0 ? 'EVEN' : 'ODD');
export const primaryCol = (n: number): 'RED' | 'GREEN' => (normalizeDigit(n) % 2 === 0 ? 'RED' : 'GREEN');
export const hasViolet = (n: number): boolean => {
  const d = normalizeDigit(n);
  return d === 0 || d === 5;
};
export const colorTypeOf = (n: number): DarksideColorType => {
  const v = normalizeDigit(n);
  if (v === 0) return 'RED_VIOLET';
  if (v === 5) return 'GREEN_VIOLET';
  return [1, 3, 7, 9].includes(v) ? 'GREEN' : 'RED';
};
export const oppositeDigit = (n: number): number => CUSTOM_OPP_MAP[normalizeDigit(n)] ?? 1;

const clamp = (val: number, min: number, max: number): number => Math.max(min, Math.min(max, val));

export function to17DigitPeriod(period: string): string {
  if (!period) return '20261028100051956';
  const clean = period.replace(/\D/g, '');
  if (clean.length === 17) return clean;
  if (clean.length > 17) return clean.slice(-17);
  const now = new Date();
  const ymd =
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const seq = clean.slice(-5).padStart(5, '0');
  return `${ymd}1000${seq}`;
}

// ============================================================
// 2. HISTORY NORMALIZATION & ANTI-GLITCH VALIDATION (NEWEST-FIRST)
// ============================================================
function parseStrictDigit(raw: unknown): number | null {
  if (typeof raw === 'number') {
    return Number.isInteger(raw) && raw >= 0 && raw <= 9 ? raw : null;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!/^\d+$/.test(trimmed)) return null;
    const parsed = Number(trimmed);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 9 ? parsed : null;
  }
  return null;
}

function comparePeriodsDesc(a: string, b: string): number {
  const da = a.replace(/\D/g, '');
  const db = b.replace(/\D/g, '');
  if (da && db) {
    try {
      const ba = BigInt(da);
      const bb = BigInt(db);
      if (ba > bb) return -1;
      if (ba < bb) return 1;
      return 0;
    } catch {
      // fallback
    }
  }
  return b.localeCompare(a);
}

export function normalizeDarksideHistory(
  rawInput: ReadonlyArray<number | RawHistoryInput>,
  options?: { excludePeriod?: string }
): {
  records: DarksideHistoryRecord[];
  numbers: number[];
} {
  if (!Array.isArray(rawInput) || rawInput.length === 0) {
    return { records: [], numbers: [] };
  }

  const excludeStr = options?.excludePeriod ? String(options.excludePeriod).trim() : '';
  const hasObjects = rawInput.some((item) => item !== null && typeof item === 'object');

  if (!hasObjects) {
    const numbers: number[] = [];
    const records: DarksideHistoryRecord[] = [];
    for (const item of rawInput) {
      if (records.length >= 1000) break;
      const d = parseStrictDigit(item);
      if (d !== null) {
        numbers.push(d);
        records.push({
          issueNumber: String(records.length),
          number: d,
          size: sizeOf(d),
          parity: parityOf(d),
          colorType: colorTypeOf(d),
        });
      }
    }
    return { records, numbers };
  }

  const seenPeriods = new Set<string>();
  const parsed: DarksideHistoryRecord[] = [];

  for (const item of rawInput) {
    if (typeof item === 'number') {
      const d = parseStrictDigit(item);
      if (d !== null) {
        parsed.push({
          issueNumber: '',
          number: d,
          size: sizeOf(d),
          parity: parityOf(d),
          colorType: colorTypeOf(d),
        });
      }
      continue;
    }
    if (!item || typeof item !== 'object') continue;

    let issue = '';
    for (const k of ['issueNumber', 'issue', 'periodNumber', 'period', 'roundId', 'gameNo', 'id'] as const) {
      if (item[k] !== undefined && item[k] !== null && String(item[k]).trim() !== '') {
        issue = String(item[k]).trim();
        break;
      }
    }

    if (excludeStr && issue) {
      if (issue === excludeStr) continue;
      const di = issue.replace(/\D/g, '');
      const de = excludeStr.replace(/\D/g, '');
      if (di && de) {
        try {
          if (BigInt(di) >= BigInt(de)) continue;
        } catch {
          // ignore
        }
      }
    }

    let digit: number | null = null;
    for (const k of ['number', 'openNumber', 'num', 'result', 'open', 'winNumber', 'openCode'] as const) {
      if (item[k] !== undefined && item[k] !== null) {
        digit = parseStrictDigit(item[k]);
        if (digit !== null) break;
      }
    }
    if (digit === null && typeof item.color === 'string') {
      const cleaned = item.color.replace(/\D/g, '');
      if (cleaned.length === 1) digit = parseStrictDigit(cleaned);
    }
    if (digit === null) continue;

    if (issue) {
      if (seenPeriods.has(issue)) continue;
      seenPeriods.add(issue);
    }

    parsed.push({
      issueNumber: issue,
      number: digit,
      size: sizeOf(digit),
      parity: parityOf(digit),
      colorType: colorTypeOf(digit),
      time: item.time,
    });
  }

  const withIssues = parsed.filter((r) => r.issueNumber !== '');
  if (withIssues.length >= 2 && withIssues.length === parsed.length) {
    parsed.sort((a, b) => comparePeriodsDesc(a.issueNumber, b.issueNumber));
  }

  const sliced = parsed.slice(0, 1000);
  return {
    records: sliced,
    numbers: sliced.map((r) => r.number),
  };
}

// ============================================================
// 3. PATTERN DATABASES & CLEAN MATCHERS
// ============================================================
export const PATTERN_DB: Record<string, PatternDBEntry> = {
  BSBSB: { next: 'SMALL', confidence: 84 },
  SSBBSS: { next: 'BIG', confidence: 83 },
  BBBSSS: { next: 'SMALL', confidence: 84 },
  SSSSBBBB: { next: 'SMALL', confidence: 83 },
  BBBSBBB: { next: 'SMALL', confidence: 82 },
  SSBSSBSS: { next: 'BIG', confidence: 81 },
  BBBSSBBB: { next: 'SMALL', confidence: 82 },
  SSSSBSSSS: { next: 'BIG', confidence: 82 },
  BBBBSSBBBB: { next: 'SMALL', confidence: 83 },
  SSSSSSSSSS: { next: 'BIG', confidence: 88 },
  BSBSBSB: { next: 'SMALL', confidence: 81 },
  SBSBSBS: { next: 'BIG', confidence: 81 },
  BSBSBSBS: { next: 'SMALL', confidence: 82 },
  SBSBSBSB: { next: 'BIG', confidence: 82 },
  BBBBBS: { next: 'SMALL', confidence: 82 },
  SSSSSB: { next: 'BIG', confidence: 82 },
  BBBBSB: { next: 'SMALL', confidence: 80 },
  SSSSBS: { next: 'BIG', confidence: 80 },
  BBSBSBB: { next: 'SMALL', confidence: 78 },
  SSSBBSSS: { next: 'BIG', confidence: 78 },
  BBSSBBB: { next: 'SMALL', confidence: 78 },
  BBSSBBSS: { next: 'SMALL', confidence: 77 },
  SBBSBBB: { next: 'SMALL', confidence: 76 },
  BSSBSSS: { next: 'BIG', confidence: 76 },
  BBBSBB: { next: 'SMALL', confidence: 79 },
  SSSBSS: { next: 'BIG', confidence: 79 },
  BBSSBB: { next: 'SMALL', confidence: 78 },
  SSBSSBS: { next: 'BIG', confidence: 77 },
  BBSBBSB: { next: 'SMALL', confidence: 77 },
  BBBSSBS: { next: 'SMALL', confidence: 80 },
  SSSBBSB: { next: 'BIG', confidence: 80 },
  BSSBBSSB: { next: 'BIG', confidence: 75 },
  BBBBSSS: { next: 'SMALL', confidence: 81 },
  SSSSBBB: { next: 'BIG', confidence: 81 },
  SSBBBS: { next: 'BIG', confidence: 77 },
  BBSSSB: { next: 'SMALL', confidence: 77 },
  BBBBBSS: { next: 'SMALL', confidence: 82 },
  SSSSSBB: { next: 'BIG', confidence: 82 },
  BBSBBSBB: { next: 'SMALL', confidence: 78 },
  BSSBSSB: { next: 'SMALL', confidence: 77 },
  SBBSBBS: { next: 'BIG', confidence: 77 },
  BBBSSBB: { next: 'SMALL', confidence: 79 },
  BBBSSSBBB: { next: 'SMALL', confidence: 82 },
  BBBBSBBB: { next: 'SMALL', confidence: 80 },
  SSSSBSSS: { next: 'BIG', confidence: 80 },
  BBSBSSB: { next: 'SMALL', confidence: 76 },
  SSBSBBS: { next: 'BIG', confidence: 76 },
  BSBBSSBS: { next: 'BIG', confidence: 74 },
  SBBSSBBS: { next: 'SMALL', confidence: 74 },
  SSSSSBBB: { next: 'BIG', confidence: 81 },
  BBBBBSSS: { next: 'SMALL', confidence: 81 },
  BBBBBBBB: { next: 'SMALL', confidence: 86 },
  SSSSSSSS: { next: 'BIG', confidence: 86 },
  BBSBBB: { next: 'SMALL', confidence: 78 },
  SSBSSS: { next: 'BIG', confidence: 78 },
  BSBBSBB: { next: 'SMALL', confidence: 76 },
  SBSSBSS: { next: 'BIG', confidence: 76 },
  SSSSBBSS: { next: 'BIG', confidence: 78 },
  BBBBSSBB: { next: 'SMALL', confidence: 78 },
  BBBBBSB: { next: 'SMALL', confidence: 79 },
  SSSSSBS: { next: 'BIG', confidence: 79 },
  BBBSB: { next: 'SMALL', confidence: 78 },
  SSSBS: { next: 'BIG', confidence: 78 },
  BBSBS: { next: 'BIG', confidence: 76 },
  SSBSB: { next: 'SMALL', confidence: 76 },
  BBSBB: { next: 'SMALL', confidence: 77 },
  SSBSS: { next: 'BIG', confidence: 77 },
  BSBS: { next: 'SMALL', confidence: 75 },
  SBSB: { next: 'BIG', confidence: 75 },
  BSSB: { next: 'BIG', confidence: 74 },
  SBBS: { next: 'SMALL', confidence: 74 },
  BBS: { next: 'SMALL', confidence: 72 },
  SSB: { next: 'BIG', confidence: 72 },
  SBB: { next: 'BIG', confidence: 71 },
  BSS: { next: 'SMALL', confidence: 71 },
  BBBS: { next: 'SMALL', confidence: 74 },
  SSSB: { next: 'BIG', confidence: 74 },
  BBBBS: { next: 'SMALL', confidence: 77 },
  SSSSB: { next: 'BIG', confidence: 77 },
  SSBS: { next: 'BIG', confidence: 72 },
  BBSB: { next: 'SMALL', confidence: 72 },
  BBSSB: { next: 'SMALL', confidence: 74 },
  SSBBS: { next: 'BIG', confidence: 74 },
  BBBSSB: { next: 'SMALL', confidence: 77 },
  SSSBBS: { next: 'BIG', confidence: 77 },
  BBSBBS: { next: 'SMALL', confidence: 76 },
  SSBSSB: { next: 'BIG', confidence: 76 },
  SSBBSBB: { next: 'BIG', confidence: 75 },
  BBSSBSS: { next: 'SMALL', confidence: 75 },
  BSBSBSBSB: { next: 'SMALL', confidence: 82 },
  SBSBSBSBS: { next: 'BIG', confidence: 82 },
  BBBSBBS: { next: 'SMALL', confidence: 78 },
  SSSBSSB: { next: 'BIG', confidence: 78 },
  BBBBBB: { next: 'SMALL', confidence: 84 },
  SSSSSS: { next: 'BIG', confidence: 84 },
  BBBBBBB: { next: 'SMALL', confidence: 85 },
  SSSSSSS: { next: 'BIG', confidence: 85 },
  BBSBSBS: { next: 'SMALL', confidence: 77 },
  SSBSBSB: { next: 'BIG', confidence: 77 },
  BSBSSBB: { next: 'SMALL', confidence: 76 },
  SBBSBSS: { next: 'BIG', confidence: 76 },
  BBBBBBS: { next: 'SMALL', confidence: 83 },
  SSSSSSB: { next: 'BIG', confidence: 83 },
  BSSSSB: { next: 'BIG', confidence: 76 },
  SBBBBS: { next: 'SMALL', confidence: 76 },
  BBBBSSBS: { next: 'SMALL', confidence: 80 },
  SSSSBBBS: { next: 'BIG', confidence: 80 },
  BSBBBSBB: { next: 'SMALL', confidence: 79 },
  SBSSSBSS: { next: 'BIG', confidence: 79 },
  BBSSSSB: { next: 'BIG', confidence: 77 },
  SSBBBBS: { next: 'SMALL', confidence: 77 },
  BSBSBSS: { next: 'SMALL', confidence: 76 },
  SBSBSBB: { next: 'BIG', confidence: 76 },
  BBBBB: { next: 'SMALL', confidence: 80 },
  SSSSS: { next: 'BIG', confidence: 80 },
  BBBBSS: { next: 'SMALL', confidence: 77 },
  SSSSBB: { next: 'BIG', confidence: 77 },
  BBSBBBBS: { next: 'SMALL', confidence: 79 },
  SSBSSSSB: { next: 'BIG', confidence: 79 },
  BSBBBB: { next: 'SMALL', confidence: 77 },
  SBSSSS: { next: 'BIG', confidence: 77 },
  BSBBSSBB: { next: 'SMALL', confidence: 78 },
  SBSSBBSS: { next: 'BIG', confidence: 78 },
  SBBBB: { next: 'SMALL', confidence: 84 },
  SSBBBB: { next: 'SMALL', confidence: 85 },
  SBSBBBB: { next: 'SMALL', confidence: 85 },
  BBSBBBB: { next: 'SMALL', confidence: 85 },
  SSSBBBB: { next: 'SMALL', confidence: 85 },
  BSSBBBB: { next: 'SMALL', confidence: 85 },
  SBBSBBBB: { next: 'SMALL', confidence: 85 },
  BSBSBBBB: { next: 'SMALL', confidence: 85 },
  BSSSBBBB: { next: 'SMALL', confidence: 85 },
  BSSSSBBBB: { next: 'SMALL', confidence: 85 },
  BBSSBBBB: { next: 'SMALL', confidence: 85 },
  SSBSBBBB: { next: 'SMALL', confidence: 85 },
  SBSSBBBB: { next: 'SMALL', confidence: 85 },
  BBBSBBBB: { next: 'SMALL', confidence: 85 },
  SSBBSBBBB: { next: 'SMALL', confidence: 85 },
  SBSBSBBBB: { next: 'SMALL', confidence: 85 },
  BSBBSBBBB: { next: 'SMALL', confidence: 85 },
  BSBSSBBBB: { next: 'SMALL', confidence: 85 },
  SBSSSBBBB: { next: 'SMALL', confidence: 85 },
  BBSSSBBBB: { next: 'SMALL', confidence: 85 },
  BBSBSBBBB: { next: 'SMALL', confidence: 85 },
  SBBSSBBBB: { next: 'SMALL', confidence: 85 },
  SSSBSBBBB: { next: 'SMALL', confidence: 85 },
  SBBBSBBBB: { next: 'SMALL', confidence: 85 },
  SBBBBSBBBB: { next: 'SMALL', confidence: 85 },
  SSBSSSS: { next: 'BIG', confidence: 85 },
  BSBBSSSS: { next: 'BIG', confidence: 85 },
  SBSBSSSS: { next: 'BIG', confidence: 85 },
  SSSBSSSS: { next: 'BIG', confidence: 85 },
  BSSBSSSS: { next: 'BIG', confidence: 85 },
  SBBBSSSS: { next: 'BIG', confidence: 85 },
};

export function matchPatternDB(
  chronologicalBsString: string,
  recentMatchedPatterns?: string[]
): PatternDBMatch | null {
  for (let len = Math.min(12, chronologicalBsString.length); len >= 3; len--) {
    const sub = chronologicalBsString.slice(-len);
    const hit = PATTERN_DB[sub];
    if (hit) {
      if (recentMatchedPatterns && recentMatchedPatterns.includes(sub) && hit.confidence < 85) {
        continue;
      }
      if (recentMatchedPatterns) {
        recentMatchedPatterns.push(sub);
        if (recentMatchedPatterns.length > 5) recentMatchedPatterns.shift();
      }
      return {
        pattern: sub,
        next: hit.next,
        confidence: hit.confidence,
        source: 'PATTERN_DB',
      };
    }
  }
  return null;
}

// ============================================================
// 4. VOLATILITY, MULTI-WINDOW (10/20/50/100/500/1000) & STATISTICAL ENGINES
// ============================================================
export function calculateVolatility(numbers: number[]): {
  volatility: number;
  stdDev: number;
  mean: number;
} {
  if (!numbers.length) return { volatility: 0.5, stdDev: 0, mean: 4.5 };
  const len = numbers.length;
  const mean = numbers.reduce((acc, v) => acc + v, 0) / len;
  const variance = numbers.reduce((acc, v) => acc + (v - mean) ** 2, 0) / len;
  const stdDev = Math.sqrt(variance);
  const volatility = stdDev / (mean === 0 ? 1 : mean);
  return {
    volatility: Number(volatility.toFixed(4)),
    stdDev: Number(stdDev.toFixed(2)),
    mean: Number(mean.toFixed(2)),
  };
}

export function calculateMultiWindow(numbers: number[]): MultiWindowBreakdown {
  const win = (k: number): MultiWindowStats => {
    const slice = numbers.slice(0, k);
    if (!slice.length) return { trend: 'BIG', dominance: 50, volatility: 0.5, pressure: 50 };
    const bigs = slice.filter((x) => sizeOf(x) === 'BIG').length;
    const dominance = Math.round((bigs / slice.length) * 100);
    const trend: DarksideSize = dominance >= 50 ? 'BIG' : 'SMALL';
    return {
      trend,
      dominance,
      volatility: calculateVolatility(slice).volatility,
      pressure: trend === 'BIG' ? dominance : 100 - dominance,
    };
  };
  return {
    w5: win(5),
    w10: win(10),
    w20: win(20),
    w50: win(50),
    w100: win(100),
    w500: win(500),
    w1000: win(1000),
  };
}

export function calculateFibHashDigit(numbers: number[], targetPeriod: string): number {
  if (numbers.length < 10) {
    return parseInt(String(targetPeriod || '').slice(-1), 10) || 7;
  }
  const n = numbers.slice(0, 10);
  const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
  let weighted = 0;
  for (let i = 0; i < 10; i++) {
    weighted += n[i] * fib[i];
  }
  const a = weighted % 13;
  const sum = n.reduce((acc, v) => acc + v, 0);
  const s =
    String(sum)
      .split('')
      .reduce((acc, ch) => acc + parseInt(ch, 10), 0) % 9 || 9;
  const c = ((n[0] ^ n[1]) + Math.abs(n[0] - n[1])) % 7;
  const l = (a * 5 + s * 7 + c * 11 + 15) % 11;
  const u = ((l << 2) & 15) | ((l >> 2) & 3);
  const d = l * 13 + u + 7;
  const rev = parseInt(String(d).split('').reverse().join(''), 10) || d;
  const f = rev % 9;
  const p = (Math.abs(10 - n[0]) * 2 + f + 2) % 13;
  const m = (p + (fib[p % 10] || 2) + a) % 7;
  const h = ((m ^ l) + 10) % 10;
  const g = h * 2 + l * 5 + m * 9;
  const root =
    String(g)
      .split('')
      .reduce((acc, ch) => acc + parseInt(ch, 10), 0) % 10;
  const v = ((root * 7 + h * 3 + f * 5 + p + m + l + u + a + s + c + 2) % 13 + root + h) % 10;
  return (v + ((v * 3 + 2) % 7)) % 10;
}

// ============================================================
// 5. FULL LOGIC SUB-ENGINES (SURESHOT, CLEAN 500, CPU_DB, BUNNY AI, MARKOV, CHI-SQUARE, STRUCTURAL)
// ============================================================

export interface EngineSignalVote {
  name: string;
  prediction: DarksideSize;
  edge: number; // 0..1 calibrated strength
  patternKey: string;
  detail: string;
}

/**
 * Evaluates empirical SURESHOT_DATABASE (9,698 observed pattern-to-next-draw pairs across 582 keys).
 */
export function evaluateSureshotDatabase(chronologicalChars: string): EngineSignalVote | null {
  for (const len of [10, 9, 8, 7]) {
    if (chronologicalChars.length < len) continue;
    const key = chronologicalChars.slice(-len);
    const entry = SURESHOT_DATABASE[key];
    if (entry && entry.samples >= 3) {
      const bias = Math.abs(entry.prob - 50) / 50; // 0..1
      if (bias < 0.04 && entry.samples < 8) continue;
      return {
        name: 'SURESHOT_DB',
        prediction: entry.next,
        edge: clamp(0.18 + bias * 0.55 + Math.min(0.15, entry.samples / 120), 0.15, 0.85),
        patternKey: `SURESHOT:${key}`,
        detail: `${key}→${entry.next} (${entry.b}B/${entry.s}S, ${entry.prob}%)`,
      };
    }
  }
  return null;
}

/**
 * Evaluates CPU_PATTERN_DB (410 pattern keys) on both newest-first and chronological tails.
 */
export function evaluateCpuPatternDB(newestFirstChars: string, chronologicalChars: string): EngineSignalVote | null {
  let bestHit: { key: string; next: DarksideSize; conf: number; len: number } | null = null;
  for (let len = Math.min(11, newestFirstChars.length); len >= 3; len--) {
    const subNew = newestFirstChars.slice(0, len);
    const hitNew = CPU_PATTERN_DB[subNew];
    if (hitNew && (!bestHit || len > bestHit.len || (len === bestHit.len && hitNew.conf > bestHit.conf))) {
      bestHit = { key: subNew, next: hitNew.next, conf: hitNew.conf, len };
    }
    const subChrono = chronologicalChars.slice(-len);
    const hitChrono = CPU_PATTERN_DB[subChrono];
    if (hitChrono && (!bestHit || len > bestHit.len || (len === bestHit.len && hitChrono.conf > bestHit.conf))) {
      bestHit = { key: subChrono, next: hitChrono.next, conf: hitChrono.conf, len };
    }
  }
  if (!bestHit) return null;
  return {
    name: 'CPU_PATTERN_DB',
    prediction: bestHit.next,
    edge: clamp((bestHit.conf - 45) / 55, 0.15, 0.85),
    patternKey: `CPU:${bestHit.key}`,
    detail: `CPU[${bestHit.key}]→${bestHit.next}`,
  };
}

/**
 * Evaluates CLEAN_500_PATTERNS (001_ZIGZAG .. 500_GENERATED_89).
 */
export function evaluateClean500Patterns(chronologicalChars: string): EngineSignalVote | null {
  if (chronologicalChars.length < 6) return null;

  let bigScore = 0;
  let smallScore = 0;
  let topMatch: { id: string; category: string; next: DarksideSize; weight: number } | null = null;

  for (const entry of CLEAN_500_PATTERNS) {
    const seq = entry.seq;
    // 1. Explicit full-match rules (001..004)
    if (entry.next && chronologicalChars.endsWith(seq)) {
      const w = seq.length * 1.4;
      if (entry.next === 'BIG') bigScore += w;
      else smallScore += w;
      if (!topMatch || w > topMatch.weight) {
        topMatch = { id: entry.id, category: entry.category, next: entry.next, weight: w };
      }
      continue;
    }

    // 2. Prefix continuation: match last k chars against entry.seq[0..k-1] -> predicts entry.seq[k]
    const maxK = Math.min(chronologicalChars.length, seq.length - 1);
    for (let k = maxK; k >= 6; k--) {
      if (chronologicalChars.endsWith(seq.slice(0, k))) {
        const nextChar = seq[k];
        const nextSide: DarksideSize = nextChar === 'B' ? 'BIG' : 'SMALL';
        const w = k * 0.85;
        if (nextSide === 'BIG') bigScore += w;
        else smallScore += w;
        if (!topMatch || w > topMatch.weight) {
          topMatch = { id: entry.id, category: entry.category, next: nextSide, weight: w };
        }
        break;
      }
    }

    // 3. Full-sequence tail alignment -> cyclic next element seq[0]
    if (chronologicalChars.endsWith(seq)) {
      const nextSide: DarksideSize = seq[0] === 'B' ? 'BIG' : 'SMALL';
      const w = seq.length * 1.0;
      if (nextSide === 'BIG') bigScore += w;
      else smallScore += w;
      if (!topMatch || w > topMatch.weight) {
        topMatch = { id: entry.id, category: entry.category, next: nextSide, weight: w };
      }
    }
  }

  if (!topMatch || Math.abs(bigScore - smallScore) < 0.5) return null;
  const prediction: DarksideSize = bigScore >= smallScore ? 'BIG' : 'SMALL';
  const total = bigScore + smallScore;
  const ratio = total > 0 ? Math.max(bigScore, smallScore) / total : 0.5;
  return {
    name: 'CLEAN_500_LIB',
    prediction,
    edge: clamp((ratio - 0.5) * 1.4 + Math.min(0.25, topMatch.weight / 35), 0.15, 0.85),
    patternKey: `CLEAN500:${topMatch.category}`,
    detail: `${topMatch.id}→${prediction}`,
  };
}

/**
 * Deterministic BUNNY AI Engine (converted strictly to CUSTOM_BS_MAP, zero Math.random()).
 */
export function runBunnyAI(numbersNewestFirst: ReadonlyArray<number>): {
  pattern: string;
  patternName: string;
  prediction: DarksideSize;
  confidence: number;
  message: string;
} {
  if (!numbersNewestFirst || numbersNewestFirst.length < 3) {
    return {
      pattern: 'MULTI',
      patternName: BUNNY_PATTERN_NAMES.MULTI[0],
      prediction: 'BIG',
      confidence: 52,
      message: BUNNY_PATTERN_NAMES.MULTI[1],
    };
  }

  const deepHist = numbersNewestFirst.slice(0, 500);
  const types = deepHist.map((n) => (sizeOf(n) === 'BIG' ? 'B' : 'S'));

  let patKey = 'MULTI';
  let pred: DarksideSize = 'BIG';
  let conf = 60;

  let sk = 1;
  for (let i = 0; i < types.length - 1 && types[i] === types[i + 1]; i++) sk++;
  const cur = types[0];
  const opp = cur === 'B' ? 'S' : 'B';
  const toSize = (c: string): DarksideSize => (c === 'B' ? 'BIG' : 'SMALL');

  let cycleFound = false;
  for (let cl = 2; cl <= 8; cl++) {
    if (types.length < cl * 2) continue;
    let match = true;
    for (let i = 0; i < cl; i++) {
      if (types[i] !== types[i + cl]) {
        match = false;
        break;
      }
    }
    if (match) {
      patKey = `CYCLE_${cl}`;
      pred = toSize(types[cl - 1]);
      conf = clamp(70 + cl * 2, 68, 86);
      cycleFound = true;
      break;
    }
  }

  if (!cycleFound) {
    const s = types.slice(0, 10);
    const seq4 = s.slice(0, 4).join('');
    const seq5 = s.slice(0, 5).join('');
    const seq6 = s.slice(0, 6).join('');
    const seq7 = s.slice(0, 7).join('');
    const seq8 = s.slice(0, 8).join('');
    const seq9 = s.slice(0, 9).join('');
    const seq10 = s.slice(0, 10).join('');
    const b10 = s.filter((x) => x === 'B').length;
    let found = false;

    if (sk >= 6) {
      patKey = cur === 'B' ? 'DRAGON_B' : 'DRAGON_S';
      pred = toSize(opp);
      conf = clamp(78 + Math.min(10, sk - 5), 75, 88);
      found = true;
    } else if (sk === 5) {
      patKey = cur === 'B' ? '5x_STREAK_B' : '5x_STREAK_S';
      pred = toSize(opp);
      conf = 82;
      found = true;
    } else if (sk === 4) {
      patKey = cur === 'B' ? '4x_STREAK_B' : '4x_STREAK_S';
      pred = toSize(opp);
      conf = 78;
      found = true;
    } else if (sk === 3) {
      patKey = cur === 'B' ? '3x_STREAK_B' : '3x_STREAK_S';
      pred = toSize(opp);
      conf = 68;
      found = true;
    } else if (sk === 2 && s.length >= 4 && s[2] === cur && s[3] === opp) {
      patKey = cur === 'B' ? '2x_STREAK_B' : '2x_STREAK_S';
      pred = toSize(opp);
      conf = 61;
      found = true;
    }

    if (!found && (seq6 === 'BSBSBS' || seq5 === 'BSBSB' || seq4 === 'BSBS')) {
      patKey = 'ZIGZAG';
      pred = toSize(opp);
      conf = 74;
      found = true;
    } else if (!found && (seq6 === 'SBSBSB' || seq5 === 'SBSBS' || seq4 === 'SBSB')) {
      patKey = 'ZIGZAG';
      pred = toSize(opp);
      conf = 74;
      found = true;
    }

    if (!found && (seq6 === 'BBSBBB' || seq6 === 'BBBSBB')) {
      patKey = 'SINGLE_BREAK_B';
      pred = 'SMALL';
      conf = 74;
      found = true;
    } else if (!found && (seq6 === 'SSBSSS' || seq6 === 'SSSBSS')) {
      patKey = 'SINGLE_BREAK_S';
      pred = 'BIG';
      conf = 74;
      found = true;
    }

    if (!found && (seq6 === 'BBBSBS' || seq7 === 'BBBSBSB')) {
      patKey = 'BBBSBS_B';
      pred = 'SMALL';
      conf = 76;
      found = true;
    } else if (!found && (seq6 === 'SSSBSB' || seq7 === 'SSSBSBS')) {
      patKey = 'BBBSBS_S';
      pred = 'BIG';
      conf = 76;
      found = true;
    }

    if (!found && (seq5 === 'BBSBB' || seq5 === 'BSBBB')) {
      patKey = 'TRAP_B';
      pred = 'SMALL';
      conf = 73;
      found = true;
    } else if (!found && (seq5 === 'SSBSS' || seq5 === 'SBSSS')) {
      patKey = 'TRAP_S';
      pred = 'BIG';
      conf = 73;
      found = true;
    }

    if (!found && (seq6 === 'BBSSBB' || seq5 === 'BBSSB')) {
      patKey = 'DOUBLE_DOUBLE';
      pred = 'SMALL';
      conf = 77;
      found = true;
    } else if (!found && (seq6 === 'SSBBSS' || seq5 === 'SSBBS')) {
      patKey = 'DOUBLE_DOUBLE';
      pred = 'BIG';
      conf = 77;
      found = true;
    }

    if (!found && (seq6 === 'SSSBBB' || seq8 === 'SSSSBBBB')) {
      patKey = 'WAVE_UP';
      pred = 'SMALL';
      conf = 75;
      found = true;
    } else if (!found && (seq6 === 'BBBSSS' || seq8 === 'BBBBSSSS')) {
      patKey = 'WAVE_DOWN';
      pred = 'BIG';
      conf = 75;
      found = true;
    }

    if (!found && s.length >= 6) {
      const half = 3;
      const firstHalf = s.slice(0, half).join('');
      const revSecond = s.slice(half, half * 2).reverse().join('');
      if (firstHalf === revSecond) {
        patKey = 'MIRROR';
        pred = toSize(s[half * 2 - 1] === 'B' ? 'S' : 'B');
        conf = 72;
        found = true;
      }
    }

    if (!found && (seq5 === 'SBSBS' || seq5 === 'BSBSB')) {
      patKey = seq5 === 'BSBSB' ? 'TRIPLE_BREAK_B' : 'TRIPLE_BREAK_S';
      pred = toSize(opp);
      conf = 73;
      found = true;
    }

    if (!found && (seq8 === 'BBBSBSBS' || seq7 === 'BBBSBSB')) {
      patKey = 'ZIGZAG_BLOCK_B';
      pred = 'SMALL';
      conf = 76;
      found = true;
    } else if (!found && (seq8 === 'SSSBSBSB' || seq7 === 'SSSBSBS')) {
      patKey = 'ZIGZAG_BLOCK_S';
      pred = 'BIG';
      conf = 76;
      found = true;
    }

    if (!found && b10 >= 7) {
      patKey = 'HEAVY_BIG';
      pred = 'SMALL';
      conf = 77;
      found = true;
    } else if (!found && b10 <= 3) {
      patKey = 'HEAVY_SMALL';
      pred = 'BIG';
      conf = 77;
      found = true;
    }

    if (!found && (seq10 === 'BBSSBBSSBB' || seq9 === 'BBSSBBSSB')) {
      patKey = 'PENDULUM';
      pred = 'SMALL';
      conf = 74;
      found = true;
    }

    if (!found) {
      // Adaptive CPU_PATTERN_DB lookup
      for (let l = Math.min(types.length, 9); l >= 3; l--) {
        const sub = types.slice(0, l).join('');
        const hit = CPU_PATTERN_DB[sub];
        if (hit) {
          patKey = 'LIVE_LEARN';
          pred = hit.next;
          conf = clamp(hit.conf, 58, 86);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      // Deterministic statistical + 1st-order Markov fallback (ZERO Math.random!)
      let bNext = 1;
      let sNext = 1;
      for (let i = 1; i < types.length; i++) {
        if (types[i] === cur) {
          if (types[i - 1] === 'B') bNext++;
          else sNext++;
        }
      }
      const pBig = bNext / (bNext + sNext);
      const b20 = types.slice(0, 20).filter((x) => x === 'B').length / Math.min(20, types.length);
      const mrScore = 0.5 - b20;
      const combined = (pBig - 0.5) * 0.7 + mrScore * 0.3;
      patKey = Math.abs(combined) > 0.08 ? 'ADAPTIVE' : 'CHAOS';
      pred = combined >= 0 ? 'BIG' : 'SMALL';
      conf = clamp(Math.round(52 + Math.abs(combined) * 70), 51, 74);
    }
  }

  const info = BUNNY_PATTERN_NAMES[patKey] || ['Multi-Engine Vote', 'Consensus active'];
  return {
    pattern: patKey,
    patternName: info[0],
    prediction: pred,
    confidence: conf,
    message: info[1],
  };
}

/**
 * Evaluates Markov (1st, 2nd & 3rd order) + Chi-Square significance + Multi-Window Drift over up to 1,000 draws.
 */
export function computeMarkovAndChiSquare(numbers: ReadonlyArray<number>): {
  markovVote: EngineSignalVote;
  driftVote: EngineSignalVote | null;
  markovProbBig: number;
  chiSquare: number;
  chiPValueBand: 'HIGH' | 'SIGNIFICANT' | 'NEUTRAL';
} {
  const sizes = numbers.slice(0, 1000).map((n) => (sizeOf(n) === 'BIG' ? 'B' : 'S'));
  const latest1 = sizes[0] || 'B';
  const latest2 = sizes.slice(0, 2).reverse().join('');
  const latest3 = sizes.slice(0, 3).reverse().join('');

  // Chronological transitions: history[i] precedes history[i-1]
  let o1B = 1, o1S = 1;
  let o2B = 1, o2S = 1;
  let o3B = 1, o3S = 1;

  for (let i = 1; i < sizes.length; i++) {
    const nextChar = sizes[i - 1];
    if (sizes[i] === latest1) {
      if (nextChar === 'B') o1B++;
      else o1S++;
    }
    if (i + 1 < sizes.length && sizes[i + 1] + sizes[i] === latest2) {
      if (nextChar === 'B') o2B++;
      else o2S++;
    }
    if (i + 2 < sizes.length && sizes[i + 2] + sizes[i + 1] + sizes[i] === latest3) {
      if (nextChar === 'B') o3B++;
      else o3S++;
    }
  }

  const p1 = o1B / (o1B + o1S);
  const p2 = o2B / (o2B + o2S);
  const p3 = o3B / (o3B + o3S);

  const w1 = 1.0;
  const w2 = o2B + o2S - 2 >= 4 ? 1.5 : 0.4;
  const w3 = o3B + o3S - 2 >= 3 ? 2.0 : 0.3;
  const markovProbBig = (p1 * w1 + p2 * w2 + p3 * w3) / (w1 + w2 + w3);
  const markovPred: DarksideSize = markovProbBig >= 0.5 ? 'BIG' : 'SMALL';
  const markovMargin = Math.abs(markovProbBig - 0.5) * 2; // 0..1

  // Chi-Square test over recent window (20 or available, and 50)
  const w20 = sizes.slice(0, Math.min(20, sizes.length));
  const ob20 = w20.filter((c) => c === 'B').length;
  const os20 = w20.length - ob20;
  const exp20 = w20.length / 2;
  const chi20 = exp20 > 0 ? ((ob20 - exp20) ** 2) / exp20 + ((os20 - exp20) ** 2) / exp20 : 0;

  const w50 = sizes.slice(0, Math.min(50, sizes.length));
  const ob50 = w50.filter((c) => c === 'B').length;
  const os50 = w50.length - ob50;
  const exp50 = w50.length / 2;
  const chi50 = exp50 > 0 ? ((ob50 - exp50) ** 2) / exp50 + ((os50 - exp50) ** 2) / exp50 : 0;

  const chiSquare = Number(Math.max(chi20, chi50).toFixed(2));
  const chiPValueBand: 'HIGH' | 'SIGNIFICANT' | 'NEUTRAL' =
    chiSquare >= 6.63 ? 'HIGH' : chiSquare >= 3.84 ? 'SIGNIFICANT' : 'NEUTRAL';

  const markovVote: EngineSignalVote = {
    name: 'MARKOV_1_2_3',
    prediction: markovPred,
    edge: clamp(0.12 + markovMargin * 0.78, 0.12, 0.85),
    patternKey: `MARKOV:${latest3 || latest2}`,
    detail: `Markov P(B)=${Math.round(markovProbBig * 100)}%`,
  };

  // Multi-window short-term vs long-term divergence
  let driftVote: EngineSignalVote | null = null;
  if (sizes.length >= 20) {
    const r10 = sizes.slice(0, 10).filter((c) => c === 'B').length / 10;
    const baseSlice = sizes.slice(0, Math.min(1000, sizes.length));
    const rLong = baseSlice.filter((c) => c === 'B').length / baseSlice.length;
    const div = r10 - rLong;
    if (chiSquare >= 3.0 || Math.abs(div) >= 0.18) {
      const revertSide: DarksideSize = div > 0 ? 'SMALL' : 'BIG';
      driftVote = {
        name: 'CHI_DRIFT_MR',
        prediction: revertSide,
        edge: clamp(0.18 + Math.min(0.45, chiSquare / 14) + Math.min(0.25, Math.abs(div)), 0.18, 0.82),
        patternKey: `CHI_REVERT:${revertSide}`,
        detail: `ChiSq=${chiSquare} (${Math.round(r10 * 100)}% vs ${Math.round(rLong * 100)}%)`,
      };
    }
  }

  return { markovVote, driftVote, markovProbBig, chiSquare, chiPValueBand };
}

/**
 * Deep Structural Pattern Suite:
 * - ZIGZAG
 * - DOUBLE/TRIPLE & 2B+2S / 3B+3S / 4B+4S
 * - WAVE, MIRROR, PALINDROME
 * - TRIANGLE (1+3 / 3+1)
 * - CYCLE_k (k=2..10)
 * - EMPIRICAL STREAK REVERSAL vs CONTINUATION over 1000 draws
 */
export function detectStructuralPatterns(numbers: ReadonlyArray<number>): EngineSignalVote[] {
  const sizes = numbers.slice(0, 1000).map(sizeOf);
  if (sizes.length < 5) return [];
  const chars = sizes.map((s) => (s === 'BIG' ? 'B' : 'S'));
  const chrono = chars.slice(0, Math.min(24, chars.length)).reverse();
  const votes: EngineSignalVote[] = [];
  const opp = (s: DarksideSize): DarksideSize => (s === 'BIG' ? 'SMALL' : 'BIG');

  // 1. Empirical Streak Analysis over up to 1000 draws
  let streakLen = 1;
  while (streakLen < sizes.length && sizes[streakLen] === sizes[0]) streakLen++;
  if (streakLen >= 2) {
    let contCount = 0;
    let revCount = 0;
    for (let i = 1; i < sizes.length - streakLen; i++) {
      let matches = true;
      for (let j = 0; j < streakLen; j++) {
        if (sizes[i + j] !== sizes[0]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        if (sizes[i - 1] === sizes[0]) contCount++;
        else revCount++;
      }
    }
    const samples = contCount + revCount;
    const empRevRate = samples >= 4 ? (revCount + 1) / (samples + 2) : streakLen >= 4 ? 0.65 : 0.48;
    const pred: DarksideSize = empRevRate >= 0.5 ? opp(sizes[0]) : sizes[0];
    votes.push({
      name: 'EMP_STREAK',
      prediction: pred,
      edge: clamp(0.16 + Math.abs(empRevRate - 0.5) * 1.1 + (streakLen >= 5 ? 0.15 : 0), 0.16, 0.85),
      patternKey: `STREAK:${streakLen}x${chars[0]}`,
      detail: `${streakLen}x${chars[0]}→${pred} (Rev ${Math.round(empRevRate * 100)}%)`,
    });
  }

  // 2. ZIGZAG (1:1 alternation)
  let altLen = 1;
  while (altLen < sizes.length && sizes[altLen] !== sizes[altLen - 1]) altLen++;
  if (altLen >= 4) {
    const pred = opp(sizes[0]);
    votes.push({
      name: 'ZIGZAG',
      prediction: pred,
      edge: clamp(0.26 + Math.min(0.4, (altLen - 3) * 0.08), 0.25, 0.82),
      patternKey: `ZIGZAG:${altLen}`,
      detail: `Zigzag x${altLen}→${pred}`,
    });
  }

  // 3. 2B+2S / 3B+3S / 4B+4S Block Symmetry
  const runs: Array<{ side: DarksideSize; len: number }> = [];
  for (let i = 0; i < Math.min(sizes.length, 30); i++) {
    if (runs.length === 0 || runs[runs.length - 1].side !== sizes[i]) {
      runs.push({ side: sizes[i], len: 1 });
    } else {
      runs[runs.length - 1].len++;
    }
  }
  if (runs.length >= 3) {
    const r0 = runs[0];
    const r1 = runs[1];
    const r2 = runs[2];
    for (const k of [2, 3, 4]) {
      if (r1.len === k && r2.len === k && r0.len <= k) {
        const pred = r0.len < k ? r0.side : opp(r0.side);
        votes.push({
          name: `BLOCK_${k}B${k}S`,
          prediction: pred,
          edge: clamp(0.38 + (k === 2 ? 0.06 : 0.12), 0.35, 0.8),
          patternKey: `${k}B+${k}S`,
          detail: `${k}B+${k}S Symmetry→${pred}`,
        });
        break;
      }
    }
    // 1+3 / 3+1 Triangle asymmetric pattern
    if ((r1.len === 3 && r2.len === 1 && r0.len <= 3) || (r1.len === 1 && r2.len === 3 && r0.len <= 3)) {
      const targetLen = r2.len;
      const pred = r0.len < targetLen ? r0.side : opp(r0.side);
      votes.push({
        name: 'TRIANGLE_1_3',
        prediction: pred,
        edge: 0.42,
        patternKey: `TRIANGLE:${r2.len}+${r1.len}`,
        detail: `${r2.len}+${r1.len} Triangle→${pred}`,
      });
    }
  }

  // 4. MIRROR & PALINDROME Detector
  for (const half of [5, 4, 3]) {
    if (chrono.length >= half * 2 + 1) {
      const right = chrono.slice(-half);
      const left = chrono.slice(-(half * 2), -half);
      const reversedLeft = [...left].reverse();
      if (right.join('') === reversedLeft.join('')) {
        const mirrorSource = chrono[chrono.length - half * 2 - 1];
        const pred: DarksideSize = mirrorSource === 'B' ? 'BIG' : 'SMALL';
        votes.push({
          name: 'PALINDROME_MIRROR',
          prediction: pred,
          edge: clamp(0.3 + half * 0.06, 0.3, 0.78),
          patternKey: `MIRROR:${half}x2`,
          detail: `Mirror/Palindrome(${half})→${pred}`,
        });
        break;
      }
    }
  }

  // 5. CYCLE_k (p = 2..10) over newest draws
  for (let p = 2; p <= 10; p++) {
    if (chars.length < p * 2 + 1) continue;
    let matches = 0;
    for (let i = 0; i < p; i++) {
      if (chars[i] === chars[i + p]) matches++;
    }
    const purity = matches / p;
    if (purity >= 0.86) {
      const pred: DarksideSize = chars[p - 1] === 'B' ? 'BIG' : 'SMALL';
      votes.push({
        name: `CYCLE_${p}`,
        prediction: pred,
        edge: clamp(0.28 + purity * 0.35, 0.28, 0.78),
        patternKey: `CYCLE:${p}`,
        detail: `Cycle-${p} (${Math.round(purity * 100)}%)→${pred}`,
      });
      break;
    }
  }

  // 6. WAVE Pattern (alternating 2-3 blocks)
  if (runs.length >= 4 && runs.slice(1, 4).every((r) => r.len >= 2 && r.len <= 3)) {
    const r0 = runs[0];
    const avgBlock = Math.round((runs[1].len + runs[2].len + runs[3].len) / 3);
    const pred = r0.len < avgBlock ? r0.side : opp(r0.side);
    votes.push({
      name: 'WAVE_HARMONIC',
      prediction: pred,
      edge: 0.36,
      patternKey: `WAVE:${avgBlock}`,
      detail: `Wave(${avgBlock})→${pred}`,
    });
  }

  return votes;
}

// ============================================================
// 6. ANSH CORE & HIMANSHU V25 & TREND VOTE ENGINE (CUSTOM MAPPING)
// ============================================================
const ANSH_MATRIX: Record<number, Record<number, 'B' | 'S'>> = {
  0: { 0: 'S', 1: 'B', 2: 'B', 3: 'B', 4: 'S', 5: 'S', 6: 'B', 7: 'S', 8: 'S', 9: 'B' },
  1: { 0: 'B', 1: 'B', 2: 'B', 3: 'S', 4: 'S', 5: 'S', 6: 'B', 7: 'S', 8: 'B', 9: 'B' },
  2: { 0: 'S', 1: 'B', 2: 'B', 3: 'B', 4: 'S', 5: 'B', 6: 'S', 7: 'B', 8: 'S', 9: 'S' },
  3: { 0: 'S', 1: 'B', 2: 'B', 3: 'S', 4: 'B', 5: 'S', 6: 'B', 7: 'B', 8: 'S', 9: 'S' },
  4: { 0: 'B', 1: 'S', 2: 'S', 3: 'B', 4: 'S', 5: 'B', 6: 'S', 7: 'B', 8: 'B', 9: 'S' },
  5: { 0: 'S', 1: 'B', 2: 'B', 3: 'S', 4: 'S', 5: 'B', 6: 'B', 7: 'S', 8: 'B', 9: 'B' },
  6: { 0: 'S', 1: 'S', 2: 'S', 3: 'B', 4: 'S', 5: 'B', 6: 'B', 7: 'S', 8: 'B', 9: 'B' },
  7: { 0: 'B', 1: 'B', 2: 'B', 3: 'S', 4: 'B', 5: 'S', 6: 'B', 7: 'S', 8: 'B', 9: 'S' },
  8: { 0: 'S', 1: 'B', 2: 'B', 3: 'B', 4: 'S', 5: 'S', 6: 'B', 7: 'S', 8: 'B', 9: 'B' },
  9: { 0: 'S', 1: 'B', 2: 'B', 3: 'S', 4: 'B', 5: 'S', 6: 'S', 7: 'S', 8: 'B', 9: 'B' },
};

const ANSH_SEQUENCE_DB: readonly number[] = [
  2, 1, 2, 0, 5, 5, 5, 6, 0, 7, 1, 2, 6, 1, 9, 7, 6, 5, 0, 0, 0, 8, 4, 5, 2, 4, 3, 9, 4, 9, 4, 1,
  2, 3, 4, 4, 2, 6, 1, 2, 9, 6, 1, 9, 2, 8, 9, 1, 8, 7, 2, 9, 5, 9, 5, 6, 3, 0, 6, 8, 2, 9, 3, 8,
  6, 8, 5, 0, 6, 8, 6, 9, 8, 5, 3, 1, 4, 4, 9, 8, 9, 1, 4, 8, 3, 4, 3, 5, 2, 1, 3, 3, 2, 3, 6, 8,
  2, 9, 4, 5, 6, 8, 1, 4, 2, 9, 0, 6, 5, 5, 9, 3, 5, 7, 7, 3, 0, 8, 1, 5, 8, 5, 9, 9, 4, 7, 7, 1,
  3, 3, 6, 3, 1, 6, 0, 2, 5, 4, 8, 2, 3, 0, 7, 3, 1, 0, 6, 0, 9, 7, 1, 3, 8, 0, 6, 9, 3, 2, 0, 4,
  5, 3, 2, 4, 0, 8, 6, 3, 5, 3, 8, 5, 3, 6, 3, 2, 8, 8, 0, 5, 4, 2, 4, 6, 3, 4, 4, 6, 5, 5, 0, 5,
  1, 3, 6, 9, 7, 0, 2, 9, 5, 5, 0, 9, 4, 1, 0, 5, 1, 9, 3, 5, 4, 7, 1, 5, 5, 5, 3, 9, 9, 7, 8, 9,
  7, 3, 7, 1, 5, 2, 0, 1, 6, 7, 6, 1, 1, 1, 0, 3, 1, 1, 0, 1, 0, 6, 1, 8, 1, 6, 2, 1, 0, 3, 3, 8,
  7, 4, 7, 3, 2, 5, 5, 0, 6, 9, 5, 1, 3, 3, 0, 0, 3, 4, 6, 6, 8, 6, 8, 4, 2, 5, 4, 4, 9, 1, 7, 7,
  8, 6, 0, 3, 0, 6, 4, 1, 3, 2, 4, 3, 3, 7, 4, 9, 5, 5, 9, 5, 8, 9, 2, 1, 0, 1, 9, 2, 3, 0, 2, 2,
  5, 1, 5, 8, 7, 5, 0, 8, 3, 5, 4, 1, 5, 0, 2, 9, 2, 4, 0, 8, 2, 1, 2, 3, 3, 6, 4, 1, 9, 8,
];

function anshNum(item: unknown): number {
  if (item == null) return -1;
  if (typeof item === 'number') return Number.isInteger(item) ? item : -1;
  const o = item as Record<string, unknown>;
  const raw =
    o.number ??
    o.openCode ??
    o.winNumber ??
    (typeof o.color === 'string' ? o.color.replace(/\D/g, '') : undefined) ??
    '-1';
  const parsed = parseInt(String(raw), 10);
  return Number.isNaN(parsed) ? -1 : parsed;
}

function anshIssue(item: unknown): string {
  if (!item || typeof item !== 'object') return '';
  const o = item as Record<string, unknown>;
  return String(o.issueNumber ?? o.issue ?? o.periodNumber ?? '');
}

function anshHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h) % 10;
}

function anshMatrix(list: ReadonlyArray<unknown>): { pred: DarksideSize; conf: number } {
  if (!list || list.length < 2) return { pred: 'BIG', conf: 50 };
  const n0 = anshNum(list[0]);
  const n1 = anshNum(list[1]);
  if (n0 < 0 || n1 < 0 || n0 > 9 || n1 > 9) return { pred: 'BIG', conf: 52 };
  const cell = ANSH_MATRIX[n0]?.[n1];
  return cell
    ? { pred: cell === 'B' ? 'BIG' : 'SMALL', conf: 68 + anshHash(String(anshIssue(list[0]))) }
    : { pred: 'BIG', conf: 52 };
}

function anshStreak(list: ReadonlyArray<unknown>): { pred: DarksideSize; conf: number } {
  if (!list || list.length < 3) return { pred: 'BIG', conf: 50 };
  const sides = list.slice(0, 8).map((x) => (sizeOf(anshNum(x)) === 'BIG' ? 'B' : 'S'));
  const first = sides[0];
  let run = 1;
  for (let i = 1; i < sides.length && sides[i] === first; i++) run++;
  return run >= 3
    ? { pred: first === 'B' ? 'SMALL' : 'BIG', conf: 62 + Math.min(run * 4, 20) }
    : { pred: first === 'B' ? 'BIG' : 'SMALL', conf: 56 + run * 3 };
}

function anshFrequency(list: ReadonlyArray<unknown>): { pred: DarksideSize; conf: number } {
  if (!list || list.length < 5) return { pred: 'BIG', conf: 55 };
  const sample = list.slice(0, 10);
  let bigs = 0;
  let smalls = 0;
  sample.forEach((x) => {
    if (sizeOf(anshNum(x)) === 'BIG') bigs++;
    else smalls++;
  });
  if (bigs >= 7) return { pred: 'SMALL', conf: 60 + bigs * 2 };
  if (smalls >= 7) return { pred: 'BIG', conf: 60 + smalls * 2 };
  return { pred: bigs >= smalls ? 'BIG' : 'SMALL', conf: 54 + Math.abs(bigs - smalls) * 3 };
}

function anshPeriod(periodStr: string): { pred: DarksideSize; conf: number } {
  if (!periodStr) return { pred: 'BIG', conf: 50 };
  const last2 = parseInt(periodStr.slice(-2), 10) || 0;
  const last1 = parseInt(periodStr.slice(-1), 10) || 0;
  if (last2 % 7 < 4) return { pred: 'BIG', conf: 54 };
  if (last2 % 7 >= 4) return { pred: 'SMALL', conf: 54 };
  return { pred: sizeOf(last1), conf: 52 };
}

function anshEnsemble(
  list: ReadonlyArray<unknown>,
  periodStr: string
): { prediction: DarksideSize; confidence: number } {
  const m = anshMatrix(list);
  const st = anshStreak(list);
  const f = anshFrequency(list);
  const p = anshPeriod(periodStr);
  const votes = [
    { pred: m.pred, weight: 3, conf: m.conf },
    { pred: st.pred, weight: 2.5, conf: st.conf },
    { pred: f.pred, weight: 2, conf: f.conf },
    { pred: p.pred, weight: 1.0, conf: p.conf },
  ];
  let bigWeight = 0;
  let smallWeight = 0;
  let totalWeight = 0;
  votes.forEach((v) => {
    const score = v.weight * (v.conf / 100);
    if (v.pred === 'BIG') bigWeight += score;
    else smallWeight += score;
    totalWeight += v.weight;
  });
  const prediction: DarksideSize = bigWeight >= smallWeight ? 'BIG' : 'SMALL';
  const rawConf = (Math.max(bigWeight, smallWeight) / totalWeight) * 100;
  return {
    prediction,
    confidence: Math.round(clamp(rawConf, 55, 86)),
  };
}

function anshSampleNumbers(list: ReadonlyArray<unknown>): string {
  if (!list || list.length === 0) return '3 & 8';
  const seq: number[] = [];
  for (let i = 0; i < Math.min(5, list.length); i++) {
    const d = anshNum(list[i]);
    if (d >= 0 && d <= 9) seq.push(d);
  }
  seq.reverse();
  const counts: Record<number, number> = {};
  let matched = false;
  for (let len = seq.length; len >= 1; len--) {
    const sub = seq.slice(seq.length - len);
    for (let i = 0; i <= ANSH_SEQUENCE_DB.length - len - 1; i++) {
      let ok = true;
      for (let j = 0; j < len; j++) {
        if (ANSH_SEQUENCE_DB[i + j] !== sub[j]) {
          ok = false;
          break;
        }
      }
      if (ok) {
        matched = true;
        const nextVal = ANSH_SEQUENCE_DB[i + len];
        counts[nextVal] = (counts[nextVal] || 0) + 1;
      }
    }
    if (matched) break;
  }

  let bestBig = -1;
  let bestBigCount = -1;
  let bestSmall = -1;
  let bestSmallCount = -1;
  if (matched) {
    for (const k of Object.keys(counts)) {
      const num = Number(k);
      const cnt = counts[num];
      if (sizeOf(num) === 'BIG') {
        if (cnt > bestBigCount) {
          bestBigCount = cnt;
          bestBig = num;
        }
      } else {
        if (cnt > bestSmallCount) {
          bestSmallCount = cnt;
          bestSmall = num;
        }
      }
    }
  }
  if (bestBig === -1) bestBig = CUSTOM_BIG_DIGITS[(seq[seq.length - 1] ?? 0) % CUSTOM_BIG_DIGITS.length];
  if (bestSmall === -1) bestSmall = CUSTOM_SMALL_DIGITS[(seq[seq.length - 1] ?? 0) % CUSTOM_SMALL_DIGITS.length];
  return `${bestBig} & ${bestSmall}`;
}

function anshNextPeriod(periodStr: string): string {
  try {
    const s = String(periodStr);
    const match = s.match(/^(\D*)(\d+)$/);
    if (!match) {
      const digits = s.replace(/\D/g, '');
      if (!digits) return s;
      return (BigInt(digits) + 1n).toString();
    }
    const prefix = match[1];
    const numPart = match[2];
    return prefix + (BigInt(numPart) + 1n).toString().padStart(numPart.length, '0');
  } catch {
    return periodStr;
  }
}

function anshSignalLevel(score: number): 'ELITE' | 'STRONG' | 'MEDIUM' | 'LOW' {
  if (score >= 82) return 'ELITE';
  if (score >= 72) return 'STRONG';
  if (score >= 62) return 'MEDIUM';
  return 'LOW';
}

export const AnshCore = {
  MATRIX: ANSH_MATRIX,
  SEQUENCE_DB: ANSH_SEQUENCE_DB,
  num: anshNum,
  issue: anshIssue,
  hash: anshHash,
  matrix: anshMatrix,
  streak: anshStreak,
  frequency: anshFrequency,
  period: anshPeriod,
  ensemble: anshEnsemble,
  sampleNumbers: anshSampleNumbers,
  nextPeriod: anshNextPeriod,
  signalLevel: anshSignalLevel,
  analyze(list: ReadonlyArray<unknown>, targetPeriod: string): AnshCoreAnalysis | null {
    const recent = Array.isArray(list) ? list.slice(0, 30) : [];
    if (!recent.length) return null;
    const periodStr = String(targetPeriod ?? '');
    const m = anshMatrix(recent);
    const st = anshStreak(recent);
    const f = anshFrequency(recent);
    const p = anshPeriod(periodStr);
    const { prediction, confidence } = anshEnsemble(recent, periodStr);
    const sampleNumbers = anshSampleNumbers(recent);
    const nums = (sampleNumbers.match(/\d+/g) || []).map(Number);
    return {
      prediction,
      confidence,
      signalLevel: anshSignalLevel(confidence),
      sampleNumbers,
      bigNum: nums[0] ?? 5,
      smallNum: nums[1] ?? 1,
      period: periodStr,
      engines: [
        { name: 'MATRIX', prediction: m.pred, confidence: m.conf, weight: 3 },
        { name: 'STREAK', prediction: st.pred, confidence: st.conf, weight: 2.5 },
        { name: 'FREQUENCY', prediction: f.pred, confidence: f.conf, weight: 2 },
        { name: 'PERIOD', prediction: p.pred, confidence: p.conf, weight: 1 },
      ],
    };
  },
};

export function runOuterUltraPatternEngine(
  history: ReadonlyArray<{ number: number }>
): UltraSignalResult {
  const h = Array.isArray(history) ? history.slice(0, 40) : [];
  if (h.length < 8) {
    return {
      prediction: null,
      alignment: null,
      power: 0,
      streak: 0,
      volatility: 0,
      description: 'NEED 8 DRAWS',
      signals: [],
    };
  }
  const side = (x: { number: number }): DarksideSize => sizeOf(x.number);
  const newest = h.map(side);
  let streak = 1;
  while (streak < Math.min(h.length, 15) && newest[streak] === newest[0]) streak++;

  const signals: Array<{ name: string; prediction: DarksideSize; confidence: number; weight: number }> = [];
  const add = (name: string, prediction: DarksideSize, confidence: number, weight: number) =>
    signals.push({ name, prediction, confidence: clamp(confidence, 0, 88), weight });

  const altSample = Math.min(h.length - 1, 10);
  const altRatio = altSample
    ? newest.slice(0, altSample).filter((x, i) => x !== newest[i + 1]).length / altSample
    : 0;
  if (altRatio > 0.65) {
    add('ALT', newest[0] === 'BIG' ? 'SMALL' : 'BIG', altRatio * 90, 1);
  }

  {
    const q = AnshCore.frequency(h);
    add('ANSH-FREQ10', q.pred, q.conf, 1.1);
  }

  for (const n of [20]) {
    const sample = h.slice(0, Math.min(n, h.length));
    if (sample.length < 5) continue;
    const pct = (sample.filter((x) => side(x) === 'BIG').length / sample.length) * 100;
    if (pct >= 70) add(`MR${n}`, 'SMALL', Math.min(84, 58 + (pct - 70) * 1.4), 0.9);
    else if (pct <= 30) add(`MR${n}`, 'BIG', Math.min(84, 58 + (30 - pct) * 1.4), 0.9);
  }

  if (h.length >= 6) {
    const weights = [6, 5, 4, 3, 2, 1];
    const wma =
      h.slice(0, 6).reduce((sum, x, i) => sum + (side(x) === 'BIG' ? 1 : 0) * weights[i], 0) / 21;
    const conf = Math.abs(wma - 0.5) * 90;
    if (wma > 0.58) add('TREND', 'BIG', Math.min(80, 55 + conf), 0.8);
    else if (wma < 0.42) add('TREND', 'SMALL', Math.min(80, 55 + conf), 0.8);

    let maxCluster = 1;
    let run = 1;
    for (let i = 1; i < Math.min(h.length, 15); i++) {
      if (side(h[i]) === side(h[i - 1])) {
        run++;
        maxCluster = Math.max(run, maxCluster);
      } else {
        run = 1;
      }
    }
    if (maxCluster >= 4) {
      add('CLUSTER', newest[0] === 'BIG' ? 'SMALL' : 'BIG', Math.min(84, 54 + maxCluster * 6), 1);
    }
  }

  {
    const q = AnshCore.streak(h);
    add('ANSH-STREAK', q.pred, q.conf, 1.2);
  }

  if (!signals.length) {
    const sample = h.slice(0, 15);
    const pct = sample.filter((x) => side(x) === 'BIG').length / sample.length;
    add('STAT', pct > 0.5 ? 'BIG' : 'SMALL', 50 + Math.abs(pct - 0.5) * 30, 0.5);
  }

  let big = 0;
  let small = 0;
  signals.forEach((x) => {
    const w = (x.weight * x.confidence) / 100;
    if (x.prediction === 'BIG') big += w;
    else small += w;
  });

  const total = big + small;
  const prediction: DarksideSize = big > small ? 'BIG' : 'SMALL';
  const alignment = total
    ? Math.min(88, Math.max(51, Math.round((Math.max(big, small) / total) * 100)))
    : null;
  const power = Math.min(90, 45 + signals.length * 7 + ((alignment ?? 50) - 50) * 0.3);

  return {
    prediction,
    alignment,
    power: Math.round(power),
    streak,
    volatility:
      h.length > 1
        ? newest.slice(0, Math.min(h.length - 1, 12)).filter((x, i) => x !== newest[i + 1]).length /
          Math.min(h.length - 1, 12)
        : 0,
    description: `${[...new Set(signals.map((x) => x.name))].slice(0, 3).join(' + ')}`,
    strategyCount: signals.length,
    signals,
  };
}

function himanshuRunUltraPatternEngine(history: ReadonlyArray<{ number: number }>): UltraSignalResult {
  const h = Array.isArray(history) ? history.slice(0, 40) : [];
  if (h.length < 8) {
    return {
      prediction: null,
      alignment: null,
      power: 0,
      streak: 0,
      volatility: 0,
      description: 'NEED 8 DRAWS',
    };
  }
  const side = (x: { number: number }): DarksideSize => sizeOf(x.number);
  const newest = h.map(side);
  let streak = 1;
  while (streak < Math.min(h.length, 15) && newest[streak] === newest[0]) streak++;
  const predictions: Array<{ name: string; prediction: DarksideSize; confidence: number; weight: number }> = [];
  const add = (name: string, prediction: DarksideSize, confidence: number, weight: number) =>
    predictions.push({ name, prediction, confidence: clamp(confidence, 0, 88), weight });

  const altSample = Math.min(h.length - 1, 10);
  const altRatio = altSample
    ? newest.slice(0, altSample).filter((x, i) => x !== newest[i + 1]).length / altSample
    : 0;
  if (altRatio > 0.65) add('ALT', newest[0] === 'BIG' ? 'SMALL' : 'BIG', altRatio * 90, 1);

  for (const n of [10, 20]) {
    const sample = h.slice(0, Math.min(n, h.length));
    if (sample.length < 5) continue;
    const pct = (sample.filter((x) => side(x) === 'BIG').length / sample.length) * 100;
    if (pct >= 70) {
      add(`MR${n}`, 'SMALL', Math.min(84, 58 + (pct - 70) * 1.4), n === 10 ? 1.1 : 0.9);
    } else if (pct <= 30) {
      add(`MR${n}`, 'BIG', Math.min(84, 58 + (30 - pct) * 1.4), n === 10 ? 1.1 : 0.9);
    }
  }

  if (h.length >= 6) {
    const weights = [6, 5, 4, 3, 2, 1];
    const wma =
      h.slice(0, 6).reduce((sum, x, i) => sum + (side(x) === 'BIG' ? 1 : 0) * weights[i], 0) / 21;
    const conf = Math.abs(wma - 0.5) * 90;
    if (wma > 0.58) add('TREND', 'BIG', Math.min(80, 55 + conf), 0.8);
    else if (wma < 0.42) add('TREND', 'SMALL', Math.min(80, 55 + conf), 0.8);

    let maxCluster = 1;
    let run = 1;
    for (let i = 1; i < Math.min(h.length, 15); i++) {
      if (side(h[i]) === side(h[i - 1])) {
        run++;
        maxCluster = Math.max(run, maxCluster);
      } else run = 1;
    }
    if (maxCluster >= 4) {
      add('CLUSTER', newest[0] === 'BIG' ? 'SMALL' : 'BIG', Math.min(84, 54 + maxCluster * 6), 1);
    }
  }

  if (streak >= 3) {
    add('STREAK', newest[0] === 'BIG' ? 'SMALL' : 'BIG', Math.min(82, 54 + streak * 6), 1.2);
  }

  if (!predictions.length) {
    const sample = h.slice(0, 15);
    const pct = sample.filter((x) => side(x) === 'BIG').length / sample.length;
    add('STAT', pct > 0.5 ? 'BIG' : 'SMALL', 50 + Math.abs(pct - 0.5) * 30, 0.5);
  }

  let big = 0;
  let small = 0;
  predictions.forEach((x) => {
    const w = (x.weight * x.confidence) / 100;
    if (x.prediction === 'BIG') big += w;
    else small += w;
  });
  const total = big + small;
  const prediction: DarksideSize = big > small ? 'BIG' : 'SMALL';
  const alignment = total
    ? Math.min(88, Math.max(51, Math.round((Math.max(big, small) / total) * 100)))
    : null;
  const power = Math.min(90, 45 + predictions.length * 7 + ((alignment ?? 50) - 50) * 0.3);

  return {
    prediction,
    alignment,
    power: Math.round(power),
    streak,
    volatility:
      h.length > 1
        ? newest.slice(0, Math.min(h.length - 1, 12)).filter((x, i) => x !== newest[i + 1]).length /
          Math.min(h.length - 1, 12)
        : 0,
    description: `${[...new Set(predictions.map((x) => x.name))].slice(0, 3).join(' + ')}`,
    strategyCount: predictions.length,
  };
}

export function selectHistoryNumber(
  pool: ReadonlyArray<number>,
  history: ReadonlyArray<{ number: number }>,
  fibHint?: number
): number {
  const recent = Array.isArray(history) ? history.slice(0, 19) : [];
  let selected = pool[0];
  let bestCount = -1;
  let bestRecentIndex = Infinity;
  pool.forEach((candidate) => {
    const matchingIndexes: number[] = [];
    recent.forEach((item, index) => {
      if (item.number === candidate) matchingIndexes.push(index);
    });
    const count = matchingIndexes.length;
    const recentIndex = count ? matchingIndexes[0] : Infinity;
    const tied = count === bestCount && recentIndex === bestRecentIndex;
    if (
      count > bestCount ||
      (count === bestCount && recentIndex < bestRecentIndex) ||
      (tied && fibHint !== undefined && candidate === fibHint && selected !== fibHint) ||
      (tied && (fibHint === undefined || selected !== fibHint) && candidate < selected)
    ) {
      selected = candidate;
      bestCount = count;
      bestRecentIndex = recentIndex;
    }
  });
  return selected;
}

export function getTargetNums(
  trend: DarksideSize | 'WAIT',
  history: ReadonlyArray<{ number: number }>,
  fibHint?: number
): { n1: number | null; n2: number | null } {
  if (trend === 'WAIT' || !Array.isArray(history) || !history.length) return { n1: null, n2: null };
  const same = trend === 'BIG' ? CUSTOM_BIG_DIGITS : CUSTOM_SMALL_DIGITS;
  const opposite = trend === 'BIG' ? CUSTOM_SMALL_DIGITS : CUSTOM_BIG_DIGITS;
  const n1 = selectHistoryNumber(same, history, fibHint);
  return {
    n1,
    n2: selectHistoryNumber(opposite, history, oppositeDigit(n1)),
  };
}

const HimanshuTrendVoteEngine = {
  scanRecords: 30,
  patternCandidateCount: 29,
  voteNames: [
    'LAST 5 MAJORITY',
    'LAST 10 MAJORITY',
    'WEIGHTED LAST 5',
    'LAST 3 MAJORITY',
    'RUN CONTINUATION',
  ] as const,
  evaluators: [
    (hist: ReadonlyArray<{ number: number }>): DarksideSize => {
      const recent = hist.slice(0, 5);
      const bigs = recent.filter((x) => sizeOf(x.number) === 'BIG').length;
      return bigs >= Math.ceil(recent.length / 2) ? 'BIG' : 'SMALL';
    },
    (hist: ReadonlyArray<{ number: number }>): DarksideSize => {
      const recent = hist.slice(0, 10);
      const bigs = recent.filter((x) => sizeOf(x.number) === 'BIG').length;
      return bigs >= Math.ceil(recent.length / 2) ? 'BIG' : 'SMALL';
    },
    (hist: ReadonlyArray<{ number: number }>): DarksideSize => {
      const recent = hist.slice(0, 5);
      const score = recent.reduce(
        (sum, item, index) => sum + (sizeOf(item.number) === 'BIG' ? 1 : -1) * (5 - index),
        0
      );
      return score === 0 ? sizeOf(hist[0].number) : score > 0 ? 'BIG' : 'SMALL';
    },
    (hist: ReadonlyArray<{ number: number }>): DarksideSize => {
      const run = hist.slice(0, 3).filter((x) => sizeOf(x.number) === 'BIG').length;
      return run >= 2 ? 'BIG' : 'SMALL';
    },
    (hist: ReadonlyArray<{ number: number }>): DarksideSize => {
      const recent = hist.slice(0, 10);
      const latestSide: DarksideSize = sizeOf(recent[0].number);
      let run = 1;
      while (run < recent.length && sizeOf(recent[run].number) === latestSide) run++;
      const bigs = recent.filter((item) => sizeOf(item.number) === 'BIG').length;
      const smalls = recent.length - bigs;
      if (run >= 3) return latestSide;
      if (bigs === smalls) return latestSide;
      return bigs > smalls ? 'BIG' : 'SMALL';
    },
  ],
  tailRunLength(sizes: ReadonlyArray<DarksideSize>): number {
    if (!sizes.length) return 0;
    const latest = sizes[0];
    let run = 0;
    for (let i = 0; i < sizes.length && sizes[i] === latest; i++) run++;
    return run;
  },
  detectStreakGap(sizes: ReadonlyArray<DarksideSize>, minStreak: number): DarksideSize | null {
    if (sizes.length < minStreak + 2) return null;
    const suffix = sizes.slice(-(minStreak + 2));
    const head = suffix[0];
    const opposite: DarksideSize = head === 'BIG' ? 'SMALL' : 'BIG';
    return suffix.slice(0, minStreak).every((v) => v === head) &&
      suffix[minStreak] === opposite &&
      suffix[minStreak + 1] === head
      ? head
      : null;
  },
  detectStaircase(numbers: ReadonlyArray<number>): DarksideSize | null {
    if (numbers.length < 3) return null;
    for (let length = numbers.length; length >= 3; length--) {
      const suffix = numbers.slice(-length);
      const direction = suffix[1] - suffix[0];
      if (direction !== 1 && direction !== -1) continue;
      const valid = suffix.every((value, index) => index === 0 || value - suffix[index - 1] === direction);
      const nextNumber = suffix[suffix.length - 1] + direction;
      if (valid && nextNumber >= 0 && nextNumber <= 9) {
        return sizeOf(nextNumber);
      }
    }
    return null;
  },
  detectAlternatingTrend(history: ReadonlyArray<{ number: number }>): DarksideSize | null {
    if (history.length < 4) return null;
    const sizes = history.slice(0, 6).map((item) => sizeOf(item.number));
    let length = 1;
    for (let i = 1; i < sizes.length; i++) {
      if (sizes[i] !== sizes[i - 1]) length++;
      else break;
    }
    return length >= 4 ? (sizes[0] === 'BIG' ? 'SMALL' : 'BIG') : null;
  },
  getRunTransitionStats(history: ReadonlyArray<{ number: number }>): RunTransitionStats {
    const newest = (Array.isArray(history) ? history : [])
      .slice(0, 120)
      .map((item) => sizeOf(item.number));
    if (newest.length < 4) {
      return { context: null, big: 0, small: 0, samples: 0, side: null, rate: 0 };
    }
    const latest = newest[0];
    let run = 1;
    while (run < newest.length && newest[run] === latest) run++;
    const ctxLen = Math.min(2, newest.length - 1);
    const context = newest
      .slice(0, ctxLen)
      .reverse()
      .map((s) => (s === 'BIG' ? 'B' : 'S'))
      .join('');
    let big = 0;
    let small = 0;
    for (let i = 1; i <= newest.length - ctxLen; i++) {
      let ok = true;
      for (let j = 0; j < ctxLen; j++) {
        if (newest[i + j] !== newest[j]) {
          ok = false;
          break;
        }
      }
      if (ok) {
        if (newest[i - 1] === 'BIG') big++;
        else small++;
      }
    }
    const samples = big + small;
    const dominantCount = Math.max(big, small);
    const side: DarksideSize | null =
      run < 3 && samples >= 2 && big !== small ? (big > small ? 'BIG' : 'SMALL') : null;
    return {
      context,
      big,
      small,
      samples,
      side,
      rate: samples ? Math.round((dominantCount / samples) * 100) : 0,
    };
  },
  detectLivePattern(history: ReadonlyArray<{ number: number }>): LivePatternInfo {
    const newest = (Array.isArray(history) ? history : [])
      .slice(0, 40)
      .map((item) => sizeOf(item.number));
    if (!newest.length) {
      return {
        type: null,
        length: 0,
        nextSide: null,
        dragonLength: 0,
        zigzagLength: 0,
        doubleLength: 0,
        breakRunLength: 0,
      };
    }

    const latest = newest[0];
    let dragonLength = 1;
    while (dragonLength < newest.length && newest[dragonLength] === latest) dragonLength++;

    let zigzagLength = 1;
    while (zigzagLength < newest.length && newest[zigzagLength] !== newest[zigzagLength - 1]) {
      zigzagLength++;
    }

    let doubleLength = 0;
    let doubleNextSide: DarksideSize | null = null;
    if (newest.length >= 8) {
      const startEven = newest[0] === newest[1];
      let validDouble = true;
      const offset = startEven ? 0 : 1;
      for (let i = offset; i + 1 < Math.min(newest.length, 10); i += 2) {
        const pairA = newest[i];
        const pairB = newest[i + 1];
        const prevPair = i > offset ? newest[i - 1] : null;
        if (pairA === pairB && (prevPair === null || pairA !== prevPair)) {
          doubleLength = i + 2;
        } else {
          validDouble = false;
          break;
        }
      }
      if (doubleLength >= 8) {
        doubleNextSide =
          validDouble || startEven
            ? latest === 'BIG'
              ? 'SMALL'
              : 'BIG'
            : latest;
      }
    }

    let previousStreakLength = 0;
    if (dragonLength < newest.length) {
      const opposite = newest[dragonLength];
      while (
        dragonLength + previousStreakLength < newest.length &&
        newest[dragonLength + previousStreakLength] === opposite
      ) {
        previousStreakLength++;
      }
    }

    if (dragonLength <= 2 && previousStreakLength >= 5) {
      return {
        type: 'STREAK BREAK',
        length: previousStreakLength + dragonLength,
        nextSide: dragonLength === 1 ? latest : latest === 'BIG' ? 'SMALL' : 'BIG',
        dragonLength,
        zigzagLength,
        doubleLength,
        breakRunLength: previousStreakLength,
      };
    }
    if (dragonLength >= 5) {
      return {
        type: 'DRAGON',
        length: dragonLength,
        nextSide: latest === 'BIG' ? 'SMALL' : 'BIG',
        dragonLength,
        zigzagLength,
        doubleLength,
        breakRunLength: 0,
      };
    }
    if (zigzagLength >= 5) {
      return {
        type: 'ZIG-ZAG / MIRROR 1:1',
        length: zigzagLength,
        nextSide: latest === 'BIG' ? 'SMALL' : 'BIG',
        dragonLength,
        zigzagLength,
        doubleLength,
        breakRunLength: 0,
      };
    }
    if (doubleLength >= 8) {
      return {
        type: 'DOUBLE 2:2',
        length: doubleLength,
        nextSide: doubleNextSide,
        dragonLength,
        zigzagLength,
        doubleLength,
        breakRunLength: 0,
      };
    }
    return {
      type: null,
      length: 0,
      nextSide: null,
      dragonLength,
      zigzagLength,
      doubleLength,
      breakRunLength: 0,
    };
  },
  scanPatterns(numbers: ReadonlyArray<number>, sizes: ReadonlyArray<DarksideSize>) {
    const candidates: Array<{ type: string; matched: boolean }> = [];
    for (let length = 2; length <= this.scanRecords; length++) {
      const suffixSizes = sizes.slice(-length);
      candidates.push({
        type: `REPEAT_${length}`,
        matched: suffixSizes.length === length && suffixSizes.every((s) => s === suffixSizes[0]),
      });
    }
    for (let length = 2; length <= this.scanRecords; length++) {
      for (const direction of [1, -1] as const) {
        const suffix = numbers.slice(-length);
        candidates.push({
          type: `STAIRCASE_${direction === 1 ? 'UP' : 'DOWN'}_${length}`,
          matched:
            suffix.length === length &&
            suffix.every((value, index) => index === 0 || value - suffix[index - 1] === direction),
        });
      }
    }
    for (const minStreak of [2, 3]) {
      candidates.push({
        type: `STREAK_${minStreak}_PLUS_GAP`,
        matched: Boolean(this.detectStreakGap(sizes, minStreak)),
      });
    }
    return candidates;
  },
  analyze(history: ReadonlyArray<{ number: number }>) {
    const memory = Array.isArray(history) ? history : [];
    const livePattern = this.detectLivePattern(memory);
    const transitionStats = this.getRunTransitionStats(memory);
    if (memory.length < 5) {
      return {
        prediction: 'WAIT' as const,
        patternName: 'NEED AT LEAST 5 VALID DRAWS',
        strategy: 'RECENT HEURISTICS + PATTERN SCAN',
        voteShare: 0,
        patternMatches: 0,
        patternScanned: this.patternCandidateCount,
        bigWeight: 0,
        smallWeight: 0,
        alternatingOverride: false,
        transitionOverride: null as DarksideSize | null,
        transitionStats,
        livePattern,
        ultraSignal: null as UltraSignalResult | null,
        voteBreakdown: [] as Array<{ name: string; side: DarksideSize | 'WAIT' }>,
        historyCount: memory.length,
      };
    }

    const recent = memory.slice(0, this.scanRecords);
    const chronological = recent.slice().reverse();
    const sizes: DarksideSize[] = chronological.map((item) => sizeOf(item.number));
    const numbers = chronological.map((item) => item.number);
    const mixed = new Set(sizes).size > 1;
    const latestSize: DarksideSize = sizeOf(memory[0].number);
    const latestRun = this.tailRunLength(memory.map((item): DarksideSize => sizeOf(item.number)));
    const ultraSignal = himanshuRunUltraPatternEngine(memory);
    const scan = this.scanPatterns(numbers, sizes);
    const patternMatches = scan.filter((item) => item.matched).length;

    let bigWeight = 0;
    let smallWeight = 0;
    const baseVotes = this.evaluators.map((fn) => fn(memory));
    baseVotes.forEach((side) => {
      if (side === 'BIG') bigWeight++;
      else if (side === 'SMALL') smallWeight++;
    });

    const addWeightedVote = (side: DarksideSize | null, weight: number) => {
      if (side === 'BIG') bigWeight += weight;
      if (side === 'SMALL') smallWeight += weight;
    };

    const staircaseSide = this.detectStaircase(numbers);
    const gap2Side = this.detectStreakGap(sizes, 2);
    const gap3Side = this.detectStreakGap(sizes, 3);
    const alternatingSide = this.detectAlternatingTrend(memory);

    [
      { side: mixed && latestRun >= 3 ? latestSize : null, weight: 3 },
      { side: gap2Side, weight: 2 },
      { side: mixed && latestRun >= 4 ? latestSize : null, weight: 2 },
      { side: mixed && latestRun >= 3 ? latestSize : null, weight: 1 },
      { side: mixed ? staircaseSide : null, weight: 1 },
      { side: gap3Side, weight: 1 },
      { side: mixed && latestRun >= 2 ? latestSize : null, weight: 1 },
      { side: mixed && latestRun >= 2 ? latestSize : null, weight: 1 },
    ].forEach((rule) => addWeightedVote(rule.side, rule.weight));
    if (ultraSignal.prediction) {
      addWeightedVote(ultraSignal.prediction, (2 * (ultraSignal.alignment || 50)) / 100);
    }

    const totalWeight = bigWeight + smallWeight;
    const votePrediction: DarksideSize | 'WAIT' =
      bigWeight === smallWeight ? 'WAIT' : bigWeight > smallWeight ? 'BIG' : 'SMALL';
    const transitionOverride = transitionStats.side;
    const prediction = alternatingSide || transitionOverride || votePrediction;
    const alignedWeight = prediction === 'BIG' ? bigWeight : prediction === 'SMALL' ? smallWeight : 0;

    return {
      prediction,
      patternName: livePattern.type
        ? `${livePattern.type} (${livePattern.length} Draws)`
        : alternatingSide
        ? `Alternating Run (${bigWeight}B/${smallWeight}S)`
        : transitionOverride
        ? `${transitionStats.context} Transition → ${transitionOverride}`
        : `Weighted Consensus (${bigWeight}B/${smallWeight}S)`,
      strategy: `${livePattern.type || transitionOverride || 'Recency Model'} · ${patternMatches}/${this.patternCandidateCount} Scan`,
      voteShare: totalWeight ? Math.round((alignedWeight / totalWeight) * 100) : 0,
      patternMatches,
      patternScanned: this.patternCandidateCount,
      bigWeight,
      smallWeight,
      alternatingOverride: Boolean(alternatingSide),
      transitionOverride,
      transitionStats,
      livePattern,
      ultraSignal,
      voteBreakdown: [
        ...baseVotes.map((side, index) => ({ name: this.voteNames[index], side })),
        ...(ultraSignal.prediction ? [{ name: 'ULTRA ENSEMBLE', side: ultraSignal.prediction }] : []),
      ],
      historyCount: memory.length,
    };
  },
};

function himanshuHistory(list: ReadonlyArray<unknown>): Array<{ number: number }> {
  return (Array.isArray(list) ? list : [])
    .map((item) => {
      if (typeof item === 'number') return { number: item };
      const o = (item || {}) as Record<string, unknown>;
      const raw = o.number !== undefined ? o.number : o.result !== undefined ? o.result : o.openNumber;
      return { number: parseInt(String(raw), 10) };
    })
    .filter((item) => Number.isInteger(item.number) && item.number >= 0 && item.number <= 9);
}

function generateV25Prediction(rawList: ReadonlyArray<{ number: number }>, targetPeriod: string) {
  const modelAnalysis = HimanshuTrendVoteEngine.analyze(rawList);
  const hasEnoughHistory = Array.isArray(rawList) && rawList.length >= 5;
  const livePattern = modelAnalysis.livePattern;
  const patternDriven = Boolean(livePattern && livePattern.type && livePattern.nextSide);
  const size: DarksideSize | 'WAIT' = !hasEnoughHistory
    ? 'WAIT'
    : patternDriven && livePattern.nextSide
    ? livePattern.nextSide
    : modelAnalysis.prediction;
  const targets = getTargetNums(size, rawList);
  return {
    period: targetPeriod,
    size,
    primary: targets.n1,
    secondary: targets.n2,
    patternName: modelAnalysis.patternName,
    engineData: {
      ...modelAnalysis,
      modelPrediction: modelAnalysis.prediction,
      prediction: size,
      patternDriven,
    },
  };
}

export const HimanshuV25 = {
  runUltraPatternEngine: himanshuRunUltraPatternEngine,
  TrendVoteEngine: HimanshuTrendVoteEngine,
  selectHistoryNumber,
  getTargetNums,
  sizeOf,
  generateV25Prediction,
  history: himanshuHistory,
  level: (consecutiveLosses: number) => ['L0', 'L1', 'L2', 'L3'][Math.min(3, Math.max(0, consecutiveLosses | 0))],
  score: (wins: number, total: number) => Math.round(((wins + 1) / (total + 2)) * 100),
  getPrediction(history: ReadonlyArray<{ number: number }>, targetPeriod: string): HimanshuAnalysisResult | null {
    const validHistory = (history || []).filter(
      (item) => Number.isInteger(item.number) && item.number >= 0 && item.number <= 9
    );
    if (validHistory.length < 5) return null;
    const result = generateV25Prediction(validHistory, targetPeriod);
    if (result.size === 'WAIT' || result.primary === null || result.secondary === null) return null;
    return {
      prediction: result.size,
      jodi: [result.primary, result.secondary],
      analysis: {
        algorithmVotes: result.patternName,
        strategy: result.engineData.strategy,
        confidence: result.engineData.voteShare,
        patternMatches: result.engineData.patternMatches,
        patternScanned: result.engineData.patternScanned,
      },
    };
  },
  analyze(list: ReadonlyArray<unknown>, nextPeriod: string): HimanshuAnalysisResult | null {
    return this.getPrediction(himanshuHistory(list), nextPeriod);
  },
};

export const TrendVoteEngine = {
  scanRecords: 10,
  patternCandidateCount: 29,
  voteNames: HimanshuTrendVoteEngine.voteNames,
  evaluators: HimanshuTrendVoteEngine.evaluators,
  tailRunLength: HimanshuTrendVoteEngine.tailRunLength,
  detectStreakGap: HimanshuTrendVoteEngine.detectStreakGap,
  detectStaircaseInfo(numbers: ReadonlyArray<number>): StaircaseInfo | null {
    if (numbers.length < 3) return null;
    for (let length = numbers.length; length >= 3; length--) {
      const suffix = numbers.slice(-length);
      const direction = suffix[1] - suffix[0];
      if (direction !== 1 && direction !== -1) continue;
      const isStaircase = suffix.every((v, i) => i === 0 || v - suffix[i - 1] === direction);
      const nextNumber = suffix[suffix.length - 1] + direction;
      if (isStaircase && nextNumber >= 0 && nextNumber <= 9) {
        return {
          side: sizeOf(nextNumber),
          direction,
          length,
          nextNumber,
        };
      }
    }
    return null;
  },
  detectStaircase(numbers: ReadonlyArray<number>): DarksideSize | null {
    const info = this.detectStaircaseInfo(numbers);
    return info ? info.side : null;
  },
  getRunTransitionStats: HimanshuTrendVoteEngine.getRunTransitionStats,
  detectLivePattern: HimanshuTrendVoteEngine.detectLivePattern,
  scanPatterns: HimanshuTrendVoteEngine.scanPatterns,
  analyze(
    history: ReadonlyArray<{ number: number }>,
    anshC: AnshCoreAnalysis | null = null,
    himC: HimanshuAnalysisResult | null = null
  ): TrendVoteAnalysis {
    const memory = Array.isArray(history) ? history : [];
    const livePattern = this.detectLivePattern(memory);
    const transitionStats = this.getRunTransitionStats(memory);

    if (memory.length < 5) {
      return {
        prediction: 'WAIT',
        patternName: 'NEED AT LEAST 5 VALID DRAWS',
        strategy: 'RECENT HEURISTICS + PATTERN SCAN',
        voteShare: 0,
        patternMatches: 0,
        patternScanned: this.patternCandidateCount,
        bigWeight: 0,
        smallWeight: 0,
        alternatingOverride: false,
        transitionOverride: null,
        transitionStats,
        livePattern,
        staircaseInfo: null,
        staircaseSide: null,
        gap2Side: null,
        gap3Side: null,
        ultraSignal: null,
        voteBreakdown: [],
        matchedCandidates: [],
        historyCount: memory.length,
        anshCore: anshC,
        himanshu: himC,
      };
    }

    const chronological = memory.slice(0, this.scanRecords).slice().reverse();
    const sizes: DarksideSize[] = chronological.map((item) => sizeOf(item.number));
    const numbers = chronological.map((item) => item.number);
    const mixed = new Set(sizes).size > 1;
    const latestSize: DarksideSize = sizeOf(memory[0].number);
    const latestRun = this.tailRunLength(memory.map((item): DarksideSize => sizeOf(item.number)));
    const ultraSignal = runOuterUltraPatternEngine(memory);
    const matchedCandidates = this.scanPatterns(numbers, sizes)
      .filter((item) => item.matched)
      .map((item) => item.type);
    const patternMatches = matchedCandidates.length;

    let bigWeight = 0;
    let smallWeight = 0;
    const baseVotes = this.evaluators.map((fn) => fn(memory));
    baseVotes.forEach((side) => {
      if (side === 'BIG') bigWeight++;
      else if (side === 'SMALL') smallWeight++;
    });

    const addWeight = (side: DarksideSize | null | undefined, weight: number) => {
      if (side === 'BIG') bigWeight += weight;
      if (side === 'SMALL') smallWeight += weight;
    };

    const staircaseInfo = this.detectStaircaseInfo(numbers);
    const staircaseSide = staircaseInfo ? staircaseInfo.side : null;
    const gap2Side = this.detectStreakGap(sizes, 2);
    const gap3Side = this.detectStreakGap(sizes, 3);
    const alternatingSide: DarksideSize | null =
      livePattern.type === 'ZIG-ZAG / MIRROR 1:1' ? livePattern.nextSide : null;

    [
      { side: mixed && latestRun >= 3 ? latestSize : null, weight: 3 },
      { side: gap2Side, weight: 2 },
      { side: mixed && latestRun >= 4 ? latestSize : null, weight: 2 },
      { side: mixed && latestRun >= 3 ? latestSize : null, weight: 1 },
      { side: mixed ? staircaseSide : null, weight: 1 },
      { side: gap3Side, weight: 1 },
      { side: mixed && latestRun >= 2 ? latestSize : null, weight: 1 },
      { side: mixed && latestRun >= 2 ? latestSize : null, weight: 1 },
    ].forEach((r) => addWeight(r.side, r.weight));

    if (ultraSignal.prediction) addWeight(ultraSignal.prediction, (2 * (ultraSignal.alignment || 50)) / 100);
    if (anshC && anshC.prediction) addWeight(anshC.prediction, (2 * anshC.confidence) / 100);
    if (himC && himC.prediction) addWeight(himC.prediction, (2 * himC.analysis.confidence) / 100);

    const totalWeight = bigWeight + smallWeight;
    const votePrediction: DarksideSize | 'WAIT' =
      bigWeight === smallWeight ? 'WAIT' : bigWeight > smallWeight ? 'BIG' : 'SMALL';
    const transitionOverride = transitionStats.side;
    const prediction = alternatingSide || transitionOverride || votePrediction;
    const alignedWeight = prediction === 'BIG' ? bigWeight : prediction === 'SMALL' ? smallWeight : 0;

    return {
      prediction,
      patternName: livePattern.type
        ? `${livePattern.type} (${livePattern.length} Draws)`
        : alternatingSide
        ? `Zig-Zag 1:1 (${livePattern.zigzagLength} Draws)`
        : transitionOverride
        ? `${transitionStats.context} Transition → ${transitionOverride}`
        : `Weighted Consensus (${bigWeight.toFixed(1)}B/${smallWeight.toFixed(1)}S)`,
      strategy: `${livePattern.type || transitionOverride || 'Recency Model'} · ${patternMatches}/${this.patternCandidateCount} Scan`,
      voteShare: totalWeight ? Math.round((alignedWeight / totalWeight) * 100) : 0,
      patternMatches,
      patternScanned: this.patternCandidateCount,
      bigWeight,
      smallWeight,
      alternatingOverride: Boolean(alternatingSide),
      transitionOverride,
      transitionStats,
      livePattern,
      staircaseInfo,
      staircaseSide,
      gap2Side,
      gap3Side,
      ultraSignal,
      voteBreakdown: [
        ...baseVotes.map((side, index) => ({ name: this.voteNames[index], side })),
        ...(ultraSignal.prediction ? [{ name: 'ULTRA ENSEMBLE', side: ultraSignal.prediction }] : []),
        ...(anshC && anshC.prediction ? [{ name: 'ANSH CORE', side: anshC.prediction }] : []),
        ...(himC && himC.prediction ? [{ name: 'HIMANSHU V25', side: himC.prediction }] : []),
      ],
      matchedCandidates,
      historyCount: memory.length,
      anshCore: anshC,
      himanshu: himC,
    };
  },
};

// ============================================================
// 7. INDEPENDENT EXACT OPPOSITE NUMBER CALCULATOR (NO RANDOM)
// ============================================================
export function predictExactOppositeNumber(
  numbersNewestFirst: ReadonlyArray<number>,
  tracker?: PatternLossTrackerState
): { favNum: number; oppNum: number; score: number } {
  const hist = numbersNewestFirst.slice(0, 1000);
  if (!hist.length) {
    return { favNum: 0, oppNum: CUSTOM_OPP_MAP[0], score: 50 };
  }

  const latest = normalizeDigit(hist[0]);
  const prev1 = hist.length > 1 ? normalizeDigit(hist[1]) : latest;
  const windows = [10, 20, 50, 100, 1000];

  // Empirical 10x10 digit transition counts: hist[i+1] -> hist[i]
  const transFromLatest = new Array<number>(10).fill(0);
  const trans2FromLatest = new Array<number>(10).fill(0);
  const oppHitWins = new Array<number>(10).fill(0);
  const oppHitTotal = new Array<number>(10).fill(0);
  const repeatHits = new Array<number>(10).fill(0);

  for (let i = 1; i < hist.length; i++) {
    const prev = normalizeDigit(hist[i]);
    const next = normalizeDigit(hist[i - 1]);
    if (prev === latest) transFromLatest[next]++;
    if (i + 1 < hist.length && normalizeDigit(hist[i + 1]) === prev1 && prev === latest) {
      trans2FromLatest[next]++;
    }
    if (prev === next) repeatHits[prev]++;
    oppHitTotal[prev]++;
    if (next === CUSTOM_OPP_MAP[prev]) oppHitWins[prev]++;
  }

  const totalTrans = transFromLatest.reduce((a, b) => a + b, 0) || 1;
  const totalTrans2 = trans2FromLatest.reduce((a, b) => a + b, 0) || 1;

  // Compute average gaps and current gaps for each digit 0..9
  const currentGap = new Array<number>(10).fill(hist.length);
  const avgGap = new Array<number>(10).fill(10);
  for (let d = 0; d <= 9; d++) {
    const idxs: number[] = [];
    for (let i = 0; i < hist.length; i++) {
      if (normalizeDigit(hist[i]) === d) idxs.push(i);
    }
    if (idxs.length > 0) {
      currentGap[d] = idxs[0];
      if (idxs.length > 1) {
        let gapSum = 0;
        for (let k = 1; k < idxs.length; k++) gapSum += idxs[k] - idxs[k - 1];
        avgGap[d] = gapSum / (idxs.length - 1);
      }
    }
  }

  let bestDigit = latest;
  let bestScore = -Infinity;

  for (let d = 0; d <= 9; d++) {
    const mappedOpp = CUSTOM_OPP_MAP[d];

    // 1. Multi-window frequency balance for target mappedOpp and trigger digit d
    let freqScore = 0;
    windows.forEach((w, wIdx) => {
      const sl = hist.slice(0, Math.min(w, hist.length));
      if (!sl.length) return;
      const oppRate = sl.filter((x) => normalizeDigit(x) === mappedOpp).length / sl.length;
      const trigRate = sl.filter((x) => normalizeDigit(x) === d).length / sl.length;
      const wWeight = [0.22, 0.25, 0.22, 0.18, 0.13][wIdx];
      // Short window favors momentum slightly; medium/long favors deficit reversion
      const deficit = 0.1 - oppRate;
      const momentum = trigRate - 0.1;
      freqScore += wWeight * (w <= 20 ? momentum * 1.4 + deficit * 0.8 : deficit * 1.6);
    });

    // 2. Hot & Cold Gap pressure on mappedOpp
    const gapRatio = currentGap[mappedOpp] / Math.max(2, avgGap[mappedOpp]);
    const gapScore = clamp(gapRatio - 0.85, -0.4, 0.9) * 0.35;

    // 3. Digit transition matrix likelihood that next digit === mappedOpp given latest
    const t1Rate = (transFromLatest[mappedOpp] + 0.5) / (totalTrans + 5);
    const t2Rate = (trans2FromLatest[mappedOpp] + 0.3) / (totalTrans2 + 3);
    const transitionScore = (t1Rate - 0.1) * 2.1 + (t2Rate - 0.1) * 1.3;

    // 4. Repetition + Historical d -> OPP_MAP[d] empirical accuracy
    const empOppAcc = (oppHitWins[d] + 1) / (oppHitTotal[d] + 10);
    const oppAccScore = (empOppAcc - 0.1) * 1.6;
    const repScore = d === latest ? (repeatHits[d] / Math.max(1, hist.length)) * 0.8 : 0;

    // 5. Latest-draw direct trigger affinity (when d === latest, boost proportional to historical latest->OPP[latest] rate)
    const latestAffinity = d === latest ? 0.18 : 0;

    // 6. Adaptive live opposite-digit stats from persistent loss tracker
    let liveBonus = 0;
    const oppStat = tracker?.oppDigitStats?.[mappedOpp];
    if (oppStat && oppStat.wins + oppStat.losses > 0) {
      const rate = (oppStat.wins + 0.5) / (oppStat.wins + oppStat.losses + 5);
      liveBonus = (rate - 0.1) * 0.6;
    }

    const total = freqScore + gapScore + transitionScore + oppAccScore + repScore + latestAffinity + liveBonus;
    if (total > bestScore) {
      bestScore = total;
      bestDigit = d;
    }
  }

  return {
    favNum: bestDigit,
    oppNum: CUSTOM_OPP_MAP[bestDigit],
    score: clamp(Math.round(55 + bestScore * 35), 40, 92),
  };
}

// ============================================================
// 8. PERSISTENT ADAPTIVE PATTERN & LOSS TRACKER
// ============================================================
export function createInitialLossTrackerState(): PatternLossTrackerState {
  return {
    consecutiveBSLosses: 0,
    lastEvaluatedPeriod: '',
    bsWins: 0,
    bsLosses: 0,
    numWins: 0,
    numLosses: 0,
    bothWins: 0,
    lastFailedPattern: null,
    patternStats: {},
    oppDigitStats: {},
    recentOutcomes: [],
  };
}

export function updateLossTrackerOutcome(
  tracker: PatternLossTrackerState,
  input: {
    period: string;
    predSize: DarksideSize;
    predOppNum: number;
    pattern: string;
    actualNumber: number;
  }
): PatternLossTrackerState {
  const periodStr = String(input.period || '').trim();
  if (periodStr && tracker.lastEvaluatedPeriod === periodStr) {
    return tracker;
  }

  const actualDigit = normalizeDigit(input.actualNumber);
  const actualSize = sizeOf(actualDigit);
  const bsWin = actualSize === input.predSize;
  const numHit = actualDigit === normalizeDigit(input.predOppNum);
  const bothHit = bsWin && numHit;
  const patternKey = input.pattern || 'CONSENSUS';

  const prevPat = tracker.patternStats[patternKey] || {
    wins: 0,
    losses: 0,
    consecutiveLosses: 0,
    weight: 1.0,
    recent: [],
  };
  const nextRecent = [...prevPat.recent, bsWin].slice(-12);
  const nextPatConsLoss = bsWin ? 0 : prevPat.consecutiveLosses + 1;
  const nextWeight = bsWin
    ? clamp(prevPat.weight + 0.08, 0.35, 1.45)
    : clamp(prevPat.weight - (nextPatConsLoss >= 2 ? 0.22 : 0.12), 0.3, 1.45);

  const prevOpp = tracker.oppDigitStats[input.predOppNum] || { wins: 0, losses: 0 };
  const nextConsecutiveBSLosses = bsWin ? 0 : tracker.consecutiveBSLosses + 1;

  return {
    consecutiveBSLosses: nextConsecutiveBSLosses,
    lastEvaluatedPeriod: periodStr,
    bsWins: tracker.bsWins + (bsWin ? 1 : 0),
    bsLosses: tracker.bsLosses + (bsWin ? 0 : 1),
    numWins: tracker.numWins + (numHit ? 1 : 0),
    numLosses: tracker.numLosses + (numHit ? 0 : 1),
    bothWins: tracker.bothWins + (bothHit ? 1 : 0),
    lastFailedPattern: bsWin ? null : patternKey,
    patternStats: {
      ...tracker.patternStats,
      [patternKey]: {
        wins: prevPat.wins + (bsWin ? 1 : 0),
        losses: prevPat.losses + (bsWin ? 0 : 1),
        consecutiveLosses: nextPatConsLoss,
        weight: Number(nextWeight.toFixed(3)),
        recent: nextRecent,
      },
    },
    oppDigitStats: {
      ...tracker.oppDigitStats,
      [input.predOppNum]: {
        wins: prevOpp.wins + (numHit ? 1 : 0),
        losses: prevOpp.losses + (numHit ? 0 : 1),
      },
    },
    recentOutcomes: [
      {
        period: periodStr,
        pattern: patternKey,
        bsWin,
        numHit,
        bothHit,
        failedPattern: bsWin ? null : patternKey,
      },
      ...tracker.recentOutcomes,
    ].slice(0, 60),
  };
}

// ============================================================
// 9. STRICTLY CAUSAL WALK-FORWARD HISTORICAL BACKTESTER
// ============================================================
interface CausalBacktestSummary {
  overallAccuracy: number;
  samples: number;
  engineAccuracy: Record<string, number>;
}

function collectFastEngineVotes(
  numbersNewestFirst: ReadonlyArray<number>,
  chronoChars: string,
  newestChars: string
): EngineSignalVote[] {
  const votes: EngineSignalVote[] = [];

  const sureshot = evaluateSureshotDatabase(chronoChars);
  if (sureshot) votes.push(sureshot);

  const cpu = evaluateCpuPatternDB(newestChars, chronoChars);
  if (cpu) votes.push(cpu);

  const clean500 = evaluateClean500Patterns(chronoChars);
  if (clean500) votes.push(clean500);

  const bunny = runBunnyAI(numbersNewestFirst);
  votes.push({
    name: 'BUNNY_AI',
    prediction: bunny.prediction,
    edge: clamp((bunny.confidence - 48) / 45, 0.14, 0.85),
    patternKey: `BUNNY:${bunny.pattern}`,
    detail: bunny.patternName,
  });

  const dbHit = matchPatternDB(chronoChars.slice(-12));
  if (dbHit) {
    votes.push({
      name: 'DARKSIDE_DB',
      prediction: dbHit.next,
      edge: clamp((dbHit.confidence - 48) / 45, 0.18, 0.82),
      patternKey: `DB:${dbHit.pattern}`,
      detail: `${dbHit.pattern}→${dbHit.next}`,
    });
  }

  const structural = detectStructuralPatterns(numbersNewestFirst);
  for (const v of structural) votes.push(v);

  const { markovVote, driftVote } = computeMarkovAndChiSquare(numbersNewestFirst);
  votes.push(markovVote);
  if (driftVote) votes.push(driftVote);

  return votes;
}

export function runCausalWalkForwardBacktest(numbersNewestFirst: ReadonlyArray<number>): CausalBacktestSummary {
  const maxCheckpoints = Math.min(35, Math.max(0, numbersNewestFirst.length - 12));
  if (maxCheckpoints < 5) {
    return { overallAccuracy: 54, samples: 0, engineAccuracy: {} };
  }

  const engineStats: Record<string, { w: number; t: number }> = {};
  let overallWins = 0;
  let overallTotal = 0;

  // Strictly causal: to evaluate actual draw at index (step - 1), ONLY slice [step .. end] is visible!
  for (let step = 1; step <= maxCheckpoints; step++) {
    const actualSize = sizeOf(numbersNewestFirst[step - 1]);
    const pastNums = numbersNewestFirst.slice(step);
    const pastCharsNew = pastNums
      .slice(0, 24)
      .map((n) => (sizeOf(n) === 'BIG' ? 'B' : 'S'))
      .join('');
    const pastCharsChrono = pastCharsNew.split('').reverse().join('');

    const votes = collectFastEngineVotes(pastNums, pastCharsChrono, pastCharsNew);
    let bScore = 0;
    let sScore = 0;

    for (const v of votes) {
      if (!engineStats[v.name]) engineStats[v.name] = { w: 0, t: 0 };
      engineStats[v.name].t++;
      if (v.prediction === actualSize) engineStats[v.name].w++;

      if (v.prediction === 'BIG') bScore += v.edge;
      else sScore += v.edge;
    }

    const predSide: DarksideSize = bScore >= sScore ? 'BIG' : 'SMALL';
    overallTotal++;
    if (predSide === actualSize) overallWins++;
  }

  const engineAccuracy: Record<string, number> = {};
  for (const [k, st] of Object.entries(engineStats)) {
    // Laplace-smoothed accuracy to avoid overfitting small counts
    engineAccuracy[k] = Number(((st.w + 2) / (st.t + 4)).toFixed(4));
  }

  const overallAccuracy = overallTotal
    ? Math.round(((overallWins + 2) / (overallTotal + 4)) * 100)
    : 54;

  return { overallAccuracy, samples: overallTotal, engineAccuracy };
}

// ============================================================
// 10. MASTER FULL LOGIC PREDICTION ENGINE
// ============================================================
export function runDarksidePrediction(
  targetPeriod: string | number,
  rawHistory: ReadonlyArray<number | RawHistoryInput>,
  options?: {
    excludePeriod?: string;
    recentMatchedPatterns?: string[];
    tracker?: PatternLossTrackerState;
  }
): DarksidePredictionResult {
  const periodStr = String(targetPeriod || '');
  const { records, numbers } = normalizeDarksideHistory(rawHistory, {
    excludePeriod: options?.excludePeriod,
  });

  const validNumbers = numbers.length >= 5 ? numbers.slice(0, 1000) : [5, 8, 2, 7, 3, 9, 0, 4, 1, 6];
  const validRecords: DarksideHistoryRecord[] =
    records.length >= 5
      ? records.slice(0, 1000)
      : validNumbers.map((d, i) => ({
          issueNumber: String(i),
          number: d,
          size: sizeOf(d),
          parity: parityOf(d),
          colorType: colorTypeOf(d),
        }));

  const sizes: DarksideSize[] = validNumbers.map(sizeOf);
  const newestFirstChars = sizes.slice(0, 30).map((s) => (s === 'BIG' ? 'B' : 'S')).join('');
  const chronoChars = sizes
    .slice(0, 30)
    .map((s) => (s === 'BIG' ? 'B' : 'S'))
    .reverse()
    .join('');

  const multiWindow = calculateMultiWindow(validNumbers);
  const volValue = calculateVolatility(validNumbers.slice(0, 20)).volatility;

  let streakCount = validNumbers.length > 0 ? 1 : 0;
  const streakSide: DarksideSize = sizes[0] || 'BIG';
  for (let i = 1; i < sizes.length && sizes[i] === streakSide; i++) {
    streakCount++;
  }

  let streakStatus: DarksideEngineAnalysis['streakStatus'] = 'NORMAL';
  let exhaustionScore = 0;
  if (streakCount >= 7) {
    streakStatus = 'EXTREME_EXHAUSTION';
    exhaustionScore = 95;
  } else if (streakCount >= 5) {
    streakStatus = 'OVEREXTENDED';
    exhaustionScore = 75;
  } else if (streakCount >= 3) {
    streakStatus = 'STRONG';
    exhaustionScore = 30;
  }

  const volatilityState: DarksideEngineAnalysis['volatilityState'] =
    volValue < 0.4 ? 'STABLE' : volValue <= 0.7 ? 'NORMAL' : volValue <= 1.0 ? 'UNSTABLE' : 'CHAOTIC';

  let switches = 0;
  for (let i = 1; i < Math.min(sizes.length, 6); i++) {
    if (sizes[i] !== sizes[i - 1]) switches++;
  }

  const big5 = sizes.slice(0, 5).filter((s) => s === 'BIG').length;
  const momentumPressure: DarksideSize = big5 >= 3 ? 'BIG' : 'SMALL';
  const momentumMultiplier = big5 === 5 || big5 === 0 ? 1.4 : 1.1;

  // Run all sub-engines & pattern DBs
  const sureshotVote = evaluateSureshotDatabase(chronoChars);
  const cpuVote = evaluateCpuPatternDB(newestFirstChars, chronoChars);
  const clean500Vote = evaluateClean500Patterns(chronoChars);
  const bunnyRes = runBunnyAI(validNumbers);
  const bunnyVote: EngineSignalVote = {
    name: 'BUNNY_AI',
    prediction: bunnyRes.prediction,
    edge: clamp((bunnyRes.confidence - 48) / 45, 0.16, 0.85),
    patternKey: `BUNNY:${bunnyRes.pattern}`,
    detail: bunnyRes.patternName,
  };
  const dbMatch = matchPatternDB(chronoChars.slice(-12), options?.recentMatchedPatterns);
  const structuralVotes = detectStructuralPatterns(validNumbers);
  const { markovVote, driftVote, markovProbBig, chiSquare, chiPValueBand } =
    computeMarkovAndChiSquare(validNumbers);

  const hasClearStructure =
    structuralVotes.some((v) => v.name !== 'EMP_STREAK') ||
    (bunnyRes.pattern !== 'CHAOS' && bunnyRes.pattern !== 'ADAPTIVE');
  const chaosDetected = !hasClearStructure && switches >= 4 && volValue > 0.75;
  const chaosScore = hasClearStructure
    ? Math.min(35, switches * 5)
    : Math.min(100, switches * 18 + (volValue > 0.8 ? 28 : 0));

  let reversalRisk = 0;
  if (streakCount >= 6) reversalRisk += 50;
  else if (streakCount >= 4) reversalRisk += 25;
  if (volValue > 0.85 && !hasClearStructure) reversalRisk += 25;
  if (chaosDetected) reversalRisk += 20;

  let reversalType: DarksideEngineAnalysis['reversalType'] = 'NONE';
  if (streakCount >= 7) reversalType = 'EXHAUSTION';
  else if (reversalRisk >= 60) reversalType = 'HARD';
  else if (reversalRisk >= 40) reversalType = 'SOFT';

  const heatIndex = Math.min(
    100,
    Math.round(streakCount * 12 + (multiWindow.w5.dominance > 75 ? 30 : 10))
  );
  const heatState: DarksideEngineAnalysis['heatState'] =
    heatIndex >= 85 ? 'OVERHEATED' : heatIndex >= 65 ? 'HIGH' : heatIndex >= 40 ? 'NORMAL' : 'LOW';

  const histObjs = validNumbers.map((n) => ({ number: n }));
  const anshInput = validRecords.length ? validRecords : histObjs;
  const anshCore = AnshCore.analyze(anshInput, periodStr);
  const himanshu = HimanshuV25.analyze(anshInput, periodStr);
  const qtAnalysis = histObjs.length >= 5 ? TrendVoteEngine.analyze(histObjs, anshCore, himanshu) : null;

  // Run strictly causal walk-forward backtest on history before scoring
  const backtest = runCausalWalkForwardBacktest(validNumbers);

  // Build weighted engine consensus incorporating:
  // 1) Signal edge, 2) Causal walk-forward accuracy, 3) Live adaptive pattern tracker weight
  const allVotes: EngineSignalVote[] = [];
  if (sureshotVote) allVotes.push(sureshotVote);
  if (cpuVote) allVotes.push(cpuVote);
  if (clean500Vote) allVotes.push(clean500Vote);
  allVotes.push(bunnyVote);
  if (dbMatch) {
    allVotes.push({
      name: 'DARKSIDE_DB',
      prediction: dbMatch.next,
      edge: clamp((dbMatch.confidence - 48) / 45, 0.18, 0.82),
      patternKey: `DB:${dbMatch.pattern}`,
      detail: `${dbMatch.pattern}→${dbMatch.next}`,
    });
  }
  for (const sv of structuralVotes) allVotes.push(sv);
  allVotes.push(markovVote);
  if (driftVote) allVotes.push(driftVote);
  if (anshCore) {
    allVotes.push({
      name: 'ANSH_CORE',
      prediction: anshCore.prediction,
      edge: clamp((anshCore.confidence - 48) / 45, 0.15, 0.78),
      patternKey: `ANSH:${anshCore.signalLevel}`,
      detail: `AnshCore→${anshCore.prediction}`,
    });
  }
  if (qtAnalysis && qtAnalysis.prediction !== 'WAIT') {
    allVotes.push({
      name: 'TREND_VOTE',
      prediction: qtAnalysis.prediction,
      edge: clamp((qtAnalysis.voteShare - 48) / 45, 0.15, 0.78),
      patternKey: `TREND:${qtAnalysis.livePattern.type || 'VOTE'}`,
      detail: qtAnalysis.patternName,
    });
  }

  let bigScore = 0;
  let smallScore = 0;
  let topLeader: { vote: EngineSignalVote; weight: number } | null = null;
  const tracker = options?.tracker;

  for (const v of allVotes) {
    const btAcc = backtest.engineAccuracy[v.name] ?? 0.52;
    const btMultiplier = clamp(0.6 + (btAcc - 0.5) * 2.4, 0.45, 1.45);
    const perf = tracker?.patternStats?.[v.patternKey];
    const trackerMultiplier = perf ? perf.weight : 1.0;

    const finalWeight = v.edge * btMultiplier * trackerMultiplier;
    if (v.prediction === 'BIG') bigScore += finalWeight;
    else smallScore += finalWeight;

    if (!topLeader || finalWeight > topLeader.weight) {
      topLeader = { vote: v, weight: finalWeight };
    }
  }

  const totalConsensusWeight = bigScore + smallScore || 1;
  const size: DarksideSize = bigScore >= smallScore ? 'BIG' : 'SMALL';
  const consensusPct = Math.round((Math.max(bigScore, smallScore) / totalConsensusWeight) * 100);

  // Align dominant pattern name with winning side
  const winningVotes = allVotes.filter((v) => v.prediction === size);
  const topWinningVote =
    winningVotes.sort((a, b) => b.edge - a.edge)[0] || topLeader?.vote || bunnyVote;

  const isDragon = streakCount >= 4 || bunnyRes.pattern.startsWith('DRAGON');
  const patternKey = topWinningVote.patternKey;
  const patternName = isDragon
    ? `Dragon x${streakCount} ${streakCount >= 6 ? 'Exhaustion' : 'Active'} · ${topWinningVote.detail}`
    : `${topWinningVote.detail} (${consensusPct}% Consensus)`;

  // Real calibrated probability (NO fake 99-100% claims):
  // Blended from causal walk-forward accuracy, consensus strength, chi-square significance, and active pattern history
  const activePerf = tracker?.patternStats?.[patternKey];
  const activePatternHitRate =
    activePerf && activePerf.wins + activePerf.losses >= 2
      ? (activePerf.wins + 1) / (activePerf.wins + activePerf.losses + 2)
      : 0.56;

  const btBase = backtest.samples >= 8 ? backtest.overallAccuracy : 55;
  const consensusBonus = clamp((consensusPct - 52) * 0.45, 0, 18);
  const chiBonus = chiPValueBand === 'HIGH' ? 6 : chiPValueBand === 'SIGNIFICANT' ? 3 : 0;
  const trackerAdj = (activePatternHitRate - 0.55) * 20;
  const chaosPenalty = chaosDetected ? 8 : 0;

  const confidence = Math.round(
    clamp(btBase * 0.48 + 26 + consensusBonus + chiBonus + trackerAdj - chaosPenalty, 50, 92)
  );

  // Pattern quality (0..100)
  const isPatternRecentlyFailing =
    Boolean(activePerf && activePerf.consecutiveLosses >= 2) ||
    tracker?.lastFailedPattern === patternKey;
  const patternQuality = Math.round(
    clamp(
      (backtest.samples >= 6 ? backtest.overallAccuracy * 0.45 : 24) +
        consensusPct * 0.45 +
        (chiPValueBand !== 'NEUTRAL' ? 8 : 2) +
        (topWinningVote.edge > 0.4 ? 8 : 2) -
        (isPatternRecentlyFailing ? 18 : 0) -
        (chaosDetected ? 15 : 0),
      20,
      96
    )
  );

  // Independent exact opposite-number calculation
  const oppCalc = predictExactOppositeNumber(validNumbers, tracker);
  const favNum = oppCalc.favNum;
  const oppNum = oppCalc.oppNum;

  const status: PredictionStatus = 'ACTIVE';

  const signalGrade: DarksideGrade = chaosDetected
    ? 'CHAOS'
    : reversalRisk >= 75
    ? 'DANGER'
    : confidence >= 78
    ? 'STRONG'
    : confidence >= 64
    ? 'MEDIUM'
    : 'WEAK';

  const trendScore = Math.round((multiWindow.w10.dominance / 100) * 30);
  const momentumScore = Math.round((Math.max(big5, 5 - big5) / 5) * 20);
  const patternScore = Math.round((patternQuality / 100) * 25);
  const volatilityScore = volatilityState === 'STABLE' ? 15 : volatilityState === 'NORMAL' ? 12 : 6;
  const reverseScore = Math.min(10, (reversalType === 'NONE' ? 4 : 8) + (chiPValueBand !== 'NEUTRAL' ? 2 : 0));
  const totalAiScore = Math.min(100, trendScore + momentumScore + patternScore + volatilityScore + reverseScore);

  const matchedPattern: PatternDBMatch = {
    pattern: patternKey,
    next: size,
    confidence,
    source:
      topWinningVote.name === 'SURESHOT_DB'
        ? 'SURESHOT_DB'
        : topWinningVote.name === 'CPU_PATTERN_DB'
        ? 'CPU_DB'
        : topWinningVote.name === 'CLEAN_500_LIB'
        ? 'CLEAN_500'
        : topWinningVote.name === 'BUNNY_AI'
        ? 'BUNNY_AI'
        : topWinningVote.name === 'MARKOV_1_2_3' || topWinningVote.name === 'CHI_DRIFT_MR'
        ? 'MARKOV_CHI'
        : 'STRUCTURAL',
  };

  const analysisText = `${topWinningVote.detail} | Backtest ${backtest.overallAccuracy}% (${backtest.samples}r) | Markov P(B)=${Math.round(
    markovProbBig * 100
  )}% | ChiSq=${chiSquare}`;

  const patternDetail = `BT: ${backtest.overallAccuracy}% (${backtest.samples}r) | Q: ${patternQuality} | ChiSq: ${chiSquare}`;

  const engineAnalysis: DarksideEngineAnalysis = {
    trendScore,
    momentumScore,
    patternScore,
    volatilityScore,
    reverseScore,
    totalAiScore,
    volatilityValue: volValue,
    volatilityState,
    momentumPressure,
    momentumMultiplier,
    streakCount,
    streakSide,
    streakStatus,
    exhaustionScore,
    reversalRisk,
    reversalType,
    heatIndex,
    heatState,
    chaosDetected,
    chaosScore,
    pressureSide: momentumPressure,
    pressureDominance: multiWindow.w5.dominance,
    stabilityScore: Math.round(clamp(100 - volValue * 50 - chaosScore * 0.4, 20, 98)),
    signalGrade,
    matchedPattern,
    backtestAccuracy: backtest.overallAccuracy,
    backtestSamples: backtest.samples,
    chiSquare,
    chiPValueBand,
    markovProbBig: Number(markovProbBig.toFixed(3)),
    patternQuality,
  };

  const source: DarksidePredictionResult['source'] = isDragon
    ? 'DRAGON'
    : topWinningVote.name === 'BUNNY_AI'
    ? 'BUNNY_AI'
    : topWinningVote.name === 'MARKOV_1_2_3'
    ? 'MARKOV'
    : 'PATTERN';

  const col = primaryCol(oppNum);
  const violet = hasViolet(oppNum);

  const logics: Array<{ k: string; bs: DarksideSize }> = allVotes.map((v) => ({
    k: v.name,
    bs: v.prediction,
  }));
  const breakdown: Record<string, { bs: DarksideSize; score: number; num?: number }> = {};
  for (const v of allVotes) {
    breakdown[v.name] = {
      bs: v.prediction,
      score: Math.round(v.edge * 100),
    };
  }

  return {
    period: periodStr,
    status,
    source,
    size,
    bs: size,
    number: oppNum,
    favNum,
    oppNum,
    oppositeNumber: oppNum,
    numbers: [oppNum],
    color: col,
    violet,
    label: `${size} ${oppNum}`,
    confidence,
    backtestAccuracy: backtest.overallAccuracy,
    backtestSamples: backtest.samples,
    patternQuality,
    pattern: patternKey,
    patternName,
    patternDetail,
    patternPriority: patternQuality,
    isDragon,
    analysis: analysisText,
    lockedAt: Date.now(),
    validHistoryCount: validNumbers.length,
    engineAnalysis,
    multiWindow,
    anshAnalysis: qtAnalysis,
    anshCore,
    himanshu,
    logics,
    breakdown,
    winRate: backtest.overallAccuracy,
    signalStr: consensusPct,
    patAcc: patternQuality,
    trendStr: multiWindow.w10.dominance,
    sentiment: size === 'BIG' ? 'BULLISH' : 'NEUTRAL',
    momentum: Math.round(engineAnalysis.stabilityScore),
    vol: Math.round(volValue * 100),
    aiScore: totalAiScore,
    isSureshot: confidence >= 78 && consensusPct >= 72,
    reasoning: analysisText,
    analysisSummary: analysisText,
  };
}

// ============================================================
// 11. OUTCOME EVALUATION (CUSTOM BIG/SMALL + EXACT OPP NUMBER)
// ============================================================
export function evaluateDarksideResult(
  predictedSize: DarksideSize,
  oppNum: number,
  actualNumber: number
): DarksideOutcomeEvaluation {
  const actualDigit = normalizeDigit(actualNumber);
  const actualSize = sizeOf(actualDigit);
  const oppHit = actualDigit === normalizeDigit(oppNum);
  const isSizeWin = actualSize === predictedSize;
  const bothHit = isSizeWin && oppHit;
  const isJackpot = oppHit;
  const isWin = isSizeWin || isJackpot;

  const code: DarksideOutcomeEvaluation['code'] = bothHit
    ? 'ULTRA_JACKPOT'
    : isJackpot
    ? 'JACKPOT'
    : isSizeWin
    ? 'WIN'
    : 'LOSS';

  const status = code;

  return {
    status,
    code,
    isWin,
    isSizeWin,
    num1Hit: false,
    num2Hit: oppHit,
    isJackpot,
    isUltraJackpot: bothHit,
    bothHit,
  };
}
