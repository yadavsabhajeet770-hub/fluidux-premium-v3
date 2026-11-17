/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { primaryCol } from '../utils/aiEngine';
import { getBallImageUrl, getFallbackBallImageUrl } from '../utils/ballImages';

interface NumberBallProps {
  number: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isWinner?: boolean;
  isDimmed?: boolean;
  isShaking?: boolean;
  onClick?: () => void;
  className?: string;
  showGlow?: boolean;
}

const sizeClasses: Record<NonNullable<NumberBallProps['size']>, string> = {
  xs: 'w-6 h-6 text-[11px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-11 h-11 sm:w-12 sm:h-12 text-sm sm:text-base',
  lg: 'w-16 h-16 sm:w-[72px] sm:h-[72px] text-xl sm:text-2xl',
  xl: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl',
};

const NumberBallComponent: React.FC<NumberBallProps> = ({
  number,
  size = 'md',
  isWinner = false,
  isDimmed = false,
  isShaking = false,
  onClick,
  className = '',
  showGlow = true,
}) => {
  const safeNum = Math.abs(Math.floor(number)) % 10;
  const primarySrc = getBallImageUrl(safeNum);
  const fallbackSrc = getFallbackBallImageUrl(safeNum);

  const [imgSrc, setImgSrc] = useState<string>(primarySrc);
  const [imgFailed, setImgFailed] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(primarySrc);
    setImgFailed(false);
  }, [primarySrc]);

  const isRed = primaryCol(safeNum) === 'RED';

  const interactiveClasses = onClick ? 'cursor-pointer' : '';
  const stateClasses = isWinner
    ? 'z-20 scale-105 drop-shadow-[0_0_16px_color-mix(in_srgb,var(--accent)_70%,rgba(52,211,153,0.65))]'
    : isDimmed
    ? 'opacity-45 grayscale-[30%] scale-95'
    : 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.22)]';

  const baseClasses = `relative select-none aspect-square rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${sizeClasses[size]} ${interactiveClasses} ${stateClasses} ${className}`;

  const handleImageError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setImgFailed(true);
    }
  };

  const ballVisual = (
    <>
      {!imgFailed ? (
        <img
          src={imgSrc}
          alt={`Ball ${safeNum}`}
          referrerPolicy="no-referrer"
          decoding="async"
          draggable={false}
          onError={handleImageError}
          className="w-full h-full object-contain rounded-full select-none pointer-events-none"
        />
      ) : (
        <span
          className={`w-full h-full rounded-full flex items-center justify-center font-['Sora'] font-black text-white border border-white/40 shadow-inner ${
            safeNum === 0
              ? 'bg-gradient-to-br from-rose-500 to-purple-600'
              : safeNum === 5
              ? 'bg-gradient-to-br from-emerald-500 to-purple-600'
              : isRed
              ? 'bg-gradient-to-br from-rose-500 to-red-700'
              : 'bg-gradient-to-br from-emerald-500 to-green-700'
          }`}
        >
          {safeNum}
        </span>
      )}

      {isWinner && showGlow && (
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.15, 1] }}
          transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-1.5 rounded-full pointer-events-none -z-10"
          style={{
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--accent) 55%, transparent) 0%, transparent 72%)',
          }}
        />
      )}
    </>
  );

  if (onClick || isWinner || isShaking) {
    return (
      <motion.div
        whileHover={onClick ? { scale: 1.08, y: -1.5 } : undefined}
        whileTap={onClick ? { scale: 0.93 } : undefined}
        animate={
          isShaking
            ? {
                x: [-1.5, 1.5, -2, 2, 0],
                y: [-1, 1.5, -1.5, 1, 0],
                rotate: [-4, 4, -3, 3, 0],
                transition: { repeat: Infinity, duration: 0.28 },
              }
            : isWinner
            ? {
                scale: [1, 1.07, 1.02],
                transition: {
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: 1.6,
                  ease: 'easeInOut',
                },
              }
            : { scale: 1 }
        }
        onClick={onClick}
        className={baseClasses}
      >
        {ballVisual}
      </motion.div>
    );
  }

  return <div className={baseClasses}>{ballVisual}</div>;
};

export const NumberBall = memo(NumberBallComponent);
