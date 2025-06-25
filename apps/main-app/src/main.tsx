import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app';
import { preloadMonacoEditor } from './utils/monaco-preloader';

// Pre-load Monaco Editor for better performance
preloadMonacoEditor();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
