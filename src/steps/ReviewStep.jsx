import React from 'react';
import { useCharacter } from '../context/characterContext';
import skillsData from '../data/skills.json';
import equipmentData from '../data/equipment.json';
import StepWrapper from '../components/StepWrapper';

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
const standardDisplayed = selected.standard?.filter(
  n => !resistanceList.includes(n) && n !== 'Unarmed'
) || [];
const resistancesDisplayed = resistanceList.filter(n => learnedNames.includes(n));
const magicDisplayed = allMagicNames.filter(n => learnedNames.includes(n));

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

  // HP per location
  const hpSum = (Number(character.CON) || 0) + (Number(character.SIZ) || 0);
  const thresholds = [5, 10, 15, 20, 25, 30, 35, 40];
  const hpTable = {
    Head: [1,2,3,4,5,6,7,8],
    Chest: [3,4,5,6,7,8,9,10],
    Abdomen: [2,3,4,5,6,7,8,9],
    'Each Arm': [1,1,2,3,4,5,6,7],
    Leg: [1,2,3,4,5,6,7,8],
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

  // Markdown export
  const generateMarkdown = () => {
    const lines = [];
    lines.push(`# ${character.characterName || 'Character'}`);
    lines.push(`**Player**: ${character.playerName || ''}`);
    lines.push(`**Sex**: ${character.sex || ''}`);
    lines.push(`**Age**: ${character.age || ''}`);
    lines.push('');
    // Concept
    ['Species','Frame','Height','Weight','Career','Culture','Social Class'].forEach(label => {
      const key = label.replace(/ /g,'').charAt(0).toLowerCase() + label.replace(/ /g,'').slice(1);
      lines.push(`**${label}**: ${character[key]||''}`);
    });
    lines.push('');
    // Characteristics
    lines.push('## Characteristics');
    ['STR','CON','SIZ','DEX','INT','POW','CHA'].forEach(stat => lines.push(`- **${stat}**: ${character[stat]||''}`));
    lines.push('');
    // Attributes
    lines.push('## Attributes');
    ['Action Points','Damage Modifier','Experience Modifier','Healing Rate','Initiative Bonus','Luck Points','Movement Rate'].forEach(label => {
      const key = label.split(' ').map((w,i)=> i===0? w.charAt(0).toLowerCase()+w.slice(1): w).join('');
      lines.push(`- **${label}**: ${character[key]||''}`);
    });
    lines.push('');
    // HP
    lines.push('## Hit Points per Location');
    ['Head','Chest','Abdomen','Left Arm','Right Arm','Left Leg','Right Leg'].forEach(loc=> {
      const key = loc.includes('Arm')?'Each Arm': loc.includes('Leg')?'Leg':loc;
      lines.push(`- **${loc}**: ${getHp(key)}`);
    });
    lines.push('');
    // Background & contacts
    lines.push('## Background, Community & Family');
    lines.push(character.backgroundNotes||'');
    lines.push('');
    lines.push('## Contacts, Allies & Enemies');
    lines.push(character.contacts||'');
    lines.push('');
    // Money & equipment
    lines.push('## Money & Equipment');
    lines.push(`- **Silver Remaining**: ${silverRemaining} SP`);
    if(equipmentList.length) {
      lines.push('- **Equipment**:');
      equipmentList.forEach(item=>lines.push(`  - ${item}`));
    }
    lines.push('');
    // Skills
    lines.push('## Skills');
    if(standardDisplayed.length) { lines.push('### Standard Skills'); standardDisplayed.forEach(n=>lines.push(`- ${n}: ${character.skills?.[n]||0}%`)); lines.push(''); }
    if(resistancesDisplayed.length) { lines.push('### Resistances'); resistancesDisplayed.forEach(n=>lines.push(`- ${n}: ${character.skills?.[n]||0}%`)); lines.push(''); }
    if(combatDisplayed.length)     { lines.push('### Combat Skills'); combatDisplayed.forEach(n=>lines.push(`- ${n}: ${character.skills?.[n]||0}%`)); lines.push(''); }
    if(professionalDisplayed.length){ lines.push('### Professional Skills'); professionalDisplayed.forEach(n=>lines.push(`- ${n}: ${character.skills?.[n]||0}%`)); lines.push(''); }
    if(magicDisplayed.length)      { lines.push('### Magic Skills'); magicDisplayed.forEach(n=>lines.push(`- ${n}: ${character.skills?.[n]||0}%`)); lines.push(''); }
    return lines.join('\n');
  };
  const exportMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${character.characterName||'character'}.md`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <StepWrapper title="Review">
      <div className="flex justify-end mb-4">
        <button onClick={exportMarkdown} className="btn btn-secondary">Export Markdown</button>
      </div>
      <div className="panel-parchment max-w-7xl mx-auto p-6">
        {/* Page 1: Header & Concept */}
        <section className="grid grid-cols-4 gap-4 mb-6">
          {[
            { key:'playerName', label:'Player' },
            { key:'characterName', label:'Character' },
            { key:'sex', label:'Sex' },
            { key:'age', label:'Age' }
          ].map(f=>(
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input name={f.key} value={character[f.key]||''} onChange={handleChange} className="form-control mt-1" />
            </div>
          ))}
        </section>
        <section className="grid grid-cols-4 gap-4 mb-6">
          {[
            { key:'species', label:'Species' },
            { key:'frame', label:'Frame' },
            { key:'height', label:'Height' },
            { key:'weight', label:'Weight' },
            { key:'career', label:'Career' },
            { key:'culture', label:'Culture' },
            { key:'socialClass', label:'Social Class' }
          ].map(f=>(
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input name={f.key} value={character[f.key]||''} onChange={handleChange} className="form-control mt-1" />
            </div>
          ))}
        </section>

        {/* Page 1: Characteristics & Attributes */}
        <section className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Characteristics</h3>
            {['STR','CON','SIZ','DEX','INT','POW','CHA'].map(s=>(
              <div key={s} className="flex items-center mb-2">
                <span className="w-20 font-medium">{s}</span>
                <div className="bg-yellow-100 border border-yellow-300 rounded w-32 p-2 text-center">
                  {character[s]||''}
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Attributes</h3>
            {['actionPoints','damageMod','xpMod','healingRate','initiativeBonus','luckPoints','movementRate'].map(key=>(
              <div key={key} className="flex items-center mb-2">
                <span className="w-32 font-medium">
                  {key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase())}
                </span>
                <div className="bg-yellow-100 border border-yellow-300 rounded w-32 p-2 text-center">
                  {character[key]!=null?character[key]:''}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HP per Location */}
        <section className="mb-6">
          <h3 className="font-semibold mb-2">HP per Location</h3>
          <div className="grid grid-cols-3 gap-4">
            {[['Head','Head'],['Chest','Chest'],['Abdomen','Abdomen'],['Each Arm','Left Arm'],['Each Arm','Right Arm'],['Leg','Left Leg'],['Leg','Right Leg']].map(([k,label])=>(
              <div key={label} className="flex justify-between items-center p-2 border rounded">
                <span>{label}</span>
                <span>{getHp(k)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Background */}
        <section className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <label className="block font-semibold mb-1">Background, Community & Family</label>
            <textarea name="backgroundNotes" value={character.backgroundNotes||''} onChange={handleChange} rows={4} className="form-control mt-1" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Contacts, Allies & Enemies</label>
            <textarea name="contacts" value={character.contacts||''} onChange={handleChange} rows={4} className="form-control mt-1" />
          </div>
        </section>

        {/* Silver & Equipment */}
        <section className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Silver Remaining</h3>
            <div className="bg-yellow-100 border border-yellow-300 rounded w-32 p-2 text-center">{silverRemaining} SP</div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Equipment</h3>
            <ul className="list-disc list-inside">
              {equipmentList.length? equipmentList.map((i,j)=><li key={j}>{i}</li>) : <li>No equipment selected</li>}
            </ul>
          </div>
        </section>

        {/* Page 2: Skills */}
        <section className="p-6 grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <h3 className="font-semibold mb-2">Standard Skills</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {standardDisplayed.map(n=><div key={n} className="flex justify-between items-center p-2 border rounded"><span>{n}</span><span>{character.skills?.[n]||0}%</span></div>)}
            </div>
            <h3 className="font-semibold mb-2">Resistances</h3>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {resistancesDisplayed.map(n=><div key={n} className="flex justify-between items-center p-2 border rounded"><span>{n}</span><span>{character.skills?.[n]||0}%</span></div>)}
            </div>
            <h3 className="font-semibold mb-2">Combat Skills</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {combatDisplayed.length? combatDisplayed.map(n=><div key={n} className="flex justify-between items-center p-2 border rounded"><span>{n}</span><span>{character.skills?.[n]||0}%</span></div>) : <p className="text-sm text-gray-500">None learned</p>}
            </div>
            <h3 className="font-semibold mb-2">Professional Skills</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {professionalDisplayed.length? professionalDisplayed.map(n=><div key={n} className="flex justify-between items-center p-2 border rounded"><span>{n}</span><span>{character.skills?.[n]||0}%</span></div>) : <p className="text-sm text-gray-500">None learned</p>}
            </div>
            <h3 className="font-semibold mb-2">Magic Skills</h3>
            <div className="grid grid-cols-3 gap-4">
              {magicDisplayed.length? magicDisplayed.map(n=><div key={n} className="flex justify-between items-center p-2 border rounded"><span>{n}</span><span>{character.skills?.[n]||0}%</span></div>) : <p className="text-sm text-gray-500">None learned</p>}
            </div>
          </div>
        </section>
      </div>
    </StepWrapper>
  );
}
