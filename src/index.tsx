import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("EA_DRIVE: Sistema inicializado. Versão 1.0.0");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("EA_DRIVE: Elemento 'root' não encontrado.");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
