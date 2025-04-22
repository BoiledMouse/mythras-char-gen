// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter }        from '../context/characterContext';
import cultures                from '../data/cultures.json';
import careers                 from '../data/careers.json';
import skillsData              from '../data/skills.json';
import StepWrapper             from '../components/StepWrapper';

export function SkillsStep({ formData }) {
  // 0) pull culture, career, age from the Concept step
  const { culture: cultKey, career: careerKey, age = 0 } = formData;

  // 1) look up pool & maxInc from the age table
  const AGE_BUCKETS = [
    { max: 16, bonus: 100, maxInc: 10, rolls: 0 },
    { max: 27, bonus: 150, maxInc: 15, rolls: 1 },
    { max: 43, bonus: 200, maxInc: 20, rolls: 2 },
    { max: 64, bonus: 250, maxInc: 25, rolls: 3 },
    { max: Infinity, bonus: 300, maxInc: 30, rolls: 4 },
  ];
  const bucket = AGE_BUCKETS.find(b => age <= b.max);
  const startingPool = bucket.bonus;
  const maxInc       = bucket.maxInc;

  // 2) grab STR/DEX/… from context for base%
  const { character, updateCharacter } = useCharacter();
  const attrs = character;

  // 3) helper to compute “STR+DEX” style bases
  function computeBase(expr) {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let v = parseInt(attrs[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i+1];
      const x = /^\d+$/.test(tok) ? +tok : +attrs[tok] || 0;
      v = op === 'x' ? v * x : v + x;
    }
    return v;
  }

  // 4) build the two base tables
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

  // 5) pick out the lists from culture & career defs
  const cultDef  = cultures[cultKey]  || {};
  const careDef  = careers[careerKey]|| {};
  const cultStd  = cultDef.standardSkills    || [];
  const cultProf = cultDef.professionalSkills|| [];
  const carStd   = careDef.standardSkills    || [];
  const carProf  = careDef.professionalSkills || [];
  const combatStyles = cultDef.combatStyles  || [];

  // 6) pools & allocations
  const [phase,          setPhase]           = useState(1);
  const [poolCult,       setPoolCult]        = useState(startingPool);
  const [poolCare,       setPoolCare]        = useState(startingPool);
  const [poolBonus,      setPoolBonus]       = useState(startingPool);

  const [cultStdAlloc,   setCultStdAlloc]    = useState({});
  const [cultProfAlloc,  setCultProfAlloc]   = useState({});
  const [cultCombatSel,  setCultCombatSel]   = useState(null);
  const [cultCombatAlloc,setCultCombatAlloc] = useState(0);

  const [careStdAlloc,   setCareStdAlloc]    = useState({});
  const [careProfAlloc,  setCareProfAlloc]   = useState({});

  const [bonusSel,       setBonusSel]        = useState([]);
  const [bonusAlloc,     setBonusAlloc]      = useState({});

  // sum helper
  const sum = o => Object.values(o).reduce((a,b)=>(a+(b||0)),0);

  // 7) when fully done, assemble final skill map and send back to context
  useEffect(() => {
    if (phase > 3) {
      const final = { ...baseStandard, ...baseProfessional };
      cultStd.forEach(s => final[s] += cultStdAlloc[s]||0);
      cultProf.forEach(s => final[s] += cultProfAlloc[s]||0);
      if (cultCombatSel) final[cultCombatSel] += cultCombatAlloc;
      carStd.forEach(s  => final[s] += careStdAlloc[s]||0);
      carProf.forEach(s => final[s] += careProfAlloc[s]||0);
      bonusSel.forEach(s=> final[s] += bonusAlloc[s]||0);
      updateCharacter({ skills: final });
    }
  }, [phase]);

  // 8) generic slider handler for the arrays
  function handleSlider(setAlloc, allocObj, setPool, pool, key) {
    return e => {
      let v = parseInt(e.target.value,10) || 0;
      if (v>0 && v<5) v = 0;                   // snap 1–4 → 0
      v = Math.min(maxInc, Math.max(0, v));    // clamp
      const prev = allocObj[key]||0, delta = v - prev;
      if (delta <= pool) {
        setAlloc({ ...allocObj, [key]: v });
        setPool(p => p - delta);
      }
    }
  }

  // 9) clamp helper for combat slider
  const clamp = v => {
    let x = parseInt(v,10) || 0;
    if (x>0 && x<5) x = 0;
    return Math.min(maxInc, Math.max(0,x));
  };

  return (
    <StepWrapper title="Skills">
      <p>
        Age: <strong>{age}</strong> ⇒&nbsp;
        Cultural Pool: <strong>{startingPool}</strong>,&nbsp;
        Career Pool: <strong>{startingPool}</strong>,&nbsp;
        Bonus Pool: <strong>{startingPool}</strong>,&nbsp;
        Max per skill: <strong>+{maxInc}</strong>
      </p>
      <p>Cultural points left: <strong>{poolCult}</strong></p>
      <p>Career points left:  <strong>{poolCare}</strong></p>
      <p>Bonus points left:   <strong>{poolBonus}</strong></p>

      {/* -- Step 1: Cultural -- */}
      {phase===1 && <>
        <h3 className="italic">Step 1: Cultural Skills</h3>
        {cultStd.map(s => {
          const base = baseStandard[s], extra = cultStdAlloc[s]||0;
          return (
            <div key={s} className="flex items-center my-2">
              <div className="w-36 font-medium">{s} ({base}%)</div>
              <input
                type="range" min={0} max={maxInc} step={1}
                value={extra}
                onChange={handleSlider(
                  setCultStdAlloc, cultStdAlloc,
                  setPoolCult, poolCult, s
                )}
                className="flex-1 mx-4"
              />
              <div className="w-12 text-right">+{extra}</div>
            </div>
          );
        })}

        <h4 className="mt-4 italic">Professional (max 3)</h4>
        {cultProf.map(s => {
          const base = baseProfessional[s], extra = cultProfAlloc[s]||0;
          const selCount = sum(cultProfAlloc)>0? Object.keys(cultProfAlloc).length:0;
          return (
            <div key={s} className="flex items-center my-2">
              <input
                type="checkbox"
                checked={s in cultProfAlloc}
                disabled={!(s in cultProfAlloc) && selCount>=3}
                onChange={() => {
                  if (s in cultProfAlloc) {
                    // remove
                    setPoolCult(p=>p+cultProfAlloc[s]);
                    const nxt = { ...cultProfAlloc };
                    delete nxt[s];
                    setCultProfAlloc(nxt);
                  } else {
                    // add at 0
                    setCultProfAlloc({...cultProfAlloc, [s]:0});
                  }
                }}
              />
              <div className="w-36 ml-2">{s} ({base}%)</div>
              <input
                type="range" min={0} max={maxInc} step={1}
                disabled={!(s in cultProfAlloc)}
                value={extra}
                onChange={handleSlider(
                  setCultProfAlloc, cultProfAlloc,
                  setPoolCult, poolCult, s
                )}
                className="flex-1 mx-4"
              />
              <div className="w-12 text-right">+{extra}</div>
            </div>
          );
        })}

        <h4 className="mt-4 italic">Combat Style</h4>
        {combatStyles.map(s => {
          const base = (attrs.STR||0)+(attrs.DEX||0);
          const extra = (cultCombatSel===s) ? cultCombatAlloc : 0;
          return (
            <div key={s} className="flex items-center my-2">
              <input
                type="radio" name="combat"
                checked={cultCombatSel===s}
                onChange={()=> {
                  setCultCombatSel(s);
                  setCultCombatAlloc(0);
                }}
              />
              <div className="w-36 ml-2">{s} ({base}%)</div>
              <input
                type="range" min={0} max={maxInc} step={1}
                disabled={cultCombatSel!==s}
                value={extra}
                onChange={e => {
                  const v = clamp(e.target.value);
                  const delta = v - (cultCombatAlloc||0);
                  if (delta <= poolCult) {
                    setCultCombatAlloc(v);
                    setPoolCult(p=>p-delta);
                  }
                }}
                className="flex-1 mx-4"
              />
              <div className="w-12 text-right">+{extra}</div>
            </div>
          );
        })}

        <button
          className="btn btn-primary mt-6"
          disabled={poolCult>0}
          onClick={()=>setPhase(2)}
        >Next: Career Skills</button>
      </>}

      {/* -- Step 2: Career -- */}
      {phase===2 && <>
        <h3 className="italic">Step 2: Career Skills</h3>
        {carStd.map(s => {
          const base = baseStandard[s], extra = careStdAlloc[s]||0;
          return (
            <div key={s} className="flex items-center my-2">
              <div className="w-36 font-medium">{s} ({base}%)</div>
              <input
                type="range" min={0} max={maxInc} step={1}
                value={extra}
                onChange={handleSlider(
                  setCareStdAlloc, careStdAlloc,
                  setPoolCare, poolCare, s
                )}
                className="flex-1 mx-4"
              />
              <div className="w-12 text-right">+{extra}</div>
            </div>
          );
        })}

        <h4 className="mt-4 italic">Professional (max 3)</h4>
        {carProf.map(s => {
          const base = baseProfessional[s], extra = careProfAlloc[s]||0;
          const selCount = Object.keys(careProfAlloc).length;
          return (
            <div key={s} className="flex items-center my-2">
              <input
                type="checkbox"
                checked={s in careProfAlloc}
                disabled={!(s in careProfAlloc) && selCount>=3}
                onChange={()=> {
                  if (s in careProfAlloc) {
                    setPoolCare(p=>p+careProfAlloc[s]);
                    const nxt = {...careProfAlloc}; delete nxt[s];
                    setCareProfAlloc(nxt);
                  } else {
                    setCareProfAlloc({...careProfAlloc, [s]:0});
                  }
                }}
              />
              <div className="w-36 ml-2">{s} ({base}%)</div>
              <input
                type="range" min={0} max={maxInc} step={1}
                disabled={!(s in careProfAlloc)}
                value={extra}
                onChange={handleSlider(
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
          <button className="btn btn-secondary" onClick={()=>setPhase(1)}>Back</button>
          <button
            className="btn btn-primary"
            disabled={poolCare>0}
            onClick={()=>setPhase(3)}
          >Next: Bonus / Hobby</button>
        </div>
      </>}

      {/* -- Step 3: Bonus / Hobby -- */}
      {phase===3 && <>
        <h3 className="italic">Step 3: Bonus / Hobby Skills</h3>
        <div className="mt-4 mb-2">
          <label className="block font-medium mb-1">Add Hobby Skill:</label>
          <select
            className="w-full border rounded p-2"
            onChange={e => {
              const s = e.target.value;
              if (s && !bonusSel.includes(s)) setBonusSel([...bonusSel, s]);
            }}
          >
            <option value="">-- pick a skill --</option>
            {[...cultStd, ...cultProf, ...carStd, ...carProf]
              .filter((v,i,a)=>v && a.indexOf(v)===i)
              .map(s => <option key={s} value={s}>{s}</option>)
            }
          </select>
        </div>

        {bonusSel.map(s => {
          const base = baseStandard[s]||baseProfessional[s]||0;
          const extra = bonusAlloc[s]||0;
          return (
            <div key={s} className="flex items-center my-2">
              <div className="w-36 font-medium">{s} ({base}%)</div>
              <input
                type="range" min={0} max={maxInc} step={1}
                value={extra}
                onChange={handleSlider(
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
          <button className="btn btn-secondary" onClick={()=>setPhase(2)}>Back</button>
          <button
            className="btn btn-primary"
            disabled={poolBonus>0}
            onClick={()=>setPhase(4)}
          >Finish Skills</button>
        </div>
      </>}
    </StepWrapper>
  );
}
