// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';
import StepWrapper from '../components/StepWrapper';

export function SkillsStep({ formData, onChange }) {
  const { age=0, culture: cultKey='', career: careerKey='' } = formData;
  const cultureDef = cultures[cultKey] || {};
  const careerDef = careers[careerKey] || {};

  // pull your attributes out of the wizard formData
  const { STR=0, DEX=0, CON=0, SIZ=0, INT=0, POW=0, CHA=0 } = formData;

  // and still grab updateCharacter to persist
  const { updateCharacter } = useCharacter();

  // age buckets
  const ageBuckets = [
    { max:16, bonus:100, maxInc:10 },
    { max:27, bonus:150, maxInc:15 },
    { max:43, bonus:200, maxInc:20 },
    { max:64, bonus:250, maxInc:25 },
    { max:Infinity, bonus:300, maxInc:30 },
  ];
  const { bonus: bonusPool=100, maxInc=10 } = ageBuckets.find(b=>age<=b.max)||{};
  const CULT_POOL = 100, CAREER_POOL = 100;

  // helper to compute a base % from e.g. "STR+DEX"
  const attrs = { STR,DEX,CON,SIZ,INT,POW,CHA };
  function computeBase(expr) {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let v = Number(attrs[parts[0]]||0);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i+1];
      const val = /^\d+$/.test(tok) ? +tok : Number(attrs[tok]||0);
      v = op==='x' ? v*val : v+val;
    }
    return v;
  }

  // build base tables
  const baseStandard = {};
  skillsData.standard.forEach(({name,base})=>{
    let b = computeBase(base);
    if (name==='Customs'||name==='Native Tongue') b+=40;
    baseStandard[name] = b;
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({name,base})=>{
    baseProfessional[name] = computeBase(base);
  });

  // state & pools
  const [step,setStep] = useState(1);
  const [cultLeft,setCult] = useState(CULT_POOL);
  const [carLeft,setCar] = useState(CAREER_POOL);
  const [bonusLeft,setBonus] = useState(bonusPool);

  // allocations
  const [cultStdAlloc,setCultStd]   = useState({});
  const [cultProfSel,setCultProfSel]= useState([]);
  const [cultProfAlloc,setCultProf] = useState({});
  const [combatSel,setCombatSel]     = useState('');
  const [combatAlloc,setCombatAlloc]= useState({});

  const [carStdAlloc,setCarStd]     = useState({});
  const [carProfSel,setCarProfSel]  = useState([]);
  const [carProfAlloc,setCarProf]   = useState({});

  const [bonusSel,setBonusSel]      = useState([]);
  const [bonusAlloc,setBonusAlloc]  = useState({});

  // generic slider-maker
  function mkHandler(alloc, setAlloc, left, setLeft) {
    return skill => e => {
      let v = parseInt(e.target.value,10)||0;
      if (v>0 && v<5) v = 0;
      v = Math.max(0, Math.min(maxInc, v));
      const delta = v - (alloc[skill]||0);
      if (delta <= left) {
        setAlloc({...alloc, [skill]: v});
        setLeft(l=>l-delta);
      }
    };
  }
  const handleCultStd  = mkHandler(cultStdAlloc, setCultStd, cultLeft, setCult);
  const handleCultProf = mkHandler(cultProfAlloc, setCultProf, cultLeft, setCult);
  const handleCombat   = mkHandler(combatAlloc,  setCombatAlloc, carLeft, setCar);
  const handleCarStd   = mkHandler(carStdAlloc,  setCarStd, carLeft, setCar);
  const handleCarProf  = mkHandler(carProfAlloc, setCarProf, carLeft, setCar);
  const handleBonus    = mkHandler(bonusAlloc,   setBonusAlloc, bonusLeft, setBonus);

  // toggle professional picks (max 3)
  const toggleCultProf = skill => {
    const sel = cultProfSel.includes(skill)
      ? cultProfSel.filter(s=>s!==skill)
      : cultProfSel.length<3 ? [...cultProfSel,skill] : cultProfSel;
    if (cultProfSel.includes(skill)) {
      setCult(c=>c + (cultProfAlloc[skill]||0));
      setCultProf(a=>{ let n={...a}; delete n[skill]; return n; });
    }
    setCultProfSel(sel);
  };
  const toggleCarProf = skill => {
    const sel = carProfSel.includes(skill)
      ? carProfSel.filter(s=>s!==skill)
      : carProfSel.length<3 ? [...carProfSel,skill] : carProfSel;
    if (carProfSel.includes(skill)) {
      setCar(c=>c + (carProfAlloc[skill]||0));
      setCarProf(a=>{ let n={...a}; delete n[skill]; return n; });
    }
    setCarProfSel(sel);
  };
  // pick 1 combat
  const pickCombat = skill => {
    if (combatSel) {
      setCar(c=>c + (combatAlloc[combatSel]||0));
      setCombatAlloc({});
    }
    setCombatSel(skill);
  };

  // when done with bonus step
  useEffect(()=>{
    if (step===4) {
      const final = {...baseStandard,...baseProfessional};
      (cultureDef.standardSkills||[]).forEach(s=>final[s]+=cultStdAlloc[s]||0);
      cultProfSel.forEach(s=>final[s]+=cultProfAlloc[s]||0);
      if(combatSel) final[combatSel]+=combatAlloc[combatSel]||0;
      (careerDef.standardSkills||[]).forEach(s=>final[s]+=carStdAlloc[s]||0);
      carProfSel.forEach(s=>final[s]+=carProfAlloc[s]||0);
      bonusSel.forEach(s=>final[s]+=bonusAlloc[s]||0);
      updateCharacter({ skills: final });
    }
  },[step]);

  // all unlocked skills for bonus step
  const allAvail = Array.from(new Set([
    ...(cultureDef.standardSkills||[]),
    ...(cultureDef.professionalSkills||[]),
    ...(careerDef.standardSkills||[]),
    ...(careerDef.professionalSkills||[]),
    ...cultProfSel, ...carProfSel,
    ...(combatSel?[combatSel]:[])
  ]));

  return (
    <StepWrapper title="Skills Allocation">
      <p>
        Age: <strong>{age}</strong> ⇒ Cult {CULT_POOL}, Career {CAREER_POOL}, Bonus {bonusPool}, Max +{maxInc}
      </p>

      {step===1 && <>
        <h3>Step 1: Cultural Skills ({cultLeft} pts left)</h3>
        {/* standard */}
        <h4>Standard</h4>
        { (cultureDef.standardSkills||[]).map(skill=>{
          const b=baseStandard[skill], v=cultStdAlloc[skill]||0;
          return (
            <div key={skill} className="flex items-center my-2">
              <div className="w-40">{skill} (base {b}%)</div>
              <input type="range" min={0} max={maxInc} step={1}
                     value={v} onChange={handleCultStd(skill)} className="flex-1"/>
              <div className="w-12 text-right">+{v}%</div>
            </div>
          );
        })}
        {/* professional */}
        <h4 className="mt-4">Professional (up to 3)</h4>
        { (cultureDef.professionalSkills||[]).map(skill=>{
          const b=baseProfessional[skill], sel=cultProfSel.includes(skill), v=cultProfAlloc[skill]||0;
          return (
            <div key={skill} className="mb-4">
              <label className="inline-flex items-center">
                <input type="checkbox" className="mr-2"
                       checked={sel} onChange={()=>toggleCultProf(skill)}/>
                {skill} (base {b}%)
              </label>
              {sel && (
                <div className="flex items-center mt-2">
                  <input type="range" min={0} max={maxInc} step={1}
                         value={v} onChange={handleCultProf(skill)} className="flex-1"/>
                  <div className="w-12 text-right">+{v}%</div>
                </div>
              )}
            </div>
          );
        })}
        {/* combat */}
        <h4 className="mt-4">Combat Styles (pick 1)</h4>
        { (cultureDef.combatStyles||[]).map(skill=>{
          const b=baseProfessional[skill], sel=combatSel===skill, v=combatAlloc[skill]||0;
          return (
            <div key={skill} className="mb-3">
              <label className="inline-flex items-center">
                <input type="radio" name="combat" className="mr-2"
                       checked={sel} onChange={()=>pickCombat(skill)}/>
                {skill} (base {b}%)
              </label>
              {sel && (
                <div className="flex items-center mt-2">
                  <input type="range" min={0} max={maxInc} step={1}
                         value={v} onChange={handleCombat(skill)} className="flex-1"/>
                  <div className="w-12 text-right">+{v}%</div>
                </div>
              )}
            </div>
          );
        })}
        <button className="btn btn-primary mt-6" disabled={cultLeft>0} onClick={()=>setStep(2)}>
          Next → Career
        </button>
      </>}

      {step===2 && <>
        <h3>Step 2: Career Skills ({carLeft} pts left)</h3>
        <h4>Standard</h4>
        { (careerDef.standardSkills||[]).map(skill=>{
          const b=baseStandard[skill], v=carStdAlloc[skill]||0;
          return (
            <div key={skill} className="flex items-center my-2">
              <div className="w-40">{skill} (base {b}%)</div>
              <input type="range" min={0} max={maxInc} step={1}
                     value={v} onChange={handleCarStd(skill)} className="flex-1"/>
              <div className="w-12 text-right">+{v}%</div>
            </div>
          );
        })}
        <h4 className="mt-4">Professional (up to 3)</h4>
        { (careerDef.professionalSkills||[]).map(skill=>{
          const b=baseProfessional[skill], sel=carProfSel.includes(skill), v=carProfAlloc[skill]||0;
          return (
            <div key={skill} className="mb-4">
              <label className="inline-flex items-center">
                <input type="checkbox" className="mr-2"
                       checked={sel} onChange={()=>toggleCarProf(skill)}/>
                {skill} (base {b}%)
              </label>
              {sel && (
                <div className="flex items-center mt-2">
                  <input type="range" min={0} max={maxInc} step={1}
                         value={v} onChange={handleCarProf(skill)} className="flex-1"/>
                  <div className="w-12 text-right">+{v}%</div>
                </div>
              )}
            </div>
          );
        })}
        <button className="btn btn-primary mt-6" disabled={carLeft>0} onClick={()=>setStep(3)}>
          Next → Bonus
        </button>
      </>}

      {step===3 && <>
        <h3>Step 3: Bonus / Hobby ({bonusLeft} pts left)</h3>
        { allAvail.map(skill=>{
          const b = baseStandard[skill]||baseProfessional[skill]||0;
          const v = bonusAlloc[skill]||0;
          return (
            <div key={skill} className="flex items-center my-2">
              <div className="w-40">{skill} (base {b}%)</div>
              <input type="range" min={0} max={maxInc} step={1}
                     value={v} onChange={handleBonus(skill)} className="flex-1"/>
              <div className="w-12 text-right">+{v}%</div>
            </div>
          );
        })}
        <div className="mt-6">
          <label className="font-medium block mb-2">Add Hobby Skill</label>
          <select className="form-control" defaultValue=""
            onChange={e=>{
              const s=e.target.value;
              if(s && !bonusSel.includes(s)){
                setBonusSel(bs=>[...bs,s]);
              }
            }}>
            <option value="" disabled>-- pick a skill --</option>
            {allAvail.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn btn-success mt-6" disabled={bonusLeft>0} onClick={()=>setStep(4)}>
          Done
        </button>
      </>}

    </StepWrapper>
  );
}
