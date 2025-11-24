import { Item } from '../types';
import data from '../data.json';

function parseRnbIds(rnbIdsString: string): string[] {
  try {
    const cleaned = rnbIdsString.replace(/'/g, '"');
    return JSON.parse(cleaned);
  } catch (e) {
    return [];
  }
}

function transformRawItem(rawItem: any): Item {
  const parsedRnbIds = parseRnbIds(rawItem.rnb_ids);
  const contrePropositionRnbIds = parseRnbIds(rawItem.contre_proposition_rnb_ids);
  const address = rawItem.Adresse + ' ' + rawItem.Code_Postal + ' ' + rawItem.Ville;
  return {
    id: rawItem.Code_bat_ter.toString(),
    name: rawItem.Libelle_bat_ter,
    address,
    score: rawItem.Completude.toString(),
    surface: rawItem.Surface_de_plancher.toString(),
    usage: rawItem.Usage_detaille_du_bien,
    gestionnaire: rawItem.Gestionnaire,
    rnbIds: contrePropositionRnbIds.length > 0 ? contrePropositionRnbIds : parsedRnbIds
  };
}

export async function fetchItems(): Promise<Item[]> {
  return data.map(transformRawItem) as Item[];
}

