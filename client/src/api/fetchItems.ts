import { Item, LatLng } from '../types';
import { Buffer } from 'buffer';

type RawItem = {
  Code_bat_ter: number | string;
  Libelle_bat_ter: string;
  Adresse: string;
  Code_Postal: string | number;
  Ville: string;
  Completude: string | number;
  Surface_de_plancher: string | number;
  Usage_detaille_du_bien: string;
  Gestionnaire: string;
  rnb_ids: string;
  contre_proposition_rnb_ids: string;
  coordinates?: [number, number];
  zone?: [number, number][];
  geometry?: string;
};

// Récupère les données brutes depuis l'API interne.
async function fetchRawDataset(): Promise<RawItem[]> {
  const response = await fetch('/api/items');
  if (!response.ok) {
    throw new Error('Impossible de charger les données');
  }

  const dataset = await response.json();
  return dataset as RawItem[];
}

// Parse la chaîne SQL contenant les IDs RNB en tableau.
function parseRnbIds(rnbIdsString: string): string[] {
  try {
    const cleaned = rnbIdsString.replace(/'/g, '"');
    return JSON.parse(cleaned);
  } catch (e) {
    return [];
  }
}

// Conversion simple de tuple [lng, lat] vers le format leaflet [lat, lng].
function toLatLng(tuple?: [number, number]): LatLng {
  if (!tuple) {
    return [0, 0];
  }
  const [lng, lat] = tuple;
  return [Number(lat) || 0, Number(lng) || 0];
}

// Génère un polygone autour de la zone fournie ou crée un carré autour des coordonnées.
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

// Décode un point WKB hexadécimal en coordonnées lat/long.
function parseGeometryPoint(geometry?: string): LatLng {
  if (!geometry) {
    return [0, 0];
  }

  try {
    const buffer = Buffer.from(geometry.replace(/\s+/g, ''), 'hex');
    const byteOrder = buffer.readUInt8(0);
    const littleEndian = byteOrder === 1;
    const readUInt32 = littleEndian ? buffer.readUInt32LE.bind(buffer) : buffer.readUInt32BE.bind(buffer);
    const readDouble = littleEndian ? buffer.readDoubleLE.bind(buffer) : buffer.readDoubleBE.bind(buffer);

    let offset = 1;
    const typeField = readUInt32(offset);
    offset += 4;
    const hasSrid = (typeField & 0x20000000) !== 0;
    if (hasSrid) {
      offset += 4; // skip SRID
    }

    const x = readDouble(offset);
    offset += 8;
    const y = readDouble(offset);

    return [y, x];
  } catch (error) {
    return [0, 0];
  }
}

// Teste si un segment de chaîne est contenu (sans tenir compte de la casse).
function containsSegment(source?: string, segment?: string): boolean {
  if (!source || !segment) {
    return false;
  }
  return source.toLowerCase().includes(segment.toLowerCase());
}

// Transforme un rawItem côté backend en Item consommé par le front.
function transformRawItem(rawItem: RawItem): Item {
  const parsedRnbIds = parseRnbIds(rawItem.rnb_ids);
  const contrePropositionRnbIds = parseRnbIds(rawItem.contre_proposition_rnb_ids);
  const postalCode = rawItem.Code_Postal ? rawItem.Code_Postal.toString().trim() : '';
  const city = rawItem.Ville ? rawItem.Ville.trim() : '';
  const addressSegments = [] as string[];
  if (rawItem.Adresse) {
    const trimmedAddress = rawItem.Adresse.trim();
    if (trimmedAddress.length) {
      addressSegments.push(trimmedAddress);
    }
  }
  if (postalCode && !addressSegments.some(segment => containsSegment(segment, postalCode))) {
    addressSegments.push(postalCode);
  }
  if (city && !addressSegments.some(segment => containsSegment(segment, city))) {
    addressSegments.push(city);
  }
  const address = addressSegments.join(' ');
  const coordinates = toLatLng(rawItem.coordinates);
  const parsedGeometry = parseGeometryPoint(rawItem.geometry);
  const finalCoordinates = coordinates[0] === 0 && coordinates[1] === 0 ? parsedGeometry : coordinates;
  const zone = buildZone(rawItem.zone, finalCoordinates);

  return {
    id: rawItem.Code_bat_ter.toString(),
    name: rawItem.Libelle_bat_ter,
    address,
    score: rawItem.Completude.toString(),
    surface: rawItem.Surface_de_plancher.toString(),
    usage: rawItem.Usage_detaille_du_bien,
    gestionnaire: rawItem.Gestionnaire,
    rnbIds: contrePropositionRnbIds.length > 0 ? contrePropositionRnbIds : parsedRnbIds,
    coordinates: finalCoordinates,
    zone
  };
}

// Point d'entrée utilisé par TanStack Query pour charger tous les items.
export async function fetchItems(): Promise<Item[]> {
  const rawDataset = await fetchRawDataset();
  return rawDataset.map(transformRawItem);
}

