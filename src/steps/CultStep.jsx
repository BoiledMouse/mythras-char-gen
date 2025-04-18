// src/steps/CultStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cults from '../data/cults.json';

export function CultStep() {
  const { character, updateCharacter } = useCharacter();
  const [memberships, setMemberships] = useState(character.cultMemberships);

  useEffect(() => updateCharacter({ cultMemberships: memberships }), [memberships]);

  const toggleCult = cult =>
    setMemberships(prev =>
      prev.includes(cult) ? prev.filter(c => c !== cult) : [...prev, cult]
    );

  return (
    <div>
      <h3 className="font-semibold mb-2">Join Cults & Brotherhoods</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {cults.map(c => (
          <label key={c.name} className="inline-flex items-center">
            <input
              type="checkbox"
              checked={memberships.includes(c.name)}
              onChange={() => toggleCult(c.name)}
              className="mr-2"
            />
            {c.name}
          </label>
        ))}
      </div>
    </div>
  );
}
