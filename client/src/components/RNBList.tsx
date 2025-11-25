import React from 'react';

interface RNBListProps {
  items: string[];
  onDelete: (id: string) => void;
}

export function RNBList({
  items,
  onDelete
}: RNBListProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">IDs RNB</h3>
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"
          role="status"
          aria-label={`Nombre d'items: ${items.length}`}
        >
          {items.length}
        </span>
      </div>

      {items.length === 0 && (
        <div className="p-4 text-gray-500">Aucun ID-RNB lié</div>
      )}

      {items.map((id, index) => (
        <div
          key={id}
          className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
            index !== items.length - 1 ? 'border-b border-gray-200' : ''
          }`}
        >
          <span className="font-medium text-gray-900">{id}</span>
          <button
            onClick={() => onDelete(id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Supprimer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}