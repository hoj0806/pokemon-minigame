import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Difficulty } from '../types/game';

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

export default function SortRushPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state: unknown = location.state;

  useEffect(() => {
    if (!isValidState(state)) {
      navigate('/game', { replace: true });
    }
  }, [state, navigate]);

  if (!isValidState(state)) return null;

  const { difficulty } = state;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-57px)]">
      <h1 className="font-galmuri text-2xl text-[--color-on-surface]">
        정렬 러시 — {difficulty}
      </h1>
    </div>
  );
}
