import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import { Toaster } from 'react-hot-toast';
import './index.css'; // Make sure this line exists to import the CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
                <Toaster
          position="bottom-right"
          toastOptions={{
            className: '',
            style: {
              margin: '10px',
              background: '#333',
              color: '#fff',
              zIndex: 1000,
            },
            duration: 5000,
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
            error: {
              duration: 4000,
            },
          }}
        />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
