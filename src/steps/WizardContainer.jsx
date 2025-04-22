import React from 'react';

import ConceptStep   from './ConceptStep';
import AttributesStep from './AttributesStep';
import SkillsStep     from './SkillsStep';
import EquipmentStep  from './EquipmentStep';
import { ReviewStep }     from './ReviewStep';

import './WizardContainer.css';

export default function WizardContainer({ formData, handleChange }) {
  const steps = [
    { title: 'Concept',    component: <ConceptStep   formData={formData} onChange={handleChange} /> },
    { title: 'Attributes', component: <AttributesStep formData={formData} onChange={handleChange} /> },
    { title: 'Skills',     component: <SkillsStep     formData={formData} onChange={handleChange} /> },
    { title: 'Equipment',  component: <EquipmentStep  formData={formData} onChange={handleChange} /> },
    { title: 'Review',     component: <ReviewStep     formData={formData} /> },
  ];

  const currentIndex = steps.findIndex(s => s.title === formData.step);
  const { component } = steps[currentIndex];

  return (
    <div className="wizard-container">
      <nav className="wizard-tabs">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className={`wizard-tab${i === currentIndex ? ' active' : ''}`}
            onClick={() => handleChange({ target: { name: 'step', value: s.title } })}
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
