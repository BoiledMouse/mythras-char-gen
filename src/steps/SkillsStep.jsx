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

  // Compute base values for all standard skills
  const baseSkills = {};
  skillsData.standard.forEach(({ name, base }) => {
    const parts = base.split(/\s*([+x])\s*/).filter(Boolean);
    let val = parseInt(attrs[parts[0]], 10) || 0;
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i];
      const attr = parts[i + 1];
      const v = parseInt(attrs[attr], 10) || 0;
      val = op === 'x' ? val * v : val + v;
    }
    baseSkills[name] = val;
  });

  // Cultural phase: select up to 3 skills
  const [selectedCult, setSelectedCult] = useState(character.selectedCult || []);
  const toggleCult = skill => {
    setSelectedCult(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : prev.length < 3
          ? [...prev, skill]
          : prev
    );
  };

  // Skill allocation state
  const [cultPoints, setCultPoints] = useState(character.cultPoints ?? 100);
  const [cultAlloc, setCultAlloc] = useState(character.cultAlloc || {});

  // Persist to context
  useEffect(() => {
    updateCharacter({ selectedCult, cultPoints, cultAlloc, baseSkills });
  }, [selectedCult, cultPoints, cultAlloc]);

  const sum = obj => Object.values(obj).reduce((a, b) => a + (b || 0), 0);
  const cultLeft = cultPoints - sum(cultAlloc);

  const handleCultAlloc = (skill, value) => {
    let v = parseInt(value, 10) || 0;
    const prev = cultAlloc[skill] || 0;
    if (v - prev > cultLeft) v = prev;
    setCultAlloc({ ...cultAlloc, [skill]: v });
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-semibold">Cultural Skills (select up to 3)</h3>
        <div className="grid grid-cols-2 gap-2">
          {culture.standardSkills?.map(skill => (
            <label key={skill} className="inline-flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedCult.includes(skill)}
                onChange={() => toggleCult(skill)}
              />
              {skill} ({baseSkills[skill]})
            </label>
          ))}
        </div>
        <div className="mt-4 flex items-center">
          <label className="mr-2">Cultural Points:</label>
          <input
            type="number"
            className="w-20 border-gray-300 rounded"
            value={cultPoints}
            min={0}
            onChange={e => setCultPoints(+e.target.value || 0)}
          />
          <span className="ml-4">Left: {cultLeft}</span>
        </div>
        <div className="mt-4 space-y-2">
          {selectedCult.map(skill => (
            <div key={skill} className="flex items-center">
              <span className="w-32 font-medium">{skill}</span>
              <input
                type="number"
                className="w-20 border-gray-300 rounded"
                min={0}
                value={cultAlloc[skill] || 0}
                onChange={e => handleCultAlloc(skill, e.target.value)}
              />
              <span className="ml-2 text-sm">(+{baseSkills[skill]})</span>
            </div>
          ))}
        </div>
      </section>
      {/* Career & Bonus phases unchanged */}
    </div>
  );
}
