import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { UserViewProvider } from './contexts/UserViewContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App.tsx';
import './i18n/config'; // Initialize i18n BEFORE App
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <UserViewProvider>
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-airbnb-grey-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-pink-500 mx-auto mb-4"></div>
                    <p className="text-airbnb-grey-600">Loading...</p>
                  </div>
                </div>
              }>
                <App />
              </Suspense>
            </UserViewProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);
