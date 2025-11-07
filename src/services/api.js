import axios from 'axios';

// URL da API - altere para sua URL de produção
const API_URL = import.meta.env.VITE_API_URL



const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

// Interceptor para logging (desenvolvimento)
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
