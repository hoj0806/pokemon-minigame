import type { PokemonDex } from '../../types/pokemon';

interface PokemonOrbProps {
  pokemon: PokemonDex;
  onSelect: (pokemon: PokemonDex) => void;
}

export function PokemonOrb({ pokemon, onSelect }: PokemonOrbProps) {
  return (
    <div className="relative flex flex-col items-center gap-2 group cursor-pointer">
      <button
        onClick={() => onSelect(pokemon)}
        className="flex flex-col items-center gap-2 cursor-pointer"
      >
        <div
          className="w-24 h-24 rounded-full relative flex items-center justify-center overflow-hidden
                     bg-gradient-to-br from-white via-sky-200/70 to-blue-400/60
                     shadow-[inset_0_-6px_18px_rgba(0,60,180,0.28),inset_0_6px_18px_rgba(255,255,255,0.85),0_10px_28px_rgba(0,60,200,0.22),0_2px_8px_rgba(0,0,0,0.12)]
                     transition-all duration-300
                     group-hover:scale-[1.1]
                     group-hover:shadow-[inset_0_-6px_18px_rgba(0,60,180,0.35),inset_0_6px_18px_rgba(255,255,255,1),0_18px_44px_rgba(0,80,220,0.35),0_6px_16px_rgba(0,0,0,0.18)]"
        >
          {/* Fresnel 에지 다크닝 — 구슬 둘레 */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,20,100,0.3)] pointer-events-none z-20" />

          {/* 메인 스페큘러 하이라이트 (대형, 상단 좌측) */}
          <div className="absolute top-1 left-2 w-11 h-7 bg-white/90 rounded-full blur-[7px] pointer-events-none z-10" />

          {/* 선명한 코어 하이라이트 */}
          <div className="absolute top-2.5 left-4 w-5 h-3 bg-white rounded-full blur-[2px] pointer-events-none z-10" />

          {/* 미세 반짝임 점 */}
          <div className="absolute top-2 left-3 w-2 h-2 bg-white rounded-full pointer-events-none z-10" />

          {/* 하단 내부 반사광 (유리 투과) */}
          <div className="absolute bottom-2 right-3 w-8 h-5 bg-sky-100/60 rounded-full blur-[6px] pointer-events-none z-10" />

          {/* hover 시 반사광 스윕 */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <div
              className="absolute top-0 left-0 w-full h-full
                         bg-gradient-to-r from-transparent via-white/55 to-transparent
                         -translate-x-full group-hover:translate-x-full
                         transition-transform duration-700 ease-in-out blur-sm"
            />
          </div>

          <img
            src={pokemon.imageUrl}
            alt={pokemon.koreanName}
            className="w-16 h-16 object-contain [image-rendering:pixelated] transition-transform duration-200 group-hover:scale-110 relative z-10"
          />
        </div>

        <div className="flex flex-col items-center justify-start h-8">
          <span className="font-galmuri text-sm font-medium text-[--color-on-surface] text-center leading-tight">
            {pokemon.koreanName}
          </span>
        </div>
      </button>
    </div>
  );
}
