// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import StepWrapper from '../components/StepWrapper';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';

export function SkillsStep({ formData, onChange }) {
  // pull culture, career and age from the wizard's formData
  const { culture: cultKey = '', career: careerKey = '', age: ageRaw = '' } = formData;
  const age = parseInt(ageRaw, 10) || 0;
  const cultureDef = cultures[cultKey]  || {};
  const careerDef  = careers[careerKey] || {};

  // Age buckets for bonus pool & max per skill
  const ageBuckets = [
    { max: 16,      bonus: 100, maxInc: 10 },
    { max: 27,      bonus: 150, maxInc: 15 },
    { max: 43,      bonus: 200, maxInc: 20 },
    { max: 64,      bonus: 250, maxInc: 25 },
    { max: Infinity, bonus: 300, maxInc: 30 },
  ];
  const { bonus: initialBonus, maxInc } = ageBuckets.find(b => age <= b.max);

  // Compute base skill% from attribute expressions (e.g. "STR+DEX")
  const attrs = formData;
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i+1];
      const v = /^\d+$/.test(tok) ? +tok : +attrs[tok] || 0;
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // Build base tables
  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let b = computeBase(base);
    if (['Customs','Native Tongue'].includes(name)) b += 40;
    baseStandard[name] = b;
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfessional[name] = computeBase(base);
  });

  // Skills lists from culture & career definitions
  const cultStd    = cultureDef.standardSkills     || [];
  const cultProf   = cultureDef.professionalSkills || [];
  const cultCombat = cultureDef.combatStyles       || [];
  const carStd     = careerDef.standardSkills      || [];
  const carProf    = careerDef.professionalSkills  || [];

  // Hard‑coded cultural & career pools
  const CULT_POOL   = 100;
  const CAREER_POOL = 100;

  // State: pools, allocations and current phase
  const [cultLeft,   setCultLeft  ] = useState(CULT_POOL);
  const [careLeft,   setCareLeft  ] = useState(CAREER_POOL);
  const [bonusLeft,  setBonusLeft ] = useState(initialBonus);

  const [cultStdAlloc,    setCultStdAlloc   ] = useState({});
  const [cultProfAlloc,   setCultProfAlloc  ] = useState({});
  const [cultCombatAlloc, setCultCombatAlloc] = useState({});
  const [carStdAlloc,     setCarStdAlloc    ] = useState({});
  const [carProfAlloc,    setCarProfAlloc   ] = useState({});
  const [bonusSel,        setBonusSel       ] = useState([]);
  const [bonusAlloc,      setBonusAlloc     ] = useState({});
  const [phase,           setPhase          ] = useState(1);

  // sum helper
  const sum = o => Object.values(o).reduce((a,b)=>(a + (b||0)),0);

  // Persist final skills when all pools are spent
  useEffect(() => {
    if (cultLeft===0 && careLeft===0 && bonusLeft===0) {
      const final = { ...baseStandard, ...baseProfessional };
      cultStd.forEach(s => final[s] += cultStdAlloc[s] || 0);
      cultProf.forEach(s => final[s] += cultProfAlloc[s] || 0);
      Object.entries(cultCombatAlloc).forEach(([s,v]) => final[s] += v);
      carStd.forEach(s => final[s] += carStdAlloc[s] || 0);
      carProf.forEach(s => final[s] += carProfAlloc[s] || 0);
      bonusSel.forEach(s => final[s] += bonusAlloc[s] || 0);
      onChange('skills', final);
    }
  }, [cultLeft, careLeft, bonusLeft]);

  // Slider handler (clamped to [0..maxInc], snap 1–4 → 0)
  const handleSlider = (skill, allocObj, setter, poolVal, setPool) => e => {
    let v = parseInt(e.target.value,10)||0;
    if (v>0 && v<5) v = 0;
    v = Math.min(maxInc, Math.max(0, v));
    const prev = allocObj[skill]||0, delta = v - prev;
    if (delta <= poolVal) {
      setter({ ...allocObj, [skill]: v });
      setPool(pl => pl - delta);
    }
  };

  // Checkbox handler for 5% lumps
  const handleCheckbox = (skill, allocObj, setter, poolVal, setPool) => e => {
    const checked = e.target.checked;
    const prev = allocObj[skill] || 0;
    if (checked && poolVal>=5) {
      setter({ ...allocObj, [skill]: 5 });
      setPool(pl => pl - 5);
    } else if (!checked && prev>0) {
      const { [skill]:_, ...rest } = allocObj;
      setter(rest);
      setPool(pl => pl + prev);
    }
  };

  return (
    <StepWrapper title="Skills Allocation">
      <p>
        Age: <strong>{age}</strong> ⇒&nbsp;
        Bonus Pool: <strong>{initialBonus}</strong> pts,&nbsp;
        Max per skill: <strong>+{maxInc}</strong>
      </p>

      {phase===1 && (
        <>
          <h3>Cultural Skills ({CULT_POOL} pts)</h3>
          <p>Points left: <strong>{cultLeft}</strong></p>

          <h4>Standard</h4>
          {cultStd.map(s => (
            <div key={s} className="flex items-center mb-2">
              <div className="w-48">{s} (base {baseStandard[s]}%)</div>
              <input
                type="range" min={0} max={maxInc} step={1}
                value={cultStdAlloc[s]||0}
                onChange={handleSlider(s, cultStdAlloc, setCultStdAlloc, cultLeft, setCultLeft)}
                className="flex-1 mx-2"
              />
              <div className="w-12 text-right">+{cultStdAlloc[s]||0}%</div>
            </div>
          ))}

          <h4>Professional (up to 3 at 5%)</h4>
          {cultProf.map(s => (
            <label key={s} className="inline-flex items-center mr-6">
              <input
                type="checkbox"
                checked={!!cultProfAlloc[s]}
                onChange={handleCheckbox(s, cultProfAlloc, setCultProfAlloc, cultLeft, setCultLeft)}
                className="mr-1"
              />
              {s} (base {baseProfessional[s]}%)
            </label>
          ))}

          <h4>Combat Styles</h4>
          {cultCombat.map(s => (
            <div key={s} className="flex items-center mb-2">
              <div className="w-48">{s}</div>
              <input
                type="range" min={0} max={maxInc} step={1}
                value={cultCombatAlloc[s]||0}
                onChange={handleSlider(s, cultCombatAlloc, setCultCombatAlloc, cultLeft, setCultLeft)}
                className="flex-1 mx-2"
              />
              <div className="w-12 text-right">+{cultCombatAlloc[s]||0}%</div>
            </div>
          ))}

          <button
            onClick={()=>setPhase(2)}
            disabled={cultLeft>0}
            className="btn btn-primary mt-4"
          >
            Next: Career
          </button>
        </>
      )}

      {phase===2 && (
        <>
          <h3>Career Skills ({CAREER_POOL} pts)</h3>
          <p>Points left: <strong>{careLeft}</strong></p>

          <h4>Standard</h4>
          {carStd.map(s => (
            <div key={s} className="flex items-center mb-2">
              <div className="w-48">{s} (base {baseStandard[s]}%)</div>
              <input
                type="range" min={0} max={maxInc} step={1}
                value={carStdAlloc[s]||0}
                onChange={handleSlider(s, carStdAlloc, setCarStdAlloc, careLeft, setCareLeft)}
                className="flex-1 mx-2"
              />
              <div className="w-12 text-right">+{carStdAlloc[s]||0}%</div>
            </div>
          ))}

          <h4>Professional (up to 3 at 5%)</h4>
          {carProf.map(s => (
            <label key={s} className="inline-flex items-center mr-6">
              <input
                type="checkbox"
                checked={!!carProfAlloc[s]}
                onChange={handleCheckbox(s, carProfAlloc, setCarProfAlloc, careLeft, setCareLeft)}
                className="mr-1"
              />
              {s} (base {baseProfessional[s]}%)
            </label>
          ))}

          <div className="mt-4 flex justify-between">
            <button onClick={()=>setPhase(1)} className="btn btn-secondary">
              Back
            </button>
            <button
              onClick={()=>setPhase(3)}
              disabled={careLeft>0}
              className="btn btn-primary"
            >
              Next: Bonus
            </button>
          </div>
        </>
      )}

      {phase===3 && (
        <>
          <h3>Bonus / Hobby Skills ({initialBonus} pts)</h3>
          <p>Points left: <strong>{bonusLeft}</strong></p>

          <label className="block mb-2 font-medium">Add a skill:</label>
          <select
            className="form-control mb-4"
            onChange={e => {
              const s = e.target.value;
              if (s && !bonusSel.includes(s)) setBonusSel(sel => [...sel,s]);
            }}
          >
            <option value="">-- pick a skill --</option>
            {[...cultStd, ...cultProf, ...carStd, ...carProf]
              .filter((v,i,a)=>v && a.indexOf(v)===i)
              .map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {bonusSel.map(s => (
            <div key={s} className="flex items-center mb-2">
              <div className="w-48">{s} (base {baseStandard[s]||baseProfessional[s]}%)</div>
              <input
                type="range" min={0} max={maxInc} step={1}
                value={bonusAlloc[s]||0}
                onChange={handleSlider(s, bonusAlloc, setBonusAlloc, bonusLeft, setBonusLeft)}
                className="flex-1 mx-2"
              />
              <div className="w-12 text-right">+{bonusAlloc[s]||0}%</div>
            </div>
          ))}

          <div className="mt-4 flex justify-between">
            <button onClick={()=>setPhase(2)} className="btn btn-secondary">
              Back
            </button>
            <button disabled={bonusLeft>0} className="btn btn-success">
              Finish
            </button>
          </div>
        </>
      )}
    </StepWrapper>
  );
}
