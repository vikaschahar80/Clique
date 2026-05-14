import axios from 'axios';

const api = axios.create({
  baseURL: '', // Vite proxy handles /api
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the authToken from localStorage
api.interceptors.request.use(
  (config) => {
    // Let the browser set multipart boundaries for FormData (required for multer)
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
