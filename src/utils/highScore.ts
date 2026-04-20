import type { HighScoreEntry } from '../types/highScore';

const MAX_ENTRIES = 5;

export function getHighScores(key: string): HighScoreEntry[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHighScoreEntry);
  } catch {
    return [];
  }
}

export function isTop5(key: string, score: number): boolean {
  const entries = getHighScores(key);
  if (entries.length < MAX_ENTRIES) return true;
  const lowest = entries[entries.length - 1]?.score ?? 0;
  return score > lowest;
}

export function getRank(key: string, score: number): number {
  const entries = getHighScores(key);
  return entries.filter((e) => e.score > score).length + 1;
}

export function addHighScore(key: string, entry: HighScoreEntry): void {
  const entries = getHighScores(key);
  const next = [...entries, entry]
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime(),
    )
    .slice(0, MAX_ENTRIES);
  localStorage.setItem(key, JSON.stringify(next));
}

function isHighScoreEntry(value: unknown): value is HighScoreEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    typeof v.score === 'number' &&
    typeof v.playedAt === 'string'
  );
}
