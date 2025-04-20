// src/steps/WizardContainer.jsx
import React, { useState } from 'react';
import { ConceptStep } from './ConceptStep';
import { AttributesStep } from './AttributesStep';
import { SkillsStep } from './SkillsStep';
import { EquipmentStep } from './EquipmentStep';
import { MagicStep } from './MagicStep';
import { CultStep } from './CultStep';
import { ReviewStep } from './ReviewStep';

// Import textures directly from src/assets so webpack bundles them
import woodBg from '../assets/wood.jpg';
import parchmentBg from '../assets/parchment.jpg';

const steps = [
  { id: 'Concept',    label: '1. Concept',    component: ConceptStep },
  { id: 'Attributes', label: '2. Attributes', component: AttributesStep },
  { id: 'Skills',     label: '3. Skills',     component: SkillsStep },
  { id: 'Equipment',  label: '4. Equipment',  component: EquipmentStep },
  { id: 'Magic',      label: '5. Magic',      component: MagicStep },
  { id: 'Cult',       label: '6. Cult',       component: CultStep },
  { id: 'Review',     label: '7. Review',     component: ReviewStep },
];

export default function WizardContainer() {
  const [current, setCurrent] = useState(0);
  const StepComponent = steps[current].component;

  return (
    <div
      id="wizard-root"
      className="min-h-screen w-full font-body"
      style={{
        backgroundImage: `url(${woodBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Parchment-style top stepper */}
      <div
        className="shadow-inner border border-yellow-400 rounded-xl p-4 sm:p-6 md:p-8 mb-6"
        style={{
          backgroundImage: `url(${parchmentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex flex-wrap justify-between items-center gap-2">
          {steps.map((step, i) => (
            <button
              key={step.id}
              onClick={() => setCurrent(i)}
              className={`transition px-4 py-2 rounded-xl border font-display text-sm sm:text-base whitespace-nowrap
                ${i === current
                  ? 'bg-gold text-white border-yellow-700'
                  : 'bg-yellow-100 text-gray-700 border-yellow-300 hover:bg-yellow-200'}`}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parchment-style content panel */}
      <div
        className="rounded-xl shadow p-4 sm:p-6 md:p-8 prose prose-lg prose-indigo"
        style={{
          backgroundImage: `url(${parchmentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <StepComponent />
      </div>

      {/* Prev/Next Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrent(c => Math.max(c - 1, 0))}
          disabled={current === 0}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrent(c => Math.min(c + 1, steps.length - 1))}
          disabled={current === steps.length - 1}
          className="px-4 py-2 bg-gold text-white rounded hover:bg-gold-dark disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
