import { MERGE_CHAIN } from '../../utils/mergeChain';
import { usePokedexStore } from '../../store/pokedexStore';

export function MergeChainPreview() {
  const getById = usePokedexStore((s) => s.getById);

  return (
    <div className="w-full max-w-sm">
      <p className="font-galmuri text-xs text-[--color-on-surface-muted] text-center mb-2">
        진화 체인
      </p>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {MERGE_CHAIN.map((entry, i) => {
          const pokemon = getById(entry.pokemonId);
          return (
            <div key={entry.pokemonId} className="flex items-center gap-1 shrink-0">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[--color-surface] border-2 border-[--color-border] flex items-center justify-center">
                  {pokemon ? (
                    <img
                      src={pokemon.imageUrl}
                      alt={pokemon.koreanName}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <span className="font-galmuri text-xs text-[--color-on-surface-muted]">?</span>
                  )}
                </div>
                <p className="font-galmuri text-[8px] text-[--color-on-surface-muted] mt-0.5 text-center w-10 truncate">
                  {pokemon?.koreanName ?? '???'}
                </p>
              </div>
              {i < MERGE_CHAIN.length - 1 && (
                <span className="font-galmuri text-[10px] text-[--color-on-surface-muted] shrink-0 mb-3">
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
