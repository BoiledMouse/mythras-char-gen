// src/steps/EquipmentStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import equipmentList from '../data/equipment.json';

export function EquipmentStep() {
  const { character, updateCharacter } = useCharacter();

  // Starting money in silver pieces
  const [startingMoney, setStartingMoney] = useState(character.startingMoney ?? 100);
  // Track quantities by equipment name
  const [quantities, setQuantities] = useState(character.equipmentAlloc || {});

  // Calculate total spent
  const totalSpent = Object.entries(quantities).reduce((sum, [name, qty]) => {
    const item = equipmentList.find(e => e.name === name);
    return sum + (item?.cost || 0) * qty;
  }, 0);
  const moneyLeft = startingMoney - totalSpent;

  // Persist changes to context
  useEffect(() => {
    updateCharacter({ startingMoney, equipmentAlloc: quantities });
  }, [startingMoney, quantities]);

  const handleQtyChange = (name, val) => {
    let v = parseInt(val, 10);
    if (isNaN(v) || v < 0) v = 0;
    setQuantities(prev => ({ ...prev, [name]: v }));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium">Starting Silver Pieces</label>
        <input
          type="number"
          min={0}
          value={startingMoney}
          onChange={e => setStartingMoney(+e.target.value || 0)}
          className="mt-1 w-32 border-gray-300 rounded"
        />
      </div>

      <div>
        <h3 className="font-semibold mb-2">Select Equipment</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 text-left">Item</th>
                <th className="px-2 py-1 text-right">Cost (SP)</th>
                <th className="px-2 py-1 text-center">Quantity</th>
                <th className="px-2 py-1 text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map(item => {
                const qty = quantities[item.name] || 0;
                const lineTotal = (item.cost || 0) * qty;
                return (
                  <tr key={item.name} className="border-b">
                    <td className="px-2 py-1">{item.name}</td>
                    <td className="px-2 py-1 text-right">{item.cost}</td>
                    <td className="px-2 py-1 text-center">
                      <input
                        type="number"
                        min={0}
                        value={qty}
                        onChange={e => handleQtyChange(item.name, e.target.value)}
                        className="w-16 border-gray-300 rounded text-right"
                      />
                    </td>
                    <td className="px-2 py-1 text-right">{lineTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-4 border-t">
        <span className="font-medium">Total Spent: </span>{totalSpent} SP
        <br />
        <span className="font-medium">Silver Remaining: </span>{moneyLeft} SP
      </div>
    </div>
  );
}
