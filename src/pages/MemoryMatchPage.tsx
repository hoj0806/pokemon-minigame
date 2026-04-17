import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { Difficulty } from '../types/game';
import { GameTimer } from '../components/game/GameTimer';
import { MemoryCard } from '../components/memory/MemoryCard';
import { HighScoreTable } from '../components/game/HighScoreTable';
import { usePokedexStore } from '../store/pokedexStore';

interface GameLocationState {
  difficulty: Difficulty;
}

function isValidState(state: unknown): state is GameLocationState {
  return (
    typeof state === 'object' &&
    state !== null &&
    'difficulty' in state &&
    ['easy', 'normal', 'hard'].includes((state as GameLocationState).difficulty)
  );
}

const GRID_CONFIG = {
  easy:   { pairs: 6,  cols: 'grid-cols-3', total: 12 },
  normal: { pairs: 8,  cols: 'grid-cols-4', total: 16 },
  hard:   { pairs: 10, cols: 'grid-cols-4', total: 20 },
} as const;

type Phase = 'game' | 'result';

const MOCK_SCORES = [
  { name: '재훈', score: 1500, playedAt: '2026-04-17T10:00:00Z' },
  { name: '익명', score: 1250, playedAt: '2026-04-16T09:30:00Z' },
  { name: '피카츄', score: 900,  playedAt: '2026-04-15T14:20:00Z' },
];

export default function MemoryMatchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state: unknown = location.state;
  const pokemons = usePokedexStore((s) => s.data);

  const [phase, setPhase] = useState<Phase>('game');
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isValidState(state)) {
      navigate('/game', { replace: true });
    }
  }, [state, navigate]);

  if (!isValidState(state)) return null;

  const { difficulty } = state;
  const config = GRID_CONFIG[difficulty];

  const uniquePokemons = pokemons.slice(0, config.pairs);
  const cards = [...uniquePokemons, ...uniquePokemons];

  const toggleFlip = (index: number) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (phase === 'result') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-8 p-6">
        <div className="text-center">
          <p className="font-galmuri text-sm text-[--color-on-surface-muted] mb-1">메모리 매치</p>
          <h1 className="font-galmuri text-2xl font-bold text-[--color-on-surface]">게임 종료!</h1>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-galmuri text-sm text-[--color-on-surface-muted]">최종 점수</span>
          <span className="font-galmuri text-5xl font-bold text-game-score tabular-nums">1,250</span>
        </div>

        <div className="w-full max-w-sm rounded-[--radius-card] bg-[--color-surface-raised] border border-[--color-border] shadow-[--shadow-card] p-4">
          <p className="font-galmuri text-sm font-bold text-[--color-on-surface] mb-3">하이스코어</p>
          <HighScoreTable entries={MOCK_SCORES} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setPhase('game'); setFlipped(new Set()); }}
            className="bg-brand hover:bg-brand-dark text-white font-galmuri font-semibold px-6 py-2 rounded-[--radius-sm] transition-colors"
          >
            다시하기
          </button>
          <button
            onClick={() => navigate('/game')}
            className="bg-transparent border border-[--color-border] text-[--color-on-surface] font-galmuri px-6 py-2 rounded-[--radius-sm] transition-colors hover:border-[--color-border-strong]"
          >
            게임 선택
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-57px)] p-4 gap-4">
      {/* HUD */}
      <div className="w-full max-w-2xl flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div className="flex gap-6">
            <div>
              <p className="font-galmuri text-xs text-[--color-on-surface-muted]">SCORE</p>
              <p className="font-galmuri text-3xl font-bold text-game-score tabular-nums">0</p>
            </div>
            <div>
              <p className="font-galmuri text-xs text-[--color-on-surface-muted]">COMBO</p>
              <p className="font-galmuri text-3xl font-bold text-game-combo tabular-nums">×0</p>
            </div>
          </div>
          <button
            onClick={() => setPhase('result')}
            className="text-xs text-[--color-on-surface-muted] hover:text-[--color-on-surface] font-galmuri transition-colors mb-1"
          >
            포기
          </button>
        </div>
        <GameTimer timeLeft={60} maxTime={60} />
      </div>

      {/* Card grid */}
      <div className={clsx('grid gap-2 w-full max-w-2xl', config.cols)}>
        {cards.map((pokemon, idx) => (
          <MemoryCard
            key={idx}
            pokemon={pokemon}
            isFlipped={flipped.has(idx)}
            isMatched={false}
            onClick={() => toggleFlip(idx)}
          />
        ))}
      </div>
    </div>
  );
}
