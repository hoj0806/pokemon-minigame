const KEY = 'pokedex:bookmarks';

export function getBookmarks(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as number[];
  } catch {
    return [];
  }
}

export function toggleBookmark(id: number): number[] {
  const current = getBookmarks();
  const next = current.includes(id)
    ? current.filter((b) => b !== id)
    : [...current, id];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
