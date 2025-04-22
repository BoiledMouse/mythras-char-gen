// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';
import StepWrapper from '../components/StepWrapper';

export default function SkillsStep() {
  const { character, updateCharacter } = useCharacter();
  const {
    STR = 0,
    DEX = 0,
    INT = 0,
    CON = 0,
    POW = 0,
    CHA = 0,
    SIZ = 0,
    culture: cultKey = '',
    career: careerKey = '',
    age = 0
  } = character;

  const cultureDef = cultures[cultKey] || {};
  const careerDef = careers[careerKey] || {};

  // 1) Age‐based bonus bucket
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10 },
    { max: 27, bonus: 150, maxInc: 15 },
    { max: 43, bonus: 200, maxInc: 20 },
    { max: 64, bonus: 250, maxInc: 25 },
    { max: Infinity, bonus: 300, maxInc: 30 },
  ];
  const { bonus: initialBonusPool, maxInc } = ageBuckets.find(b => age <= b.max);

  // 2) Compute base % from an expression like "STR+DEX"
  const attrs = { STR, DEX, INT, CON, POW, CHA, SIZ };
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]]||0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i+1];
      const v = /^\d+$/.test(tok) ? +tok : +attrs[tok]||0;
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // 3) Build base tables
  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let b = computeBase(base);
    if (name === 'Customs' || name === 'Native Tongue') b += 40;
    baseStandard[name] = b;
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfessional[name] = computeBase(base);
  });

  // 4) Which skills apply this step
  const cultStd  = cultureDef.standardSkills    || [];
  const cultProf = cultureDef.professionalSkills || [];
  const carStd   = careerDef.standardSkills     || [];
  const carProf  = careerDef.professionalSkills  || [];

  // 5) Pools and allocations
  const CULTURAL_POOL = 100;
  const CAREER_POOL  = 100;

  const [phase,       setPhase      ] = useState(1);
  const [cultStdAlloc,   setCultStdAlloc] = useState({});
  const [cultProfSel,    setCultProfSel ] = useState([]);
  const [cultProfAlloc,  setCultProfAlloc] = useState({});
  const [cultCombatSel,  setCultCombatSel] = useState('');
  const [cultCombatAlloc, setCultCombatAlloc] = useState(0);

  const [carStdAlloc,    setCarStdAlloc ] = useState({});
  const [carProfSel,     setCarProfSel  ] = useState([]);
  const [carProfAlloc,   setCarProfAlloc] = useState({});

  const [bonusAlloc,     setBonusAlloc  ] = useState({});
  const [bonusPoolLeft,  setBonusPoolLeft] = useState(initialBonusPool);
  const [bonusSel,       setBonusSel    ] = useState([]);

  const sum = o => Object.values(o).reduce((a,b)=>(a+(b||0)),0);

  // 6) Persist when hitting “Finish”
  useEffect(() => {
    if (phase > 3) {
      const final = { ...baseStandard, ...baseProfessional };
      cultStd.forEach(s => final[s] += cultStdAlloc[s] || 0);
      cultProfSel.forEach(s => final[s] += cultProfAlloc[s] || 0);
      if (cultCombatSel) final[cultCombatSel] += cultCombatAlloc;
      carStd.forEach(s => final[s] += carStdAlloc[s] || 0);
      carProfSel.forEach(s => final[s] += carProfAlloc[s] || 0);
      bonusSel.forEach(s => final[s] += bonusAlloc[s] || 0);
      updateCharacter({ skills: final });
    }
  }, [phase]);

  // Handlers for Cultural & Career sliders
  const handleSlider = (setter, allocObj, key, poolLeft, setPoolLeft, limit) => e => {
    let v = parseInt(e.target.value,10) || 0;
    v = Math.max(0, Math.min(limit, v));
    const prev = allocObj[key] || 0, delta = v - prev;
    if (delta <= poolLeft) {
      setter({ ...allocObj, [key]: v });
      setPoolLeft(pl => pl - delta);
    }
  };

  // Bonus slider
  const handleBonus = skill => e => {
    let v = parseInt(e.target.value,10) || 0;
    if (v > 0 && v < 5) v = 0;        // snap 1–4 ⇒ 0
    v = Math.max(0, Math.min(maxInc, v));
    const prev = bonusAlloc[skill]||0, delta = v - prev;
    if (delta <= bonusPoolLeft) {
      setBonusAlloc(a => ({ ...a, [skill]: v }));
      setBonusPoolLeft(pl => pl - delta);
    }
  };

  return (
    <StepWrapper title="Skills">
      <p>Age: <strong>{age}</strong></p>
      <p>Cultural Pool: <strong>{CULTURAL_POOL}</strong> pts, Career Pool: <strong>{CAREER_POOL}</strong> pts, Bonus Pool: <strong>{initialBonusPool}</strong> pts, Max per skill: +{maxInc}%</p>

      {phase === 1 && (
        <>
          <h3>Cultural Skills (100 pts)</h3>
          <p>Points left: <strong>{CULTURAL_POOL - sum(cultStdAlloc) - sum(cultProfAlloc) - cultCombatAlloc}</strong></p>
          <h4>Standard (culture)</h4>
          {cultStd.map(s => (
            <div key={s} className="flex items-center mb-2">
              <span className="w-40">{s} (Base {baseStandard[s]}%)</span>
              <input
                type="range"
                min={0} max={15} step={1}
                value={cultStdAlloc[s]||0}
                onChange={handleSlider(setCultStdAlloc, cultStdAlloc, s,
                  CULTURAL_POOL - sum(cultStdAlloc) - sum(cultProfAlloc) - cultCombatAlloc,
                  v=>v, 15)}
                className="flex-1 mx-2"
              />
              <span className="w-12 text-right">+{cultStdAlloc[s]||0}</span>
            </div>
          ))}

          <h4>Professional (max 3)</h4>
          {cultProf.map(s => (
            <label key={s} className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={cultProfSel.includes(s)}
                onChange={() => {
                  setCultProfSel(sel =>
                    sel.includes(s)
                      ? sel.filter(x=>x!==s)
                      : sel.length < 3
                        ? [...sel,s] : sel
                  );
                }}
                className="mr-1"
              />
              {s}
            </label>
          ))}
          {cultProfSel.map(s => (
            <div key={s} className="flex items-center mb-2">
              <span className="w-40">{s} (Base {baseProfessional[s]}%)</span>
              <input
                type="range"
                min={0} max={15} step={1}
                value={cultProfAlloc[s]||0}
                onChange={handleSlider(setCultProfAlloc, cultProfAlloc, s,
                  CULTURAL_POOL - sum(cultStdAlloc) - sum(cultProfAlloc) - cultCombatAlloc,
                  v=>v, 15)}
                className="flex-1 mx-2"
              />
              <span className="w-12 text-right">+{cultProfAlloc[s]||0}</span>
            </div>
          ))}

          <h4>Combat Style (choose one)</h4>
          {cultureDef.combatStyles?.map(cs => (
            <label key={cs} className="inline-flex items-center mr-4">
              <input
                type="radio"
                name="combat"
                checked={cultCombatSel === cs}
                onChange={()=> setCultCombatSel(cs)}
                className="mr-1"
              />
              {cs}
            </label>
          ))}
          {cultCombatSel && (
            <div className="flex items-center mb-4">
              <span className="w-40">{cultCombatSel} (Base {baseProfessional[cultCombatSel]}%)</span>
              <input
                type="range"
                min={0} max={15} step={1}
                value={cultCombatAlloc}
                onChange={handleSlider(setCultCombatAlloc, { [cultCombatSel]: cultCombatAlloc }, cultCombatSel,
                  CULTURAL_POOL - sum(cultStdAlloc) - sum(cultProfAlloc) - cultCombatAlloc,
                  v=>v, 15)}
                className="flex-1 mx-2"
              />
              <span className="w-12 text-right">+{cultCombatAlloc}</span>
            </div>
          )}

          <button
            onClick={()=> setPhase(2)}
            className="px-4 py-2 bg-gold rounded text-white"
          >
            Next: Career
          </button>
        </>
      )}

      {phase === 2 && (
        <>
          <h3>Career Skills (100 pts)</h3>
          <p>Points left: <strong>{CAREER_POOL - sum(carStdAlloc) - sum(carProfAlloc)}</strong></p>
          <h4>Standard (career)</h4>
          {carStd.map(s => (
            <div key={s} className="flex items-center mb-2">
              <span className="w-40">{s} (Base {baseStandard[s]}%)</span>
              <input
                type="range"
                min={0} max={15} step={1}
                value={carStdAlloc[s]||0}
                onChange={handleSlider(setCarStdAlloc, carStdAlloc, s,
                  CAREER_POOL - sum(carStdAlloc) - sum(carProfAlloc),
                  v=>v, 15)}
                className="flex-1 mx-2"
              />
              <span className="w-12 text-right">+{carStdAlloc[s]||0}</span>
            </div>
          ))}

          <h4>Professional (max 3)</h4>
          {carProf.map(s => (
            <label key={s} className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={carProfSel.includes(s)}
                onChange={() => {
                  setCarProfSel(sel =>
                    sel.includes(s)
                      ? sel.filter(x=>x!==s)
                      : sel.length < 3 ? [...sel,s] : sel
                  );
                }}
                className="mr-1"
              />
              {s}
            </label>
          ))}
          {carProfSel.map(s => (
            <div key={s} className="flex items-center mb-2">
              <span className="w-40">{s} (Base {baseProfessional[s]}%)</span>
              <input
                type="range"
                min={0} max={15} step={1}
                value={carProfAlloc[s]||0}
                onChange={handleSlider(setCarProfAlloc, carProfAlloc, s,
                  CAREER_POOL - sum(carStdAlloc) - sum(carProfAlloc),
                  v=>v, 15)}
                className="flex-1 mx-2"
              />
              <span className="w-12 text-right">+{carProfAlloc[s]||0}</span>
            </div>
          ))}

          <div className="flex justify-between mt-4">
            <button
              onClick={()=> setPhase(1)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Back
            </button>
            <button
              onClick={()=> setPhase(3)}
              className="px-4 py-2 bg-gold rounded text-white"
            >
              Next: Bonus
            </button>
          </div>
        </>
      )}

      {phase === 3 && (
        <>
          <h3>Bonus Skills (free to pick any culture/career skill + one hobby)</h3>
          <p>Points left: <strong>{bonusPoolLeft}</strong></p>

          <h4>Add a Hobby Skill</h4>
          <select
            className="border rounded p-2 mb-4 w-full"
            onChange={e => {
              const s = e.target.value;
              if (s && !bonusSel.includes(s)) setBonusSel(sel => [...sel, s]);
            }}
          >
            <option value="">-- pick a hobby --</option>
            {[...new Set([...cultStd, ...cultProf, ...carStd, ...carProf])].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {bonusSel.map(s => (
            <div key={s} className="flex items-center mb-2">
              <span className="w-40">{s} (Base {baseStandard[s] ?? baseProfessional[s]}%)</span>
              <input
                type="range"
                min={0} max={maxInc} step={1}
                value={bonusAlloc[s]||0}
                onChange={handleBonus(s)}
                className="flex-1 mx-2"
              />
              <span className="w-12 text-right">+{bonusAlloc[s]||0}</span>
            </div>
          ))}

          <div className="flex justify-between mt-4">
            <button
              onClick={()=> setPhase(2)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Back
            </button>
            <button
              onClick={()=> setPhase(4)}
              disabled={bonusPoolLeft > 0}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Finish
            </button>
          </div>
        </>
      )}

      {phase > 3 && (
        <div className="text-center">
          <h3>All done – hit Review below</h3>
          <button
            onClick={()=> updateCharacter({ step: 'review' })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Go to Review
          </button>
        </div>
      )}
    </StepWrapper>
  );
}
