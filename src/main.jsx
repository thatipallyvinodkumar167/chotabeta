import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global fetch interceptor to append JWT token
const { fetch: originalFetch } = window;
window.fetch = async (input, init) => {
  const token = localStorage.getItem('token');
  if (token) {
    init = init || {};
    init.headers = init.headers || {};
    if (init.headers instanceof Headers) {
      if (!init.headers.has('Authorization')) {
        init.headers.set('Authorization', `Bearer ${token}`);
      }
    } else if (Array.isArray(init.headers)) {
      const hasAuth = init.headers.some(([key]) => key.toLowerCase() === 'authorization');
      if (!hasAuth) {
        init.headers.push(['Authorization', `Bearer ${token}`]);
      }
    } else {
      const hasAuth = Object.keys(init.headers).some(k => k.toLowerCase() === 'authorization');
      if (!hasAuth) {
        init.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }
  return originalFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />,
)

