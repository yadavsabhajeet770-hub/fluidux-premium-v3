/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { sound } from '../utils/sound';

interface FloatingTelegramButtonProps {
  url?: string;
}

export const FloatingTelegramButton: React.FC<FloatingTelegramButtonProps> = ({
  url = 'https://t.me/+W9bUCI1PYdMwZDc1',
}) => {
  return (
    <motion.aside
      aria-label="Official Telegram Channel"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.35, type: 'spring', stiffness: 400, damping: 28 }}
      className="fixed bottom-[84px] md:bottom-6 right-2.5 md:right-6 z-40"
    >
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => sound.playTap()}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.94 }}
        className="group relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full liquid-glass cursor-pointer select-none"
        aria-label="Join Official NOVEXA AI Telegram Channel"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 fill-[#2AABEE]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>

        <span className="hidden md:block absolute right-13 px-2.5 py-1 rounded-xl liquid-glass text-[var(--ink)] text-[11px] font-['Sora'] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Telegram Channel
        </span>
      </motion.a>
    </motion.aside>
  );
};
