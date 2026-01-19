import api from './api'; // Sua instância do Axios

const financeiroService = {
  /**
   * Obtém o fluxo diário (receitas e despesas)
   * @param {string} dataInicial - YYYY-MM-DD
   * @param {string} dataFinal - YYYY-MM-DD
   * @returns {Promise<Array>}
   */
  async getFluxoDiario(dataInicial, dataFinal) {
    try {
      const response = await api.get('/api/financeiro/fluxo-diario', {
        params: {
          data_inicial: dataInicial,
          data_final: dataFinal
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar fluxo diário:', error);
      throw error;
    }
  }
};

export default financeiroService;
