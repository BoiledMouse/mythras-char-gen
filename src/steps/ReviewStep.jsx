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

  // Standard and professional skill lists
  const standardNames = skillsData.standard.map(s => s.name);
  const professionalNames = skillsData.professional.map(s => s.name);

  // Skills learned in context
  const learnedNames = character.skills ? Object.keys(character.skills) : [];

  // Display lists
  const standardDisplayed = standardNames;
  const professionalDisplayed = professionalNames.filter(name => learnedNames.includes(name));
  const extraDisplayed = learnedNames
    .filter(name => !standardNames.includes(name) && !professionalNames.includes(name));

  // Equipment list from context (quantity > 0)
  const equipmentAlloc = character.equipmentAlloc || {};
  const equipmentList = Object.entries(equipmentAlloc)
    .filter(([_, qty]) => qty > 0)
    .map(([name, qty]) => `${name} x${qty}`);

  // Resistances names
  const resistanceNames = ['Brawn', 'Endurance', 'Evade', 'Willpower'];

  // Magic skills names
  const magicNames = ['Folk Magic', 'Binding', 'Trance', 'Meditation', 'Mysticism', 'Invocation', 'Shaping', 'Devotion', 'Exhort'];

  return (
    <div className="review-step p-6 bg-gray-100">
      <div className="sheet-container max-w-7xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        {/* Page 1 */}
        <section className="page p-6 grid grid-cols-3 gap-6">
          {/* ... header, concept, characteristics, attributes, background omitted for brevity ... */}

          {/* Skills Sections */}
          <div className="col-span-3 mt-6">
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

            {/* Resistances Section */}
            <h3 className="font-semibold mb-2">Resistances</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {resistanceNames.map(name => (
                <div key={name} className="flex justify-between items-center p-2 border rounded">
                  <span>{name}</span>
                  <span>{character.skills?.[name] ?? 0}%</span>
                </div>
              ))}
            </div>

            {/* Magic Skills Section */}
            <h3 className="font-semibold mb-2">Magic Skills</h3>
            <div className="grid grid-cols-3 gap-4">
              {magicNames.map(name => (
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
