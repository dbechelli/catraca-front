import api from './api';

export const registrosService = {
  // Upload de arquivo
  async upload(file, catracaId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('catracaId', catracaId.toString());

    const response = await api.post('/api/registros/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Listar registros com filtros
  async listar(filtros = {}) {
    const params = new URLSearchParams();
    
    if (filtros.nome) params.append('nome', filtros.nome);
    if (filtros.data) params.append('data', filtros.data);
    if (filtros.catraca_id) params.append('catraca_id', filtros.catraca_id);
    if (filtros.grupo_horario) params.append('grupo_horario', filtros.grupo_horario);
    if (filtros.duplicados !== undefined) params.append('duplicados', filtros.duplicados);

    const response = await api.get(`api/registros?${params.toString()}`);

    console.log('📦 Conteúdo retornado pela API /registros:', response.data); // 👈 adicione isto

    return response.data;
  },

  // Obter indicadores
  async obterIndicadores(filtros = {}) {
    const params = new URLSearchParams();
    
    if (filtros.data) params.append('data', filtros.data);
    if (filtros.catraca_id) params.append('catraca_id', filtros.catraca_id);

    const response = await api.get(`api/registros/indicadores?${params.toString()}`);
    return response.data;
  },

  // Obter estatísticas
  async obterEstatisticas() {
    const response = await api.get('api/registros/estatisticas');
    return response.data;
  },

  // Deletar registros
  async deletar(filtros = {}) {
    const params = new URLSearchParams();
    
    if (filtros.data) params.append('data', filtros.data);
    if (filtros.catraca_id) params.append('catraca_id', filtros.catraca_id);

    const response = await api.delete(`api/registros?${params.toString()}`);
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },
};

export default registrosService;
