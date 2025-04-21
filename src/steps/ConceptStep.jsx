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

// Helpers
const rollD100 = () => rollDice('1d100');
const roll4d6 = () => rollDice('4d6');

const ConceptStep = ({ onNext }) => {
  const [playerName, setPlayerName] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [culture, setCulture] = useState('');
  const [socialClass, setSocialClass] = useState('');
  const [socialRoll, setSocialRoll] = useState(null);
  const [baseRoll, setBaseRoll] = useState(null);
  const [silverMod, setSilverMod] = useState(null);
  const [startingSilver, setStartingSilver] = useState(null);

  const handleRollSocialClass = () => {
    if (!culture) return;
    const roll = rollD100();
    setSocialRoll(roll);
    const entry = socialClassTables[culture].find(e => roll >= e.min && roll <= e.max);
    setSocialClass(entry ? entry.name : 'Unknown');
  };

  const handleGenerateSilver = () => {
    if (!culture || !socialClass) return;
    const roll = roll4d6();
    const multiplier = cultureBaseMultiplier[culture] || 0;
    const clsEntry = socialClassTables[culture].find(e => e.name === socialClass);
    const mod = clsEntry ? clsEntry.mod : 1;
    setBaseRoll(roll);
    setSilverMod(mod);
    setStartingSilver(Math.floor(roll * multiplier * mod));
  };

  const disabledNext =
    !playerName || !characterName || !age || !sex || !culture || !socialClass || startingSilver == null;

  return (
    <div className="w-full p-4 max-w-none space-y-6">
      {/* Player & Character */}
      <div className="form-group">
        <label>Player Name</label>
        <input className="form-control w-full" value={playerName} onChange={e => setPlayerName(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Character Name</label>
        <input className="form-control w-full" value={characterName} onChange={e => setCharacterName(e.target.value)} />
      </div>
      {/* Age & Sex */}
      <div className="form-group">
        <label>Age</label>
        <input type="number" min="0" className="form-control w-full" value={age} onChange={e => setAge(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Sex</label>
        <select className="form-control w-full" value={sex} onChange={e => setSex(e.target.value)}>
          <option value="">Select Sex</option>
          <option>Male</option><option>Female</option><option>Other</option>
        </select>
      </div>
      {/* Culture & Social Class */}
      <div className="form-group flex space-x-2">
        <div className="flex-1">
          <label>Culture</label>
          <select className="form-control w-full" value={culture} onChange={e => { setCulture(e.target.value); setSocialClass(''); setSocialRoll(null); }}>
            <option value="">Select a Culture</option>
            {cultureOptions.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <button className="btn btn-secondary mt-6" onClick={handleRollSocialClass} disabled={!culture}>
            Roll Class
          </button>
        </div>
      </div>
      <div className="form-group">
        <label>Social Class {socialRoll != null && `(roll: ${socialRoll})`}</label>
        <select className="form-control w-full" value={socialClass} onChange={e => setSocialClass(e.target.value)} disabled={!culture}>
          <option value="">Select Social Class</option>
          {culture && socialClassTables[culture].map(sc => <option key={sc.name}>{sc.name}</option>)}
        </select>
      </div>
      {/* Silver Generation */}
      <div className="form-group">
        <button className="btn btn-secondary w-full" onClick={handleGenerateSilver} disabled={!culture || !socialClass}>
          Generate Starting Silver
        </button>
      </div>
      {startingSilver != null && (
        <div className="space-y-2">
          <div className="form-group">
            <label>Base Roll (4d6)</label>
            <input readOnly className="form-control w-full" value={baseRoll} />
          </div>
          <div className="form-group">
            <label>Calculation</label>
            <div className="p-2 bg-gray-100 rounded">
              (4d6 = {baseRoll}) × Multiplier ({cultureBaseMultiplier[culture]}) × Modifier ({silverMod}) = <strong>{startingSilver} sp</strong>
            </div>
          </div>
        </div>
      )}
      {/* Next */}
      <button className="btn btn-primary w-full" onClick={() => onNext({ playerName, characterName, age, sex, culture, socialClass, startingSilver })} disabled={disabledNext}>
        Next
      </button>
    </div>
  );
};

export { ConceptStep };
export default ConceptStep;
