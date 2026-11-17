/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Server 3 Controller — Unified DARKSIDE Prediction API Route
 */

import { Request, Response } from 'express';
import { runDarksidePrediction, normalizeDarksideHistory } from '../utils/darksideEngine';

const API_ENDPOINTS = {
  '30s': {
    primary: 'https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json',
    fallback: 'https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?pageSize=10',
  },
  '1M': {
    primary: 'https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json',
    fallback: 'https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?pageSize=10',
  },
} as const;

async function fetchLiveHistory(mode: '30s' | '1M') {
  const endpoints = API_ENDPOINTS[mode] || API_ENDPOINTS['30s'];
  const localMode = mode === '30s' ? '30s' : '1m';
  const urls = [
    `http://127.0.0.1:3000/api/wingo/history?mode=${localMode}`,
    `${endpoints.primary}?t=${Date.now()}`,
    `${endpoints.fallback}&t=${Date.now()}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const json = (await res.json()) as { data?: { list?: unknown[] }; list?: unknown[] };
      const list = json?.data?.list || json?.list;
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    } catch (err) {
      console.warn('[DARKSIDE Server] Live API fetch warning:', err);
    }
  }
  return [];
}

export async function server3PredictHandler(req: Request, res: Response) {
  try {
    const body = req.body || {};
    const query = req.query || {};

    const mode = (body.mode || query.mode || '30s') as '30s' | '1M';
    const explicitPeriod =
      body.period !== undefined && String(body.period).trim() !== ''
        ? String(body.period).trim()
        : query.period !== undefined && String(query.period).trim() !== ''
          ? String(query.period).trim()
          : undefined;

    const rawHistory =
      Array.isArray(body.history) && body.history.length > 0
        ? body.history
        : await fetchLiveHistory(mode);

    const normalized = normalizeDarksideHistory(rawHistory, { excludePeriod: explicitPeriod });
    if (normalized.numbers.length < 5) {
      return res.status(400).json({
        success: false,
        engine: 'DARKSIDE_ENGINE',
        error: 'At least 5 valid draws are required for prediction.',
      });
    }

    let resolvedPeriod = explicitPeriod || `${Date.now()}`;
    if (!explicitPeriod && normalized.records[0]?.issueNumber) {
      const digits = normalized.records[0].issueNumber.replace(/\D/g, '');
      if (digits) {
        try {
          resolvedPeriod = String(BigInt(digits) + 1n);
        } catch {
          resolvedPeriod = normalized.records[0].issueNumber;
        }
      }
    }

    const result = runDarksidePrediction(resolvedPeriod, normalized.records, {
      excludePeriod: explicitPeriod,
    });

    return res.json({
      success: true,
      engine: 'DARKSIDE_ENGINE',
      mode,
      period: resolvedPeriod,
      analyzedRounds: normalized.numbers.length,
      prediction: {
        status: result.status,
        size: result.size,
        number: result.oppNum,
        oppositeNumber: result.oppNum,
        numbers: [result.oppNum],
        color: result.color,
        violet: result.violet,
        confidence: result.confidence,
        backtestAccuracy: result.backtestAccuracy,
        backtestSamples: result.backtestSamples,
        patternQuality: result.patternQuality,
        analysis: result.analysis,
        source: result.source,
        pattern: result.pattern,
        patternName: result.patternName,
        patternDetail: result.patternDetail,
        isDragon: result.isDragon,
        engineAnalysis: result.engineAnalysis,
        multiWindow: result.multiWindow,
      },
      timestamp: result.lockedAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Prediction failed';
    console.error('[DARKSIDE Server] Prediction Error:', error);
    return res.status(500).json({
      success: false,
      engine: 'DARKSIDE_ENGINE',
      error: message,
    });
  }
}
