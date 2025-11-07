import { useState, useEffect } from 'react';
import { RefreshCw, Database } from 'lucide-react';
import UploadArea from './components/UploadArea';
import IndicatorCards from './components/IndicatorCards';
import Filtros from './components/Filtros';
import TabelaRegistros from './components/TabelaRegistros';
import registrosService from './services/registrosService';

function App() {
  const [registros, setRegistros] = useState([]);
  const [indicadores, setIndicadores] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [loading, setLoading] = useState({
    registros: false,
    indicadores: false,
  });
  const [apiStatus, setApiStatus] = useState(null);

  // Verificar status da API ao carregar
  useEffect(() => {
    verificarAPI();
    carregarDados();
  }, []);

  // Recarregar quando filtros mudarem
  useEffect(() => {
    carregarRegistros();
  }, [filtros]);

  const verificarAPI = async () => {
    try {
      const status = await registrosService.healthCheck();
      setApiStatus(status);
    } catch (error) {
      console.error('Erro ao verificar API:', error);
      setApiStatus({ status: 'error', database: 'disconnected' });
    }
  };

  const carregarDados = async () => {
    await Promise.all([
      carregarRegistros(),
      carregarIndicadores(),
    ]);
  };

  const carregarRegistros = async () => {
    setLoading((prev) => ({ ...prev, registros: true }));
    try {
      const response = await registrosService.listar(filtros);
      setRegistros(response.registros || []);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      setRegistros([]);
    } finally {
      setLoading((prev) => ({ ...prev, registros: false }));
    }
  };

  const carregarIndicadores = async () => {
    setLoading((prev) => ({ ...prev, indicadores: true }));
    try {
      const response = await registrosService.obterIndicadores({
        data: filtros.data,
        catraca_id: filtros.catraca_id,
      });
      setIndicadores(response.indicadores);
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error);
      setIndicadores(null);
    } finally {
      setLoading((prev) => ({ ...prev, indicadores: false }));
    }
  };

  const handleUploadSuccess = () => {
    carregarDados();
  };

  const handleLimparFiltros = () => {
    setFiltros({});
  };

  const handleRefresh = () => {
    verificarAPI();
    carregarDados();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">🍽️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema de Controle de Catracas
                </h1>
                <p className="text-sm text-gray-600">
                  Gestão de registros de entrada e saída
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {apiStatus && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  apiStatus.status === 'ok' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <Database className="w-4 h-4" />
                  <span>
                    {apiStatus.status === 'ok' ? 'Conecatodo' : 'Desconectado'}
                  </span>
                </div>
              )}

              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📤 Upload de Arquivos
            </h2>
            <UploadArea onUploadSuccess={handleUploadSuccess} />
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📊 Indicadores
            </h2>
            <IndicatorCards 
              indicadores={indicadores} 
              loading={loading.indicadores}
            />
          </section>

          <section>
            <Filtros
              filtros={filtros}
              onChange={setFiltros}
              onLimpar={handleLimparFiltros}
            />
          </section>

          <section>
            <TabelaRegistros
              registros={registros}
              loading={loading.registros}
            />
          </section>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Sistema de Controle de Catracas - Desenvolvido com ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
