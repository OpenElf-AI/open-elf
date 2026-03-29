import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/Toast';
import { ConfirmDialogProvider } from './components/ConfirmDialog';
import { QueryProvider } from './providers/QueryProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <ToastProvider>
        <ConfirmDialogProvider>
          <App />
        </ConfirmDialogProvider>
      </ToastProvider>
    </QueryProvider>
  </React.StrictMode>
);
