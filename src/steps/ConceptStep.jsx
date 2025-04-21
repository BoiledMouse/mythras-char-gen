// src/steps/ConceptStep.jsx
import React from 'react';
import { rollDice } from '../utils/dice';

const cultureOptions = ['Barbarian', 'Civilised', 'Nomadic', 'Primitive'];
const cultureBaseMultiplier = { Barbarian: 50, Civilised: 75, Nomadic: 25, Primitive: 10 };
const socialClassTables = {
  Barbarian: [ /*…*/ ],
  Civilised: [ /*…*/ ],
  Nomadic:   [ /*…*/ ],
  Primitive: [ /*…*/ ],
};

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

  const change = (name, value) => onChange(name, value);

  const handleField = e => {
    const { name, value } = e.target;
    change(name, value);
  };

  const handleRollClass = () => {
    if (!culture) return;
    const roll = rollDice('1d100');
    const entry = (socialClassTables[culture]||[])
      .find(e => roll >= e.min && roll <= e.max) || {};
    change('socialRoll', roll);
    change('socialClass', entry.name||'');
    change('startingSilver', null);
  };

  const handleGenerateSilver = () => {
    if (!culture || !socialClass) return;
    const roll = rollDice('4d6');
    const mult = cultureBaseMultiplier[culture]||0;
    const entry = (socialClassTables[culture]||[])
      .find(e => e.name === socialClass) || {};
    const mod = entry.mod||1;
    const total = Math.floor(roll * mult * mod);
    change('baseRoll', roll);
    change('silverMod', mod);
    change('startingSilver', total);
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
          onChange={handleField}
        />
      </label>

      <label htmlFor="characterName">
        Character Name
        <input
          id="characterName"
          name="characterName"
          className="form-control w-full"
          value={characterName}
          onChange={handleField}
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
          onChange={handleField}
        />
      </label>

      <label htmlFor="sex">
        Sex
        <select
          id="sex"
          name="sex"
          className="form-control w-full"
          value={sex}
          onChange={handleField}
        >
          <option value="">Select Sex</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
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
              handleField(e);
              change('socialClass','');
              change('socialRoll',null);
            }}
          >
            <option value="">Select a Culture</option>
            {cultureOptions.map(c => <option key={c}>{c}</option>)}
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
        Social Class{socialRoll!=null && ` (roll: ${socialRoll})`}
        <select
          id="socialClass"
          name="socialClass"
          className="form-control w-full"
          value={socialClass}
          onChange={handleField}
          disabled={!culture}
        >
          <option value="">Select Social Class</option>
          {(socialClassTables[culture]||[]).map(sc =>
            <option key={sc.name} value={sc.name}>{sc.name}</option>
          )}
        </select>
      </label>

      <button
        type="button"
        className="btn btn-secondary w-full"
        onClick={handleGenerateSilver}
        disabled={!culture||!socialClass}
      >
        Generate Starting Silver
      </button>

      {startingSilver!=null && (
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
              (4d6 = {baseRoll}) × {cultureBaseMultiplier[culture]} × {silverMod}
              {' '}= <strong>{startingSilver} sp</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
