import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production' 
  ? "https://smartflow-g5sk.onrender.com"
  : "http://localhost:8081";

const API = axios.create({
  baseURL,
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
