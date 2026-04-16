import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-6 py-3 border-b border-border">
        <span className="font-galmuri14 text-lg text-primary">Pokemon Minigames</span>
        <button className="font-galmuri11 px-3 py-1 rounded-lg bg-surface-raised text-text-secondary text-sm">
          🌙
        </button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
