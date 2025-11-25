import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RNBList } from './RNBList';
import { Item, LatLng } from '../types';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap, LayersControl, LayerGroup } from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import 'leaflet.vectorgrid';
import { useQueryClient } from '@tanstack/react-query';

interface DetailPanelProps {
  item: Item;
  items: Item[];
  onRefuse: () => void;
  onValidate: () => void;
}

interface EditableItem {
  address: string;
  name: string;
  surface: string;
  usage: string;
  gestionnaire: string;
}

type ToastVariant = 'success' | 'warning' | 'error';

interface ToastMessage {
  message: string;
  variant: ToastVariant;
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

const BASE_TILE_LAYERS = [
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

const OVERLAY_TILE_LAYERS = [
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

export function DetailPanel({
  item,
  items,
  onRefuse,
  onValidate
}: DetailPanelProps) {
  const [rnbIds, setRnbIds] = useState<string[]>(item.rnbIds);
  const [formData, setFormData] = useState<EditableItem>({
    address: item.address ?? '',
    name: item.name,
    surface: item.surface?.toString() ?? '0',
    usage: item.usage ?? '',
    gestionnaire: item.gestionnaire ?? ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimerRef = useRef<number | undefined>(undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    setRnbIds(item.rnbIds);
    setFormData({
      address: item.address ?? '',
      name: item.name,
      surface: item.surface?.toString() ?? '0',
      usage: item.usage ?? '',
      gestionnaire: item.gestionnaire ?? ''
    });
  }, [item]);

  const mapBounds = useMemo<LatLng[]>(() => {
    if (item.zone.length === 0) {
      return [item.coordinates];
    }
    return item.zone;
  }, [item]);

  const onDeleteRNB = (deletedId: string) => {
    setRnbIds(ids => ids.filter(rnbId => rnbId !== deletedId));
  };

  const onSelectRnbIdOnMap = useCallback((rnbId: string) => {
    setRnbIds(ids => ids.includes(rnbId)
      ? ids.filter(existing => existing !== rnbId)
      : [...ids, rnbId]);
  }, []);

  const selectionSummary = `${item.name} · ${item.address}`;

  const handleInputChange = (field: keyof EditableItem) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const resetFormData = () => {
    setFormData({
      address: item.address ?? '',
      name: item.name,
      surface: item.surface?.toString() ?? '0',
      usage: item.usage ?? '',
      gestionnaire: item.gestionnaire ?? ''
    });
  };

  const startEditing = () => setIsEditing(true);
  const cancelEditing = () => {
    resetFormData();
    setIsEditing(false);
  };

  const showToast = (message: string, variant: ToastVariant) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ message, variant });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: formData.address,
          name: formData.name,
          surface: formData.surface,
          usage: formData.usage,
          gestionnaire: formData.gestionnaire
        })
      });

      if (!response.ok) {
        throw new Error('Impossible d\'enregistrer les modifications');
      }

      await response.json();
      showToast('Modifications enregistrées', 'success');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['items'] });
    } catch (error) {
      showToast('Erreur lors de l\'enregistrement', 'error');
      console.error(error);
    }
  };

  const handleValidate = () => {
    showToast('Validation enregistrée', 'success');
    onValidate();
  };

  const handleRefuse = () => {
    showToast('Sélection refusée', 'warning');
    onRefuse();
  };

  return <div className="flex-1 flex flex-col bg-gray-50 h-screen">
      {toast && (
        <div className={`fixed top-6 right-6 rounded-xl px-6 py-3 text-base font-semibold shadow-lg ${toast.variant === 'success' ? 'bg-emerald-500 text-white' : toast.variant === 'warning' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="max-w-5xl mx-auto space-y-6 pb-6">
        

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
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
              <button
                type="button"
                onClick={isEditing ? cancelEditing : startEditing}
                className="self-start px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </button>
            </div>
            {isEditing ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Adresse
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-base text-gray-900 focus:border-blue-500 focus:outline-none"
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    placeholder="Adresse"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nom
                    </label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-base text-gray-900 focus:border-blue-500 focus:outline-none"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      placeholder="Nom du site"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Surface
                    </label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-base text-gray-900 focus:border-blue-500 focus:outline-none"
                      value={formData.surface}
                      onChange={handleInputChange('surface')}
                      placeholder="Surface (m²)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Usage
                    </label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-base text-gray-900 focus:border-blue-500 focus:outline-none"
                      value={formData.usage}
                      onChange={handleInputChange('usage')}
                      placeholder="Usage"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Gestionnaire
                    </label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-base text-gray-900 focus:border-blue-500 focus:outline-none"
                      value={formData.gestionnaire}
                      onChange={handleInputChange('gestionnaire')}
                      placeholder="Gestionnaire"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Adresse</p>
                  <p className="text-base text-gray-900 mt-1">{item.address || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nom</p>
                    <p className="text-base text-gray-900 mt-1">{item.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Surface</p>
                    <p className="text-base text-gray-900 mt-1">{item.surface}m²</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Usage</p>
                    <p className="text-base text-gray-900 mt-1">{item.usage}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gestionnaire</p>
                    <p className="text-base text-gray-900 mt-1">{item.gestionnaire}</p>
                  </div>
                </div>
              </div>
            )}
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
                    <LayersControl position="topright">
                      {BASE_TILE_LAYERS.map(base => (
                        <LayersControl.BaseLayer
                          key={base.name}
                          checked={base.name === 'Plan (IGN)'}
                          name={base.name}
                        >
                          <TileLayer
                            url={base.url}
                            attribution={base.attribution}
                            maxZoom={base.maxZoom}
                          />
                        </LayersControl.BaseLayer>
                      ))}

                      <LayersControl.Overlay name="Bâtiments RNB · Points" checked>
                        <LayerGroup>
                          {items.map(mapItem => {
                            const highlight = mapItem.id === item.id;
                            return (
                              <CircleMarker
                                key={`marker-${mapItem.id}`}
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
                        </LayerGroup>
                      </LayersControl.Overlay>

                      <LayersControl.Overlay name="Bâtiments RNB · Polygones" checked>
                        <LayerGroup>
                          <RnbTileLayer
                            selectedRnbIds={rnbIds}
                            key={rnbIds.join(',')}
                            onSelectRnbIdOnMap={onSelectRnbIdOnMap}
                          />
                        </LayerGroup>
                      </LayersControl.Overlay>

                      {OVERLAY_TILE_LAYERS.map(overlay => (
                        <LayersControl.Overlay key={overlay.name} name={`Données externes · ${overlay.name}`}>
                          <LayerGroup>
                            <TileLayer
                              url={overlay.url}
                              attribution={overlay.attribution}
                              opacity={overlay.opacity}
                            />
                          </LayerGroup>
                        </LayersControl.Overlay>
                      ))}

                      <LayersControl.Overlay name="Zone sélectionnée">
                        <LayerGroup>
                          {item.zone.length > 0 && (
                            <Polygon
                              positions={item.zone}
                              pathOptions={{
                                color: '#16A34A',
                                fillColor: 'rgba(16, 185, 129, 0.25)',
                                weight: 2
                              }}
                            />
                          )}
                        </LayerGroup>
                      </LayersControl.Overlay>
                    </LayersControl>
                    <BoundsController bounds={mapBounds} />
                  </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white shadow-lg">
        <div className="max-w-5xl mx-auto px-8 py-4 flex gap-3 justify-end">
          <button onClick={handleRefuse} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Refuser
          </button>
          <button onClick={handleValidate} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
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