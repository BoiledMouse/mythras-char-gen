// src/steps/MagicStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import magicData from '../data/magic.json';

export function MagicStep() {
  const { character, updateCharacter } = useCharacter();
  const [selected, setSelected] = useState(character.magicAbilities);
  const [maxMP, setMaxMP] = useState(character.maxMagicPoints);

  useEffect(() => updateCharacter({ magicAbilities: selected, maxMagicPoints: maxMP }), [selected, maxMP]);

  const toggleAbility = ability =>
    setSelected(prev =>
      prev.includes(ability) ? prev.filter(a => a !== ability) : [...prev, ability]
    );

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium">Max Magic Points</label>
        <input
          type="number"
          value={maxMP}
          onChange={e => setMaxMP(+e.target.value || 0)}
          className="mt-1 w-24 border-gray-300 rounded"
        />
      </div>
      <div>
        <h3 className="font-semibold">Select Abilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {magicData.map(m => (
            <label key={m.name} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selected.includes(m.name)}
                onChange={() => toggleAbility(m.name)}
                className="mr-2"
              />
              {m.name}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
