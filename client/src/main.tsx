import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './shared/contexts/ThemeContext';
import './shared/i18n';
import { LanguageProvider } from './shared/i18n/LanguageContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
