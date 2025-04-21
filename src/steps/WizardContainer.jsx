// src/steps/ConceptStep.jsx
import React from 'react';
import { rollDice } from '../utils/dice';

// Culture options and tables
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

// Component
export default function ConceptStep({ formData = {}, onChange }) {
  const {
    playerName = '',
    characterName = '',
    age = '',
    sex = '',
    culture = '',
    socialClass = '',
    socialRoll = null,
    baseRoll = null,
    silverMod = null,
    startingSilver = null,
  } = formData;

  // Forward native field changes as (name, value)
    // Forward a synthetic event with target.name and target.value
  const handleFieldChange = e => {
    const { name, value } = e.target;
    onChange({ target: { name, value } });
  };

  // Roll to pick a social class
  const handleRollClass = () => {
    if (!culture) return;
    const roll = rollDice('1d100');
    const entry = (socialClassTables[culture] || []).find(e => roll >= e.min && roll <= e.max) || {};
    onChange({ target: { name: 'socialRoll', value: roll } });
    onChange({ target: { name: 'socialClass', value: entry.name || '' } });
  };

  // Calculate starting silver
  const handleGenerateSilver = () => {
    if (!culture || !socialClass) return;
    const roll = rollDice('4d6');
    const multiplier = cultureBaseMultiplier[culture] || 0;
    const entry = (socialClassTables[culture] || []).find(e => e.name === socialClass) || {};
    const mod = entry.mod || 1;
    const total = Math.floor(roll * multiplier * mod);
    onChange({ target: { name: 'baseRoll', value: roll } });
    onChange({ target: { name: 'silverMod', value: mod } });
    onChange({ target: { name: 'startingSilver', value: total } });
  };

  return (
    <div className="bg-parchment px-4 py-6 space-y-6 max-w-4xl mx-auto w-full">
      <label htmlFor="playerName">
        Player Name
        <input
          id="playerName"
          name="playerName"
          className="form-control w-full"
          value={playerName}
          onChange={handleFieldChange}
        />
      </label>

      <label htmlFor="characterName">
        Character Name
        <input
          id="characterName"
          name="characterName"
          className="form-control w-full"
          value={characterName}
          onChange={handleFieldChange}
        />
      </label>

      <label htmlFor="age">
        Age
        <input
          id="age"
          name="age"
          type="number"
          min="0"
          className="form-control w-full"
          value={age}
          onChange={handleFieldChange}
        />
      </label>

      <label htmlFor="sex">
        Sex
        <select
          id="sex"
          name="sex"
          className="form-control w-full"
          value={sex}
          onChange={handleFieldChange}
        >
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <div className="flex space-x-2">
        <label htmlFor="culture" className="flex-1">
          Culture
          <select
            id="culture"
            name="culture"
            className="form-control w-full"
            value={culture}
            onChange={e => {
              handleFieldChange(e);
              onChange('socialClass', '');
              onChange('socialRoll', null);
              onChange('startingSilver', null);
            }}
          >
            <option value="">Select a Culture</option>
            {cultureOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <button
          type="button"
          className="btn btn-secondary mt-6"
          onClick={handleRollClass}
          disabled={!culture}
        >
          Roll Class
        </button>
      </div>

      <label htmlFor="socialClass">
        Social Class{socialRoll != null && ` (roll: ${socialRoll})`}
        <select
          id="socialClass"
          name="socialClass"
          className="form-control w-full"
          value={socialClass}
          onChange={handleFieldChange}
          disabled={!culture}
        >
          <option value="">Select Social Class</option>
          {(socialClassTables[culture] || []).map(sc => (
            <option key={sc.name} value={sc.name}>{sc.name}</option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="btn btn-secondary w-full"
        onClick={handleGenerateSilver}
        disabled={!culture || !socialClass}
      >
        Generate Starting Silver
      </button>

      {startingSilver != null && (
        <>
          <label htmlFor="baseRoll">
            Base Roll (4d6)
            <input
              id="baseRoll"
              name="baseRoll"
              readOnly
              className="form-control w-full"
              value={baseRoll}
            />
          </label>
          <div>
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
