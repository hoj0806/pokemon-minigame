export interface PokemonDex {
  id: number;
  koreanName: string;
  imageUrl: string;
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
  evolutionChain: number[];
}
