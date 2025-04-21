// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { CharacterProvider } from './context/characterContext';

ReactDOM.render(
  <React.StrictMode>
    <CharacterProvider>
      <App />
    </CharacterProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
