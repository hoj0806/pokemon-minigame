import { useState } from 'react';
import { usePokedexStore } from '../store/pokedexStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { PokemonOrb } from '../components/PokemonOrb';
import { PokemonDetailModal } from '../components/PokemonDetailModal';
import type { PokemonDex } from '../types/pokemon';

export default function PokedexPage() {
  const { data, isLoading, error, loadGen1 } = usePokedexStore();
  const [selected, setSelected] = useState<PokemonDex | null>(null);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-57px)] bg-[--color-surface] p-6">
      <div
        className="w-full max-w-4xl max-h-[80vh] flex flex-col
                   rounded-[--radius-card] bg-[--color-surface-overlay]
                   border border-[--color-border] shadow-[--shadow-elevated]"
      >
        <div className="px-6 py-4 border-b border-[--color-border] shrink-0">
          <h1 className="font-galmuri text-xl font-bold text-[--color-on-surface]">
            포켓몬 도감
          </h1>
          <p className="text-xs text-[--color-on-surface-muted] mt-0.5">1세대 151마리</p>
        </div>

        <div className="overflow-y-auto p-6">
          {isLoading && <LoadingSpinner />}
          {error && <ErrorView message={error.message} onRetry={loadGen1} />}
          {!isLoading && !error && (
            <div className="grid grid-cols-5 gap-6">
              {data.map((pokemon) => (
                <PokemonOrb key={pokemon.id} pokemon={pokemon} onSelect={setSelected} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <PokemonDetailModal pokemon={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
