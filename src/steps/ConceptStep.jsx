// src/steps/ConceptStep.jsx
import React from 'react';
import { rollDice } from '../utils/dice';

// Cultural options and tables
const cultureOptions = ['Barbarian', 'Civilised', 'Nomadic', 'Primitive'];
const cultureBaseMultiplier = { Barbarian: 50, Civilised: 75, Nomadic: 25, Primitive: 10 };
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
    { name: 'Aristocracy', min: 96,  max: 100, mod: 5    },
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

// Dice helpers
const rollD100 = () => rollDice('1d100');
const roll4d6 = () => rollDice('4d6');

export default function ConceptStep({ formData = {}, onChange }) {
  const {
    playerName = '', characterName = '', age = '', sex = '',
    culture = '', socialClass = '', socialRoll = null,
    baseRoll = null, silverMod = null, startingSilver = null,
  } = formData;

  // handlers
  const changeField = (name, value) => {
    onChange({ target: { name, value } });
  };
  const handleRollClass = () => {
    if (!culture) return;
    const roll = rollD100();
    const entry = socialClassTables[culture].find(e => roll >= e.min && roll <= e.max) || {};
    changeField('socialRoll', roll);
    changeField('socialClass', entry.name || '');
  };
  const handleGenerateSilver = () => {
    if (!culture || !socialClass) return;
    const roll = roll4d6();
    const multiplier = cultureBaseMultiplier[culture] || 0;
    const entry = socialClassTables[culture].find(e => e.name === socialClass) || {};
    const mod = entry.mod || 1;
    const total = Math.floor(roll * multiplier * mod);
    changeField('baseRoll', roll);
    changeField('silverMod', mod);
    changeField('startingSilver', total);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 bg-parchment">
      {/* Player Info */}
      <div className="form-group">
        <label htmlFor="playerName">Player Name</label>
        <input
          id="playerName"
          name="playerName"
          className="form-control w-full"
          value={playerName}
          onChange={e => changeField('playerName', e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="characterName">Character Name</label>
        <input
          id="characterName"
          name="characterName"
          className="form-control w-full"
          value={characterName}
          onChange={e => changeField('characterName', e.target.value)}
        />
      </div>

      {/* Age & Sex */}
      <div className="form-group">
        <label htmlFor="age">Age</label>
        <input
          id="age"
          name="age"
          type="number"
          min="0"
          className="form-control w-full"
          value={age}
          onChange={e => changeField('age', e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="sex">Sex</label>
        <select
          id="sex"
          name="sex"
          className="form-control w-full"
          value={sex}
          onChange={e => changeField('sex', e.target.value)}
        >
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Culture & Class */}
      <div className="form-group flex space-x-2">
        <div className="flex-1">
          <label htmlFor="culture">Culture</label>
          <select
            id="culture"
            name="culture"
            className="form-control w-full"
            value={culture}
            onChange={e => {
              changeField('culture', e.target.value);
              changeField('socialClass', '');
              changeField('socialRoll', null);
              changeField('startingSilver', null);
            }}
          >
            <option value="">Select a Culture</option>
            {cultureOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-secondary mt-6"
          onClick={handleRollClass}
          disabled={!culture}
        >
          Roll Class
        </button>
      </div>
      <div className="form-group">
        <label htmlFor="socialClass">
          Social Class{socialRoll != null && ` (roll: ${socialRoll})`}
        </label>
        <select
          id="socialClass"
          name="socialClass"
          className="form-control w-full"
          value={socialClass}
          onChange={e => changeField('socialClass', e.target.value)}
          disabled={!culture}
        >
          <option value="">Select Social Class</option>
          {culture && socialClassTables[culture].map(sc => (
            <option key={sc.name} value={sc.name}>{sc.name}</option>
          ))}
        </select>
      </div>

      {/* Starting Silver */}
      <div className="form-group">
        <button
          className="btn btn-secondary w-full"
          onClick={handleGenerateSilver}
          disabled={!culture || !socialClass}
        >
          Generate Starting Silver
        </button>
      </div>
      {startingSilver != null && (
        <>
          <div className="form-group">
            <label htmlFor="baseRoll">Base Roll (4d6)</label>
            <input
              id="baseRoll"
              name="baseRoll"
              readOnly
              className="form-control w-full"
              value={baseRoll}
            />
          </div>
          <div className="form-group">
            <label>Calculation</label>
            <div className="p-2 rounded w-full text-sm">
              (4d6 = {baseRoll}) × {cultureBaseMultiplier[culture]} × {silverMod} = <strong>{startingSilver} sp</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
