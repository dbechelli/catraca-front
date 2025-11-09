import { useState, useEffect } from "react";
import { RefreshCw, Database } from "lucide-react";
import UploadButton from "./components/UploadButton";
import UploadModal from "./components/UploadModal";
import IndicatorCards from "./components/IndicatorCards";
import DuplicadosAlert from "./components/DuplicadosAlert";
import Filtros from "./components/Filtros";
import TabelaRegistros from "./components/TabelaRegistros";
import registrosService from "./services/registrosService";
import { calcularEstatisticasAvancadas } from "./utils/estatisticasUtils";

function App() {
  const [todosRegistros, setTodosRegistros] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [indicadores, setIndicadores] = useState(null);
  const [estatisticasAvancadas, setEstatisticasAvancadas] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [loading, setLoading] = useState({
    registros: false,
    indicadores: false,
  });
  const [apiStatus, setApiStatus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    verificarAPI();
    carregarDados();
  }, []);

  const verificarAPI = async () => {
    try {
      const status = await registrosService.healthCheck();
      setApiStatus(status);
    } catch (error) {
      console.error("Erro ao verificar API:", error);
      setApiStatus({ status: "error", database: "disconnected" });
    }
  };

  const carregarDados = async () => {
    await Promise.all([
      carregarTodosRegistros(),
      carregarRegistros(filtros),
      carregarIndicadores(filtros),
    ]);
  };

  const carregarTodosRegistros = async () => {
    try {
      const response = await registrosService.listar({});
      const todos = response.registros || [];
      setTodosRegistros(todos);

      const stats = calcularEstatisticasAvancadas(todos);
      setEstatisticasAvancadas(stats);
    } catch (error) {
      console.error("Erro ao carregar todos registros:", error);
      setTodosRegistros([]);
      setEstatisticasAvancadas(null);
    }
  };

  const carregarRegistros = async (filtrosAtuais = {}) => {
    setLoading((prev) => ({ ...prev, registros: true }));
    try {
      const response = await registrosService.listar(filtrosAtuais);
      const registrosCarregados = response.registros || [];
      setRegistros(registrosCarregados);
      
      // CORREÇÃO: Retornar os registros carregados
      return registrosCarregados;
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
      setRegistros([]);
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, registros: false }));
    }
  };

  const carregarIndicadores = async (filtrosAtuais = {}) => {
    setLoading((prev) => ({ ...prev, indicadores: true }));
    try {
      const response = await registrosService.obterIndicadores(filtrosAtuais);
      setIndicadores(response.indicadores);
      return response.indicadores;
    } catch (error) {
      console.error("Erro ao carregar indicadores:", error);
      setIndicadores(null);
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, indicadores: false }));
    }
  };

  const handleUploadSuccess = () => {
    carregarDados();
  };

  const handleLimparFiltros = async () => {
    setFiltros({});
    
    // Carregar todos os dados sem filtros
    const [registrosCarregados] = await Promise.all([
      carregarRegistros({}),
      carregarIndicadores({})
    ]);
    
    // Recalcular estatísticas com todos os registros
    const stats = calcularEstatisticasAvancadas(registrosCarregados);
    setEstatisticasAvancadas(stats);
  };

  const handleAplicarFiltros = async (novosFiltros) => {
    // Corrigir timezone da data (bug do "dia anterior")
    const corrigirData = (dataStr) => {
      if (!dataStr) return undefined;
      const data = new Date(`${dataStr}T00:00:00`);
      const ajustada = new Date(
        data.getTime() + data.getTimezoneOffset() * 60000
      );
      return ajustada.toISOString().split("T")[0];
    };

    const filtrosCorrigidos = {
      ...novosFiltros,
      data_inicial: corrigirData(novosFiltros.data_inicial),
      data_final: corrigirData(novosFiltros.data_final),
    };

    setFiltros(filtrosCorrigidos);
    
    // CORREÇÃO: Aguardar e capturar os registros filtrados
    const [registrosFiltrados] = await Promise.all([
      carregarRegistros(filtrosCorrigidos),
      carregarIndicadores(filtrosCorrigidos)
    ]);
    
    // CORREÇÃO: Recalcular estatísticas com os registros filtrados
    if (registrosFiltrados) {
      const novasEstatisticas = calcularEstatisticasAvancadas(registrosFiltrados);
      setEstatisticasAvancadas(novasEstatisticas);
    }
  };

  const handleRefresh = () => {
    verificarAPI();
    carregarDados();
  };

  const totalDuplicados = indicadores
    ? (indicadores.cafe?.duplicados || 0) +
      (indicadores.almoco?.duplicados || 0) +
      (indicadores.janta?.duplicados || 0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-2xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema de Controle de Catracas
                </h1>
                <p className="text-sm text-gray-600">
                  Gestão inteligente de registros de entrada e saída
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {apiStatus && (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    apiStatus.status === "ok"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>
                    {apiStatus.status === "ok"
                      ? "Conectado"
                      : "Desconectado"}
                  </span>
                </div>
              )}

              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📤</span>
              <span>Upload de Arquivos</span>
            </h2>
            <UploadButton onClick={() => setModalOpen(true)} />
          </section>

          {/* Cards */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>📊</span>
              <span>Indicadores por Período</span>
            </h2>
            <IndicatorCards
              indicadores={indicadores}
              estatisticasAvancadas={estatisticasAvancadas}
              loading={loading.indicadores}
            />
          </section>

          {/* Duplicados */}
          <section>
            <DuplicadosAlert
              totalDuplicados={totalDuplicados}
              estatisticasAvancadas={estatisticasAvancadas}
              indicadores={indicadores}
              registros={registros}  // <-- ADICIONAR
            />
          </section>

          {/* Filtros */}
          <section>
            <Filtros
              filtros={filtros}
              onAplicar={handleAplicarFiltros}
              onLimpar={handleLimparFiltros}
            />
          </section>

          {/* Tabela */}
          <section>
            <TabelaRegistros registros={registros} loading={loading.registros} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Sistema de Controle de Catracas - by Visual Soft ❤️
          </p>
        </div>
      </footer>

      {/* Modal de upload */}
      <UploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}

export default App;
