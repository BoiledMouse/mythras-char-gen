// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import woodBg from './assets/wood.jpg';      // ensure this path is correct
import './index.css';

ReactDOM.render(
  <div
    style={{
      minHeight: '100vh',
      backgroundImage: `url(${woodBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <App />
  </div>,
  document.getElementById('root')
);
