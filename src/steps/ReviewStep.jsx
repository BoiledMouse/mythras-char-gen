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

  // Determine which skills to show: standard + extras
  const standardNames = skillsData.standard.map(s => s.name);
  const learnedNames = character.skills ? Object.keys(character.skills) : [];
  const extraNames = learnedNames.filter(n => !standardNames.includes(n));
  const displayedSkills = [...standardNames, ...extraNames];

  // Equipment list from context
  const equipmentList = Array.isArray(character.equipment)
    ? character.equipment
    : (character.equipment ? Object.values(character.equipment) : []);

  return (
    <div className="review-step p-6 bg-gray-100">
      <div className="sheet-container max-w-7xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        {/* Page 1 */}
        <section className="page p-6 grid grid-cols-3 gap-6">
          {/* Header: Player, Character, Gender, Age */}
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
                value={character[field.key] ?? character.concept?.[field.key] ?? ''}
                onChange={handleChange}
                placeholder={field.label}
                className="border p-2 rounded w-full"
              />
            ))}
          </div>

          {/* Concept fields: Species, Frame, Height, Weight, Career, Culture, Social Class */}
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
                value={character[field.key] ?? character.concept?.[field.key] ?? ''}
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
                  <input
                    name={attr.key}
                    type="number"
                    value={character[attr.key] ?? ''}
                    onChange={handleChange}
                    className="border p-1 rounded w-16"
                  />
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

          {/* Skills */}
          <div className="col-span-3 mt-6">
            <h3 className="font-semibold mb-2">Skills</h3>
            <div className="grid grid-cols-3 gap-4">
              {displayedSkills.map(name => (
                <div key={name} className="flex justify-between items-center p-2 border rounded">
                  <span>{name}</span>
                  <span>{character.skills?.[name] ?? 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Page 2: Equipment & Other Details */}
        <section className="page p-6 grid grid-cols-2 gap-6 bg-gray-50">
          <div>
            <h3 className="font-semibold mb-2">Equipment</h3>
            <ul className="list-disc list-inside">
              {equipmentList.length
                ? equipmentList.map((item, i) => (
                    <li key={i} className="mb-1">{item}</li>
                  ))
                : <li className="text-gray-500">No equipment selected</li>}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Other Details</h3>
            <p className="text-sm text-gray-600">Movement, Hit Locations, Combat Styles, etc.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
