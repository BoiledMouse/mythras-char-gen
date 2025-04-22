// src/steps/WizardContainer.jsx
import React, { useState } from 'react';
import ConceptStep       from './ConceptStep';
import AttributesStep    from './AttributesStep';
import SkillsStep        from './SkillsStep';
import EquipmentStep     from './EquipmentStep';
import ReviewStep        from './ReviewStep';
import './WizardContainer.css';

export default function WizardContainer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData]       = useState({});

  // unified change handler for both native events and (name, value) pairs
  const handleChange = (...args) => {
    let name, value;
    if (args[0] && args[0].target) {
      ({ name, value } = args[0].target);
    } else if (args.length === 2) {
      [name, value] = args;
    } else {
      return;
    }
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
    <div className="wizard-panel">
      {/* tabs nav */}
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

      {/* step content */}
      <div className="wizard-content">
        {steps[currentStep].component}
      </div>

      {/* footer with Prev / Next */}
      <footer className="wizard-footer">
        {currentStep > 0 && (
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentStep(n => n - 1)}
          >
            Previous
          </button>
        )}
        {currentStep < steps.length - 1 && (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentStep(n => n + 1)}
          >
            Next
          </button>
        )}
      </footer>
    </div>
  );
}
