import { TYPE_COLOR, TYPE_CARD_GRADIENT } from '../../utils/pokemonLocale';

interface TypeBadgeProps {
  type: string;
  gradient?: boolean;
}

export function TypeBadge({ type, gradient = false }: TypeBadgeProps) {
  if (gradient) {
    const gradientClass = TYPE_CARD_GRADIENT[type] ?? 'from-gray-400 to-gray-500';
    return (
      <span
        className={`rounded-md px-2 py-0.5 text-xs font-semibold text-white font-galmuri bg-linear-to-br ${gradientClass}`}
      >
        {type}
      </span>
    );
  }
  const colorClass = TYPE_COLOR[type] ?? 'bg-gray-400';
  return (
    <span
      className={`rounded-[--radius-badge] px-2 py-0.5 text-xs font-semibold text-white font-galmuri ${colorClass}`}
    >
      {type}
    </span>
  );
}
