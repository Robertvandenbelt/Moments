import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from "@sentry/react";
import App from './App';
import './index.css';

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in development, adjust in production
  // Set environment
  environment: import.meta.env.MODE,
  // Enable debug in development
  debug: import.meta.env.DEV,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
