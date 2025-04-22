// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import cultures     from '../data/cultures.json';
import careers      from '../data/careers.json';
import skillsData   from '../data/skills.json';
import StepWrapper  from '../components/StepWrapper';

export default function SkillsStep({ formData, onChange }) {
  // pull age/culture/career from the form
  const { age = 0, culture: cultKey = '', career: careerKey = '' } = formData;

  const cultureDef = cultures[cultKey] || {};
  const careerDef  = careers[careerKey] || {};

  // map your attribute names from formData
  const attrs = {
    STR: Number(formData.STR   || 0),
    DEX: Number(formData.DEX   || 0),
    CON: Number(formData.CON   || 0),
    SIZ: Number(formData.SIZ   || 0),
    INT: Number(formData.INT   || 0),
    POW: Number(formData.POW   || 0),
    CHA: Number(formData.CHA   || 0),
  };

  // age buckets exactly as per the PDF
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10 },
    { max: 27, bonus: 150, maxInc: 15 },
    { max: 43, bonus: 200, maxInc: 20 },
    { max: 64, bonus: 250, maxInc: 25 },
    { max: Infinity, bonus: 300, maxInc: 30 },
  ];
  const { bonus: bonusPool, maxInc } = ageBuckets.find(b => age <= b.max);

  const CULTURAL_POOL = 100;
  const CAREER_POOL  = 100;

  // helper to compute a base% from the "STR+INT" strings in your data
  const computeBase = expr => {
    const toks = expr.split(/\s*([+x])\s*/).filter(Boolean);
    const get = t => (/^\d+$/.test(t) ? +t : attrs[t] || 0);
    let val = get(toks[0]);
    for (let i = 1; i < toks.length; i += 2) {
      const op = toks[i], tk = toks[i+1], x = get(tk);
      val = op === 'x' ? val * x : val + x;
    }
    return val;
  };

  // build base lookup
  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let v = computeBase(base);
    if (name === 'Customs' || name === 'Native Tongue') v += 40;
    baseStandard[name] = v;
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfessional[name] = computeBase(base);
  });

  // which skills come from culture, career, combat
  const cultStd   = cultureDef.standardSkills    || [];
  const cultProf  = cultureDef.professionalSkills|| [];
  const carStd    = careerDef.standardSkills     || [];
  const carProf   = careerDef.professionalSkills || [];
  const combatStyles = cultureDef.combatStyles  || [];

  // local state for the three‑step allocation
  const [step,      setStep     ] = useState(1);
  const [cultLeft,  setCultLeft ] = useState(CULTURAL_POOL);
  const [careLeft,  setCareLeft ] = useState(CAREER_POOL);
  const [bonusLeft, setBonusLeft] = useState(bonusPool);

  const [cultStdAlloc,  setCultStdAlloc ]  = useState({});
  const [cultProfAlloc, setCultProfAlloc] = useState({});
  const [combatAlloc,   setCombatAlloc  ] = useState({});
  const [carStdAlloc,   setCarStdAlloc  ] = useState({});
  const [carProfAlloc,  setCarProfAlloc ] = useState({});
  const [bonusAlloc,    setBonusAlloc   ] = useState({});

  const allocHandler = (setter, allocObj, pool, setPool, key) => e => {
    let v = parseInt(e.target.value,10) || 0;
    if (v>0 && v<5) v = 0;
    v = Math.max(0, Math.min(maxInc, v));
    const prev = allocObj[key]||0, delta = v - prev;
    if (delta <= pool) {
      setter({ ...allocObj, [key]: v });
      setPool(pl => pl - delta);
    }
  };

  // when user finishes bonus step, write back `formData.skills`
  useEffect(() => {
    if (step === 4) {
      const final = { ...baseStandard, ...baseProfessional };
      cultStd .forEach(s=> final[s]+= cultStdAlloc[s]   || 0);
      cultProf.forEach(s=> final[s]+= cultProfAlloc[s]  || 0);
      Object.entries(combatAlloc).forEach(([s,v])=> final[s]+=v);
      carStd .forEach(s=> final[s]+= carStdAlloc[s]     || 0);
      carProf.forEach(s=> final[s]+= carProfAlloc[s]    || 0);
      Object.entries(bonusAlloc).forEach(([s,v])=> final[s]+=v);
      onChange('skills', final);
    }
  }, [step]);

  return (
    <StepWrapper title="Skills Allocation">
      <p>
        <b>Age:</b> {age} &nbsp;|&nbsp;
        <b>Culture:</b> {cultKey || '—'} &nbsp;|&nbsp;
        <b>Career:</b> {careerDef.name||careerKey||'—'}
      </p>
      <p>
        Pools ⇒ Cultural: <b>{CULTURAL_POOL}</b>, Career: <b>{CAREER_POOL}</b>, Bonus: <b>{bonusPool}</b>, Max/skill: +<b>{maxInc}</b>
      </p>

      {step===1 && <>
        <h3>Step 1: Cultural Skills ({cultLeft} pts left)</h3>
        <h4>Standard</h4>
        {cultStd.map(skill => (
          <div key={skill} className="slider-row">
            <label>{skill} (base {baseStandard[skill]||0}%)</label>
            <input
              type="range" min={0} max={maxInc} step={1}
              value={cultStdAlloc[skill]||0}
              onChange={allocHandler(
                setCultStdAlloc,cultStdAlloc,
                cultLeft, setCultLeft, skill
              )}
            />
            <span>+{cultStdAlloc[skill]||0}%</span>
          </div>
        ))}
        <h4>Professional (pick up to {cultProf.length})</h4>
        {cultProf.map(skill => {
          const checked = skill in cultProfAlloc;
          return (
            <div key={skill} className="slider-row">
              <input
                type="checkbox" checked={checked}
                onChange={e => {
                  if (e.target.checked) setCultProfAlloc({ ...cultProfAlloc, [skill]:0 });
                  else {
                    const { [skill]:_,...r } = cultProfAlloc;
                    setCultProfAlloc(r);
                  }
                }}
              />
              <label>{skill} (base {baseProfessional[skill]||0}%)</label>
              {checked && (
                <>
                  <input
                    type="range"
                    min={0} max={maxInc} step={1}
                    value={cultProfAlloc[skill]}
                    onChange={allocHandler(
                      setCultProfAlloc,cultProfAlloc,
                      cultLeft, setCultLeft, skill
                    )}
                  />
                  <span>+{cultProfAlloc[skill]}%</span>
                </>
              )}
            </div>
          );
        })}
        <h4>Combat Styles (choose one)</h4>
        {combatStyles.map(skill => {
          const selected = skill in combatAlloc;
          return (
            <div key={skill} className="slider-row">
              <input
                type="radio" name="combat"
                checked={selected}
                onChange={()=>setCombatAlloc({ [skill]:0 })}
              />
              <label>{skill} (base {baseProfessional[skill]||0}%)</label>
              {selected && (
                <>
                  <input
                    type="range"
                    min={0} max={maxInc} step={1}
                    value={combatAlloc[skill]}
                    onChange={allocHandler(
                      setCombatAlloc,combatAlloc,
                      cultLeft,setCultLeft, skill
                    )}
                  />
                  <span>+{combatAlloc[skill]}%</span>
                </>
              )}
            </div>
          );
        })}
        <button
          className="btn btn-primary"
          disabled={cultLeft!==0}
          onClick={()=>setStep(2)}
        >Next: Career</button>
      </>}

      {step===2 && <>
        <h3>Step 2: Career Skills ({careLeft} pts left)</h3>
        <h4>Standard</h4>
        {carStd.map(skill => (
          <div key={skill} className="slider-row">
            <label>{skill} (base {baseStandard[skill]||0}%)</label>
            <input
              type="range" min={0} max={maxInc} step={1}
              value={carStdAlloc[skill]||0}
              onChange={allocHandler(
                setCarStdAlloc,carStdAlloc,
                careLeft,setCareLeft,skill
              )}
            />
            <span>+{carStdAlloc[skill]||0}%</span>
          </div>
        ))}
        <h4>Professional (pick up to {carProf.length})</h4>
        {carProf.map(skill => {
          const checked = skill in carProfAlloc;
          return (
            <div key={skill} className="slider-row">
              <input
                type="checkbox" checked={checked}
                onChange={e => {
                  if (e.target.checked) setCarProfAlloc({ ...carProfAlloc, [skill]:0 });
                  else {
                    const { [skill]:_,...r } = carProfAlloc;
                    setCarProfAlloc(r);
                  }
                }}
              />
              <label>{skill} (base {baseProfessional[skill]||0}%)</label>
              {checked && (
                <>
                  <input
                    type="range"
                    min={0} max={maxInc} step={1}
                    value={carProfAlloc[skill]}
                    onChange={allocHandler(
                      setCarProfAlloc,carProfAlloc,
                      careLeft,setCareLeft,skill
                    )}
                  />
                  <span>+{carProfAlloc[skill]}%</span>
                </>
              )}
            </div>
          );
        })}
        <button
          className="btn btn-primary"
          disabled={careLeft!==0}
          onClick={()=>setStep(3)}
        >Next: Bonus</button>
      </>}

      {step===3 && <>
        <h3>Step 3: Bonus / Hobby Skills ({bonusLeft} pts left)</h3>
        {[
          ...new Set([
            ...cultStd, ...cultProf,
            ...carStd,  ...carProf,
            ...combatStyles
          ])
        ].map(skill => (
          <div key={skill} className="slider-row">
            <label>{skill} (base {baseStandard[skill] ?? baseProfessional[skill] ?? 0}%)</label>
            <input
              type="range"
              min={0} max={maxInc} step={1}
              value={bonusAlloc[skill]||0}
              onChange={allocHandler(
                setBonusAlloc,bonusAlloc,
                bonusLeft,setBonusLeft,skill
              )}
            />
            <span>+{bonusAlloc[skill]||0}%</span>
          </div>
        ))}
        <button
          className="btn btn-primary"
          disabled={bonusLeft!==0}
          onClick={()=>setStep(4)}
        >Finish Skills</button>
      </>}
    </StepWrapper>
  );
}
