import React from 'react';
import { useCharacter } from '../context/characterContext';
import skillsData from '../data/skills.json';
import equipmentData from '../data/equipment.json';
import StepWrapper from '../components/StepWrapper';

export function ReviewStep() {
  const { character, updateCharacter } = useCharacter();

  // Change handler for inputs
  const handleChange = e => {
    const { name, value } = e.target;
    updateCharacter({ [name]: value });
  };

  // Skill categories
  const standardNames = skillsData.standard.map(s => s.name);
  const professionalNames = skillsData.professional.map(s => s.name);
  const magicNames = (skillsData.magic || []).map(s => s.name);
  const combatNames = [...(skillsData.combatStyles || []).map(s => s.name), 'Unarmed'];
  const learnedNames = character.skills ? Object.keys(character.skills) : [];

  // Resistances
  const resistanceList = ['Brawn', 'Endurance', 'Evade', 'Willpower'];

  // Filter which skills to display
  const standardDisplayed = standardNames.filter(n => !resistanceList.includes(n));
  const resistancesDisplayed = resistanceList;
  const combatDisplayed = combatNames.filter(n => learnedNames.includes(n));
  const professionalDisplayed = professionalNames.filter(n => learnedNames.includes(n));
  const magicDisplayed = magicNames.filter(n => learnedNames.includes(n));

  // Equipment & silver
  const equipmentAlloc = character.equipmentAlloc || {};
  const startingSilver = Number(character.startingSilver) || 0;
  const totalSpent = Object.entries(equipmentAlloc).reduce((sum, [name, qty]) => {
    const item = equipmentData.find(e => e.name === name);
    return sum + (item?.cost || 0) * qty;
  }, 0);
  const silverRemaining = startingSilver - totalSpent;
  const equipmentList = Object.entries(equipmentAlloc)
    .filter(([, qty]) => qty > 0)
    .map(([name, qty]) => `${name} x${qty}`);

  // HP per location calculation
  const hpSum = (Number(character.CON) || 0) + (Number(character.SIZ) || 0);
  const thresholds = [5, 10, 15, 20, 25, 30, 35, 40];
  const hpTable = {
    Leg: [1,2,3,4,5,6,7,8],
    Abdomen: [2,3,4,5,6,7,8,9],
    Chest: [3,4,5,6,7,8,9,10],
    'Each Arm': [1,1,2,3,4,5,6,7],
    Head: [1,2,3,4,5,6,7,8],
  };
  const getHp = key => {
    let idx = thresholds.findIndex(t => hpSum <= t);
    if (idx === -1) idx = thresholds.length - 1;
    let val = hpTable[key][idx];
    if (hpSum > thresholds[thresholds.length - 1]) {
      const extra = Math.floor((hpSum - thresholds[thresholds.length - 1] - 1) / 5) + 1;
      val += extra;
    }
    return val;
  };

  // Markdown export helpers
  const generateMarkdown = () => {
    const lines = [];
    // Header
    lines.push(`# ${character.characterName || 'Character'}`);
    lines.push('');
    lines.push(`**Player**: ${character.playerName || ''}`);
    lines.push(`**Sex**: ${character.sex || ''}`);
    lines.push(`**Age**: ${character.age || ''}`);
    lines.push('');
    // Concept
    ['species','frame','height','weight','career','culture','socialClass'].forEach(k => {
      const label = k.charAt(0).toUpperCase() + k.slice(1);
      lines.push(`**${label}**: ${character[k] || ''}`);
    });
    lines.push('');
    // Characteristics
    lines.push('## Characteristics');
    ['STR','CON','SIZ','DEX','INT','POW','CHA'].forEach(stat => {
      lines.push(`- **${stat}**: ${character[stat] || ''}`);
    });
    lines.push('');
    // Attributes
    lines.push('## Attributes');
    ['actionPoints','damageMod','xpMod','healingRate','initiativeBonus','luckPoints','movementRate'].forEach(key => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s=>s.toUpperCase());
      lines.push(`- **${label}**: ${character[key] || ''}`);
    });
    lines.push('');
    // HP per Location
    lines.push('## Hit Points per Location');
    ['Head','Chest','Abdomen','Each Arm','Leg'].forEach(loc => {
      lines.push(`- **${loc}**: ${getHp(loc)}`);
    });
    lines.push('');
    // Background & Contacts
    lines.push('## Background, Community & Family');
    lines.push(character.backgroundNotes || '');
    lines.push('');
    lines.push('## Contacts, Allies & Enemies');
    lines.push(character.contacts || '');
    lines.push('');
    // Silver & Equipment
    lines.push('## Money & Equipment');
    lines.push(`- **Silver Remaining**: ${silverRemaining} SP`);
    if (equipmentList.length) {
      lines.push('- **Equipment**:');
      equipmentList.forEach(item => lines.push(`  - ${item}`));
    }
    lines.push('');
    // Skills
    lines.push('## Skills');
    if (standardDisplayed.length) {
      lines.push('### Standard Skills');
      standardDisplayed.forEach(n => lines.push(`- ${n}: ${character.skills?.[n] || 0}%`));
      lines.push('');
    }
    if (resistancesDisplayed.length) {
      lines.push('### Resistances');
      resistancesDisplayed.forEach(n => lines.push(`- ${n}: ${character.skills?.[n] || 0}%`));
      lines.push('');
    }
    if (combatDisplayed.length) {
      lines.push('### Combat Skills');
      combatDisplayed.forEach(n => lines.push(`- ${n}: ${character.skills?.[n] || 0}%`));
      lines.push('');
    }
    if (professionalDisplayed.length) {
      lines.push('### Professional Skills');
      professionalDisplayed.forEach(n => lines.push(`- ${n}: ${character.skills?.[n] || 0}%`));
      lines.push('');
    }
    if (magicDisplayed.length) {
      lines.push('### Magic Skills');
      magicDisplayed.forEach(n => lines.push(`- ${n}: ${character.skills?.[n] || 0}%`));
      lines.push('');
    }
    return lines.join('\n');
  };
  const exportMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.characterName || 'character'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StepWrapper title="Review">
      <div className="flex justify-end mb-4">
        <button onClick={exportMarkdown} className="btn btn-secondary">Export Markdown</button>
      </div>
      <div className="panel-parchment max-w-7xl mx-auto p-6">
        {/* Page 1 */}
        <section className="page grid grid-cols-3 gap-6">
          {/* Header Inputs */}
          <div className="col-span-3 grid grid-cols-4 gap-4 mb-4">
            {[
              { key: 'playerName', label: 'Player' },
              { key: 'characterName', label: 'Character' },
              { key: 'sex', label: 'Sex' },
              { key: 'age', label: 'Age' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input
                  name={f.key}
                  value={character[f.key] || ''}
                  onChange={handleChange}
                  className="form-control mt-1"
                />
              </div>
            ))}
          </div>

          {/* Concept Inputs */}
          <div className="col-span-3 grid grid-cols-4 gap-4 mb-6">
            {[
              { key: 'species', label: 'Species' },
              { key: 'frame', label: 'Frame' },
              { key: 'height', label: 'Height' },
              { key: 'weight', label: 'Weight' },
              { key: 'career', label: 'Career' },
              { key: 'culture', label: 'Culture' },
              { key: 'socialClass', label: 'Social Class' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input
                  name={f.key}
                  value={character[f.key] || ''}
                  onChange={handleChange}
                  className="form-control mt-1"
                />
              </div>
            ))}
          </div>

          {/* Characteristics & Attributes */}
          <div className="col-span-3 grid grid-cols-2 gap-6 mb-6">$1</div>

          {/* Background & Contacts */}
          <section className="page grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2">
              <label className="block font-semibold mb-1">Background, Community & Family</label>
              <textarea
                name="backgroundNotes"
                value={character.backgroundNotes || ''}
                onChange={handleChange}
                rows={4}
                className="form-control mt-1"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Contacts, Allies & Enemies</label>
              <textarea
                name="contacts"
                value={character.contacts || ''}
                onChange={handleChange}
                rows={4}
                className="form-control mt-1"
              />
            </div>
          </section>

          {/* Silver & Equipment */}
          <section className="page grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-1">
              <h3 className="font-semibold mb-2">Silver Remaining</h3>
              <div className="bg-yellow-100 border border-yellow-300 rounded w-32 p-2 text-center">
                {silverRemaining} SP
              </div>
            </div>
            <div className="col-span-1">
              <h3 className="font-semibold mb-2">Equipment</h3>
              <ul className="list-disc list-inside">
                {equipmentList.length ? (
                  equipmentList.map((itm, i) => <li key={i}>{itm}</li>)
                ) : (
                  <li>No equipment selected</li>
                )}
              </ul>
            </div>
          </section>

          {/* Page 2: Skills */}
          <section className="page p-6 grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <h3 className="font-semibold mb-2">Standard Skills</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {standardDisplayed.map(n => (
                  <div key={n} className="flex justify-between items-center p-2 border rounded">
                    <span>{n}</span>
                    <span>{character.skills?.[n] || 0}%</span>
                  </div>
                ))}
              </div>
              <h3 className="font-semibold mb-2">Resistances</h3>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {resistancesDisplayed.map(n => (
                  <div key={n} className="flex justify-between items-center p-2 border rounded">
                    <span>{n}</span>
                    <span>{character.skills?.[n] || 0}%</span>
                  </div>
                ))}
              </div>
              <h3 className="font-semibold mb-2">Combat Skills</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {!combatDisplayed.length ? (
                  <p className="text-sm text-gray-500">None learned</p>
                ) : (
                  combatDisplayed.map(n => (
                    <div key={n} className="flex justify-between items-center p-2 border rounded">
                      <span>{n}</span>
                      <span>{character.skills?.[n] || 0}%</span>
                    </div>
                  ))
                )}
              </div>
              <h3 className="font-semibold mb-2">Professional Skills</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {!professionalDisplayed.length ? (
                  <p className="text-sm text-gray-500">None learned</p>
                ) : ( (
                  professionalDisplayed.map(n => (
                    <div key={n} className="flex justify-between items-center p-2 border rounded">
                      <span>{n}</span>
                      <span>{character.skills?.[n] || 0}%</span>
                    </div>
                  ))
                ))}
              </div>
              <h3 className="font-semibold mb-2">Magic Skills</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {!magicDisplayed.length ? (
                  <p className="text-sm text-gray-500">None learned</p>
                ) : (
                  magicDisplayed.map(n => (
                    <div key={n} className="flex justify-between items-center p-2 border rounded">
                      <span>{n}</span>
                      <span>{character.skills?.[n] || 0}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

      </div>
    </StepWrapper>
  );
}
