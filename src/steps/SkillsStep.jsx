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

  // Universal min/max for sliders
  const SKILL_MIN = 5;
  const SKILL_MAX = 15;
  const CULT_POOL = 100;
  const CAREER_POOL = 100;

  // Age buckets for bonus and maxInc
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10 },
    { max: 27, bonus: 150, maxInc: 15 },
    { max: 43, bonus: 200, maxInc: 20 },
    { max: 64, bonus: 250, maxInc: 25 },
    { max: Infinity, bonus: 300, maxInc: 30 },
  ];
  const { bonus: initialBonusPool = 0, maxInc = 0 } =
    ageBuckets.find(b => age <= b.max) || {};

  // Attribute formulas parser
  const attrs = { STR, DEX, INT, CON, POW, CHA, SIZ };
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i];
      const tok = parts[i + 1];
      const v = /^\d+$/.test(tok) ? +tok : attrs[tok] || 0;
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // Base standards
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
    ...(careerDef.standardSkills || []),
  ]).forEach(name => {
    const root = name.includes('(') ? name.split('(')[0].trim() : name;
    baseStandard[name] = baseStandard[root] || 0;
  });

  // Base professional
  const baseProfGeneric = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfGeneric[name] = computeBase(base);
  });
  const profSet = new Set([
    ...skillsData.professional.map(s => s.name),
    ...(cultureDef.professionalSkills || []),
    ...(careerDef.professionalSkills || []),
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

  const sum = obj =>
    Object.values(obj).reduce((a, v) => a + (typeof v === 'number' ? v : 0), 0);
  const bonusLeft = initialBonusPool - sum(bonusAlloc);

  // Total cultural allocation
  const totalCulturalAlloc =
    (cultureDef.standardSkills || []).reduce(
      (acc, s) => acc + (cStdAlloc[s] ?? SKILL_MIN),
      0
    ) +
    cProfSel.reduce((acc, s) => acc + (cProfAlloc[s] ?? SKILL_MIN), 0) +
    (cCombSel ? cCombAlloc : 0);

  // Total career allocation now defaults to 0
  const totalCareerAlloc =
    (careerDef.standardSkills || []).reduce(
      (acc, s) => acc + (rStdAlloc[s] ?? 0),
      0
    ) +
    rProfSel.reduce((acc, s) => acc + (rProfAlloc[s] ?? 0), 0);

  // Bonus skills list
  const bonusSkills = new Set([
    ...(cultureDef.standardSkills || []),
    ...(cultureDef.professionalSkills || []),
    ...(cultureDef.combatStyles && cCombSel ? [cCombSel] : []),
    ...(careerDef.standardSkills || []),
    ...(careerDef.professionalSkills || []),
    ...(hobby ? [hobby] : []),
  ]);

  // Generic slider handler now takes an optional min (default = 5)
  const handleRange =
    (alloc, setAlloc, skill, limit, pool, min = SKILL_MIN) =>
    e => {
      let v = parseInt(e.target.value, 10);
      if (isNaN(v)) v = min;
      v = Math.max(min, Math.min(limit, v));
      const prev = alloc[skill] ?? min;
      if (v - prev <= pool) setAlloc({ ...alloc, [skill]: v });
    };

  // Update character on summary
  useEffect(() => {
    if (phase === 4) {
      const final = { ...baseStandard, ...baseProfessional };
      cultureDef.standardSkills?.forEach(
        s => (final[s] += cStdAlloc[s] ?? SKILL_MIN)
      );
      cProfSel.forEach(s => (final[s] += cProfAlloc[s] ?? SKILL_MIN));
      if (cCombSel) final[cCombSel] += cCombAlloc;
      careerDef.standardSkills?.forEach(s => (final[s] += rStdAlloc[s] ?? 0));
      rProfSel.forEach(s => (final[s] += rProfAlloc[s] ?? 0));
      Object.entries(bonusAlloc).forEach(([s, v]) => (final[s] += v));
      updateCharacter({
        skills: final,
        selectedSkills: {
          standard: [
            ...(cultureDef.standardSkills || []),
            ...(careerDef.standardSkills || []),
          ],
          professional: [...cProfSel, ...rProfSel, ...(cCombSel ? [cCombSel] : [])],
          combat: cCombSel ? [cCombSel] : [],
        },
      });
    }
  }, [phase]);

  return (
    <>
      {/* Phase 1: Cultural Skills */}
      {phase === 1 && (
        <StepWrapper title="Cultural Skills">
          <p>Points left: {CULT_POOL - totalCulturalAlloc}</p>

          <h3 className="font-heading text-lg mb-2">Standard Skills</h3>
          {cultureDef.standardSkills?.map(s => {
            const base = baseStandard[s];
            const alloc = cStdAlloc[s] ?? SKILL_MIN;
            return (
              <div key={s} className="flex items-center mb-2">
                <span className="w-24 font-medium">{s}</span>
                <span className="w-16">{base}%</span>
                <input
                  type="range"
                  className="flex-1 mx-2"
                  min={SKILL_MIN}
                  max={SKILL_MAX}
                  value={alloc}
                  onChange={handleRange(
                    cStdAlloc,
                    setCStdAlloc,
                    s,
                    SKILL_MAX,
                    CULT_POOL - totalCulturalAlloc + alloc
                  )}
                />
                <span className="w-24 text-right">
                  +{alloc}% = {base + alloc}%
                </span>
              </div>
            );
          })}

          <h3 className="font-heading text-lg mt-4 mb-2">Professional (max 3)</h3>
          {cultureDef.professionalSkills?.map(s => (
            <label key={s} className="inline-flex items-center mr-4 mb-2">
              <input
                type="checkbox"
                className="mr-1"
                checked={cProfSel.includes(s)}
                onChange={() =>
                  setCProfSel(sel =>
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
          {cProfSel.map(s => {
            const base = baseProfessional[s];
            const alloc = cProfAlloc[s] ?? SKILL_MIN;
            return (
              <div key={s} className="flex items-center mb-2">
                <span className="w-24 font-medium">{s}</span>
                <span className="w-16">{base}%</span>
                <input
                  type="range"
                  className="flex-1 mx-2"
                  min={SKILL_MIN}
                  max={SKILL_MAX}
                  value={alloc}
                  onChange={handleRange(
                    cProfAlloc,
                    setCProfAlloc,
                    s,
                    SKILL_MAX,
                    CULT_POOL - totalCulturalAlloc + alloc
                  )}
                />
                <span className="w-24 text-right">
                  +{alloc}% = {base + alloc}%
                </span>
              </div>
            );
          })}

          <h3 className="font-heading text-lg mt-4 mb-2">Combat Style</h3>
          {cultureDef.combatStyles?.map(cs => (
            <label key={cs} className="inline-flex items-center mr-4 mb-2">
              <input
                type="radio"
                name="combat"
                className="mr-1"
                checked={cCombSel === cs}
                onChange={() => {
                  setCCombSel(cs);
                  setCCombAlloc(SKILL_MIN);
                }}
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
                  if (v - cCombAlloc <= CULT_POOL - totalCulturalAlloc + cCombAlloc) {
                    setCCombAlloc(v);
                  }
                }}
              />
              <span className="w-24 text-right">
                +{cCombAlloc}% = {baseProfessional[cCombSel] + cCombAlloc}%
              </span>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button className="btn btn-primary" onClick={() => setPhase(2)}>
              Next: Career
            </button>
          </div>
        </StepWrapper>
      )}

      {/* Phase 2: Career Skills */}
      {phase === 2 && (
        <StepWrapper title="Career Skills">
          <p>Points left: {CAREER_POOL - totalCareerAlloc}</p>

          <h3 className="font-heading text-lg mb-2">Standard Skills</h3>
          {careerDef.standardSkills?.map(s => {
            const base = (baseStandard[s] || 0) + (cStdAlloc[s] ?? SKILL_MIN);
            const alloc = rStdAlloc[s] ?? 0;
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
                  onChange={handleRange(
                    rStdAlloc,
                    setRStdAlloc,
                    s,
                    SKILL_MAX,
                    CAREER_POOL - totalCareerAlloc + alloc,
                    0
                  )}
                />
                <span className="w-24 text-right">
                  +{alloc}% = {base + alloc}%
                </span>
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
            const base = (baseProfessional[s] || 0) + (cProfAlloc[s] ?? SKILL_MIN);
            const alloc = rProfAlloc[s] ?? 0;
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
                  onChange={handleRange(
                    rProfAlloc,
                    setRProfAlloc,
                    s,
                    SKILL_MAX,
                    CAREER_POOL - totalCareerAlloc + alloc,
                    0
                  )}
                />
                <span className="w-24 text-right">
                  +{alloc}% = {base + alloc}%
                </span>
              </div>
            );
          })}

          <div className="flex justify-between mt-4">
            <button className="btn btn-secondary" onClick={() => setPhase(1)}>
              Back
            </button>
            <button className="btn btn-primary" onClick={() => setPhase(3)}>
              Next: Bonus
            </button>
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
              {[...Object.keys(baseStandard), ...Object.keys(baseProfessional)].map(
                sk => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                )
              )}
            </select>
          </div>

          {[...bonusSkills].map(s => {
            const alloc = bonusAlloc[s] || 0;
            const pool = initialBonusPool - sum(bonusAlloc) + alloc;
            const base =
              (baseStandard[s] || 0) +
              (cStdAlloc[s] ?? SKILL_MIN) +
              (baseProfessional[s] || 0) +
              (cProfAlloc[s] ?? SKILL_MIN) +
              (s === cCombSel ? cCombAlloc : 0) +
              (rStdAlloc[s] ?? 0) +
              (rProfAlloc[s] ?? 0);
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
                  onChange={handleRange(
                    bonusAlloc,
                    setBonusAlloc,
                    s,
                    maxInc,
                    pool,
                    0
                  )}
                />
                <span className="w-24 text-right">
                  +{alloc}% = {base + alloc}%
                </span>
              </div>
            );
          })}

          <div className="flex justify-between mt-4">
            <button className="btn btn-secondary" onClick={() => setPhase(2)}>
              Back
            </button>
            <button className="btn btn-primary" onClick={() => setPhase(4)}>
              Finish
            </button>
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
              .filter(n => !['Brawn', 'Endurance', 'Evade', 'Willpower'].includes(n))
              .map(n => (
                <li key={n}>
                  {n}: {character.skills[n]}%
                </li>
              ))}
          </ul>
          <h3 className="font-semibold mb-2">Resistances</h3>
          <ul className="list-disc list-inside mb-4">
            {['Brawn', 'Endurance', 'Evade', 'Willpower']
              .filter(n => character.skills[n] != null)
              .map(n => (
                <li key={n}>
                  {n}: {character.skills[n]}%
                </li>
              ))}
          </ul>
          <h3 className="font-semibold mb-2">Combat Skills</h3>
          <ul className="list-disc list-inside mb-4">
            {character.selectedSkills?.combat?.map(n => (
              <li key={n}>
                {n}: {character.skills[n]}%
              </li>
            ))}
          </ul>
          <h3 className="font-semibold mb-2">Professional Skills</h3>
          <ul className="list-disc list-inside mb-4">
            {character.selectedSkills?.professional?.map(n => (
              <li key={n}>
                {n}: {character.skills[n]}%
              </li>
            ))}
          </ul>
          <h3 className="font-semibold mb-2"></h3>
          <ul className="list-disc list-inside">
            {[
              ...(skillsData.folkMagic || []).map(s => s.name),
              ...(skillsData.animism || []).map(s => s.name),
              ...(skillsData.mysticism || []).map(s => s.name),
              ...(skillsData.sorcery || []).map(s => s.name),
              ...(skillsData.theism || []).map(s => s.name),
            ]
              .filter(n => character.skills[n] != null)
              .map(n => (
                <li key={n}>
                  {n}: {character.skills[n]}%
                </li>
              ))}
          </ul>
        </StepWrapper>
      )}
    </>
  );
}
