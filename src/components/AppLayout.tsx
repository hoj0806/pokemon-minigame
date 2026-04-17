import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { usePokedexStore } from '../store/pokedexStore';

export function AppLayout() {
  const { isDark, toggle } = useThemeStore();
  const loadGen1 = usePokedexStore((s) => s.loadGen1);

  useEffect(() => {
    loadGen1();
  }, [loadGen1]);

  return (
    <div className="min-h-screen bg-[--color-surface]">
      <header className="flex items-center justify-between px-6 py-3 border-b border-[--color-border]">
        <span className="font-galmuri text-lg text-[--color-on-surface]">Pokemon Minigames</span>
        <button
          onClick={toggle}
          className="px-3 py-1 rounded-[--radius-sm] bg-[--color-surface-raised] text-[--color-on-surface-muted] text-sm border border-[--color-border] hover:border-[--color-border-strong] transition-colors"
          aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
