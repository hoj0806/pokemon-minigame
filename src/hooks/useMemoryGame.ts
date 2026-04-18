import { useEffect, useReducer } from 'react';
import type { PokemonDex } from '../types/pokemon';
import type { Difficulty } from '../types/game';

export interface CardState {
  pokemon: PokemonDex;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export type GamePhase = 'idle' | 'preparing' | 'playing' | 'result';

interface State {
  cards: CardState[];
  phase: GamePhase;
  timeLeft: number;
  score: number;
  combo: number;
  flippedIndexes: number[];
  isLocked: boolean;
  finalScore: number;
}

type Action =
  | { type: 'INIT'; cards: CardState[] }
  | { type: 'START_PLAYING' }
  | { type: 'TICK' }
  | { type: 'FLIP'; index: number }
  | { type: 'MATCH'; i1: number; i2: number }
  | { type: 'MISMATCH'; i1: number; i2: number }
  | { type: 'END' };

const INITIAL_TIME = 60;

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

const PAIRS: Record<Difficulty, number> = { easy: 6, normal: 8, hard: 10 };

function buildCards(pokemons: PokemonDex[], difficulty: Difficulty): CardState[] {
  const selected = pokemons.slice(0, PAIRS[difficulty]);
  const doubled = selected.flatMap((pokemon, pairId) => [
    { pokemon, pairId, isFlipped: false, isMatched: false },
    { pokemon, pairId, isFlipped: false, isMatched: false },
  ]);
  return shuffle(doubled);
}

const INIT_STATE: State = {
  cards: [],
  phase: 'idle',
  timeLeft: INITIAL_TIME,
  score: 0,
  combo: 0,
  flippedIndexes: [],
  isLocked: true,
  finalScore: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT':
      return {
        ...INIT_STATE,
        cards: action.cards.map((c) => ({ ...c, isFlipped: true })),
        phase: 'preparing',
        isLocked: true,
      };

    case 'START_PLAYING':
      return {
        ...state,
        cards: state.cards.map((c) => ({ ...c, isFlipped: false })),
        phase: 'playing',
        isLocked: false,
      };

    case 'TICK':
      if (state.timeLeft <= 1) {
        return { ...state, timeLeft: 0, phase: 'result', finalScore: state.score };
      }
      return { ...state, timeLeft: state.timeLeft - 1 };

    case 'FLIP': {
      const newCards = state.cards.map((c, i) =>
        i === action.index ? { ...c, isFlipped: true } : c,
      );
      const newFlipped = [...state.flippedIndexes, action.index];
      return { ...state, cards: newCards, flippedIndexes: newFlipped, isLocked: newFlipped.length >= 2 };
    }

    case 'MATCH': {
      const newCombo = state.combo + 1;
      const newScore = state.score + 100 + comboBonus(newCombo);
      const newCards = state.cards.map((c, i) =>
        i === action.i1 || i === action.i2 ? { ...c, isMatched: true } : c,
      );
      const allDone = newCards.every((c) => c.isMatched);
      const total = newScore + (allDone ? state.timeLeft * 5 : 0);
      return {
        ...state,
        cards: newCards,
        score: total,
        combo: newCombo,
        flippedIndexes: [],
        isLocked: false,
        ...(allDone ? { phase: 'result' as GamePhase, finalScore: total } : {}),
      };
    }

    case 'MISMATCH':
      return {
        ...state,
        cards: state.cards.map((c, i) =>
          i === action.i1 || i === action.i2 ? { ...c, isFlipped: false } : c,
        ),
        flippedIndexes: [],
        isLocked: false,
        combo: 0,
      };

    case 'END':
      return { ...state, phase: 'result', finalScore: state.score, isLocked: true };

    default:
      return state;
  }
}

export function useMemoryGame(difficulty: Difficulty, pokemons: PokemonDex[]) {
  const [state, dispatch] = useReducer(reducer, INIT_STATE);

  useEffect(() => {
    if (pokemons.length === 0) return;
    dispatch({ type: 'INIT', cards: buildCards(pokemons, difficulty) });
  }, [difficulty, pokemons]);

  useEffect(() => {
    if (state.phase !== 'preparing') return;
    const id = setTimeout(() => dispatch({ type: 'START_PLAYING' }), 2500);
    return () => clearTimeout(id);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'playing') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.phase]);

  const handleCardClick = (index: number) => {
    const card = state.cards[index];
    if (state.isLocked || !card || card.isFlipped || card.isMatched) return;

    if (state.flippedIndexes.length === 0) {
      dispatch({ type: 'FLIP', index });
      return;
    }

    const i1 = state.flippedIndexes[0];
    const first = state.cards[i1];
    dispatch({ type: 'FLIP', index });

    if (first.pairId === card.pairId) {
      setTimeout(() => dispatch({ type: 'MATCH', i1, i2: index }), 400);
    } else {
      setTimeout(() => dispatch({ type: 'MISMATCH', i1, i2: index }), 800);
    }
  };

  const restart = () => {
    if (pokemons.length === 0) return;
    dispatch({ type: 'INIT', cards: buildCards(pokemons, difficulty) });
  };

  const endGame = () => dispatch({ type: 'END' });

  return {
    cards: state.cards,
    phase: state.phase,
    timeLeft: state.timeLeft,
    score: state.score,
    combo: state.combo,
    finalScore: state.finalScore,
    handleCardClick,
    restart,
    endGame,
  };
}
