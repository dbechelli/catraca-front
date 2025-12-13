import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Filter, FileSpreadsheet, BarChart3, RefreshCw, LogOut, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import UploadButton from "../components/UploadButton";
import UploadModal from "../components/UploadModal";
import IndicatorCards from "../components/IndicatorCards";
import DuplicadosAlert from "../components/DuplicadosAlert";
import Filtros from "../components/Filtros";
import TabelaRegistros from "../components/TabelaRegistros";
import registrosService from "../services/registrosService";
import { calcularEstatisticasAvancadas } from "../utils/estatisticasUtils";
import UploadAreaConsolidado from '../components/UploadAreaConsolidado';

export default function Dashboard() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [registros, setRegistros] = useState([]);
  const [indicadores, setIndicadores] = useState(null);
  const [estatisticasAvancadas, setEstatisticasAvancadas] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [loading, setLoading] = useState({
    registros: false,
    indicadores: false,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    // Só carregar dados, sem verificar API
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      await Promise.all([
        carregarRegistros(filtros),
        carregarIndicadores(filtros),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const carregarRegistros = async (filtrosAtuais = {}) => {
    setLoading((prev) => ({ ...prev, registros: true }));
    try {
      const response = await registrosService.listar(filtrosAtuais);
      const registrosCarregados = response.registros || [];
      setRegistros(registrosCarregados);
      
      // Calcular estatísticas a partir dos registros carregados
      const stats = calcularEstatisticasAvancadas(registrosCarregados);
      setEstatisticasAvancadas(stats);
      
      return registrosCarregados;
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
      // Se for 401, não trata aqui - deixa o PrivateRoute cuidar
      if (error.response?.status === 401) {
        return [];
      }
      setRegistros([]);
      setEstatisticasAvancadas(null);
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
      // Se for 401, não trata aqui - deixa o PrivateRoute cuidar
      if (error.response?.status === 401) {
        return null;
      }
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
    
    const [registrosCarregados] = await Promise.all([
      carregarRegistros({}),
      carregarIndicadores({})
    ]);
    
    const stats = calcularEstatisticasAvancadas(registrosCarregados);
    setEstatisticasAvancadas(stats);
  };

  const handleAplicarFiltros = async (novosFiltros) => {
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
    
    const [registrosFiltrados] = await Promise.all([
      carregarRegistros(filtrosCorrigidos),
      carregarIndicadores(filtrosCorrigidos)
    ]);
    
    if (registrosFiltrados) {
      const novasEstatisticas = calcularEstatisticasAvancadas(registrosFiltrados);
      setEstatisticasAvancadas(novasEstatisticas);
    }
  };

  const handleRefresh = () => {
    carregarDados();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const totalDuplicados = indicadores
    ? (indicadores.cafe?.duplicados || 0) +
      (indicadores.almoco?.duplicados || 0) +
      (indicadores.janta?.duplicados || 0)
    : 0;

  const handleProcessSuccess = () => {
    setShowUpload(false);
    carregarDados();
    
    setTimeout(() => {
      setShowUpload(true);
    }, 3000);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-2xl">☁️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Saas Transleg - Catracas
                </h1>
                <p className="text-sm text-gray-600">
                  Gestão inteligente de registros de entrada e saída
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Informações do usuário */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
                <span className="text-gray-700 font-medium">{user?.username}</span>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                  {user?.role}
                </span>
              </div>

              {user?.role === 'superadmin' && (
                <button
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm hover:shadow-md"
                  title="Gerenciar Usuários"
                >
                  <Users className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              )}

              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload */}
          <section className="animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                Upload de Arquivos
              </h2>
              <p className="text-gray-600 mt-1">
                Carregue os arquivos das catracas e processe de forma consolidada
              </p>
            </div>
            <UploadAreaConsolidado onProcessSuccess={handleProcessSuccess} />
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
              registros={registros}
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
            Sistema de Controle de Catracas - by Visual Soft
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
    </div>
  );
}
