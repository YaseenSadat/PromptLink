/*
   This is the entry point of the GenieAI application.
   It initializes the React application, wraps it in the ContextProvider for state management, 
   and mounts it to the `#root` DOM element.
*/

import { StrictMode } from 'react'; // Enables additional checks during development
import { createRoot } from 'react-dom/client'; // React's API for rendering components
import App from './App.jsx'; // Main app component
import './index.css'; // Global styles
import ContextProvider from './context/context.jsx'; // Provides global state using the Context API

// Mounts the React application to the DOM element with ID 'root'
createRoot(document.getElementById('root')).render(
  <ContextProvider> {/* Wrap the App with Context for global state */}
    <App />
  </ContextProvider>
);
