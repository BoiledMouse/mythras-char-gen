// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import woodBg from './assets/wood.jpg';

const bodyStyle = document.body.style;
bodyStyle.backgroundImage  = `url(${woodBg})`;
bodyStyle.backgroundSize   = 'cover';
bodyStyle.backgroundPosition= 'center';
bodyStyle.backgroundRepeat = 'no-repeat';
bodyStyle.margin           = '0';
bodyStyle.minHeight        = '100vh';

ReactDOM.render(
  <React.StrictMode><App/></React.StrictMode>,
  document.getElementById('root')
);
