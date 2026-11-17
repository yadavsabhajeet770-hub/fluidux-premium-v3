/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Palette, Check } from 'lucide-react';
import { THEMES } from '../utils/themes';
import { sound } from '../utils/sound';

interface ThemeModalProps {
  isOpen: boolean;
  currentTheme: string;
  onSelectTheme: (key: string) => void;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  currentTheme,
  onSelectTheme,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-[28px] liquid-glass text-[var(--ink)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[var(--line)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-deep)] flex items-center justify-center border border-[var(--accent)]/25">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Sora'] font-bold text-base sm:text-lg text-[var(--ink)]">
                    Accent Palette
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    {THEMES.length} curated palettes for NOVEXA AI
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  onClose();
                }}
                aria-label="Close theme selector"
                className="w-9 h-9 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center justify-center text-[var(--ink)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 overscroll-contain">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {THEMES.map((t) => {
                  const isActive = currentTheme === t.k;
                  return (
                    <button
                      key={t.k}
                      type="button"
                      aria-label={`Apply ${t.n} palette`}
                      aria-pressed={isActive}
                      onClick={() => {
                        sound.playTap();
                        onSelectTheme(t.k);
                      }}
                      className={`relative aspect-[1.1] rounded-2xl p-2.5 transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between overflow-hidden border-2 ${
                        isActive
                          ? 'border-white ring-2 ring-[var(--accent)] scale-[1.02]'
                          : 'border-white/15 hover:border-white/40 hover:scale-[1.01]'
                      }`}
                      style={{
                        background: `linear-gradient(145deg, ${t.c1}, ${t.c2} 48%, ${t.c3} 100%)`,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-11 bg-gradient-to-b from-black/55 via-black/25 to-transparent pointer-events-none"
                      />
                      <div className="relative z-10 flex items-start justify-between w-full gap-1">
                        <span className="text-[10px] font-['Sora'] font-bold text-white drop-shadow-sm text-left leading-tight">
                          {t.n}
                        </span>
                        {isActive && (
                          <div className="w-4 h-4 rounded-full bg-white text-slate-900 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="relative z-10 w-full flex items-center gap-1 mt-auto">
                        <span className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: t.accent }} />
                        <span className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: t.c4 }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)] shrink-0">
              <span>Saved automatically</span>
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  onClose();
                }}
                className="px-4 py-1.5 rounded-xl text-white font-['Sora'] font-bold text-xs shadow-sm active:scale-95 transition-transform cursor-pointer"
                style={{ background: 'var(--grad-deep)' }}
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
