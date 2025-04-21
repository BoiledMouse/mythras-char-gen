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

// helper: roll 1d100
function rollD100() {
  return rollDice('1d100');
}

export const ConceptStep = ({ onNext }) => {
  const [playerName, setPlayerName] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [culture, setCulture] = useState('');
  const [socialClass, setSocialClass] = useState('');
  const [startingSilver, setStartingSilver] = useState(null);

  const handleGenerateSilver = () => {
    if (!culture || !socialClass) return;
    // roll 4d6 for base
    const baseRoll = rollDice('4d6');
    const baseSilver = baseRoll * cultureBaseMultiplier[culture];
    const clsEntry = socialClassTables[culture].find(e => e.name === socialClass);
    const total = Math.floor(baseSilver * (clsEntry?.mod || 1));
    setStartingSilver(total);
  };

  const handleCultureChange = value => {
    setCulture(value);
    setSocialClass('');
    setStartingSilver(null);
  };

  const handleSocialClassChange = value => {
    setSocialClass(value);
    setStartingSilver(null);
  };

  const onSubmit = () => {
    onNext({ playerName, characterName, age, sex, culture, socialClass, startingSilver });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="form-group">
        <label htmlFor="playerName">Player Name</label>
        <input
          type="text"
          id="playerName"
          className="form-control"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="characterName">Character Name</label>
        <input
          type="text"
          id="characterName"
          className="form-control"
          value={characterName}
          onChange={e => setCharacterName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="age">Age</label>
        <input
          type="number"
          id="age"
          min="0"
          className="form-control"
          value={age}
          onChange={e => setAge(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="sex">Sex</label>
        <select
          id="sex"
          className="form-control"
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
          className="form-control"
          value={culture}
          onChange={e => handleCultureChange(e.target.value)}
        >
          <option value="">Select a Culture</option>
          {cultureOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="socialClass">Social Class</label>
        <select
          id="socialClass"
          className="form-control"
          value={socialClass}
          onChange={e => handleSocialClassChange(e.target.value)}
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
          className="btn btn-secondary"
          onClick={handleGenerateSilver}
          disabled={!culture || !socialClass}
        >
          Generate Starting Silver
        </button>
      </div>

      {startingSilver !== null && (
        <div className="form-group">
          <label>Starting Silver (sp)</label>
          <input
            type="number"
            className="form-control"
            readOnly
            value={startingSilver}
          />
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={onSubmit}
        disabled={!playerName || !characterName || !age || !sex || !culture || !socialClass || startingSilver === null}
      >
        Next
      </button>
    </div>
  );
};

export default ConceptStep;
