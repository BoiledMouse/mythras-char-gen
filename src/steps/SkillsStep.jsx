// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';
import StepWrapper from '../components/StepWrapper';

export function SkillsStep({ formData, onChange }) {
  // 1) Pull concept values from formData
  const {
    age = 0,
    culture: cultKey = '',
    career: careerKey = ''
  } = formData;

  // 2) Pull attributes from your context
  const { character, updateCharacter } = useCharacter();
  const { STR=0, DEX=0, CON=0, SIZ=0, INT=0, POW=0, CHA=0 } = character;

  const cultureDef = cultures[cultKey] || {};
  const careerDef  = careers[careerKey] || {};

  // 3) Age buckets for bonus pool / max increase
  const ageBuckets = [
    { max: 16, bonus:100, maxInc:10 },
    { max: 27, bonus:150, maxInc:15 },
    { max: 43, bonus:200, maxInc:20 },
    { max: 64, bonus:250, maxInc:25 },
    { max: Infinity, bonus:300, maxInc:30 },
  ];
  const { bonus: bonusPool=100, maxInc=10 } =
    ageBuckets.find(b => age <= b.max) || {};
  const CULTURAL_POOL = 100;
  const CAREER_POOL  = 100;

  // 4) Compute base values from attributes
  const attrs = { STR, DEX, CON, SIZ, INT, POW, CHA };
  function computeBase(expr) {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = Number(attrs[parts[0]]||0);
    for (let i=1; i<parts.length; i+=2) {
      const op = parts[i], tok = parts[i+1];
      const v = /^\d+$/.test(tok) ? +tok : Number(attrs[tok]||0);
      val = op==='x' ? val*v : val+v;
    }
    return val;
  }
  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let b = computeBase(base);
    if (name==='Customs' || name==='Native Tongue') b += 40;
    baseStandard[name] = b;
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfessional[name] = computeBase(base);
  });

  // 5) Manage steps & pools
  const [step, setStep] = useState(1);
  const [cultLeft,    setCultLeft]    = useState(CULTURAL_POOL);
  const [carLeft,     setCarLeft]     = useState(CAREER_POOL);
  const [bonusLeft,   setBonusLeft]   = useState(bonusPool);

  // allocations
  const [cultAlloc,   setCultAlloc]   = useState({});
  const [carAlloc,    setCarAlloc]    = useState({});
  const [profSel,     setProfSel]     = useState([]);
  const [profAlloc,   setProfAlloc]   = useState({});
  const [combatSel,   setCombatSel]   = useState('');
  const [combatAlloc, setCombatAlloc] = useState({});
  const [bonusSel,    setBonusSel]    = useState([]);
  const [bonusAlloc,  setBonusAlloc]  = useState({});

  // helper to spend pool
  function mkHandler(alloc, setAlloc, left, setLeft) {
    return skill => e => {
      let v = parseInt(e.target.value||0,10);
      if (v>0 && v<5) v=0;
      v = Math.max(0, Math.min(maxInc,v));
      const delta = v - (alloc[skill]||0);
      if (delta <= left) {
        setAlloc({...alloc,[skill]:v});
        setLeft(l=>l-delta);
      }
    };
  }
  const handleCult   = mkHandler(cultAlloc,   setCultAlloc,   cultLeft,  setCultLeft);
  const handleCar    = mkHandler(carAlloc,    setCarAlloc,    carLeft,   setCarLeft);
  const handleProf   = mkHandler(profAlloc,   setProfAlloc,   carLeft,   setCarLeft);
  const handleCombat = mkHandler(combatAlloc, setCombatAlloc, carLeft,   setCarLeft);
  const handleBonus  = mkHandler(bonusAlloc,  setBonusAlloc,  bonusLeft, setBonusLeft);

  function toggleProf(skill) {
    if (profSel.includes(skill)) {
      const used = profAlloc[skill]||0;
      setProfAlloc(a=>{ let n={...a}; delete n[skill]; return n; });
      setCarLeft(l=>l+used);
      setProfSel(s=>s.filter(x=>x!==skill));
    } else if (profSel.length<3) {
      setProfSel(s=>[...s,skill]);
    }
  }
  function chooseCombat(skill) {
    if (combatSel) {
      const used = combatAlloc[combatSel]||0;
      setCarLeft(l=>l+used);
      setCombatAlloc({});
    }
    setCombatSel(skill);
  }

  // 6) When done with all 3 steps, persist into context
  useEffect(()=>{
    if (step===4) {
      const final = { ...baseStandard, ...baseProfessional };
      // culture
      (cultureDef.standardSkills||[]).forEach(s=> final[s]+=cultAlloc[s]||0);
      (cultureDef.professionalSkills||[]).forEach(s=> final[s]+=cultAlloc[s]||0);
      // career
      (careerDef.standardSkills||[]).forEach(s=> final[s]+=carAlloc[s]||0);
      profSel.forEach(s=> final[s]+=profAlloc[s]||0);
      // combat
      if (combatSel) final[combatSel] += combatAlloc[combatSel]||0;
      // bonus
      bonusSel.forEach(s=> final[s]+=bonusAlloc[s]||0);
      updateCharacter({ skills: final });
    }
  },[step]);

  // 7) Render
  return (
    <StepWrapper title="Skills Allocation">
      <p>
        Age: <strong>{age}</strong> ⇒&nbsp;
        Pools ⇒ Cult: <strong>{CULTURAL_POOL}</strong>,&nbsp;
                 Caree r: <strong>{CAREER_POOL}</strong>,&nbsp;
                 Bonus: <strong>{bonusPool}</strong>,&nbsp;
        Max per skill: <strong>+{maxInc}</strong>
      </p>

      {step===1 && (
        <>
          <h3>Step 1: Cultural Skills ({cultLeft} pts left)</h3>
          {['standardSkills','professionalSkills'].map(type=>(
            <div key={type} className="mt-4">
              <h4 className="font-bold">
                {type==='standardSkills'? 'Standard' : 'Professional'}
              </h4>
              {(cultureDef[type]||[]).map(skill=>{
                const base = (type==='standardSkills')
                  ? baseStandard[skill] : baseProfessional[skill];
                const alloc = cultAlloc[skill]||0;
                return (
                  <div key={skill} className="flex items-center my-2 space-x-4">
                    <div className="w-40">
                      {skill} (base {base}%)
                    </div>
                    <input
                      type="range" min={0} max={maxInc} step={1}
                      value={alloc}
                      onChange={handleCult(skill)}
                      className="flex-1"
                    />
                    <div className="w-12 text-right">+{alloc}%</div>
                  </div>
                );
              })}
            </div>
          ))}

          <div className="mt-6">
            <h4 className="font-bold">Combat Styles (pick 1)</h4>
            {(cultureDef.combatStyles||[]).map(skill=>{
              const base = baseProfessional[skill]||0;
              const alloc = combatAlloc[skill]||0;
              const sel   = combatSel===skill;
              return (
                <div key={skill} className="mb-3">
                  <label className="inline-flex items-center">
                    <input
                      type="radio" name="combat"
                      checked={sel}
                      onChange={()=>chooseCombat(skill)}
                      className="mr-2"
                    />
                    {skill} (base {base}%)
                  </label>
                  {sel && (
                    <div className="flex items-center mt-2 space-x-4">
                      <input
                        type="range" min={0} max={maxInc} step={1}
                        value={alloc}
                        onChange={handleCombat(skill)}
                        className="flex-1"
                      />
                      <div className="w-12 text-right">+{alloc}%</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            className="btn btn-primary mt-6"
            disabled={cultLeft>0}
            onClick={()=>setStep(2)}
          >Next: Career Skills</button>
        </>
      )}

      {step===2 && (
        <>
          <h3>Step 2: Career Skills ({carLeft} pts left)</h3>
          <div className="mt-4">
            <h4 className="font-bold">Standard</h4>
            {(careerDef.standardSkills||[]).map(skill=>{
              const base = baseStandard[skill]||0;
              const alloc = carAlloc[skill]||0;
              return (
                <div key={skill} className="flex items-center my-2 space-x-4">
                  <div className="w-40">{skill} (base {base}%)</div>
                  <input
                    type="range" min={0} max={maxInc} step={1}
                    value={alloc}
                    onChange={handleCar(skill)}
                    className="flex-1"
                  />
                  <div className="w-12 text-right">+{alloc}%</div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <h4 className="font-bold">Professional (pick up to 3)</h4>
            {(careerDef.professionalSkills||[]).map(skill=>{
              const base = baseProfessional[skill]||0;
              const alloc = profAlloc[skill]||0;
              const ck = profSel.includes(skill);
              return (
                <div key={skill} className="mb-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={ck}
                      onChange={()=>toggleProf(skill)}
                      className="mr-2"
                    />
                    {skill} (base {base}%)
                  </label>
                  {ck && (
                    <div className="flex items-center mt-2 space-x-4">
                      <input
                        type="range" min={0} max={maxInc} step={1}
                        value={alloc}
                        onChange={handleProf(skill)}
                        className="flex-1"
                      />
                      <div className="w-12 text-right">+{alloc}%</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            className="btn btn-primary mt-6"
            disabled={carLeft>0}
            onClick={()=>setStep(3)}
          >Next: Bonus/Hobby</button>
        </>
      )}

      {step===3 && (
        <>
          <h3>Step 3: Bonus / Hobby ({bonusLeft} pts left)</h3>
          <div className="mt-4">
            <label className="block mb-2">Add Hobby Skill</label>
            <select
              value=""
              onChange={e=>{
                const s=e.target.value;
                if (s && !bonusSel.includes(s)) setBonusSel(b=>[...b,s]);
              }}
              className="form-control"
            >
              <option disabled value="">-- pick a skill --</option>
              {[...new Set([
                ...(cultureDef.standardSkills||[]),
                ...(cultureDef.professionalSkills||[]),
                ...(careerDef.standardSkills||[]),
                ...(careerDef.professionalSkills||[]),
                ...profSel,
                combatSel? [combatSel] : []
              ].flat())].map(s=>(
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {bonusSel.map(skill=>{
              const base = baseStandard[skill]||baseProfessional[skill]||0;
              const alloc = bonusAlloc[skill]||0;
              return (
                <div key={skill} className="flex items-center my-3 space-x-4">
                  <div className="w-40">{skill} (base {base}%)</div>
                  <input
                    type="range" min={0} max={maxInc} step={1}
                    value={alloc}
                    onChange={handleBonus(skill)}
                    className="flex-1"
                  />
                  <div className="w-12 text-right">+{alloc}%</div>
                </div>
              );
            })}
          </div>

          <button
            className="btn btn-success mt-6"
            disabled={bonusLeft>0}
            onClick={()=>setStep(4)}
          >Done</button>
        </>
      )}
    </StepWrapper>
  );
}
