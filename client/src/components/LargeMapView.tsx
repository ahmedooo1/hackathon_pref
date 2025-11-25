import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import { Item, LatLng } from '../types';
import { BASE_TILE_LAYERS, OVERLAY_TILE_LAYERS, BoundsController } from './mapUtils';

// Les props décrivent l'ensemble des sites, le site mis en évidence et l'action à déclencher quand on clique sur un marqueur.
interface LargeMapViewProps {
  items: Item[];
  selectedItemId: string | null;
  onSelect: (item: Item) => void;
}

// Centre par défaut quand aucune zone de site n'est disponible.
const DEFAULT_CENTER: LatLng = [48.8566, 2.3522];

export function LargeMapView({ items, selectedItemId, onSelect }: LargeMapViewProps) {
  // Fusionne toutes les coordonnées de zone (ou les coordonnées uniques) pour ajuster automatiquement la carte à tous les sites.
  const mapBounds = useMemo(() => {
    const points = items.flatMap(item => (item.zone.length > 0 ? item.zone : [item.coordinates]));
    return points;
  }, [items]);

  const hasBounds = mapBounds.length > 0;

  // Définit le centre et le zoom initiaux à partir des limites ou du centre par défaut pour un affichage cohérent.
  const centerPoint = hasBounds ? mapBounds[0] : DEFAULT_CENTER;
  const zoomLevel = hasBounds ? 11 : 6;

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase">Carte des sites</p>
            <h1 className="text-2xl font-bold text-gray-900">Grille nationale · Préfecture</h1>
          </div>
          <p className="text-sm text-gray-500 max-w-xl">
            Cliquez sur une référence dans la liste ou sur un point pour consulter les détails du site.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <MapContainer
          bounds={hasBounds ? mapBounds : undefined}
          boundsOptions={hasBounds ? { padding: [40, 40] } : undefined}
          center={centerPoint}
          zoom={zoomLevel}
          scrollWheelZoom
          className="h-full w-full"
        >
          {/* Utilise les couches de contrôle de mapUtils pour basculer entre les fonds et superpositions. */}
          <LayersControl position="topright">
            {BASE_TILE_LAYERS.map(base => (
              <LayersControl.BaseLayer
                key={base.name}
                name={base.name}
                checked={base.name === 'Plan (IGN)'}
              >
                <TileLayer
                  url={base.url}
                  attribution={base.attribution}
                  maxZoom={base.maxZoom}
                />
              </LayersControl.BaseLayer>
            ))}

            {/* Couche principale des marqueurs RNB avec gestion du clic pour afficher les détails. */}
            <LayersControl.Overlay name="Points RNB" checked>
              <LayerGroup>
                {items.map(mapItem => {
                  const isActive = mapItem.id === selectedItemId;
                  return (
                    <CircleMarker
                      key={`map-${mapItem.id}`}
                      center={mapItem.coordinates}
                      radius={isActive ? 12 : 8}
                      pathOptions={{
                        color: isActive ? '#1D4ED8' : '#7C3AED',
                        fillColor: isActive ? '#1D4ED8' : '#C084FC',
                        fillOpacity: 0.75
                      }}
                      eventHandlers={{
                        click: () => onSelect(mapItem)
                      }}
                    >
                      <Popup>
                        <div className="text-xs">
                          <p className="font-semibold text-sm text-gray-900">{mapItem.name}</p>
                          <p className="text-gray-500">{mapItem.address}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>

            {/* Superpositions externes optionnelles (satellite, relief, etc.). */}
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
          </LayersControl>
          {hasBounds && <BoundsController bounds={mapBounds} />}
        </MapContainer>
      </div>
    </div>
  );
}
