
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("EA_DRIVE: Iniciando montagem do sistema...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("EA_DRIVE: Erro fatal - Elemento 'root' não encontrado no HTML.");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("EA_DRIVE: Aplicação renderizada com sucesso.");
} catch (error) {
  console.error("EA_DRIVE: Erro durante a renderização inicial:", error);
}
