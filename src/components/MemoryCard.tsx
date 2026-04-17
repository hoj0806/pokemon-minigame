import { motion } from 'motion/react';
import clsx from 'clsx';
import type { PokemonDex } from '../types/pokemon';

interface MemoryCardProps {
  pokemon: PokemonDex | null;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

export function MemoryCard({ pokemon, isFlipped, isMatched, onClick }: MemoryCardProps) {
  return (
    <div className="[perspective:600px] w-full aspect-[3/4] cursor-pointer select-none" onClick={onClick}>
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {/* Back face */}
        <div className="absolute inset-0 backface-hidden rounded-[--radius-lg] bg-brand border-2 border-brand-dark flex items-center justify-center shadow-[--shadow-card]">
          <span className="text-white text-2xl font-bold font-galmuri">?</span>
        </div>

        {/* Front face */}
        <div
          className={clsx(
            'absolute inset-0 backface-hidden [transform:rotateY(180deg)] rounded-[--radius-lg] flex flex-col items-center justify-center gap-1 shadow-[--shadow-card] border-2',
            isMatched
              ? 'bg-game-success/10 border-game-success'
              : 'bg-[--color-surface-raised] border-[--color-border]',
          )}
        >
          {pokemon && (
            <>
              <img
                src={pokemon.imageUrl}
                alt={pokemon.koreanName}
                className="w-12 h-12 [image-rendering:pixelated]"
                draggable={false}
              />
              <span className="text-[10px] font-galmuri text-[--color-on-surface] text-center leading-tight px-1 w-full truncate">
                {pokemon.koreanName}
              </span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
