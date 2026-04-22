import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { usePokedexStore } from '../store/pokedexStore';
import { FullScreenLoader } from './common/FullScreenLoader';

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

export function AppLayout() {
  const { isDark, toggle } = useThemeStore();
  const isLoading = usePokedexStore((s) => s.isLoading);
  const hasLoaded = usePokedexStore((s) => s.hasLoaded);
  const error     = usePokedexStore((s) => s.error);
  const loadGen1  = usePokedexStore((s) => s.loadGen1);

  useEffect(() => {
    loadGen1();
  }, [loadGen1]);

  if (isLoading || (!hasLoaded && error)) {
    return <FullScreenLoader error={error} onRetry={loadGen1} />;
  }

  return (
    <div className="min-h-screen">
      <header className="bg-brand border-b-4 border-accent">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <PokeBallIcon className="w-8 h-8 hover:[animation:spin_0.6s_ease-in-out]" />
            <span className="font-galmuri text-lg font-bold text-white tracking-wide drop-shadow-sm">
              Pokemon Minigames
            </span>
          </div>
          <button
            onClick={toggle}
            className="px-3 py-1 rounded-[--radius-sm] bg-white/20 text-white text-sm border border-white/30 hover:bg-white/30 transition-colors"
            aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
