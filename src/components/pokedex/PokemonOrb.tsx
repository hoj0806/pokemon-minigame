import type { PokemonDex } from '../../types/pokemon';

interface PokemonOrbProps {
  pokemon: PokemonDex;
  isBookmarked: boolean;
  onSelect: (pokemon: PokemonDex) => void;
  onBookmark: (id: number) => void;
}

export function PokemonOrb({ pokemon, isBookmarked, onSelect, onBookmark }: PokemonOrbProps) {
  return (
    <div className="relative flex flex-col items-center gap-2 group cursor-pointer">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBookmark(pokemon.id);
        }}
        aria-label="북마크"
        className={`absolute top-0 right-0 z-10 text-base leading-none transition-colors cursor-pointer ${
          isBookmarked ? 'text-yellow-400' : 'text-[--color-on-surface-muted] opacity-0 group-hover:opacity-100'
        }`}
      >
        {isBookmarked ? '★' : '☆'}
      </button>

      <button
        onClick={() => onSelect(pokemon)}
        className="flex flex-col items-center gap-2 cursor-pointer"
      >
        <div
          className="w-24 h-24 rounded-full relative flex items-center justify-center
                     bg-white
                     ring-2 ring-white/90
                     shadow-[inset_-5px_-5px_12px_rgba(0,0,0,0.12),inset_5px_5px_10px_rgba(255,255,255,0.95),0_6px_20px_rgba(0,0,0,0.15),0_2px_6px_rgba(0,0,0,0.08)]
                     transition-all duration-200
                     group-hover:shadow-[inset_-5px_-5px_12px_rgba(0,0,0,0.12),inset_5px_5px_10px_rgba(255,255,255,0.95),0_12px_32px_rgba(0,0,0,0.22),0_4px_12px_rgba(0,0,0,0.12)]
                     group-hover:scale-105"
        >
          {/* 메인 하이라이트 */}
          <div className="absolute top-2 left-3 w-7 h-4 bg-white/75 rounded-full blur-sm pointer-events-none" />
          {/* 보조 반짝임 */}
          <div className="absolute top-1 right-4 w-2 h-2 bg-white/65 rounded-full blur-[2px] animate-pulse pointer-events-none" />
          <img
            src={pokemon.imageUrl}
            alt={pokemon.koreanName}
            className="w-16 h-16 object-contain [image-rendering:pixelated] transition-transform duration-200 group-hover:scale-110 relative z-10"
          />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-galmuri text-[10px] text-[--color-on-surface-muted]">
            #{String(pokemon.id).padStart(3, '0')}
          </span>
          <span className="font-galmuri text-xs text-[--color-on-surface] text-center leading-tight">
            {pokemon.koreanName}
          </span>
        </div>
      </button>
    </div>
  );
}
