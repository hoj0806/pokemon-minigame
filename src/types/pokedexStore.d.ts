import type { PokemonDex } from './pokemon';

export interface PokedexState {
  data: PokemonDex[];
  isLoading: boolean;
  error: Error | null;
  hasLoaded: boolean;
  loadGen1: () => Promise<void>;
  getById: (id: number) => PokemonDex | undefined;
}
