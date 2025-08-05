import axios from 'axios';

const API = axios.create({
  baseURL: 'https://smartflow-g5sk.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to headers before each request
API.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
