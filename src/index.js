// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';      // your real root component
import './index.css';
import woodBg from './assets/wood.jpg';

// 1) Paint the tavern‑wood background on <body>
const b = document.body.style;
b.backgroundImage    = `url(${woodBg})`;
b.backgroundSize     = 'cover';
b.backgroundPosition = 'center';
b.backgroundRepeat   = 'no-repeat';
b.margin             = '0';
b.minHeight          = '100vh';

// 2) Mount the React app
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
