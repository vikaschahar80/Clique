import axios from 'axios';

const isProduction = import.meta.env.PROD;
let API_URL = import.meta.env.VITE_API_URL;

// Runtime browser check: If running on vercel.app, always force Render backend
const isVercel = typeof window !== 'undefined' && window.location && window.location.hostname.includes('vercel.app');

if (isVercel) {
  API_URL = 'https://clique-tubd.onrender.com';
} else if (!API_URL || API_URL.trim() === '' || API_URL === '/' || API_URL.includes('.vercel.app')) {
  API_URL = isProduction ? 'https://clique-tubd.onrender.com' : '';
}

console.log("🔍 [Axios API URL] Resolved to:", API_URL, "isVercel:", isVercel);

const api = axios.create({
  baseURL: API_URL,
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
