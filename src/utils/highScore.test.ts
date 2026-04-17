import { beforeEach, describe, expect, it } from 'vitest';
import { addHighScore, getHighScores, isTop5 } from './highScore';
import type { HighScoreEntry } from '../types/highScore';

const KEY = 'highScore:memory:easy';

function makeEntry(name: string, score: number): HighScoreEntry {
  return { name, score, playedAt: '2026-04-17T00:00:00.000Z' };
}

beforeEach(() => {
  localStorage.clear();
});

describe('getHighScores', () => {
  it('저장된 항목이 없으면 빈 배열을 반환한다', () => {
    expect(getHighScores(KEY)).toEqual([]);
  });

  it('잘못된 JSON이 저장돼 있어도 빈 배열을 반환한다', () => {
    localStorage.setItem(KEY, 'not-json');
    expect(getHighScores(KEY)).toEqual([]);
  });

  it('유효하지 않은 항목은 필터링한다', () => {
    localStorage.setItem(KEY, JSON.stringify([{ invalid: true }, makeEntry('홍길동', 500)]));
    expect(getHighScores(KEY)).toHaveLength(1);
  });
});

describe('isTop5', () => {
  it('저장된 항목이 5개 미만이면 항상 true를 반환한다', () => {
    addHighScore(KEY, makeEntry('A', 100));
    addHighScore(KEY, makeEntry('B', 200));
    expect(isTop5(KEY, 1)).toBe(true);
  });

  it('5개가 꽉 찼을 때 최하위보다 높은 점수면 true를 반환한다', () => {
    ['A', 'B', 'C', 'D', 'E'].forEach((n, i) => addHighScore(KEY, makeEntry(n, (i + 1) * 100)));
    expect(isTop5(KEY, 600)).toBe(true);
  });

  it('5개가 꽉 찼을 때 최하위 점수 이하면 false를 반환한다', () => {
    ['A', 'B', 'C', 'D', 'E'].forEach((n, i) => addHighScore(KEY, makeEntry(n, (i + 1) * 100)));
    expect(isTop5(KEY, 100)).toBe(false);
    expect(isTop5(KEY, 50)).toBe(false);
  });
});

describe('addHighScore', () => {
  it('항목을 추가하면 score 내림차순으로 정렬된다', () => {
    addHighScore(KEY, makeEntry('C', 300));
    addHighScore(KEY, makeEntry('A', 100));
    addHighScore(KEY, makeEntry('B', 200));
    const scores = getHighScores(KEY).map((e) => e.score);
    expect(scores).toEqual([300, 200, 100]);
  });

  it('6번째 항목을 추가하면 최하위가 제거되어 5개만 유지된다', () => {
    for (let i = 1; i <= 6; i++) addHighScore(KEY, makeEntry(`P${i}`, i * 100));
    const entries = getHighScores(KEY);
    expect(entries).toHaveLength(5);
    expect(entries[0].score).toBe(600);
    expect(entries[4].score).toBe(200);
  });

  it('동점 항목도 정상적으로 저장된다', () => {
    addHighScore(KEY, makeEntry('A', 500));
    addHighScore(KEY, makeEntry('B', 500));
    const entries = getHighScores(KEY);
    expect(entries).toHaveLength(2);
    expect(entries.every((e) => e.score === 500)).toBe(true);
  });
});
