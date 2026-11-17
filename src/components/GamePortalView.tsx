/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  ExternalLink,
  Play,
  Zap,
  Check,
  Copy,
  ChevronLeft,
  Minimize2,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { EnsembleResult } from '../utils/aiEngine';
import { GameMode } from '../types';

interface GamePortalViewProps {
  onShowToast: (msg: string, type?: 'win' | 'err') => void;
  prediction?: EnsembleResult | null;
  countdownSec?: number;
  nextPeriod?: string;
  onRequestPrediction?: () => void;
  onNavigateHome?: () => void;
  curMode?: GameMode;
  onSwitchMode?: (mode: GameMode) => void;
}

export interface GamePlatform {
  id: string;
  platform: '9k-club' | 'dhani-win';
  title: string;
  tagline: string;
  url: string;
  inviteCode: string;
  badge: string;
  cycle: 'all' | '30s' | '1M';
  targetMode?: GameMode;
  tintClass: string;
  features: string[];
}

const OFFICIAL_GAMES: GamePlatform[] = [
  {
    id: '9k-club-30s',
    platform: '9k-club',
    title: '9K CLUB — WinGo 30s',
    tagline: 'Fast 30-second rounds on 9K Club with synchronized NOVEXA HUD',
    url: 'https://9k545.com/register?inviteCode=HFS25AN&from=web',
    inviteCode: 'HFS25AN',
    badge: '30s Fast',
    cycle: '30s',
    targetMode: '30s',
    tintClass: 'from-[var(--accent)]/18 via-[var(--c2)]/6 to-transparent',
    features: ['30s Cycle Auto-Sync', 'Live NOVEXA HUD', 'VIP Invite HFS25AN'],
  },
  {
    id: 'dhani-win-30s',
    platform: 'dhani-win',
    title: 'DHANI WIN — WinGo 30s',
    tagline: 'High-frequency 30-second room on Dhani Win with DARKSIDE fusion',
    url: 'https://dhaniwin9.com/register?inviteCode=HRJ4KLN&from=web',
    inviteCode: 'HRJ4KLN',
    badge: '30s Fast',
    cycle: '30s',
    targetMode: '30s',
    tintClass: 'from-[var(--c2)]/16 via-[var(--accent)]/6 to-transparent',
    features: ['30s Cycle Auto-Sync', 'DARKSIDE Engine', 'Invite HRJ4KLN'],
  },
  {
    id: '9k-club-1m',
    platform: '9k-club',
    title: '9K CLUB — WinGo 1M',
    tagline: 'Classic 60-second market window on 9K Club with pattern consensus',
    url: 'https://9k545.com/register?inviteCode=HFS25AN&from=web',
    inviteCode: 'HFS25AN',
    badge: '1M Classic',
    cycle: '1M',
    targetMode: '1M',
    tintClass: 'from-[var(--c3)]/16 via-[var(--c4)]/6 to-transparent',
    features: ['1M Cycle Auto-Sync', 'DARKSIDE Consensus', 'VIP Invite HFS25AN'],
  },
  {
    id: 'dhani-win-1m',
    platform: 'dhani-win',
    title: 'DHANI WIN — WinGo 1M',
    tagline: 'Balanced 60-second room on Dhani Win with AnshCore & Pattern DB overlay',
    url: 'https://dhaniwin9.com/register?inviteCode=HRJ4KLN&from=web',
    inviteCode: 'HRJ4KLN',
    badge: '1M Classic',
    cycle: '1M',
    targetMode: '1M',
    tintClass: 'from-[var(--accent)]/15 via-[var(--c4)]/6 to-transparent',
    features: ['1M Cycle Auto-Sync', 'Opposite Number Output', 'Invite HRJ4KLN'],
  },
  {
    id: '9k-club-lobby',
    platform: '9k-club',
    title: '9K CLUB — Full Lobby',
    tagline: 'Official 9K Club full platform access across all WinGo markets',
    url: 'https://9k545.com/register?inviteCode=HFS25AN&from=web',
    inviteCode: 'HFS25AN',
    badge: 'All Rooms',
    cycle: 'all',
    tintClass: 'from-[var(--c2)]/14 via-[var(--accent)]/5 to-transparent',
    features: ['WinGo 30s & 1M', '1s API Sync', 'VIP Invite HFS25AN'],
  },
  {
    id: 'dhani-win-lobby',
    platform: 'dhani-win',
    title: 'DHANI WIN — Full Lobby',
    tagline: 'Official Dhani Win complete portal with draggable signal HUD',
    url: 'https://dhaniwin9.com/register?inviteCode=HRJ4KLN&from=web',
    inviteCode: 'HRJ4KLN',
    badge: 'All Rooms',
    cycle: 'all',
    tintClass: 'from-[var(--c3)]/14 via-[var(--accent)]/5 to-transparent',
    features: ['WinGo 30s & 1M', 'Live HUD Support', 'Invite HRJ4KLN'],
  },
];

