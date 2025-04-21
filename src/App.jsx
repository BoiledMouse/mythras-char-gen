// src/App.jsx
import React from 'react';
import WizardContainer from './steps/WizardContainer';

export default function App() {
  return (
    <div id="wizard-root" className="panel-parchment min-h-screen">
      <WizardContainer />
    </div>
  );
}
