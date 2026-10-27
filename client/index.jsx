import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { AdminThemeProvider } from './src/contexts/AdminThemeContext';
import QueryProvider from './src/contexts/QueryProvider';
import './i18n';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <QueryProvider>
          <AuthProvider>
            <AdminThemeProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </AdminThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);