/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NOVEXA AI — UNIFIED DARKSIDE PREDICTION PIPELINE
 * Single authoritative bridge to darksideEngine.ts (always active prediction output).
 */

import {
  runDarksidePrediction,
  normalizeDarksideHistory,
  evaluateDarksideResult,
  createInitialLossTrackerState,
  updateLossTrackerOutcome,
  predictExactOppositeNumber,
  runBunnyAI,
  evaluateSureshotDatabase,
  evaluateCpuPatternDB,
  evaluateClean500Patterns,
  computeMarkovAndChiSquare,
  detectStructuralPatterns,
  runCausalWalkForwardBacktest,
  CUSTOM_BS_MAP,
  CUSTOM_OPP_MAP,
  AnshCore,
  HimanshuV25,
  TrendVoteEngine,
  PATTERN_DB,
  SURESHOT_DATABASE,
  CLEAN_500_PATTERNS,
  CPU_PATTERN_DB,
  BUNNY_PATTERN_NAMES,
  matchPatternDB,
  selectHistoryNumber,
  getTargetNums,
  sizeOf,
  bsOf,
  primaryCol,
  hasViolet,
  colorTypeOf,
  oppositeDigit,
  to17DigitPeriod,
  DarksidePredictionResult,
  DarksideEngineAnalysis,
  DarksideOutcomeEvaluation,
  PatternLossTrackerState,
  PatternPerformance,
  PredictionStatus,
  RawHistoryInput,
} from './darksideEngine';

export type {
  DarksidePredictionResult,
  DarksideEngineAnalysis,
  DarksideOutcomeEvaluation,
  PatternLossTrackerState,
  PatternPerformance,
  PredictionStatus,
  RawHistoryInput,
};

export type EnsembleResult = DarksidePredictionResult;

export {
  runDarksidePrediction,
  normalizeDarksideHistory,
  evaluateDarksideResult,
  createInitialLossTrackerState,
  updateLossTrackerOutcome,
  predictExactOppositeNumber,
  runBunnyAI,
  evaluateSureshotDatabase,
  evaluateCpuPatternDB,
  evaluateClean500Patterns,
  computeMarkovAndChiSquare,
  detectStructuralPatterns,
  runCausalWalkForwardBacktest,
  CUSTOM_BS_MAP,
  CUSTOM_OPP_MAP,
  AnshCore,
  HimanshuV25,
  TrendVoteEngine,
  PATTERN_DB,
  SURESHOT_DATABASE,
  CLEAN_500_PATTERNS,
  CPU_PATTERN_DB,
  BUNNY_PATTERN_NAMES,
  matchPatternDB,
  selectHistoryNumber,
  getTargetNums,
  sizeOf,
  bsOf,
  primaryCol,
  hasViolet,
  colorTypeOf,
  oppositeDigit,
  to17DigitPeriod,
};

export const colOf = (n: number): string => {
  if (n === 0) return 'VIOLET-RED';
  if (n === 5) return 'VIOLET-GREEN';
  return n % 2 === 0 ? 'RED' : 'GREEN';
};

/**
 * Unified single-pipeline prediction entry point for NOVEXA AI.
 * Delegates to the full-logic adaptive engine with causal walk-forward validation.
 */
export function generateDarksideSignal(
  period: string | number,
  history: ReadonlyArray<number | RawHistoryInput>,
  options?: {
    excludePeriod?: string;
    recentMatchedPatterns?: string[];
    tracker?: PatternLossTrackerState;
  }
): EnsembleResult {
  return runDarksidePrediction(period, history, options);
}
