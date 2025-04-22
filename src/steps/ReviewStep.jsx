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

  // Determine which skills to display: all standard plus any extras learned
  const standardNames = skillsData.standard.map(s => s.name);
  const learnedNames = character.skills ? Object.keys(character.skills) : [];
  const extraNames = learnedNames.filter(n => !standardNames.includes(n));
  const displayedSkills = [...standardNames, ...extraNames];

  return (
    <div className="review-step p-6 bg-gray-100">
      <div className="sheet-container max-w-7xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        {/* Page 1 */}
        <section className="page p-6 grid grid-cols-3 gap-6">
          {/* Header Fields */}
          <div className="col-span-3 grid grid-cols-3 gap-4 mb-4">
            <input
              name="playerName"
              value={character.playerName || ''}
              onChange={handleChange}
              placeholder="Player"
              className="border p-2 rounded w-full"
            />
            <input
              name="name"
              value={character.name || ''}
              onChange={handleChange}
              placeholder="Character"
              className="border p-2 rounded w-full"
            />
            <input
              name="gender"
              value={character.gender || ''}
              onChange={handleChange}
              placeholder="Gender"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Basic Info */}
          <div className="col-span-3 grid grid-cols-4 gap-4 mb-6">
            {[
              { name: 'species', label: 'Species' },
              { name: 'career', label: 'Career' },
              { name: 'socialClass', label: 'Social Class' },
              { name: 'culture', label: 'Culture' }
            ].map(f => (
              <input
                key={f.name}
                name={f.name}
                value={character[f.name] || ''}
                onChange={handleChange}
                placeholder={f.label}
                className="border p-2 rounded w-full"
              />
            ))}
          </div>

          {/* Characteristics and Attributes */}
          <div className="col-span-3 grid grid-cols-2 gap-6">
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

          {/* Skills Section */}
          <div className="col-span-3 mt-6">
            <h3 className="font-semibold mb-2">Skills</h3>
            <div className="grid grid-cols-3 gap-4">
              {displayedSkills.map(name => (
                <div key={name} className="flex justify-between items-center p-2 border rounded">
                  <span>{name}</span>
                  <span>{character.skills?.[name] ?? ''}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Page 2: Equipment & Other */}
        <section className="page p-6 grid grid-cols-2 gap-6 bg-gray-50">
          {/* Equipment list */}
          <div>
            <h3 className="font-semibold mb-2">Equipment</h3>
            <ul className="list-disc list-inside">
              {character.equipment?.map((item, i) => (
                <li key={i} className="mb-1">{item}</li>
              )) || <li className="text-gray-500">No equipment selected</li>}
            </ul>
          </div>

          {/* Placeholder for further sections */}
          <div>
            <h3 className="font-semibold mb-2">Other Details</h3>
            <p className="text-sm text-gray-600">Movement, Hit Locations, Combat Styles, etc.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
