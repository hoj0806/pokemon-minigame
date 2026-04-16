import Pokedex, { type PokeAPI } from 'pokedex-promise-v2';
import { TYPE_KO } from './pokemonLocale';
import type { PokemonDex } from '../types/pokemon';

export const P = new Pokedex();

const GEN1_IDS = Array.from({ length: 151 }, (_, i) => i + 1);

export async function fetchPokemonDex(id: number): Promise<PokemonDex> {
  const [pokemon, species] = await Promise.all([
    P.getPokemonByName(id),
    P.getPokemonSpeciesByName(id),
  ]);

  const abilities = await Promise.all(
    pokemon.abilities.map(async (a) => {
      const data = await P.getAbilityByName(a.ability.name);
      return data.names.find((n) => n.language.name === 'ko')?.name ?? a.ability.name;
    }),
  );

  const chainData = await P.getResource(species.evolution_chain.url) as { chain: PokeAPI.Chain };
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

function flattenChain(chain: PokeAPI.Chain): number[] {
  const ids: number[] = [];
  let node: PokeAPI.Chain | undefined = chain;
  while (node) {
    const id = Number(node.species.url.match(/\/(\d+)\/$/)?.[1]);
    if (id) ids.push(id);
    node = node.evolves_to[0];
  }
  return ids;
}
