import { useState } from 'react';
import { usePokedexStore } from '../store/pokedexStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorView } from '../components/common/ErrorView';
import { PokemonOrb } from '../components/pokedex/PokemonOrb';
import { PokemonDetailModal } from '../components/pokedex/PokemonDetailModal';
import { getBookmarks, toggleBookmark } from '../utils/bookmark';
import type { PokemonDex } from '../types/pokemon';

type SortKey = 'id' | 'name' | 'type';
type Order = 'asc' | 'desc';

function sortPokemon(list: PokemonDex[], key: SortKey, order: Order): PokemonDex[] {
  return [...list].sort((a, b) => {
    let cmp = 0;
    if (key === 'id') cmp = a.id - b.id;
    else if (key === 'name') cmp = a.koreanName.localeCompare(b.koreanName, 'ko');
    else cmp = (a.types[0] ?? '').localeCompare(b.types[0] ?? '', 'ko');
    return order === 'asc' ? cmp : -cmp;
  });
}

const SORT_BUTTONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: '이름순' },
  { key: 'id', label: '도감순' },
  { key: 'type', label: '타입순' },
];

export default function PokedexPage() {
  const { data, isLoading, error, loadGen1 } = usePokedexStore();
  const [selected, setSelected] = useState<PokemonDex | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [order, setOrder] = useState<Order>('asc');
  const [bookmarkOnly, setBookmarkOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>(() => getBookmarks());

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setOrder('asc');
    }
  }

  function handleReset() {
    setSortKey('id');
    setOrder('asc');
    setBookmarkOnly(false);
  }

  function handleBookmarkToggle(id: number) {
    setBookmarks(toggleBookmark(id));
  }

  const base = bookmarkOnly ? data.filter((p) => bookmarks.includes(p.id)) : data;
  const displayed = sortPokemon(base, sortKey, order);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-57px)] bg-[--color-surface] p-6">
      <div
        className="w-full max-w-4xl max-h-[80vh] flex flex-col
                   rounded-[--radius-card] bg-white dark:bg-gray-800
                   border border-[--color-border] shadow-[--shadow-elevated]"
      >
        <div className="px-6 py-4 border-b border-[--color-border] shrink-0">
          <h1 className="font-galmuri text-xl font-bold text-[--color-on-surface]">
            포켓몬 도감
          </h1>
          <p className="text-xs text-[--color-on-surface-muted] mt-0.5">1세대 151마리</p>

          <div className="flex gap-2 mt-3 flex-wrap">
            {SORT_BUTTONS.map(({ key, label }) => {
              const isActive = sortKey === key;
              const arrow = order === 'asc' ? '▲' : '▼';
              return (
                <button
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`font-galmuri text-xs px-3 py-1.5 rounded-[--radius-badge] border transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-[--color-surface-raised] text-[--color-on-surface] border-[--color-border] hover:border-blue-400'
                  }`}
                >
                  {label}
                  {isActive && <span className="ml-1">{arrow}</span>}
                </button>
              );
            })}

            <button
              onClick={handleReset}
              className="font-galmuri text-xs px-3 py-1.5 rounded-[--radius-badge] border
                         bg-[--color-surface-raised] text-[--color-on-surface]
                         border-[--color-border] hover:border-red-400 transition-colors"
            >
              리셋
            </button>

            <button
              onClick={() => setBookmarkOnly((prev) => !prev)}
              className={`font-galmuri text-xs px-3 py-1.5 rounded-[--radius-badge] border transition-colors ${
                bookmarkOnly
                  ? 'bg-yellow-400 text-gray-900 border-yellow-400'
                  : 'bg-[--color-surface-raised] text-[--color-on-surface] border-[--color-border] hover:border-yellow-400'
              }`}
            >
              {bookmarkOnly ? '★ 북마크' : '☆ 북마크'}
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6">
          {isLoading && <LoadingSpinner />}
          {error && <ErrorView message={error.message} onRetry={loadGen1} />}
          {!isLoading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
              {displayed.map((pokemon) => (
                <PokemonOrb
                  key={pokemon.id}
                  pokemon={pokemon}
                  isBookmarked={bookmarks.includes(pokemon.id)}
                  onSelect={setSelected}
                  onBookmark={handleBookmarkToggle}
                />
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
