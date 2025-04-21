// src/steps/ConceptStep.jsx
import React from 'react';
import { rollDice } from '../utils/dice';

const cultureOptions = ['Barbarian', 'Civilised', 'Nomadic', 'Primitive'];
const cultureBaseMultiplier = { Barbarian: 50, Civilised: 75, Nomadic: 25, Primitive: 10 };
const socialClassTables = {
  Barbarian: [
    { name: 'Outcast', min: 1, max: 5, mod: 0.25 },
    { name: 'Slave', min: 6, max: 15, mod: 0.5 },
    { name: 'Freeman', min: 16, max: 80, mod: 1 },
    { name: 'Gentile', min: 81, max: 95, mod: 3 },
    { name: 'Chieftain', min: 96, max: 100, mod: 5 },
  ],
  Civilised: [
    { name: 'Outcast', min: 1, max: 2, mod: 0.25 },
    { name: 'Slave', min: 3, max: 20, mod: 0.5 },
    { name: 'Freeman', min: 21, max: 70, mod: 1 },
    { name: 'Gentile', min: 71, max: 95, mod: 3 },
    { name: 'Aristocracy', min: 96, max: 100, mod: 5 },
  ],
  Nomadic: [
    { name: 'Outcast', min: 1, max: 5, mod: 0.25 },
    { name: 'Slave', min: 6, max: 10, mod: 0.5 },
    { name: 'Freeman', min: 11, max: 90, mod: 1 },
    { name: 'Chieftain', min: 91, max: 100, mod: 3 },
  ],
  Primitive: [
    { name: 'Outcast', min: 1, max: 5, mod: 0.25 },
    { name: 'Freeman', min: 6, max: 80, mod: 1 },
    { name: 'Chieftain', min: 81, max: 100, mod: 2 },
  ],
};

const rollD100 = () => rollDice('1d100');

const ConceptStep = ({ formData, onChange, onNext }) => {
  // Ensure formData is an object
  const data = formData || {};
  const playerName = data.playerName || '';
  const characterName = data.characterName || '';
  const age = data.age || '';
  const sex = data.sex || '';
  const culture = data.culture || '';
  const socialClass = data.socialClass || '';
  const startingSilver = data.startingSilver;

  const handleGenerateSilver = () => {
    if (!culture || !socialClass) return;
    const baseRoll = rollDice('4d6');
    const baseSilver = baseRoll * (cultureBaseMultiplier[culture] || 0);
    const clsEntry = socialClassTables[culture]?.find(e => e.name === socialClass);
    const total = Math.floor(baseSilver * (clsEntry?.mod || 1));
    onChange({ target: { name: 'startingSilver', value: total } });
  };

  const disabledNext = !playerName || !characterName || !age || !sex || !culture || !socialClass || startingSilver == null;

  return (
    <div className="w-full p-4 max-w-none space-y-6">
      <div className="form-group">
        <label>Player Name</label>
        <input
          name="playerName"
          value={playerName}
          onChange={onChange}
          className="form-control w-full"
        />
      </div>
      <div className="form-group">
        <label>Character Name</label>
        <input
          name="characterName"
          value={characterName}
          onChange={onChange}
          className="form-control w-full"
        />
      </div>
      <div className="form-group">
        <label>Age</label>
        <input
          name="age"
          type="number"
          min="0"
          value={age}
          onChange={onChange}
          className="form-control w-full"
        />
      </div>
      <div className="form-group">
        <label>Sex</label>
        <select
          name="sex"
          value={sex}
          onChange={onChange}
          className="form-control w-full"
        >
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label>Culture</label>
        <select
          name="culture"
          value={culture}
          onChange={e => {
            onChange(e);
            onChange({ target: { name: 'socialClass', value: '' } });
            onChange({ target: { name: 'startingSilver', value: null } });
          }}
          className="form-control w-full"
        >
          <option value="">Select a Culture</option>
          {cultureOptions.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Social Class</label>
        <select
          name="socialClass"
          value={socialClass}
          onChange={onChange}
          disabled={!culture}
          className="form-control w-full"
        >
          <option value="">Select Social Class</option>
          {cultureOptions.includes(culture) &&
            socialClassTables[culture].map(sc => (
              <option key={sc.name} value={sc.name}>{sc.name}</option>
            ))}
        </select>
      </div>
      <div className="form-group">
        <button
          type="button"
          className="btn btn-secondary w-full"
          onClick={handleGenerateSilver}
          disabled={!culture || !socialClass}
        >
          Generate Starting Silver
        </button>
      </div>
      {startingSilver != null && (
        <div className="form-group">
          <label>Starting Silver (sp)</label>
          <input
            name="startingSilver"
            type="number"
            readOnly
            value={startingSilver}
            className="form-control w-full"
          />
        </div>
      )}
      <button
        className="btn btn-primary w-full"
        onClick={onNext}
        disabled={disabledNext}
      >
        Next
      </button>
    </div>
  );
};

export default ConceptStep;
