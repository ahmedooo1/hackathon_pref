import React from 'react';
import { SearchIcon } from 'lucide-react';
interface SidebarItem {
  id: string;
  name: string;
}
interface SidebarProps {
  items: SidebarItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}
export function Sidebar({
  items,
  selectedId,
  onSelect
}: SidebarProps) {
  return <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.map(item => <button key={item.id} onClick={() => onSelect(item.id)} className={`w-full text-left p-4 border-b border-gray-100 transition-all ${selectedId === item.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}`}>
            <div className={`font-semibold text-sm mb-1 ${selectedId === item.id ? 'text-blue-700' : 'text-gray-900'}`}>
              {item.id}
            </div>
            <div className="text-sm text-gray-600">{item.name}</div>
          </button>)}
      </div>
    </div>;
}