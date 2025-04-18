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
  const careerDef = careers[character.career] || {};

  // Compute base values for standard and professional skills
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

  const baseStandard = {};
  skillsData.standard.forEach(({ name, base }) => {
    let val = computeBase(base);
    if (name === 'Customs' || name === 'Native Tongue') val += 40;
    baseStandard[name] = val;
  });

  const baseProfessional = {};
  skillsData.professional.forEach(({ name, base }) => {
    baseProfessional[name] = computeBase(base);
  });

  // Cultural phase
  const [selectedCult, setSelectedCult] = useState(character.selectedCult || []);
  const toggleCult = (skill) => setSelectedCult(prev =>
    prev.includes(skill) ? prev.filter(s => s !== skill)
    : prev.length < 3 ? [...prev, skill] : prev
  );
  const [cultPoints, setCultPoints] = useState(character.cultPoints ?? 100);
  const [cultAlloc, setCultAlloc] = useState(character.cultAlloc || {});
  const sum = (o) => Object.values(o).reduce((a,b) => a + (b||0), 0);
  const cultLeft = cultPoints - sum(cultAlloc);
  const handleCultAlloc = (skill, vRaw) => {
    let v = parseInt(vRaw, 10) || 0;
    if (v > 15) v = 15;
    const prev = cultAlloc[skill] || 0;
    if (v - prev > cultLeft) v = prev;
    setCultAlloc({ ...cultAlloc, [skill]: v });
  };

  // Career phase
  const [selectedProf, setSelectedProf] = useState(character.selectedProf || []);
  const toggleProf = (skill) => setSelectedProf(prev =>
    prev.includes(skill) ? prev.filter(s => s !== skill)
    : prev.length < 3 ? [...prev, skill] : prev
  );
  const [careerPoints, setCareerPoints] = useState(character.careerPoints ?? 100);
  const [careerAlloc, setCareerAlloc] = useState(character.careerAlloc || {});
  const careerLeft = careerPoints - sum(careerAlloc);
  const handleCareerAlloc = (skill, vRaw) => {
    let v = parseInt(vRaw,10) || 0;
    if (v > 15) v = 15;
    const prev = careerAlloc[skill] || 0;
    if (v - prev > careerLeft) v = prev;
    setCareerAlloc({ ...careerAlloc, [skill]: v });
  };

  // Bonus phase
  const [bonusPoints, setBonusPoints] = useState(character.bonusPoints ?? 150);
  const [bonusAlloc, setBonusAlloc] = useState(character.bonusAlloc || {});
  const bonusLeft = bonusPoints - sum(bonusAlloc);
  const handleBonusAlloc = (skill, vRaw) => {
    let v = parseInt(vRaw,10) || 0;
    if (v > 15) v = 15;
    const prev = bonusAlloc[skill] || 0;
    if (v - prev > bonusLeft) v = prev;
    setBonusAlloc({ ...bonusAlloc, [skill]: v });
  };

  // Persist
  useEffect(() => {
    updateCharacter({
      selectedCult, cultPoints, cultAlloc,
      selectedProf, careerPoints, careerAlloc,
      bonusPoints, bonusAlloc,
      baseStandard, baseProfessional
    });
  }, [selectedCult, cultAlloc, selectedProf, careerAlloc, bonusAlloc]);

  return (
    <div className="space-y-8">
      {/* Cultural */}
      <section>
        <h3 className="font-semibold">Cultural Skills (max 3)</h3>
        <div className="grid grid-cols-2 gap-2">
          {culture.standardSkills?.map(s => (
            <label key={s} className="inline-flex items-center">
              <input type="checkbox" checked={selectedCult.includes(s)} onChange={() => toggleCult(s)} className="mr-2" />
              {s} (Base {baseStandard[s]}%)
            </label>
          ))}
        </div>
        <div>Points Left: {cultLeft}</div>
        <div className="mt-2 space-y-1">
          {selectedCult.map(s => (
            <div key={s} className="flex items-center">
              <span className="w-32">{s}</span>
              <input type="number" min={0} max={15} value={cultAlloc[s] || 0} onChange={e => handleCultAlloc(s, e.target.value)} className="w-20 border" />
            </div>
          ))}
        </div>
      </section>

      {/* Career */}
      <section>
        <h3 className="font-semibold">Career Standard Skills</h3>
        <div className="grid grid-cols-2 gap-2">
          {careerDef.standardSkills?.map(s => (
            <div key={s} className="flex items-center">
              <span className="w-32">{s} (Base {baseStandard[s]}%)</span>
              <input type="number" min={0} max={15} value={careerAlloc[s] || 0} onChange={e => handleCareerAlloc(s, e.target.value)} className="w-20 border" />
            </div>
          ))}
        </div>
        <div className="mt-2">Professional Skills (max 3)</div>
        <div className="grid grid-cols-2 gap-2">
          {careerDef.professionalSkills?.map(s => (
            <label key={s} className="inline-flex items-center">
              <input type="checkbox" checked={selectedProf.includes(s)} onChange={() => toggleProf(s)} className="mr-2" />
              {s} (Base {baseProfessional[s]}%)
            </label>
          ))}
        </div>
        <div>Points Left: {careerLeft}</div>
        <div className="mt-2 space-y-1">
          {selectedProf.map(s => (
            <div key={s} className="flex items-center">
              <span className="w-32">{s}</span>
              <input type="number" min={0} max={15} value={careerAlloc[s] || 0} onChange={e => handleCareerAlloc(s, e.target.value)} className="w-20 border" />
            </div>
          ))}
        </div>
      </section>

      {/* Bonus */}
      <section>
        <h3 className="font-semibold">Bonus Skills (max 15 each)</h3>
        <div>Points Left: {bonusLeft}</div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {Object.keys(baseStandard).map(s => (
            <div key={s} className="flex items-center">
              <span className="w-32">{s} (Base {baseStandard[s]}%)</span>
              <input type="number" min={0} max={15} value={bonusAlloc[s] || 0} onChange={e => handleBonusAlloc(s, e.target.value)} className="w-20 border" />
            </div>
          ))}
          {Object.keys(baseProfessional).map(s => (
            <div key={s} className="flex items-center">
              <span className="w-32">{s} (Base {baseProfessional[s]}%)</span>
              <input type="number" min={0} max={15} value={bonusAlloc[s] || 0} onChange={e => handleBonusAlloc(s, e.target.value)} className="w-20 border" />
            </div>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section>
        <h3 className="font-semibold">Final Skill Totals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {Object.keys(baseStandard).map(s => {
            const total = baseStandard[s] + (cultAlloc[s]||0) + (careerAlloc[s]||0) + (bonusAlloc[s]||0);
            return <div key={s}><strong>{s}:</strong> {total}%</div>;
          })}
          {Object.keys(baseProfessional).map(s => {
            const total = baseProfessional[s] + (careerAlloc[s]||0) + (bonusAlloc[s]||0);
            return <div key={s}><strong>{s}:</strong> {total}%</div>;
          })}
        </div>
      </section>
    </div>
  );
}
