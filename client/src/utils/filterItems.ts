import { Item } from '../types';

export type FilterMode = 'all' | 'reference' | 'rnb' | 'address';

export function filterItems(items: Item[], query: string, mode: FilterMode): Item[] {
  // Prépare le terme de recherche et ne filtre que si l'utilisateur a saisi quelque chose.
  const term = query.trim().toLowerCase();
  if (!term) {
    return items;
  }

  return items.filter(item => {
    // Chaque champ pertinent est comparé au terme pour supporter plusieurs modes.
    const idMatches = item.id.toLowerCase().includes(term);
    const nameMatches = item.name.toLowerCase().includes(term);
    const addressMatches = item.address.toLowerCase().includes(term);
    const rnbMatches = item.rnbIds.some(rnb => rnb.toLowerCase().includes(term));

    switch (mode) {
      case 'reference':
        return idMatches;
      case 'rnb':
        return rnbMatches;
      case 'address':
        return addressMatches;
      case 'all':
      default:
        return idMatches || nameMatches || addressMatches || rnbMatches;
    }
  });
}
