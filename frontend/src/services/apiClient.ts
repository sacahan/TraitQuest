import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
