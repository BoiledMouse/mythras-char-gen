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

  // --- 1) Age buckets for bonus pool / max per skill ---
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10, rolls: 0 },
    { max: 27, bonus: 150, maxInc: 15, rolls: 1 },
    { max: 43, bonus: 200, maxInc: 20, rolls: 2 },
    { max: 64, bonus: 250, maxInc: 25, rolls: 3 },
    { max: Infinity, bonus: 300, maxInc: 30, rolls: 4 },
  ];
  const { bonus: initialBonusPool, maxInc } =
    ageBuckets.find(b => age <= b.max);

  // --- 2) Compute base skill percentages from attributes ---
  const attrs = character;
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i + 1];
      const v = /^\d+$/.test(tok) ? +tok : +attrs[tok] || 0;
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };
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

  // --- 3) Available skills for each step ---
  const cultStd   = cultureDef.standardSkills    || [];
  const cultProf  = cultureDef.professionalSkills|| [];
  const cultCombat= cultureDef.combatStyles      || [];
  const carStd    = careerDef.standardSkills     || [];
  const carProf   = careerDef.professionalSkills || [];

  // --- 4) State for three pools & allocations ---
  const CULT_POOL  = 100;
  const CAREER_POOL= 100;
  const [cultLeft,  setCultLeft ] = useState(CULT_POOL);
  const [careLeft,  setCareLeft ] = useState(CAREER_POOL);
  const [bonusLeft, setBonusLeft] = useState(initialBonusPool);

  const [cultStdAlloc,   setCultStdAlloc]   = useState({});
  const [cultProfAlloc,  setCultProfAlloc]  = useState({});
  const [cultCombatAlloc,setCultCombatAlloc]= useState({}); // { style: points }
  const [carStdAlloc,    setCarStdAlloc]    = useState({});
  const [carProfAlloc,   setCarProfAlloc]   = useState({});
  const [bonusSel,       setBonusSel]       = useState([]);
  const [bonusAlloc,     setBonusAlloc]     = useState({});

  const sum = obj => Object.values(obj).reduce((a,b)=>(a+(b||0)),0);

  // --- 5) Phase control ---
  const [phase, setPhase] = useState(1);

  // Whenever all pools are spent, write back final skills
  useEffect(() => {
    if (cultLeft === 0 && careLeft === 0 && bonusLeft === 0) {
      const final = { ...baseStandard, ...baseProfessional };
      // cultural
      cultStd.forEach(s => final[s] += cultStdAlloc[s] || 0);
      cultProf.forEach(s => final[s] += cultProfAlloc[s] || 0);
      Object.entries(cultCombatAlloc).forEach(([s,v]) => final[s] += v);
      // career
      carStd.forEach(s => final[s] += carStdAlloc[s] || 0);
      carProf.forEach(s => final[s] += carProfAlloc[s] || 0);
      // bonus
      bonusSel.forEach(s => final[s] += bonusAlloc[s] || 0);
      updateCharacter({ skills: final });
    }
  }, [cultLeft, careLeft, bonusLeft]);

  // --- 6) Handlers for allocation changes ---
  const handleSlider = (key, alloc, setter, poolLeft, setPoolLeft) => e => {
    let v = parseInt(e.target.value,10) || 0;
    if (v > 0 && v < 5) v = 0;                // snap 1–4 → 0
    v = Math.min(maxInc, Math.max(0, v));     // clamp
    const prev = alloc[key] || 0;
    const delta = v - prev;
    if (delta <= poolLeft) {
      setter({ ...alloc, [key]: v });
      setPoolLeft(pl => pl - delta);
    }
  };
  const handleCheckbox = (skill, alloc, setter, poolLeft, setPoolLeft) => e => {
    const checked = e.target.checked;
    const prev = alloc[skill] || 0;
    if (checked && poolLeft > 0) {
      // allocate minimal 5
      setter({ ...alloc, [skill]: 5 });
      setPoolLeft(pl => pl - 5);
    } else if (!checked && prev > 0) {
      // remove allocation
      setter(({ [skill]:_, ...rest }) => rest);
      setPoolLeft(pl => pl + prev);
    }
  };

  return (
    <StepWrapper title="Skills Allocation">
      <p>
        Age: <strong>{age}</strong> ⇒  
        Bonus Pool: <strong>{initialBonusPool}</strong> pts,  
        Max per skill: <strong>+{maxInc}</strong>
      </p>

      {phase === 1 && (
        <>
          <h3>Cultural Skills (100 pts)</h3>
          <p>Points left: {cultLeft}</p>

          {/* Standard */}
          <h4>Standard Skills</h4>
          {cultStd.map(s => (
            <div key={s} className="flex items-center space-x-4 mb-2">
              <div className="w-48 font-medium">
                {s} (Base {baseStandard[s]}%)
              </div>
              <input
                type="range" min={0} max={maxInc} step={1}
                value={cultStdAlloc[s] || 0}
                onChange={handleSlider(s, cultStdAlloc, setCultStdAlloc, cultLeft, setCultLeft)}
                className="flex-1"
              />
              <div className="w-12 text-right">+{cultStdAlloc[s]||0}%</div>
            </div>
          ))}

          {/* Professional */}
          <h4>Choose up to 3 Professional Skills</h4>
          {cultProf.map(s => (
            <label key={s} className="inline-flex items-center mr-6">
              <input
                type="checkbox"
                checked={!!cultProfAlloc[s]}
                onChange={handleCheckbox(s, cultProfAlloc, setCultProfAlloc, cultLeft, setCultLeft)}
                className="mr-2"
              />
              {s} (Base {baseProfessional[s]}%)
            </label>
          ))}

          {/* Combat Styles */}
          <h4>Combat Style</h4>
          {cultureDef.combatStyles?.map(style => (
            <div key={style} className="flex items-center space-x-4 mb-2">
              <div className="w-48 font-medium">{style}</div>
              <input
                type="range" min={0} max={maxInc} step={1}
                value={cultCombatAlloc[style] || 0}
                onChange={handleSlider(style, cultCombatAlloc, setCultCombatAlloc, cultLeft, setCultLeft)}
                className="flex-1"
              />
              <div className="w-12 text-right">+{cultCombatAlloc[style]||0}%</div>
            </div>
          ))}

          <button
            onClick={() => setPhase(2)}
            disabled={cultLeft > 0}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next: Career
          </button>
        </>
      )}

      {phase === 2 && (
        <>
          <h3>Career Skills (100 pts)</h3>
          <p>Points left: {careLeft}</p>

          {/* Standard */}
          <h4>Standard Skills</h4>
          {carStd.map(s => (
            <div key={s} className="flex items-center space-x-4 mb-2">
              <div className="w-48 font-medium">
                {s} (Base {baseStandard[s]}%)
              </div>
              <input
                type="range" min={0} max={maxInc} step={1}
                value={carStdAlloc[s] || 0}
                onChange={handleSlider(s, carStdAlloc, setCarStdAlloc, careLeft, setCareLeft)}
                className="flex-1"
              />
              <div className="w-12 text-right">+{carStdAlloc[s]||0}%</div>
            </div>
          ))}

          {/* Professional */}
          <h4>Choose up to 3 Professional Skills</h4>
          {carProf.map(s => (
            <label key={s} className="inline-flex items-center mr-6">
              <input
                type="checkbox"
                checked={!!carProfAlloc[s]}
                onChange={handleCheckbox(s, carProfAlloc, setCarProfAlloc, careLeft, setCareLeft)}
                className="mr-2"
              />
              {s} (Base {baseProfessional[s]}%)
            </label>
          ))}

          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setPhase(1)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Back
            </button>
            <button
              onClick={() => setPhase(3)}
              disabled={careLeft > 0}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Next: Bonus
            </button>
          </div>
        </>
      )}

      {phase === 3 && (
        <>
          <h3>Bonus Skills ({initialBonusPool} pts)</h3>
          <p>Points left: {bonusLeft}</p>

          {/* Hobby selector */}
          <label className="block mb-2 font-medium">Add Hobby Skill:</label>
          <select
            className="border rounded p-2 mb-4 w-full"
            onChange={e => {
              const s = e.target.value;
              if (s && !bonusSel.includes(s)) {
                setBonusSel(sel => [...sel, s]);
              }
            }}
          >
            <option value="">-- pick a skill --</option>
            {[...cultStd, ...cultProf, ...carStd, ...carProf]
              .filter((v,i,a) => v && a.indexOf(v) === i)
              .map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Bonus sliders */}
          {bonusSel.map(s => {
            const base = baseStandard[s] || baseProfessional[s] || 0;
            const extra = bonusAlloc[s] || 0;
            return (
              <div key={s} className="flex items-center space-x-4 mb-2">
                <div className="w-48 font-medium">{s} (Base {base}%)</div>
                <input
                  type="range" min={0} max={maxInc} step={1}
                  value={extra}
                  onChange={handleSlider(s, bonusAlloc, setBonusAlloc, bonusLeft, setBonusLeft)}
                  className="flex-1"
                />
                <div className="w-12 text-right">+{extra}%</div>
              </div>
            );
          })}

          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setPhase(2)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Back
            </button>
            <button
              onClick={() => {/* final persistence happens in effect */}
                /* no Next needed */
              }}
              disabled={bonusLeft > 0}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Finish
            </button>
          </div>
        </>
      )}
    </StepWrapper>
  );
}
