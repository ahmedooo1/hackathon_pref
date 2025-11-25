import React, { useMemo, useState } from 'react';
import { Item } from '../types';

interface SidebarProps {
  items: Item[];
  selectedItem: Item;
  onSelect: (item: Item) => void;
}

export function Sidebar({
  items,
  selectedItem,
  onSelect
}: SidebarProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'reference' | 'rnb' | 'address'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return items;
    return items.filter(item => {
      const idStr = String(item.id).toLowerCase();
      const nameStr = item.name ? String(item.name).toLowerCase() : '';
      const addrStr = item.address ? String(item.address).toLowerCase() : '';
      const rnbMatch = Array.isArray(item.rnbIds) && item.rnbIds.some(r => String(r).toLowerCase().includes(q));

      if (filter === 'reference') {
        return idStr.includes(q) || nameStr.includes(q);
      }
      if (filter === 'rnb') {
        return rnbMatch;
      }
      if (filter === 'address') {
        return addrStr.includes(q);
      }
      // default: all (reference, rnb, address)
      return idStr.includes(q) || nameStr.includes(q) || addrStr.includes(q) || rnbMatch;
    });
  }, [items, query, filter]);

  const placeholder =
    filter === 'all'
      ? 'Rechercher'
      : filter === 'reference'
      ? 'Rechercher par référence...'
      : filter === 'rnb'
      ? 'Rechercher par RNB...'
      : 'Rechercher par adresse...';

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <div className="relative" onMouseEnter={() => setShowFilters(true)} onMouseLeave={() => setShowFilters(false)}>
              <button
                type="button"
                onClick={() => setShowFilters(s => !s)}
                className="relative w-8 h-8 flex items-center justify-center text-gray-400 rounded hover:bg-gray-100"
                aria-haspopup="true"
                aria-expanded={showFilters}
                aria-label="Choisir le filtre de recherche"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                {/* small blue downward triangle placed inside the magnifier (bottom-right). pointer-events-none so it doesn't block clicks */}
                <span className="absolute right-0 bottom-1 pointer-events-none w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-blue-500" aria-hidden="true" />
              </button>

              {showFilters && (
                <div className="absolute left-0 top-full mt-0 w-44 bg-white border border-gray-200 rounded-md shadow-md z-50">
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => { setFilter('all'); setShowFilters(false); }}>
                    Tous
                  </button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => { setFilter('reference'); setShowFilters(false); }}>
                    Référence
                  </button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => { setFilter('rnb'); setShowFilters(false); }}>
                    RNB
                  </button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => { setFilter('address'); setShowFilters(false); }}>
                    Adresse
                  </button>
                </div>
              )}
            </div>
          </div>

          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-16 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Recherche par RNB ou référence"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`w-full text-left p-4 border-b border-gray-100 transition-all ${
              selectedItem.id === item.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
            }`}
          >
            <div className={`font-semibold text-sm mb-1 ${selectedItem.id === item.id ? 'text-blue-700' : 'text-gray-900'}`}>
              {item.id}
            </div>
            <div className="text-sm text-gray-600">{item.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}