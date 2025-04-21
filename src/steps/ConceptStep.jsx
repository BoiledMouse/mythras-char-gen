// src/steps/ConceptStep.jsx
import React, { useState, useEffect } from 'react';
import { rollDice, rollD100 } from '../utils/dice'; // assumes dice helpers exist

const cultureOptions = [
  'Barbarian',
  'Civilised',
  'Nomadic',
  'Primitive',
];

// Base multipliers for 4d6 roll per culture
const cultureBaseMultiplier = {
  Barbarian: 50,
  Civilised: 75,
  Nomadic: 25,
  Primitive: 10,
};

const socialClassTables = {
  Barbarian: [
    { name: 'Outcast',   min: 1,   max: 5,   mod: 0.25 },
    { name: 'Slave',     min: 6,   max: 15,  mod: 0.5  },
    { name: 'Freeman',   min: 16,  max: 80,  mod: 1    },
    { name: 'Gentile',   min: 81,  max: 95,  mod: 3    },
    { name: 'Chieftain', min: 96,  max: 100, mod: 5    },
  ],
  Civilised: [
    { name: 'Outcast',     min: 1,   max: 2,   mod: 0.25 },
    { name: 'Slave',       min: 3,   max: 20,  mod: 0.5  },
    { name: 'Freeman',     min: 21,  max: 70,  mod: 1    },
    { name: 'Gentile',     min: 71,  max: 95,  mod: 3    },
    { name: 'Aristocracy', min: 96,  max: 100, mod: 5  },
  ],
  Nomadic: [
    { name: 'Outcast',   min: 1,   max: 5,   mod: 0.25 },
    { name: 'Slave',     min: 6,   max: 10,  mod: 0.5  },
    { name: 'Freeman',   min: 11,  max: 90,  mod: 1    },
    { name: 'Chieftain', min: 91,  max: 100, mod: 3    },
  ],
  Primitive: [
    { name: 'Outcast',   min: 1,   max: 5,   mod: 0.25 },
    { name: 'Freeman',   min: 6,   max: 80,  mod: 1    },
    { name: 'Chieftain', min: 81,  max: 100, mod: 2    },
  ],
};

function generateBaseStartingMoney(culture) {
  const multiplier = cultureBaseMultiplier[culture] || 0;
  const diceTotal = rollDice(4, 6);
  return diceTotal * multiplier;
}

function pickSocialClass(culture) {
  const roll = rollD100();
  const table = socialClassTables[culture] || [];
  return table.find(entry => roll >= entry.min && roll <= entry.max) || { name: 'Unknown', mod: 1 };
}

const ConceptStep = ({ onNext }) => {
  const [playerName, setPlayerName] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [culture, setCulture] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [socialClass, setSocialClass] = useState('');
  const [startingMoney, setStartingMoney] = useState(0);

  useEffect(() => {
    if (!culture) return;
    const cls = pickSocialClass(culture);
    setSocialClass(cls.name);
    const base = generateBaseStartingMoney(culture);
    const total = Math.floor(base * cls.mod);
    setStartingMoney(total);
  }, [culture]);

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
        <label htmlFor="culture">Culture</label>
        <select
          id="culture"
          className="form-control"
          value={culture}
          onChange={e => setCulture(e.target.value)}
        >
          <option value="">Select a Culture</option>
          {cultureOptions.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="age">Age</label>
        <input
          type="number"
          id="age"
          className="form-control"
          min="0"
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

      {culture && (
        <div className="form-group">
          <label>Social Class</label>
          <input
            type="text"
            className="form-control"
            readOnly
            value={socialClass}
          />
        </div>
      )}

      {culture && (
        <div className="form-group">
          <label>Starting Silver (sp)</label>
          <input
            type="number"
            className="form-control"
            readOnly
            value={startingMoney}
          />
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={() => onNext({ playerName, characterName, culture, age, sex, socialClass, startingMoney })}
      >
        Next
      </button>
    </div>
  );
};

export default ConceptStep;
