import React from 'react';
import { rollDice } from '../utils/dice';
import careers from '../data/careers.json';
import { useCharacter } from '../context/characterContext';

// 1) Define cultures and their silver multipliers here
const cultureOptions = ['Barbarian', 'Civilised', 'Nomadic', 'Primitive'];
const cultureBaseMultiplier = {
  Barbarian: 50,
  Civilised: 75,
  Nomadic: 25,
  Primitive: 10,
};

// 2) Social class tables (unchanged)
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
  const { updateCharacter } = useCharacter();
  const {
    characterName = '',
    playerName    = '',
    age           = '',
    sex           = '',
    culture       = '',
    career        = '',
    socialClass   = '',
    socialRoll    = null,
    baseRoll      = null,
    silverMod     = null,
    startingSilver= null,
  } = formData;

  const sync = e => {
    const { name, value } = e.target;
    onChange(e);
    updateCharacter({ [name]: value });
  };

  const handleRollClass = () => {
    if (!culture) return;
    const roll = rollDice('1d100');
    const entry = (socialClassTables[culture]||[])
      .find(e => roll >= e.min && roll <= e.max) || {};
    onChange({ target: { name: 'socialRoll', value: roll } });
    updateCharacter({ socialRoll: roll });

    onChange({ target: { name: 'socialClass', value: entry.name || '' } });
    updateCharacter({ socialClass: entry.name || '' });

    onChange({ target: { name: 'startingSilver', value: null } });
    updateCharacter({ startingSilver: null });
  };

  const handleGenerateSilver = () => {
    if (!culture || !socialClass) return;
    const roll = rollDice('4d6');
    const mult = cultureBaseMultiplier[culture] || 0;
    const mod  = (socialClassTables[culture]||[])
      .find(e => e.name === socialClass)?.mod || 1;
    const total = Math.floor(roll * mult * mod);

    onChange({ target: { name: 'baseRoll', value: roll } });
    updateCharacter({ baseRoll: roll });

    onChange({ target: { name: 'silverMod', value: mod } });
    updateCharacter({ silverMod: mod });

    onChange({ target: { name: 'startingSilver', value: total } });
    updateCharacter({ startingSilver: total });
  };

  return (
    <StepWrapper title="Concept">
    <div className="panel-parchment p-6 max-w-4xl mx-auto w-full space-y-6">
      <h2 className="font-semibold">Character Concept</h2>

      {/* Character Name */}
      <label className="block">
        <span className="font-medium">Character Name</span>
        <input
          name="characterName"
          type="text"
          className="form-control mt-1"
          value={characterName}
          onChange={sync}
          placeholder="Enter character name"
        />
      </label>

      {/* Player Name */}
      <label className="block">
        <span className="font-medium">Player Name</span>
        <input
          name="playerName"
          type="text"
          className="form-control mt-1"
          value={playerName}
          onChange={sync}
          placeholder="Enter your name"
        />
      </label>

      {/* Age */}
      <label className="block">
        <span className="font-medium">Age</span>
        <input
          name="age"
          type="number"
          min="0"
          className="form-control mt-1"
          value={age}
          onChange={sync}
        />
      </label>

      {/* Sex */}
      <label className="block">
        <span className="font-medium">Sex</span>
        <select
          name="sex"
          className="form-control mt-1"
          value={sex}
          onChange={sync}
        >
          <option value="" disabled>Select sex</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </label>

      {/* Culture */}
      <label className="block">
        <span className="font-medium">Culture</span>
        <select
          name="culture"
          className="form-control mt-1"
          value={culture}
          onChange={e => {
            sync(e);
            // reset dependent
            updateCharacter({ socialClass: '', socialRoll: null, startingSilver: null });
            onChange({ target: { name: 'socialClass', value: '' } });
          }}
        >
          <option value="" disabled>Select a culture</option>
          {cultureOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      {/* Career */}
      <label className="block">
        <span className="font-medium">Career</span>
        <select
          name="career"
          className="form-control mt-1"
          value={career}
          onChange={sync}
        >
          <option value="" disabled>Select a career</option>
          {Object.entries(careers).map(([key, def]) => (
            <option key={key} value={key}>{def.name}</option>
          ))}
        </select>
      </label>

      {/* Social Class & Roll */}
      <div className="space-y-1">
        <span className="font-medium">
          Social Class{socialRoll != null && ` (roll: ${socialRoll})`}
        </span>
        <div className="flex space-x-2">
          <select
            name="socialClass"
            className="form-control flex-1 mt-1"
            value={socialClass}
            onChange={sync}
            disabled={!culture}
          >
            <option value="" disabled>Select social class</option>
            {(socialClassTables[culture] || []).map(sc => (
              <option key={sc.name} value={sc.name}>{sc.name}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-secondary mt-1"
            onClick={handleRollClass}
            disabled={!culture}
          >
            Roll Class
          </button>
        </div>
      </div>

      {/* Starting Silver */}
      <div className="space-y-1">
        <button
          type="button"
          className="btn btn-secondary w-full"
          onClick={handleGenerateSilver}
          disabled={!culture || !socialClass}
        >
          Generate Starting Silver
        </button>
        {startingSilver != null && (
          <div className="text-sm">
            (4d6 = {baseRoll}) × {cultureBaseMultiplier[culture]} × {silverMod} =
            <strong> {startingSilver} sp</strong>
          </div>
        )}
      </div>
    </div>
   </StepWrapper>
  );
}
