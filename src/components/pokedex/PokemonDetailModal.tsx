import { motion } from 'motion/react';
import { TypeBadge } from './TypeBadge';
import { TYPE_CARD_GRADIENT } from '../../utils/pokemonLocale';
import { getBookmarks, toggleBookmark } from '../../utils/bookmark';
import { useState } from 'react';
import type { PokemonDex } from '../../types/pokemon';

interface PokemonDetailModalProps {
  pokemon: PokemonDex;
  onClose: () => void;
}

function PokeballIcon() {
  return (
    <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-black shadow-sm shrink-0">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-red-500" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/3 h-1/3 bg-white border-2 border-black rounded-full" />
      </div>
    </div>
  );
}

export function PokemonDetailModal({ pokemon, onClose }: PokemonDetailModalProps) {
  const [bookmarks, setBookmarks] = useState<number[]>(() => getBookmarks());
  const isBookmarked = bookmarks.includes(pokemon.id);

  const firstType = pokemon.types[0] ?? '노말';
  const gradientClass = TYPE_CARD_GRADIENT[firstType] ?? 'from-gray-400 to-gray-500';

  function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation();
    setBookmarks(toggleBookmark(pokemon.id));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        whileHover={{ y: -6, boxShadow: '0 28px 60px rgba(0,0,0,0.5)' }}
        className={`cursor-default w-full max-w-[360px] mx-4 aspect-[2/3] font-bold p-4 text-[#181a1a] rounded-2xl
                   relative bg-linear-to-br ${gradientClass}
                   shadow-[0_12px_40px_rgba(0,0,0,0.4)]
                   border border-white/25 transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단: 포켓볼 + 번호 */}
        <div className="flex items-center justify-between">
          <PokeballIcon />
          <p className="text-sm font-bold text-white bg-gray-800 px-4 py-1 rounded-lg shadow-lg font-galmuri">
            No.
            <span className="bg-linear-to-r from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-md">
              {String(pokemon.id).padStart(3, '0')}
            </span>
          </p>
        </div>

        {/* 포켓몬 이미지 */}
        <div className="w-full mt-2 aspect-square flex justify-center items-center overflow-hidden">
          <img
            src={pokemon.imageUrl}
            alt={pokemon.koreanName}
            className="w-full h-full object-contain [image-rendering:pixelated] -mt-1.5"
          />
        </div>

        {/* 하단 정보 패널 (frosted glass) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-4 w-[90%]
                     bg-white/20 backdrop-blur-md rounded-xl p-3 shadow-md
                     border border-yellow-400/70"
        >
          {/* 북마크 버튼 */}
          <button
            onClick={handleBookmark}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center cursor-pointer text-xl leading-none"
            aria-label="북마크"
          >
            <span className={isBookmarked ? 'text-yellow-400' : 'text-white/80'}>
              {isBookmarked ? '♥' : '♡'}
            </span>
          </button>

          {/* 키 / 무게 */}
          <div className="flex gap-4 mt-1 text-white text-sm font-galmuri">
            <div className="flex items-center gap-1.5">
              <span>키</span>
              <span className="font-semibold">{pokemon.height.toFixed(1)}m</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>무게</span>
              <span className="font-semibold">{pokemon.weight.toFixed(1)}kg</span>
            </div>
          </div>

          {/* 이름 */}
          <p className="mt-1.5 text-white text-lg font-bold font-galmuri">
            이름 : {pokemon.koreanName}
          </p>

          {/* 특성 */}
          <div className="flex gap-1.5 flex-wrap mt-1.5 items-center">
            <span className="text-white text-xs font-galmuri">특성 :</span>
            {pokemon.abilities.map((a) => (
              <span
                key={a}
                className="bg-yellow-500/30 px-2 py-0.5 rounded-md text-xs text-white font-galmuri"
              >
                {a}
              </span>
            ))}
          </div>

          {/* 타입 */}
          <div className="flex gap-1.5 flex-wrap mt-1.5 items-center">
            <span className="text-white text-xs font-galmuri">타입 :</span>
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} gradient />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
