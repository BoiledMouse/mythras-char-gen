// src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { CharacterProvider } from './context/characterContext';
import './index.css';
import woodBg from './assets/wood.jpg';

// Apply full‑screen wood background to the <body> element
const bodyStyle = document.body.style;
bodyStyle.backgroundImage = `url(${woodBg})`;
bodyStyle.backgroundSize = 'cover';
bodyStyle.backgroundPosition = 'center';
bodyStyle.backgroundRepeat = 'no-repeat';

ReactDOM.render(
  <React.StrictMode>
    <CharacterProvider>
      <App />
    </CharacterProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
