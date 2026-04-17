export interface ApiName {
  language: { name: string };
  name: string;
}

export interface ApiPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
  types: Array<{ slot: number; type: { name: string; url: string } }>;
  abilities: Array<{ ability: { name: string; url: string } }>;
}

export interface ApiSpecies {
  names: ApiName[];
  evolution_chain: { url: string };
}

export interface ApiAbility {
  names: ApiName[];
}

export interface ApiChainNode {
  species: { name: string; url: string };
  evolves_to: ApiChainNode[];
}

export interface ApiEvolutionChain {
  chain: ApiChainNode;
}
