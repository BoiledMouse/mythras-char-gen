import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import StepWrapper from '../components/StepWrapper';

// Import equipment JSON files
import defaultEquip from '../data/equipment.json';
import customEquipA from '../data/customEquipmentA.json';
import customEquipB from '../data/customEquipmentB.json';

// Define equipment options
const equipmentOptions = [
  { label: 'Basic Equipment', value: 'default', data: defaultEquip },
  { label: 'Extended Equipment', value: 'customA', data: customEquipA },
  { label: 'TBC', value: 'customB', data: customEquipB },
];

export default function EquipmentStep({ formData = {}, onChange }) {
  const { character, updateCharacter } = useCharacter();
  const {
    startingSilver = character.startingSilver || 0,
    equipmentAlloc = character.equipmentAlloc || {},
  } = formData;

  // Local state
  const [silver, setSilver] = useState(startingSilver);
  const [quantities, setQuantities] = useState(equipmentAlloc);
  const [selectedListKey, setSelectedListKey] = useState(equipmentOptions[0].value);
  const [equipmentList, setEquipmentList] = useState(equipmentOptions[0].data);

  // Sync selected equipment list data
  useEffect(() => {
    const chosen = equipmentOptions.find(opt => opt.value === selectedListKey);
    if (chosen) {
      setEquipmentList(chosen.data);
      // reset quantities when list changes
      setQuantities({});
      onChange('equipmentAlloc', {});
      updateCharacter({ equipmentAlloc: {} });
    }
  }, [selectedListKey]);

  // Sync silver to formData and context
  useEffect(() => {
    onChange('startingSilver', silver);
    updateCharacter({ startingSilver: silver });
  }, [silver]);

  // Sync quantities to formData and context
  useEffect(() => {
    onChange('equipmentAlloc', quantities);
    updateCharacter({ equipmentAlloc: quantities });
  }, [quantities]);

  // Reset silver if character's startingSilver changes externally
  useEffect(() => {
    setSilver(character.startingSilver || 0);
  }, [character.startingSilver]);

  const handleQtyChange = (name, val) => {
    let v = parseInt(val, 10);
    if (isNaN(v) || v < 0) v = 0;
    setQuantities(prev => ({ ...prev, [name]: v }));
  };

  // Compute totals
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

        {/* Equipment list selector */}
        <div>
          <h3 className="font-semibold mb-2">Select Equipment List</h3>
          <select
            value={selectedListKey}
            onChange={e => setSelectedListKey(e.target.value)}
            className="mt-1 w-48 border-gray-300 rounded"
          >
            {equipmentOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
