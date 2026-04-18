import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { Difficulty } from '../types/game';
import { GameTimer } from '../components/game/GameTimer';
import { MemoryCard } from '../components/memory/MemoryCard';
import { HighScoreTable } from '../components/game/HighScoreTable';
import { NameInputModal } from '../components/game/NameInputModal';
import { usePokedexStore } from '../store/pokedexStore';
import { useMemoryGame } from '../hooks/useMemoryGame';
import { getHighScores, isTop5, addHighScore } from '../utils/highScore';

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
  easy:   { pairs: 6,  cols: 'grid-cols-3', rows: 'grid-rows-4', total: 12 },
  normal: { pairs: 8,  cols: 'grid-cols-4', rows: 'grid-rows-4', total: 16 },
  hard:   { pairs: 10, cols: 'grid-cols-4', rows: 'grid-rows-5', total: 20 },
} as const;

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
};

export default function MemoryMatchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const rawState: unknown = location.state;
  const pokemons = usePokedexStore((s) => s.data);

  const validState = isValidState(rawState) ? rawState : null;
  const difficulty = validState?.difficulty ?? 'easy';
  const config = GRID_CONFIG[difficulty];
  const highScoreKey = `highScore:memory:${difficulty}`;

  // true = name submitted or modal dismissed (no more modal this result cycle)
  const [nameSaved, setNameSaved] = useState(false);

  const { cards, phase, timeLeft, score, combo, finalScore, handleCardClick, restart } =
    useMemoryGame(difficulty, pokemons);

  useEffect(() => {
    if (!validState) navigate('/game', { replace: true });
  }, [validState, navigate]);

  if (!validState) return null;

  const qualifiesForHighScore = phase === 'result' && isTop5(highScoreKey, finalScore);
  const showNameModal = qualifiesForHighScore && !nameSaved;
  const scoresSaved = phase === 'result' && (nameSaved || !qualifiesForHighScore);

  const handleNameSubmit = (name: string) => {
    addHighScore(highScoreKey, { name, score: finalScore, playedAt: new Date().toISOString() });
    setNameSaved(true);
  };

  const handleModalClose = () => setNameSaved(true);

  const handleRestart = () => {
    setNameSaved(false);
    restart();
  };

  if (phase === 'result') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-57px)] gap-6 p-6">
        {showNameModal && (
          <NameInputModal onSubmit={handleNameSubmit} onClose={handleModalClose} />
        )}

        <div className="text-center">
          <p className="font-galmuri text-sm text-[--color-on-surface-muted] mb-1">
            메모리 매치 · {DIFFICULTY_LABEL[difficulty]}
          </p>
          <h1 className="font-galmuri text-2xl font-bold text-[--color-on-surface]">게임 종료!</h1>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-galmuri text-sm text-[--color-on-surface-muted]">최종 점수</span>
          <span className="font-galmuri text-5xl font-bold text-game-score tabular-nums">
            {finalScore.toLocaleString()}
          </span>
        </div>

        <div className="w-full max-w-sm rounded-[--radius-card] bg-[--color-surface-raised] border border-[--color-border] shadow-[--shadow-card] p-4">
          <p className="font-galmuri text-sm font-bold text-[--color-on-surface] mb-3">하이스코어</p>
          {scoresSaved ? (
            <HighScoreTable entries={getHighScores(highScoreKey)} />
          ) : (
            <p className="font-galmuri text-xs text-[--color-on-surface-muted] text-center py-2">저장 중...</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRestart}
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
    <div className="relative flex flex-col h-[calc(100dvh-57px)] p-3 gap-3 overflow-hidden">
      {phase === 'preparing' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-black/70 text-white font-galmuri text-base px-6 py-3 rounded-xl shadow-lg">
            카드를 외워두세요!
          </div>
        </div>
      )}

      {/* HUD */}
      <div className="shrink-0 w-full max-w-2xl mx-auto flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <div className="flex gap-6">
            <div>
              <p className="font-galmuri text-xs text-[--color-on-surface-muted]">SCORE</p>
              <p className="font-galmuri text-3xl font-bold text-game-score tabular-nums">
                {score.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="font-galmuri text-xs text-[--color-on-surface-muted]">COMBO</p>
              <p className="font-galmuri text-3xl font-bold text-game-combo tabular-nums">×{combo}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/game')}
            className="text-xs text-[--color-on-surface-muted] hover:text-[--color-on-surface] font-galmuri transition-colors mb-1"
          >
            포기
          </button>
        </div>
        <GameTimer timeLeft={timeLeft} maxTime={60} />
      </div>

      {/* Card grid */}
      <div className={clsx('flex-1 min-h-0 w-full max-w-2xl mx-auto grid gap-1.5', config.cols, config.rows)}>
        {cards.map((card, idx) => (
          <MemoryCard
            key={idx}
            pokemon={card.pokemon}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            onClick={() => handleCardClick(idx)}
          />
        ))}
      </div>
    </div>
  );
}
