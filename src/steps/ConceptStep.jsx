// src/steps/ConceptStep.jsx
import React from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';

export function ConceptStep() {
  const { character, updateCharacter } = useCharacter();

  // Simple arrays instead of t(...).map
  const GENDERS = ['Male', 'Female', 'Non‑binary', 'Other'];
  const cultureDef = cultures[character.culture] || {};
  const SOCIAL_CLASSES = cultureDef.socialClasses || [];
  const CAREER_LIST = Object.values(careers).map(c => c.name);

  const onChange = field => e =>
    updateCharacter({ [field]: e.target.value });

  const rollD100 = () => Math.floor(Math.random() * 100) + 1;
  const roll4d6 = () =>
    Array.from({ length: 4 })
      .map(() => Math.floor(Math.random() * 6) + 1)
      .reduce((a, b) => a + b, 0);

  const rollSocialClass = () => {
    const roll = rollD100();
    const tbl = cultureDef.socialClassTable || [];
    const found = tbl.find(r => roll >= r.min && roll <= r.max);
    if (found) updateCharacter({ socialClass: found.name });
  };

  const rollStartingMoney = () => {
    const base = roll4d6();
    const mult = cultureDef.moneyMultiplier || 1;
    const socMod =
      (cultureDef.socialClassModifiers || {})[character.socialClass] || 1;
    updateCharacter({ silver: Math.round(base * mult * socMod) });
  };

  return (
    <div className="space-y-6">
      {/* Name/Player */}
      <div>
        <label>Character Name</label>
        <input
          className="form-input"
          value={character.name || ''}
          onChange={onChange('name')}
        />
      </div>
      <div>
        <label>Player Name</label>
        <input
          className="form-input"
          value={character.player || ''}
          onChange={onChange('player')}
        />
      </div>

      {/* Gender / Age */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Gender</label>
          <select
            className="form-select"
            value={character.gender || ''}
            onChange={onChange('gender')}
          >
            <option value="">Select…</option>
            {GENDERS.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Age</label>
          <input
            type="number"
            className="form-input"
            value={character.age || ''}
            onChange={onChange('age')}
          />
        </div>
      </div>

      {/* Culture & Career */}
      <div>
        <label>Culture/Background</label>
        <select
          className="form-select"
          value={character.culture || ''}
          onChange={onChange('culture')}
        >
          <option value="">Select…</option>
          {Object.entries(cultures).map(([key, c]) => (
            <option key={key} value={key}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Career</label>
        <select
          className="form-select"
          value={character.career || ''}
          onChange={onChange('career')}
        >
          <option value="">Select…</option>
          {CAREER_LIST.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Social Class */}
      <div>
        <label>Social Class</label>
        <div className="flex items-center space-x-2">
          <select
            className="form-select flex-1"
            value={character.socialClass || ''}
            onChange={onChange('socialClass')}
          >
            <option value="">Select…</option>
            {SOCIAL_CLASSES.map(sc => (
              <option key={sc} value={sc}>
                {sc}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="px-3 py-1 bg-yellow-500 text-white rounded"
            onClick={rollSocialClass}
          >
            Roll
          </button>
        </div>
      </div>

      {/* Starting Money */}
      <div>
        <label>Starting Money (silver)</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            className="form-input w-24"
            value={character.silver || ''}
            readOnly
          />
          <button
            type="button"
            className="px-3 py-1 bg-yellow-500 text-white rounded"
            onClick={rollStartingMoney}
          >
            Roll
          </button>
        </div>
      </div>
    </div>
  );
}
