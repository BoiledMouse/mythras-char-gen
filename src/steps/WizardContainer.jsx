// src/steps/WizardContainer.jsx
import React, { useState } from 'react';
import ConceptStep     from './ConceptStep';
import { AttributesStep }  from './AttributesStep';
import { SkillsStep }      from './SkillsStep';
import { EquipmentStep }   from './EquipmentStep';
import { ReviewStep }      from './ReviewStep';

export default function WizardContainer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData]       = useState({});

  // Unified change handler for both native events and (name, value) calls
  const handleChange = (...args) => {
    let name, value;
    if (args[0] && args[0].target) {
      ({ name, value } = args[0].target);
    } else if (args.length === 2) {
      [name, value] = args;
    } else return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const steps = [
    {
      title: 'Concept',
      component: <ConceptStep    formData={formData} onChange={handleChange} />
    },
    {
      title: 'Attributes',
      component: <AttributesStep formData={formData} onChange={handleChange} />
    },
    {
      title: 'Skills',
      component: <SkillsStep     formData={formData} onChange={handleChange} />
    },
    {
      title: 'Equipment',
      component: <EquipmentStep  formData={formData} onChange={handleChange} />
    },
    {
      title: 'Review',
      component: <ReviewStep     formData={formData} onChange={handleChange} />
    },
  ];

  return (
    <div>
      <nav className="wizard-nav">
        {steps.map((step, idx) => (
          <button
            key={step.title}
            className={idx === currentStep ? 'active' : ''}
            onClick={() => setCurrentStep(idx)}
          >
            {step.title}
          </button>
        ))}
      </nav>

      <div className="w-full">
        {steps[currentStep].component}
      </div>

      <footer>
        <button
          onClick={() => setCurrentStep(n => Math.max(n - 1, 0))}
          disabled={currentStep === 0}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(n => Math.min(n + 1, steps.length - 1))}
          disabled={currentStep === steps.length - 1}
          className="btn btn-primary"
        >
          Next
        </button>
      </footer>
    </div>
  );
}
