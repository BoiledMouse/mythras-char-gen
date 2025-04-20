// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';          // your top‑level App component
import './index.css';             // global styles (typography, gutters, etc.)
import woodBg from './assets/wood.jpg';  // ensure this path matches your assets folder

// 1) Paint the wood texture onto <body>
const bodyStyle = document.body.style;
bodyStyle.backgroundImage = `url(${woodBg})`;
bodyStyle.backgroundSize    = 'cover';
bodyStyle.backgroundPosition= 'center';
bodyStyle.backgroundRepeat  = 'no-repeat';
bodyStyle.margin            = '0';       // remove default body margin
bodyStyle.minHeight         = '100vh';   // ensure it fills the viewport

// 2) Mount your React app
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')  // this must match the ID in your public/index.html
);

