import React from 'react';
import { CharacterProvider } from './context/characterContext';
import WizardContainer from './steps/WizardContainer';

export default function App() {
  return (
    <CharacterProvider>
      <WizardContainer />
    </CharacterProvider>
  );
}
