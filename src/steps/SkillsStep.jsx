// src/steps/SkillsStep.jsx

import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';
import StepWrapper from '../components/StepWrapper';

export default function SkillsStep({ formData }) {
  const { character, updateCharacter } = useCharacter();
  const { STR = 0, DEX = 0, INT = 0, CON = 0, POW = 0, CHA = 0, SIZ = 0 } = character;
  const { age = 0, culture: cultKey = '', career: careerKey = '' } = formData;
  const cultureDef = cultures[cultKey] || {};
  const careerDef = careers[careerKey] || {};

  // Universal min/max for sliders in cultural & career phases
  const SKILL_MIN = 5;
  const SKILL_MAX = 15;
  const CULT_POOL = 100;
  const CAREER_POOL = 100;

  // Age buckets for bonus and maxInc (unchanged)
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10 },
    { max: 27, bonus: 150, maxInc: 15 },
    { max: 43, bonus: 200, maxInc: 20 },
    { max: 64, bonus: 250, maxInc: 25 },
    { max: Infinity, bonus: 300, maxInc: 30 },
  ];
  const { bonus: initialBonusPool = 0, maxInc = 0 } = ageBuckets.find(b => age <= b.max) || {};

  // Attribute formulas parser
  const attrs = { STR, DEX, INT, CON, POW, CHA, SIZ };
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i];
      const tok = parts[i+1];
      const v = /^\d+$/.test(tok) ? +tok : attrs[tok] || 0;
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // Base standard skills
  const rawStandard = skillsData.standard.map(s => s.name);
  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let b = computeBase(base);
    if (name === 'Customs' || name === 'Native Tongue') b += 40;
    baseStandard[name] = b;
  });
  new Set([
    ...rawStandard,
    ...(cultureDef.standardSkills || []),
    ...(careerDef.standardSkills || [])
  ]).forEach(name => {
    const root = name.includes('(') ? name.split('(')[0].trim() : name;
    baseStandard[name] = baseStandard[root] || 0;
  });

  // Base professional skills
  const baseProfGeneric = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfGeneric[name] = computeBase(base);
  });
  const profSet = new Set([
    ...skillsData.professional.map(s => s.name),
    ...(cultureDef.professionalSkills || []),
    ...(careerDef.professionalSkills || [])
  ]);
  const baseProfessional = {};
  Array.from(profSet).forEach(name => {
    const root = name.includes('(') ? name.split('(')[0].trim() : name;
    let val = baseProfGeneric[root] || 0;
    if (root === 'Language' && !name.includes('(')) val += 40;
    baseProfessional[name] = val;
  });
  (cultureDef.combatStyles || []).forEach(style => {
    baseProfessional[style] = STR + DEX;
  });

  // State
  const [phase, setPhase] = useState(1);
  const [cStdAlloc, setCStdAlloc] = useState({});
  const [cProfSel, setCProfSel] = useState([]);
  const [cProfAlloc, setCProfAlloc] = useState({});
  const [cCombSel, setCCombSel] = useState('');
  const [cCombAlloc, setCCombAlloc] = useState(SKILL_MIN);

  const [rStdAlloc, setRStdAlloc] = useState({});
  const [rProfSel, setRProfSel] = useState([]);
  const [rProfAlloc, setRProfAlloc] = useState({});

  const [bonusAlloc, setBonusAlloc] = useState({});
  const [hobby, setHobby] = useState('');

  const sum = obj => Object.values(obj).reduce((a, v) => a + (v || 0), 0);
  const bonusLeft = initialBonusPool - sum(bonusAlloc);

  // Update character on summary
  useEffect(() => {
    if (phase === 4) {
      // ... unchanged
    }
  }, [phase]);

  // Generic slider handler
  const handleRange = (alloc, setAlloc, skill, limit, pool) => e => {
    let v = parseInt(e.target.value, 10) || 0;
    v = Math.max(SKILL_MIN, Math.min(limit, v));
    const prev = alloc[skill] || SKILL_MIN;
    if (v - prev <= pool) setAlloc({ ...alloc, [skill]: v });
  };

  return (
    <>
      {/* Phase 1: Cultural Skills */}
      {phase === 1 && (
        <StepWrapper title="Cultural Skills">
          <p>Points left: {CULT_POOL - (sum(cStdAlloc) + sum(cProfAlloc) + cCombAlloc - SKILL_MIN)}</p>
          {/* Standard Skills unchanged */}
          {/* Professional unchanged */}
          <h3 className="font-heading text-lg mt-4 mb-2">Combat Style</h3>
          {cultureDef.combatStyles?.map(cs => (
            <label key={cs} className="inline-flex items-center mr-4 mb-2">
              <input
                type="radio"
                name="combat"
                className="mr-1"
                checked={cCombSel === cs}
                onChange={() => setCCombSel(cs)}
              />
              {cs}
            </label>
          ))}
          {cCombSel && (
            <div className="flex items-center mb-2">
              <span className="w-24 font-medium">{cCombSel}</span>
              <span className="w-16">{baseProfessional[cCombSel]}%</span>
              <input
                type="range"
                className="flex-1 mx-2"
                min={SKILL_MIN}
                max={SKILL_MAX}
                value={cCombAlloc}
                onChange={e => {
                  const v = Math.min(SKILL_MAX, Math.max(SKILL_MIN, +e.target.value));
                  const pool = CULT_POOL - (sum(cStdAlloc) + sum(cProfAlloc) + (cCombAlloc - SKILL_MIN));
                  if (v - cCombAlloc <= pool) setCCombAlloc(v);
                }}
              />
              <span className="w-24 text-right">+{cCombAlloc}% = {baseProfessional[cCombSel] + cCombAlloc}%</span>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button className="btn btn-primary" onClick={() => setPhase(2)}>Next: Career</button>
          </div>
        </StepWrapper>
      )}

      {/* Phase 2: Career Skills */}
      {phase === 2 && (
        <StepWrapper title="Career Skills">
          <p>Points left: {CAREER_POOL - sum(rStdAlloc) - sum(rProfAlloc)}</p>
          <h3 className="font-heading text-lg mb-2">Standard Skills</h3>
          {careerDef.standardSkills?.map(s => {
            const base = (baseStandard[s] || 0) + (cStdAlloc[s] || 0);
            const alloc = rStdAlloc[s] ?? 5;
            return (
              <div key={s} className="flex items-center mb-2">
                <span className="w-24 font-medium">{s}</span>
                <span className="w-16">{base}%</span>
                <input
                  type="range"
                  className="flex-1 mx-2"
                  min={0}
                  max={SKILL_MAX}
                  value={alloc}
                  onChange={handleRange(rStdAlloc, setRStdAlloc, s, SKILL_MAX, CAREER_POOL - sum(rStdAlloc) - sum(rProfAlloc))}
                />
                <span className="w-24 text-right">+{alloc}% = {base + alloc}%</span>
              </div>
            );
          })}
          <h3 className="font-heading text-lg mt-4 mb-2">Professional (max 3)</h3>
          {careerDef.professionalSkills?.map(s => (
            <label key={s} className="inline-flex items-center mr-4 mb-2">
              <input
                type="checkbox"
                className="mr-1"
                checked={rProfSel.includes(s)}
                onChange={() =>
                  setRProfSel(sel =>
                    sel.includes(s)
                      ? sel.filter(x => x !== s)
                      : sel.length < 3
                      ? [...sel, s]
                      : sel
                  )
                }
              />
              {s}
            </label>
          ))}
          {rProfSel.map(s => {
            const base = (baseProfessional[s] || 0) + (cProfAlloc[s] || 0);
            const alloc = rProfAlloc[s] ?? 5;
            return (
              <div key={s} className="flex items-center mb-2">
                <span className="w-24 font-medium">{s}</span>
                <span className="w-16">{base}%</span>
                <input
                  type="range"
                  className="flex-1 mx-2"
                  min={0}
                  max={SKILL_MAX}
                  value={alloc}
                  onChange={handleRange(rProfAlloc, setRProfAlloc, s, SKILL_MAX, CAREER_POOL - sum(rStdAlloc) - sum(rProfAlloc))}
                />
                <span className="w-24 text-right">+{alloc}% = {base + alloc}%</span>
              </div>
            );
          })}
          <div className="flex justify-between mt-4">
            <button className="btn btn-secondary" onClick={() => setPhase(1)}>Back</button>
            <button className="btn btn-primary" onClick={() => setPhase(3)}>Next: Bonus</button>
          </div>
        </StepWrapper>
      )}

      {/* Phase 3: Bonus Skills */}
      {phase === 3 && (
        <StepWrapper title="Bonus Skills">
          <p>Bonus left: {bonusLeft}</p>
          <div className="mb-4">
            <label className="font-medium">Select hobby skill:</label>
            <select
              value={hobby}
              onChange={e => setHobby(e.target.value)}
              className="ml-2 border rounded p-1"
            >
              <option value="">None</option>
              {[...Object.keys(baseStandard), ...Object.keys(baseProfessional)].map(sk => (
                <option key={sk} value={sk}>{sk}</option>
              ))}
            </select>
          </div>
          {[...bonusSkills].map(s => {
            const alloc = bonusAlloc[s] || 0;
            const pool = initialBonusPool - sum(bonusAlloc) + alloc;
            const base =
              (baseStandard[s] || 0) +
              (cStdAlloc[s] || 0) +
              (baseProfessional[s] || 0) +
              (cProfAlloc[s] || 0) +
              (s === cCombSel ? cCombAlloc : 0) +
              (rStdAlloc[s] || 0) +
              (rProfAlloc[s] || 0);
            return (
              <div key={s} className="flex items-center mb-2">
                <span className="w-24 font-medium">{s}</span>
                <span className="w-16">{base}%</span>
                <input
                  type="range"
                  className="flex-1 mx-2"
                  min={0}
                  max={maxInc}
                  value={alloc}
                  onChange={handleRange(bonusAlloc, setBonusAlloc, s, maxInc, pool)}
                />
                <span className="w-24 text-right">+{alloc}% = {base + alloc}%</span>
              </div>
            );
          })}
          <div className="flex justify-between mt-4">
            <button className="btn btn-secondary" onClick={() => setPhase(2)}>Back</button>
            <button className="btn btn-primary" onClick={() => setPhase(4)}>Finish</button>
          </div>
        </StepWrapper>
      )}

      {/* Phase 4: Skills Summary */}
      {phase === 4 && (
        <StepWrapper title="Skills Summary">
          <h3 className="font-semibold mb-2">Standard Skills</h3>
          <ul className="list-disc list-inside mb-4">
            {skillsData.standard
              .map(({ name }) => name)
              .filter(n => !resistanceList.includes(n))
              .map(n => (
                <li key={n}>{n}: {character.skills[n]}%</li>
              ))}
          </ul>
          <h3 className="font-semibold mb-2">Resistances</h3>
          <ul className="list-disc list-inside mb-4">
            {resistanceList
              .filter(n => character.skills[n] != null)
              .map(n => (
                <li key={n}>{n}: {character.skills[n]}%</li>
              ))}
          </ul>
          <h3 className="font-semibold mb-2">Combat Skills</h3>
          <ul className="list-disc list-inside mb-4">
            {character.selectedSkills?.combat?.map(n => (
              <li key={n}>{n}: {character.skills[n]}%</li>
            ))}
          </ul>
          <h3 className="font-semibold mb-2">Professional Skills</h3>
          <ul className="list-disc list-inside mb-4">
            {character.selectedSkills?.professional?.map(n => (
              <li key={n}>{n}: {character.skills[n]}%</li>
            ))}
          </ul>
          <h3 className="font-semibold mb-2">Magic Skills</h3>
          <ul className="list-disc list-inside">
            {allMagic
              .filter(n => character.skills[n] != null)
              .map(n => (
                <li key={n}>{n}: {character.skills[n]}%</li>
              ))}
          </ul>
        </StepWrapper>
      )}
    </>
  );
}
