import { motion } from 'motion/react';
import clsx from 'clsx';
import type { PokemonDex } from '../../types/pokemon';

interface MemoryCardProps {
  pokemon: PokemonDex | null;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

const TYPE_GRADIENT: Record<string, string> = {
  fire:     'from-orange-400 to-red-500',
  water:    'from-blue-400 to-blue-600',
  grass:    'from-green-400 to-green-600',
  electric: 'from-yellow-300 to-yellow-500',
  psychic:  'from-pink-400 to-purple-500',
  ice:      'from-cyan-300 to-blue-400',
  dragon:   'from-indigo-500 to-purple-700',
  dark:     'from-gray-600 to-gray-900',
  fairy:    'from-pink-300 to-pink-500',
  fighting: 'from-orange-600 to-red-700',
  poison:   'from-purple-400 to-purple-700',
  ground:   'from-yellow-500 to-amber-700',
  rock:     'from-stone-400 to-stone-600',
  ghost:    'from-violet-500 to-violet-900',
  steel:    'from-slate-400 to-slate-600',
  bug:      'from-lime-400 to-green-500',
  flying:   'from-sky-300 to-indigo-400',
  normal:   'from-gray-300 to-gray-500',
};

function getGradient(types: string[]) {
  return TYPE_GRADIENT[types[0]] ?? 'from-green-400 to-green-600';
}

export function MemoryCard({ pokemon, isFlipped, isMatched, onClick }: MemoryCardProps) {
  const gradient = pokemon ? getGradient(pokemon.types) : 'from-green-400 to-green-600';

  return (
    <motion.div
      className={clsx('w-full aspect-[5/7] select-none', isMatched ? 'cursor-default' : 'cursor-pointer')}
      animate={{ opacity: isMatched ? 0 : 1 }}
      transition={{ duration: 0.3, delay: isMatched ? 0.4 : 0 }}
      onClick={isMatched ? undefined : onClick}
    >
      <div className="[perspective:600px] w-full h-full">
        <motion.div
          className="relative w-full h-full [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          {/* 숨김면 — 포켓볼 */}
          <div className="absolute inset-0 backface-hidden rounded-xl border-2 border-red-700 overflow-hidden shadow-md">
            <div className="w-full h-full bg-white flex items-center justify-center relative">
              {/* 상단 빨간 영역 */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-red-500" />
              {/* 하단 흰색 영역 */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white" />
              {/* 가운데 검은 띠 */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[10%] bg-black z-10" />
              {/* 중앙 버튼 */}
              <div className="relative z-20 w-[28%] aspect-square rounded-full bg-white border-[3px] border-black shadow-inner flex items-center justify-center">
                <div className="w-1/2 aspect-square rounded-full bg-white border-2 border-black" />
              </div>
            </div>
          </div>

          {/* 공개면 — 포켓몬 */}
          <div
            className={clsx(
              'absolute inset-0 backface-hidden [transform:rotateY(180deg)] rounded-xl border-2 border-black/20',
              'flex flex-col items-center justify-center gap-1 shadow-md',
              `bg-gradient-to-br ${gradient}`,
            )}
          >
            {pokemon && (
              <>
                <div className="w-[65%] aspect-square flex items-center justify-center drop-shadow-lg">
                  <img
                    src={pokemon.imageUrl}
                    alt={pokemon.koreanName}
                    className="w-full h-full object-contain [image-rendering:pixelated]"
                    draggable={false}
                  />
                </div>
                <span className="text-[10px] font-galmuri font-bold text-white drop-shadow text-center leading-tight px-1 w-full truncate">
                  {pokemon.koreanName}
                </span>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
