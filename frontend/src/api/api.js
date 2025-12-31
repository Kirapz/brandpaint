/* import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const generateLayout = async (data) => {
  try {
    // Відправляємо опис і ключові слова на сервер
    const response = await axios.post(`${API_URL}/generate`, data);
    return response.data;
  } catch (error) {
    console.error("Error generating layout:", error);
    throw error;
  }
};  */

export const generateLayout = async (data) => {
  console.log(' CALLING BACKEND 5000');

  const response = await fetch('http://localhost:5000/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  return response.json();
};
