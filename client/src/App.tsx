import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { DetailPanel } from './components/DetailPanel';
import { Item } from './types';
import { fetchItems } from './api/fetchItems';

const HEADER_BRAND = [
  { label: 'République française', caption: 'Préfecture', logo: '/assets/republique-francaise.png' },
  { label: 'Référentiel National des Bâtiments', caption: 'RNB', logo: '/assets/rnb-logo.png' }
];

export function App() {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select first item when data loads
  React.useEffect(() => {
    if (items.length > 0 && !selectedId) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const indexedResponse = useMemo(() => {
    return items.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, Item>);
  }, [items]);

  const selectedItem = selectedId ? indexedResponse[selectedId] : null;
  const onSelect = (item: Item) => {
    setSelectedId(item.id);
  };

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

  if (!selectedItem) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <p className="text-gray-600">Aucun élément sélectionné</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="flex items-center border-b border-gray-200 bg-white px-6 py-5 shadow-sm">
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
      <div className="flex flex-1">
        <Sidebar items={items} selectedItem={selectedItem} onSelect={onSelect} />
        <DetailPanel
          key={selectedId}
          item={selectedItem}
          items={items}
          onRefuse={handleRefuse}
          onValidate={handleValidate}
        />
      </div>
    </div>
  );
}