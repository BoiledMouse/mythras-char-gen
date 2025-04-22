// src/steps/EquipmentStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import equipmentList from '../data/equipment.json';
import StepWrapper from '../components/StepWrapper';

export default function EquipmentStep() {
  const { character, updateCharacter } = useCharacter();

  // 1) get the starting silver (set in ConceptStep)
  const startingSilverFromContext = character.startingSilver ?? 0;

  // 2) local state for silver & quantities
  const [silver, setSilver] = useState(startingSilverFromContext);
  const [quantities, setQuantities] = useState(
    character.equipmentAlloc || {}
  );

  // 3) if startingSilver changes (you re‑rolled), reset local silver
  useEffect(() => {
    setSilver(character.startingSilver ?? 0);
  }, [character.startingSilver]);

  // 4) persist both silver & quantities back into context
  useEffect(() => {
    updateCharacter({
      startingSilver: silver,
      equipmentAlloc: quantities,
    });
  }, [silver, quantities]);

  // helper to change item qty
  const handleQtyChange = (name, val) => {
    let v = parseInt(val, 10);
    if (isNaN(v) || v < 0) v = 0;
    setQuantities(prev => ({ ...prev, [name]: v }));
  };

  // compute totals
  const totalSpent = Object.entries(quantities).reduce(
    (sum, [name, qty]) => {
      const item = equipmentList.find(e => e.name === name);
      return sum + (item?.cost || 0) * qty;
    },
    0
  );
  const moneyLeft = silver - totalSpent;

  return (
    <StepWrapper title="Equipment">
      <div className="space-y-6">
        {/* Starting silver */}
        <div>
          <label className="block font-medium">Starting Silver Pieces</label>
          <input
            type="number"
            min={0}
            value={silver}
            onChange={e => setSilver(+e.target.value || 0)}
            className="mt-1 w-32 border-gray-300 rounded"
          />
        </div>

        {/* Equipment purchase table */}
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
                          onChange={e =>
                            handleQtyChange(item.name, e.target.value)
                          }
                          className="w-16 border-gray-300 rounded text-right"
                        />
                      </td>
                      <td className="px-2 py-1 text-right">
                        {lineTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t">
          <div>
            <span className="font-medium">Total Spent: </span>
            {totalSpent} SP
          </div>
          <div>
            <span className="font-medium">Silver Remaining: </span>
            {moneyLeft} SP
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
