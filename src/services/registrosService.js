import api from './api';

export const registrosService = {
  // Upload individual
  async upload(file, catracaId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('catracaId', catracaId);

    const response = await api.post('/api/registros/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Upload consolidado - NOVO
  async uploadConsolidado(formData) {
    const response = await api.post(`/api/registros/upload-consolidado`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Listar registros com filtros (incluindo período)
  async listar(filtros = {}) {
    const params = new URLSearchParams();
    
    if (filtros.nome) params.append('nome', filtros.nome);
    if (filtros.data) params.append('data', filtros.data);
    
    // NOVO: Suporte a período de datas
    if (filtros.data_inicial) params.append('data_inicial', filtros.data_inicial);
    if (filtros.data_final) params.append('data_final', filtros.data_final);
    
    if (filtros.catraca_id) params.append('catraca_id', filtros.catraca_id);
    if (filtros.grupo_horario) params.append('grupo_horario', filtros.grupo_horario);
    if (filtros.duplicados !== undefined) params.append('duplicados', filtros.duplicados);

    const response = await api.get(`/api/registros?${params.toString()}`);
    return response.data;
  },

  // Obter indicadores (incluindo período)
  async obterIndicadores(filtros = {}) {
    const params = new URLSearchParams();
    
    if (filtros.data) params.append('data', filtros.data);
    
    // NOVO: Suporte a período de datas
    if (filtros.data_inicial) params.append('data_inicial', filtros.data_inicial);
    if (filtros.data_final) params.append('data_final', filtros.data_final);
    
    if (filtros.catraca_id) params.append('catraca_id', filtros.catraca_id);

    const response = await api.get(`/api/registros/indicadores?${params.toString()}`);
    return response.data;
  },

  // Nova função para buscar tomadores
  async getTomadores() {
    try {
      const response = await api.get('/api/registros/tomadores');
      // Verifica se retornou { tomadores: [...] } ou direto [...]
      if (response.data && Array.isArray(response.data.tomadores)) {
        return response.data.tomadores;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar tomadores:', error);
      throw error;
    }
  },

  // Obter estatísticas
  async obterEstatisticas() {
    const response = await api.get(`/api/registros/estatisticas`);
    return response.data;
  },

  // Conferência ICMS CTE
  async conferenciaCTEIcms(filtros = {}) {
    const params = new URLSearchParams();
    
    if (filtros.data_inicial) params.append('data_inicial', filtros.data_inicial);
    if (filtros.data_final) params.append('data_final', filtros.data_final);

    const response = await api.get(`/api/registros/conferencia-icms-cte?${params.toString()}`);
    return response.data;
  },

  // Deletar registros
  async deletar(filtros = {}) {
    const params = new URLSearchParams();
    
    if (filtros.data) params.append('data', filtros.data);
    if (filtros.catracaId) params.append('catraca_id', filtros.catracaId);

    const response = await api.delete(`/api/registros?${params.toString()}`);
    return response.data;
  },
  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },
};

export default registrosService;
