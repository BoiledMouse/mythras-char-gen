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

// safe arrays
const cultureStandardSkills = cultureDef.standardSkills || [];
const cultureProfSkills = cultureDef.professionalSkills || [];
const availableCombatStyles = cultureDef.combatStyles || [];
const careerStandardSkills = careerDef.standardSkills || [];
const careerProfSkills = careerDef.professionalSkills || [];

// Compute base skill from attributes, handling numeric multipliers
const computeBase = expr => {
const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
let val = parseInt(attrs[parts[0]] || 0, 10);
for (let i = 1; i < parts.length; i += 2) {
const op = parts[i];
const token = parts[i+1];
const v = /^\d+$/.test(token)
? parseInt(token, 10)
: parseInt(attrs[token] || 0, 10);
val = op === 'x' ? val * v : val + v;
}
return val;
};

// base skill tables
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

const baseCombatStyles = {};
availableCombatStyles.forEach(style => {
baseCombatStyles[style] = (attrs.STR || 0) + (attrs.DEX || 0);
});

  // Phase control
  const [phase, setPhase] = useState(1);

  // Phase1: cultural
  const [cultStdAlloc, setCultStdAlloc] = useState({});
  const [cultProfSel, setCultProfSel] = useState([]);
  const [cultProfAlloc, setCultProfAlloc] = useState({});
  const [cultCombatSel, setCultCombatSel] = useState(null);
  const [cultCombatAlloc, setCultCombatAlloc] = useState(0);
  const CULT_POINTS = 100;

  // Phase2: career
  const [careerStdAlloc, setCareerStdAlloc] = useState({});
  const [careerProfSel, setCareerProfSel] = useState([]);
  const [careerProfAlloc, setCareerProfAlloc] = useState({});
  const CAREER_POINTS = 100;

  // Phase3: bonus
  const [bonusSel, setBonusSel] = useState([]);
  const [bonusAlloc, setBonusAlloc] = useState({});
  const BONUS_POINTS = 150;

  const sum = obj => Object.values(obj).reduce((a,b) => a + (b||0), 0);
  const clamp = v => Math.max(5, Math.min(15, v));

  // Persist when complete
  useEffect(() => {
    if (phase > 3) {
      const finalSkills = { ...baseStandard, ...baseProfessional };
      Object.entries(cultStdAlloc).forEach(([s,v]) => finalSkills[s] += v);
      cultProfSel.forEach(s => finalSkills[s] += cultProfAlloc[s] || 0);
      if (cultCombatSel) finalSkills[cultCombatSel] += cultCombatAlloc;
      Object.entries(careerStdAlloc).forEach(([s,v]) => finalSkills[s] += v);
      careerProfSel.forEach(s => finalSkills[s] += careerProfAlloc[s] || 0);
      bonusSel.forEach(s => finalSkills[s] += bonusAlloc[s] || 0);
      updateCharacter({ baseStandard, baseProfessional, cultStdAlloc, cultProfSel, cultProfAlloc, cultCombatSel, cultCombatAlloc, careerStdAlloc, careerProfSel, careerProfAlloc, bonusSel, bonusAlloc, finalSkills });
    }
  }, [phase]);

  // Points left
  const usedCult = sum(cultStdAlloc) + sum(cultProfAlloc) + cultCombatAlloc;
  const leftCult = CULT_POINTS - usedCult;
  const usedCareer = sum(careerStdAlloc) + sum(careerProfAlloc);
  const leftCareer = CAREER_POINTS - usedCareer;
  const leftBonus = BONUS_POINTS - sum(bonusAlloc);

  // Color helper
  const skillColor = total => {
    const hue = total >= 70 ? 120 : Math.round((total / 70) * 120);
    return { color: `hsl(${hue},65%,40%)` };
  };

  return (
    <div className="space-y-6">
      {phase === 1 && (
        <div>
          <h3>Step 1: Cultural Skills</h3>
          <p>Points Left: {leftCult}</p>
          <h4>Standard (culture)</h4>
          {cultureStandardSkills.map(s => (
            <div key={s} className="flex items-center">
              <span className="w-32">{s} (Base {baseStandard[s]}%)</span>
              <input type="number" min={5} max={15} value={cultStdAlloc[s]||0} onChange={e => {
                const v = clamp(+e.target.value);
                const prev = cultStdAlloc[s]||0;
                if (usedCult - prev + v <= CULT_POINTS) setCultStdAlloc({ ...cultStdAlloc, [s]: v });
              }}/>
            </div>
          ))}
          <h4>Professional (max 3)</h4>
          {cultureProfSkills.map(s => (
            <label key={s} className="mr-4">
              <input type="checkbox" checked={cultProfSel.includes(s)} onChange={() => setCultProfSel(prev => prev.includes(s) ? prev.filter(x=>x!==s) : prev.length<3 ? [...prev,s] : prev)}/>{s}
            </label>
          ))}
          {cultProfSel.map(s => (
            <div key={s} className="flex items-center">
              <span className="w-32">{s} (Base {baseProfessional[s]}%)</span>
              <input type="number" min={5} max={15} value={cultProfAlloc[s]||0} onChange={e => {
                const v = clamp(+e.target.value);
                const prev = cultProfAlloc[s]||0;
                if (usedCult - prev + v <= CULT_POINTS) setCultProfAlloc({ ...cultProfAlloc, [s]: v });
              }}/>
            </div>
          ))}
          <h4>Combat Style</h4>
          {availableCombatStyles.map(cs => (
            <label key={cs} className="mr-4">
              <input type="radio" name="combat" checked={cultCombatSel===cs} onChange={()=>setCultCombatSel(cs)}/>{cs}
            </label>
          ))}
          {cultCombatSel && (
            <div className="flex items-center">
              <span className="w-32">{cultCombatSel}</span>
              <input type="number" min={5} max={15} value={cultCombatAlloc} onChange={e=>{
                const v=clamp(+e.target.value);
                if(usedCult - cultCombatAlloc + v <= CULT_POINTS) setCultCombatAlloc(v);
              }}/>
            </div>
          )}
          {/* Summary */}
          <h4 className="mt-4">Current Skills</h4>
          <div className="grid grid-cols-2 gap-2">
            {cultureStandardSkills.map(s => {
              const total = baseStandard[s] + (cultStdAlloc[s]||0);
              return <div key={s} style={skillColor(total)}><strong>{s}:</strong> {total}%</div>;
            })}
            {cultureProfSkills.map(s => cultProfSel.includes(s) && (() => {
              const total = baseProfessional[s] + (cultProfAlloc[s]||0);
              return <div key={s} style={skillColor(total)}><strong>{s}:</strong> {total}%</div>;
            })())}
            {cultCombatSel && (() => {
              const total = baseProfessional[cultCombatSel] + cultCombatAlloc;
              return <div key={cultCombatSel} style={skillColor(total)}><strong>{cultCombatSel}:</strong> {total}%</div>;
            })()}
          </div>
          <button onClick={()=>setPhase(2)} className="mt-4 px-4 py-2 bg-gold">Next</button>
        </div>
      )}

      {phase===2 && (
        <div>
          <h3>Step 2: Career Skills</h3>
          <p>Points Left: {leftCareer}</p>
          <h4>Standard (career)</h4>
          {careerStandardSkills.map(s => (
            <div key={s} className="flex items-center">
              <span className="w-32">{s} (Base {baseStandard[s]}%)</span>
              <input type="number" min={5} max={15} value={careerStdAlloc[s]||0} onChange={e=>{
                const v=clamp(+e.target.value);
                const prev=careerStdAlloc[s]||0;
                if(leftCareer + prev - v >=0) setCareerStdAlloc({ ...careerStdAlloc,[s]:v });
              }}/>
            </div>
          ))}
          <h4>Professional (max 3)</h4>
          {careerProfSkills.map(s=>(
            <label key={s} className="mr-4">
              <input type="checkbox" checked={careerProfSel.includes(s)} onChange={()=>setCareerProfSel(prev=> prev.includes(s)? prev.filter(x=>x!==s): prev.length<3? [...prev,s]: prev)}/>{s}
            </label>
          ))}
          {careerProfSel.map(s=>(
            <div key={s} className="flex items-center">
              <span className="w-32">{s} (Base {baseProfessional[s]}%)</span>
              <input type="number" min={5} max={15} value={careerProfAlloc[s]||0} onChange={e=>{
                const v=clamp(+e.target.value);
                const prev=careerProfAlloc[s]||0;
                if(leftCareer + prev - v >=0) setCareerProfAlloc({ ...careerProfAlloc,[s]:v });
              }}/>
            </div>
          ))}
          {/* Summary */}
          <h4 className="mt-4">Current Skills</h4>
          <div className="grid grid-cols-2 gap-2">
            {[...cultureStandardSkills, ...cultureProfSkills, cultCombatSel, ...careerStandardSkills, ...careerProfSkills]
              .filter((v,i,a)=>v&&a.indexOf(v)===i)
              .map(s => {
                const total = (baseStandard[s]||baseProfessional[s]||0) + (cultStdAlloc[s]||0) + (cultProfAlloc[s]||0) + (cultCombatSel===s?cultCombatAlloc:0) + (careerStdAlloc[s]||0) + (careerProfAlloc[s]||0);
                return <div key={s} style={skillColor(total)}><strong>{s}:</strong> {total}%</div>;
              })}
          </div>
          <div className="mt-4 flex space-x-2">
            <button onClick={()=>setPhase(1)} className="px-4 py-2 bg-gray-300">Back</button>
            <button onClick={()=>setPhase(3)} className="px-4 py-2 bg-gold">Next</button>
          </div>
        </div>
      )}

      {phase===3 && (
        <div>
          <h3>Step 3: Bonus Skills</h3>
          <p>Points Left: {leftBonus}</p>
          <p>Distribute {BONUS_POINTS} points (5–15 each) and add one hobby skill.</p>
          <div className="mt-4">
            <label>Add Hobby:</label>
            <select onChange={e=>{const s=e.target.value; if(s&&!bonusSel.includes(s)) setBonusSel([...bonusSel,s]);}} className="border p-1">
              <option value="">-- select --</option>
              {[...cultureStandardSkills, ...cultureProfSkills, cultCombatSel, ...careerStandardSkills, ...careerProfSkills]
                .filter((v,i,a)=>v&&a.indexOf(v)===i)
                .map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {bonusSel.map(s=>(
            <div key={s} className="flex items-center mt-2">
              <span className="w-32">{s} (Base {(baseStandard[s]||baseProfessional[s]||0)}%)</span>
              <input type="number" min={5} max={15} value={bonusAlloc[s]||0} onChange={e=>{
                const v=clamp(+e.target.value);
                const prev=bonusAlloc[s]||0;
                if(leftBonus+prev-v>=0) setBonusAlloc({...bonusAlloc,[s]:v});
              }}/>
            </div>
          ))}
          {/* Summary */}
          <h4 className="mt-4">Current Skills</h4>
          <div className="grid grid-cols-2 gap-2">
            {[...cultureStandardSkills, ...cultureProfSkills, cultCombatSel, ...careerStandardSkills, ...careerProfSkills, ...bonusSel]
              .filter((v,i,a)=>v&&a.indexOf(v)===i)
              .map(s=>{
                const total=(baseStandard[s]||baseProfessional[s]||0)+(cultStdAlloc[s]||0)+(cultProfAlloc[s]||0)+(cultCombatSel===s?cultCombatAlloc:0)+(careerStdAlloc[s]||0)+(careerProfAlloc[s]||0)+(bonusAlloc[s]||0);
                return <div key={s} style={skillColor(total)}><strong>{s}:</strong> {total}%</div>;
              })}
          </div>
          <div className="mt-4 flex space-x-2">
            <button onClick={()=>setPhase(2)} className="px-4 py-2 bg-gray-300">Back</button>
            <button onClick={()=>setPhase(4)} className="px-4 py-2 bg-gold">Finish</button>
          </div>
        </div>
      )}

      {phase>3 && (
        <div>
          <h3>Done!</h3>
          <button onClick={()=>updateCharacter({ step: 'done' })} className="px-4 py-2 bg-green-600 text-white">Review</button>
        </div>
      )}
    </div>
  );
}
