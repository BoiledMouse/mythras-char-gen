// src/steps/WizardContainer.jsx
import React, { useState } from 'react';
import { ConceptStep } from './ConceptStep';
import { AttributesStep } from './AttributesStep';
import { SkillsStep } from './SkillsStep';
import { EquipmentStep } from './EquipmentStep';
import { MagicStep } from './MagicStep';
import { CultStep } from './CultStep';
import { ReviewStep } from './ReviewStep';

const steps = [
  { id: 'Concept', component: ConceptStep },
  { id: 'Attributes', component: AttributesStep },
  { id: 'Skills', component: SkillsStep },
  { id: 'Equipment', component: EquipmentStep },
  { id: 'Magic', component: MagicStep },
  { id: 'Cult', component: CultStep },
  { id: 'Review', component: ReviewStep },
];

export default function WizardContainer() {
  const [current, setCurrent] = useState(0);
  const StepComponent = steps[current].component;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Stepper Navigation */}
      <nav aria-label="Progress" className="mb-6">
        <ol className="flex justify-between items-center">
          {steps.map((s, i) => (
            <li key={s.id} className="flex-1 flex flex-col items-center">
              <button
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  i === current ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
                onClick={() => setCurrent(i)}
              >
                {i + 1}
              </button>
              <span className="mt-2 text-xs font-medium">{s.id}</span>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="prose prose-lg prose-indigo">
          <StepComponent />
        </div>
      </div>

      {/* Prev/Next Controls */}
      <div className="mt-6 flex justify-between">
        <button
          className="px-5 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
          onClick={() => setCurrent(c => Math.max(c - 1, 0))}
          disabled={current === 0}
        >
          Previous
        </button>
        <button
          className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          onClick={() => setCurrent(c => Math.min(c + 1, steps.length - 1))}
          disabled={current === steps.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
