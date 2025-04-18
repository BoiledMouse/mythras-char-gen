// src/steps/SkillsStep.jsx
import React, { useState, useEffect } from 'react';
import { useCharacter } from '../context/characterContext';
import cultures from '../data/cultures.json';
import careers from '../data/careers.json';
import skillsData from '../data/skills.json';
import passions from '../data/passions.json';

export function SkillsStep() {
  const { character, updateCharacter } = useCharacter();
  const culture = cultures[character.culture] || {};
  const career = careers[character.career] || {};
  const [cultPoints, setCultPoints] = useState(character.maxCulturalPoints);
  const [careerPoints, setCareerPoints] = useState(character.maxCareerPoints);
  const [bonusPoints, setBonusPoints] = useState(character.maxBonusPoints);
  const [cultAlloc, setCultAlloc] = useState(character.cultAlloc);
  const [careerAlloc, setCareerAlloc] = useState(character.careerAlloc);
  const [bonusAlloc, setBonusAlloc] = useState(character.bonusAlloc);
  const [profSkills, setProfSkills] = useState(character.profSkills);

  useEffect(() => updateCharacter({
    maxCulturalPoints: cultPoints,
    maxCareerPoints: careerPoints,
    maxBonusPoints: bonusPoints,
    cultAlloc, careerAlloc, bonusAlloc, profSkills
  }), [cultPoints, careerPoints, bonusPoints, cultAlloc, careerAlloc, bonusAlloc, profSkills]);

  const sum = obj => Object.values(obj).reduce((a, b) => a + (b || 0), 0);
  const cultLeft = cultPoints - sum(cultAlloc);
  const careerLeft = careerPoints - sum(careerAlloc);
  const bonusLeft = bonusPoints - sum(bonusAlloc);

  const handleAlloc = (left, alloc, setAlloc) => (skill, val) => {
    let v = parseInt(val, 10); if (isNaN(v) || v < 0) v = 0;
    const prev = alloc[skill] || 0;
    if (v - prev > left) v = prev;
    setAlloc({ ...alloc, [skill]: v });
  };
  const toggleProf = s => setProfSkills(ps =>
    ps.includes(s) ? ps.filter(x => x !== s) : ps.length < 3 ? [...ps, s] : ps
  );

  return (
    <div className="space-y-8">
      {/* Cultural Phase */}
      <div>
        <h3 className="font-semibold">Cultural Skills</h3>
        <div className="flex mb-2">
          <label className="mr-2">Total:</label>
          <input type="number" value={cultPoints} onChange={e => setCultPoints(+e.target.value||0)} className="w-20" />
          <span className="ml-4">Left: {cultLeft}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {culture.standardSkills?.map(s => {
            const base = skillsData.standard.find(x => x.name === s)?.base;
            return (
              <div key={s}>
                <label>{s} ({base})</label>
                <input type="number"
                  value={cultAlloc[s] || 0}
                  onChange={e => handleAlloc(cultLeft, cultAlloc, setCultAlloc)(s, e.target.value)}
                  className="w-20" />
              </div>
            );
          })}
          {culture.chooseOne && (
            <div className="col-span-2">
              <label>Choose One:</label>
              <select onChange={e => handleAlloc(cultLeft, cultAlloc, setCultAlloc)(e.target.value, 0)} className="w-full">
                <option/>
                {culture.chooseOne.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Career Phase */}
      <div>
        <h3 className="font-semibold">Career Skills</h3>
        <div className="flex mb-2">
          <label className="mr-2">Total:</label>
          <input type="number" value={careerPoints} onChange={e => setCareerPoints(+e.target.value||0)} className="w-20" />
          <span className="ml-4">Left: {careerLeft}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {career.standardSkills?.map(s => {
            const base = skillsData.standard.find(x => x.name === s)?.base;
            return (
              <div key={s}>
                <label>{s} ({base})</label>
                <input type="number"
                  value={careerAlloc[s] || 0}
                  onChange={e => handleAlloc(careerLeft, careerAlloc, setCareerAlloc)(s, e.target.value)}
                  className="w-20" />
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <h4 className="font-medium">Professional Skills (max 3)</h4>
          <div className="grid grid-cols-2 gap-2">
            {career.professionalSkills?.map(s => (
              <label key={s}>
                <input type="checkbox"
                  checked={profSkills.includes(s)}
                  onChange={() => toggleProf(s)}
                  className="mr-1" />
                {s}
              </label>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {profSkills.map(s => {
              const base = skillsData.professional.find(x => x.name === s)?.base;
              return (
                <div key={s}>
                  <label>{s} ({base})</label>
                  <input type="number"
                    value={careerAlloc[s] || 0}
                    onChange={e => handleAlloc(careerLeft, careerAlloc, setCareerAlloc)(s, e.target.value)}
                    className="w-20" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bonus Phase */}
      <div>
        <h3 className="font-semibold">Bonus Skills</h3>
        <div className="flex mb-2">
          <label className="mr-2">Total:</label>
          <input type="number" value={bonusPoints} onChange={e => setBonusPoints(+e.target.value||0)} className="w-20" />
          <span className="ml-4">Left: {bonusLeft}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {skillsData.standard.map(s => (
            <div key={s.name}>
              <label>{s.name} ({s.base})</label>
              <input type="number"
                value={bonusAlloc[s.name] || 0}
                onChange={e => handleAlloc(bonusLeft, bonusAlloc, setBonusAlloc)(s.name, e.target.value)}
                className="w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Passions */}
      <div>
        <h3 className="font-semibold">Passions</h3>
        <ul className="list-disc ml-6">
          {passions.map(p => <li key={p.name}>{p.name}</li>)}
        </ul>
      </div>
    </div>
  );
}
