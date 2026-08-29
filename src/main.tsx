import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ClerkAuthProvider } from './components/ClerkAuthProvider.js';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkAuthProvider>
      <App />
    </ClerkAuthProvider>
  </StrictMode>,
);

