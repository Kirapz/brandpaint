// frontend/src/api/api.js
import { API_BASE_URL } from '../config/api.js';

const API_BASE = API_BASE_URL;

const getAuthToken = async () => {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  return null;
};

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

export const generateLayout = async (data) => {
  console.log('CALLING BACKEND', API_BASE);

  try {
    const token = await getAuthToken();
    
    const resp = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

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

export const authAPI = {
  getProfile: () => apiRequest('/api/auth/profile'),
  
  updateProfile: (data) => apiRequest('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

export const projectsAPI = {
  getAll: () => apiRequest('/api/projects'),
  
  create: (data) => apiRequest('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getById: (id) => apiRequest(`/api/projects/${id}`),
  
  update: (id, data) => apiRequest(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiRequest(`/api/projects/${id}`, {
    method: 'DELETE',
  }),
};

export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};
