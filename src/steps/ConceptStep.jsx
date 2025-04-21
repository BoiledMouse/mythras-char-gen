import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';

export function ConceptStep() {
  const { character, updateCharacter } = useCharacter();

  // 1. Define your arrays here instead of t('…')
  const GENDERS = ['Male', 'Female', 'Non‑binary', 'Other'];
  
  // Assuming each culture JSON now has a "socialClasses" array:
  const cultureDef = cultures[character.culture] || {};
  const SOCIAL_CLASSES = cultureDef.socialClasses || []; 
  // e.g. ["Low", "Middle", "High", "Noble"]

  // Careers is an object keyed by id, map to display names
  const CAREER_LIST = Object.values(careers).map(c => c.name);

  // Handlers
  const onChange = field => e =>
    updateCharacter({ [field]: e.target.value });

  // Rolling helpers (you’ll wire up real D6 logic somewhere else)
  const rollSocialClass = () => {
    const roll = Math.floor(Math.random() * 100) + 1; // 1–100
    const tbl = cultureDef.socialClassTable || [];
    const found = tbl.find(row => roll >= row.min && roll <= row.max);
    if (found) updateCharacter({ socialClass: found.name });
  };

  const rollStartingMoney = () => {
    const baseRoll = Array.from({ length: 4 })
      .map(() => Math.floor(Math.random() * 6) + 1)
      .reduce((a, b) => a + b, 0);
    const multiplier = cultureDef.moneyMultiplier || 1;
    const socMod = (cultureDef.socialClassModifiers || {})[character.socialClass] || 1;
    const total = Math.round(baseRoll * multiplier * socMod);
    updateCharacter({ silver: total });
  };

  return (
    <div className="space-y-6">
      <div>
        <label>Character Name</label>
        <input
          className="form-input"
          value={character.name}
          onChange={onChange('name')}
        />
      </div>

      <div>
        <label>Player Name</label>
        <input
          className="form-input"
          value={character.player}
          onChange={onChange('player')}
        />
      </div>

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

      <div>
        <label>Culture/Background</label>
        <select
          className="form-select"
          value={character.culture || ''}
          onChange={onChange('culture')}
        >
          <option value="">Select a culture…</option>
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
          <option value="">Select a career…</option>
          {CAREER_LIST.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-2">
        <label>Social Class</label>
        <div className="flex items-center space-x-2">
          {/* Manual pick */}
          <select
            className="form-select w-auto flex-1"
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

          {/* Or roll */}
          <button
            type="button"
            className="px-3 py-1 bg-gold text-white rounded"
            onClick={rollSocialClass}
          >
            Roll
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
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
            className="px-3 py-1 bg-gold text-white rounded"
            onClick={rollStartingMoney}
          >
            Roll
          </button>
        </div>
      </div>
    </div>
  );
}
