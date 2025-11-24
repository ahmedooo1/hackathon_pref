export type LatLng = [number, number];

export type Item = {
  id: string;
  name: string;
  address: string;
  score: string;
  surface: string;
  usage: string;
  gestionnaire: string;
  rnbIds: string[];
  coordinates: LatLng;
  zone: LatLng[];
}

