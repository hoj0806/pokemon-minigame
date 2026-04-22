import { useState, useEffect } from 'react';

const DOTS = ['.', '..', '...'];

function useDots() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((prev) => (prev + 1) % DOTS.length), 500);
    return () => clearInterval(id);
  }, []);
  return DOTS[idx];
}

function PokeBallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="45" fill="white" stroke="black" strokeWidth="6" />
      <path d="M 5 50 A 45 45 0 0 1 95 50 Z" fill="#EE1515" />
      <line x1="5" y1="50" x2="95" y2="50" stroke="black" strokeWidth="6" />
      <circle cx="50" cy="50" r="14" fill="white" stroke="black" strokeWidth="6" />
      <circle cx="50" cy="50" r="6" fill="white" />
    </svg>
  );
}

interface FullScreenLoaderProps {
  error: Error | null;
  onRetry: () => void;
}

export function FullScreenLoader({ error, onRetry }: FullScreenLoaderProps) {
  const dots = useDots();
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-brand">
      {error ? (
        <>
          <div className="w-24 h-24 opacity-60">
            <PokeBallIcon className="w-full h-full" />
          </div>
          <p className="font-galmuri text-white text-lg font-bold text-center px-6">
            데이터를 불러오지 못했습니다
          </p>
          <p className="font-galmuri text-white/70 text-sm text-center px-8">
            {error.message}
          </p>
          <button
            onClick={onRetry}
            className="font-galmuri bg-accent text-[#111827] font-bold px-8 py-3 rounded-[--radius-sm] border-2 border-[#111827] shadow-[0_4px_0_0_#111827] active:shadow-[0_1px_0_0_#111827] active:translate-y-[3px] transition-all duration-75 cursor-pointer"
          >
            다시 시도
          </button>
        </>
      ) : (
        <>
          <div className="animate-spin w-24 h-24">
            <PokeBallIcon className="w-full h-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]" />
          </div>
          <p className="font-galmuri text-white text-2xl font-bold tracking-wide drop-shadow-sm">
            Pokemon Minigames
          </p>
          <p className="font-galmuri text-white/70 text-sm">
            포켓몬들을 불러오고 있습니다{dots}
          </p>
        </>
      )}
    </div>
  );
}
