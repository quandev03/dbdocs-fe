import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app';
import './config/debug'; // Debug API config
import './config/debug-auth'; // Debug authentication

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
