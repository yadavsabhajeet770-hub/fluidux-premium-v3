/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Key,
  X,
  Zap,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Volume2,
  VolumeX,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/sound';

const LOGIN_BG_VIDEO_URL =
  'https://www.image2url.com/r2/default/videos/1794641654195-4b3f9775-406a-48e4-9945-ffe68251771f.mp4';

interface LoginPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reason?: string | null;
}

type KeyAuthPhase = 'idle' | 'verifying' | 'granted';

export const LoginPage: React.FC<LoginPageProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reason,
}) => {
  const { loginWithGoogle, loginWithKey } = useAuth();
  const [accessKey, setAccessKey] = useState<string>('');
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [keyPhase, setKeyPhase] = useState<KeyAuthPhase>('idle');
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState<boolean>(false);
  const [videoFailed, setVideoFailed] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [introLoading, setIntroLoading] = useState<boolean>(true);
  const [introProgress, setIntroProgress] = useState<number>(20);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setKeyPhase('idle');
    setGoogleLoading(false);
    setIntroLoading(true);
    setIntroProgress(24);

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setIntroProgress(100);
      setIntroLoading(false);
      return;
    }

    const p1 = setTimeout(() => setIntroProgress(68), 120);
    const p2 = setTimeout(() => setIntroProgress(96), 280);
    const p3 = setTimeout(() => {
      setIntroProgress(100);
      setIntroLoading(false);
    }, 480);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const vid = videoRef.current;
    if (!vid) return;

    vid.muted = isMuted;
    const playPromise = vid.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        vid.muted = true;
        setIsMuted(true);
        vid.play().catch(() => {});
      });
    }
  }, [isOpen, isMuted]);

  if (!isOpen) return null;

  const isBusy = googleLoading || keyPhase !== 'idle';

  const handleToggleAudio = () => {
    sound.playTap();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleGoogleLogin = async () => {
    sound.playTap();
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      sound.playWin();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('popup-closed-by-user')) {
        setError(msg.replace('Firebase: ', ''));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleKeyLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isBusy) return;

    sound.playTap();
    setError(null);

    const trimmed = accessKey.trim();
    if (!trimmed) {
      setError('Please enter your NOVEXA VIP Access Key.');
      return;
    }

    setKeyPhase('verifying');
    try {
      await new Promise((resolve) => setTimeout(resolve, 440));
      await loginWithKey(trimmed);
      setKeyPhase('granted');
      sound.playWin();
      await new Promise((resolve) => setTimeout(resolve, 380));
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setKeyPhase('idle');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="novexa-fullscreen-login"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[100] w-screen h-dvh overflow-y-auto overflow-x-hidden bg-[#030a07] text-white"
        role="dialog"
        aria-modal="true"
        aria-label="NOVEXA AI Sign In"
      >
        {/* Full-Screen Background Video + Emerald Obsidian iOS Liquid Glass Mesh */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#030a07]">
          {/* Emerald Obsidian Atmospheric Base */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(1040px 640px at 14% 18%, rgba(16, 185, 129, 0.32) 0%, transparent 60%), radial-gradient(880px 560px at 86% 18%, rgba(20, 184, 166, 0.24) 0%, transparent 58%), radial-gradient(920px 620px at 68% 88%, rgba(5, 150, 105, 0.26) 0%, transparent 60%), linear-gradient(160deg, #020806 0%, #051610 52%, #020a07 100%)',
            }}
          />

          {!videoFailed && (
            <video
              ref={videoRef}
              src={LOGIN_BG_VIDEO_URL}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              onLoadedData={() => setVideoReady(true)}
              onCanPlay={() => setVideoReady(true)}
              onError={() => setVideoFailed(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out will-change-transform ${
                videoReady ? 'opacity-78 scale-100' : 'opacity-0 scale-[1.03]'
              }`}
            />
          )}

          {/* Animated Drifting Emerald iOS Liquid Aurora Lobes */}
          <div
            className="absolute -top-28 -left-24 w-[460px] h-[460px] rounded-full blur-[95px] animate-ios-aurora will-change-transform"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.36), rgba(52,211,153,0.16), transparent 72%)' }}
          />
          <div
            className="absolute -bottom-32 -right-20 w-[520px] h-[520px] rounded-full blur-[105px] animate-ios-aurora will-change-transform"
            style={{
              background: 'radial-gradient(circle, rgba(20,184,166,0.32), rgba(4,120,87,0.20), transparent 72%)',
              animationDelay: '-4.5s',
            }}
          />
          <div
            className="hidden lg:block absolute top-1/3 left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full blur-[100px] animate-ios-aurora will-change-transform"
            style={{
              background: 'radial-gradient(circle, rgba(110,231,183,0.18), rgba(5,150,105,0.12), transparent 72%)',
              animationDelay: '-8s',
            }}
          />

          {/* Measured Contrast Scrims */}
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                'linear-gradient(105deg, rgba(2, 10, 7, 0.84) 0%, rgba(2, 10, 7, 0.44) 48%, rgba(3, 12, 8, 0.78) 100%)',
            }}
          />
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                'linear-gradient(180deg, rgba(2, 10, 7, 0.56) 0%, rgba(2, 10, 7, 0.42) 34%, rgba(2, 10, 7, 0.86) 70%, rgba(2, 10, 7, 0.95) 100%)',
            }}
          />
        </div>

        {/* Apple iOS Emerald Liquid Intro Curtain */}
        <AnimatePresence>
          {introLoading && (
            <motion.div
              key="novexa-intro-loader"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#030a07]/92 backdrop-blur-3xl px-6"
            >
              <div className="relative flex items-center justify-center w-28 h-28">
                {/* Outer Emerald iOS Orbit Ring */}
                <div
                  className="absolute inset-0 rounded-full animate-novexa-orbit will-change-transform"
                  style={{
                    background:
                      'conic-gradient(from 0deg, #047857, #10b981, #34d399, #6ee7b7, #14b8a6, #047857)',
                    WebkitMask:
                      'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
                    mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
                  }}
                />
                {/* Inner Counter-Orbit Ring */}
                <div
                  className="absolute inset-2.5 rounded-full animate-novexa-orbit-reverse will-change-transform"
                  style={{
                    background:
                      'conic-gradient(from 180deg, transparent 0deg, transparent 200deg, rgba(52, 211, 153, 0.9) 300deg, rgba(20, 184, 166, 0.95) 360deg)',
                    WebkitMask:
                      'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
                    mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
                  }}
                />
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-emerald-500/25 via-teal-400/20 to-emerald-300/15 blur-md" />
                <img
                  src="/assets/novexa_dp.png"
                  alt="NOVEXA AI Emblem"
                  className="relative w-16 h-16 object-contain drop-shadow-[0_8px_22px_rgba(16,185,129,0.55)]"
                />
              </div>

              <div className="mt-6 flex flex-col items-center gap-3 w-56">
                <p className="font-['Sora'] text-xs font-bold tracking-[0.24em] text-white/95 uppercase">
                  NOVEXA AI
                </p>
                <div className="w-full h-[3px] rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full w-full origin-left rounded-full bg-gradient-to-r from-emerald-500 via-emerald-300 to-teal-300 transition-transform duration-300 ease-out"
                    style={{ transform: `scaleX(${introProgress / 100})` }}
                  />
                </div>
                <p className="text-[11px] text-emerald-100/65 font-medium tracking-wide">
                  Preparing workspace…
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Floating Controls: Liquid Glass Capsules */}
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[110] flex items-center gap-2.5">
          {!videoFailed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              type="button"
              onClick={handleToggleAudio}
              aria-label={isMuted ? 'Unmute background video' : 'Mute background video'}
              title={isMuted ? 'Unmute background video' : 'Mute background video'}
              className="w-11 h-11 rounded-full bg-emerald-950/45 hover:bg-emerald-900/55 backdrop-blur-2xl border border-emerald-300/25 flex items-center justify-center text-white transition-colors cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.24)]"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white/85" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-300" />
              )}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            type="button"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            aria-label="Close"
            className="w-11 h-11 rounded-full bg-emerald-950/45 hover:bg-emerald-900/55 backdrop-blur-2xl border border-emerald-300/25 flex items-center justify-center text-white transition-colors cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.24)]"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Full-Screen Responsive Layout Grid */}
        <div className="relative z-10 min-h-dvh w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 flex flex-col lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
          {/* Desktop Left Hero Showcase / Mobile Brand Header */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: introLoading ? 0 : 1, y: introLoading ? 18 : 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.04 }}
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left pt-12 sm:pt-10 lg:pt-0 pb-4 lg:pb-0"
          >
            <motion.img
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 360, damping: 26 }}
              src="/assets/novexa_logo_transparent.png"
              alt="NOVEXA AI"
              className="h-14 sm:h-16 lg:h-24 w-auto max-w-[260px] sm:max-w-[320px] lg:max-w-[400px] object-contain drop-shadow-[0_14px_38px_rgba(16,185,129,0.42)] select-none"
            />

            <h1
              className="hidden lg:block mt-6 font-['Sora'] font-extrabold tracking-tight leading-[1.07] max-w-2xl bg-gradient-to-br from-white via-emerald-50 to-emerald-200 bg-clip-text text-transparent"
              style={{
                fontSize: 'clamp(2.35rem, 3.6vw, 3.65rem)',
                textWrap: 'balance',
              }}
            >
              Pattern Intelligence for Every WinGo Round.
            </h1>

            <p className="mt-2.5 lg:mt-4 text-xs sm:text-sm lg:text-base text-emerald-50/85 max-w-xl leading-relaxed font-medium">
              {reason ||
                'Real-time round synchronization, multi-engine consensus, and disciplined volatility protection.'}
            </p>

            {/* Emerald iOS Translucent Glass Stat Strip (Desktop) */}
            <div className="hidden lg:grid grid-cols-3 gap-3.5 mt-9 w-full max-w-xl">
              <div className="p-4 rounded-[22px] bg-emerald-950/35 backdrop-blur-2xl border border-emerald-300/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <div className="font-['Sora'] text-lg font-extrabold bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent tabular-nums">
                  20+ Engines
                </div>
                <div className="mt-1 text-xs text-emerald-100/75">
                  Multi-pattern consensus
                </div>
              </div>
              <div className="p-4 rounded-[22px] bg-emerald-950/35 backdrop-blur-2xl border border-emerald-300/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <div className="font-['Sora'] text-lg font-extrabold bg-gradient-to-r from-teal-200 to-emerald-300 bg-clip-text text-transparent tabular-nums">
                  30s &amp; 1m Live
                </div>
                <div className="mt-1 text-xs text-emerald-100/75">
                  Instant period tracking
                </div>
              </div>
              <div className="p-4 rounded-[22px] bg-emerald-950/35 backdrop-blur-2xl border border-emerald-300/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <div className="font-['Sora'] text-lg font-extrabold bg-gradient-to-r from-emerald-200 to-lime-200 bg-clip-text text-transparent tabular-nums">
                  Smart Skip
                </div>
                <div className="mt-1 text-xs text-emerald-100/75">
                  Pattern quality guard
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Auth Column: Emerald Obsidian Apple iOS Liquid Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{
              opacity: introLoading ? 0 : 1,
              y: introLoading ? 24 : 0,
              scale: introLoading ? 0.96 : 1,
            }}
            transition={{ type: 'spring', stiffness: 310, damping: 26, delay: 0.1 }}
            className="lg:col-span-5 flex justify-center lg:justify-end my-auto lg:my-0 pb-4 lg:pb-0"
          >
            {/* Outer Emerald Specular Glass Rim */}
            <div className="relative w-full max-w-[445px] p-[1.5px] rounded-[34px] bg-gradient-to-br from-emerald-400/55 via-teal-300/35 to-emerald-700/45 shadow-[0_32px_90px_-14px_rgba(16,185,129,0.34),0_20px_60px_-12px_rgba(0,0,0,0.88)]">
              <div className="relative w-full rounded-[32.5px] bg-gradient-to-br from-[#071611]/86 via-[#05100c]/88 to-[#061812]/88 backdrop-blur-3xl saturate-180 text-white p-6 sm:p-7 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(255,255,255,0.06)]">
                {/* Internal Soft Emerald Refraction */}
                <div
                  aria-hidden="true"
                  className="absolute -top-24 -right-20 w-56 h-56 rounded-full bg-gradient-to-br from-emerald-400/22 via-teal-500/16 to-transparent blur-2xl pointer-events-none"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-24 -left-20 w-56 h-56 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-400/12 to-transparent blur-2xl pointer-events-none"
                />

                {/* Top Specular Liquid Edge */}
                <div className="absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent pointer-events-none" />

                {/* Busy / Verifying Emerald Top Beam */}
                {isBusy && (
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-white/10 overflow-hidden pointer-events-none">
                    <div className="h-full w-1/2 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 animate-novexa-scan" />
                  </div>
                )}

                {/* Card Header */}
                <div className="relative z-10 flex items-center gap-3.5">
                  <div className="relative w-13 h-13 rounded-[18px] bg-gradient-to-br from-emerald-400/22 via-teal-400/15 to-emerald-600/22 border border-emerald-300/30 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                    <img
                      src="/assets/novexa_dp.png"
                      alt="NOVEXA"
                      className="w-9 h-9 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-['Sora'] text-lg sm:text-xl font-extrabold text-white tracking-tight truncate">
                        Sign in to NOVEXA AI
                      </h2>
                      <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
                    </div>
                    <p className="text-xs text-emerald-100/75 truncate mt-0.5">
                      VIP Key or Google Cloud Account
                    </p>
                  </div>
                </div>

                {/* Error Alert */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                      className="relative z-10 mt-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-400/45 text-rose-100 text-xs flex items-center gap-2.5 backdrop-blur-md"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                      <span className="leading-snug">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Method 1: Google Sign-In (Apple Crisp White Glass Capsule) */}
                <div className="relative z-10 mt-5">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isBusy}
                    className="w-full min-h-[48px] py-3 px-5 rounded-[18px] bg-white/95 hover:bg-white disabled:opacity-70 text-slate-950 font-['Sora'] font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-3 shadow-[0_10px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,1)] transition-all cursor-pointer"
                  >
                    {googleLoading ? (
                      <span className="w-5 h-5 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span className="whitespace-nowrap">
                      {googleLoading ? 'Connecting with Google…' : 'Continue with Google'}
                    </span>
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="relative z-10 my-4 flex items-center gap-3">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300/25 to-emerald-300/10" />
                  <span className="text-[10.5px] font-['Sora'] font-bold tracking-[0.14em] bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent uppercase whitespace-nowrap">
                    OR LOGIN WITH NOVEXA KEY
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-emerald-300/25 to-emerald-300/10" />
                </div>

                {/* Method 2: NOVEXA VIP Access Key Form */}
                <form onSubmit={handleKeyLogin} className="relative z-10 space-y-3.5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-0.5">
                      <label
                        htmlFor="novexa-vip-key"
                        className="text-xs font-['Sora'] font-semibold text-white/95 flex items-center gap-1.5"
                      >
                        <Key className="w-3.5 h-3.5 text-emerald-300" />
                        <span>NOVEXA VIP Access Key</span>
                      </label>
                      <span className="text-[11px] font-semibold bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                        Instant VIP
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        id="novexa-vip-key"
                        type="text"
                        value={accessKey}
                        onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                        placeholder="ENTER VIP KEY (e.g. NOVEXA)"
                        disabled={isBusy}
                        autoComplete="off"
                        className={`w-full min-h-[50px] pl-11 pr-11 py-3 rounded-[18px] bg-white/[0.08] border border-emerald-200/20 focus:bg-white/[0.12] focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-400/25 text-white placeholder-white/50 placeholder:text-xs sm:placeholder:text-sm placeholder:tracking-normal font-mono uppercase outline-none transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] ${
                          accessKey ? 'text-sm tracking-widest' : 'text-xs sm:text-sm tracking-normal'
                        }`}
                      />
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300 pointer-events-none" />
                      {accessKey && !isBusy && (
                        <button
                          type="button"
                          onClick={() => setAccessKey('')}
                          aria-label="Clear access key"
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-white/55 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-emerald-100/80 px-0.5">
                      <span>Default VIP Key:</span>
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          sound.playTap();
                          setAccessKey('NOVEXA');
                          setError(null);
                        }}
                        className="min-h-[34px] px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 font-mono font-bold border border-emerald-300/30 cursor-pointer transition-all whitespace-nowrap shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                      >
                        NOVEXA (Tap to fill)
                      </motion.button>
                    </div>
                  </div>

                  {/* Emerald Liquid Glass Submit CTA */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isBusy}
                    className={`relative w-full min-h-[52px] py-3.5 px-6 rounded-[20px] font-['Sora'] font-extrabold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2.5 overflow-hidden transition-all cursor-pointer ${
                      keyPhase === 'granted'
                        ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 text-emerald-950 border border-emerald-200 shadow-[0_14px_36px_rgba(16,185,129,0.5)]'
                        : 'text-white border border-emerald-200/35 shadow-[0_14px_38px_-6px_rgba(16,185,129,0.55),inset_0_1px_0_rgba(255,255,255,0.45)] animate-ios-spectrum'
                    }`}
                    style={
                      keyPhase === 'granted'
                        ? undefined
                        : {
                            backgroundImage:
                              'linear-gradient(125deg, #047857 0%, #059669 32%, #10b981 66%, #34d399 100%)',
                          }
                    }
                  >
                    {keyPhase === 'idle' && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-novexa-sheen pointer-events-none"
                      />
                    )}

                    {keyPhase === 'verifying' ? (
                      <span className="relative z-10 flex items-center gap-2.5">
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span className="whitespace-nowrap">VERIFYING VIP KEY…</span>
                      </span>
                    ) : keyPhase === 'granted' ? (
                      <motion.span
                        initial={{ scale: 0.78, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 24 }}
                        className="relative z-10 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span className="whitespace-nowrap">VIP ACCESS GRANTED</span>
                      </motion.span>
                    ) : (
                      <span className="relative z-10 flex items-center gap-2">
                        <Zap className="w-4 h-4 fill-current shrink-0" />
                        <span className="whitespace-nowrap">ACTIVATE VIP ACCESS</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5] shrink-0" />
                      </span>
                    )}
                  </motion.button>
                </form>

                {/* Telegram Support Link */}
                <div className="relative z-10 mt-3.5">
                  <motion.a
                    whileHover={{ scale: 1.008 }}
                    whileTap={{ scale: 0.98 }}
                    href="https://t.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.playTap()}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-[18px] bg-emerald-500/12 hover:bg-emerald-500/22 border border-emerald-400/30 text-emerald-100 text-xs font-['Sora'] font-semibold flex items-center justify-center gap-2 transition-all backdrop-blur-md"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0 text-emerald-300" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
                    </svg>
                    <span className="whitespace-nowrap">Get VIP Key via Telegram Support</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
                  </motion.a>
                </div>

                {/* Clean Unboxed Footer Metadata */}
                <div className="relative z-10 mt-5 pt-3.5 border-t border-emerald-200/15 flex items-center justify-center gap-2 text-[11px] text-emerald-100/80 font-medium flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    Instant Signals
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>21-AI Ensemble</span>
                  <span aria-hidden="true">·</span>
                  <span>Cloud Sync</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
