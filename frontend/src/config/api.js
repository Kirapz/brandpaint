// Автоматичне визначення API URL
const getApiUrl = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  console.log('🔍 Detecting API URL:', { hostname, port });
  
  // Якщо це локальна розробка
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const apiUrl = 'http://localhost:5000';
    console.log('✅ Using local API:', apiUrl);
    return apiUrl;
  }
  
  // Якщо це деплой на Render
  if (hostname.includes('brandpaint.onrender.com')) {
    const apiUrl = 'https://brandpaint2.onrender.com';
    console.log('✅ Using Render API:', apiUrl);
    return apiUrl;
  }
  
  // Fallback до env змінної
  const fallback = import.meta.env.VITE_API_URL || 'https://brandpaint2.onrender.com';
  console.log('✅ Using fallback API:', fallback);
  return fallback;
};

export const API_BASE_URL = getApiUrl();
export default API_BASE_URL;