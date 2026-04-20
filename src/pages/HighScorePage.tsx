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
    activeClass: 'bg-blue-500 text-white shadow-md',
    inactiveClass: 'bg-blue-100 border border-blue-300 text-blue-600 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300',
  },
  {
    id: 'sortrush',
    label: '정렬 러시',
    hasDifficulty: true,
    activeClass: 'bg-green-500 text-white shadow-md',
    inactiveClass: 'bg-green-100 border border-green-300 text-green-600 dark:bg-green-950 dark:border-green-700 dark:text-green-300',
  },
  {
    id: 'merge',
    label: '포켓몬 머지',
    hasDifficulty: false,
    activeClass: 'bg-orange-500 text-white shadow-md',
    inactiveClass: 'bg-orange-100 border border-orange-300 text-orange-600 dark:bg-orange-950 dark:border-orange-700 dark:text-orange-300',
  },
];

const DIFFICULTIES: DifficultyOption[] = [
  {
    id: 'easy',
    label: '쉬움',
    activeClass: 'bg-green-500 text-white font-semibold shadow-sm',
    inactiveClass: 'bg-green-100 border border-green-300 text-green-600 dark:bg-green-950 dark:border-green-700 dark:text-green-300',
  },
  {
    id: 'normal',
    label: '보통',
    activeClass: 'bg-yellow-400 text-white font-semibold shadow-sm',
    inactiveClass: 'bg-yellow-100 border border-yellow-300 text-yellow-600 dark:bg-yellow-950 dark:border-yellow-700 dark:text-yellow-300',
  },
  {
    id: 'hard',
    label: '어려움',
    activeClass: 'bg-red-500 text-white font-semibold shadow-sm',
    inactiveClass: 'bg-red-100 border border-red-300 text-red-600 dark:bg-red-950 dark:border-red-700 dark:text-red-300',
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
