// frontend/src/api/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Функція для отримання токену з Firebase
const getAuthToken = async () => {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  return null;
};

// Базова функція для API запитів
const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }
  
  return await response.json();
};

// Генерація макету
export const generateLayout = async (data) => {
  console.log('CALLING BACKEND', API_BASE);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000); // 30s timeout

    const resp = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Backend error ${resp.status}: ${text}`);
    }

    return await resp.json();
  } catch (err) {
    console.error('generateLayout error:', err);
    throw err;
  }
};

// API для авторизації
export const authAPI = {
  // Отримати профіль користувача
  getProfile: () => apiRequest('/api/auth/profile'),
  
  // Оновити профіль
  updateProfile: (data) => apiRequest('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// API для проектів
export const projectsAPI = {
  // Отримати всі проекти користувача
  getAll: () => apiRequest('/api/projects'),
  
  // Створити новий проект
  create: (data) => apiRequest('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Отримати конкретний проект
  getById: (id) => apiRequest(`/api/projects/${id}`),
  
  // Оновити проект
  update: (id, data) => apiRequest(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Видалити проект
  delete: (id) => apiRequest(`/api/projects/${id}`, {
    method: 'DELETE',
  }),
};

// Перевірка здоров'я сервера
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};
