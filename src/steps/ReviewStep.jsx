import React from 'react';
import { useCharacter } from '../context/characterContext';
import skillsData from '../data/skills.json';

/**
 * ReviewStep: renders the full Mythras character sheet,
 * populating fields from character context, and falling back
 * to editable inputs where data is missing.
 */
export function ReviewStep() {
  const { character, updateCharacter } = useCharacter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateCharacter({ [name]: value });
  };

  // Skill names for display
  const allSkillNames = [
    ...skillsData.standard.map(s => s.name),
    ...skillsData.professional.map(s => s.name)
  ];
  const uniqueSkills = Array.from(new Set(allSkillNames));

  return (
    <div className="review-step p-6 bg-gray-100">
      <div className="sheet-container max-w-7xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        {/* Page 1 */}
        <section className="page p-6 grid grid-cols-3 gap-6">
          {/* Header */}
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
            {/* Spacer or additional field */}
            <div />
          </div>

          {/* Basic Info Fields */}
          <div className="col-span-3 grid grid-cols-3 gap-4 mb-6">
            {[
              { name: 'species', label: 'Species' },
              { name: 'gender', label: 'Gender' },
              { name: 'age', label: 'Age' },
              { name: 'frame', label: 'Frame' },
              { name: 'culture', label: 'Culture' },
              { name: 'socialClass', label: 'Social Class' },
              { name: 'height', label: 'Height' },
              { name: 'weight', label: 'Weight' },
              { name: 'career', label: 'Career' },
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

          {/* Background Notes */}
          <div className="col-span-2">
            <label className="block font-semibold mb-1">Background, Community & Family</label>
            <textarea
              name="backgroundNotes"
              value={character.backgroundNotes || ''}
              onChange={handleChange}
              rows={5}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Contacts */}
          <div>
            <label className="block font-semibold mb-1">Contacts, Allies & Enemies</label>
            <textarea
              name="contacts"
              value={character.contacts || ''}
              onChange={handleChange}
              rows={5}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Characteristics */}
          <div className="col-span-3 grid grid-cols-2 gap-6 mt-6">
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
                  {/* TODO: Max and current circles */}
                </div>
              ))}
            </div>

            {/* Derived Attributes */}
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

          {/* Final Skills Display */}
          <div className="col-span-3 mt-6">
            <h3 className="font-semibold mb-2">Final Skills</h3>
            <div className="grid grid-cols-3 gap-4">
              {uniqueSkills.map(name => (
                <div key={name} className="flex justify-between items-center p-2 border rounded">
                  <span>{name}</span>
                  <span>{character.skills?.[name] ?? 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Page 2: Equipment, Movement, Combat, etc. */}
        <section className="page p-6 grid grid-cols-2 gap-6 bg-gray-50">
          <div>
            <h3 className="font-semibold mb-2">Equipment & Armour</h3>
            <textarea
              name="equipment"
              value={character.equipment || ''}
              onChange={handleChange}
              rows={4}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Weapons & Shields</h3>
            <textarea
              name="weapons"
              value={character.weapons || ''}
              onChange={handleChange}
              rows={4}
              className="w-full border p-2 rounded"
            />
          </div>
          {/* TODO: Movement, Hit Locations, Combat Styles, Resistances, Fatigue */}
        </section>
      </div>
    </div>
  );
}
