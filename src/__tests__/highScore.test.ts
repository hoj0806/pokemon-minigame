import { describe, it, expect, beforeEach } from 'vitest';
import { getHighScores, isTop5, addHighScore } from '../utils/highScore';

const KEY = 'test:memory:easy';

const makeEntry = (name: string, score: number, day: number) => ({
  name,
  score,
  playedAt: `2026-01-${String(day).padStart(2, '0')}T00:00:00Z`,
});

describe('getHighScores', () => {
  beforeEach(() => localStorage.clear());

  it('returns empty array when key is missing', () => {
    expect(getHighScores(KEY)).toEqual([]);
  });

  it('returns empty array for corrupted JSON', () => {
    localStorage.setItem(KEY, 'not-json');
    expect(getHighScores(KEY)).toEqual([]);
  });

  it('returns empty array when value is not an array', () => {
    localStorage.setItem(KEY, JSON.stringify({ score: 100 }));
    expect(getHighScores(KEY)).toEqual([]);
  });

  it('filters out malformed entries', () => {
    const data = [makeEntry('A', 100, 1), { bad: true }];
    localStorage.setItem(KEY, JSON.stringify(data));
    expect(getHighScores(KEY)).toHaveLength(1);
  });

  it('returns valid entries as-is', () => {
    const entry = makeEntry('재훈', 1500, 1);
    localStorage.setItem(KEY, JSON.stringify([entry]));
    expect(getHighScores(KEY)).toEqual([entry]);
  });
});

describe('isTop5', () => {
  beforeEach(() => localStorage.clear());

  it('returns true when table is empty', () => {
    expect(isTop5(KEY, 0)).toBe(true);
  });

  it('returns true when fewer than 5 entries exist', () => {
    addHighScore(KEY, makeEntry('A', 100, 1));
    expect(isTop5(KEY, 50)).toBe(true);
  });

  it('returns true when score beats the lowest in a full table', () => {
    [500, 400, 300, 200, 100].forEach((s, i) => addHighScore(KEY, makeEntry(`P${i}`, s, i + 1)));
    expect(isTop5(KEY, 101)).toBe(true);
  });

  it('returns false when score ties with lowest (earlier record wins)', () => {
    [500, 400, 300, 200, 100].forEach((s, i) => addHighScore(KEY, makeEntry(`P${i}`, s, i + 1)));
    expect(isTop5(KEY, 100)).toBe(false);
  });

  it('returns false when score is below the lowest', () => {
    [500, 400, 300, 200, 100].forEach((s, i) => addHighScore(KEY, makeEntry(`P${i}`, s, i + 1)));
    expect(isTop5(KEY, 50)).toBe(false);
  });
});

describe('addHighScore', () => {
  beforeEach(() => localStorage.clear());

  it('persists an entry to localStorage', () => {
    addHighScore(KEY, makeEntry('A', 200, 1));
    expect(getHighScores(KEY)).toHaveLength(1);
  });

  it('keeps at most 5 entries', () => {
    for (let i = 0; i < 7; i++) {
      addHighScore(KEY, makeEntry(`P${i}`, (7 - i) * 100, i + 1));
    }
    expect(getHighScores(KEY)).toHaveLength(5);
  });

  it('sorts entries by score descending', () => {
    addHighScore(KEY, makeEntry('Low', 100, 1));
    addHighScore(KEY, makeEntry('High', 500, 2));
    addHighScore(KEY, makeEntry('Mid', 300, 3));
    const scores = getHighScores(KEY).map((e) => e.score);
    expect(scores).toEqual([500, 300, 100]);
  });

  it('earlier record ranks above same score (tie-breaking by playedAt)', () => {
    addHighScore(KEY, makeEntry('First', 200, 1));
    addHighScore(KEY, makeEntry('Second', 200, 2));
    const [top, second] = getHighScores(KEY);
    expect(top.name).toBe('First');
    expect(second.name).toBe('Second');
  });

  it('drops the lowest score when a higher one enters a full table', () => {
    [100, 200, 300, 400, 500].forEach((s, i) => addHighScore(KEY, makeEntry(`P${i}`, s, i + 1)));
    addHighScore(KEY, makeEntry('New', 999, 10));
    const entries = getHighScores(KEY);
    expect(entries).toHaveLength(5);
    expect(entries[0].name).toBe('New');
    expect(entries.some((e) => e.score === 100)).toBe(false);
  });

  it('does not persist a score that loses tie-break when table is full', () => {
    [100, 200, 300, 400, 500].forEach((s, i) => addHighScore(KEY, makeEntry(`P${i}`, s, i + 1)));
    // 100 ties with existing lowest — isTop5 returns false so addHighScore should never be called
    // but if called directly, it would be added then sliced out since playedAt is later
    addHighScore(KEY, makeEntry('LateEqual', 100, 20));
    const entries = getHighScores(KEY);
    expect(entries).toHaveLength(5);
    expect(entries.find((e) => e.name === 'LateEqual')).toBeUndefined();
  });
});
