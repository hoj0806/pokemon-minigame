import { describe, expect, it, expectTypeOf } from 'vitest';
import { fetchPokemonDex } from './pokeapi';
import type { PokemonDex } from '../types/pokemon';

const TIMEOUT = 20_000;

describe('fetchPokemonDex', () => {
  it('반환 타입 시그니처가 PokemonDex 와 일치한다', () => {
    expectTypeOf(fetchPokemonDex).returns.resolves.toEqualTypeOf<PokemonDex>();
  });

  it(
    '피카츄(25) 런타임 데이터가 PokemonDex 스키마를 만족한다',
    async () => {
      const data = await fetchPokemonDex(25);

      expect(Object.keys(data).sort()).toEqual([
        'abilities',
        'evolutionChain',
        'height',
        'id',
        'imageUrl',
        'koreanName',
        'types',
        'weight',
      ]);

      expect(typeof data.id).toBe('number');
      expect(typeof data.koreanName).toBe('string');
      expect(typeof data.imageUrl).toBe('string');
      expect(typeof data.height).toBe('number');
      expect(typeof data.weight).toBe('number');

      expect(Array.isArray(data.types)).toBe(true);
      data.types.forEach((t) => expect(typeof t).toBe('string'));

      expect(Array.isArray(data.abilities)).toBe(true);
      data.abilities.forEach((a) => expect(typeof a).toBe('string'));

      expect(Array.isArray(data.evolutionChain)).toBe(true);
      data.evolutionChain.forEach((id) => expect(typeof id).toBe('number'));

      expect(data.id).toBe(25);
      expect(data.koreanName).toBe('피카츄');
      expect(data.types).toEqual(['전기']);
      expect(data.imageUrl).toMatch(/^https?:\/\//);
    },
    TIMEOUT,
  );

  it(
    '이상해씨(1) 듀얼 타입이 한글 배열로 반환된다',
    async () => {
      const data = await fetchPokemonDex(1);
      expect(data.types).toEqual(['풀', '독']);
      expect(data.abilities).toContain('심록');
      expect(data.evolutionChain).toEqual([1, 2, 3]);
    },
    TIMEOUT,
  );
});
