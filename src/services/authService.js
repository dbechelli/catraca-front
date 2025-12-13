import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token em todas as requisições
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

// Interceptor para tratar respostas com erro 401 (token expirado/inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado - limpar localmente mas NÃO redirecionar aqui
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiresIn');
    }
    return Promise.reject(error);
  }
);

const authService = {
  /**
   * Fazer login
   * @param {string} username - Nome de usuário
   * @param {string} password - Senha
   * @returns {Promise} { success, token, expires_in, user }
   */
  async login(username, password) {
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password
      });
      
      // Salvar token e dados do usuário no localStorage
      const token = response.data.token;
      const user = response.data.user;
      const expiresIn = response.data.expires_in;
      
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        if (expiresIn) localStorage.setItem('expiresIn', expiresIn);
      }
      
      return {
        success: true,
        token,
        user,
        expires_in: expiresIn
      };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Erro ao fazer login';
      throw { error: errorMsg };
    }
  },

  /**
   * Fazer logout
   * @returns {Promise}
   */
  async logout() {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Sempre limpar o token, mesmo se houver erro
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiresIn');
    }
  },

  /**
   * Obter usuário autenticado
   * @returns {object|null}
   */
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Verificar se usuário está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Obter token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Alterar senha do usuário
   * @param {string} currentPassword - Senha atual
   * @param {string} newPassword - Nova senha
   * @returns {Promise}
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao alterar senha' };
    }
  },

  // ========== ROTAS ADMIN ==========

  /**
   * Listar todos os usuários (apenas superadmin)
   * @returns {Promise}
   */
  async listUsers() {
    try {
      const response = await api.get('/api/admin/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao listar usuários' };
    }
  },

  /**
   * Criar novo usuário (apenas superadmin)
   * @param {string} username
   * @param {string} password
   * @param {string} role - 'user' ou 'superadmin'
   * @returns {Promise}
   */
  async createUser(username, password, role = 'user') {
    try {
      const response = await api.post('/api/admin/users', {
        username,
        password,
        role
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao criar usuário' };
    }
  },

  /**
   * Atualizar usuário (apenas superadmin)
   * @param {number} id
   * @param {object} updates - { role?, active? }
   * @returns {Promise}
   */
  async updateUser(id, updates) {
    try {
      const response = await api.put(`/api/admin/users/${id}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao atualizar usuário' };
    }
  },

  /**
   * Deletar usuário (apenas superadmin)
   * @param {number} id
   * @returns {Promise}
   */
  async deleteUser(id) {
    try {
      const response = await api.delete(`/api/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao deletar usuário' };
    }
  },

  // ========== ROTAS REGISTROS ==========

  /**
   * Listar registros com filtros
   * @param {object} filters - { data?, usuario?, etc }
   * @returns {Promise}
   */
  async listarRegistros(filters = {}) {
    try {
      const response = await api.get('api/registros', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao listar registros' };
    }
  },

  /**
   * Obter indicadores
   * @returns {Promise}
   */
  async obterIndicadores() {
    try {
      const response = await api.get('api/registros/indicadores');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao obter indicadores' };
    }
  },

  /**
   * Obter estatísticas
   * @returns {Promise}
   */
  async obterEstatisticas() {
    try {
      const response = await api.get('api/registros/estatisticas');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao obter estatísticas' };
    }
  },

  /**
   * Upload de arquivo Excel
   * @param {File} file
   * @returns {Promise}
   */
  async uploadRegistros(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('api/registros/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao fazer upload' };
    }
  },

  /**
   * Deletar registros
   * @param {object} filters
   * @returns {Promise}
   */
  async deletarRegistros(filters = {}) {
    try {
      const response = await api.delete('api/registros', { data: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao deletar registros' };
    }
  }
};

export default authService;
