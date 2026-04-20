export interface MergeChainEntry {
  pokemonId: number;
  radius: number;
}

export const MERGE_CHAIN: MergeChainEntry[] = [
  { pokemonId: 39, radius: 22 },   // 푸린
  { pokemonId: 100, radius: 28 },  // 찌리리공
  { pokemonId: 25, radius: 34 },   // 피카츄
  { pokemonId: 133, radius: 42 },  // 이브이
  { pokemonId: 7, radius: 52 },    // 꼬부기
  { pokemonId: 132, radius: 62 },  // 메타몽
  { pokemonId: 1, radius: 74 },    // 이상해씨
  { pokemonId: 75, radius: 86 },   // 딱구리
  { pokemonId: 31, radius: 98 },   // 니드퀸
  { pokemonId: 131, radius: 118 }, // 라프라스
  { pokemonId: 143, radius: 140 }, // 잠만보
];

export const MAX_CHAIN_INDEX = MERGE_CHAIN.length - 1;

export const DROPPABLE_MAX_INDEX = 4;

export function getChainEntry(index: number): MergeChainEntry | undefined {
  return MERGE_CHAIN[index];
}
