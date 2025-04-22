import React from 'react';
import { useCharacter } from '../context/characterContext';
import skillsData from '../data/skills.json';
import equipmentData from '../data/equipment.json';

export function ReviewStep() {
  const { character, updateCharacter } = useCharacter();

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

  // Filter lists
  const standardDisplayed = standardNames.filter(n => !resistanceList.includes(n));
  const resistancesDisplayed = resistanceList;
  const combatDisplayed = combatNames.filter(n => learnedNames.includes(n));
  const professionalDisplayed = professionalNames.filter(n => learnedNames.includes(n));
  const magicDisplayed = magicNames.filter(n => learnedNames.includes(n));

  // Equipment and silver
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
    if (hpSum > thresholds[thresholds.length-1]) {
      const extra = Math.floor((hpSum - thresholds[thresholds.length-1] - 1)/5) + 1;
      val += extra;
    }
    return val;
  };

  return (
    <div className="review-step p-6 bg-gray-100">
      <div className="sheet-container max-w-7xl mx-auto bg-white shadow rounded-lg overflow-hidden">

        {/* Page 1 */}
        <section className="page p-6 grid grid-cols-3 gap-6">
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
                  className="border p-2 rounded w-full"
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
                  className="border p-2 rounded w-full"
                />
              </div>
            ))}
          </div>

          {/* Characteristics & Attributes */}
          <div className="col-span-3 grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Characteristics</h3>
              {['STR','CON','SIZ','DEX','INT','POW','CHA'].map(stat => (
                <div key={stat} className="flex items-center mb-2">
                  <span className="w-20 font-medium">{stat}</span>
                  <input
                    name={stat}
                    type="number"
                    value={character[stat] || ''}
                    onChange={handleChange}
                    className="border p-1 rounded w-16"
                  />
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Attributes</h3>
              {[
                { key: 'actionPoints', label: 'Action Points' },
                { key: 'damageMod', label: 'Damage Modifier' },
                { key: 'xpMod', label: 'Experience Modifier' },
                { key: 'healingRate', label: 'Healing Rate' },
                { key: 'initiativeBonus', label: 'Initiative Bonus' },
                { key: 'luckPoints', label: 'Luck Points' },
                { key: 'movementRate', label: 'Movement Rate' },
              ].map(a => (
                <div key={a.key} className="flex items-center mb-2">
                  <span className="w-32 font-medium">{a.label}</span>
                  <div className="bg-yellow-100 border border-yellow-300 rounded w-32 p-2">
                    {character[a.key] != null ? character[a.key] : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HP per Location */}
          <div className="col-span-3 mb-6">
            <h3 className="font-semibold mb-2">HP per Location</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                ['Head','Head'],
                ['Chest','Chest'],
                ['Abdomen','Abdomen'],
                ['Each Arm','Left Arm'],
                ['Each Arm','Right Arm'],
                ['Leg','Left Leg'],
                ['Leg','Right Leg'],
              ].map(([key,label]) => (
                <div key={label} className="flex justify-between items-center p-2 border rounded">
                  <span>{label}</span>
                  <span>{getHp(key)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Background & Contacts */}
          <div className="col-span-2">
            <label className="block font-semibold mb-1">Background, Community & Family</label>
            <textarea
              name="backgroundNotes"
              value={character.backgroundNotes || ''}
              onChange={handleChange}
              rows={4}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Contacts, Allies & Enemies</label>
            <textarea
              name="contacts"
              value={character.contacts || ''}
              onChange={handleChange}
              rows={4}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Silver Remaining */}
          <div className="col-span-1 mt-4">
            <h3 className="font-semibold mb-2">Silver Remaining</h3>
            <div className="bg-yellow-100 border border-yellow-300 rounded w-32 p-2">
              {silverRemaining} SP
            </div>
          </div>

          {/* Equipment */}
          <div className="col-span-1 mt-6">
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
          <div className="col-span-2 mt-6">
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
            <h3 className="font-semibold mb-2">Professional Skills</nenerate>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {!professionalDisplayed.length ? (
                <p className="text-sm text-gray-500">None learned</p>
              ) : (
                professionalDisplayed.map(n => (
                  <div key={n} className="flex justify-between items-center p-2 border rounded">
                    <span>{n}</span>
                    <span>{character.skills?.[n] || 0}%</span>
                  </div>
                ))
              )}
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
                )))
              }
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
