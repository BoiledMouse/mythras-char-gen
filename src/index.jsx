// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import woodBg from './assets/wood.jpg';

// Paint the body with the wood texture before React mounts
const bodyStyle = document.body.style;
bodyStyle.backgroundImage = `url(${woodBg})`;
bodyStyle.backgroundSize = 'cover';
bodyStyle.backgroundPosition = 'center';
bodyStyle.backgroundRepeat = 'no-repeat';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
