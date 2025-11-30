import axios from 'axios';

// Vite uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7001/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
    }
    if (error.response?.data?.errors) {
      return Promise.reject(new Error(error.response.data.errors.join(', ')));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;