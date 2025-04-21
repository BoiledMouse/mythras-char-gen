// src/steps/ConceptStep.jsx
import React from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';

export function ConceptStep() {
  const { character, updateCharacter } = useCharacter();

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Character Concept</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Character Name</label>
        <input
          type="text"
          className="w-full bg-white text-gray-900 border border-gray-300 rounded p-2"
          value={character.name || ''}
          onChange={e => updateCharacter({ name: e.target.value })}
          placeholder="Enter character name"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Player Name</label>
        <input
          type="text"
          className="w-full bg-white text-gray-900 border border-gray-300 rounded p-2"
          value={character.playerName || ''}
          onChange={e => updateCharacter({ playerName: e.target.value })}
          placeholder="Enter your name"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Culture/Background</label>
        <select
          className="block w-full bg-white text-gray-900 border border-gray-300 rounded p-2"
          value={character.culture || ''}
          onChange={e => updateCharacter({ culture: e.target.value })}
        >
          <option value="" disabled>Select a culture</option>
          {Object.entries(cultures).map(([key, def]) => (
            <option key={key} value={key}>{def.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Career</label>
        <select
          className="block w-full bg-white text-gray-900 border border-gray-300 rounded p-2"
          value={character.career || ''}
          onChange={e => updateCharacter({ career: e.target.value })}
        >
          <option value="" disabled>Select a career</option>
          {Object.entries(careers).map(([key, def]) => (
            <option key={key} value={key}>{def.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
