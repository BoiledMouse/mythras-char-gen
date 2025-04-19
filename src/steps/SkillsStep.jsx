// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';

export function SkillsStep() {
  const { character, updateCharacter } = useCharacter();
  const attrs = character;
  const cultureDef = cultures[character.culture] || {};
  const careerDef = careers[character.career] || {};

  // Compute base from attributes
  const computeBase = (expr) => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]], 10) || 0;
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], attr = parts[i+1];
      const v = parseInt(attrs[attr], 10) || 0;
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // Base values
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

  // --- Phase State ---
  const [phase, setPhase] = useState(1);

  // Phase 1: Cultural
  const [cultStandardAlloc, setCultStandardAlloc] = useState({});
  const [cultProfSelected, setCultProfSelected] = useState([]);
  const [cultProfAlloc, setCultProfAlloc] = useState({});
  const [cultCombat, setCultCombat] = useState(null);
  const [cultCombatAlloc, setCultCombatAlloc] = useState(0);
  const [cultPoints, setCultPoints] = useState(100);

  // Phase 2: Career
  const [careerProfSelected, setCareerProfSelected] = useState([]);
  const [careerAlloc, setCareerAlloc] = useState({});
  const [careerPoints, setCareerPoints] = useState(100);

  // Phase 3: Bonus
  const [bonusSelected, setBonusSelected] = useState([]);
  const [bonusAlloc, setBonusAlloc] = useState({});
  const [bonusPoints, setBonusPoints] = useState(150);

  const sum = (o) => Object.values(o).reduce((a,b)=>a+(b||0),0);
  const clampAlloc = (v) => v > 0 && v < 5 ? 5 : v > 15 ? 15 : v < 0 ? 0 : v;

  // Persist when done
  useEffect(() => {
    if (phase > 3) {
      const finalSkills = {
        ...baseStandard,
        ...baseProfessional
      };
      // accumulate allocations
      Object.entries(cultStandardAlloc).forEach(([s,v]) => finalSkills[s]= (finalSkills[s]||0)+v);
      cultProfSelected.forEach(s => finalSkills[s] = (finalSkills[s]||0)+ (cultProfAlloc[s]||0));
      if (cultCombat) finalSkills[cultCombat]+=(cultCombatAlloc||0);
      careerProfSelected.forEach(s => finalSkills[s] = (finalSkills[s]||0)+ (careerAlloc[s]||0));
      bonusSelected.forEach(s => finalSkills[s] = (finalSkills[s]||0)+ (bonusAlloc[s]||0));

      updateCharacter({
        baseStandard, baseProfessional,
        cultStandardAlloc, cultProfSelected, cultProfAlloc, cultCombat, cultCombatAlloc,
        careerProfSelected, careerAlloc,
        bonusSelected, bonusAlloc,
        finalSkills
      });
    }
  }, [phase]);

  return (
    <div className="space-y-6">
      {phase === 1 && (
        <div>
          <h3 className="font-semibold">Step 1: Cultural Skills</h3>
          <p>Allocate up to 100 points (5–15 per skill)</p>
          <div className="mt-4">
            <h4 className="font-medium">Standard (Culture)</h4>
            {cultureDef.standardSkills.map(s => (
              <div key={s} className="flex items-center mb-1">
                <span className="w-32">{s} (Base {baseStandard[s]}%)</span>
                <input type="number" min={0} max={15}
                  value={cultStandardAlloc[s]||0}
                  onChange={e=>{
                    const v=clampAlloc(+e.target.value);
                    const prev=cultStandardAlloc[s]||0;
                    const used=sum(cultStandardAlloc)-prev;
                    if (used+v<=100) setCultStandardAlloc({...cultStandardAlloc,[s]:v});
                  }}
                  className="w-20 border"/>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h4 className="font-medium">Professional (select up to 3)</h4>
            {cultureDef.professionalSkills.map(s => (
              <label key={s} className="inline-flex items-center mr-4">
                <input type="checkbox" checked={cultProfSelected.includes(s)} onChange={()=>{
                  setCultProfSelected(prev=> prev.includes(s)?prev.filter(x=>x!==s):prev.length<3?[...prev,s]:prev);
                }} className="mr-2"/>{s}
              </label>
            ))}
            <div className="mt-2">
              {cultProfSelected.map(s=>(
                <div key={s} className="flex items-center mb-1">
                  <span className="w-32">{s} (Base {baseProfessional[s]}%)</span>
                  <input type="number" min={0} max={15}
                    value={cultProfAlloc[s]||0}
                    onChange={e=>{
                      const v=clampAlloc(+e.target.value);
                      const prev=cultProfAlloc[s]||0;
                      const used=sum(cultProfAlloc)-prev+sum(cultStandardAlloc);
                      if(used+v<=100) setCultProfAlloc({...cultProfAlloc,[s]:v});
                    }}
                    className="w-20 border"/>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-medium">Combat Style (select 1)</h4>
            {skillsData.combatStyles.map(cs=>(
              <label key={cs} className="inline-flex items-center mr-4">
                <input type="radio" name="combat" checked={cultCombat===cs} onChange={()=>setCultCombat(cs)} className="mr-2"/>{cs}
              </label>
            ))}
            {cultCombat && (
              <div className="mt-2 flex items-center">
                <span className="w-32">{cultCombat}</span>
                <input type="number" min={0} max={15}
                  value={cultCombatAlloc}
                  onChange={e=>{
                    const v=clampAlloc(+e.target.value);
                    const used=sum(cultStandardAlloc)+sum(cultProfAlloc);
                    if(used+v<=100) setCultCombatAlloc(v);
                  }}
                  className="w-20 border"/>
              </div>
            )}
          </div>
          <button onClick={()=>setPhase(2)} className="mt-4 px-4 py-2 bg-gold">Next</button>
        </div>
      )}

      {phase === 2 && (
        <div>
          <h3 className="font-semibold">Step 2: Career Skills</h3>
          <p>Allocate up to 100 points (5–15 per skill)</p>
          <div className="mt-4">
            <h4 className="font-medium">Standard (Career)</h4>
            {careerDef.standardSkills.map(s=>(
              <div key={s} className="flex items-center mb-1">
                <span className="w-32">{s} (Base {baseStandard[s]}%)</span>
                <input type="number" min={0} max={15}
                  value={careerAlloc[s]||0}
                  onChange={e=>{
                    const v=clampAlloc(+e.target.value);
                    const prev=careerAlloc[s]||0;
                    const used=sum(careerAlloc)-prev;
                    if(used+v<=100) setCareerAlloc({...careerAlloc,[s]:v});
                  }}
                  className="w-20 border"/>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h4 className="font-medium">Professional (select up to 3)</h4>
            {careerDef.professionalSkills.map(s=>(
              <label key={s} className="inline-flex items-center mr-4">
                <input type="checkbox" checked={careerProfSelected.includes(s)} onChange={()=>{
                  setCareerProfSelected(prev=> prev.includes(s)?prev.filter(x=>x!==s):prev.length<3?[...prev,s]:prev);
                }} className="mr-2"/>{s}
              </label>
            ))}
            <div className="mt-2">
              {careerProfSelected.map(s=>(
                <div key={s} className="flex items-center mb-1">
                  <span className="w-32">{s} (Base {baseProfessional[s]}%)</span>
                  <input type="number" min={0} max={15}
                    value={careerAlloc[s]||0}
                    onChange={e=>{
                      const v=clampAlloc(+e.target.value);
                      const prev=careerAlloc[s]||0;
                      const used=sum(careerAlloc)-prev;
                      if(used+v<=100) setCareerAlloc({...careerAlloc,[s]:v});
                    }}
                    className="w-20 border"/>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button onClick={()=>setPhase(1)} className="px-4 py-2 bg-gray-300">Back</button>
            <button onClick={()=>setPhase(3)} className="px-4 py-2 bg-gold">Next</button>
          </div>
        </div>
      )}

      {phase === 3 && (
        <div>
          <h3 className="font-semibold">Step 3: Bonus Skills</n          <p>Allocate up to 150 points (5–15 per skill), you can add one new hobby skill.</p>
          <div className="mt-4">
            <label className="block mb-2">Add Hobby Skill:</label>
            <select onChange={e=>{
              const s=e.target.value;
              if(s && !bonusSelected.includes(s)) setBonusSelected(prev=>[...prev,s]);
            }} className="border p-1">
              <option value="">-- select --</option>
              {skillsData.standard.concat(skillsData.professional).map(({name})=>(
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            {[...cultStandardAlloc, ...cultProfAlloc, ...careerAlloc].map((_,i)=>(<div key={i}/>))}
            {/* TODO: render inputs for all previously chosen skills and bonusSelected */}
          </div>
          <div className="mt-4 flex space-x-2">
            <button onClick={()=>setPhase(2)} className="px-4 py-2 bg-gray-300">Back</button>
            <button onClick={()=>setPhase(4)} className="px-4 py-2 bg-gold">Finish</button>
          </div>
        </div>
      )}

      {phase > 3 && (
        <div>
          <h3 className="font-semibold">Skills Complete!</h3>
          <button onClick={()=>updateCharacter({step:'done'})} className="px-4 py-2 bg-green-600 text-white">Review</button>
        </div>
      )}
    </div>
  );
}
