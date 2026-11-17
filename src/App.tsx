/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { PageId, GameMode, ApiRecord, UserData, StoredPrediction } from './types';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { FloatingTelegramButton } from './components/FloatingTelegramButton';
import { ParticlesBackground } from './components/ParticlesBackground';
import { GamesView } from './components/GamesView';
import { PredictionView } from './components/PredictionView';
import { GamePortalView } from './components/GamePortalView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { ThemeModal } from './components/ThemeModal';
import { WinLossModal } from './components/WinLossModal';
import { LoginPage } from './components/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { applyTheme } from './utils/themes';
import {
  generateDarksideSignal,
  normalizeDarksideHistory,
  evaluateDarksideResult,
  bsOf,
  createInitialLossTrackerState,
  updateLossTrackerOutcome,
  PatternLossTrackerState,
  AnshCore,
  EnsembleResult,
} from './utils/aiEngine';
import { preloadBallImages } from './utils/ballImages';
import { sound } from './utils/sound';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

const PAGE_ORDER: Record<PageId, number> = {
  games: 0,
  pred: 0.5,
  portal: 1,
  hist: 2,
  settings: 3,
};

function MainApp() {
  const { user, loading: authLoading, profileName } = useAuth();
  const [curPage, setCurPage] = useState<PageId>('games');
  const [navDirection, setNavDirection] = useState<number>(1);
  const [curMode, setCurMode] = useState<GameMode>('1M');
  const [isNight, setIsNight] = useState<boolean>(true);
  const [isAmoled, setIsAmoled] = useState<boolean>(false);
  const [curTheme, setCurTheme] = useState<string>('mint');
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [aiEngineMode, setAiEngineMode] = useState<'quantum' | 'conservative' | 'aggressive'>('quantum');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(70);
  const [autoPrediction, setAutoPrediction] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [loginReason, setLoginReason] = useState<string | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  // Auto prompt login first when user opens the app (supports ?autostart=1 preview bypass)
  const initialLoginPromptRef = useRef(false);
  useEffect(() => {
    const autostart =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('autostart') === '1';
    if (!authLoading && !user && !autostart && !initialLoginPromptRef.current) {
      initialLoginPromptRef.current = true;
      setLoginReason('Real-time round synchronization, multi-engine consensus, and disciplined volatility protection.');
      setIsLoginOpen(true);
    }
  }, [authLoading, user]);

  // Countdown & period state
  const [countdownSec, setCountdownSec] = useState<number>(60);
  const [totalCountdown, setTotalCountdown] = useState<number>(60);
  const [curPeriod, setCurPeriod] = useState<string>('');
  const curPeriodRef = useRef<string>('');
  const activeModeRef = useRef<GameMode>(curMode);
  activeModeRef.current = curMode;
  const isWaitingForNewPeriodRef = useRef<boolean>(false);
  const [nextPeriod, setNextPeriod] = useState<string>('');
  const [apiRecords, setApiRecords] = useState<ApiRecord[]>([]);
  const [isManualRefreshing, setIsManualRefreshing] = useState<boolean>(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>('');

  // Predictions state
  const [currentPrediction, setCurrentPrediction] = useState<EnsembleResult | null>(null);
  const pendingPredictionRef = useRef<{
    period: string;
    prediction: EnsembleResult;
  } | null>(null);
  const recentMatchedPatternsRef = useRef<string[]>([]);
  const lossTrackerRef = useRef<PatternLossTrackerState>(
    (() => {
      try {
        const raw = localStorage.getItem('novexa_loss_tracker_v1');
        if (raw) {
          const parsed = JSON.parse(raw) as PatternLossTrackerState;
          if (parsed && typeof parsed.consecutiveBSLosses === 'number') return parsed;
        }
      } catch {
        // ignore
      }
      return createInitialLossTrackerState();
    })()
  );
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  // Status & Time
  const [statusText, setStatusText] = useState<string>('Initializing NOVEXA AI…');
  const [isLive, setIsLive] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('--:--:--');

  // Preload ball images on app mount
  useEffect(() => {
    preloadBallImages();
  }, []);

  // User persistent data
  const [userData, setUserData] = useState<UserData>(() => {
    try {
      const saved =
        localStorage.getItem('cyrus_ai_v1') ||
        localStorage.getItem('novexa_ai_v1') ||
        localStorage.getItem('ny_dragon_ai_v1') ||
        localStorage.getItem('rdx_brand_v3') ||
        localStorage.getItem('yaarwin_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      stats: { t: 0, w: 0, l: 0 },
      predictions: [],
    };
  });

  // Sync user data to/from Firebase when logged in
  useEffect(() => {
    if (!user) return;
    const fetchCloudData = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const cloudData = snap.data();
          if (cloudData.stats) {
            setUserData((prev) => ({
              ...prev,
              stats: cloudData.stats,
            }));
          }
        }
      } catch {
        // ignore
      }
    };
    fetchCloudData();
  }, [user]);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'win' | 'err'; id: number } | null>(
    null
  );

  // Win/Loss Modal
  const [winLossModal, setWinLossModal] = useState<{
    isOpen: boolean;
    isWin: boolean;
    isJackpot?: boolean;
    isUltraJackpot?: boolean;
    predNum: number;
    oppNum?: number;
    predBS: 'BIG' | 'SMALL';
    actualNumber: number;
    actualBS: 'BIG' | 'SMALL';
    confidence: number;
    period: string;
  }>({
    isOpen: false,
    isWin: false,
    isJackpot: false,
    isUltraJackpot: false,
    predNum: 0,
    oppNum: 5,
    predBS: 'BIG',
    actualNumber: 0,
    actualBS: 'BIG',
    confidence: 0,
    period: '',
  });

  const showToast = useCallback((message: string, type: 'win' | 'err' = 'win') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 2500);
  }, []);

  // Sync theme, night mode, amoled, voice, and engine preferences
  useEffect(() => {
    try {
      const savedTheme =
        localStorage.getItem('cyrus_theme') ||
        localStorage.getItem('novexa_theme') ||
        localStorage.getItem('ny_dragon_ai_theme') ||
        'mint';
      setCurTheme(savedTheme);
      applyTheme(savedTheme);

      const savedNightRaw =
        localStorage.getItem('cyrus_night') ??
        localStorage.getItem('novexa_night') ??
        localStorage.getItem('ny_dragon_ai_night');
      const initialNight = savedNightRaw !== null ? savedNightRaw === '1' : true;
      const savedAmoled = (localStorage.getItem('cyrus_amoled') || localStorage.getItem('novexa_amoled')) === '1';

      setIsNight(initialNight);
      setIsAmoled(savedAmoled);

      const applyDomOptics = (night: boolean, amoled: boolean) => {
        const root = document.documentElement;
        const body = document.body;
        if (night) {
          root.classList.add('dark', 'night');
          root.setAttribute('data-theme', 'dark');
          body.classList.add('dark', 'night');
          if (amoled) {
            root.classList.add('amoled');
            body.classList.add('amoled');
          } else {
            root.classList.remove('amoled');
            body.classList.remove('amoled');
          }
        } else {
          root.classList.remove('dark', 'night', 'amoled');
          root.setAttribute('data-theme', 'light');
          body.classList.remove('dark', 'night', 'amoled');
        }
      };

      applyDomOptics(initialNight, savedAmoled);

      // Listen for system theme changes if user hasn't set manual override
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e: MediaQueryListEvent) => {
          if (localStorage.getItem('cyrus_night') === null && localStorage.getItem('novexa_night') === null) {
            setIsNight(e.matches);
            applyDomOptics(e.matches, savedAmoled);
          }
        };
        mql.addEventListener?.('change', listener);
      }

      const savedVoice = (localStorage.getItem('cyrus_voice') || localStorage.getItem('novexa_voice')) !== '0';
      setVoiceEnabled(savedVoice);
      sound.voiceEnabled = savedVoice;

      const savedEngine = (localStorage.getItem('cyrus_engine') || localStorage.getItem('novexa_engine')) as 'quantum' | 'conservative' | 'aggressive' | null;
      if (savedEngine) setAiEngineMode(savedEngine);

      const savedConf = Number(localStorage.getItem('cyrus_conf') || localStorage.getItem('novexa_conf'));
      if (savedConf && !isNaN(savedConf)) setConfidenceThreshold(savedConf);

      const savedAuto =
        localStorage.getItem('novexa_auto_pred') ?? localStorage.getItem('cyrus_auto_pred');
      if (savedAuto === '1') setAutoPrediction(true);
    } catch {
      // ignore
    }
  }, []);

  const syncDomOptics = (night: boolean, amoled: boolean) => {
    const root = document.documentElement;
    const body = document.body;
    if (night) {
      root.classList.add('dark', 'night');
      root.setAttribute('data-theme', 'dark');
      body.classList.add('dark', 'night');
      if (amoled) {
        root.classList.add('amoled');
        body.classList.add('amoled');
      } else {
        root.classList.remove('amoled');
        body.classList.remove('amoled');
      }
    } else {
      root.classList.remove('dark', 'night', 'amoled');
      root.setAttribute('data-theme', 'light');
      body.classList.remove('dark', 'night', 'amoled');
    }
  };

  const handleSelectTheme = (k: string) => {
    setCurTheme(k);
    applyTheme(k);
    try {
      localStorage.setItem('cyrus_theme', k);
      localStorage.setItem('novexa_theme', k);
    } catch {
      // ignore
    }
    showToast(`Applied ${k.toUpperCase()} theme`, 'win');
  };

  const handleToggleNight = () => {
    const next = !isNight;
    setIsNight(next);
    syncDomOptics(next, isAmoled);
    try {
      localStorage.setItem('cyrus_night', next ? '1' : '0');
    } catch {
      // ignore
    }
    showToast(next ? 'Night mode enabled' : 'Day mode enabled', 'win');
  };

  const handleToggleAmoled = () => {
    const next = !isAmoled;
    setIsAmoled(next);
    if (isNight) {
      syncDomOptics(true, next);
    }
    try {
      localStorage.setItem('cyrus_amoled', next ? '1' : '0');
    } catch {
      // ignore
    }
    showToast(next ? 'AMOLED OLED Black enabled' : 'Standard dark mode enabled', 'win');
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    showToast(next ? 'Haptic audio on' : 'Haptic audio muted', 'win');
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    sound.voiceEnabled = next;
    try {
      localStorage.setItem('cyrus_voice', next ? '1' : '0');
    } catch {
      // ignore
    }
    showToast(next ? 'Voice announcer enabled' : 'Voice announcer muted', 'win');
  };

  const handleSelectAiEngineMode = (mode: 'quantum' | 'conservative' | 'aggressive') => {
    setAiEngineMode(mode);
    try {
      localStorage.setItem('cyrus_engine', mode);
    } catch {
      // ignore
    }
    showToast(`AI Engine profile: ${mode.toUpperCase()}`, 'win');
  };

  const handleSelectConfidenceThreshold = (val: number) => {
    setConfidenceThreshold(val);
    try {
      localStorage.setItem('cyrus_conf', String(val));
    } catch {
      // ignore
    }
    showToast(`Confidence threshold set to ${val}%`, 'win');
  };

  const handleExportHistory = () => {
    try {
      const wins = userData.stats.w;
      const total = userData.stats.t;
      const rate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0';
      const text = `NOVEXA AI WinGo Report\nTotal Rounds: ${total}\nWins: ${wins}\nLosses: ${userData.stats.l}\nAccuracy: ${rate}%\nEngine: ${aiEngineMode.toUpperCase()}\nStatus: Verified VIP`;
      navigator.clipboard.writeText(text);
      showToast('Performance report copied to clipboard!', 'win');
    } catch {
      showToast('Failed to copy report', 'err');
    }
  };

  const handleToggleAutoPrediction = () => {
    const next = !autoPrediction;
    setAutoPrediction(next);
    try {
      localStorage.setItem('novexa_auto_pred', next ? '1' : '0');
      localStorage.setItem('cyrus_auto_pred', next ? '1' : '0');
    } catch {
      // ignore
    }
    showToast(
      next
        ? 'Auto Prediction enabled — signals lock automatically on new rounds'
        : 'Auto Prediction paused — manual Next Prediction active',
      'win'
    );
  };

  const handleClearHistory = () => {
    const reset: UserData = {
      stats: { t: 0, w: 0, l: 0, j: 0, n1h: 0, n2h: 0, bsw: 0, bsl: 0 },
      predictions: [],
    };
    setUserData(reset);
    pendingPredictionRef.current = null;
    recentMatchedPatternsRef.current = [];
    lossTrackerRef.current = createInitialLossTrackerState();
    setCurrentPrediction(null);
    try {
      localStorage.setItem('cyrus_ai_v1', JSON.stringify(reset));
      localStorage.setItem('novexa_loss_tracker_v1', JSON.stringify(lossTrackerRef.current));
    } catch {
      // ignore
    }
    showToast('History cleared', 'win');
  };

  // Clock ticker
  useEffect(() => {
    const int = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(int);
  }, []);

  // Fast API Fetch logic using exact DARKSIDE draw.ar-lottery01.com WinGo API + local proxy cache
  const fetchAPIRecords = useCallback(async (targetMode: GameMode, forceFresh = false): Promise<ApiRecord[]> => {
    setStatusText('Syncing live round data…');
    const modeKey = targetMode === '30s' ? '30s' : '1m';
    const apiFolder = targetMode === '30s' ? 'WinGo_30S' : 'WinGo_1M';
    const localProxyUrl = `/api/wingo/history?mode=${modeKey}&limit=1000${forceFresh ? `&fresh=1&t=${Date.now()}` : ''}`;
    const darksidePrimaryUrl = `https://draw.ar-lottery01.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?t=${Date.now()}`;
    const darksideFallbackUrl = `https://draw.ar-lottery01.com/WinGo/${apiFolder}/GetHistoryIssuePage.json?pageSize=10&t=${Date.now()}`;

    const parseJSON = (json: unknown): ApiRecord[] => {
      if (!json || typeof json !== 'object') return [];
      const anyJ = json as Record<string, unknown>;
      let raw: unknown[] = [];

      if (anyJ.data && typeof anyJ.data === 'object' && Array.isArray((anyJ.data as Record<string, unknown>).list)) {
        raw = (anyJ.data as Record<string, unknown>).list as unknown[];
      } else if (Array.isArray(anyJ.list)) {
        raw = anyJ.list;
      } else if (Array.isArray(json)) {
        raw = json;
      }

      const parsed: ApiRecord[] = [];
      for (const it of raw) {
        if (!it || typeof it !== 'object') continue;
        const o = it as Record<string, unknown>;
        let p: string | null = null;
        let n: number | null = null;

        for (const k of ['issueNumber', 'issue', 'periodNumber', 'period', 'roundId', 'gameNo', 'id']) {
          if (o[k] !== undefined) {
            p = String(o[k]);
            break;
          }
        }

        for (const k of ['number', 'openNumber', 'num', 'result', 'open', 'winNumber']) {
          const v = parseInt(String(o[k]));
          if (!isNaN(v) && v >= 0 && v <= 9) {
            n = v;
            break;
          }
        }

        const sizeVal = o.size ? String(o.size) : undefined;
        const colVal = o.colour || o.color ? String(o.colour || o.color) : undefined;
        const timeVal = o.time ? String(o.time) : undefined;

        if (p && n !== null) {
          parsed.push({
            period: p,
            number: n,
            size: sizeVal,
            colour: colVal,
            time: timeVal,
          });
        }
      }
      return parsed;
    };

    // 1. High-speed local backend proxy (fed live from draw.ar-lottery01.com + accumulated rolling history)
    try {
      const r = await fetch(localProxyUrl, {
        signal: AbortSignal.timeout(1800),
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      if (r.ok) {
        const j = await r.json();
        const recs = parseJSON(j);
        if (recs.length > 0) return recs;
      }
    } catch {
      // proceed to direct draw.ar-lottery01.com
    }

    // 2. Direct DARKSIDE Primary URL (draw.ar-lottery01.com)
    try {
      const r = await fetch(darksidePrimaryUrl, {
        signal: AbortSignal.timeout(2500),
        cache: 'no-store',
      });
      if (r.ok) {
        const j = await r.json();
        const recs = parseJSON(j);
        if (recs.length > 0) return recs;
      }
    } catch {
      // proceed to fallback
    }

    // 3. Direct DARKSIDE Fallback URL (draw.ar-lottery01.com?pageSize=10)
    try {
      const r = await fetch(darksideFallbackUrl, {
        signal: AbortSignal.timeout(2500),
        cache: 'no-store',
      });
      if (r.ok) {
        const j = await r.json();
        const recs = parseJSON(j);
        if (recs.length > 0) return recs;
      }
    } catch {
      // no mock fallback: real data only
    }

    return [];
  }, []);

  // Process live records with DARKSIDE validation, deduping, newest-first ordering & outcome settlement
  const processRecords = useCallback(
    (records: ApiRecord[], forMode: GameMode) => {
      if (forMode !== activeModeRef.current) return;

      const normalized = normalizeDarksideHistory(records);
      const sorted: ApiRecord[] = normalized.records.map((v) => ({
        period: v.issueNumber,
        number: v.number,
        size: v.size,
        colour: v.colorType,
        time: v.time,
      }));

      if (sorted.length === 0) return;

      const latestPeriod = sorted[0].period;
      const calculatedNextPid = String(AnshCore.nextPeriod(latestPeriod));

      const isNewPeriod = curPeriodRef.current !== latestPeriod;
      if (isNewPeriod) {
        isWaitingForNewPeriodRef.current = false;
        curPeriodRef.current = latestPeriod;
        setCurPeriod(latestPeriod);
        setNextPeriod(calculatedNextPid);
        setApiRecords(sorted);
        setIsLive(true);
        setLastUpdatedAt(new Date().toLocaleTimeString());
        setStatusText(`LIVE · Next ${calculatedNextPid.slice(-6)}`);
      }

      // Check result for pending prediction
      if (pendingPredictionRef.current && pendingPredictionRef.current.period === latestPeriod) {
        const match = sorted.find((r) => r.period === latestPeriod);
        const activePending = pendingPredictionRef.current;
        pendingPredictionRef.current = null;
        setCurrentPrediction(null);

        if (match) {
          const actual = match.number;
          const pred = activePending.prediction;
          const actualBS = bsOf(actual);
          const outcome = evaluateDarksideResult(pred.size, pred.oppNum, actual);

          // Adaptive persistent pattern & consecutive loss tracking
          const nextTracker = updateLossTrackerOutcome(lossTrackerRef.current, {
            period: latestPeriod,
            predSize: pred.size,
            predOppNum: pred.oppNum,
            pattern: pred.pattern,
            actualNumber: actual,
          });
          lossTrackerRef.current = nextTracker;
          try {
            localStorage.setItem('novexa_loss_tracker_v1', JSON.stringify(nextTracker));
          } catch {
            // ignore
          }

          setUserData((prev) => {
            const newStats = {
              t: prev.stats.t,
              w: outcome.isWin ? prev.stats.w + 1 : prev.stats.w,
              l: outcome.isWin ? prev.stats.l : prev.stats.l + 1,
              j: outcome.isJackpot ? (prev.stats.j || 0) + 1 : (prev.stats.j || 0),
              n1h: prev.stats.n1h || 0,
              n2h: outcome.num2Hit ? (prev.stats.n2h || 0) + 1 : (prev.stats.n2h || 0),
              bsw: outcome.isSizeWin ? (prev.stats.bsw || 0) + 1 : (prev.stats.bsw || 0),
              bsl: outcome.isSizeWin ? (prev.stats.bsl || 0) : (prev.stats.bsl || 0) + 1,
            };

            let found = false;
            const updatedList: StoredPrediction[] = prev.predictions.map((p) => {
              if (p.period === latestPeriod) {
                found = true;
                return {
                  ...p,
                  actualNumber: actual,
                  actualBS: actualBS as 'BIG' | 'SMALL',
                  actualColor: (actual % 2 === 0 ? 'RED' : 'GREEN') as 'RED' | 'GREEN',
                  result: outcome.code,
                  num1Hit: false,
                  num2Hit: outcome.num2Hit,
                  isSizeWin: outcome.isSizeWin,
                  bsWin: outcome.isSizeWin,
                  numHit: outcome.num2Hit,
                  bothHit: outcome.bothHit,
                  failedPattern: outcome.isSizeWin ? null : pred.pattern,
                };
              }
              return p;
            });

            if (!found) {
              updatedList.unshift({
                period: latestPeriod,
                prediction: pred.label,
                predNum: pred.oppNum,
                oppNum: pred.oppNum,
                predBS: pred.size,
                jackpotBS: pred.size,
                logics: pred.logics,
                actualNumber: actual,
                actualBS: actualBS as 'BIG' | 'SMALL',
                actualColor: (actual % 2 === 0 ? 'RED' : 'GREEN') as 'RED' | 'GREEN',
                result: outcome.code,
                num1Hit: false,
                num2Hit: outcome.num2Hit,
                isSizeWin: outcome.isSizeWin,
                bsWin: outcome.isSizeWin,
                numHit: outcome.num2Hit,
                bothHit: outcome.bothHit,
                failedPattern: outcome.isSizeWin ? null : pred.pattern,
                status: pred.status,
                analysis: pred.analysis,
                time: new Date().toLocaleTimeString(),
                confidence: pred.confidence,
                pattern: pred.pattern,
                patternName: pred.patternName,
                patternDetail: pred.patternDetail,
                isDragon: pred.isDragon,
                isSureshot: pred.isSureshot,
                reasoning: pred.reasoning,
                engineAnalysis: pred.engineAnalysis,
              });
            }

            const updated: UserData = {
              stats: newStats,
              predictions: updatedList.slice(0, 100),
            };
            try {
              localStorage.setItem('cyrus_ai_v1', JSON.stringify(updated));
            } catch {
              // ignore
            }

            if (user) {
              updateDoc(doc(db, 'users', user.uid), {
                stats: newStats,
                updatedAt: new Date().toISOString(),
              }).catch(() => {});
            }

            return updated;
          });

          if (curPage === 'pred') {
            setWinLossModal({
              isOpen: true,
              isWin: outcome.isWin,
              isJackpot: outcome.isJackpot,
              isUltraJackpot: false,
              predNum: pred.oppNum,
              oppNum: pred.oppNum,
              predBS: pred.size,
              actualNumber: actual,
              actualBS,
              confidence: pred.confidence,
              period: latestPeriod,
            });
          }
        }
      }

      if (isNewPeriod) {
        setCurrentPrediction(null);
      }
    },
    [curPage, user]
  );

  // Poll runner: 1-second continuous check for fresh rounds
  const isPollingRef = useRef<boolean>(false);

  useEffect(() => {
    let mounted = true;
    let timerId: ReturnType<typeof setInterval> | null = null;

    const run = async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      try {
        const target = curMode;
        const force = isWaitingForNewPeriodRef.current;
        const recs = await fetchAPIRecords(target, force);
        if (mounted && recs && recs.length > 0 && activeModeRef.current === target) {
          processRecords(recs, target);
        }
      } catch {
        // network silent retry on next 1s tick
      } finally {
        isPollingRef.current = false;
      }
    };

    run();
    timerId = setInterval(run, 1000);

    return () => {
      mounted = false;
      if (timerId) clearInterval(timerId);
    };
  }, [curMode, fetchAPIRecords, processRecords]);

  // Countdown timer loop with instant round completion fetch
  useEffect(() => {
    const total = curMode === '30s' ? 30 : 60;
    setTotalCountdown(total);

    const tick = () => {
      const secInCycle = new Date().getSeconds() % total;
      const remain = total - secInCycle;
      setCountdownSec(remain > 0 ? remain : total);

      // When round expires (<= 3s remaining or right at start of new cycle),
      // arm the fast 1-second checker to poll game API until new period data arrives
      if (remain <= 3 || remain >= total - 1) {
        isWaitingForNewPeriodRef.current = true;
      }

      // Fast check at round boundary every second with forceFresh until new period arrives
      if (remain <= 4 || isWaitingForNewPeriodRef.current) {
        fetchAPIRecords(curMode, true)
          .then((recs) => {
            if (recs && recs.length > 0 && activeModeRef.current === curMode) {
              processRecords(recs, curMode);
            }
          })
          .catch(() => {});
      }
    };

    tick();
    const cdInt = setInterval(tick, 1000);
    return () => clearInterval(cdInt);
  }, [curMode, fetchAPIRecords, processRecords]);

  const handleSelectGame = (mode: GameMode) => {
    setNavDirection(1);
    setCurMode(mode);
    setCurPage('pred');
    showToast(`Entered WinGo ${mode === '30s' ? '30 Sec' : '1 Min'}`, 'win');
  };

  const handleSwitchMode = (mode: GameMode) => {
    if (mode === curMode) return;
    activeModeRef.current = mode;
    curPeriodRef.current = '';
    setCurMode(mode);
    setCurPeriod('');
    setNextPeriod('');
    setApiRecords([]);
    setCurrentPrediction(null);
    pendingPredictionRef.current = null;
    recentMatchedPatternsRef.current = [];
    setStatusText(`Syncing WinGo ${mode === '30s' ? '30 Sec' : '1 Min'}…`);
    showToast(`Switched to WinGo ${mode === '30s' ? '30 Sec' : '1 Min'}`, 'win');

    // Instantly fetch live rounds for the newly selected mode
    fetchAPIRecords(mode).then((recs) => {
      if (recs && recs.length > 0 && activeModeRef.current === mode) {
        processRecords(recs, mode);
      }
    });
  };

  const handleManualRefresh = useCallback(async () => {
    if (isManualRefreshing) return;
    setIsManualRefreshing(true);
    try {
      const target = activeModeRef.current;
      const recs = await fetchAPIRecords(target, true);
      if (recs && recs.length > 0 && activeModeRef.current === target) {
        processRecords(recs, target);
        setLastUpdatedAt(new Date().toLocaleTimeString());
        showToast('Live WinGo data refreshed', 'win');
      } else {
        showToast('Could not reach live API — retrying automatically', 'err');
      }
    } catch {
      showToast('Refresh failed', 'err');
    } finally {
      setIsManualRefreshing(false);
    }
  }, [fetchAPIRecords, isManualRefreshing, processRecords, showToast]);

  const handleRequestPrediction = useCallback(
    (isAutoTrigger = false) => {
      const isPreviewAutostart =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('autostart') === '1';
      if (!user && !isPreviewAutostart) {
        if (!isAutoTrigger) {
          sound.playTap();
          setLoginReason('Sign in is required to generate real-time AI predictions');
          setIsLoginOpen(true);
          showToast('Sign in required for live predictions', 'err');
        }
        return;
      }

      if (isPredicting) return;

      if (apiRecords.length < 5) {
        if (!isAutoTrigger) {
          sound.playTap();
          showToast('Waiting for at least 5 live draws from API…', 'err');
        }
        return;
      }

      const targetPid = nextPeriod || (curPeriod ? String(AnshCore.nextPeriod(curPeriod)) : '');
      if (!targetPid) return;

      const existingStored = userData.predictions.some((p) => p.period === targetPid);
      if (pendingPredictionRef.current?.period === targetPid || existingStored) {
        if (!isAutoTrigger) {
          sound.playTap();
          showToast(`Prediction already locked for ${targetPid.slice(-5)}`, 'win');
        }
        return;
      }

      setIsPredicting(true);
      if (!isAutoTrigger) sound.playTap();

      const pred = generateDarksideSignal(targetPid, apiRecords, {
        excludePeriod: targetPid,
        recentMatchedPatterns: recentMatchedPatternsRef.current,
        tracker: lossTrackerRef.current,
      });

      setCurrentPrediction(pred);

      sound.playLock();

      pendingPredictionRef.current = {
        period: targetPid,
        prediction: pred,
      };

      showToast(
        `${isAutoTrigger ? 'Auto ' : ''}Signal Locked: ${pred.size} ${pred.oppNum} (${pred.confidence}%)`,
        'win'
      );

      setUserData((prev) => {
        const alreadyHas = prev.predictions.some((p) => p.period === targetPid);
        if (alreadyHas) return prev;

        const newEntry: StoredPrediction = {
          period: targetPid,
          prediction: pred.label,
          predNum: pred.oppNum,
          oppNum: pred.oppNum,
          predBS: pred.size,
          jackpotBS: pred.size,
          logics: pred.logics,
          actualNumber: -1,
          actualBS: '—',
          actualColor: '—',
          result: 'PENDING',
          status: pred.status,
          analysis: pred.analysis,
          time: new Date().toLocaleTimeString(),
          confidence: pred.confidence,
          pattern: pred.pattern,
          patternName: pred.patternName,
          patternDetail: pred.patternDetail,
          isDragon: pred.isDragon,
          isSureshot: pred.isSureshot,
          reasoning: pred.reasoning,
          engineAnalysis: pred.engineAnalysis,
        };

        const updated: UserData = {
          stats: {
            ...prev.stats,
            t: prev.stats.t + 1,
          },
          predictions: [newEntry, ...prev.predictions].slice(0, 100),
        };

        try {
          localStorage.setItem('cyrus_ai_v1', JSON.stringify(updated));
        } catch {
          // ignore
        }

        return updated;
      });

      setTimeout(() => setIsPredicting(false), 450);
    },
    [apiRecords, curPeriod, isPredicting, nextPeriod, showToast, user, userData.predictions]
  );

  // Auto Prediction Loop: When enabled in Settings, automatically analyzes latest settled draws
  // and locks every incoming period without duplicate recalculation.
  useEffect(() => {
    if (!autoPrediction || !user || isPredicting) return;
    if (!nextPeriod || !curPeriod || apiRecords.length < 5) return;
    if (pendingPredictionRef.current?.period === nextPeriod) return;
    if (userData.predictions.some((p) => p.period === nextPeriod)) return;

    const timer = setTimeout(() => {
      handleRequestPrediction(true);
    }, 180);

    return () => clearTimeout(timer);
  }, [
    autoPrediction,
    user,
    isPredicting,
    nextPeriod,
    curPeriod,
    apiRecords.length,
    userData.predictions,
    handleRequestPrediction,
  ]);

  return (
    <>
      {authLoading && !user && (
        <div className="fixed inset-0 z-[95] bg-[#030a07] flex flex-col items-center justify-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full animate-novexa-orbit"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, transparent 210deg, rgba(16, 185, 129, 0.9) 310deg, rgba(110, 231, 183, 0.95) 360deg)',
                WebkitMask:
                  'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 1.5px))',
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 1.5px))',
              }}
            />
            <img
              src="/assets/novexa_dp.png"
              alt="NOVEXA AI"
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>
      )}

      <div className="min-h-screen text-[var(--ink)] transition-colors duration-500 overflow-x-hidden relative flex flex-col">
        <ParticlesBackground enabled={particlesEnabled} />

        {/* Dynamic Apple Liquid Glass Navbar */}
        <div className="relative z-30 shrink-0">
          <Navbar
            curPage={curPage}
            onNavigate={(targetPage) => {
              const currentIdx = PAGE_ORDER[curPage] ?? 0;
              const targetIdx = PAGE_ORDER[targetPage] ?? 0;
              setNavDirection(targetIdx >= currentIdx ? 1 : -1);
              setCurPage(targetPage);
            }}
            onBack={() => {
              setNavDirection(-1);
              setCurPage('games');
            }}
            onOpenSettings={() => {
              setNavDirection(1);
              setCurPage('settings');
            }}
            onOpenLogin={() => {
              setLoginReason('Sign in to sync your stats in cloud & unlock signals');
              setIsLoginOpen(true);
            }}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
            isNight={isNight}
            onToggleNight={handleToggleNight}
            statusText={statusText}
            isLive={isLive}
            currentTime={currentTime}
            onRefreshData={handleManualRefresh}
            isRefreshing={isManualRefreshing}
          />
        </div>

        {/* Main Workspace Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto relative z-10 min-h-[460px]">
          <motion.div
            key={curPage}
            initial={{ opacity: 0, y: navDirection >= 0 ? 8 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {curPage === 'games' && (
              <GamesView
                onSelectGame={handleSelectGame}
                onShowToast={showToast}
                onNavigateToPortal={() => {
                  setNavDirection(1);
                  setCurPage('portal');
                }}
                onNavigateToHistory={() => {
                  setNavDirection(1);
                  setCurPage('hist');
                }}
                userData={userData}
                apiRecords={apiRecords}
                curMode={curMode}
                nextPeriod={nextPeriod}
                countdownSec={countdownSec}
                lastUpdatedAt={lastUpdatedAt}
                userName={user ? profileName : undefined}
              />
            )}

            {curPage === 'pred' && (
              <PredictionView
                mode={curMode}
                onSwitchMode={handleSwitchMode}
                nextPeriod={nextPeriod}
                countdownSec={countdownSec}
                totalCountdown={totalCountdown}
                apiRecords={apiRecords}
                prediction={currentPrediction}
                userData={userData}
                isPredicting={isPredicting}
                isLoggedIn={!!user}
                autoPrediction={autoPrediction}
                confidenceThreshold={confidenceThreshold}
                onRefreshData={handleManualRefresh}
                isRefreshing={isManualRefreshing}
                lastUpdatedAt={lastUpdatedAt}
                onShowToast={showToast}
                onRequestPrediction={() => handleRequestPrediction(false)}
              />
            )}

            {curPage === 'portal' && (
              <GamePortalView
                onShowToast={showToast}
                prediction={currentPrediction}
                countdownSec={countdownSec}
                nextPeriod={nextPeriod}
                onRequestPrediction={() => handleRequestPrediction(false)}
                onNavigateHome={() => {
                  setNavDirection(-1);
                  setCurPage('games');
                }}
                curMode={curMode}
                onSwitchMode={handleSwitchMode}
              />
            )}

            {curPage === 'hist' && (
              <HistoryView
                userData={userData}
                onNavigateToGames={() => setCurPage('pred')}
                onShowToast={showToast}
              />
            )}

            {curPage === 'settings' && (
              <SettingsView
                currentTheme={curTheme}
                onSelectTheme={handleSelectTheme}
                isNight={isNight}
                onToggleNight={handleToggleNight}
                isAmoled={isAmoled}
                onToggleAmoled={handleToggleAmoled}
                particlesEnabled={particlesEnabled}
                onToggleParticles={() => setParticlesEnabled(!particlesEnabled)}
                soundEnabled={soundEnabled}
                onToggleSound={handleToggleSound}
                voiceEnabled={voiceEnabled}
                onToggleVoice={handleToggleVoice}
                autoPrediction={autoPrediction}
                onToggleAutoPrediction={handleToggleAutoPrediction}
                aiEngineMode={aiEngineMode}
                onSelectAiEngineMode={handleSelectAiEngineMode}
                confidenceThreshold={confidenceThreshold}
                onSelectConfidenceThreshold={handleSelectConfidenceThreshold}
                onClearHistory={handleClearHistory}
                onExportHistory={handleExportHistory}
                onOpenLogin={() => {
                  setLoginReason('Sign in to sync your stats in cloud & unlock signals');
                  setIsLoginOpen(true);
                }}
                onShowToast={showToast}
              />
            )}
          </motion.div>
        </main>

        {/* Mobile Floating Glass Bottom Navigation */}
        <BottomNav
          curPage={curPage}
          onNavigate={(targetPage) => {
            const currentIdx = PAGE_ORDER[curPage] ?? 0;
            const targetIdx = PAGE_ORDER[targetPage] ?? 0;
            setNavDirection(targetIdx >= currentIdx ? 1 : -1);
            setCurPage(targetPage);
          }}
        />

        {/* Floating Telegram Link */}
        <FloatingTelegramButton />

        {/* Win / Loss Outcome Modal */}
        <WinLossModal
          isOpen={winLossModal.isOpen}
          isWin={winLossModal.isWin}
          isJackpot={winLossModal.isJackpot}
          isUltraJackpot={winLossModal.isUltraJackpot}
          predNum={winLossModal.predNum}
          oppNum={winLossModal.oppNum}
          predBS={winLossModal.predBS}
          actualNumber={winLossModal.actualNumber}
          actualBS={winLossModal.actualBS}
          confidence={winLossModal.confidence}
          period={winLossModal.period}
          onClose={() => setWinLossModal((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* Accent Palette Modal */}
        {isThemeModalOpen && (
          <ThemeModal
            isOpen={isThemeModalOpen}
            currentTheme={curTheme}
            onSelectTheme={handleSelectTheme}
            onClose={() => setIsThemeModalOpen(false)}
          />
        )}

        {/* Liquid Glass Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl liquid-glass text-xs sm:text-sm font-['Sora'] font-semibold text-[var(--ink)] flex items-center gap-2 max-w-[90vw]"
            >
              {toast.type === 'win' ? (
                <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span className="truncate">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full-Screen Video Login Page rendered at root viewport level */}
      <LoginPage
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          showToast('Welcome to NOVEXA AI', 'win');
        }}
        reason={loginReason}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
