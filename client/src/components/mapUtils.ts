import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import 'leaflet.vectorgrid';
import { LatLng } from '../types';

// Récupère la base d'URL configurée ou choisit l'API bêta selon l'environnement.
const metaEnv = ((import.meta as any)?.env ?? {}) as Record<string, string> & { DEV?: boolean };
export const RNB_API_BASE = metaEnv.VITE_RNB_API ?? (metaEnv.DEV ? '/rnb' : 'https://rnb-api.beta.gouv.fr');

export const DEFAULT_TILE_STYLE: L.PathOptions = {
  fillColor: '#CBD5E1',
  color: '#94A3B8',
  weight: 0.6,
  fillOpacity: 0.18
};

export const SELECTED_TILE_STYLE: L.PathOptions = {
  fillColor: '#EA580C',
  color: '#C2410C',
  weight: 1.6,
  fillOpacity: 0.65
};

export const BASE_TILE_LAYERS = [
  // Fonds cartographiques visibles de base.
  {
    name: 'Plan (IGN)',
    url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    attribution: '© IGN / © OSM contributors',
    maxZoom: 19
  },
  {
    name: 'Plan (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  },
  {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
    maxZoom: 19
  }
];

export const OVERLAY_TILE_LAYERS = [
  // Superpositions optionnelles affichées au-dessus du fond.
  {
    name: 'Cadastre',
    url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    attribution: '© Cadastre / © OSM contributors',
    opacity: 0.55
  },
  {
    name: 'Adresses BAN',
    url: 'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
    attribution: '© BAN · © OSM contributors',
    opacity: 0.55
  }
];

const CLICK_DEBOUNCE_MS = 600;

// Ajuste automatiquement la vue de la carte pour englober les limites fournies.
export function BoundsController({ bounds }: { bounds: LatLng[] }) {
  const map = useMap();

  useEffect(() => {
    if (!bounds.length) {
      return;
    }
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [bounds, map]);

  return null;
}

interface RnbTileLayerProps {
  selectedRnbIds: string[];
  onSelectRnbIdOnMap: (rnbId: string) => void;
}

// Couche vectorielle RNB qui recharge les polygones et gère les clics pour sélectionner des IDs.
export function RnbTileLayer({ selectedRnbIds, onSelectRnbIdOnMap }: RnbTileLayerProps) {
  const map = useMap();
  const vectorLayerRef = useRef<any>(null);
  const previousSelectionRef = useRef<string[]>([]);
  const lastClickRef = useRef<number>(0);

  useEffect(() => {
    const vectorLayer = L.vectorGrid.protobuf(`${RNB_API_BASE}/api/alpha/tiles/shapes/{x}/{y}/{z}.pbf`, {
      vectorTileLayerStyles: {
        default: DEFAULT_TILE_STYLE
      },
      interactive: false,
      getFeatureId: (feature: any) => feature.properties.rnb_id,
      zIndex: 350,
      opacity: 1
    });

    vectorLayerRef.current = vectorLayer;
    vectorLayer.addTo(map);

    const clickHandler = async (event: LeafletMouseEvent) => {
      const now = Date.now();
      if (now - lastClickRef.current < CLICK_DEBOUNCE_MS) {
        return;
      }
      lastClickRef.current = now;

      const { lat, lng } = event.latlng;
      try {
        const res = await fetch(`${RNB_API_BASE}/api/alpha/buildings/closest/?point=${lat},${lng}&radius=5`);
        if (!res.ok) {
          console.warn('Recherche RNB impossible', res.status);
          return;
        }
        const data = await res.json();
        const rnbId = data.results?.[0]?.rnb_id;
        if (rnbId) {
          onSelectRnbIdOnMap(rnbId);
        }
      } catch (error) {
        console.error('Erreur lors de la sélection RNB sur la carte', error);
      }
    };

    map.on('click', clickHandler);

    return () => {
      map.off('click', clickHandler);
      if (vectorLayerRef.current) {
        map.removeLayer(vectorLayerRef.current);
        vectorLayerRef.current = null;
      }
      previousSelectionRef.current = [];
      lastClickRef.current = 0;
    };
  }, [map, onSelectRnbIdOnMap]);

  useEffect(() => {
    const vectorLayer = vectorLayerRef.current;
    if (!vectorLayer) {
      return;
    }

    const previous = previousSelectionRef.current;
    for (const prevId of previous) {
      if (!selectedRnbIds.includes(prevId)) {
        try {
          vectorLayer.resetFeatureStyle(prevId as any);
        } catch (error) {
          console.warn('Impossible de réinitialiser le style du RNB', prevId, error);
        }
      }
    }

    for (const rnbId of selectedRnbIds) {
      try {
        vectorLayer.setFeatureStyle(rnbId as any, SELECTED_TILE_STYLE);
      } catch (error) {
        console.warn('Impossible de styliser le RNB', rnbId, error);
      }
    }

    previousSelectionRef.current = selectedRnbIds;
  }, [selectedRnbIds]);

  return null;
}
