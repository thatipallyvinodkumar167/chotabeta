export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? (import.meta.env.VITE_API_BASE_URL.includes('/api/seller')
      ? import.meta.env.VITE_API_BASE_URL
      : `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/seller`)
  : 'http://localhost:5008/api/seller';
