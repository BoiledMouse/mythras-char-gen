// src/components/StepWrapper.jsx
import React from 'react';

export default function StepWrapper({ title, children }) {
  return (
    <div className="panel-parchment p-6 max-w-4xl mx-auto w-full space-y-6">
      {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
}
