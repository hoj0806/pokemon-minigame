import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Difficulty, GameId } from '../types/game';

type Step = 'select' | 'difficulty';

interface GameInfo {
  id: GameId;
  title: string;
  description: string;
  rules: string[];
  difficulties: { id: Difficulty; label: string; detail: string }[] | null;
  mascot: { sprite: string; name: string };
  theme: { bg: string; hoverBg: string; badge: string; text: string; subText: string };
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
    mascot: {
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
      name: '파이리',
    },
    theme: {
      bg: 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-600',
      hoverBg: 'hover:bg-orange-200 dark:hover:bg-orange-800',
      badge: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
      text: '',
      subText: '',
    },
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
    mascot: {
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      name: '이상해씨',
    },
    theme: {
      bg: 'bg-emerald-100 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-600',
      hoverBg: 'hover:bg-emerald-200 dark:hover:bg-emerald-800',
      badge: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
      text: '',
      subText: '',
    },
  },
  {
    id: 'merge',
    title: '포켓몬 머지',
    description: '포켓몬을 합체시켜 더 강한 포켓몬으로 진화시켜라',
    rules: ['제한 시간 없음', '같은 포켓몬이 닿으면 합체', '데드라인을 넘으면 게임 종료'],
    difficulties: null,
    mascot: {
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
      name: '꼬부기',
    },
    theme: {
      bg: 'bg-sky-100 dark:bg-sky-900 border-sky-300 dark:border-sky-600',
      hoverBg: 'hover:bg-sky-200 dark:hover:bg-sky-800',
      badge: 'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300',
      text: '',
      subText: '',
    },
  },
];

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: 'border-game-success text-white bg-game-success hover:brightness-110',
  normal: 'border-game-warning text-white bg-game-warning hover:brightness-110',
  hard: 'border-game-error text-white bg-game-error hover:brightness-110',
};

export default function GameSelectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select');
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  const handleGameSelect = (game: GameInfo) => {
    if (game.difficulties === null) {
      navigate(`/game/${game.id}`);
      return;
    }
    setSelectedGame(game.id);
    setStep('difficulty');
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    if (!selectedGame) return;
    navigate(`/game/${selectedGame}`, { state: { difficulty } });
  };

  if (step === 'difficulty' && selectedGame !== null) {
    const game = GAMES.find((g) => g.id === selectedGame);
    if (!game || game.difficulties === null) return null;

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
              className={`rounded-[--radius-card] border-2 bg-[--color-surface-raised] shadow-[--shadow-card] px-6 py-5 text-left cursor-pointer hover:shadow-[--shadow-elevated] hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-100 transition-all duration-150 ${DIFFICULTY_COLOR[id]}`}
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
          className="font-galmuri text-sm text-[--color-on-surface] border-2 border-[--color-border] px-5 py-2.5 rounded-md shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:border-[--color-border-strong] active:shadow-none active:translate-y-0 transition-all duration-150 cursor-pointer"
        >
          ← 게임 선택으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-8 p-6">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 font-galmuri text-sm text-[--color-on-surface] border-2 border-[--color-border] px-3 py-1.5 rounded-md shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:border-[--color-border-strong] active:shadow-none active:translate-y-0 transition-all duration-150 cursor-pointer"
      >
        ← 홈
      </button>

      <h1 className="font-galmuri text-2xl font-bold text-[--color-on-surface]">게임 선택</h1>

      <div className="flex flex-row gap-4 w-full max-w-4xl">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => handleGameSelect(game)}
            className={`group flex-1 rounded-[--radius-card] border-2 shadow-[--shadow-card] p-6 text-left cursor-pointer hover:shadow-[--shadow-elevated] hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-100 transition-all duration-150 ${game.theme.bg} ${game.theme.hoverBg}`}
          >
            <div className="flex justify-center mb-3">
              <img
                src={game.mascot.sprite}
                alt={game.mascot.name}
                className="w-20 h-20 object-contain drop-shadow-md pixelated"
                draggable={false}
              />
            </div>
            <h2 className={`font-galmuri text-xl font-bold text-[--color-on-surface] group-hover:text-white mb-1 transition-colors duration-150 ${game.theme.text}`}>
              {game.title}
            </h2>
            <p className={`font-galmuri text-sm text-[--color-on-surface-muted] group-hover:text-white/80 mb-3 transition-colors duration-150 ${game.theme.subText}`}>
              {game.description}
            </p>
            <ul className="flex flex-col gap-1">
              {game.rules.map((rule) => (
                <li key={rule} className={`font-galmuri text-xs text-[--color-on-surface-muted] group-hover:text-white/70 flex gap-1.5 transition-colors duration-150 ${game.theme.subText}`}>
                  <span>·</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
}
