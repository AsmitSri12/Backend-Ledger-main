import axios from 'axios';
import Cookies from 'js-cookie';

// Get token from both cookie and localStorage (zustand persist)
let storedAuth: { state?: { token?: string } } = {};
if (typeof window !== 'undefined') {
  try {
    storedAuth = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  } catch {
    // Ignore parse errors
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Try cookies first, then localStorage
    let token = Cookies.get('token');
    if (!token && storedAuth?.state?.token) {
      token = storedAuth.state.token;
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just reject errors - let components handle auth failures
    return Promise.reject(error);
  }
);

export default api;
