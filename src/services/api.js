import axios from 'axios';

const base = import.meta.env.VITE_API_URL ?? 'https://apicatraca.visualsoftia.cloud';

const api = axios.create({
  baseURL: base,
  timeout: 30000,
});

export default api;

