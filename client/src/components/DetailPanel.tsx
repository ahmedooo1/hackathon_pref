import React from 'react';
import { RNBList } from './RNBList';
interface DetailItem {
  id: string;
  name: string;
  address: string;
  score: string;
  surface: string;
  usage: string;
  gestionnaire: string;
}
interface RNBItem {
  id: string;
}
interface DetailPanelProps {
  item: DetailItem;
  rnbItems: RNBItem[];
  onDeleteRNB: (id: string) => void;
  onRefuse: () => void;
  onValidate: () => void;
}
export function DetailPanel({
  item,
  rnbItems,
  onDeleteRNB,
  onRefuse,
  onValidate
}: DetailPanelProps) {
  return <div className="flex-1 flex flex-col bg-gray-50 h-screen">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
          {/* Detail Card */}
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
                <label className="text-sm font-medium text-gray-500">Nom</label>
                <p className="text-base text-gray-900 mt-1">{item.name}</p>
              </div>
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
                    Score
                  </label>
                  <p className="text-base text-gray-900 mt-1">—</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Surface
                  </label>
                  <p className="text-base text-gray-900 mt-1">—</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Usage
                  </label>
                  <p className="text-base text-gray-900 mt-1">—</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Gestionnaire
                  </label>
                  <p className="text-base text-gray-900 mt-1">—</p>
                </div>
              </div>
            </div>
          </div>

          {/* RNB List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Éléments RNB
            </h3>
            <RNBList items={rnbItems} onDelete={onDeleteRNB} />
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Localisation</h3>
              <div className="relative">
                <input type="text" placeholder="Chercher une adresse" className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
            </div>
            <div className="h-64 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p className="text-sm text-gray-500">Carte interactive</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer with Action Buttons */}
      <div className="border-t border-gray-200 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-8 py-4 flex gap-3 justify-end">
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