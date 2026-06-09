export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? (import.meta.env.VITE_API_BASE_URL.includes('/public/seller')
      ? import.meta.env.VITE_API_BASE_URL
      : `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/public/seller`)
  : 'http://localhost:5008/api/seller';
