import React from 'react';
import { useCharacter } from '../context/characterContext';
import skillsData from '../data/skills.json';

export function ReviewStep() {
  const { character } = useCharacter();
  const { finalSkills = {}, baseStandard = {}, baseProfessional = {}, cultCombatSel = null, baseCombatStyles = {} } = character;

  const skillColor = total => {
    const hue = total >= 70 ? 120 : Math.round((total / 70) * 120);
    return { color: `hsl(${hue},65%,40%)` };
  };

  const allSkillNames = [
    ...skillsData.standard.map(s => s.name),
    ...skillsData.professional.map(s => s.name),
    ...(cultCombatSel ? [cultCombatSel] : [])
  ];

  const uniqueSkills = Array.from(new Set(allSkillNames));

  return (
    <div>
      <h2 className="font-semibold text-lg mb-2">Final Skills</h2>
      <div className="grid grid-cols-2 gap-2">
        {uniqueSkills.map(s => {
          const total = finalSkills[s] || baseStandard[s] || baseProfessional[s] || baseCombatStyles[s] || 0;
          return (
            <div key={s} style={skillColor(total)}>
              <strong>{s}:</strong> {total}%
            </div>
          );
        })}
      </div>
    </div>
  );
}
