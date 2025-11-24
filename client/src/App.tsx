import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DetailPanel } from './components/DetailPanel';
const sidebarItems = [{
  id: 'ID-REFX 1',
  name: 'Maison des champs'
}, {
  id: 'ID-REFX 2',
  name: 'Préfecture du Gard'
}];
const detailData = {
  'ID-REFX 1': {
    id: 'ID-REFX 1',
    name: 'Maison des champs',
    address: '168 rue des vignoles',
    score: '',
    surface: '',
    usage: '',
    gestionnaire: ''
  },
  'ID-REFX 2': {
    id: 'ID-REFX 2',
    name: 'Préfecture du Gard',
    address: '',
    score: '',
    surface: '',
    usage: '',
    gestionnaire: ''
  }
};
export function App() {
  const [selectedId, setSelectedId] = useState('ID-REFX 1');
  const [rnbItems, setRnbItems] = useState([{
    id: 'ID-RNB 1'
  }, {
    id: 'ID-RNB 2'
  }]);
  const handleDeleteRNB = (id: string) => {
    setRnbItems(rnbItems.filter(item => item.id !== id));
  };
  const handleAddRNB = () => {
    const newId = `ID-RNB ${rnbItems.length + 1}`;
    setRnbItems([...rnbItems, {
      id: newId
    }]);
  };
  const handleRefuse = () => {
    console.log('Refuser clicked');
  };
  const handleValidate = () => {
    console.log('Valider clicked');
  };
  return <div className="flex h-screen bg-gray-100">
      <Sidebar items={sidebarItems} selectedId={selectedId} onSelect={setSelectedId} />
      <DetailPanel item={detailData[selectedId as keyof typeof detailData]} rnbItems={rnbItems} onDeleteRNB={handleDeleteRNB} onAddRNB={handleAddRNB} onRefuse={handleRefuse} onValidate={handleValidate} />
    </div>;
}