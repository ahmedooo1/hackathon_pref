import { Item, LatLng } from '../types';
import data from '../data.json';

type RawItem = {
  Code_bat_ter: number | string;
  Libelle_bat_ter: string;
  Adresse: string;
  Code_Postal: string;
  Ville: string;
  Completude: string | number;
  Surface_de_plancher: string | number;
  Usage_detaille_du_bien: string;
  Gestionnaire: string;
  rnb_ids: string;
  contre_proposition_rnb_ids: string;
  coordinates?: [number, number];
  zone?: [number, number][];
};

const rawDataset = data as RawItem[];

function parseRnbIds(rnbIdsString: string): string[] {
  try {
    const cleaned = rnbIdsString.replace(/'/g, '"');
    return JSON.parse(cleaned);
  } catch (e) {
    return [];
  }
}

function toLatLng(tuple?: [number, number]): LatLng {
  if (!tuple) {
    return [0, 0];
  }
  const [lng, lat] = tuple;
  return [Number(lat) || 0, Number(lng) || 0];
}

function buildZone(rawZone: RawItem['zone'], fallback: LatLng): LatLng[] {
  if (Array.isArray(rawZone) && rawZone.length > 0) {
    return rawZone.map(point => toLatLng(point));
  }

  const offset = 0.00035;
  const [lat, lng] = fallback;
  return [
    [lat - offset, lng - offset],
    [lat - offset, lng + offset],
    [lat + offset, lng + offset],
    [lat + offset, lng - offset],
    [lat - offset, lng - offset]
  ];
}

function transformRawItem(rawItem: RawItem): Item {
  const parsedRnbIds = parseRnbIds(rawItem.rnb_ids);
  const contrePropositionRnbIds = parseRnbIds(rawItem.contre_proposition_rnb_ids);
  const address = rawItem.Adresse + ' ' + rawItem.Code_Postal + ' ' + rawItem.Ville;
  const coordinates = toLatLng(rawItem.coordinates);
  const zone = buildZone(rawItem.zone, coordinates);

  return {
    id: rawItem.Code_bat_ter.toString(),
    name: rawItem.Libelle_bat_ter,
    address,
    score: rawItem.Completude.toString(),
    surface: rawItem.Surface_de_plancher.toString(),
    usage: rawItem.Usage_detaille_du_bien,
    gestionnaire: rawItem.Gestionnaire,
    rnbIds: contrePropositionRnbIds.length > 0 ? contrePropositionRnbIds : parsedRnbIds,
    coordinates,
    zone
  };
}

export async function fetchItems(): Promise<Item[]> {
  return rawDataset.map(transformRawItem);
}

