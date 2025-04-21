// src/App.jsx
import React from 'react';
import { CharacterProvider } from './context/characterContext';
import WizardContainer from './steps/WizardContainer';

function App() {
  return (
    <CharacterProvider>
      <WizardContainer />
    </CharacterProvider>
  );
}

export default App;
