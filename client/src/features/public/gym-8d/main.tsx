import React from 'react';
import ReactDOM from 'react-dom/client';
import { Gym8dApp } from './Gym8dApp';
import './gym8d.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <Gym8dApp />
    </React.StrictMode>
  );
}
