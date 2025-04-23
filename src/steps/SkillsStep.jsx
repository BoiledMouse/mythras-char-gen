// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';
import StepWrapper from '../components/StepWrapper';

export default function SkillsStep({ formData }) {
  const { character, updateCharacter } = useCharacter();
  const { STR = 0, DEX = 0, INT = 0, CON = 0, POW = 0, CHA = 0, SIZ = 0 } = character;
  const { age = 0, culture: cultKey = '', career: careerKey = '' } = formData;
  const cultureDef = cultures[cultKey] || {};
  const careerDef = careers[careerKey] || {};

  // Pools and limits
  const ageBuckets = [
    { max: 16, bonus: 100, maxInc: 10 },
    { max: 27, bonus: 150, maxInc: 15 },
    { max: 43, bonus: 200, maxInc: 20 },
    { max: 64, bonus: 250, maxInc: 25 },
    { max: Infinity, bonus: 300, maxInc: 30 },
  ];
  const { bonus: initialBonusPool = 0, maxInc = 0 } = ageBuckets.find(b => age <= b.max) || {};
  const CULT_POOL = 100;
  const CAREER_POOL = 100;

  // Compute base values
  const attrs = { STR, DEX, INT, CON, POW, CHA, SIZ };
  const computeBase = expr => {
    const parts = expr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]] || 0, 10);
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i], tok = parts[i + 1];
      const v = /^\d+$/.test(tok) ? +tok : attrs[tok] || 0;
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  // Base maps
  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let b = computeBase(base);
    if (name === 'Customs' || name === 'Native Tongue') b += 40;
    baseStandard[name] = b;
  });
  const baseProfGeneric = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfGeneric[name] = computeBase(base);
  });
  const profSet = new Set([
    ...skillsData.professional.map(s => s.name),
    ...(cultureDef.professionalSkills || []),
    ...(careerDef.professionalSkills || []),
  ]);
  const baseProfessional = {};
  Array.from(profSet).forEach(name => {
    const root = name.includes('(') ? name.split('(')[0].trim() : name;
    const val = baseProfGeneric[root] || 0;
    baseProfessional[name] = root === 'Language' && !name.includes('(') ? val + 40 : val;
  });
  (cultureDef.combatStyles || []).forEach(style => {
    baseProfessional[style] = STR + DEX;
  });

  // State
  const [phase, setPhase] = useState(1);
  const [cStdAlloc, setCStdAlloc] = useState({});
  const [cProfSel, setCProfSel] = useState([]);
  const [cProfAlloc, setCProfAlloc] = useState({});
  const [cCombSel, setCCombSel] = useState('');
  const [cCombAlloc, setCCombAlloc] = useState(0);
  const [rStdAlloc, setRStdAlloc] = useState({});
  const [rProfSel, setRProfSel] = useState([]);
  const [rProfAlloc, setRProfAlloc] = useState({});
  const [bonusAlloc, setBonusAlloc] = useState({});
  const [bonusLeft, setBonusLeft] = useState(initialBonusPool);
  const sum = obj => Object.values(obj).reduce((t, v) => t + (v || 0), 0);

  // Final update
  useEffect(() => {
    if (phase === 4) {
      const final = { ...baseStandard, ...baseProfessional };
      cultureDef.standardSkills?.forEach(s => final[s] += cStdAlloc[s] || 0);
      cProfSel.forEach(s => final[s] += cProfAlloc[s] || 0);
      if (cCombSel) final[cCombSel] += cCombAlloc;
      careerDef.standardSkills?.forEach(s => final[s] += rStdAlloc[s] || 0);
      rProfSel.forEach(s => final[s] += rProfAlloc[s] || 0);
      Object.entries(bonusAlloc).forEach(([s, v]) => final[s] += v);
      updateCharacter({
        skills: final,
        selectedSkills: {
          standard: [...(cultureDef.standardSkills || []), ...(careerDef.standardSkills || [])],
          professional: [...cProfSel, ...rProfSel, ...(cCombSel ? [cCombSel] : [])],
          combat: cCombSel ? [cCombSel] : []
        }
      });
    }
  }, [phase]);

  const handleRange = (alloc, setAlloc, skill, limit, poolLeft) => e => {
    let val = parseInt(e.target.value, 10) || 0;
    val = Math.max(0, Math.min(limit, val));
    const prev = alloc[skill] || 0;
    const delta = val - prev;
    if (delta <= poolLeft) setAlloc({ ...alloc, [skill]: val });
  };

  // Helpers for summary grouping
  const resistanceList = ['Brawn','Endurance','Evade','Willpower'];
  const allMagic = [
    ...(skillsData.folkMagic || []).map(s => s.name),
    ...(skillsData.animism || []).map(s => s.name),
    ...(skillsData.mysticism || []).map(s => s.name),
    ...(skillsData.sorcery || []).map(s => s.name),
    ...(skillsData.theism || []).map(s => s.name)
  ];

  return (
    <>
      {/* Phase 1: Cultural */}
      {phase === 1 && (
        <StepWrapper title="Cultural Skills">
          <p className="mb-4">Points left: {CULT_POOL - sum(cStdAlloc) - sum(cProfAlloc) - cCombAlloc}</p>
          <h3 className="font-heading text-lg mb-2">Standard Skills</h3>/h3>
          {cultureDef.standardSkills?.map(s => {
            const base = baseStandard[s] || 0;
            const alloc = cStdAlloc[s] || 0;
            const total = base + alloc;
            return (
              <div key={s} className="flex items-center mb-2">
                <div className="w-16 font-medium">{base}%</div>
                <input
                  type="range"
                  className="flex-1 mx-2"
                  min={0} max={maxInc} value={alloc}
                  onChange={handleRange(cStdAlloc, setCStdAlloc, s, maxInc, CULT_POOL - sum(cStdAlloc) - sum(cProfAlloc) - cCombAlloc)}
                />
                <div className="w-32 text-right font-semibold">+{alloc}% = {total}%</div>
              </div>
            );
          })}
          <h3 className="font-heading text-lg mt-4 mb-2">Professional (max 3)</h3>
          {cultureDef.professionalSkills?.map(s => (
            <label key={s} className="inline-flex items-center mr-4 mb-2">
              <input
                type="checkbox" className="mr-1"
                checked={cProfSel.includes(s)}
                onChange={() => setCProfSel(sel => sel.includes(s) ? sel.filter(x => x!==s) : sel.length<3?[...sel,s]:sel)}
              />{s}
            </label>
          ))}
          {cProfSel.map(s => {
            const base = baseProfessional[s] || 0;
            const alloc = cProfAlloc[s] || 0;
            const total = base + alloc;
            return (
              <div key={s} className="flex items-center mb-2">
                <div className="w-16 font-medium">{base}%</div>
                <input
                  type="range"
                  className="flex-1 mx-2"
                  min={0} max={maxInc} value={alloc}
                  onChange={handleRange(cProfAlloc, setCProfAlloc, s, maxInc, CULT_POOL - sum(cStdAlloc) - sum(cProfAlloc) - cCombAlloc)}
                />
                <div className="w-32 text-right font-semibold">+{alloc}% = {total}%</div>
              </div>
            );
          })}
          <h3 className="font-heading text-lg mt-4 mb-2">Combat Style</h3>
          {cultureDef.combatStyles?.map(cs => (
            <label key={cs} className="inline-flex items-center mr-4 mb-2">
              <input
                type="radio" name="combat" className="mr-1"
                checked={cCombSel===cs} onChange={()=>setCCombSel(cs)}
              />{cs}
            </label>
          ))}
          {cCombSel && (
            <div className="flex items-center mb-2">
              <div className="w-16 font-medium">{baseProfessional[cCombSel]}%</div>
              <input
                type="range" className="flex-1 mx-2"
                min={0} max={maxInc} value={cCombAlloc}
                onChange={e => {
                  const v = Math.min(maxInc, Math.max(0, +e.target.value||0));
                  const pool = CULT_POOL - sum(cStdAlloc) - sum(cProfAlloc) - cCombAlloc;
                  if(v - cCombAlloc <= pool) setCCombAlloc(v);
                }}
              />
              <div className="w-32 text-right font-semibold">+{cCombAlloc}% = {baseProfessional[cCombSel]+cCombAlloc}%</div>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button className="btn btn-primary" onClick={()=>setPhase(2)}>Next: Career</button>
          </div>
        </StepWrapper>
      )}
      {/* Phase 2: Career Skills */}
      {phase===2&&(
        <StepWrapper title="Career Skills">
          <p className="mb-4">Points left: {CAREER_POOL - sum(rStdAlloc) - sum(rProfAlloc)}</p>
          <h3 className="font-heading text-lg mb-2">Standard</h3>
          {careerDef.standardSkills?.map(s => {
            const base = (baseStandard[s]||0)+(cStdAlloc[s]||0);
            const alloc = rStdAlloc[s]||0;
            const total=base+alloc;
            return (
              <div key={s} className="flex items-center mb-2">
                <div className="w-16 font-medium">{base}%</div>
                <input
                  type="range" className="flex-1 mx-2"
                  min={0} max={maxInc} value={alloc}
                  onChange={handleRange(rStdAlloc,setRStdAlloc,s,maxInc,CAREER_POOL-sum(rStdAlloc)-sum(rProfAlloc))}
                />
                <div className="w-32 text-right font-semibold">+{alloc}% = {total}%</div>
              </div>
            );
          })}
          <h3 className="font-heading text-lg mt-4 mb-2">Professional (max 3)</h3>
          {careerDef.professionalSkills?.map(s=>(
            <label key={s} className="inline-flex items-center mr-4 mb-2">
              <input type="checkbox" className="mr-1"
                checked={rProfSel.includes(s)}
                onChange={()=>setRProfSel(sel=>sel.includes(s)?sel.filter(x=>x!==s):sel.length<3?[...sel,s]:sel)}
              />{s}
            </label>
          ))}
          {rProfSel.map(s=>{
            const base=(baseProfessional[s]||0)+(cProfAlloc[s]||0);
            const alloc=rProfAlloc[s]||0;
            const total=base+alloc;
            return(
              <div key={s} className="flex items-center mb-2">
                <div className="w-16 font-medium">{base}%</div>
                <input type="range" className="flex-1 mx-2" min={0} max={maxInc} value={alloc}
                  onChange={handleRange(rProfAlloc,setRProfAlloc,s,maxInc,CAREER_POOL-sum(rStdAlloc)-sum(rProfAlloc))}
                />
                <div className="w-32 text-right font-semibold">+{alloc}% = {total}%</div>
              </div>
            );
          })}
          <div className="flex justify-between mt-4">
            <button className="btn btn-secondary" onClick={()=>setPhase(1)}>Back: Cultural</button>
            <button className="btn btn-primary" onClick={()=>setPhase(3)}>Next: Bonus</button>
          </div>
        </StepWrapper>
      )}
      {/* Phase 3: Bonus Skills */}
      {phase===3&&(
        <StepWrapper title="Bonus Skills">
          <p className="mb-4">Bonus left: {bonusLeft}</p>
          {Array.from(new Set([
            ...(cultureDef.standardSkills||[]),
            ...(cultureDef.professionalSkills||[]),
            ...(cultureDef.combatStyles&&cCombSel?[cCombSel]:[]),
            ...(careerDef.standardSkills||[]),
            ...(careerDef.professionalSkills||[]),
          ])).map(s=>{
            const base=(baseStandard[s]||0)+(cStdAlloc[s]||0)+(baseProfessional[s]||0)+(cProfAlloc[s]||0)+(s===cCombSel?cCombAlloc:0)+(rStdAlloc[s]||0)+(rProfAlloc[s]||0);
            const alloc=bonusAlloc[s]||0;
            const total=base+alloc;
            return(
              <div key={s} className="flex items-center mb-2">
                <div className="w-16 font-medium">{base}%</div>
                <input type="range" className="flex-1 mx-2" min={0} max={maxInc} value={alloc}
                  onChange={handleRange(bonusAlloc,setBonusAlloc,s,maxInc,bonusLeft)}
                />
                <div className="w-32 text-right font-semibold">+{alloc}% = {total}%</div>
              </div>
            );
          })}
          <div className="flex justify-between mt-4">
            <button className="btn btn-secondary" onClick={()=>setPhase(2)}>Back: Career</button>
            <button className="btn btn-primary" onClick={()=>setPhase(4)}>Finish</button>
          </div>
        </StepWrapper>
      )}
      {/* Phase 4: Summary */}
      {phase===4&&(
        <StepWrapper title="Skills Summary">
          {/* Standard */}
          <h3 className="font-semibold mb-2">Standard Skills</h3>
          <ul className="list-disc list-inside mb-4">
            {character.selectedSkills.standard?.filter(n=>!resistanceList.includes(n)).map(n=>(
              <li key={n}>{n}: {character.skills[n]}%</li>
            ))}
          </ul>
          {/* Resistances */}
          <h3 className="font-semibold mb-2">Resistances</h3>
          <ul className="list-disc list-inside mb-4">
            {resistanceList.filter(n=>character.skills[n]!=null).map(n=>(
              <li key={n}>{n}: {character.skills[n]}%</li>
            ))}
          </ul>
          {/* Combat */}
          <h3 className="font-semibold mb-2">Combat Skills</h3>
          <ul className="list-disc list-inside mb-4">
            {character.selectedSkills.combat?.map(n=>(
              <li key={n}>{n}: {character.skills[n]}%</li>
            ))}
          </ul>
          {/* Professional */}
          <h3 className="font-semibold mb-2">Professional Skills</h3>
          <ul className="list-disc list-inside mb-4">
            {character.selectedSkills.professional?.map(n=>(
              <li key={n}>{n}: {character.skills[n]}%</li>
            ))}
          </ul>
          {/* Magic */}
          <h3 className="font-semibold mb-2">Magic Skills</h3>
          <ul className="list-disc list-inside">
            {allMagic.filter(n=>character.skills[n]!=null).map(n=>(
              <li key={n}>{n}: {character.skills[n]}%</li>
            ))}
          </ul>
        </StepWrapper>
      )}
    </>
  );
}
