import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RNBList } from './RNBList';
import { Item, LatLng } from '../types';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap } from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import 'leaflet.vectorgrid';

interface DetailPanelProps {
  item: Item;
  items: Item[];
  onRefuse: () => void;
  onValidate: () => void;
}

const metaEnv = ((import.meta as any)?.env ?? {}) as Record<string, string> & { DEV?: boolean };
const RNB_API_BASE = metaEnv.VITE_RNB_API ?? (metaEnv.DEV ? '/rnb' : 'https://rnb-api.beta.gouv.fr');

const DEFAULT_TILE_STYLE: L.PathOptions = {
  fillColor: '#CBD5E1',
  color: '#94A3B8',
  weight: 0.6,
  fillOpacity: 0.18
};

const SELECTED_TILE_STYLE: L.PathOptions = {
  fillColor: '#EA580C',
  color: '#C2410C',
  weight: 1.6,
  fillOpacity: 0.65
};

const CLICK_DEBOUNCE_MS = 600;

export function DetailPanel({
  item,
  items,
  onRefuse,
  onValidate
}: DetailPanelProps) {
  const [rnbIds, setRnbIds] = useState<string[]>(item.rnbIds);
  const [zoneActive, setZoneActive] = useState(false);
  const polygonRef = useRef<L.Polygon | null>(null);

  useEffect(() => {
    setRnbIds(item.rnbIds);
    setZoneActive(false);
  }, [item]);

  const mapBounds = useMemo<LatLng[]>(() => {
    if (item.zone.length === 0) {
      return [item.coordinates];
    }
    return item.zone;
  }, [item]);

  const polygonOptions = useMemo(() => ({
    color: zoneActive ? '#C2410C' : '#94A3B8',
    fillColor: zoneActive ? 'rgba(234,88,12,0.45)' : '#94A3B8',
    fillOpacity: zoneActive ? 0.45 : 0,
    weight: 2.5,
    dashArray: zoneActive ? undefined : '6,6'
  }), [zoneActive]);

  const ensureStrokeOnlyInteraction = () => {
    const polygon = polygonRef.current;
    if (!polygon) return;
    const path = (polygon as any).getElement?.() as SVGPathElement | undefined;
    if (path) {
      path.setAttribute('pointer-events', 'stroke');
    }
  };

  useEffect(() => {
    ensureStrokeOnlyInteraction();
  }, [item.zone]);

  const toggleZoneColor = () => setZoneActive(prev => !prev);

  const onDeleteRNB = (deletedId: string) => {
    setRnbIds(ids => ids.filter(rnbId => rnbId !== deletedId));
  };

  const onSelectRnbIdOnMap = useCallback((rnbId: string) => {
    setRnbIds(ids => ids.includes(rnbId)
      ? ids.filter(existing => existing !== rnbId)
      : [...ids, rnbId]);
  }, []);

  const selectionSummary = `${item.name} · ${item.address}`;

  return <div className="flex-1 flex flex-col bg-gray-50 h-screen">
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="max-w-5xl mx-auto space-y-6 pb-6">
        

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{item.id}</h2>
                <p className="text-sm text-gray-500">Référence</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Adresse
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {item.address || '—'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nom
                  </label>
                  <p className="text-base text-gray-900 mt-1">{item.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Surface
                  </label>
                  <p className="text-base text-gray-900 mt-1">{item.surface}m²</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Usage
                  </label>
                  <p className="text-base text-gray-900 mt-1">{item.usage}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Gestionnaire
                  </label>
                  <p className="text-base text-gray-900 mt-1">{item.gestionnaire}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Éléments RNB
            </h3>
            <RNBList items={rnbIds} onDelete={onDeleteRNB} />
          </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase">
                  Carte des sites
                </p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectionSummary}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Cliquez sur la zone colorée pour modifier la mise en avant.
                </p>
              </div>
              <span className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1">
                {items.length} points actifs
              </span>
            </div>

            <div className="relative bg-slate-100 h-96">
              <div className="absolute top-4 left-4 bg-white/80 px-3 py-1 rounded-full text-xs text-gray-600 shadow">
                Zone cliquable
              </div>
              <div className="absolute inset-0">
                <MapContainer
                  bounds={mapBounds}
                  boundsOptions={{ padding: [40, 40] }}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RnbTileLayer selectedRnbIds={rnbIds} key={rnbIds.join(',')} onSelectRnbIdOnMap={onSelectRnbIdOnMap} />
                  <BoundsController bounds={mapBounds} />
           
                  {items.map(mapItem => {
                    const highlight = mapItem.id === item.id;
                    return (
                      <CircleMarker
                        key={mapItem.id}
                        center={mapItem.coordinates}
                        radius={highlight ? 10 : 6}
                        pathOptions={{
                          color: highlight ? '#1D4ED8' : '#7C3AED',
                          fillColor: highlight ? '#1D4ED8' : '#A855F7',
                          fillOpacity: 0.7
                        }}
                      >
                        <Popup>
                          <div className="text-xs">
                            <p className="font-semibold">{mapItem.name}</p>
                            <p className="text-gray-500">{mapItem.address}</p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white shadow-lg">
        <div className="max-w-5xl mx-auto px-8 py-4 flex gap-3 justify-end">
          <button onClick={onRefuse} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Refuser
          </button>
          <button onClick={onValidate} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" />
            </svg>
            Valider
          </button>
        </div>
      </div>
    </div>;
}

function BoundsController({ bounds }: { bounds: LatLng[] }) {
  const map = useMap();

  useEffect(() => {
    if (!bounds.length) {
      return;
    }
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [bounds, map]);

  return null;
}

function RnbTileLayer({ selectedRnbIds, onSelectRnbIdOnMap }: { selectedRnbIds: string[], onSelectRnbIdOnMap: (rnbId: string) => void }) {
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