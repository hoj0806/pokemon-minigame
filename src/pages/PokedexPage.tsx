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
                   rounded-[--radius-card]
                   bg-[#1a1a2e]
                   border-4 border-[#111827]
                   shadow-[0_8px_0_0_#111827,0_12px_40px_rgba(0,0,0,0.4)]"
      >
        {/* 헤더 */}
        <div className="px-6 py-4 border-b-4 border-[#111827] shrink-0 bg-[#EE1515] rounded-t-[calc(var(--radius-card)-4px)]">
          <h1 className="font-galmuri text-xl font-bold text-white drop-shadow-sm">
            📖 포켓몬 도감
          </h1>
          <p className="text-xs text-red-100 mt-0.5 font-galmuri">1세대 151마리</p>

          <div className="flex gap-2 mt-3 flex-wrap">
            {SORT_BUTTONS.map(({ key, label }) => {
              const isActive = sortKey === key;
              const arrow = order === 'asc' ? '▲' : '▼';
              return (
                <button
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`font-galmuri text-xs px-4 py-2 rounded-[--radius-sm] border-2 border-[#111827] transition-all duration-75 cursor-pointer ${
                    isActive
                      ? 'bg-[#FFCB05] text-[#111827] font-bold shadow-[0_4px_0_0_#111827] active:shadow-[0_2px_0_0_#111827] active:translate-y-[2px]'
                      : 'bg-white text-[#111827] shadow-[0_4px_0_0_#111827] hover:bg-gray-100 active:shadow-[0_2px_0_0_#111827] active:translate-y-[2px]'
                  }`}
                >
                  {label}
                  {isActive && <span className="ml-1">{arrow}</span>}
                </button>
              );
            })}

            <button
              onClick={handleReset}
              className="font-galmuri text-xs px-4 py-2 rounded-[--radius-sm] border-2 border-[#111827]
                         bg-white text-[#111827]
                         shadow-[0_4px_0_0_#111827] hover:bg-red-50
                         active:shadow-[0_2px_0_0_#111827] active:translate-y-[2px]
                         transition-all duration-75 cursor-pointer"
            >
              리셋
            </button>

            <button
              onClick={() => setBookmarkOnly((prev) => !prev)}
              className={`font-galmuri text-xs px-4 py-2 rounded-[--radius-sm] border-2 border-[#111827] transition-all duration-75 cursor-pointer ${
                bookmarkOnly
                  ? 'bg-yellow-400 text-[#111827] font-bold shadow-[0_4px_0_0_#111827] active:shadow-[0_2px_0_0_#111827] active:translate-y-[2px]'
                  : 'bg-white text-[#111827] shadow-[0_4px_0_0_#111827] hover:bg-yellow-50 active:shadow-[0_2px_0_0_#111827] active:translate-y-[2px]'
              }`}
            >
              {bookmarkOnly ? '★ 북마크' : '☆ 북마크'}
            </button>
          </div>
        </div>

        {/* 스크롤 영역 */}
        <div
          className="overflow-y-auto p-6 bg-[#e8e0d0] rounded-b-[calc(var(--radius-card)-4px)]
                     [&::-webkit-scrollbar]:w-2
                     [&::-webkit-scrollbar-track]:bg-[#c8bfaf]
                     [&::-webkit-scrollbar-track]:rounded-full
                     [&::-webkit-scrollbar-thumb]:bg-[#EE1515]
                     [&::-webkit-scrollbar-thumb]:rounded-full
                     [&::-webkit-scrollbar-thumb]:border-2
                     [&::-webkit-scrollbar-thumb]:border-[#111827]"
        >
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
