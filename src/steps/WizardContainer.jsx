// src/steps/WizardContainer.jsx
import React, { useState } from 'react';
import ConceptStep from './ConceptStep';
import OtherStep from './OtherStep';

export default function WizardContainer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  // Unified change handler: accepts both native events and (name,value)
  const handleChange = (...args) => {
    let name, value;
    if (args[0] && args[0].target) {
      // called as handleChange(event)
      ({ name, value } = args[0].target);
    } else if (args.length === 2) {
      // called as handleChange(name, value)
      [name, value] = args;
    } else {
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const steps = [
    { title: 'Concept', component: <ConceptStep formData={formData} onChange={handleChange} /> },
    { title: 'Other',   component: <OtherStep formData={formData} onChange={handleChange} /> },
    // ...add additional steps here
  ];

  return (
    <div>
      <nav className="flex space-x-4 mb-6">
        {steps.map((s, i) => (
          <button
            key={s.title}
            className={`px-3 py-1 border-b-2 ${i === currentStep ? 'border-blue-600' : 'border-transparent'}`}
            onClick={() => setCurrentStep(i)}
          >
            {s.title}
          </button>
        ))}
      </nav>

      <div className="w-full">
        {steps[currentStep].component}
      </div>

      <footer className="mt-6 flex justify-between">
        <button onClick={() => setCurrentStep(s => Math.max(s - 1, 0))} disabled={currentStep === 0}>
          Previous
        </button>
        <button onClick={() => setCurrentStep(s => Math.min(s + 1, steps.length - 1))} disabled={currentStep === steps.length - 1}>
          Next
        </button>
      </footer>
    </div>
  );
}
