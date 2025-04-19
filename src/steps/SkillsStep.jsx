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
    let val = parseInt(attrs[parts[0]]||0, 10);
    for (let i=1;i<parts.length;i+=2) {
      const op=parts[i], attr=parts[i+1];
      const v=parseInt(attrs[attr]||0,10);
      val = op==='x'? val*v : val+v;
    }
    return val;
  };

  // Base values
  const baseStandard = {};
  skillsData.standard.forEach(({name,base}) => {
    let b=computeBase(base);
    if(name==='Customs' || name==='Native Tongue') b+=40;
    baseStandard[name]=b;
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({name,base})=>{
    baseProfessional[name]=computeBase(base);
  });

  // Phase control 1,2,3
  const [phase,setPhase]=useState(1);

  // Phase1: culture
  const [cultStdAlloc,setCultStdAlloc]=useState({});
  const [cultProfSel,setCultProfSel]=useState([]);
  const [cultProfAlloc,setCultProfAlloc]=useState({});
  const [cultCombatSel,setCultCombatSel]=useState(null);
  const [cultCombatAlloc,setCultCombatAlloc]=useState(0);
  const CULT_POINTS=100;

  // Phase2: career
  const [careerStdAlloc,setCareerStdAlloc]=useState({});
  const [careerProfSel,setCareerProfSel]=useState([]);
  const [careerProfAlloc,setCareerProfAlloc]=useState({});
  const CAREER_POINTS=100;

  // Phase3: bonus
  const [bonusSel,setBonusSel]=useState([]);
  const [bonusAlloc,setBonusAlloc]=useState({});
  const BONUS_POINTS=150;

  const sum=(o)=>Object.values(o).reduce((a,b)=>(a+(b||0)),0);
  const clamp=(v)=>Math.max(5,Math.min(15,v));

  // Persist on finish
  useEffect(()=>{
    if(phase>3) {
      // build finalSkills object
      const finalSkills={...baseStandard,...baseProfessional};
      // add culture std
      Object.entries(cultStdAlloc).forEach(([s,v])=>finalSkills[s]+=v);
      // culture prof
      cultProfSel.forEach(s=>finalSkills[s]+=cultProfAlloc[s]||0);
      // combat style
      if(cultCombatSel) finalSkills[cultCombatSel]+=cultCombatAlloc;
      // career std (no selection limit)
      Object.entries(careerStdAlloc).forEach(([s,v])=>finalSkills[s]+=v);
      // career prof
      careerProfSel.forEach(s=>finalSkills[s]+=careerProfAlloc[s]||0);
      // bonus
      bonusSel.forEach(s=>finalSkills[s]+=bonusAlloc[s]||0);

      updateCharacter({
        baseStandard,baseProfessional,
        cultStdAlloc,cultProfSel,cultProfAlloc,cultCombatSel,cultCombatAlloc,
        careerStdAlloc,careerProfSel,careerProfAlloc,
        bonusSel,bonusAlloc,
        finalSkills
      });
    }
  },[phase]);

  // Render
  return (
    <div className="space-y-6">
      {phase===1 && (
        <div>
          <h3>Step 1: Cultural</h3>
          <p>Distribute {CULT_POINTS} points (5–15 each)</p>
          <h4>Standard Skills</h4>
          {(cultureDef.standardSkills || []).map(s=>(
            <div key={s} className="flex items-center">
              <span>{s} ({baseStandard[s]}%)</span>
              <input type="number" min={5} max={15}
                value={cultStdAlloc[s]||0}
                onChange={e=>{
                  const v=clamp(+e.target.value);
                  const used=sum(cultStdAlloc)- (cultStdAlloc[s]||0) + v;
                  if(used<=CULT_POINTS) setCultStdAlloc({...cultStdAlloc,[s]:v});
                }}/>
            </div>
          ))}
          <h4>Professional Skills (max 3)</h4>
          {(cultureDef.professionalSkills || []).map(s=>(
            <label key={s}>
              <input type="checkbox" checked={cultProfSel.includes(s)}
                onChange={()=>{
                  setCultProfSel(prev=> prev.includes(s)? prev.filter(x=>x!==s): prev.length<3? [...prev,s]: prev);
                }}/>{s}
            </label>
          ))}
          {cultProfSel.map(s=>(
            <div key={s} className="flex items-center">
              <span>{s} ({baseProfessional[s]}%)</span>
              <input type="number" min={5} max={15}
                value={cultProfAlloc[s]||0}
                onChange={e=>{
                  const v=clamp(+e.target.value);
                  const used=sum(cultStdAlloc)+sum(cultProfAlloc)- (cultProfAlloc[s]||0) + v;
                  if(used<=CULT_POINTS) setCultProfAlloc({...cultProfAlloc,[s]:v});
                }}/>
            </div>
          ))}
          <h4>Combat Style (select 1)</h4>
          {(skillsData.combatStyles || []).map(cs=>(
            <label key={cs}>
              <input type="radio" name="combat" checked={cultCombatSel===cs}
                onChange={()=>setCultCombatSel(cs)}/>{cs}
            </label>
          ))}
          {cultCombatSel && (
            <div className="flex items-center">
              <span>{cultCombatSel}</span>
              <input type="number" min={5} max={15}
                value={cultCombatAlloc}
                onChange={e=>{
                  const v=clamp(+e.target.value);
                  const used=sum(cultStdAlloc)+sum(cultProfAlloc)+ v;
                  if(used<=CULT_POINTS) setCultCombatAlloc(v);
                }}/>
            </div>
          )}
          <button onClick={()=>setPhase(2)}>Next</button>
        </div>
      )}

      {phase===2 && (
        <div>
          <h3>Step 2: Career</h3>
          <p>Distribute {CAREER_POINTS} points (5–15 each)</p>
          <h4>Standard Skills</h4>
          {(careerDef.standardSkills || []).map(s=>(
            <div key={s} className="flex items-center">
              <span>{s} ({baseStandard[s]}%)</span>
              <input type="number" min={5} max={15}
                value={careerStdAlloc[s]||0}
                onChange={e=>{
                  const v=clamp(+e.target.value);
                  const used=sum(careerStdAlloc)- (careerStdAlloc[s]||0) + v;
                  if(used<=CAREER_POINTS) setCareerStdAlloc({...careerStdAlloc,[s]:v});
                }}/>
            </div>
          ))}
          <h4>Professional Skills (max 3)</h4>
          {(careerDef.professionalSkills || []).map(s=>(
            <label key={s}>
              <input type="checkbox" checked={careerProfSel.includes(s)}
                onChange={()=>{
                  setCareerProfSel(prev=> prev.includes(s)? prev.filter(x=>x!==s): prev.length<3? [...prev,s]: prev);
                }}/>{s}
            </label>
          ))}
          {careerProfSel.map(s=>(
            <div key={s} className="flex items-center">
              <span>{s} ({baseProfessional[s]}%)</span>
              <input type="number" min={5} max={15}
                value={careerProfAlloc[s]||0}
                onChange={e=>{
                  const v=clamp(+e.target.value);
                  const used=sum(careerStdAlloc)+sum(careerProfAlloc)- (careerProfAlloc[s]||0) + v;
                  if(used<=CAREER_POINTS) setCareerProfAlloc({...careerProfAlloc,[s]:v});
                }}/>
            </div>
          ))}
          <div>
            <button onClick={()=>setPhase(1)}>Back</button>
            <button onClick={()=>setPhase(3)}>Next</button>
          </div>
        </div>
      )}

      {phase===3 && (
        <div>
          <h3>Step 3: Bonus</h3>
          <p>Distribute {BONUS_POINTS} points (5–15 each) and add one hobby</p>
          <div>
            <button onClick={()=>setPhase(2)}>Back</button>
            <button onClick={()=>setPhase(4)}>Finish</button>
          </div>
        </div>
      )}

      {phase>3 && (
        <div>
          <h3>Done!</h3>
          <button onClick={()=>updateCharacter({step:'done'})}>Review</button>
        </div>
      )}
    </div>
  );
}
