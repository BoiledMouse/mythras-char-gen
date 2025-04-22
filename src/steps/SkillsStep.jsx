// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';
import StepWrapper from '../components/StepWrapper';

export default function SkillsStep({ formData, onChange }) {
  // 0) Pull age, culture, career & attributes directly from the wizard's formData
  const {
    age = 0,
    culture: cultKey = '',
    career: careerKey = '',
    STR = 0,
    DEX = 0,
    CON = 0,
    SIZ = 0,
    INT = 0,
    POW = 0,
    CHA = 0,
  } = formData;

  const cultureDef = cultures[cultKey] || {};
  const careerDef  = careers[careerKey] || {};

  // 1) Age buckets (from the PDF)
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10, rolls: 0 },
    { max: 27, bonus: 150, maxInc: 15, rolls: 1 },
    { max: 43, bonus: 200, maxInc: 20, rolls: 2 },
    { max: 64, bonus: 250, maxInc: 25, rolls: 3 },
    { max: Infinity, bonus: 300, maxInc: 30, rolls: 4 },
  ];
  const { bonus: initialPool, maxInc } = ageBuckets.find(b => age <= b.max);

  // 2) Compute base skill% helper
  const attrs = { STR, DEX, CON, SIZ, INT, POW, CHA };
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i + 1];
      const v = /^\d+$/.test(tok) ? +tok : +(attrs[tok] || 0);
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // 3) Build base skill tables
  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let b = computeBase(base);
    if (["Customs", "Native Tongue"].includes(name)) b += 40;
    baseStandard[name] = b;
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfessional[name] = computeBase(base);
  });

  // 4) Gather which skills apply
  const cultStd  = cultureDef.standardSkills    || [];
  const cultProf = cultureDef.professionalSkills || [];
  const carStd   = careerDef.standardSkills     || [];
  const carProf  = careerDef.professionalSkills  || [];

  // 5) Phase state and allocations
  const [phase, setPhase] = useState(1);

  const CULT_POINTS  = initialPool;
  const CAREER_POINTS = initialPool;
  // bonus uses same initialPool
  const [cultAlloc,  setCultAlloc]  = useState({});
  const [carAlloc,   setCarAlloc]   = useState({});
  const [bonusSel,   setBonusSel]   = useState([]);
  const [bonusAlloc, setBonusAlloc] = useState({});

  const sum = o => Object.values(o).reduce((a,b)=>(a+b||0),0);

  // 6) Proceed phases and persist when phase > 3
  useEffect(() => {
    if (phase > 3) {
      const final = { ...baseStandard, ...baseProfessional };
      // cultural
      cultStd.forEach(s => final[s] += cultAlloc[s] || 0);
      cultProf.forEach(s => final[s] += cultAlloc[s] || 0);
      // career
      carStd.forEach(s => final[s] += carAlloc[s] || 0);
      carProf.forEach(s => final[s] += carAlloc[s] || 0);
      // bonus
      bonusSel.forEach(s => final[s] += bonusAlloc[s] || 0);
      // write back into formData
      onChange('skills', final);
    }
  }, [phase]);

  // 7) Helper to clamp & snap slider
  const handleAlloc = (setter, allocObj, key, poolLeft) => e => {
    let v = parseInt(e.target.value, 10) || 0;
    if (v > 0 && v < 5) v = 0;                   // snap 1–4 → 0
    v = Math.min(maxInc, Math.max(0, v));       // clamp [0..maxInc]
    const prev = allocObj[key] || 0, delta = v - prev;
    if (delta <= poolLeft) {
      setter({ ...allocObj, [key]: v });
    }
  };

  // Compute remaining points for each pool
  const leftCult  = CULT_POINTS  - sum(cultStd.concat(cultProf).map(s => cultAlloc[s]||0));
  const leftCareer= CAREER_POINTS - sum(carStd.concat(carProf).map(s => carAlloc[s]||0));
  const leftBonus = initialPool   - sum(bonusAlloc);

  return (
    <StepWrapper title="Skills">
      <p>
        Age: <strong>{age}</strong> ⇒&nbsp;
        Cultural Pool: <strong>{CULT_POINTS}</strong>,&nbsp;
        Career Pool: <strong>{CAREER_POINTS}</strong>,&nbsp;
        Bonus Pool: <strong>{initialPool}</strong>,&nbsp;
        Max per skill: <strong>+{maxInc}</strong>
      </p>

      {/* Step 1: Cultural */}
      {phase === 1 && (
        <>
          <h3 className="italic">Step 1: Cultural Skills</h3>
          <p>Points Left: <strong>{leftCult}</strong></p>
          {[...cultStd, ...cultProf].map(skill => {
            const base = baseStandard[skill] ?? baseProfessional[skill] ?? 0;
            const extra = cultAlloc[skill] || 0;
            return (
              <div key={skill} className="flex items-center space-x-4 mb-3">
                <div className="flex-1">
                  <label className="block font-medium">
                    {skill} (Base {base}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxInc}
                    step={1}
                    value={extra}
                    onChange={handleAlloc(setCultAlloc, cultAlloc, skill, leftCult)}
                    className="w-full"
                  />
                </div>
                <div className="w-12 text-right">+{extra}%</div>
              </div>
            );
          })}
          <button
            className="mt-4 px-4 py-2 bg-gold"
            disabled={leftCult > 0}
            onClick={() => setPhase(2)}
          >Next: Career Skills</button>
        </>
      )}

      {/* Step 2: Career */}
      {phase === 2 && (
        <>
          <h3 className="italic">Step 2: Career Skills</h3>
          <p>Points Left: <strong>{leftCareer}</strong></p>
          {[...carStd, ...carProf].map(skill => {
            const base = baseStandard[skill] ?? baseProfessional[skill] ?? 0;
            const extra = carAlloc[skill] || 0;
            return (
              <div key={skill} className="flex items-center space-x-4 mb-3">
                <div className="flex-1">
                  <label className="block font-medium">
                    {skill} (Base {base}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxInc}
                    step={1}
                    value={extra}
                    onChange={handleAlloc(setCarAlloc, carAlloc, skill, leftCareer)}
                    className="w-full"
                  />
                </div>
                <div className="w-12 text-right">+{extra}%</div>
              </div>
            );
          })}
          <div className="flex justify-between">
            <button
              className="px-4 py-2 bg-gray-300"
              onClick={() => setPhase(1)}
            >Back</button>
            <button
              className="px-4 py-2 bg-gold"
              disabled={leftCareer > 0}
              onClick={() => setPhase(3)}
            >Next: Bonus Skills</button>
          </div>
        </>
      )}

      {/* Step 3: Bonus */}
      {phase === 3 && (
        <>
          <h3 className="italic">Step 3: Bonus Skills</h3>
          <p>Points Left: <strong>{leftBonus}</strong></p>
          {/* pick new hobby */}
          <label className="block font-medium mb-2">Add Hobby Skill</label>
          <select
            className="border rounded p-2 mb-4 w-full"
            onChange={e => {
              const s = e.target.value;
              if (s && !bonusSel.includes(s)) {
                setBonusSel(sel => [...sel, s]);
              }
            }}
          >
            <option value="">— pick a skill —</option>
            {[...cultStd, ...cultProf, ...carStd, ...carProf]
              .filter((v,i,a) => v && a.indexOf(v)===i)
              .map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {bonusSel.map(skill => {
            const base = baseStandard[skill] ?? baseProfessional[skill] ?? 0;
            const extra = bonusAlloc[skill] || 0;
            return (
              <div key={skill} className="flex items-center space-x-4 mb-3">
                <div className="flex-1">
                  <label className="block font-medium">
                    {skill} (Base {base}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxInc}
                    step={1}
                    value={extra}
                    onChange={handleAlloc(setBonusAlloc, bonusAlloc, skill, leftBonus)}
                    className="w-full"
                  />
                </div>
                <div className="w-12 text-right">+{extra}%</div>
              </div>
            );
          })}

          <div className="flex justify-between">
            <button
              className="px-4 py-2 bg-gray-300"
              onClick={() => setPhase(2)}
            >Back</button>
            <button
              className="px-4 py-2 bg-green-600 text-white"
              disabled={leftBonus > 0}
              onClick={() => setPhase(4)}
            >Finish</button>
          </div>
        </>
      )}

      {phase > 3 && (
        <p className="mt-4 text-center text-green-700">
          ✔ Skills assigned! Proceed to Equipment.
        </p>
      )}
    </StepWrapper>
  );
}
