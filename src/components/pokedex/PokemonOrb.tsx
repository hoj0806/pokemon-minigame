import type { PokemonDex } from '../../types/pokemon';

interface PokemonOrbProps {
  pokemon: PokemonDex;
  onSelect: (pokemon: PokemonDex) => void;
}

export function PokemonOrb({ pokemon, onSelect }: PokemonOrbProps) {
  return (
    <button
      onClick={() => onSelect(pokemon)}
      className="flex flex-col items-center gap-2 group"
    >
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center
                   bg-[--color-surface-raised]
                   ring-1 ring-blue-200/60
                   shadow-[0_0_18px_rgba(147,197,253,0.55),inset_0_1px_0_rgba(255,255,255,0.5)]
                   transition-shadow duration-200
                   group-hover:shadow-[0_0_28px_rgba(147,197,253,0.85),inset_0_1px_0_rgba(255,255,255,0.5)]"
      >
        <img
          src={pokemon.imageUrl}
          alt={pokemon.koreanName}
          className="w-16 h-16 object-contain [image-rendering:pixelated]"
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
  );
}
