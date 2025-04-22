// src/steps/EquipmentStep.jsx
import React, { useState, useEffect } from 'react';
import equipmentList from '../data/equipment.json';
import StepWrapper from '../components/StepWrapper';

export default function EquipmentStep({ formData = {}, onChange }) {
  // 1) Pull in startingSilver & saved allocations from formData
  const {
    startingSilver = 0,
    equipmentAlloc = {},
  } = formData;

  // 2) Local state mirrors formData, so we can edit before persisting
  const [silver, setSilver] = useState(startingSilver);
  const [quantities, setQuantities] = useState(equipmentAlloc);

  // 3) Sync back to formData whenever silver or quantities change
  useEffect(() => {
    onChange('startingSilver', silver);
  }, [silver]);

  useEffect(() => {
    onChange('equipmentAlloc', quantities);
  }, [quantities]);

  // 4) If user changes startingSilver upstream (e.g. re‑roll in ConceptStep), reset local
  useEffect(() => {
    setSilver(startingSilver);
  }, [startingSilver]);

  // helper to adjust quantity
  const handleQtyChange = (name, val) => {
    let v = parseInt(val, 10);
    if (isNaN(v) || v < 0) v = 0;
    setQuantities(prev => ({ ...prev, [name]: v }));
  };

  // 5) Compute totals
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
            {totalSpent} SP
          </div>
          <div>
            <span className="font-medium">Silver Remaining: </span>
            {moneyLeft} SP
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
