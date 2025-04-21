// src/steps/ConceptStep.jsx
import React, { useState } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import { rollDice } from '../utils/dice';

export function ConceptStep() {
  const { character, updateCharacter } = useCharacter();
  const [pctRoll, setPctRoll] = useState(null);

  const cult = cultures[character.culture] || null;
  const careerList = Object.keys(careers);

  // 1–100 roll for social class
  function rollPercentile() {
    const pct = rollDice('1d100');
    setPctRoll(pct);
    if (!cult) return;
    const found = cult.socialClasses.find(sc => pct >= sc.min && pct <= sc.max);
    if (found) updateCharacter({ socialClass: found.name });
  }

  // Starting money
  function rollStartingMoney() {
    if (!cult || !character.socialClass) return;
    const base = rollDice(cult.moneyDice);
    const scDef = cult.socialClasses.find(sc => sc.name === character.socialClass);
    const total = scDef
      ? Math.round(base * scDef.mult)
      : base;
    updateCharacter({ startingMoney: total });
  }

  return (
    <div className="space-y-6">
      {/* Character Name / Player Name */}
      <div>
        <label className="block font-semibold">Character Name</label>
        <input
          type="text"
          className="mt-1 input"
          value={character.name}
          onChange={e => updateCharacter({ name: e.target.value })}
        />
      </div>
      <div>
        <label className="block font-semibold">Player Name</label>
        <input
          type="text"
          className="mt-1 input"
          value={character.playerName}
          onChange={e => updateCharacter({ playerName: e.target.value })}
        />
      </div>

      {/* Gender / Age */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block font-semibold">Gender</label>
          <select
            className="mt-1 input"
            value={character.gender}
            onChange={e => updateCharacter({ gender: e.target.value })}
          >
            <option value="">Select…</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-semibold">Age</label>
          <input
            type="number"
            className="mt-1 input"
            value={character.age}
            onChange={e => updateCharacter({ age: e.target.value })}
          />
        </div>
      </div>

      {/* Culture & Career */}
      <div>
        <label className="block font-semibold">Culture/Background</label>
        <select
          className="mt-1 input"
          value={character.culture}
          onChange={e => updateCharacter({ culture: e.target.value, socialClass: '', startingMoney: 0 })}
        >
          <option value="">Select a culture…</option>
          {Object.entries(cultures).map(([key, c]) => (
            <option key={key} value={key}>{c.displayName}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-semibold">Career</label>
<select
  className="mt-1 input"
  value={character.career}
  onChange={e => updateCharacter({ career: e.target.value })}
>
  <option value="">Select a career…</option>
  {careerList.map(key => {
    const entry = careers[key] || {};
    return (
      <option key={key} value={key}>
        {entry.displayName || key}
      </option>
    )
  })}
</select>
      </div>

      {/* Social Class */}
      {cult && (
        <div className="space-y-1">
          <label className="block font-semibold">Social Class</label>
          <div className="flex items-center space-x-2">
            <select
              className="flex-1 input"
              value={character.socialClass}
              onChange={e => updateCharacter({ socialClass: e.target.value })}
            >
              <option value="">(roll or pick…)</option>
              {cult.socialClasses.map(sc => (
                <option key={sc.name} value={sc.name}>
                  {sc.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-secondary"
              onClick={rollPercentile}
            >
              Roll 1‑100 {pctRoll != null && `→ ${pctRoll}`}
            </button>
          </div>
        </div>
      )}

      {/* Starting Money */}
      {cult && character.socialClass && (
        <div className="space-y-1">
          <button
            type="button"
            className="btn-primary"
            onClick={rollStartingMoney}
          >
            Roll Starting Money
          </button>
          {character.startingMoney != null && (
            <p>
              You have <strong>{character.startingMoney.toLocaleString()}</strong> sp
            </p>
          )}
        </div>
      )}
    </div>
  );
}
