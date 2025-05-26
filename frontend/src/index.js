import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Create a root for the React application using the new React 18 API
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main App component within React.StrictMode for highlighting potential problems
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
