import { create } from 'zustand';
import type { PokemonDex } from '../types/pokemon';
import { fetchGen1Dex } from '../utils/pokeapi';

interface PokedexState {
  data: PokemonDex[];
  isLoading: boolean;
  error: Error | null;
  hasLoaded: boolean;
  loadGen1: () => Promise<void>;
  getById: (id: number) => PokemonDex | undefined;
}

export const usePokedexStore = create<PokedexState>((set, get) => ({
  data: [],
  isLoading: false,
  error: null,
  hasLoaded: false,

  loadGen1: async () => {
    if (get().hasLoaded || get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const data = await fetchGen1Dex();
      set({ data, isLoading: false, hasLoaded: true });
    } catch (e) {
      set({ error: e as Error, isLoading: false });
    }
  },

  getById: (id) => get().data.find((p) => p.id === id),
}));
