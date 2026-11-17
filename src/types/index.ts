/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DarksideEngineAnalysis } from '../utils/darksideEngine';

export interface ThemeDef {
  k: string;
  n: string;
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  accent: string;
  accent2: string;
  soft: string;
  deep: string;
  bg: string;
  base: string;
  darkBg?: string;
  darkBase?: string;
  heroGrad?: string;
  heroShadow?: string;
}

export interface ApiRecord {
  period: string;
  number: number;
  size?: string;
  colour?: string;
  time?: string;
}

export interface WingoHistoryItem {
  issueNumber: string;
  number: number;
  size: 'big' | 'small' | 'BIG' | 'SMALL';
  colour: string;
  time: string;
}

export interface StoredPrediction {
  period: string;
  prediction: string;
  predNum: number; // Predicted opposite number
  oppNum?: number; // Opposite number alias
  predBS: 'BIG' | 'SMALL';
  jackpotBS: 'BIG' | 'SMALL';
  logics: Array<{ k: string; bs: 'BIG' | 'SMALL' }>;
  actualNumber: number;
  actualBS: 'BIG' | 'SMALL' | '—';
  actualColor: 'RED' | 'GREEN' | '—';
  result: 'WIN' | 'JACKPOT' | 'ULTRA_JACKPOT' | 'LOSS' | 'PENDING';
  num1Hit?: boolean;
  num2Hit?: boolean;
  isSizeWin?: boolean;
  bsWin?: boolean;
  numHit?: boolean;
  bothHit?: boolean;
  failedPattern?: string | null;
  status?: 'ACTIVE';
  analysis?: string;
  time: string;
  confidence: number;
  pattern?: string;
  patternName?: string;
  patternDetail?: string;
  isDragon?: boolean;
  isSureshot?: boolean;
  reasoning?: string;
  engineAnalysis?: DarksideEngineAnalysis;
}

export interface UserData {
  stats: {
    t: number;
    w: number;
    l: number;
    j?: number;
    n1h?: number; // Number 1 hits
    n2h?: number; // Number 2 hits
    bsw?: number; // Big/Small wins
    bsl?: number; // Big/Small losses
  };
  predictions: StoredPrediction[];
}

export type PageId = 'games' | 'portal' | 'pred' | 'hist' | 'settings';
export type GameMode = '30s' | '1M';
