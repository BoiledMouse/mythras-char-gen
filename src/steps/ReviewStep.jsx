import React from 'react';
import { useCharacter } from '../context/characterContext';
import skillsData from '../data/skills.json';
import equipmentData from '../data/equipment.json';
import StepWrapper from '../components/StepWrapper';
import html2pdf from 'html2pdf.js';

export function ReviewStep() {
  const { character, updateCharacter } = useCharacter();

  const handleChange = e => {
    const { name, value } = e.target;
    updateCharacter({ [name]: value });
  };

  // Skill categories
  const standardNames = skillsData.standard.map(s => s.name);
  const professionalNames = skillsData.professional.map(s => s.name);
  const allMagicNames = [
    ...(skillsData.folkMagic || []).map(s => s.name),
    ...(skillsData.animism || []).map(s => s.name),
    ...(skillsData.mysticism || []).map(s => s.name),
    ...(skillsData.sorcery || []).map(s => s.name),
    ...(skillsData.theism || []).map(s => s.name),
  ];
  const learnedNames = character.skills ? Object.keys(character.skills) : [];
  const resistanceList = ['Brawn', 'Endurance', 'Evade', 'Willpower'];

  const selected = character.selectedSkills || {};
  const combatDisplayed = selected.combat || [];
  const professionalDisplayed = selected.professional || [];

  // show every standard skill (minus true "resistances" and Unarmed)
  const standardDisplayed = skillsData.standard
    .map(s => s.name)
    .filter(n => !resistanceList.includes(n) && n !== 'Unarmed');
  const resistancesDisplayed = resistanceList.filter(n =>
    learnedNames.includes(n)
  );
  const magicDisplayed = allMagicNames.filter(n =>
    learnedNames.includes(n)
  );

  // Equipment & silver
  const equipmentAlloc = character.equipmentAlloc || {};
  const startingSilver = Number(character.startingSilver) || 0;
  const totalSpent = Object.entries(equipmentAlloc).reduce(
    (sum, [name, qty]) => {
      const item = equipmentData.find(e => e.name === name);
      return sum + (item?.cost || 0) * qty;
    },
    0
  );
  const silverRemaining = startingSilver - totalSpent;
  const equipmentList = Object.entries(equipmentAlloc)
    .filter(([, qty]) => qty > 0)
    .map(([name, qty]) => `${name} x${qty}`);

  // HP per location
  const hpSum = (Number(character.CON) || 0) + (Number(character.SIZ) || 0);
  const thresholds = [5, 10, 15, 20, 25, 30, 35, 40];
  const hpTable = {
    Head: [1, 2, 3, 4, 5, 6, 7, 8],
    Chest: [3, 4, 5, 6, 7, 8, 9, 10],
    Abdomen: [2, 3, 4, 5, 6, 7, 8, 9],
    'Each Arm': [1, 1, 2, 3, 4, 5, 6, 7],
    Leg: [1, 2, 3, 4, 5, 6, 7, 8],
  };
  const getHp = key => {
    let idx = thresholds.findIndex(t => hpSum <= t);
    if (idx === -1) idx = thresholds.length - 1;
    let val = hpTable[key][idx];
    if (hpSum > thresholds[thresholds.length - 1]) {
      const extra =
        Math.floor(
          (hpSum - thresholds[thresholds.length - 1] - 1) / 5
        ) + 1;
      val += extra;
    }
    return val;
  };

  // PDF export
  const exportPDF = () => {
    const element = document.querySelector('.panel-parchment');
    const opt = {
      margin: 0.5,
      filename: `${character.characterName || 'character'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
  };

  // Markdown export (unchanged)
  const generateMarkdown = () => {
    /* ...same as before... */
  };
  const exportMarkdown = () => {
    /* ...same as before... */
  };

  return (
    <StepWrapper title="Review">
      <div className="flex justify-end gap-4 mb-4">
        <button onClick={exportMarkdown} className="btn btn-secondary">
          Export Markdown
        </button>
        <button onClick={exportPDF} className="btn btn-secondary">
          Export PDF
        </button>
      </div>

      <div className="panel-parchment max-w-7xl mx-auto p-6">
        {/* Page 1 & 2 up through Equipment unchanged */}

        {/* Page 2: Skills — now full-width */}
        <section className="p-6 mb-6">
          <div className="space-y-8">
            {/* Standard Skills */}
            <div>
              <h3 className="font-semibold mb-2">Standard Skills</h3>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
              >
                {standardDisplayed.map(n => (
                  <div
                    key={n}
                    className="flex items-center p-2 border rounded min-w-0"
                  >
                    <span className="flex-1 font-medium break-words">{n}</span>
                    <span className="flex-none ml-2">
                      {character.skills?.[n] || 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resistances */}
            {resistancesDisplayed.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Resistances</h3>
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
                >
                  {resistancesDisplayed.map(n => (
                    <div
                      key={n}
                      className="flex items-center p-2 border rounded min-w-0"
                    >
                      <span className="flex-1 font-medium break-words">{n}</span>
                      <span className="flex-none ml-2">
                        {character.skills?.[n] || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Combat Skills */}
            <div>
              <h3 className="font-semibold mb-2">Combat Skills</h3>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
              >
                {combatDisplayed.length > 0 ? (
                  combatDisplayed.map(n => (
                    <div
                      key={n}
                      className="flex items-center p-2 border rounded min-w-0"
                    >
                      <span className="flex-1 font-medium break-words">{n}</span>
                      <span className="flex-none ml-2">
                        {character.skills?.[n] || 0}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">None learned</p>
                )}
              </div>
            </div>

            {/* Professional Skills */}
            <div>
              <h3 className="font-semibold mb-2">Professional Skills</h3>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
              >
                {professionalDisplayed.length > 0 ? (
                  professionalDisplayed.map(n => (
                    <div
                      key={n}
                      className="flex items-center p-2 border rounded min-w-0"
                    >
                      <span className="flex-1 font-medium break-words">{n}</span>
                      <span className="flex-none ml-2">
                        {character.skills?.[n] || 0}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">None learned</p>
                )}
              </div>
            </div>

            {/* Magic Skills */}
            {magicDisplayed.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Magic Skills</h3>
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
                >
                  {magicDisplayed.map(n => (
                    <div
                      key={n}
                      className="flex items-center p-2 border rounded min-w-0"
                    >
                      <span className="flex-1 font-medium break-words">{n}</span>
                      <span className="flex-none ml-2">
                        {character.skills?.[n] || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </StepWrapper>
  );
}
