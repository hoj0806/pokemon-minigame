interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-[--color-on-surface]">
      <p className="text-base font-semibold">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-[--color-brand] hover:bg-[--color-brand-dark] text-white font-semibold px-4 py-2 rounded-[--radius-sm]"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
