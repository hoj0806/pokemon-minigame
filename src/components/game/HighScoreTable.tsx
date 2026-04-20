import type { HighScoreEntry } from '../../types/highScore';

interface HighScoreTableProps {
  entries: HighScoreEntry[];
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function HighScoreTable({ entries }: HighScoreTableProps) {
  if (entries.length === 0) {
    return (
      <p className="font-galmuri text-base text-[--color-on-surface-muted] text-center py-6">
        기록이 없습니다
      </p>
    );
  }

  return (
    <table className="w-full font-galmuri text-base text-[--color-on-surface]">
      <thead>
        <tr className="text-[--color-on-surface-muted] border-b-2 border-[--color-border]">
          <th className="py-3 text-left w-12">순위</th>
          <th className="py-3 text-left">이름</th>
          <th className="py-3 text-right">점수</th>
          <th className="py-3 text-right">날짜</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <tr
            key={`${entry.name}-${entry.playedAt}`}
            className="border-b border-[--color-border] last:border-0"
          >
            <td className="py-3 font-semibold text-lg">
              {index < 3 ? (
                <span>{MEDALS[index]}</span>
              ) : (
                <span className="text-[--color-on-surface-muted]">{index + 1}</span>
              )}
            </td>
            <td className="py-3 text-base">{entry.name}</td>
            <td className="py-3 text-right text-[--color-score] font-bold text-lg">
              {entry.score.toLocaleString()}
            </td>
            <td className="py-3 text-right text-[--color-on-surface-muted] text-sm">
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
