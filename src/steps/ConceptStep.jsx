// src/steps/ConceptStep.jsx
import React from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';

export function ConceptStep() {
  const { character, updateCharacter } = useCharacter();
  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium">Character Name</label>
        <input
          type="text"
          value={character.name}
          onChange={e => updateCharacter({ name: e.target.value })}
          className="mt-1 w-full border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block font-medium">Player Name</label>
        <input
          type="text"
          value={character.player}
          onChange={e => updateCharacter({ player: e.target.value })}
          className="mt-1 w-full border-gray-300 rounded"
        />
      </div>
      <div>
        <label className="block font-medium">Culture/Background</label>
        <select
          value={character.culture}
          onChange={e => updateCharacter({ culture: e.target.value })}
          className="mt-1 w-full border-gray-300 rounded"
        >
          <option value="">Select a culture</option>
          {Object.entries(cultures).map(([key, c]) => (
            <option key={key} value={key}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium">Career</label>
        <select
          value={character.career}
          onChange={e => updateCharacter({ career: e.target.value })}
          className="mt-1 w-full border-gray-300 rounded"
        >
          <option value="">Select a career</option>
          {Object.entries(careers).map(([key, c]) => (
            <option key={key} value={key}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
