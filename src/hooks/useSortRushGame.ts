import { useEffect, useReducer } from 'react';
import type { PokemonDex } from '../types/pokemon';
import type { Difficulty } from '../types/game';

export type GamePhase = 'idle' | 'playing' | 'result';

export interface QueueItem {
  turnId: number;
  pokemon: PokemonDex;
}

interface State {
  phase: GamePhase;
  timeLeft: number;
  score: number;
  combo: number;
  lives: number;
  leftPokemons: PokemonDex[];
  rightPokemons: PokemonDex[];
  queue: QueueItem[];
  lastDirection: 'left' | 'right';
  lastOutcome: 'correct' | 'wrong' | null;
  lastEventId: number;
  nextTurnId: number;
  finalScore: number;
}

type Action =
  | {
      type: 'INIT';
      left: PokemonDex[];
      right: PokemonDex[];
      queue: QueueItem[];
      nextTurnId: number;
    }
  | { type: 'TICK' }
  | { type: 'ANSWER'; direction: 'left' | 'right'; nextPokemon: PokemonDex }
  | { type: 'END' };

const INITIAL_TIME = 60;
const INITIAL_LIVES = 3;
const QUEUE_SIZE = 5;

const REF_COUNT: Record<Difficulty, number> = { easy: 2, normal: 4, hard: 6 };

function comboBonus(combo: number): number {
  if (combo >= 4) return 200;
  if (combo === 3) return 100;
  if (combo === 2) return 50;
  return 0;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildReferencePokemons(
  pokemons: PokemonDex[],
  difficulty: Difficulty,
): { left: PokemonDex[]; right: PokemonDex[] } {
  const count = REF_COUNT[difficulty];
  const selected = shuffle(pokemons).slice(0, count);
  const half = count / 2;
  return { left: selected.slice(0, half), right: selected.slice(half) };
}

function buildInitialQueue(refs: PokemonDex[], startTurnId: number): QueueItem[] {
  return Array.from({ length: QUEUE_SIZE }, (_, i) => ({
    turnId: startTurnId + i,
    pokemon: pickRandom(refs),
  }));
}

const INIT_STATE: State = {
  phase: 'idle',
  timeLeft: INITIAL_TIME,
  score: 0,
  combo: 0,
  lives: INITIAL_LIVES,
  leftPokemons: [],
  rightPokemons: [],
  queue: [],
  lastDirection: 'right',
  lastOutcome: null,
  lastEventId: 0,
  nextTurnId: 0,
  finalScore: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT':
      return {
        ...INIT_STATE,
        phase: 'playing',
        leftPokemons: action.left,
        rightPokemons: action.right,
        queue: action.queue,
        nextTurnId: action.nextTurnId,
      };

    case 'TICK': {
      if (state.timeLeft <= 1) {
        return {
          ...state,
          timeLeft: 0,
          phase: 'result',
          finalScore: state.score,
        };
      }
      return { ...state, timeLeft: state.timeLeft - 1 };
    }

    case 'ANSWER': {
      if (state.phase !== 'playing' || state.queue.length === 0) return state;
      const front = state.queue[0];
      const isLeft = state.leftPokemons.some((p) => p.id === front.pokemon.id);
      const correct =
        (isLeft && action.direction === 'left') || (!isLeft && action.direction === 'right');

      const newQueue: QueueItem[] = [
        ...state.queue.slice(1),
        { turnId: state.nextTurnId, pokemon: action.nextPokemon },
      ];

      if (correct) {
        const newCombo = state.combo + 1;
        const newScore = state.score + 100 + comboBonus(newCombo);
        return {
          ...state,
          score: newScore,
          combo: newCombo,
          queue: newQueue,
          lastDirection: action.direction,
          lastOutcome: 'correct',
          lastEventId: state.lastEventId + 1,
          nextTurnId: state.nextTurnId + 1,
        };
      }

      const newLives = state.lives - 1;
      if (newLives <= 0) {
        return {
          ...state,
          lives: 0,
          combo: 0,
          queue: newQueue,
          lastDirection: action.direction,
          lastOutcome: 'wrong',
          lastEventId: state.lastEventId + 1,
          nextTurnId: state.nextTurnId + 1,
          phase: 'result',
          finalScore: state.score + state.timeLeft * 5,
        };
      }
      return {
        ...state,
        lives: newLives,
        combo: 0,
        queue: newQueue,
        lastDirection: action.direction,
        lastOutcome: 'wrong',
        lastEventId: state.lastEventId + 1,
        nextTurnId: state.nextTurnId + 1,
      };
    }

    case 'END':
      return { ...state, phase: 'result', finalScore: state.score + state.timeLeft * 5 };

    default:
      return state;
  }
}

export function useSortRushGame(difficulty: Difficulty, pokemons: PokemonDex[]) {
  const [state, dispatch] = useReducer(reducer, INIT_STATE);

  useEffect(() => {
    if (pokemons.length === 0) return;
    const { left, right } = buildReferencePokemons(pokemons, difficulty);
    const queue = buildInitialQueue([...left, ...right], 0);
    dispatch({ type: 'INIT', left, right, queue, nextTurnId: QUEUE_SIZE });
  }, [difficulty, pokemons]);

  useEffect(() => {
    if (state.phase !== 'playing') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.phase]);

  const handleAnswer = (direction: 'left' | 'right') => {
    if (state.phase !== 'playing' || state.queue.length === 0) return;
    const all = [...state.leftPokemons, ...state.rightPokemons];
    if (all.length === 0) return;
    dispatch({ type: 'ANSWER', direction, nextPokemon: pickRandom(all) });
  };

  const restart = () => {
    if (pokemons.length === 0) return;
    const { left, right } = buildReferencePokemons(pokemons, difficulty);
    const queue = buildInitialQueue([...left, ...right], 0);
    dispatch({ type: 'INIT', left, right, queue, nextTurnId: QUEUE_SIZE });
  };

  return {
    phase: state.phase,
    timeLeft: state.timeLeft,
    score: state.score,
    combo: state.combo,
    lives: state.lives,
    leftPokemons: state.leftPokemons,
    rightPokemons: state.rightPokemons,
    queue: state.queue,
    lastDirection: state.lastDirection,
    lastOutcome: state.lastOutcome,
    lastEventId: state.lastEventId,
    finalScore: state.finalScore,
    handleAnswer,
    restart,
  };
}
