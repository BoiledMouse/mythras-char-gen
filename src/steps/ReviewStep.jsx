import React from 'react';
import { useCharacter } from '../context/characterContext';
import skillsData from '../data/skills.json';

/**
 * ReviewStep: renders the Mythras character sheet,
 * populating fields from context and falling back to inputs for missing values.
 */
export function ReviewStep() {
  const { character, updateCharacter } = useCharacter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateCharacter({ [name]: value });
  };

  // Skill categories
  const standardNames = skillsData.standard.map(s => s.name);
  const professionalNames = skillsData.professional.map(s => s.name);
  const magicNames = skillsData.magic.map(s => s.name);
  const combatNames = [...skillsData.combatStyles.map(s => s.name), 'Unarmed'];
  const learnedNames = character.skills ? Object.keys(character.skills) : [];

  const standardDisplayed = standardNames;
  const combatDisplayed = combatNames.filter(name => learnedNames.includes(name));
  const professionalDisplayed = professionalNames.filter(name => learnedNames.includes(name));
  const magicDisplayed = magicNames.filter(name => learnedNames.includes(name));
  const extraDisplayed = learnedNames.filter(
    name => !standardNames.includes(name) && !professionalNames.includes(name) && !magicNames.includes(name) && !combatNames.includes(name)
  );

  // Equipment
  const equipmentAlloc = character.equipmentAlloc || {};
  const equipmentList = Object.entries(equipmentAlloc)
    .filter(([_, qty]) => qty > 0)
    .map(([name, qty]) => `${name} x${qty}`);

  return (
    <div className="review-step p-6 bg-gray-100">
      <div className="sheet-container max-w-7xl mx-auto bg-white shadow rounded-lg overflow-hidden">

        {/* Page 1 */}
        <section className="page p-6 grid grid-cols-3 gap-6">

          {/* Header: Player, Character, Sex, Age */}
          <div className="col-span-3 grid grid-cols-4 gap-4 mb-4">
            {[
              { key: 'playerName', label: 'Player' },
              { key: 'characterName', label: 'Character' },
              { key: 'sex', label: 'Sex' },
              { key: 'age', label: 'Age' }
            ].map(field => (
              <input
                key={field.key}
                name={field.key}
                value={character[field.key] ?? ''}
                onChange={handleChange}
                placeholder={field.label}
                className="border p-2 rounded w-full"
              />
            ))}
          </div>

          {/* Concept fields */}
          <div className="col-span-3 grid grid-cols-4 gap-4 mb-6">
            {[
              { key: 'species', label: 'Species' },
              { key: 'frame', label: 'Frame' },
              { key: 'height', label: 'Height' },
              { key: 'weight', label: 'Weight' },
              { key: 'career', label: 'Career' },
              { key: 'culture', label: 'Culture' },
              { key: 'socialClass', label: 'Social Class' }
            ].map(field => (
              <input
                key={field.key}
                name={field.key}
                value={character[field.key] ?? ''}
                onChange={handleChange}
                placeholder={field.label}
                className="border p-2 rounded w-full"
              />
            ))}
          </div>

          {/* Characteristics & Attributes */}
          <div className="col-span-3 grid grid-cols-2 gap-6">
            {/* Characteristics */}
            <div>
              <h3 className="font-semibold mb-2">Characteristics</h3>
              {['STR','CON','SIZ','DEX','INT','POW','CHA'].map(stat => (
                <div key={stat} className="flex items-center mb-2">
                  <span className="w-20 font-medium">{stat}</span>
                  <input
                    name={stat}
                    type="number"
                    value={character[stat] ?? ''}
                    onChange={handleChange}
                    className="border p-1 rounded w-16"
                  />
                </div>
              ))}
            </div>

            {/* Attributes */}
            <div>
              <h3 className="font-semibold mb-2">Attributes</h3>
              {[
                { key: 'actionPoints', label: 'Action Points' },
                { key: 'damageMod', label: 'Damage Modifier' },
                { key: 'xpMod', label: 'Experience Modifier' },
                { key: 'healingRate', label: 'Healing Rate' },
                { key: 'initiativeBonus', label: 'Initiative Bonus' },
                { key: 'luckPoints', label: 'Luck Points' },
                { key: 'movementRate', label: 'Movement Rate' }
              ].map(attr => (
                <div key={attr.key} className="flex items-center mb-2">
                  <span className="w-32 font-medium">{attr.label}</span>
                  <div className="bg-yellow-100 border border-yellow-300 rounded w-32 p-2">
                    {character[attr.key] != null ? character[attr.key] : ''}
                  </div>
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
        </section>

        {/* Page 2: Skills & Equipment */}
        <section className="page p-6 grid grid-cols-3 gap-6">
          {/* Skills */}
          <div className="col-span-2 mt-6">

            {/* Standard Skills */}
            <h3 className="font-semibold mb-2">Standard Skills</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {standardDisplayed.map(name => (
                <div key={name} className="flex justify-between items-center p-2 border rounded">
                  <span>{name}</span>
                  <span>{character.skills?.[name] ?? 0}%</span>
                </div>
              ))}
            </div>

            {/** Resistances **/}
            <h3 className="font-semibold mb-2">Resistances</h3>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {['Brawn','Endurance','Evade','Willpower'].map(name => (
                <div key={name} className="flex justify-between items-center p-2 border rounded">
                  <span>{name}</span>
                  <span>{character.skills?.[name] ?? 0}%</span>
                </div>
              ))}
            </div>

            {/* Combat Skills */}
            <h3 className="font-semibold mb-2">Combat Skills</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {combatDisplayed.length > 0 ? (
                combatDisplayed.map(name => (
                  <div key={name} className="flex justify-between items-center p-2 border rounded">
                    <span>{name}</span>
                    <span>{character.skills?.[name] ?? 0}%</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No combat skills learned</p>
              )}
            </div>

            {/* Professional Skills */}
            <h3 className="font-semibold mb-2">Professional Skills</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {professionalDisplayed.length > 0 ? (
                professionalDisplayed.map(name => (
                  <div key={name} className="flex justify-between items-center p-2 border rounded">
                    <span>{name}</span>
                    <span>{character.skills?.[name] ?? 0}%</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No professional skills learned</p>
              )}
            </div>

            {/* Magic Skills */}
            <h3 className="font-semibold mb-2">Magic Skills</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {magicDisplayed.length > 0 ? (
                magicDisplayed.map(name => (
                  <div key={name} className="flex justify-between items-center p-2 border rounded">
                    <span>{name}</span>
                    <span>{character.skills?.[name] ?? 0}%</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No magic skills learned</p>
              )}
            </div>

            {/* Other / Custom Skills */}
            {extraDisplayed.length > 0 && (
              <>
                <h3 className="font-semibold mb-2">Other Skills</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {extraDisplayed.map(name => (
                    <div key={name} className="flex justify-between items-center p-2 border rounded">
                      <span>{name}</span>
                      <span>{character.skills?.[name] ?? 0}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>

          {/* Equipment */}
          <div className="col-span-1 mt-6">
            <h3 className="font-semibold mb-2">Equipment</h3>
            <ul className="list-disc list-inside">
              {equipmentList.length ? (
                equipmentList.map((item,i) => (
                  <li key={i} className="mb-1">{item}</li>
                ))
              ) : (
                <li className="text-gray-500">No equipment selected</li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
