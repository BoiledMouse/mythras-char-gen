// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';
import StepWrapper from '../components/StepWrapper';

export default function SkillsStep({ formData }) {
  // ← grab these from formData, not from context.character
  const { culture: cultKey, career: careerKey, age = 0 } = formData;

  // your existing context-driven attributes
  const { character, updateCharacter } = useCharacter();
  const attrs = character;

  // 1) Age buckets
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10, rolls: 0 },
    { max: 27, bonus: 150, maxInc: 15, rolls: 1 },
    { max: 43, bonus: 200, maxInc: 20, rolls: 2 },
    { max: 64, bonus: 250, maxInc: 25, rolls: 3 },
    { max: Infinity, bonus: 300, maxInc: 30, rolls: 4 },
  ];
  const { bonus: startingPool, maxInc } = ageBuckets.find(b => age <= b.max);

  // 2) computeBase helper unchanged
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]]||0,10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i+1];
      const v = /^\d+$/.test(tok) ? +tok : +attrs[tok]||0;
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // 3) build base tables
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

  // 4) which skills apply?
  const cultDef = cultures[cultKey] || {};
  const carDef  = careers[careerKey] || {};
  const cultStd    = cultDef.standardSkills    || [];
  const cultProf   = cultDef.professionalSkills|| [];
  const carStd     = carDef.standardSkills     || [];
  const carProf    = carDef.professionalSkills || [];

  // 5) state for three phases
  const [phase,     setPhase]     = useState(1);
  const [poolCult,  setPoolCult]  = useState(startingPool);
  const [poolCare,  setPoolCare]  = useState(startingPool);
  const [poolBonus, setPoolBonus] = useState(startingPool);

  const [cultStdAlloc,    setCultStdAlloc]    = useState({});
  const [cultProfAlloc,   setCultProfAlloc]   = useState({});
  const [cultCombatSel,   setCultCombatSel]   = useState(null);
  const [cultCombatAlloc, setCultCombatAlloc] = useState(0);

  const [careStdAlloc,  setCareStdAlloc]  = useState({});
  const [careProfAlloc, setCareProfAlloc] = useState({});

  const [bonusSel,    setBonusSel]    = useState([]);
  const [bonusAlloc,  setBonusAlloc]  = useState({});

  const sum = obj => Object.values(obj).reduce((a,b)=>(a+(b||0)),0);

  // 6) When all phases done, compose final and push into context
  useEffect(()=>{
    if (phase > 3) {
      const final = { ...baseStandard, ...baseProfessional };
      cultStd.forEach(s => final[s] += cultStdAlloc[s]||0);
      cultProf.forEach(s => final[s] += cultProfAlloc[s]||0);
      if (cultCombatSel) final[cultCombatSel] += cultCombatAlloc;
      carStd.forEach(s => final[s] += careStdAlloc[s]||0);
      carProf.forEach(s => final[s] += careProfAlloc[s]||0);
      bonusSel.forEach(s => final[s] += bonusAlloc[s]||0);
      updateCharacter({ skills: final });
    }
  }, [phase]);

  // 7) generic slider handler
  const handleAlloc = (setter, allocObj, poolSetter, pool, key) => e => {
    let v = parseInt(e.target.value,10) || 0;
    if (v > 0 && v < 5) v = 0;                 // snap 1–4 → 0
    v = Math.min(maxInc, Math.max(0, v));      // clamp
    const prev = allocObj[key] || 0,
          delta = v - prev;
    if (delta <= pool) {
      setter({ ...allocObj, [key]: v });
      poolSetter(pl => pl - delta);
    }
  };

  return (
    <StepWrapper title="Skills">
      <p>
        Age: <strong>{age}</strong> ⇒
        Cultural Pool: <strong>{startingPool}</strong>,
        Career Pool: <strong>{startingPool}</strong>,
        Bonus Pool: <strong>{startingPool}</strong>,
        Max per skill: <strong>+{maxInc}</strong>
      </p>
      <p>Cultural points left: <strong>{poolCult}</strong></p>
      <p>Career points left:  <strong>{poolCare}</strong></p>
      <p>Bonus points left:   <strong>{poolBonus}</strong></p>

      {phase === 1 && (
        <>
          <h3 className="italic">Step 1: Cultural Skills</h3>
          {cultStd.map(s => {
            const base = baseStandard[s];
            const extra = cultStdAlloc[s] || 0;
            return (
              <div key={s} className="flex items-center my-2">
                <div className="w-32 font-medium">{s} ({base}%)</div>
                <input
                  type="range" min={0} max={maxInc} step={1}
                  value={extra}
                  onChange={handleAlloc(
                    setCultStdAlloc, cultStdAlloc,
                    setPoolCult, poolCult, s
                  )}
                  className="flex-1 mx-4"
                />
                <div className="w-12 text-right">+{extra}</div>
              </div>
            );
          })}

          <h4 className="mt-6 italic">Professional (max 3)</h4>
          {cultProf.map(s => {
            const base = baseProfessional[s];
            const extra = cultProfAlloc[s] || 0;
            return (
              <div key={s} className="flex items-center my-2">
                <input
                  type="checkbox"
                  disabled={!cultProfAlloc[s] && Object.values(cultProfAlloc).filter(v=>v>0).length>=3}
                  checked={!!cultProfAlloc[s]}
                  onChange={() => {
                    if (cultProfAlloc[s]) {
                      // unselect
                      setPoolCult(pl => pl + cultProfAlloc[s]);
                      setCultProfAlloc(prev => {
                        const { [s]:_, ...rest } = prev;
                        return rest;
                      });
                    } else {
                      // select with zero allocation
                      setCultProfAlloc(prev => ({ ...prev, [s]: 0 }));
                    }
                  }}
                />
                <div className="w-32 ml-2">{s} ({base}%)</div>
                <input
                  type="range" min={0} max={maxInc} step={1}
                  disabled={!cultProfAlloc[s]}
                  value={extra}
                  onChange={handleAlloc(
                    setCultProfAlloc, cultProfAlloc,
                    setPoolCult, poolCult, s
                  )}
                  className="flex-1 mx-4"
                />
                <div className="w-12 text-right">+{extra}</div>
              </div>
            );
          })}

          <h4 className="mt-6 italic">Combat Style</h4>
          { (cultDef.combatStyles||[]).map(s => {
            const base = attrs.STR + attrs.DEX;
            const extra = cultCombatSel===s ? cultCombatAlloc : 0;
            return (
              <div key={s} className="flex items-center my-2">
                <input
                  type="radio"
                  name="combat"
                  checked={cultCombatSel===s}
                  onChange={()=> {
                    setCultCombatSel(s);
                    setCultCombatAlloc(0);
                  }}
                />
                <div className="w-32 ml-2">{s} ({base}%)</div>
                <input
                  type="range" min={0} max={maxInc} step={1}
                  disabled={cultCombatSel!==s}
                  value={extra}
                  onChange={handleAlloc(
                    setCultCombatAlloc, { [s]: cultCombatAlloc },
                    setPoolCult, poolCult, s
                  )}
                  className="flex-1 mx-4"
                />
                <div className="w-12 text-right">+{extra}</div>
              </div>
            );
          })}

          <button
            disabled={poolCult > 0}
            onClick={()=>setPhase(2)}
            className="mt-6 btn btn-primary"
          >
            Next: Career Skills
          </button>
        </>
      )}

      {phase === 2 && (
        <>
          <h3 className="italic">Step 2: Career Skills</h3>
          {carStd.map(s => {
            const base = baseStandard[s];
            const extra = careStdAlloc[s] || 0;
            return (
              <div key={s} className="flex items-center my-2">
                <div className="w-32 font-medium">{s} ({base}%)</div>
                <input
                  type="range" min={0} max={maxInc} step={1}
                  value={extra}
                  onChange={handleAlloc(
                    setCareStdAlloc, careStdAlloc,
                    setPoolCare, poolCare, s
                  )}
                  className="flex-1 mx-4"
                />
                <div className="w-12 text-right">+{extra}</div>
              </div>
            );
          })}

          <h4 className="mt-6 italic">Professional (max 3)</h4>
          {carProf.map(s => {
            const base = baseProfessional[s];
            const extra = careProfAlloc[s] || 0;
            return (
              <div key={s} className="flex items-center my-2">
                <input
                  type="checkbox"
                  disabled={!careProfAlloc[s] && Object.values(careProfAlloc).filter(v=>v>0).length>=3}
                  checked={!!careProfAlloc[s]}
                  onChange={() => {
                    if (careProfAlloc[s]) {
                      setPoolCare(pl => pl + careProfAlloc[s]);
                      setCareProfAlloc(prev => {
                        const { [s]:_, ...rest } = prev;
                        return rest;
                      });
                    } else {
                      setCareProfAlloc(prev => ({ ...prev, [s]: 0 }));
                    }
                  }}
                />
                <div className="w-32 ml-2">{s} ({base}%)</div>
                <input
                  type="range" min={0} max={maxInc} step={1}
                  disabled={!careProfAlloc[s]}
                  value={extra}
                  onChange={handleAlloc(
                    setCareProfAlloc, careProfAlloc,
                    setPoolCare, poolCare, s
                  )}
                  className="flex-1 mx-4"
                />
                <div className="w-12 text-right">+{extra}</div>
              </div>
            );
          })}

          <div className="mt-6 flex justify-between">
            <button onClick={()=>setPhase(1)} className="btn btn-secondary">Back</button>
            <button
              disabled={poolCare > 0}
              onClick={()=>setPhase(3)}
              className="btn btn-primary"
            >
              Next: Bonus / Hobby
            </button>
          </div>
        </>
      )}

      {phase === 3 && (
        <>
          <h3 className="italic">Step 3: Bonus / Hobby Skills</h3>
          <div className="my-4">
            <label className="font-medium block mb-2">Add Hobby Skill:</label>
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

          {bonusSel.map(s => {
            const base = baseStandard[s] || baseProfessional[s] || 0;
            const extra = bonusAlloc[s] || 0;
            return (
              <div key={s} className="flex items-center my-2">
                <div className="w-32 font-medium">{s} ({base}%)</div>
                <input
                  type="range" min={0} max={maxInc} step={1}
                  value={extra}
                  onChange={handleAlloc(
                    setBonusAlloc, bonusAlloc,
                    setPoolBonus, poolBonus, s
                  )}
                  className="flex-1 mx-4"
                />
                <div className="w-12 text-right">+{extra}</div>
              </div>
            );
          })}

          <div className="mt-6 flex justify-between">
            <button onClick={()=>setPhase(2)} className="btn btn-secondary">Back</button>
            <button
              disabled={poolBonus > 0}
              onClick={()=>setPhase(4)}
              className="btn btn-primary"
            >
              Finish Skills
            </button>
          </div>
        </>
      )}
    </StepWrapper>
  );
}
