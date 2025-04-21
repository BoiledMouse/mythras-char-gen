// src/steps/ConceptStep.jsx
import React from 'react';
import { rollDice } from '../utils/dice';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';

// Social class tables per culture
const socialClassTables = {
  Barbarian: [
    { name: 'Outcast',   min: 1,  max: 5,  mod: 0.25 },
    { name: 'Slave',     min: 6,  max: 15, mod: 0.5 },
    { name: 'Freeman',   min: 16, max: 80, mod: 1 },
    { name: 'Gentile',   min: 81, max: 95, mod: 3 },
    { name: 'Chieftain', min: 96, max: 100, mod: 5 },
  ],
  Civilised: [
    { name: 'Outcast',     min: 1,  max: 2,  mod: 0.25 },
    { name: 'Slave',       min: 3,  max: 20, mod: 0.5 },
    { name: 'Freeman',     min: 21, max: 70, mod: 1 },
    { name: 'Gentile',     min: 71, max: 95, mod: 3 },
    { name: 'Aristocracy', min: 96, max: 100, mod: 5 },
  ],
  Nomadic: [
    { name: 'Outcast',   min: 1,  max: 5,  mod: 0.25 },
    { name: 'Slave',     min: 6,  max: 10, mod: 0.5 },
    { name: 'Freeman',   min: 11, max: 90, mod: 1 },
    { name: 'Chieftain', min: 91, max: 100, mod: 3 },
  ],
  Primitive: [
    { name: 'Outcast',   min: 1,  max: 5,  mod: 0.25 },
    { name: 'Freeman',   min: 6,  max: 80, mod: 1 },
    { name: 'Chieftain', min: 81, max: 100, mod: 2 },
  ],
};

export default function ConceptStep({ formData = {}, onChange }) {
  const {
    characterName = '',
    playerName = '',
    age = '',
    sex = '',
    culture = '',
    career = '',
    socialClass = '',
    socialRoll = null,
    baseRoll = null,
    silverMod = null,
    startingSilver = null,
  } = formData;

  // Handle native input/select events
  const handleField = e => onChange(e);

  // Roll for social class
  const handleRollClass = () => {
    if (!culture) return;
    const roll = rollDice('1d100');
    const entry = (socialClassTables[culture] || []).find(e => roll >= e.min && roll <= e.max) || {};
    onChange({ target: { name: 'socialRoll',   value: roll } });
    onChange({ target: { name: 'socialClass',  value: entry.name || '' } });
    onChange({ target: { name: 'startingSilver', value: null } });
  };

  // Generate starting silver
  const handleGenerateSilver = () => {
    if (!culture || !socialClass) return;
    const roll = rollDice('4d6');
    const multiplier = cultures[culture]?.baseSilver || 0;
    const mod = (socialClassTables[culture] || []).find(e => e.name === socialClass)?.mod || 1;
    const total = Math.floor(roll * multiplier * mod);
    onChange({ target: { name: 'baseRoll',    value: roll } });
    onChange({ target: { name: 'silverMod',   value: mod } });
    onChange({ target: { name: 'startingSilver', value: total } });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Character Concept</h2>

      {/* Character Name */}
      <div className="mb-4">
        <label htmlFor="characterName" className="block mb-1 font-medium">Character Name</label>
        <input
          id="characterName"
          name="characterName"
          type="text"
          className="w-full bg-white text-gray-900 border border-gray-300 rounded p-2"
          value={characterName}
          onChange={handleField}
          placeholder="Enter character name"
        />
      </div>

      {/* Player Name */}
      <div className="mb-4">
        <label htmlFor="playerName" className="block mb-1 font-medium">Player Name</label>
        <input
          id="playerName"
          name="playerName"
          type="text"
          className="w-full bg-white text-gray-900 border border-gray-300 rounded p-2"
          value={playerName}
          onChange={handleField}
          placeholder="Enter your name"
        />
      </div>

      {/* Age */}
      <div className="mb-4">
        <label htmlFor="age" className="block mb-1 font-medium">Age</label>
        <input
          id="age"
          name="age"
          type="number"
          min="0"
          className="w-full bg-white text-gray-900 border border-gray-300 rounded p-2"
          value={age}
          onChange={handleField}
        />
      </div>

      {/* Sex */}
      <div className="mb-4">
        <label htmlFor="sex" className="block mb-1 font-medium">Sex</label>
        <select
          id="sex"
          name="sex"
          className="w-full bg-white text-gray-900 border border-gray-300 rounded p-2"
          value={sex}
          onChange={handleField}
        >
          <option value="" disabled>Select sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Culture */}
      <div className="mb-4">
        <label htmlFor="culture" className="block mb-1 font-medium">Select Culture/Background</label>
        <select
          id="culture"
          name="culture"
          className="w-full bg-white text-gray-900 border border-gray-300 rounded p-2"
          value={culture}
          onChange={handleField}
        >
          <option value="" disabled>Select a culture</option>
          {Object.entries(cultures).map(([key, def]) => (
            <option key={key} value={key}>{def.name}</option>
          ))}
        </select>
      </div>

      {/* Career */}
      <div className="mb-4">
        <label htmlFor="career" className="block mb-1 font-medium">Select Career</label>
        <select
          id="career"
          name="career"
          className="w-full bg-white text-gray-900 border border-gray-300 rounded p-2"
          value={career}
          onChange={handleField}
        >
          <option value="" disabled>Select a career</option>
          {Object.entries(careers).map(([key, def]) => (
            <option key={key} value={key}>{def.name}</option>
          ))}
        </select>
      </div>

      {/* Social Class Roll */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Social Class{socialRoll != null && ` (roll: ${socialRoll})`}
        </label>
        <div className="flex space-x-2">
          <select
            id="socialClass"
            name="socialClass"
            className="flex-1 bg-white text-gray-900 border border-gray-300 rounded p-2"
            value={socialClass}
            onChange={handleField}
            disabled={!culture}
          >
            <option value="" disabled>Select social class</option>
            {(socialClassTables[culture] || []).map(sc => (
              <option key={sc.name} value={sc.name}>{sc.name}</option>
            ))}
          </select>
          <button
            type="button"
            className="bg-gray-200 text-gray-800 border border-gray-300 rounded px-4 py-2"
            onClick={handleRollClass}
            disabled={!culture}
          >
            Roll Class
          </button>
        </div>
      </div>

      {/* Starting Silver */}
      <div className="mb-4">
        <button
          type="button"
          className="w-full bg-gray-200 text-gray-800 border border-gray-300 rounded p-2"
          onClick={handleGenerateSilver}
          disabled={!culture || !socialClass}
        >
          Generate Starting Silver
        </button>
        {startingSilver != null && (
          <div className="mt-2 text-sm">
            (4d6 = {baseRoll}) × {cultures[culture]?.baseSilver} × {silverMod} =&nbsp;
            <strong>{startingSilver} sp</strong>
          </div>
        )}
      </div>
    </div>
  );
}
