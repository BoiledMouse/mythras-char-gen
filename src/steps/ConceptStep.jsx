// src/steps/ConceptStep.jsx
import React from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';

export function ConceptStep() {
  const { character, updateCharacter } = useCharacter();

  // Convert your cultures object → array of { id, name }
  const cultureOptions = Object.entries(cultures).map(
    ([id, def]) => ({ id, name: def.name })
  );

  // Likewise for careers
  const careerOptions = Object.entries(careers).map(
    ([id, def]) => ({ id, name: def.name })
  );

  return (
    <div className="space-y-6">
      {/* Character & Player Name */}
      <div>
        <label className="block mb-1">Character Name</label>
        <input
          type="text"
          value={character.name || ''}
          onChange={e => updateCharacter({ name: e.target.value })}
          className="form-input w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Player Name</label>
        <input
          type="text"
          value={character.player || ''}
          onChange={e => updateCharacter({ player: e.target.value })}
          className="form-input w-full"
        />
      </div>

      {/* Culture Selector */}
      <div>
        <label className="block mb-1">Select a Culture</label>
        <select
          value={character.culture || ''}
          onChange={e => updateCharacter({ culture: e.target.value })}
          className="form-select w-full"
        >
          <option value="">— choose a culture —</option>
          {cultureOptions.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Career Selector */}
      <div>
        <label className="block mb-1">Select a Career</label>
        <select
          value={character.career || ''}
          onChange={e => updateCharacter({ career: e.target.value })}
          className="form-select w-full"
        >
          <option value="">— choose a career —</option>
          {careerOptions.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
