import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Difficulty, GameId } from '../types/game';

type Step = 'select' | 'difficulty';

interface GameInfo {
  id: GameId;
  title: string;
  description: string;
  rules: string[];
  difficulties: { id: Difficulty; label: string; detail: string }[];
}

const GAMES: GameInfo[] = [
  {
    id: 'memory',
    title: '메모리 매치',
    description: '뒤집힌 카드를 맞춰 같은 포켓몬 쌍을 찾아라',
    rules: ['제한 시간 1분', '콤보 연속 성공 시 보너스 점수', '클리어 시 남은 시간 보너스'],
    difficulties: [
      { id: 'easy', label: '쉬움', detail: '6쌍 · 12장' },
      { id: 'normal', label: '보통', detail: '8쌍 · 16장' },
      { id: 'hard', label: '어려움', detail: '10쌍 · 20장' },
    ],
  },
  {
    id: 'sortrush',
    title: '정렬 러시',
    description: '포켓몬을 빠르게 좌우로 분류해 점수를 올려라',
    rules: ['제한 시간 1분 · 목숨 3개', '← → 방향키로 포켓몬 분류', '오답 시 목숨 1개 감소'],
    difficulties: [
      { id: 'easy', label: '쉬움', detail: '기준 2마리' },
      { id: 'normal', label: '보통', detail: '기준 4마리' },
      { id: 'hard', label: '어려움', detail: '기준 6마리' },
    ],
  },
];

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: 'border-game-success text-game-success',
  normal: 'border-game-warning text-game-warning',
  hard: 'border-game-error text-game-error',
};

export default function GameSelectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select');
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  const handleGameSelect = (id: GameId) => {
    setSelectedGame(id);
    setStep('difficulty');
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    if (!selectedGame) return;
    navigate(`/game/${selectedGame}`, { state: { difficulty } });
  };

  if (step === 'difficulty' && selectedGame !== null) {
    const game = GAMES.find((g) => g.id === selectedGame)!;

    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-8 p-6">
        <div className="text-center">
          <p className="font-galmuri text-sm text-[--color-on-surface-muted] mb-1">{game.title}</p>
          <h1 className="font-galmuri text-2xl font-bold text-[--color-on-surface]">난이도 선택</h1>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          {game.difficulties.map(({ id, label, detail }) => (
            <button
              key={id}
              onClick={() => handleDifficultySelect(id)}
              className={`rounded-[--radius-card] border-2 bg-[--color-surface-raised] shadow-[--shadow-card] px-6 py-5 text-left cursor-pointer hover:shadow-[--shadow-elevated] transition-shadow ${DIFFICULTY_COLOR[id]}`}
            >
              <span className="font-galmuri text-xl font-bold">{label}</span>
              <span className="font-galmuri text-sm text-[--color-on-surface-muted] ml-3">
                {detail}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setStep('select')}
          className="text-sm text-[--color-on-surface-muted] hover:text-[--color-on-surface] transition-colors"
        >
          ← 게임 선택으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-8 p-6">
      <h1 className="font-galmuri text-2xl font-bold text-[--color-on-surface]">게임 선택</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {GAMES.map(({ id, title, description, rules }) => (
          <button
            key={id}
            onClick={() => handleGameSelect(id)}
            className="rounded-[--radius-card] bg-[--color-surface-raised] border border-[--color-border] shadow-[--shadow-card] p-8 text-left cursor-pointer hover:shadow-[--shadow-elevated] transition-shadow"
          >
            <h2 className="font-galmuri text-xl font-bold text-[--color-on-surface] mb-1">
              {title}
            </h2>
            <p className="text-sm text-[--color-on-surface-muted] mb-4">{description}</p>
            <ul className="flex flex-col gap-1">
              {rules.map((rule) => (
                <li key={rule} className="text-xs text-[--color-on-surface-muted] flex gap-1.5">
                  <span>·</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </button>
        ))}

        <div className="relative rounded-[--radius-card] bg-[--color-surface-raised] border border-[--color-border] shadow-[--shadow-card] p-8 text-left opacity-50 cursor-not-allowed overflow-hidden">
          <h2 className="font-galmuri text-xl font-bold text-[--color-on-surface] mb-1">
            포켓몬 머지
          </h2>
          <p className="text-sm text-[--color-on-surface-muted]">
            포켓몬을 합체시켜 더 강한 포켓몬으로 진화시켜라
          </p>
          <span className="absolute top-3 right-3 font-galmuri text-xs font-bold bg-[--color-border] text-[--color-on-surface-muted] px-2 py-0.5 rounded-[--radius-badge]">
            준비 중
          </span>
        </div>
      </div>
    </div>
  );
}
