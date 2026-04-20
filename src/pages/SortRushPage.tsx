import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import clsx from 'clsx';
import type { Difficulty } from '../types/game';
import type { PokemonDex } from '../types/pokemon';
import { GameTimer } from '../components/game/GameTimer';
import { HighScoreTable } from '../components/game/HighScoreTable';
import { NameInputModal } from '../components/game/NameInputModal';
import { usePokedexStore } from '../store/pokedexStore';
import { useSortRushGame } from '../hooks/useSortRushGame';
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

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
};

const queueVariants: Variants = {
  enter: { y: -60, opacity: 0, scale: 0.3 },
  exit: (dir: 'left' | 'right') => ({
    x: dir === 'left' ? -420 : 420,
    opacity: 0,
    rotate: dir === 'left' ? -18 : 18,
    scale: 0.9,
    transition: { duration: 0.25, ease: 'easeOut' },
  }),
};

interface ReferencePanelProps {
  pokemons: PokemonDex[];
  side: 'left' | 'right';
}

function ReferencePanel({ pokemons, side }: ReferencePanelProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-4 h-full px-2',
        side === 'left' ? 'border-r border-[--color-border]' : 'border-l border-[--color-border]',
      )}
    >
      <p className="font-galmuri text-xs text-[--color-on-surface-muted]">
        {side === 'left' ? '← 왼쪽' : '오른쪽 →'}
      </p>
      {pokemons.map((p) => (
        <div key={p.id} className="flex flex-col items-center gap-1">
          <img
            src={p.imageUrl}
            alt={p.koreanName}
            className="w-32 h-32 object-contain"
            loading="lazy"
          />
          <span className="font-galmuri text-xs text-[--color-on-surface] text-center leading-tight">
            {p.koreanName}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SortRushPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const rawState: unknown = location.state;
  const pokemons = usePokedexStore((s) => s.data);

  const validState = isValidState(rawState) ? rawState : null;
  const difficulty = validState?.difficulty ?? 'easy';
  const highScoreKey = `highScore:sortrush:${difficulty}`;

  const [nameSaved, setNameSaved] = useState(false);

  const {
    phase,
    timeLeft,
    score,
    combo,
    lives,
    leftPokemons,
    rightPokemons,
    queue,
    lastDirection,
    lastOutcome,
    lastEventId,
    finalScore,
    handleAnswer,
    restart,
  } = useSortRushGame(difficulty, pokemons);

  useEffect(() => {
    if (!validState) navigate('/game', { replace: true });
  }, [validState, navigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== 'playing') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer('left');
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleAnswer('right');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, handleAnswer]);

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
            정렬 러시 · {DIFFICULTY_LABEL[difficulty]}
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
            <p className="font-galmuri text-xs text-[--color-on-surface-muted] text-center py-2">
              저장 중...
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRestart}
            className="bg-[--color-brand] hover:bg-[--color-brand-dark] text-white font-galmuri font-semibold px-6 py-2 rounded-[--radius-sm] transition-colors"
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
    <div className="flex flex-col h-[calc(100dvh-57px)] p-3 gap-3 overflow-hidden">
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
              <p className="font-galmuri text-3xl font-bold text-game-combo tabular-nums">
                ×{combo}
              </p>
            </div>
            <div>
              <p className="font-galmuri text-xs text-[--color-on-surface-muted]">LIFE</p>
              <p className="font-galmuri text-2xl text-game-error tabular-nums">
                {Array.from({ length: 3 }, (_, i) => (i < lives ? '♥' : '♡')).join('')}
              </p>
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

      {/* Game area */}
      <div className="flex-1 min-h-0 w-full max-w-2xl mx-auto flex">
        {/* Left panel */}
        <div className="w-44 shrink-0">
          <ReferencePanel pokemons={leftPokemons} side="left" />
        </div>

        {/* Center queue */}
        <div className="flex-1 flex flex-col items-center justify-end gap-4 px-4 relative overflow-hidden">
          {/* Floating feedback popup */}
          <AnimatePresence>
            {lastOutcome && (
              <motion.div
                key={lastEventId}
                initial={{ y: 0, opacity: 0, scale: 0.8 }}
                animate={{ y: -30, opacity: 1, scale: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={clsx(
                  'absolute top-4 font-galmuri text-lg font-bold pointer-events-none z-10',
                  lastOutcome === 'correct' ? 'text-game-success' : 'text-game-error',
                )}
              >
                {lastOutcome === 'correct' ? '정답!' : '−1 ♥'}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 flex flex-col-reverse items-center justify-between gap-0 w-full pb-2">
            <AnimatePresence mode="popLayout" custom={lastDirection} initial={false}>
              {queue.map((item, idx) => {
                const isFront = idx === 0;
                return (
                  <motion.div
                    key={item.turnId}
                    layout
                    custom={lastDirection}
                    variants={queueVariants}
                    initial="enter"
                    animate={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    className={clsx(
                      'flex items-center justify-center w-full overflow-visible',
                      isFront ? 'h-28' : 'h-24',
                    )}
                  >
                    <img
                      src={item.pokemon.imageUrl}
                      alt={item.pokemon.koreanName}
                      className="w-24 h-24 object-contain shrink-0"
                      draggable={false}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 font-galmuri text-sm text-[--color-on-surface-muted] shrink-0 pb-2">
            <span>← 왼쪽</span>
            <span>|</span>
            <span>오른쪽 →</span>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-44 shrink-0">
          <ReferencePanel pokemons={rightPokemons} side="right" />
        </div>
      </div>
    </div>
  );
}
