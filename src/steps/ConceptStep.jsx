// src/steps/ConceptStep.jsx
import React from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';

export function ConceptStep() {
  const { character, updateCharacter } = useCharacter();

  return (
    <div className="space-y-6">
      {/* Character Name */}
      <div>
        <label htmlFor="characterName" className="block text-lg font-medium text-gray-800">
          Character Name
        </label>
        <input
          id="characterName"
          type="text"
          value={character.name || ''}
          onChange={e => updateCharacter({ name: e.target.value })}
          placeholder="Enter a name"
          className="mt-1 block w-full bg-white text-gray-900 border border-gray-300 rounded shadow-sm focus:ring-gold focus:border-gold"
        />
      </div>

      {/* Player Name */}
      <div>
        <label htmlFor="playerName" className="block text-lg font-medium text-gray-800">
          Player Name
        </label>
        <input
          id="playerName"
          type="text"
          value={character.player || ''}
          onChange={e => updateCharacter({ player: e.target.value })}
          placeholder="Enter your name"
          className="mt-1 block w-full bg-white text-gray-900 border border-gray-300 rounded shadow-sm focus:ring-gold focus:border-gold"
        />
      </div>

      {/* Culture/Background */}
      <div>
        <label htmlFor="culture" className="block text-lg font-medium text-gray-800">
          Select Culture/Background
        </label>
        <select
          id="culture"
          value={character.culture || ''}
          onChange={e => updateCharacter({ culture: e.target.value })}
          className="mt-1 block w-full bg-white text-gray-900 border border-gray-300 rounded shadow-sm focus:ring-gold focus:border-gold"
        >
          <option value="" disabled>
            — Select a culture —
          </option>
          {Object.entries(cultures).map(([key, def]) => (
            <option key={key} value={key}>
              {def.name || key}
            </option>
          ))}
        </select>
      </div>

      {/* Career */}
      <div>
        <label htmlFor="career" className="block text-lg font-medium text-gray-800">
          Select Career
        </label>
        <select
          id="career"
          value={character.career || ''}
          onChange={e => updateCharacter({ career: e.target.value })}
          className="mt-1 block w-full bg-white text-gray-900 border border-gray-300 rounded shadow-sm focus:ring-gold focus:border-gold"
        >
          <option value="" disabled>
            — Select a career —
          </option>
          {Object.entries(careers).map(([key, def]) => (
            <option key={key} value={key}>
              {def.name || key}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
