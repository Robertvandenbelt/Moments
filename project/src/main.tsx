import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from "@sentry/react";
import App from './App';
import '@fontsource-variable/roboto-flex';
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

// Debug: Check if we're even getting to this point
console.error('main.tsx: Starting React app initialization');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('main.tsx: Root element not found!');
  throw new Error('Root element not found');
}

console.error('main.tsx: Root element found, creating React root');

const root = ReactDOM.createRoot(rootElement);

console.error('main.tsx: Rendering App component');

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

console.error('main.tsx: App component rendered');
