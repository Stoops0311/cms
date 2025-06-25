import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from '@/App.jsx';
    import '@/index.css';
    import { ConvexClientProvider } from '@/lib/convex.jsx';

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <ConvexClientProvider>
          <App />
        </ConvexClientProvider>
      </React.StrictMode>
    );