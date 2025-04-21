// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter }     from '../context/characterContext';
import cultures             from '../data/cultures.json';
import careers              from '../data/careers.json';
import skillsData           from '../data/skills.json';
import StepWrapper          from '../components/StepWrapper';

export function SkillsStep() {
  const { character, updateCharacter } = useCharacter();
  const {
    culture: cultKey,
    career:  careerKey,
    age = 0,
    STR = 0, DEX = 0, CON = 0, SIZ = 0, INT = 0, POW = 0, CHA = 0
  } = character;

  const cultureDef = cultures[cultKey] || {};
  const careerDef  = careers[careerKey] || {};

  // 1) Phase pools
  const CULT_POINTS  = cultureDef.skillPoints || 100;  // e.g. defined in your cultures.json
  const CAREER_POINTS= careerDef.skillPoints  || 100;  // likewise in careers.json

  // 2) Age‐based bonus
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10, rolls: 0 },
    { max: 27, bonus: 150, maxInc: 15, rolls: 1 },
    { max: 43, bonus: 200, maxInc: 20, rolls: 2 },
    { max: 64, bonus: 250, maxInc: 25, rolls: 3 },
    { max: Infinity, bonus: 300, maxInc: 30, rolls: 4 },
  ];
  const { bonus: BONUS_POINTS, maxInc } =
    ageBuckets.find(b => age <= b.max);

  // 3) Base‐skill computation
  const attrs = { STR, DEX, CON, SIZ, INT, POW, CHA };
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let v = Number(attrs[parts[0]]||0);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i+1];
      const n  = /^\d+$/.test(tok) ? Number(tok) : Number(attrs[tok]||0);
      v = op === 'x' ? v*n : v+n;
    }
    return v;
  };
  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let b = computeBase(base);
    if (name==='Customs'||name==='Native Tongue') b+=40;
    baseStandard[name] = b;
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfessional[name] = computeBase(base);
  });

  // 4) Which skills apply?
  const cultStdSkills = cultureDef.standardSkills    || [];
  const cultProfSkills= cultureDef.professionalSkills|| [];
  const carStdSkills  = careerDef.standardSkills     || [];
  const carProfSkills = careerDef.professionalSkills || [];

  // 5) State: phase & pools & allocations
  const [phase,        setPhase       ] = useState(1);
  const [cultLeft,     setCultLeft    ] = useState(CULT_POINTS);
  const [carLeft,      setCarLeft     ] = useState(CAREER_POINTS);
  const [bonusLeft,    setBonusLeft   ] = useState(BONUS_POINTS);

  const [cultStdAlloc, setCultStdAlloc] = useState({});
  const [cultProfAlloc,setCultProfAlloc]=useState({});
  const [cultCombat,   setCultCombat  ] = useState({ skill: null, pts: 0 });

  const [carStdAlloc,  setCarStdAlloc ] = useState({});
  const [carProfAlloc, setCarProfAlloc]= useState({});

  const [bonusSel,     setBonusSel    ] = useState([]);
  const [bonusAlloc,   setBonusAlloc  ] = useState({});

  // 6) helper for updating any pool
  const handleAlloc = (alloc, setAlloc, left, setLeft) => skill => e => {
    let v = parseInt(e.target.value,10)||0;
    if (v>0 && v<5) v=0;                // snap 1–4 → 0
    v = Math.max(0, Math.min(maxInc, v));
    const prev = alloc[skill]||0, delta = v - prev;
    // allow negative delta (refund) or positive within left
    if (delta <= left) {
      setAlloc({ ...alloc, [skill]: v });
      setLeft(l => l - delta);
    }
  };

  // 7) When phase>3 commit
  useEffect(()=>{
    if (phase>3) {
      const final = { ...baseStandard, ...baseProfessional };
      cultStdSkills.forEach(s=> final[s]+= cultStdAlloc[s]||0);
      cultProfSkills.forEach(s=> final[s]+= cultProfAlloc[s]||0);
      if (cultCombat.skill) final[cultCombat.skill]+= cultCombat.pts;
      carStdSkills.forEach(s=> final[s]+= carStdAlloc[s]||0);
      carProfSkills.forEach(s=> final[s]+= carProfAlloc[s]||0);
      bonusSel.forEach(s=> final[s]+= bonusAlloc[s]||0);
      updateCharacter({ skills: final });
    }
  },[phase]);

  return (
    <StepWrapper title="Skills">
      <p>
        Age: <strong>{age}</strong> ⇒  
        Cultural Pool: <strong>{CULT_POINTS}</strong>,  
        Career Pool: <strong>{CAREER_POINTS}</strong>,<br/>
        Bonus Pool: <strong>{BONUS_POINTS}</strong>,  
        Max per skill: <strong>+{maxInc}</strong>
      </p>

      {phase===1 && (
        <>
          <h3 className="italic">Step 1: Cultural Skills</h3>
          <p>Pts left: <strong>{cultLeft}</strong></p>
          <div className="space-y-4">
            {cultStdSkills.map(s=>(
              <div key={s} className="flex items-center space-x-4">
                <label className="w-48">{s} (Base {baseStandard[s]}%)</label>
                <input
                  type="number" min={0} max={maxInc}
                  value={cultStdAlloc[s]||0}
                  onChange={handleAlloc(cultStdAlloc,setCultStdAlloc,cultLeft,setCultLeft)(s)}
                  className="w-16 border rounded p-1"
                />
              </div>
            ))}
            {cultProfSkills.map(s=>(
              <div key={s} className="flex items-center space-x-4">
                <label className="w-48">{s} (Base {baseProfessional[s]}%)</label>
                <input
                  type="number" min={0} max={maxInc}
                  value={cultProfAlloc[s]||0}
                  onChange={handleAlloc(cultProfAlloc,setCultProfAlloc,cultLeft,setCultLeft)(s)}
                  className="w-16 border rounded p-1"
                />
              </div>
            ))}
            {cultureDef.combatStyles?.length > 0 && (
              <>
                <label className="block mt-4 font-medium">Combat Style</label>
                {cultureDef.combatStyles.map(style=>(
                  <div key={style} className="flex items-center space-x-4">
                    <input
                      type="radio"
                      name="combatStyle"
                      checked={cultCombat.skill===style}
                      onChange={()=>setCultCombat({ skill: style, pts: 0 })}
                    />
                    <label className="w-48">{style}</label>
                    {cultCombat.skill===style && (
                      <input
                        type="number" min={0} max={maxInc}
                        value={cultCombat.pts}
                        onChange={e=>{
                          let v= parseInt(e.target.value,10)||0;
                          v=Math.max(0,Math.min(maxInc,v));
                          const delta = v-(cultCombat.pts||0);
                          if(delta<=cultLeft){
                            setCultCombat({ skill: style, pts: v });
                            setCultLeft(l=>l-delta);
                          }
                        }}
                        className="w-16 border rounded p-1"
                      />
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
          <button
            disabled={cultLeft>0}
            onClick={()=>setPhase(2)}
            className="mt-6 px-4 py-2 bg-gold disabled:opacity-50"
          >
            Next: Career Skills
          </button>
        </>
      )}

      {phase===2 && (
        <>
          <h3 className="italic">Step 2: Career Skills</h3>
          <p>Pts left: <strong>{carLeft}</strong></p>
          <div className="space-y-4">
            {carStdSkills.map(s=>(
              <div key={s} className="flex items-center space-x-4">
                <label className="w-48">{s} (Base {baseStandard[s]}%)</label>
                <input
                  type="number" min={0} max={maxInc}
                  value={carStdAlloc[s]||0}
                  onChange={handleAlloc(carStdAlloc,setCarStdAlloc,carLeft,setCarLeft)(s)}
                  className="w-16 border rounded p-1"
                />
              </div>
            ))}
            {carProfSkills.map(s=>(
              <div key={s} className="flex items-center space-x-4">
                <label className="w-48">{s} (Base {baseProfessional[s]}%)</label>
                <input
                  type="number" min={0} max={maxInc}
                  value={carProfAlloc[s]||0}
                  onChange={handleAlloc(carProfAlloc,setCarProfAlloc,carLeft,setCarLeft)(s)}
                  className="w-16 border rounded p-1"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={()=>setPhase(1)} className="px-4 py-2 bg-gray-300">Back</button>
            <button
              disabled={carLeft>0}
              onClick={()=>setPhase(3)}
              className="px-4 py-2 bg-gold disabled:opacity-50"
            >
              Next: Bonus Skills
            </button>
          </div>
        </>
      )}

      {phase===3 && (
        <>
          <h3 className="italic">Step 3: Age‑based Bonus Skills</h3>
          <p>Pts left: <strong>{bonusLeft}</strong></p>

          <div className="mt-4">
            <label className="block font-medium">Add Hobby Skill</label>
            <select
              className="w-full border rounded p-2"
              onChange={e=>{
                const s = e.target.value;
                if(s && !bonusSel.includes(s)){
                  setBonusSel(sel=>[...sel,s]);
                }
              }}
            >
              <option value="">— pick a skill —</option>
              {[...cultStdSkills, ...cultProfSkills, ...carStdSkills, ...carProfSkills]
                .filter((v,i,a)=>v && a.indexOf(v)===i)
                .map(s=> <option key={s} value={s}>{s}</option>)
              }
            </select>
          </div>

          <div className="space-y-4 mt-4">
            {bonusSel.map(skill=>{
              const base = baseStandard[skill] ?? baseProfessional[skill] ?? 0;
              const extra= bonusAlloc[skill]||0;
              return (
                <div key={skill} className="flex items-center space-x-4">
                  <label className="w-48">
                    {skill} (Base {base}%)
                  </label>
                  <input
                    type="range"
                    min={0} max={maxInc} step={1}
                    value={extra}
                    onChange={handleAlloc(bonusAlloc,setBonusAlloc,bonusLeft,setBonusLeft)(skill)}
                    className="flex-1"
                  />
                  <div className="w-12 text-right">+{extra}%</div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={()=>setPhase(2)} className="px-4 py-2 bg-gray-300">Back</button>
            <button
              disabled={bonusLeft>0}
              onClick={()=>setPhase(4)}
              className="px-4 py-2 bg-green-600 text-white disabled:opacity-50"
            >
              Finish
            </button>
          </div>
        </>
      )}
    </StepWrapper>
  );
}
