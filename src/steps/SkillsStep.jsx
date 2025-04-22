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
  const careerDef  = careers[careerKey]  || {};

  // 1) Age buckets
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10, rolls: 0 },
    { max: 27, bonus: 150, maxInc: 15, rolls: 1 },
    { max: 43, bonus: 200, maxInc: 20, rolls: 2 },
    { max: 64, bonus: 250, maxInc: 25, rolls: 3 },
    { max: Infinity, bonus: 300, maxInc: 30, rolls: 4 },
  ];
  const bucket = ageBuckets.find(b => age <= b.max) || ageBuckets[0];
  const initialCultural = bucket.bonus;
  const initialCareer   = bucket.bonus;
  const initialBonus    = bucket.bonus;
  const maxInc          = bucket.maxInc;

  // 2) Helpers to compute base skill%
  const attrs = character;
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]]||0,10);
    for (let i = 1; i < parts.length; i += 2) {
      const op  = parts[i], tok = parts[i+1];
      const v   = /^\d+$/.test(tok) ? +tok : +attrs[tok]||0;
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // 3) Build base tables
  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let b = computeBase(base);
    if (["Customs","Native Tongue"].includes(name)) b += 40;
    baseStandard[name] = b;
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfessional[name] = computeBase(base);
  });

  // 4) Which skills apply?
  const cultStd  = cultureDef.standardSkills    || [];
  const cultProf = cultureDef.professionalSkills || [];
  const carStd   = careerDef.standardSkills     || [];
  const carProf  = careerDef.professionalSkills  || [];

  // 5) Allocation state
  const [cultLeft,  setCultLeft]  = useState(initialCultural);
  const [stdAlloc,  setStdAlloc]  = useState({});
  const [profAlloc, setProfAlloc] = useState({});
  const [carLeft,   setCarLeft]   = useState(initialCareer);
  const [bonusLeft, setBonusLeft] = useState(initialBonus);
  const [bonusSel,  setBonusSel]  = useState([]);
  const [bonusAlloc,setBonusAlloc]= useState({});

  const clamp = v => (v > 0 && v < 5 ? 0 : Math.min(maxInc, Math.max(0, v)));

  // 6) Persist when all pools exhausted
  useEffect(() => {
    if (cultLeft === 0 && carLeft === 0 && bonusLeft === 0) {
      const final = { ...baseStandard, ...baseProfessional };
      // cultural alloc
      cultStd.forEach(s => final[s] += stdAlloc[s] || 0);
      cultProf.forEach(s => final[s] += profAlloc[s] || 0);
      // career alloc
      carStd.forEach(s => final[s] += stdAlloc[s] || 0);
      carProf.forEach(s => final[s] += profAlloc[s] || 0);
      // bonus alloc
      bonusSel.forEach(s => final[s] += bonusAlloc[s] || 0);
      updateCharacter({ skills: final });
    }
  }, [cultLeft, carLeft, bonusLeft]);

  // 7) Allocation handlers
  const handleAlloc = (setter, left, setLeft, allocObj, key) => e => {
    const raw = parseInt(e.target.value, 10) || 0;
    const v   = clamp(raw);
    const prev= allocObj[key] || 0;
    const delta = v - prev;
    if (delta <= left) {
      setter({ ...allocObj, [key]: v });
      setLeft(l => l - delta);
    }
  };

  return (
    <StepWrapper title="Skills">
      <p>
        Age: <strong>{age}</strong> ⇒  
        Cultural Pool: <strong>{initialCultural}</strong>,  
        Career Pool: <strong>{initialCareer}</strong>,  
        Bonus Pool: <strong>{initialBonus}</strong>,  
        Max per skill: <strong>+{maxInc}</strong>
      </p>
      <p>
        Cultural points left: <strong>{cultLeft}</strong><br/>
        Career points left:  <strong>{carLeft}</strong><br/>
        Bonus points left:  <strong>{bonusLeft}</strong>
      </p>

      {/* Step 1: Cultural */}
      <h3 className="text-lg font-semibold">Step 1: Cultural Skills</h3>
      {cultStd.map(s => (
        <div key={s} className="flex items-center space-x-4 mb-2">
          <div className="flex-1">
            <label className="block">{s} (Base {baseStandard[s] || 0}%)</label>
            <input
              type="range"
              min={0}
              max={maxInc}
              step={1}
              value={stdAlloc[s] || 0}
              onChange={handleAlloc(setStdAlloc, cultLeft, setCultLeft, stdAlloc, s)}
              className="w-full"
            />
          </div>
          <div className="w-12 text-right">+{stdAlloc[s]||0}%</div>
        </div>
      ))}
      {cultProf.map(s => (
        <div key={s} className="flex items-center space-x-4 mb-2">
          <div className="flex-1">
            <label className="block italic">{s} (Base {baseProfessional[s] || 0}%)</label>
            <input
              type="range"
              min={0}
              max={maxInc}
              step={1}
              value={profAlloc[s] || 0}
              onChange={handleAlloc(setProfAlloc, cultLeft, setCultLeft, profAlloc, s)}
              className="w-full"
            />
          </div>
          <div className="w-12 text-right">+{profAlloc[s]||0}%</div>
        </div>
      ))}

      {/* Step 2: Career */}
      <h3 className="text-lg font-semibold mt-6">Step 2: Career Skills</h3>
      {carStd.map(s => (
        <div key={s} className="flex items-center space-x-4 mb-2">
          <div className="flex-1">
            <label className="block">{s} (Base {baseStandard[s] || 0}%)</label>
            <input
              type="range"
              min={0}
              max={maxInc}
              step={1}
              value={stdAlloc[s] || 0}
              onChange={handleAlloc(setStdAlloc, carLeft, setCarLeft, stdAlloc, s)}
              className="w-full"
            />
          </div>
          <div className="w-12 text-right">+{stdAlloc[s]||0}%</div>
        </div>
      ))}
      {carProf.map(s => (
        <div key={s} className="flex items-center space-x-4 mb-2">
          <div className="flex-1">
            <label className="block italic">{s} (Base {baseProfessional[s] || 0}%)</label>
            <input
              type="range"
              min={0}
              max={maxInc}
              step={1}
              value={profAlloc[s] || 0}
              onChange={handleAlloc(setProfAlloc, carLeft, setCarLeft, profAlloc, s)}
              className="w-full"
            />
          </div>
          <div className="w-12 text-right">+{profAlloc[s]||0}%</div>
        </div>
      ))}

      {/* Step 3: Bonus */}
      <h3 className="text-lg font-semibold mt-6">Step 3: Bonus / Hobby Skills</h3>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Add Hobby Skill:</label>
        <select
          className="w-full border rounded p-2"
          onChange={e => {
            const s = e.target.value;
            if (s && !bonusSel.includes(s)) setBonusSel(sel => [...sel, s]);
          }}
        >
          <option value="">-- pick a skill --</option>
          {[...cultStd, ...cultProf, ...carStd, ...carProf]
            .filter((v,i,a)=>v && a.indexOf(v)===i)
            .map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {bonusSel.map(s => (
        <div key={s} className="flex items-center space-x-4 mb-2">
          <div className="flex-1">
            <label className="block">{s} (Base { (baseStandard[s]||baseProfessional[s]||0) }%)</label>
            <input
              type="range"
              min={0}
              max={maxInc}
              step={1}
              value={bonusAlloc[s] || 0}
              onChange={handleAlloc(setBonusAlloc, bonusLeft, setBonusLeft, bonusAlloc, s)}
              className="w-full"
            />
          </div>
          <div className="w-12 text-right">+{bonusAlloc[s]||0}%</div>
        </div>
      ))}

      {/* Next button */}
      <button
        onClick={() => updateCharacter({ step: 'equipment' })}
        disabled={cultLeft !== 0 || carLeft !== 0 || bonusLeft !== 0}
        className="mt-6 px-4 py-2 bg-gold text-white rounded"
      >
        Next: Equipment
      </button>
    </StepWrapper>
  );
}
