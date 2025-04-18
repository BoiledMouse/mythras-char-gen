// src/App.jsx
import React from 'react';
import WizardContainer from './steps/WizardContainer';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <main className="max-w-3xl mx-auto w-full">
      <header className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-center">Mythras Character Generator</h1>
      </header>
      <WizardContainer />
      </main>
    </div>
  );
}
