import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { DetailPanel } from './components/DetailPanel';
import { Item } from './types';
import { fetchItems } from './api/fetchItems';

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
    <div className="flex h-screen bg-gray-100">
      <Sidebar items={items} selectedItem={selectedItem} onSelect={onSelect} />
      <DetailPanel
        key={selectedId}
        item={selectedItem}
        items={items}
        onRefuse={handleRefuse}
        onValidate={handleValidate}
      />
    </div>
  );
}