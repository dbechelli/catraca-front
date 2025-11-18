import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const registrosService = {
  // Upload individual (mantido para compatibilidade)
  async upload(file, catracaId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('catracaId', catracaId);

    const response = await axios.post(`${API_URL}/api/registros/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Upload consolidado - NOVO
  async uploadConsolidado(formData) {
    const response = await axios.post(`${API_URL}/api/registros/upload-consolidado`, formData, {
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
    if (filtros.catracaId) params.append('catraca_id', filtros.catracaId);
    if (filtros.grupoHorario) params.append('grupo_horario', filtros.grupoHorario);
    if (filtros.duplicados !== undefined) params.append('duplicados', filtros.duplicados);

    const response = await axios.get(`${API_URL}/api/registros?${params.toString()}`);
    return response.data;
  },

  // Obter indicadores
  async obterIndicadores(filtros = {}) {
    const params = new URLSearchParams();
    
    if (filtros.data) params.append('data', filtros.data);
    if (filtros.catracaId) params.append('catraca_id', filtros.catracaId);

    const response = await axios.get(`${API_URL}/api/registros/indicadores?${params.toString()}`);
    return response.data;
  },

  // Obter estatísticas
  async obterEstatisticas() {
    const response = await axios.get(`${API_URL}/api/registros/estatisticas`);
    return response.data;
  },

  // Deletar registros
  async deletar(filtros = {}) {
    const params = new URLSearchParams();
    
    if (filtros.data) params.append('data', filtros.data);
    if (filtros.catracaId) params.append('catraca_id', filtros.catracaId);

    const response = await axios.delete(`${API_URL}/api/registros?${params.toString()}`);
    return response.data;
  },
};

export default registrosService;
