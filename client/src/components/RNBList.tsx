import React from 'react';
import { Trash2Icon, PlusIcon } from 'lucide-react';
interface RNBItem {
  id: string;
}
interface RNBListProps {
  items: RNBItem[];
  onDelete: (id: string) => void;
  onAdd: () => void;
}
export function RNBList({
  items,
  onDelete,
  onAdd
}: RNBListProps) {
  return <div className="space-y-2">
      {items.map(item => <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-gray-300 transition-colors">
          <span className="font-medium text-gray-900">{item.id}</span>
          <button onClick={() => onDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label="Supprimer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>)}

      <button onClick={onAdd} className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 font-medium">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Ajouter un élément
      </button>
    </div>;
}