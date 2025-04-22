// src/steps/WizardContainer.jsx
import React, { useState } from 'react';

import ConceptStep     from './ConceptStep';
import AttributesStep  from './AttributesStep';
import SkillsStep      from './SkillsStep';
import EquipmentStep   from './EquipmentStep';
import { ReviewStep }     from './ReviewStep';

import './WizardContainer.css';

export default function WizardContainer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData]       = useState({});

  // unified handler for both native events and (name,value) calls
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
      component: <ReviewStep     formData={formData} />
    },
  ];

  const { component } = steps[currentStep];

  return (
    <div className="wizard-container">
      <nav className="wizard-tabs">
        {steps.map((s, idx) => (
          <div
            key={s.title}
            className={`wizard-tab${idx === currentStep ? ' active' : ''}`}
            onClick={() => setCurrentStep(idx)}
          >
            {s.title}
          </div>
        ))}
      </nav>
      <div className="wizard-panel">
        {component}
      </div>
    </div>
  );
}
