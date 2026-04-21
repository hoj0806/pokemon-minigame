import { useState } from 'react';
import { FaCaretUp, FaCaretDown, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { usePokedexStore } from '../store/pokedexStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorView } from '../components/common/ErrorView';
import { PokemonOrb } from '../components/pokedex/PokemonOrb';
import { PokemonDetailModal } from '../components/pokedex/PokemonDetailModal';
import { getBookmarks } from '../utils/bookmark';
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

const btnBase = 'flex-1 flex items-center justify-center gap-1 font-galmuri text-xs py-3 rounded-lg border-b-2 border-[#111827] transition-all duration-75 cursor-pointer';
const btnActive = 'bg-[#FFCB05] text-[#111827] font-bold shadow-[0_4px_0_0_#111827] active:shadow-[0_2px_0_0_#111827] active:translate-y-[2px]';
const btnInactive = 'bg-[#c8bfaf] text-[#111827] shadow-[0_4px_0_0_#111827] hover:bg-[#b8ae9e] active:shadow-[0_2px_0_0_#111827] active:translate-y-[2px]';

export default function PokedexPage() {
  const navigate = useNavigate();
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

  const base = bookmarkOnly ? data.filter((p) => bookmarks.includes(p.id)) : data;
  const displayed = sortPokemon(base, sortKey, order);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-57px)] bg-[--color-surface] p-6">
      <div
        className="w-full max-w-4xl max-h-[80vh] flex flex-col
                   rounded-card overflow-hidden
                   bg-[#1a1a2e]
                   shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
      >
        {/* 헤더 */}
        <div className="px-6 py-4 shrink-0 bg-[#EE1515]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-galmuri text-xl font-bold text-white drop-shadow-sm">
                📖 포켓몬 도감
              </h1>
              <p className="text-xs text-red-100 mt-0.5 font-galmuri">1세대 151마리</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="font-galmuri text-sm text-white border-2 border-white px-3 py-1.5 rounded-md shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 hover:bg-white hover:text-[#EE1515] transition-all duration-75 cursor-pointer"
            >
              ← 홈
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            {SORT_BUTTONS.map(({ key, label }) => {
              const isActive = sortKey === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`${btnBase} ${isActive ? btnActive : btnInactive}`}
                >
                  {label}
                  {isActive && (order === 'asc' ? <FaCaretUp /> : <FaCaretDown />)}
                </button>
              );
            })}

            <button
              onClick={handleReset}
              className={`${btnBase} ${btnInactive}`}
            >
              리셋
            </button>

            <button
              onClick={() => setBookmarkOnly((prev) => !prev)}
              className={`${btnBase} ${bookmarkOnly ? btnActive : btnInactive}`}
            >
              {bookmarkOnly ? <FaHeart className="mr-0.5" /> : <FaRegHeart className="mr-0.5" />}
              북마크
            </button>
          </div>
        </div>

        {/* 스크롤 영역 */}
        <div
          className="overflow-y-auto flex-1 p-6 bg-[#e8e0d0]
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {displayed.map((pokemon) => (
                <PokemonOrb
                  key={pokemon.id}
                  pokemon={pokemon}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <PokemonDetailModal
          pokemon={selected}
          onClose={() => setSelected(null)}
          onBookmarkChange={setBookmarks}
        />
      )}
    </div>
  );
}
