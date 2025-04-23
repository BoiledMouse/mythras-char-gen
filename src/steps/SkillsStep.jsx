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

  // Age-based pools
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10 },
    { max: 27, bonus: 150, maxInc: 15 },
    { max: 43, bonus: 200, maxInc: 20 },
    { max: 64, bonus: 250, maxInc: 25 },
    { max: Infinity, bonus: 300, maxInc: 30 },
  ];
  const { bonus: initialBonusPool, maxInc } = ageBuckets.find(b => age <= b.max);

  const CULT_POOL = 100;
  const CAREER_POOL = 100;

  const attrs = { STR, DEX, INT, CON, POW, CHA, SIZ };
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i + 1];
      const v = /^\d+$/.test(tok) ? +tok : attrs[tok] || 0;
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // Base values
  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let b = computeBase(base);
    if (name === 'Customs' || name === 'Native Tongue') b += 40;
    baseStandard[name] = b;
  });
  const baseProfGeneric = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfGeneric[name] = computeBase(base);
  });
  const profSet = new Set([
    ...skillsData.professional.map(s => s.name),
    ...(cultureDef.professionalSkills || []),
    ...(careerDef.professionalSkills || []),
  ]);
  const profNames = Array.from(profSet);
  const baseProfessional = {};
  profNames.forEach(name => {
    const root = name.includes('(') ? name.split('(')[0].trim() : name;
    const val = baseProfGeneric[root] || 0;
    baseProfessional[name] = root === 'Language' && !name.includes('(') ? val + 40 : val;
  });
  (cultureDef.combatStyles || []).forEach(cs => {
    baseProfessional[cs] = STR + DEX;
  });

  // State per phase
  const [phase, setPhase] = useState(1);
  const [cStdAlloc, setCStdAlloc] = useState({});
  const [cProfSel, setCProfSel] = useState([]);
  const [cProfAlloc, setCProfAlloc] = useState({});
  const [cCombSel, setCCombSel] = useState('');
  const [cCombAlloc, setCCombAlloc] = useState(0);

  const [rStdAlloc, setRStdAlloc] = useState({});
  const [rProfSel, setRProfSel] = useState([]);
  const [rProfAlloc, setRProfAlloc] = useState({});

  const [bonusAlloc, setBonusAlloc] = useState({});
  const [bonusLeft, setBonusLeft] = useState(initialBonusPool);

  const sum = obj => Object.values(obj).reduce((s, v) => s + (v || 0), 0);

  useEffect(() => {
    if (phase === 4) {
      const final = { ...baseStandard, ...baseProfessional };
      cultureDef.standardSkills?.forEach(s => final[s] += cStdAlloc[s] || 0);
      cProfSel.forEach(s => final[s] += cProfAlloc[s] || 0);
      if (cCombSel) final[cCombSel] += cCombAlloc;
      careerDef.standardSkills?.forEach(s => final[s] += rStdAlloc[s] || 0);
      rProfSel.forEach(s => final[s] += rProfAlloc[s] || 0);
      Object.entries(bonusAlloc).forEach(([s, v]) => final[s] += v);
      updateCharacter({
        skills: final,
        selectedSkills: {
          standard: [...(cultureDef.standardSkills || []), ...(careerDef.standardSkills || [])],
          professional: [...cProfSel, ...rProfSel, ...(cCombSel ? [cCombSel] : [])],
          combat: cCombSel ? [cCombSel] : []
        }
      });
    }
  }, [phase]);

  const handleRange = (alloc, setAlloc, skill, limit, poolLeft) => e => {
    let v = parseInt(e.target.value, 10) || 0;
    v = Math.max(0, Math.min(limit, v));
    const prev = alloc[skill] || 0;
    const delta = v - prev;
    if (delta <= poolLeft) setAlloc({ ...alloc, [skill]: v });
  };

  return (
    <>
      {phase === 1 && (
        <StepWrapper title="Cultural Skills">
          <div className="mb-4">
            Points left: {CULT_POOL - sum(cStdAlloc) - sum(cProfAlloc) - cCombAlloc}
          </div>
          <h3 className="font-heading text-lg mb-2">Standard</h3>
          {cultureDef.standardSkills?.map(s => {
            const base = baseStandard[s] || 0;
            const alloc = cStdAlloc[s] || 0;
            const total = base + alloc;
            return (
              <div key={s} className="flex items-center mb-2">
                <div className="w-32">{s}</div>
                <div className="w-32 text-right mr-2">{base}% + {alloc}% = {total}%</div>
                <input
                  type="range"
                  min={0}
                  max={maxInc}
                  value={alloc}
                  onChange={handleRange(cStdAlloc, setCStdAlloc, s, maxInc, CULT_POOL - sum(cStdAlloc) - sum(cProfAlloc) - cCombAlloc)}
                  className="flex-1"
                />
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
                onChange={() => setCProfSel(sel => sel.includes(s) ? sel.filter(x => x !== s) : sel.length < 3 ? [...sel, s] : sel)}
              />
              {s}
            </label>
          ))}
          {cProfSel.map(s => {
            const base = baseProfessional[s] || 0;
            const alloc = cProfAlloc[s] || 0;
            const total = base + alloc;
            return (
              <div key={s} className="flex items-center mb-2">
                <div className="w-32">{s}</div>
                <div className="w-32 text-right mr-2">{base}% + {alloc}% = {total}%</div>
                <input
                  type="range"
                  min={0}
                  max={maxInc}
                  value={alloc}
                  onChange={handleRange(cProfAlloc, setCProfAlloc, s, maxInc, CULT_POOL - sum(cStdAlloc) - sum(cProfAlloc) - cCombAlloc)}
                  className="flex-1"
                />
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
                onChange={() => setCCombSel(cs)}
              />
              {cs}
            </label>
          ))}
          {cCombSel && (
            <div className="flex items-center mb-2">
              <div className="w-32">{cCombSel}</div>
              <div className="w-32 text-right mr-2">{baseProfessional[cCombSel]}% + {cCombAlloc}% = {baseProfessional[cCombSel] + cCombAlloc}%</div>
              <input
                type="range"
                min={0}
                max={maxInc}
                value={cCombAlloc}
                onChange={e => {
                  const v = Math.min(maxInc, Math.max(0, +e.target.value || 0));
                  const pool = CULT_POOL - sum(cStdAlloc) - sum(cProfAlloc) - cCombAlloc;
                  if (v - cCombAlloc <= pool) setCCombAlloc(v);
                }}
                className="flex-1"
              />
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button className="btn btn-primary" onClick={() => setPhase(2)}>
              Next: Career
            </button>
          </div>
        </StepWrapper>
      )}

      {phase === 2 && (
        <StepWrapper title="Career Skills">
          <div className="mb-4">Points left: {CAREER_POOL - sum(rStdAlloc) - sum(rProfAlloc)}</div>
          <h3 className="font-heading text-lg mb-2">Standard</h3>
          {careerDef.standardSkills?.map(s => {
            const base = (baseStandard[s] || 0) + (cStdAlloc[s] || 0);
            const alloc = rStdAlloc[s] || 0;
            const total = base + alloc;
            return (
              <div key={s} className="flex items-center mb-2">
                <div className="w-32">{s}</div>
                <div className="w-32 text-right mr-2">{base}% + {alloc}% = {total}%</div>
                <input
                  type="range"
                  min={0}
                  max={maxInc}
                  value={alloc}
                  onChange={handleRange(rStdAlloc, setRStdAlloc, s, maxInc, CAREER_POOL - sum(rStdAlloc) - sum(rProfAlloc))}
                  className="flex-1"
                />
