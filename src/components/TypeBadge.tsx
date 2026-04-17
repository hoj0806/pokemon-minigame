import { TYPE_COLOR } from '../utils/pokemonLocale';

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const colorClass = TYPE_COLOR[type] ?? 'bg-gray-400';
  return (
    <span
      className={`rounded-[--radius-badge] px-2 py-0.5 text-xs font-semibold text-white font-galmuri ${colorClass}`}
    >
      {type}
    </span>
  );
}
