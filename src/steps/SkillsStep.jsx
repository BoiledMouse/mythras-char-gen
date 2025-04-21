// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import skillsData    from '../data/skills.json';
import StepWrapper   from '../components/StepWrapper';

export default function SkillsStep({ formData, onChange }) {
  // 1) pull culture, career & age from the wizard's formData
  const { culture: cultKey, career: careerKey, age = 0 } = formData;

  // 2) import the JSON defs
  const cultureDef = require('../data/cultures.json')[cultKey]   || {};
  const careerDef  = require('../data/careers.json')[careerKey]  || {};

  // 3) age buckets (exactly as before)
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10 },
    { max: 27, bonus: 150, maxInc: 15 },
    { max: 43, bonus: 200, maxInc: 20 },
    { max: 64, bonus: 250, maxInc: 25 },
    { max: Infinity, bonus: 300, maxInc: 30 },
  ];
  const { bonus: BONUS_POINTS, maxInc: BONUS_MAX } =
    ageBuckets.find(b => age <= b.max);

  // 4) base‑percent helper (reads attributes from formData)
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(formData[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i+1];
      const v  = /^\d+$/.test(tok) ? +tok : +(formData[tok]||0);
      val = op==='x'? val*v : val+v;
    }
    return val;
  };

  // 5) build base tables
  const baseStandard = {};
  skillsData.standard.forEach(({name,base}) => {
    let b = computeBase(base);
    if (["Customs","Native Tongue"].includes(name)) b += 40;
    baseStandard[name] = b;
  });
  const baseProf = {};
  skillsData.professional.forEach(({name,base}) => {
    baseProf[name] = computeBase(base);
  });

  // 6) pick only the skills that apply
  const cultStd = cultureDef.standardSkills   || [];
  const cultProf= cultureDef.professionalSkills|| [];
  const carStd  = careerDef.standardSkills    || [];
  const carProf = careerDef.professionalSkills|| [];

  // 7) wizard state for each phase
  const [phase,       setPhase      ] = useState(1);
  const [poolCult,    setPoolCult   ] = useState(100);
  const [poolCar,     setPoolCar    ] = useState(100);
  const [poolBonus,   setPoolBonus  ] = useState(BONUS_POINTS);
  const [cultStdAlloc,   setCultStdAlloc] = useState({});
  const [cultProfSel,    setCultProfSel ] = useState([]);
  const [cultProfAlloc,  setCultProfAlloc] = useState({});
  const [carStdAlloc,    setCarStdAlloc ] = useState({});
  const [carProfSel,     setCarProfSel  ] = useState([]);
  const [carProfAlloc,   setCarProfAlloc] = useState({});
  const [bonusSel,       setBonusSel    ] = useState([]);
  const [bonusAlloc,     setBonusAlloc  ] = useState({});

  // 8) slider logic
  const handleAlloc = (setter, allocObj, key, pool, setPool, maxInc) => e => {
    let v = parseInt(e.target.value,10)||0;
    if (v>0 && v<5) v=0;
    v = Math.min(maxInc,Math.max(0,v));
    const delta = v - (allocObj[key]||0);
    if (delta <= pool) {
      setter({...allocObj,[key]:v});
      setPool(p=>p-delta);
    }
  };

  // 9) once Bonus phase runs out, push everything back to formData
  useEffect(() => {
    if (phase===3 && poolBonus===0) {
      const final = {...baseStandard, ...baseProf};
      cultStd.forEach(s=> final[s]+=cultStdAlloc[s]||0);
      cultProfSel.forEach(s=> final[s]+=cultProfAlloc[s]||0);
      carStd.forEach(s=> final[s]+=carStdAlloc[s]||0);
      carProfSel.forEach(s=> final[s]+=carProfAlloc[s]||0);
      bonusSel.forEach(s=> final[s]+=bonusAlloc[s]||0);
      onChange('skills', final);
      onChange('step','done_skills');
    }
  },[phase,poolBonus]);

  return (
    <StepWrapper title="Skills">
      <div className="flex space-x-4 mb-4">
        {['Cultural','Career','Bonus'].map((l,i)=>(
          <button
            key={l}
            disabled={i+1>phase}
            onClick={()=> setPhase(i+1)}
            className={phase===i+1 ? 'font-bold border-b-2':'opacity-50'}
          >{l}</button>
        ))}
      </div>

      {phase===1 && (
        <>
          <p>Culture Pool: <b>{poolCult}</b> pts</p>
          {cultStd.map(s=>{
            const base=formData[s]||baseStandard[s]||0;
            const extra=cultStdAlloc[s]||0;
            return (
              <div key={s} className="flex items-center my-2">
                <div className="flex-1">
                  <label>{s} (Base {base}%)</label>
                  <input
                    type="range" min={0} max={15} step={1}
                    value={extra}
                    onChange={handleAlloc(
                      setCultStdAlloc,cultStdAlloc,s,
                      poolCult,setPoolCult,15
                    )}
                  />
                </div>
                <div className="w-12 text-right">+{extra}</div>
              </div>
            );
          })}

          <h4 className="mt-4">Prof. (max 3)</h4>
          <div className="flex flex-wrap gap-2">
            {cultProf.map(s=>(
              <label key={s}>
                <input
                  type="checkbox"
                  checked={cultProfSel.includes(s)}
                  onChange={()=>{
                    setCultProfSel(sel=>
                      sel.includes(s)
                        ? sel.filter(x=>x!==s)
                        : sel.length<3?[...sel,s]:sel
                    );
                  }}
                /> {s}
              </label>
            ))}
          </div>
          {cultProfSel.map(s=>{
            const base=baseProf[s], extra=cultProfAlloc[s]||0;
            return (
              <div key={s} className="flex items-center my-2">
                <div className="flex-1">
                  <label>{s} (Base {base}%)</label>
                  <input
                    type="range" min={0} max={15} step={1}
                    value={extra}
                    onChange={handleAlloc(
                      setCultProfAlloc,cultProfAlloc,s,
                      poolCult,setPoolCult,15
                    )}
                  />
                </div>
                <div className="w-12 text-right">+{extra}</div>
              </div>
            );
          })}

          <button
            className="mt-4 btn-primary"
            disabled={poolCult>0}
            onClick={()=>setPhase(2)}
          >Next: Career</button>
        </>
      )}

      {phase===2 && (
        <>
          <p>Career Pool: <b>{poolCar}</b> pts</p>
          {carStd.map(s=>{
            const base=formData[s]||baseStandard[s]||0;
            const extra=carStdAlloc[s]||0;
            return (
              <div key={s} className="flex items-center my-2">
                <div className="flex-1">
                  <label>{s} (Base {base}%)</label>
                  <input
                    type="range" min={0} max={15} step={1}
                    value={extra}
                    onChange={handleAlloc(
                      setCarStdAlloc,carStdAlloc,s,
                      poolCar,setPoolCar,15
                    )}
                  />
                </div>
                <div className="w-12 text-right">+{extra}</div>
              </div>
            );
          })}

          <h4 className="mt-4">Prof. (max 3)</h4>
          <div className="flex flex-wrap gap-2">
            {carProf.map(s=>(
              <label key={s}>
                <input
                  type="checkbox"
                  checked={carProfSel.includes(s)}
                  onChange={()=>{
                    setCarProfSel(sel=>
                      sel.includes(s)
                        ? sel.filter(x=>x!==s)
                        : sel.length<3?[...sel,s]:sel
                    );
                  }}
                /> {s}
              </label>
            ))}
          </div>
          {carProfSel.map(s=>{
            const base=baseProf[s], extra=carProfAlloc[s]||0;
            return (
              <div key={s} className="flex items-center my-2">
                <div className="flex-1">
                  <label>{s} (Base {base}%)</label>
                  <input
                    type="range" min={0} max={15} step={1}
                    value={extra}
                    onChange={handleAlloc(
                      setCarProfAlloc,carProfAlloc,s,
                      poolCar,setPoolCar,15
                    )}
                  />
                </div>
                <div className="w-12 text-right">+{extra}</div>
              </div>
            );
          })}

          <div className="mt-4 flex space-x-2">
            <button onClick={()=>setPhase(1)} className="btn-secondary">Back</button>
            <button
              onClick={()=>setPhase(3)}
              disabled={poolCar>0}
              className="btn-primary"
            >Next: Bonus</button>
          </div>
        </>
      )}

      {phase===3 && (
        <>
          <p>
            Age: <b>{age}</b> ⇒ Pool <b>{BONUS_POINTS}</b>,
            max each +<b>{BONUS_MAX}</b>
          </p>
          <p>Remaining: <b>{poolBonus}</b></p>
          {bonusSel.map(s=>{
            const base = baseStandard[s]||baseProf[s]||0;
            const ext  = bonusAlloc[s]||0;
            return (
              <div key={s} className="flex items-center my-2">
                <div className="flex-1">
                  <label>{s} (Base {base}%)</label>
                  <input
                    type="range" min={0} max={BONUS_MAX} step={1}
                    value={ext}
                    onChange={handleAlloc(
                      setBonusAlloc,bonusAlloc,s,
                      poolBonus,setPoolBonus,BONUS_MAX
                    )}
                  />
                </div>
                <div className="w-12 text-right">+{ext}</div>
              </div>
            );
          })}

          <div className="mt-4">
            <label>Add Hobby:</label>
            <select
              className="w-full border rounded p-2"
              onChange={e=>{
                const v=e.target.value;
                if(v&&!bonusSel.includes(v)) setBonusSel(a=>[...a,v]);
              }}
            >
              <option value="">— pick a skill —</option>
              {[...cultStd,...cultProf,...carStd,...carProf]
                .filter((v,i,a)=>v && a.indexOf(v)===i)
                .map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </>
      )}
    </StepWrapper>
  );
}
