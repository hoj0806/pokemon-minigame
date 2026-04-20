import { useState } from 'react';
import { HighScoreTable } from '../components/game/HighScoreTable';
import { getHighScores } from '../utils/highScore';
import type { Difficulty, GameId } from '../types/game';

interface GameTab {
  id: GameId;
  label: string;
  hasDifficulty: boolean;
}

interface DifficultyOption {
  id: Difficulty;
  label: string;
}

const GAME_TABS: GameTab[] = [
  { id: 'memory', label: '메모리 매치', hasDifficulty: true },
  { id: 'sortrush', label: '정렬 러시', hasDifficulty: true },
  { id: 'merge', label: '포켓몬 머지', hasDifficulty: false },
];

const DIFFICULTIES: DifficultyOption[] = [
  { id: 'easy', label: '쉬움' },
  { id: 'normal', label: '보통' },
  { id: 'hard', label: '어려움' },
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
        {GAME_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveGame(id)}
            className={`font-galmuri px-5 py-2 rounded-[--radius-sm] text-sm font-semibold transition-colors ${
              activeGame === id
                ? 'bg-[--color-brand] text-white'
                : 'border border-[--color-border] text-[--color-on-surface]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {hasDifficulty && (
        <div className="flex gap-2 mb-6">
          {DIFFICULTIES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveDifficulty(id)}
              className={`font-galmuri px-4 py-1.5 rounded-[--radius-sm] text-sm transition-colors ${
                activeDifficulty === id
                  ? 'bg-[--color-accent] text-white font-semibold'
                  : 'border border-[--color-border] text-[--color-on-surface-muted]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="w-full max-w-md rounded-[--radius-card] bg-[--color-surface-raised] border border-[--color-border] shadow-[--shadow-card] p-4">
        <HighScoreTable entries={entries} />
      </div>
    </div>
  );
}
