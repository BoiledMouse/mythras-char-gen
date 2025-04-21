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
  const cultureDef  = cultures[cultKey]   || {};
  const careerDef   = careers[careerKey]  || {};

  // 1) Age buckets
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10, rolls: 0 },
    { max: 27, bonus: 150, maxInc: 15, rolls: 1 },
    { max: 43, bonus: 200, maxInc: 20, rolls: 2 },
    { max: 64, bonus: 250, maxInc: 25, rolls: 3 },
    { max: Infinity, bonus: 300, maxInc: 30, rolls: 4 },
  ];
  const { bonus: initialPool, maxInc } = ageBuckets.find(b => age <= b.max)!;

  // 2) Helpers to compute base skill%
  const attrs = character;
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]]||0,10);
    for(let i=1;i<parts.length;i+=2){
      const op=parts[i], tok=parts[i+1];
      const v = /^\d+$/.test(tok) ? +tok : +attrs[tok]||0;
      val = op==='x'? val*v : val+v;
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
  const cultStd   = cultureDef.standardSkills   || [];
  const cultProf  = cultureDef.professionalSkills|| [];
  const carStd    = careerDef.standardSkills    || [];
  const carProf   = careerDef.professionalSkills || [];

  // 5) Allocation state
  const [poolLeft,    setPoolLeft  ] = useState(initialPool);
  const [stdAlloc,    setStdAlloc  ] = useState({});
  const [profAlloc,   setProfAlloc ] = useState({});
  const [combatAlloc, setCombatAlloc] = useState({});
  const [bonusSel,    setBonusSel  ] = useState([]);
  const [bonusAlloc,  setBonusAlloc] = useState({});

  const sum = o => Object.values(o).reduce((a,b)=>(a+b||0),0);

  // 6) Persist final skills once pool=0
  useEffect(()=>{
    if (poolLeft === 0) {
      const final = { ...baseStandard, ...baseProfessional };
      [...cultStd].forEach(s=> final[s]+= stdAlloc[s]||0);
      [...cultProf].forEach(s=> final[s]+= profAlloc[s]||0);
      Object.entries(combatAlloc).forEach(([s,v])=> final[s]+=v);
      [...carStd].forEach(s=> final[s]+= stdAlloc[s]||0);
      [...carProf].forEach(s=> final[s]+= profAlloc[s]||0);
      bonusSel.forEach(s=> final[s]+= bonusAlloc[s]||0);
      updateCharacter({ skills: final });
    }
  }, [poolLeft]);

  // 7) Slider handler
  const handleAlloc = (setter, allocObj, key) => e => {
    let v = parseInt(e.target.value,10)||0;
    if (v>0 && v<5) v = 0;                // snap 1–4 → 0
    v = Math.min(maxInc, Math.max(0, v));// clamp [0..maxInc]
    const prev = allocObj[key]||0, delta = v - prev;
    if (delta <= poolLeft) {
      setter({ ...allocObj, [key]: v });
      setPoolLeft(pl => pl - delta);
    }
  };

  return (
    <StepWrapper title="Skills">
      <p>
        Age: <strong>{age}</strong> ⇒  
        Pool: <strong>{initialPool}</strong> pts,  
        Max per skill: <strong>+{maxInc}</strong>  
      </p>
      <p>Remaining points: <strong>{poolLeft}</strong></p>

      {/* Bonus Skill Sliders */}
      <div className="space-y-4">
        {bonusSel.map(skill => {
          const base = baseStandard[skill] || baseProfessional[skill] || 0;
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

      {/* Add a new hobby skill */}
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
          <option value="">-- pick a skill --</option>
          {[...cultStd, ...cultProf, ...carStd, ...carProf]
            .filter((v,i,a)=>v && a.indexOf(v)===i)
            .map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </StepWrapper>
  );
}
