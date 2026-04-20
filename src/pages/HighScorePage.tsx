import { useState } from 'react';
import { HighScoreTable } from '../components/game/HighScoreTable';
import { getHighScores } from '../utils/highScore';
import type { Difficulty, GameId } from '../types/game';

interface GameTab {
  id: GameId;
  label: string;
  hasDifficulty: boolean;
  activeClass: string;
  inactiveClass: string;
}

interface DifficultyOption {
  id: Difficulty;
  label: string;
  activeClass: string;
  inactiveClass: string;
}

const GAME_TABS: GameTab[] = [
  {
    id: 'memory',
    label: '메모리 매치',
    hasDifficulty: true,
    activeClass: 'bg-[--color-type-water] text-white shadow-md',
    inactiveClass: 'bg-[--color-type-water]/20 border border-[--color-type-water]/50 text-[--color-type-water]',
  },
  {
    id: 'sortrush',
    label: '정렬 러시',
    hasDifficulty: true,
    activeClass: 'bg-[--color-type-grass] text-white shadow-md',
    inactiveClass: 'bg-[--color-type-grass]/20 border border-[--color-type-grass]/50 text-[--color-type-grass]',
  },
  {
    id: 'merge',
    label: '포켓몬 머지',
    hasDifficulty: false,
    activeClass: 'bg-[--color-type-fire] text-white shadow-md',
    inactiveClass: 'bg-[--color-type-fire]/20 border border-[--color-type-fire]/50 text-[--color-type-fire]',
  },
];

const DIFFICULTIES: DifficultyOption[] = [
  {
    id: 'easy',
    label: '쉬움',
    activeClass: 'bg-[--color-game-success] text-white font-semibold shadow-sm',
    inactiveClass: 'bg-[--color-game-success]/20 border border-[--color-game-success]/50 text-[--color-game-success]',
  },
  {
    id: 'normal',
    label: '보통',
    activeClass: 'bg-[--color-game-warning] text-white font-semibold shadow-sm',
    inactiveClass: 'bg-[--color-game-warning]/20 border border-[--color-game-warning]/50 text-[--color-game-warning]',
  },
  {
    id: 'hard',
    label: '어려움',
    activeClass: 'bg-[--color-game-error] text-white font-semibold shadow-sm',
    inactiveClass: 'bg-[--color-game-error]/20 border border-[--color-game-error]/50 text-[--color-game-error]',
  },
];

export default function HighScorePage() {
  const [activeGame, setActiveGame] = useState<GameId>('memory');
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>('easy');

  const activeTab = GAME_TABS.find((t) => t.id === activeGame);
  const hasDifficulty = activeTab?.hasDifficulty ?? false;
  const key = hasDifficulty
    ? `highScore:${activeGame}:${activeDifficulty}`
    : `highScore:${activeGame}`;
  const entries = getHighScores(key);

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-57px)] p-6">
      <h1 className="font-galmuri text-2xl font-bold text-[--color-on-surface] mb-8">
        하이스코어
      </h1>

      <div className="flex gap-2 mb-4">
        {GAME_TABS.map(({ id, label, activeClass, inactiveClass }) => (
          <button
            key={id}
            onClick={() => setActiveGame(id)}
            className={`font-galmuri px-5 py-2 rounded-[--radius-sm] text-sm font-semibold transition-colors cursor-pointer ${
              activeGame === id ? activeClass : inactiveClass
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {hasDifficulty && (
        <div className="flex gap-2 mb-6">
          {DIFFICULTIES.map(({ id, label, activeClass, inactiveClass }) => (
            <button
              key={id}
              onClick={() => setActiveDifficulty(id)}
              className={`font-galmuri px-4 py-1.5 rounded-[--radius-sm] text-sm transition-colors cursor-pointer ${
                activeDifficulty === id ? activeClass : inactiveClass
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="w-full max-w-lg rounded-[--radius-card] bg-[--color-surface-raised] border border-[--color-border] shadow-[--shadow-card] p-6">
        <HighScoreTable entries={entries} />
      </div>
    </div>
  );
}
