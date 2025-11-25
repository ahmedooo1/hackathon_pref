import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { DetailPanel } from './components/DetailPanel';
import { LargeMapView } from './components/LargeMapView';
import { Item } from './types';
import { fetchItems } from './api/fetchItems';

// Constantes statiques affichant les logos institutionnels dans l'entête.
const HEADER_BRAND = [
  { label: 'République française', caption: 'Préfecture', logo: '/assets/republique-francaise.png' },
  { label: 'Référentiel National des Bâtiments', caption: 'RNB', logo: '/assets/rnb-logo.png' }
];

export function App() {
  // Chargement des items via TanStack Query.
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems
  });

  // États locaux pour la sélection et le mode d'affichage.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'detail'>('map');

  // Auto-select first item when data loads
  // Sélectionne automatiquement le premier item disponible au chargement initial.
  React.useEffect(() => {
    if (items.length > 0 && !selectedId) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  // Créé une table de hachage pour accéder rapidement aux items par ID.
  const indexedResponse = useMemo(() => {
    return items.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, Item>);
  }, [items]);

  const selectedItem = selectedId ? indexedResponse[selectedId] : null;
  // Met à jour l'item sélectionné et affiche le panneau détail.
  const handleSelect = (item: Item) => {
    setSelectedId(item.id);
    setViewMode('detail');
  };

  // Placeholders pour les actions de refus/validation (à remplacer par appels API ultérieurs).
  const handleRefuse = () => {
    console.log('Refuser clicked');
  };

  const handleValidate = () => {
    console.log('Valider clicked');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center text-red-600">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold">Erreur de chargement</p>
          <p className="text-sm text-gray-600 mt-2">{error instanceof Error ? error.message : 'Une erreur est survenue'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="flex items-center border-b border-gray-200 bg-white px-6 py-5 shadow-sm font-bold">
        <div className="flex items-center gap-10">
          {HEADER_BRAND.map(brand => (
            <div key={brand.label} className="flex items-center gap-4">
              <img src={brand.logo} alt={brand.label} className="h-24 w-auto" />
              <div>
                <p className="text-sm font-semibold text-gray-700">{brand.label}</p>
                <p className="text-xs uppercase tracking-widest text-gray-500">{brand.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          items={items}
          activeItemId={viewMode === 'detail' ? (selectedItem?.id ?? null) : null}
          onSelect={handleSelect}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'detail' && selectedItem ? (
            <DetailPanel
              key={selectedId}
              item={selectedItem}
              items={items}
              onRefuse={handleRefuse}
              onValidate={handleValidate}
              onBackToMap={() => setViewMode('map')}
            />
          ) : (
            <LargeMapView
              items={items}
              selectedItemId={selectedItem?.id ?? null}
              onSelect={handleSelect}
            />
          )}
        </main>
      </div>
    </div>
  );
}