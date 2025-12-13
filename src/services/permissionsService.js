import api from './api';

const permissionsService = {
  // Obter todas as permissões disponíveis
  async getAllPermissions() {
    try {
      const response = await api.get('/api/permissions');
      // Backend pode retornar { permissions: [...] } ou [...]
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.permissions || [];
    } catch (error) {
      console.error('Erro ao obter permissões:', error);
      throw error.response?.data || { error: 'Erro ao obter permissões' };
    }
  },

  // Obter permissões de um usuário
  async getUserPermissions(userId) {
    try {
      const response = await api.get(`/api/permissions/${userId}/permissions`);
      // Backend pode retornar { permissions: [...] } ou [...]
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.permissions || [];
    } catch (error) {
      console.error(`Erro ao obter permissões do usuário ${userId}:`, error);
      throw error.response?.data || { error: 'Erro ao obter permissões' };
    }
  },

  // Adicionar permissão a um usuário
  async addUserPermission(userId, permissionId) {
    try {
      const response = await api.post(`/api/permissions/${userId}/permissions`, {
        permission_id: permissionId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao adicionar permissão' };
    }
  },

  // Remover permissão de um usuário
  async removeUserPermission(userId, permissionId) {
    try {
      const response = await api.delete(`/api/permissions/${userId}/permissions/${permissionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao remover permissão' };
    }
  },

  // Atualizar todas as permissões de um usuário (add/remove conforme necessário)
  async updateUserPermissions(userId, newPermissionIds) {
    try {
      // Obter permissões atuais
      const currentPerms = await this.getUserPermissions(userId);
      const currentIds = currentPerms.map(p => typeof p === 'object' ? (p.id || p.permission_id) : p);
      
      // Permissões a remover (estavam lá e não estão mais)
      const toRemove = currentIds.filter(id => !newPermissionIds.includes(id));
      
      // Permissões a adicionar (não estavam lá e estão agora)
      const toAdd = newPermissionIds.filter(id => !currentIds.includes(id));
      
      // Fazer as chamadas
      for (const permId of toRemove) {
        await this.removeUserPermission(userId, permId);
      }
      for (const permId of toAdd) {
        await this.addUserPermission(userId, permId);
      }
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao atualizar permissões' };
    }
  },

  // Criar nova permissão (página)
  async createPermission(data) {
    try {
      const response = await api.post('/api/permissions', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao criar permissão' };
    }
  },

  // Deletar permissão
  async deletePermission(id) {
    try {
      const response = await api.delete(`/api/permissions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao deletar permissão' };
    }
  }
};

export default permissionsService;
