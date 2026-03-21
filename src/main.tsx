import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastProvider } from './components/Toast';

// Fix for "Cannot set property fetch of #<Window> which has only a getter"
// This can happen when libraries like html2canvas or jspdf try to polyfill fetch
if (typeof window !== 'undefined') {
  // Polyfill process for browser environment if missing
  if (!(window as any).process) {
    (window as any).process = { env: {} };
  }

  try {
    const originalFetch = window.fetch;
    if (originalFetch) {
      Object.defineProperty(window, 'fetch', {
        get: () => originalFetch,
        set: () => { /* ignore */ },
        configurable: true
      });
    }
  } catch (e) {
    // Already protected or other error
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
