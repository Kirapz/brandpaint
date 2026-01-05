// Автоматичне визначення API URL
const getApiUrl = () => {
  // Якщо це локальна розробка
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Якщо це деплой на Render
  if (window.location.hostname.includes('brandpaint.onrender.com')) {
    return 'https://brandpaint2.onrender.com';
  }
  
  // Fallback до env змінної
  return import.meta.env.VITE_API_URL || 'https://brandpaint2.onrender.com';
};

export const API_BASE_URL = getApiUrl();
export default API_BASE_URL;