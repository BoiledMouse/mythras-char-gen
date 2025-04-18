// src/steps/EquipmentStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';

export function EquipmentStep() {
  const { character, updateCharacter } = useCharacter();
  const [equipment, setEquipment] = useState(character.equipment);

  useEffect(() => updateCharacter({ equipment }), [equipment]);

  const addItem = () =>
    setEquipment(prev => [...prev, { name: '', qty: 1, notes: '' }]);
  const updateItem = (idx, key, value) =>
    setEquipment(prev => prev.map((it, i) => i === idx ? { ...it, [key]: value } : it));
  const removeItem = idx =>
    setEquipment(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <button onClick={addItem} className="px-3 py-1 bg-blue-600 text-white rounded">
        Add Item
      </button>
      {equipment.map((it, idx) => (
        <div key={idx} className="flex space-x-2 items-center">
          <input
            type="text"
            placeholder="Item Name"
            value={it.name}
            onChange={e => updateItem(idx, 'name', e.target.value)}
            className="border-gray-300 rounded flex-1"
          />
          <input
            type="number"
            min={1}
            value={it.qty}
            onChange={e => updateItem(idx, 'qty', +e.target.value || 1)}
            className="w-16 border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Notes"
            value={it.notes}
            onChange={e => updateItem(idx, 'notes', e.target.value)}
            className="border-gray-300 rounded flex-1"
          />
          <button onClick={() => removeItem(idx)} className="px-2 py-1 bg-red-600 text-white rounded">X</button>
        </div>
      ))}
    </div>
  );
}
