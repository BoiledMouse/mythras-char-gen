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
    <div>
      {/* Step Navigation */}
      <div className="flex space-x-2 mb-4">
        {steps.map((s, i) => (
          <button
            key={s.id}
            className={`px-2 py-1 rounded ${i === current ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setCurrent(i)}
          >
            {s.id}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="p-4 bg-white rounded shadow prose prose-lg prose-indigo">
        <StepComponent />
      </div>

      {/* Prev/Next Controls */}
      <div className="mt-4 flex justify-between">
        <button
          className="px-4 py-2 bg-gray-300 rounded"
          onClick={() => setCurrent(c => Math.max(c - 1, 0))}
          disabled={current === 0}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setCurrent(c => Math.min(c + 1, steps.length - 1))}
          disabled={current === steps.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
