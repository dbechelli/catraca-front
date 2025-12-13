import axios from 'axios';

const base = import.meta.env.VITE_API_URL ?? 'https://apicatraca.visualsoftia.cloud';

const api = axios.create({
  baseURL: base,
  timeout: 30000,
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros 401 (token expirado/inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiresIn');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

