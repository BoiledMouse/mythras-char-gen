// src/steps/SkillsStep.jsx
import React, { useState } from 'react';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';
import StepWrapper from '../components/StepWrapper';

export function SkillsStep({ formData, onChange }) {
  const { culture: cultKey, career: careerKey, age = 0 } = formData;
  const cultureDef = cultures[cultKey] || {};
  const careerDef  = careers[careerKey] || {};

  // 1) Age buckets
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10 },
    { max: 27, bonus: 150, maxInc: 15 },
    { max: 43, bonus: 200, maxInc: 20 },
    { max: 64, bonus: 250, maxInc: 25 },
    { max: Infinity, bonus: 300, maxInc: 30 },
  ];
  const { bonus: initialPool, maxInc } = ageBuckets.find(b => age <= b.max);

  // 2) Base‐% helper
  const attrs = formData;
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]]||0,10);
    for (let i=1; i<parts.length; i+=2) {
      const op = parts[i], tok = parts[i+1];
      const v = /^\d+$/.test(tok) ? +tok : +attrs[tok]||0;
      val = op==='x' ? val*v : val+v;
    }
    return val;
  };

  // 3) Build base tables
  const baseStandard = {};
  skillsData.standard.forEach(({name,base})=> {
    let b = computeBase(base);
    if (["Customs","Native Tongue"].includes(name)) b += 40;
    baseStandard[name] = b;
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({name,base})=> {
    baseProfessional[name] = computeBase(base);
  });

  // 4) Which skills?
  const cultStd  = cultureDef.standardSkills    || [];
  const cultProf = cultureDef.professionalSkills || [];
  const carStd   = careerDef.standardSkills     || [];
  const carProf  = careerDef.professionalSkills || [];

  // 5) Phases & state
  const [phase,       setPhase      ] = useState(1);
  const [poolLeft,    setPoolLeft   ] = useState(initialPool);
  const [cultStdAlloc, setCultStdAlloc] = useState({});
  const [cultProfAlloc,setCultProfAlloc]= useState({});
  const [cultCombatSel, setCultCombatSel]= useState(null);
  const [cultCombatAlloc, setCultCombatAlloc] = useState(0);
  const [carStdAlloc, setCarStdAlloc ] = useState({});
  const [carProfAlloc,setCarProfAlloc] = useState({});
  const [bonusSel,    setBonusSel   ] = useState([]);
  const [bonusAlloc,  setBonusAlloc ] = useState({});

  const sum = o => Object.values(o).reduce((a,b)=>(a+(b||0)),0);

  // 6) Shared slider handler
  const handleAlloc = (setter, allocObj, key) => e => {
    let v = parseInt(e.target.value,10) || 0;
    if (v>0 && v<5) v = 0;                  // snap 1–4 → 0
    v = Math.min(maxInc, Math.max(0, v));   // clamp
    const delta = v - (allocObj[key]||0);
    if (delta <= poolLeft) {
      setter({ ...allocObj, [key]: v });
      setPoolLeft(pl => pl - delta);
    }
  };

  // 7) When “Finish” pressed on phase 3, write back into wizard state
  const finishAll = () => {
    const final = { ...baseStandard, ...baseProfessional };
    cultStd.forEach(s => final[s] += cultStdAlloc[s]||0);
    cultProf.forEach(s=> final[s] += cultProfAlloc[s]||0);
    if (cultCombatSel) final[cultCombatSel] += cultCombatAlloc;
    carStd.forEach(s => final[s] += carStdAlloc[s]||0);
    carProf.forEach(s=> final[s] += carProfAlloc[s]||0);
    bonusSel.forEach(s=> final[s] += bonusAlloc[s]||0);
    onChange('skills', final);
    setPhase(4);
  };

  return (
    <StepWrapper title="Skills">
      <p>Age ⇒ Pool: <strong>{initialPool}</strong> pts, Max/skill: <strong>+{maxInc}</strong></p>
      <p>Remaining: <strong>{poolLeft}</strong></p>

      {phase===1 && (
        <>
          <h3 className="font-semibold">Step 1: Cultural</h3>
          <div className="space-y-4">
            {cultStd.map(s=>(
              <div key={s} className="flex items-center space-x-4">
                <span className="w-40">{s} ({baseStandard[s]}%)</span>
                <input type="range" min={0} max={maxInc} step={1}
                  value={cultStdAlloc[s]||0}
                  onChange={handleAlloc(setCultStdAlloc,cultStdAlloc,s)}
                  className="flex-1"/>
                <span className="w-12 text-right">+{cultStdAlloc[s]||0}%</span>
              </div>
            ))}
            {cultProf.map(s=>(
              <div key={s} className="flex items-center space-x-4">
                <span className="w-40">{s} ({baseProfessional[s]}%)</span>
                <input type="range" min={0} max={maxInc} step={1}
                  value={cultProfAlloc[s]||0}
                  onChange={handleAlloc(setCultProfAlloc,cultProfAlloc,s)}
                  className="flex-1"/>
                <span className="w-12 text-right">+{cultProfAlloc[s]||0}%</span>
              </div>
            ))}
            <h4 className="mt-4">Combat Style</h4>
            {(cultureDef.combatStyles||[]).map(cs=>(
              <label key={cs} className="inline-flex items-center mr-4">
                <input type="radio" name="combat" className="mr-2"
                  checked={cultCombatSel===cs}
                  onChange={()=> setCultCombatSel(cs)} />{cs}
              </label>
            ))}
            {cultCombatSel && (
              <div className="flex items-center space-x-4 mt-2">
                <span className="w-40">{cultCombatSel}</span>
                <input type="range" min={0} max={maxInc} step={1}
                  value={cultCombatAlloc}
                  onChange={handleAlloc(setCultCombatAlloc,{[cultCombatSel]:cultCombatAlloc},cultCombatSel)}
                  className="flex-1"/>
                <span className="w-12 text-right">+{cultCombatAlloc}%</span>
              </div>
            )}
          </div>
          <button onClick={()=>setPhase(2)} className="mt-6 px-4 py-2 bg-gold">Next</button>
        </>
      )}

      {phase===2 && (
        <>
          <h3 className="font-semibold">Step 2: Career</h3>
          <div className="space-y-4">
            {carStd.map(s=>(
              <div key={s} className="flex items-center space-x-4">
                <span className="w-40">{s} ({baseStandard[s]}%)</span>
                <input type="range" min={0} max={maxInc} step={1}
                  value={carStdAlloc[s]||0}
                  onChange={handleAlloc(setCarStdAlloc,carStdAlloc,s)}
                  className="flex-1"/>
                <span className="w-12 text-right">+{carStdAlloc[s]||0}%</span>
              </div>
            ))}
            {carProf.map(s=>(
              <div key={s} className="flex items-center space-x-4">
                <span className="w-40">{s} ({baseProfessional[s]}%)</span>
                <input type="range" min={0} max={maxInc} step={1}
                  value={carProfAlloc[s]||0}
                  onChange={handleAlloc(setCarProfAlloc,carProfAlloc,s)}
                  className="flex-1"/>
                <span className="w-12 text-right">+{carProfAlloc[s]||0}%</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={()=>setPhase(1)} className="px-4 py-2 bg-gray-300">Back</button>
            <button onClick={()=>setPhase(3)} className="px-4 py-2 bg-gold">Next</button>
          </div>
        </>
      )}

      {phase===3 && (
        <>
          <h3 className="font-semibold">Step 3: Bonus & Hobby</h3>
          {/* bonus sliders */}
          <div className="space-y-4">
            {bonusSel.map(s=>(
              <div key={s} className="flex items-center space-x-4">
                <span className="w-40">{s} ({baseStandard[s]||baseProfessional[s]}%)</span>
                <input type="range" min={0} max={maxInc} step={1}
                  value={bonusAlloc[s]||0}
                  onChange={handleAlloc(setBonusAlloc,bonusAlloc,s)}
                  className="flex-1"/>
                <span className="w-12 text-right">+{bonusAlloc[s]||0}%</span>
              </div>
            ))}
          </div>
          {/* add hobby */}
          <div className="mt-6">
            <label className="block mb-1 font-medium">Add Hobby Skill</label>
            <select
              className="w-full border rounded p-2"
              onChange={e=>{
                const s = e.target.value;
                if(s && !bonusSel.includes(s)) setBonusSel(bs=>[...bs,s]);
              }}
            >
              <option value="">— pick a skill —</option>
              {[...cultStd,...cultProf,...carStd,...carProf]
                .filter((v,i,a)=>v && a.indexOf(v)===i)
                .map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={()=>setPhase(2)} className="px-4 py-2 bg-gray-300">Back</button>
            <button onClick={finishAll} className="px-4 py-2 bg-green-600 text-white">Finish</button>
          </div>
        </>
      )}
    </StepWrapper>
  );
}

export default SkillsStep;
