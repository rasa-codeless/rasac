import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { webchatConfigs } from './configs';
import reportWebVitals from './reportWebVitals';
 
const root = ReactDOM.createRoot(document.getElementById('reactFrontendContainer'));
root.render(
  <React.StrictMode>
    <App
      notify={false}
      appTheme={window.appTheme || "dark"}
      appEnv={window.appEnv || "prod"}
    />
  </React.StrictMode>
);