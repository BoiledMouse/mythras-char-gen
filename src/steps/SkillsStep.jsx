// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';

export function SkillsStep() {
  const { character, updateCharacter } = useCharacter();
  const attrs = character;
  const culture = cultures[character.culture] || {};
  const career = careers[character.career] || {};

  // Compute base values for all skills
  const computeBase = (baseExpr) => {
    const parts = baseExpr.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]], 10) || 0;
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i];
      const attr = parts[i + 1];
      const v = parseInt(attrs[attr], 10) || 0;
      val = op === 'x' ? val * v : val + v;
    }
    return val;
  };

  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    baseStandard[name] = computeBase(base);
  });
  const baseProfessional = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfessional[name] = computeBase(base);
  });

  // Cultural phase
  const [selectedCult, setSelectedCult] = useState(character.selectedCult || []);
  const toggleCult = skill => setSelectedCult(prev =>
    prev.includes(skill) ? prev.filter(s => s!==skill) : prev.length<3 ? [...prev, skill] : prev
  );
  const [cultPoints, setCultPoints] = useState(character.cultPoints ?? 100);
  const [cultAlloc, setCultAlloc] = useState(character.cultAlloc || {});
  const sum = obj => Object.values(obj).reduce((a,b)=>a+(b||0),0);
  const cultLeft = cultPoints - sum(cultAlloc);
  const handleCultAlloc = (skill, val) => {
    let v = parseInt(val,10)||0; const prev=cultAlloc[skill]||0;
    if(v-prev>cultLeft) v=prev;
    setCultAlloc({...cultAlloc,[skill]:v});
  };

  // Career phase
  const [selectedProf, setSelectedProf] = useState(character.selectedProf || []);
  const toggleProf = skill => setSelectedProf(prev =>
    prev.includes(skill) ? prev.filter(s=>s!==skill) : prev.length<3 ? [...prev, skill] : prev
  );
  const [careerPoints, setCareerPoints] = useState(character.careerPoints ?? 100);
  const [careerAlloc, setCareerAlloc] = useState(character.careerAlloc || {});
  const careerPool = careerPoints - sum(careerAlloc);
  const handleCareerAlloc = (skill, val) => {
    let v=parseInt(val,10)||0; const prev=careerAlloc[skill]||0;
    if(v-prev>careerPool) v=prev;
    setCareerAlloc({...careerAlloc,[skill]:v});
  };

  // Bonus phase
  const [bonusPoints, setBonusPoints] = useState(character.bonusPoints ?? 150);
  const [bonusAlloc, setBonusAlloc] = useState(character.bonusAlloc || {});
  const bonusPool = bonusPoints - sum(bonusAlloc);
  const handleBonusAlloc = (skill,val) => {
    let v=parseInt(val,10)||0; const prev=bonusAlloc[skill]||0;
    if(v-prev>bonusPool) v=prev;
    setBonusAlloc({...bonusAlloc,[skill]:v});
  };

  // Persist all
  useEffect(()=>{
    updateCharacter({
      selectedCult, cultPoints, cultAlloc,
      selectedProf, careerPoints, careerAlloc,
      bonusPoints, bonusAlloc,
      baseStandard, baseProfessional
    });
  },[selectedCult,cultPoints,cultAlloc,selectedProf,careerPoints,careerAlloc,bonusPoints,bonusAlloc]);

  return (
    <div className="space-y-8">
      {/* Cultural */}
      <section>
        <h3 className="font-semibold">Cultural Skills (select up to 3)</h3>
        <div className="grid grid-cols-2 gap-2">
          {culture.standardSkills?.map(s=>(
            <label key={s} className="inline-flex items-center">
              <input type="checkbox" className="mr-2" checked={selectedCult.includes(s)} onChange={()=>toggleCult(s)} />
              {s} ({baseStandard[s]})
            </label>
          ))}
        </div>
        <div className="mt-2">Points Left: {cultLeft}</div>
        <div className="mt-2 space-y-1">
          {selectedCult.map(s=>(
            <div key={s} className="flex items-center">
              <span className="w-32">{s}</span>
              <input type="number" min={0} value={cultAlloc[s]||0} className="w-20 border" onChange={e=>handleCultAlloc(s,e.target.value)} />
              <span className="ml-2">(+{baseStandard[s]})</span>
            </div>
          ))}
        </div>
      </section>

      {/* Career */}
      <section>
        <h3 className="font-semibold">Career Skills (select up to 3 prof.)</h3>
        <div className="grid grid-cols-2 gap-2">
          {career.standardSkills?.map(s=>(
            <div key={s} className="flex justify-between">
              <span>{s} ({baseStandard[s]})</span>
              <input type="number" min={0} value={careerAlloc[s]||0} className="w-16 border" onChange={e=>handleCareerAlloc(s,e.target.value)} />
            </div>
          ))}
        </div>
        <div className="mt-2 mb-2">
          <label className="font-medium">Professional Skills:</label>
          <div className="grid grid-cols-2 gap-2">
            {career.professionalSkills?.map(s=>(
              <label key={s} className="inline-flex items-center">
                <input type="checkbox" className="mr-2" checked={selectedProf.includes(s)} onChange={()=>toggleProf(s)} />{s}
              </label>
            ))}
          </div>
        </div>
        <div>Points Left: {careerPool}</div>
        <div className="mt-2 space-y-1">
          {selectedProf.map(s=>(
            <div key={s} className="flex items-center">
              <span className="w-32">{s}</span>
              <input type="number" min={0} value={careerAlloc[s]||0} className="w-20 border" onChange={e=>handleCareerAlloc(s,e.target.value)} />
              <span className="ml-2">(+{baseProfessional[s]})</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bonus */}
      <section>
        <h3 className="font-semibold">Bonus Skills (any)</h3>
        <div>Points Left: {bonusPool}</div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {Object.keys(baseStandard).map(s=>(
            <div key={s} className="flex items-center">
              <span className="w-32">{s} ({baseStandard[s]})</span>
              <input type="number" min={0} value={bonusAlloc[s]||0} className="w-20 border" onChange={e=>handleBonusAlloc(s,e.target.value)} />
            </div>
          ))}
          {Object.keys(baseProfessional).map(s=>(
            <div key={s} className="flex items-center">
              <span className="w-32">{s} ({baseProfessional[s]})</span>
              <input type="number" min={0} value={bonusAlloc[s]||0} className="w-20 border" onChange={e=>handleBonusAlloc(s,e.target.value)} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
