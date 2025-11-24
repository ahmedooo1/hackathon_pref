import { Item, LatLng } from '../types';
import data from '../data.json';
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

function transformRawItem(rawItem: RawItem): Item {
  const parsedRnbIds = parseRnbIds(rawItem.rnb_ids);
  const contrePropositionRnbIds = parseRnbIds(rawItem.contre_proposition_rnb_ids);
  const postalCode = rawItem.Code_Postal ? rawItem.Code_Postal.toString() : '';
  const addressParts = [rawItem.Adresse, postalCode, rawItem.Ville].filter(Boolean);
  const address = addressParts.join(' ');
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

export async function fetchItems(): Promise<Item[]> {
  return rawDataset.map(transformRawItem);
}

