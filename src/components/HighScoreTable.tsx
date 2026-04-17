import type { HighScoreEntry } from '../types/highScore';

interface HighScoreTableProps {
  entries: HighScoreEntry[];
}

export function HighScoreTable({ entries }: HighScoreTableProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-[--color-on-surface-muted] text-center py-4">
        기록이 없습니다
      </p>
    );
  }

  return (
    <table className="w-full text-sm text-[--color-on-surface]">
      <thead>
        <tr className="text-[--color-on-surface-muted] border-b border-[--color-border]">
          <th className="py-2 text-left w-8">순위</th>
          <th className="py-2 text-left">이름</th>
          <th className="py-2 text-right">점수</th>
          <th className="py-2 text-right">날짜</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr
            key={`${entry.name}-${entry.playedAt}`}
            className="border-b border-[--color-border] last:border-0"
          >
            <td className="py-2 font-semibold">{index + 1}</td>
            <td className="py-2">{entry.name}</td>
            <td className="py-2 text-right text-[--color-score] font-bold">
              {entry.score.toLocaleString()}
            </td>
            <td className="py-2 text-right text-[--color-on-surface-muted]">
              {formatDate(entry.playedAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}
