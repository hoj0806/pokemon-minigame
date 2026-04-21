import { motion } from 'motion/react';
import clsx from 'clsx';
import type { PokemonDex } from '../../types/pokemon';
import { TYPE_CARD_GRADIENT } from '../../utils/pokemonLocale';

interface MemoryCardProps {
  pokemon: PokemonDex | null;
  isFlipped: boolean;
  isMatched: boolean;
  nameSize: string;
  onClick: () => void;
}

export function MemoryCard({ pokemon, isFlipped, isMatched, nameSize, onClick }: MemoryCardProps) {
  const gradient = pokemon ? (TYPE_CARD_GRADIENT[pokemon.types[0]] ?? 'from-gray-400 to-gray-500') : 'from-gray-400 to-gray-500';
  return (
    <motion.figure
      className={clsx('w-full aspect-[3/4] select-none m-0', isMatched ? 'cursor-default' : 'cursor-pointer')}
      animate={{ opacity: isMatched ? 0 : 1 }}
      transition={{ duration: 0.3, delay: isMatched ? 0.4 : 0 }}
      onClick={isMatched ? undefined : onClick}
    >
      <div className="relative w-full h-full [perspective:600px]">
        <motion.div
          className="absolute inset-0 w-full h-full [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* 앞면 — 뒷면 */}
          <div className="absolute inset-0 rounded-lg [backface-visibility:hidden] border-2 border-black bg-white" />

          {/* 뒷면 — 포켓몬 */}
          <div
            className={clsx(
              'absolute inset-0 rounded-lg [backface-visibility:hidden] [transform:rotateY(180deg)]',
              'flex flex-col items-center justify-center p-2',
              `bg-gradient-to-br ${gradient}`,
            )}
          >
            {pokemon && (
              <div className="flex flex-col items-center justify-center gap-1 w-full">
                <img
                  src={pokemon.imageUrl}
                  alt={pokemon.koreanName}
                  className="w-[70%] aspect-square object-contain"
                  draggable={false}
                />
                <p className={clsx('font-galmuri font-medium text-black text-center leading-tight truncate w-full px-1', nameSize)}>
                  {pokemon.koreanName}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.figure>
  );
}
