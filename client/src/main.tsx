import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from './components/ui/provider';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './auth';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
        <AuthProvider><App /></AuthProvider>
      </BrowserRouter>
      <Toaster />
    </Provider>
  </StrictMode>
);
