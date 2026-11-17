/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { server3PredictHandler } from './src/server/server3Controller';

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json());

  // Server 3 API Routes
  app.get('/api/server3/predict', server3PredictHandler);
  app.post('/api/server3/predict', server3PredictHandler);
  app.get('/api/predict/server3', server3PredictHandler);
  app.post('/api/predict/server3', server3PredictHandler);

  // Fast In-Memory Cached Wingo Live Data Proxy using draw.ar-lottery01.com (exact DARKSIDE API)
  const DARKSIDE_API = {
    '30s': {
      primary: 'https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json',
      fallback: 'https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?pageSize=10',
    },
    '1m': {
      primary: 'https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json',
      fallback: 'https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?pageSize=10',
    },
  } as const;

  type RawDrawItem = {
    issueNumber: string;
    number: string;
    color?: string;
    premium?: string;
    sum?: number;
    time?: string;
  };

  const historyCache: Record<string, { list: RawDrawItem[]; ts: number }> = {};
  const isFetchingMap: Record<string, boolean> = {};

  const mergeDraws = (existing: RawDrawItem[], incoming: RawDrawItem[]): RawDrawItem[] => {
    const map = new Map<string, RawDrawItem>();
    for (const item of incoming) {
      const id = String(item?.issueNumber ?? '').trim();
      if (id) map.set(id, { ...item, issueNumber: id, number: String(item.number ?? '') });
    }
    for (const item of existing) {
      const id = String(item?.issueNumber ?? '').trim();
      if (id && !map.has(id)) map.set(id, item);
    }
    return Array.from(map.values())
      .sort((a, b) => {
        const da = a.issueNumber.replace(/\D/g, '');
        const db = b.issueNumber.replace(/\D/g, '');
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
        return b.issueNumber.localeCompare(a.issueNumber);
      })
      .slice(0, 1000);
  };

  const fetchDrawApi = async (mode: '30s' | '1m'): Promise<RawDrawItem[]> => {
    const endpoints = DARKSIDE_API[mode];
    const urls = [`${endpoints.primary}?t=${Date.now()}`, `${endpoints.fallback}&t=${Date.now()}`];

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          cache: 'no-store',
          signal: AbortSignal.timeout(2400),
        });
        if (!response.ok) continue;
        const json = (await response.json()) as { data?: { list?: RawDrawItem[] }; list?: RawDrawItem[] };
        const rawList = json?.data?.list || json?.list;
        if (Array.isArray(rawList) && rawList.length > 0) {
          return rawList;
        }
      } catch {
        // try next endpoint
      }
    }
    return [];
  };

  const backgroundSync = async (mode: '30s' | '1m', force = false) => {
    const cacheKey = `${mode}_1000`;
    if (!force && isFetchingMap[cacheKey]) {
      const existing = historyCache[cacheKey]?.list;
      return existing ? { data: { list: existing } } : undefined;
    }
    isFetchingMap[cacheKey] = true;
    try {
      const freshList = await fetchDrawApi(mode);
      if (freshList.length > 0) {
        const merged = mergeDraws(historyCache[cacheKey]?.list || [], freshList);
        historyCache[cacheKey] = { list: merged, ts: Date.now() };
        return { data: { list: merged } };
      }
    } catch {
      // background silent retry
    } finally {
      isFetchingMap[cacheKey] = false;
    }
    const existing = historyCache[cacheKey]?.list;
    return existing ? { data: { list: existing } } : undefined;
  };

  // Immediate initial load and fast 1s continuous refresh for instant round settlement
  backgroundSync('30s');
  backgroundSync('1m');
  setInterval(() => {
    backgroundSync('30s');
    backgroundSync('1m');
  }, 1000);

  app.get('/api/wingo/history', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const mode = (req.query.mode === '30s' ? '30s' : '1m') as '30s' | '1m';
    const isFresh = req.query.fresh === '1';
    const cacheKey = `${mode}_1000`;
    const now = Date.now();

    const cached = historyCache[cacheKey];

    if (isFresh && (!cached || now - cached.ts > 400)) {
      const freshData = await backgroundSync(mode, true);
      if (freshData) {
        return res.json(freshData);
      }
    } else if (!cached || now - cached.ts > 800) {
      backgroundSync(mode, true);
    }

    if (cached && cached.list.length > 0) {
      return res.json({ data: { list: cached.list } });
    }

    const liveList = await fetchDrawApi(mode);
    if (liveList.length > 0) {
      const merged = mergeDraws([], liveList);
      historyCache[cacheKey] = { list: merged, ts: Date.now() };
      return res.json({ data: { list: merged } });
    }

    return res.status(502).json({ error: 'Failed to fetch live draw.ar-lottery01.com history' });
  });

  // Dedicated 100-round API proxy for Analytics Chart (WingoChart)
  const CHART_100_API = {
    '30s': 'https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-30s-100',
    '1m': 'https://sky-predictor-1012593186417.asia-southeast1.run.app/api/wingo-history-1m-100',
  } as const;
  const chartCache: Record<string, { list: RawDrawItem[]; ts: number }> = {};

  app.get('/api/wingo/chart-history', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const mode = (req.query.mode === '30s' ? '30s' : '1m') as '30s' | '1m';
    const cached = chartCache[mode];
    if (cached && cached.list.length >= 100 && Date.now() - cached.ts < 1500) {
      return res.json({ data: { list: cached.list.slice(0, 100) } });
    }

    try {
      const response = await fetch(`${CHART_100_API[mode]}?t=${Date.now()}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(4500),
      });
      if (response.ok) {
        const json = (await response.json()) as { data?: { list?: RawDrawItem[] }; list?: RawDrawItem[] };
        const rawList = json?.data?.list || json?.list;
        if (Array.isArray(rawList) && rawList.length > 0) {
          const list100 = rawList.slice(0, 100);
          chartCache[mode] = { list: list100, ts: Date.now() };
          return res.json({ data: { list: list100 } });
        }
      }
    } catch {
      // fallback below
    }

    if (cached && cached.list.length > 0) {
      return res.json({ data: { list: cached.list.slice(0, 100) } });
    }

    const fallbackList = historyCache[`${mode}_1000`]?.list || [];
    if (fallbackList.length > 0) {
      return res.json({ data: { list: fallbackList.slice(0, 100) } });
    }

    return res.status(502).json({ error: 'Failed to fetch 100-round chart history' });
  });

  // Healthcheck endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      engine: 'DARKSIDE_ENGINE',
      api: 'draw.ar-lottery01.com',
      server: 3,
      time: new Date().toISOString(),
    });
  });

  // Mount Vite middlewares in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NOVEXA AI // DARKSIDE Engine (draw.ar-lottery01.com) running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
  process.exit(1);
});
