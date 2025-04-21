// src/steps/ConceptStep.jsx
import React, { useState } from 'react';
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

// Helper to roll 1d100 or 4d6
const rollD100 = () => rollDice('1d100');
const roll4d6 = () => rollDice('4d6');

const ConceptStep = ({ onNext }) => {
  const [playerName, setPlayerName] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [culture, setCulture] = useState('');
  const [socialClass, setSocialClass] = useState('');
  const [startingSilver, setStartingSilver] = useState(null);

  const handleGenerateSilver = () => {
    if (!culture || !socialClass) return;
    const baseRoll = roll4d6();
    const baseSilver = baseRoll * (cultureBaseMultiplier[culture] || 0);
    const clsEntry = socialClassTables[culture].find(e => e.name === socialClass);
    const total = Math.floor(baseSilver * (clsEntry?.mod || 1));
    setStartingSilver(total);
  };

  const disabledNext =
    !playerName || !characterName || !age || !sex || !culture || !socialClass || startingSilver == null;

  return (
    <div className="w-full p-4 max-w-none space-y-6">
      <div className="form-group">
        <label htmlFor="playerName">Player Name</label>
        <input
          id="playerName"
          type="text"
          className="form-control w-full"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="characterName">Character Name</label>
        <input
          id="characterName"
          type="text"
          className="form-control w-full"
          value={characterName}
          onChange={e => setCharacterName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="age">Age</label>
        <input
          id="age"
          type="number"
          min="0"
          className="form-control w-full"
          value={age}
          onChange={e => setAge(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="sex">Sex</label>
        <select
          id="sex"
          className="form-control w-full"
          value={sex}
          onChange={e => setSex(e.target.value)}
        >
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="culture">Culture</label>
        <select
          id="culture"
          className="form-control w-full"
          value={culture}
          onChange={e => {
            setCulture(e.target.value);
            setSocialClass('');
            setStartingSilver(null);
          }}
        >
          <option value="">Select a Culture</option>
          {cultureOptions.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="socialClass">Social Class</label>
        <select
          id="socialClass"
          className="form-control w-full"
          value={socialClass}
          onChange={e => setSocialClass(e.target.value)}
          disabled={!culture}
        >
          <option value="">Select Social Class</option>
          {culture && socialClassTables[culture].map(sc => (
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
          <label htmlFor="startingSilver">Starting Silver (sp)</label>
          <input
            id="startingSilver"
            type="number"
            className="form-control w-full"
            readOnly
            value={startingSilver}
          />
        </div>
      )}
      <button
        className="btn btn-primary w-full"
        onClick={() => onNext({ playerName, characterName, age, sex, culture, socialClass, startingSilver })}
        disabled={disabledNext}
      >
        Next
      </button>
    </div>
  );
};

export { ConceptStep };
export default ConceptStep;
