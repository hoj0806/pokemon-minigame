export interface MergeChainEntry {
  pokemonId: number;
  radius: number;
}

export const MERGE_CHAIN: MergeChainEntry[] = [
  { pokemonId: 39, radius: 22 },   // 푸린
  { pokemonId: 109, radius: 28 },  // 가스
  { pokemonId: 25, radius: 34 },   // 피카츄
  { pokemonId: 133, radius: 42 },  // 이브이
  { pokemonId: 7, radius: 52 },    // 꼬부기
  { pokemonId: 110, radius: 62 },  // 또도가스
  { pokemonId: 1, radius: 74 },    // 이상해씨
  { pokemonId: 26, radius: 86 },   // 라이츄
  { pokemonId: 115, radius: 98 },  // 캥카
  { pokemonId: 131, radius: 118 }, // 라프라스
  { pokemonId: 143, radius: 140 }, // 잠만보
];

export const MAX_CHAIN_INDEX = MERGE_CHAIN.length - 1;

export const DROPPABLE_MAX_INDEX = 4;

export function getChainEntry(index: number): MergeChainEntry | undefined {
  return MERGE_CHAIN[index];
}
