import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
}

function applyDark(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggle: () =>
        set((state) => {
          const next = !state.isDark;
          applyDark(next);
          return { isDark: next };
        }),
    }),
    {
      name: 'pokemon-minigames-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyDark(state.isDark);
      },
    },
  ),
);

// 시스템 테마 변경 감지 (localStorage에 저장된 값이 없을 때만 반영)
const mq = window.matchMedia('(prefers-color-scheme: dark)');
mq.addEventListener('change', (e) => {
  const stored = localStorage.getItem('pokemon-minigames-theme');
  if (!stored) {
    useThemeStore.setState({ isDark: e.matches });
    applyDark(e.matches);
  }
});
