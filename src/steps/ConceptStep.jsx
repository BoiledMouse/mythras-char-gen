// src/steps/ConceptStep.jsx
import React, { useState } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';

export function ConceptStep() {
  const { character, updateCharacter } = useCharacter();
  const [localAge, setLocalAge] = useState(character.age || '');
  const cultureDef = cultures[character.culture] || {};

  // Rolls 1–100 and picks socialClass from the culture’s table
  const rollSocialClass = () => {
    const roll = Math.floor(Math.random() * 100) + 1;
    const sc =
      cultureDef.socialClasses?.find(({ min, max }) => roll >= min && roll <= max)
        ?.label || 'Unknown';
    updateCharacter({ socialClass: sc });
  };

  // Rolls 4d6 then multiplies by the culture’s money modifier (e.g. x75 for Civilised)
  const rollStartingMoney = () => {
    const dice = cultureDef.startingMoneyDice || 4;
    const modifier = cultureDef.startingMoneyMultiplier || 1;
    let sum = 0;
    for (let i = 0; i < dice; i++) {
      sum += Math.floor(Math.random() * 6) + 1;
    }
    const sp = Math.round(sum * modifier);
    updateCharacter({ startingMoney: sp });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Character Name */}
      <div className="col-span-full">
        <label className="block font-medium">Character Name</label>
        <input
          type="text"
          value={character.name || ''}
          onChange={e => updateCharacter({ name: e.target.value })}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
        />
      </div>

      {/* Player Name */}
      <div className="col-span-full">
        <label className="block font-medium">Player Name</label>
        <input
          type="text"
          value={character.playerName || ''}
          onChange={e => updateCharacter({ playerName: e.target.value })}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block font-medium">Gender</label>
        <select
          value={character.gender || ''}
          onChange={e => updateCharacter({ gender: e.target.value })}
          className="form-select"
        >
          <option value="" disabled>Select…</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </div>

      {/* Age */}
      <div>
        <label className="block font-medium">Age</label>
        <input
          type="number"
          min="1"
          value={localAge}
          onChange={e => {
            setLocalAge(e.target.value);
            updateCharacter({ age: parseInt(e.target.value, 10) || '' });
          }}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
        />
      </div>

      {/* Culture / Background */}
      <div className="col-span-full md:col-span-1">
        <label className="block font-medium">Culture/Background</label>
        <select
          value={character.culture || ''}
          onChange={e => updateCharacter({ culture: e.target.value })}
          className="form-select"
        >
          <option value="" disabled>Select a culture…</option>
          {Object.entries(cultures).map(([key, def]) => (
            <option key={key} value={key}>{def.name}</option>
          ))}
        </select>
      </div>

      {/* Career */}
      <div className="col-span-full md:col-span-1">
        <label className="block font-medium">Career</label>
        <select
          value={character.career || ''}
          onChange={e => updateCharacter({ career: e.target.value })}
          className="form-select"
        >
          <option value="" disabled>Select a career…</option>
          { /* assume careers.json uses `.name` for display */ }
          {require('../data/careers.json').map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Social Class */}
      <div className="col-span-full">
        <label className="block font-medium">Social Class</label>
        <div className="flex items-center gap-2 mt-1">
          <select
            value={character.socialClass || ''}
            onChange={e => updateCharacter({ socialClass: e.target.value })}
            className="form-select flex-1"
          >
            <option value="" disabled>Select or roll…</option>
            {cultureDef.socialClasses?.map(sc => (
              <option key={sc.label} value={sc.label}>
                {sc.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={rollSocialClass}
            className="px-3 py-1 bg-yellow-200 text-gray-800 rounded hover:bg-yellow-300"
          >
            Roll Class
          </button>
        </div>
      </div>

      {/* Starting Money */}
      <div className="col-span-full">
        <label className="block font-medium">Starting Money (sp)</label>
        <div className="flex items-center gap-2 mt-1">
          <div className="font-bold">
            {character.startingMoney != null
              ? character.startingMoney
              : '-'}
          </div>
          <button
            type="button"
            onClick={rollStartingMoney}
            className="px-3 py-1 bg-yellow-200 text-gray-800 rounded hover:bg-yellow-300"
          >
            Roll Money
          </button>
        </div>
      </div>
    </div>
  );
}
