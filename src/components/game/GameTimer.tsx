import { motion } from 'motion/react';
import clsx from 'clsx';

interface GameTimerProps {
  timeLeft: number;
  maxTime?: number;
}

export function GameTimer({ timeLeft, maxTime = 60 }: GameTimerProps) {
  const ratio = timeLeft / maxTime;
  const isWarning = timeLeft <= 30;
  const isDanger = timeLeft <= 10;

  return (
    <div className="w-full font-galmuri">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[--color-on-surface-muted]">TIME</span>
        <span
          className={clsx(
            'text-sm font-bold tabular-nums',
            isDanger
              ? 'text-game-error'
              : isWarning
                ? 'text-game-warning'
                : 'text-[--color-on-surface]',
          )}
        >
          {timeLeft}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-5 w-full rounded-full bg-[--color-border] overflow-hidden shadow-inner">
        {/* Fill bar */}
        <motion.div
          className={clsx(
            'absolute inset-y-0 left-0 rounded-full origin-left',
            isDanger
              ? 'bg-game-error'
              : isWarning
                ? 'bg-game-warning'
                : 'bg-game-success',
          )}
          style={{ width: '100%' }}
          animate={{ scaleX: ratio }}
          transition={{ duration: 0.4, ease: 'linear' }}
        />

        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none" />

        {/* Danger pulse overlay */}
        {isDanger && (
          <motion.div
            className="absolute inset-0 rounded-full bg-game-error/30"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
    </div>
  );
}
