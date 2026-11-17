/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ShieldAlert, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NumberBall } from './NumberBall';
import { sound } from '../utils/sound';

interface WinLossModalProps {
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
  onClose: () => void;
}

export const WinLossModal: React.FC<WinLossModalProps> = ({
  isOpen,
  isWin,
  isJackpot = false,
  isUltraJackpot = false,
  predNum,
  oppNum,
  predBS,
  actualNumber,
  actualBS,
  confidence,
  period,
  onClose,
}) => {
  const triggeredPeriodRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      triggeredPeriodRef.current = null;
      return;
    }

    if (triggeredPeriodRef.current === period) return;
    triggeredPeriodRef.current = period;

    if (isWin) {
      sound.playWin();
      try {
        confetti({
          particleCount: 45,
          spread: 70,
          origin: { y: 0.55 },
          colors: ['#10b981', '#34d399', '#f59e0b', '#ffffff'],
          disableForReducedMotion: true,
        });
      } catch {
        // ignore
      }
    } else {
      sound.playLoss();
    }

    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [isOpen, isWin, period, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          className="relative w-full max-w-[350px] rounded-[30px] p-6 text-white text-center shadow-[0_30px_80px_rgba(0,0,0,0.85)] overflow-hidden border border-emerald-300/20 bg-gradient-to-br from-[#071812]/95 via-[#05100c]/95 to-[#040c09]/95 backdrop-blur-3xl"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close round outcome"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>

          <div
            className={`relative z-10 mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border ${
              isWin
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}
          >
            {isWin ? <Trophy className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>

          <div className="relative z-10 mt-3.5">
            <span className="text-[10px] font-['Space_Grotesk'] font-bold tracking-widest uppercase text-white/60">
              {isUltraJackpot
                ? 'Ultra Jackpot Hit'
                : isJackpot
                ? 'Exact Number Hit'
                : isWin
                ? 'Signal Confirmed'
                : 'Round Settled'}
            </span>
            <h2 className="font-['Sora'] font-extrabold text-2xl tracking-tight mt-1">
              {isUltraJackpot
                ? 'Ultra Jackpot!'
                : isJackpot
                ? 'Jackpot Hit!'
                : isWin
                ? 'Prediction Won'
                : 'Round Missed'}
            </h2>
          </div>

          <div className="relative z-10 mt-4 p-3 rounded-2xl bg-white/[0.05] border border-white/10 grid grid-cols-7 items-center gap-1">
            <div className="col-span-3 flex flex-col items-center">
              <span className="text-[9.5px] font-semibold text-white/55 uppercase">
                Opposite
              </span>
              <div className="mt-1">
                <NumberBall
                  number={typeof oppNum === 'number' ? oppNum : predNum}
                  size="sm"
                  showGlow={actualNumber === (typeof oppNum === 'number' ? oppNum : predNum)}
                />
              </div>
              <span className="mt-1 font-['Sora'] font-bold text-xs text-white/90">{predBS}</span>
            </div>

            <div className="col-span-1 flex justify-center">
              {isWin ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <ArrowRight className="w-4 h-4 text-white/40" />
              )}
            </div>

            <div className="col-span-3 flex flex-col items-center">
              <span className="text-[9.5px] font-semibold text-white/55 uppercase">Actual</span>
              <div className="mt-1">
                <NumberBall number={actualNumber} size="sm" showGlow={false} />
              </div>
              <span className="mt-1 font-['Sora'] font-bold text-xs text-white/90">{actualBS}</span>
            </div>
          </div>

          <div className="relative z-10 mt-3 flex items-center justify-between text-[11px] px-1 text-white/65 tabular-nums">
            <span>Round {period ? period.slice(-6) : '------'}</span>
            <span>{confidence}% Conf.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 mt-4 w-full py-3 rounded-2xl font-['Sora'] font-bold text-xs text-white shadow-md active:scale-[0.98] transition-transform cursor-pointer ios-spectrum-btn"
          >
            Continue
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
