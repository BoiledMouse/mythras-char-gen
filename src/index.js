import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// (If you still want the wood bg applied here, you can re‑add it,
// but for now let’s just focus on the provider wrapping.)
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
