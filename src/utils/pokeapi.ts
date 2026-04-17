import { TYPE_KO } from './pokemonLocale';
import type { PokemonDex } from '../types/pokemon';
import type {
  ApiAbility,
  ApiChainNode,
  ApiEvolutionChain,
  ApiPokemon,
  ApiSpecies,
} from '../types/pokeapi';

const BASE = 'https://pokeapi.co/api/v2';
const GEN1_IDS = Array.from({ length: 151 }, (_, i) => i + 1);

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return res.json() as Promise<T>;
}

export async function fetchPokemonDex(id: number): Promise<PokemonDex> {
  const [pokemon, species] = await Promise.all([
    getJson<ApiPokemon>(`${BASE}/pokemon/${id}`),
    getJson<ApiSpecies>(`${BASE}/pokemon-species/${id}`),
  ]);

  const abilities = await Promise.all(
    pokemon.abilities.map(async (a) => {
      const data = await getJson<ApiAbility>(a.ability.url);
      return data.names.find((n) => n.language.name === 'ko')?.name ?? a.ability.name;
    }),
  );

  const chainData = await getJson<ApiEvolutionChain>(species.evolution_chain.url);
  const evolutionChain = flattenChain(chainData.chain);

  return {
    id: pokemon.id,
    koreanName: species.names.find((n) => n.language.name === 'ko')?.name ?? pokemon.name,
    imageUrl:
      pokemon.sprites.other?.['official-artwork']?.front_default ??
      pokemon.sprites.front_default ??
      '',
    types: pokemon.types.map((t) => TYPE_KO[t.type.name] ?? t.type.name),
    height: pokemon.height / 10,
    weight: pokemon.weight / 10,
    abilities,
    evolutionChain,
  };
}

export async function fetchGen1Dex(): Promise<PokemonDex[]> {
  return Promise.all(GEN1_IDS.map((id) => fetchPokemonDex(id)));
}

function flattenChain(chain: ApiChainNode): number[] {
  const ids: number[] = [];
  let node: ApiChainNode | undefined = chain;
  while (node) {
    const match = node.species.url.match(/\/(\d+)\/$/);
    const id = match ? Number(match[1]) : NaN;
    if (id) ids.push(id);
    node = node.evolves_to[0];
  }
  return ids;
}
