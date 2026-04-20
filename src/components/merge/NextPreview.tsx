import { MERGE_CHAIN } from '../../utils/mergeChain';
import { usePokedexStore } from '../../store/pokedexStore';

interface NextPreviewProps {
  chainIndex: number;
  label: string;
}

export function NextPreview({ chainIndex, label }: NextPreviewProps) {
  const entry = MERGE_CHAIN[chainIndex];
  const pokemon = usePokedexStore((s) => s.getById(entry.pokemonId));

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="font-galmuri text-[10px] text-[--color-on-surface-muted]">{label}</p>
      <div className="w-14 h-14 rounded-full bg-[--color-surface] border border-[--color-border] flex items-center justify-center overflow-hidden">
        {pokemon && (
          <img
            src={pokemon.imageUrl}
            alt={pokemon.koreanName}
            className="w-12 h-12 object-contain"
          />
        )}
      </div>
    </div>
  );
}
