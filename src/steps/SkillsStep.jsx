// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';
import StepWrapper from '../components/StepWrapper';

export function SkillsStep() {
  const { character, updateCharacter } = useCharacter();
  const { culture: cultKey, career: careerKey, age = 0 } = character;
  const cultureDef = cultures[cultKey] || {};
  const careerDef  = careers[careerKey] || {};

  // 1) Age buckets
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10, rolls: 0 },
    { max: 27, bonus: 150, maxInc: 15, rolls: 1 },
    { max: 43, bonus: 200, maxInc: 20, rolls: 2 },
    { max: 64, bonus: 250, maxInc: 25, rolls: 3 },
    { max: Infinity, bonus: 300, maxInc: 30, rolls: 4 },
  ];
  const bucket = ageBuckets.find(b => age <= b.max) || ageBuckets[0];
  const { bonus: initialPool, maxInc } = bucket;

  // 2) Compute base skill % from attribute formula
  const attrs = character;
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i + 1];
      const v = /^\d+$/.test(tok) ? parseInt(tok, 10) : parseInt(attrs[tok] || 0, 10);
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // 3) Build base‐value tables
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

  // 4) Which skills apply?
  const cultStd  = cultureDef.standardSkills     || [];
  const cultProf = cultureDef.professionalSkills || [];
  const carStd   = careerDef.standardSkills      || [];
  const carProf  = careerDef.professionalSkills  || [];

  // 5) Local allocation state
  const [poolLeft,    setPoolLeft   ] = useState(initialPool);
  const [bonusSel,    setBonusSel   ] = useState([]);
  const [bonusAlloc,  setBonusAlloc ] = useState({});

  // 6) When pool hits zero, commit final skills
  useEffect(() => {
    if (poolLeft === 0) {
      const finalSkills = { ...baseStandard, ...baseProfessional };
      // no cultural/career sliders here—just hobby bonuses
      bonusSel.forEach(s => {
        finalSkills[s] = (finalSkills[s] || 0) + (bonusAlloc[s] || 0);
      });
      updateCharacter({ skills: finalSkills });
    }
  }, [poolLeft]);

  // 7) Slider handler for any allocation map
  const handleAlloc = (setter, allocObj, key) => e => {
    let v = parseInt(e.target.value, 10) || 0;
    if (v > 0 && v < 5) v = 0;                // snap any 1–4 back to 0
    v = Math.min(maxInc, Math.max(0, v));     // clamp [0..maxInc]
    const prev = allocObj[key] || 0;
    const delta = v - prev;
    if (delta <= poolLeft) {
      setter({ ...allocObj, [key]: v });
      setPoolLeft(pl => pl - delta);
    }
  };

  return (
    <StepWrapper title="Skills">
      <p>
        Age: <strong>{age}</strong> ⇒&nbsp;
        Starting Pool: <strong>{initialPool}</strong> pts,&nbsp;
        Max per skill: <strong>+{maxInc}</strong>
      </p>
      <p>Points Remaining: <strong>{poolLeft}</strong></p>

      {/* 8) Hobby/Bonus skill sliders */}
      <div className="space-y-4">
        {bonusSel.map(skill => {
          const base = baseStandard[skill] ?? baseProfessional[skill] ?? 0;
          const extra = bonusAlloc[skill] || 0;
          return (
            <div key={skill} className="flex items-center space-x-4">
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
                  onChange={handleAlloc(setBonusAlloc, bonusAlloc, skill)}
                  className="w-full"
                />
              </div>
              <div className="w-16 text-right">+{extra}%</div>
            </div>
          );
        })}
      </div>

      {/* 9) Add a new hobby skill */}
      <div className="mt-6">
        <label className="block mb-1 font-medium">Add Hobby Skill:</label>
        <select
          className="w-full border rounded p-2"
          onChange={e => {
            const s = e.target.value;
            if (s && !bonusSel.includes(s)) {
              setBonusSel(sel => [...sel, s]);
            }
          }}
        >
          <option value="">— pick a skill —</option>
          {[...cultStd, ...cultProf, ...carStd, ...carProf]
            .filter((v,i,a)=>v && a.indexOf(v)===i)
            .map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </StepWrapper>
  );
}