type GameFilterKey = 'all' | '30s' | '1M' | '9k-club' | 'dhani-win';

export const GamePortalView: React.FC<GamePortalViewProps> = ({
  onShowToast,
  prediction,
  countdownSec = 60,
  nextPeriod,
  onRequestPrediction,
  onNavigateHome,
  curMode = '1M',
  onSwitchMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<GameFilterKey>('all');
  const [activeGame, setActiveGame] = useState<GamePlatform | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isHudMinimized, setIsHudMinimized] = useState<boolean>(false);
  const [hudPos, setHudPos] = useState<{ x: number; y: number }>({ x: 12, y: 58 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number }>({
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
  });

  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return OFFICIAL_GAMES.filter((g) => {
      const matchFilter =
        selectedFilter === 'all' ||
        g.platform === selectedFilter ||
        g.cycle === selectedFilter;
      const matchSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.tagline.toLowerCase().includes(q) ||
        g.badge.toLowerCase().includes(q) ||
        g.inviteCode.toLowerCase().includes(q) ||
        g.features.some((f) => f.toLowerCase().includes(q));
      return matchFilter && matchSearch;
    });
  }, [searchQuery, selectedFilter]);

  const handleCopyCode = (id: string, code: string) => {
    sound.playTap();
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedId(id);
    onShowToast(`Invite code ${code} copied`, 'win');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleLaunchGame = (game: GamePlatform) => {
    sound.playTap();
    if (game.targetMode && game.targetMode !== curMode) {
      onSwitchMode?.(game.targetMode);
    }
    setActiveGame(game);
    setIsHudMinimized(false);
    onShowToast(`Opening ${game.title} with NOVEXA HUD`, 'win');
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: hudPos.x,
      startY: hudPos.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const maxX = typeof window !== 'undefined' ? window.innerWidth - (isHudMinimized ? 70 : 244) : 200;
    const maxY = typeof window !== 'undefined' ? window.innerHeight - (isHudMinimized ? 70 : 290) : 400;

    setHudPos({
      x: Math.max(8, Math.min(maxX, dragStartRef.current.startX + dx)),
      y: Math.max(50, Math.min(maxY, dragStartRef.current.startY + dy)),
    });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="pb-28 px-3.5 sm:px-6 pt-3 animate-fade-up max-w-full space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onNavigateHome && (
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onNavigateHome();
              }}
              className="h-9 px-3 rounded-xl liquid-glass-card text-[var(--ink)] font-['Sora'] font-semibold text-xs flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-[var(--accent)]" />
              <span>Overview</span>
            </button>
          )}
          <div>
            <p className="text-[11px] font-['Space_Grotesk'] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Play &amp; Live Signal Overlay
            </p>
            <h1 className="text-2xl sm:text-3xl font-['Sora'] font-extrabold text-[var(--ink)] tracking-tight">
              Game Hub
            </h1>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl liquid-glass-card text-xs font-['Sora'] font-bold text-[var(--ink)] flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>
            {prediction ? `${prediction.bs} ${prediction.oppNum}` : 'Signal Standby'}
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-2.5">
        <div className="relative flex items-center liquid-glass-card rounded-2xl overflow-hidden focus-within:border-[var(--accent)]/60 transition-colors">
          <Search className="w-4 h-4 text-[var(--accent)] ml-4 shrink-0" />
          <input
            type="text"
            aria-label="Search games"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games (e.g. 9K Club, Dhani Win, 30s, 1M, or invite code)…"
            className="w-full py-3 px-3 text-xs sm:text-sm font-medium bg-transparent text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none"
          />
          <span className="hidden sm:inline text-[11px] font-['Space_Grotesk'] font-semibold text-[var(--muted)] mr-3 shrink-0 tabular-nums">
            {filteredGames.length} / {OFFICIAL_GAMES.length}
          </span>
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear game search"
              onClick={() => {
                sound.playTap();
                setSearchQuery('');
              }}
              className="mr-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl liquid-glass-card">
          {[
            { id: 'all' as const, label: `All Games (${OFFICIAL_GAMES.length})` },
            { id: '30s' as const, label: '30s Fast' },
            { id: '1M' as const, label: '1M Classic' },
            { id: '9k-club' as const, label: '9K CLUB' },
            { id: 'dhani-win' as const, label: 'DHANI WIN' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.playTap();
                setSelectedFilter(tab.id);
              }}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-['Sora'] font-semibold transition-all cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-deep)] border border-[var(--accent)]/40 shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Game Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGames.map((game, idx) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-[26px] liquid-glass-card relative overflow-hidden p-5 flex flex-col justify-between gap-4 hover:border-[var(--accent)]/50 transition-colors"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${game.tintClass} pointer-events-none`} />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-[10.5px] font-['Sora'] font-bold bg-[var(--accent-soft)] text-[var(--accent-deep)] border border-[var(--accent)]/25">
                  {game.badge}
                </span>
                <span className="text-[11px] font-medium text-[var(--muted)]">
                  Live HUD Ready
                </span>
              </div>

              <div>
                <h2 className="font-['Sora'] font-extrabold text-xl text-[var(--ink)] tracking-tight">
                  {game.title}
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">{game.tagline}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-[var(--line)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[10.5px] font-semibold text-[var(--muted)] uppercase">
                    Invite Code
                  </span>
                  <span className="font-['Space_Grotesk'] font-bold text-sm text-[var(--ink)] tracking-wider">
                    {game.inviteCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(game.id, game.inviteCode)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-['Sora'] font-semibold flex items-center gap-1 bg-[var(--paper)] dark:bg-white/[0.08] text-[var(--ink)] border border-[var(--line)] cursor-pointer active:scale-95"
                >
                  {copiedId === game.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[var(--muted)]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {game.features.map((feat, i) => (
                  <span
                    key={i}
                    className="text-[10.5px] px-2 py-0.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] border border-[var(--line)] text-[var(--muted)] font-medium"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-3 border-t border-[var(--line)] flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLaunchGame(game)}
                className="flex-1 min-w-0 py-2.5 px-3 sm:px-4 rounded-xl font-['Sora'] font-bold text-xs sm:text-sm text-white shadow-sm active:scale-97 transition-all cursor-pointer flex items-center justify-center gap-1.5 ios-emerald-btn truncate"
              >
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span className="truncate">Play with NOVEXA HUD</span>
              </button>

              <a
                href={game.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playTap()}
                className="py-2.5 px-3 sm:px-3.5 rounded-xl font-['Sora'] font-semibold text-xs bg-black/[0.04] dark:bg-white/[0.06] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--accent)]/40 transition-all flex items-center gap-1 shrink-0"
                title="Open in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[var(--muted)]" />
                <span>Direct</span>
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="p-8 text-center rounded-[26px] liquid-glass-card">
          <p className="font-['Sora'] font-bold text-sm text-[var(--ink)]">
            No games matched "{searchQuery}"
          </p>
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setSearchQuery('');
              setSelectedFilter('all');
            }}
            className="mt-3 px-4 py-2 rounded-xl font-['Sora'] font-bold text-xs bg-[var(--accent-soft)] text-[var(--accent-deep)] cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Fullscreen In-App Game Viewer Modal with Draggable Apple Liquid Glass Signal HUD */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {activeGame && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] w-screen h-[100dvh] flex flex-col bg-[#05070b] overflow-hidden"
              >
                <div className="h-12 px-3 bg-[#090b10]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-2 shrink-0 z-30 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setActiveGame(null);
                    }}
                    className="h-8 px-3 rounded-xl font-['Sora'] font-bold text-xs bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Exit</span>
                  </button>

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-['Sora'] font-bold text-xs sm:text-sm text-white truncate">
                      {activeGame.title}
                    </span>
                    <span className="hidden sm:inline font-['Space_Grotesk'] text-[11px] text-white/55">
                      Code: {activeGame.inviteCode}
                    </span>
                  </div>

                  <a
                    href={activeGame.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.playTap()}
                    className="h-8 px-3 rounded-xl font-['Sora'] font-bold text-xs bg-white text-[#090b10] hover:bg-white/90 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span>Direct</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex-1 relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
                  <iframe
                    src={activeGame.url}
                    title={activeGame.title}
                    className="w-full h-full border-0 select-none"
                    style={{ width: '100%', height: '100%', touchAction: 'manipulation' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />

                  {/* Draggable Floating NOVEXA HUD */}
                  {isHudMinimized ? (
                    <motion.button
                      type="button"
                      aria-label="Expand NOVEXA HUD"
                      style={{
                        position: 'absolute',
                        left: `${hudPos.x}px`,
                        top: `${hudPos.y}px`,
                        touchAction: 'none',
                        zIndex: 50,
                      }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        sound.playTap();
                        setIsHudMinimized(false);
                      }}
                      className="w-13 h-13 rounded-full flex items-center justify-center cursor-pointer shadow-2xl border border-white/25 bg-[#090b10]/90 backdrop-blur-xl p-1.5"
                    >
                      <img
                        src="/assets/novexa_dp.png"
                        alt="NOVEXA HUD"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.94, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.94, opacity: 0 }}
                      style={{
                        position: 'absolute',
                        left: `${hudPos.x}px`,
                        top: `${hudPos.y}px`,
                        touchAction: 'none',
                        zIndex: 50,
                      }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      className="w-[232px] select-none rounded-[24px] p-3 bg-[#090b10]/90 backdrop-blur-2xl border border-white/15 shadow-2xl text-white flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                        <div className="flex items-center gap-1.5">
                          <img src="/assets/novexa_dp.png" alt="NOVEXA" className="w-4 h-4 object-contain" />
                          <span className="font-['Sora'] font-bold text-xs tracking-wide">
                            NOVEXA HUD
                          </span>
                        </div>

                        <button
                          type="button"
                          aria-label="Minimize HUD"
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playTap();
                            setIsHudMinimized(true);
                          }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 cursor-pointer"
                        >
                          <Minimize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 30s / 1M Mode Toggle */}
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/10">
                          {(['30s', '1M'] as GameMode[]).map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.playTap();
                                onSwitchMode?.(m);
                              }}
                              className={`px-2 py-0.5 rounded-md font-['Sora'] font-bold text-[10px] cursor-pointer transition-colors ${
                                curMode === m
                                  ? 'bg-emerald-500 text-white'
                                  : 'text-white/60 hover:text-white'
                              }`}
                            >
                              {m.toUpperCase()}
                            </button>
                          ))}
                        </div>
                        <span className="font-['Space_Grotesk'] font-bold text-xs text-white/90 tabular-nums">
                          {String(Math.floor(countdownSec / 60)).padStart(2, '0')}:
                          {String(countdownSec % 60).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Signal Readout */}
                      <div className="p-2.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/15 flex flex-col items-center justify-center shrink-0">
                          <span className="font-['Sora'] font-extrabold text-lg leading-tight">
                            {prediction ? prediction.oppNum : '—'}
                          </span>
                          <span className="text-[8.5px] text-white/60 uppercase">
                            {prediction ? 'OPP NUM' : 'WAIT'}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-['Space_Grotesk'] text-white/60 tabular-nums">
                            {nextPeriod ? nextPeriod.slice(-5) : '-----'}
                          </div>
                          <div className="font-['Sora'] font-extrabold text-sm mt-0.5">
                            {prediction ? prediction.bs : 'STANDBY'}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-semibold tabular-nums">
                            {prediction ? `${prediction.confidence}% Conf.` : 'READY'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playTap();
                            onRequestPrediction?.();
                          }}
                          className="flex-1 h-8 rounded-xl font-['Sora'] font-bold text-xs text-white cursor-pointer active:scale-95 transition-transform"
                          style={{ background: 'var(--grad-deep)' }}
                        >
                          Predict Next
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playTap();
                            setIsHudMinimized(true);
                          }}
                          className="h-8 px-3 rounded-xl font-['Sora'] font-semibold text-xs bg-white/10 text-white/80 hover:bg-white/20 cursor-pointer"
                        >
                          Hide
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
