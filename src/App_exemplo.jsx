import { useState, useEffect } from 'react';
import { Calendar, Filter, RefreshCw, FileSpreadsheet, BarChart3 } from 'lucide-react';
import UploadAreaConsolidado from './components/UploadAreaConsolidado';
import RegistrosTable from './components/RegistrosTable';
import Indicadores from './components/Indicadores';
import Filtros from './components/Filtros';
import registrosService from './services/registrosService';

export default function App() {
  const [registros, setRegistros] = useState([]);
  const [indicadores, setIndicadores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    nome: '',
    data: '',
    catracaId: '',
    grupoHorario: '',
    duplicados: false
  });
  const [showUpload, setShowUpload] = useState(true);
  const [showFiltros, setShowFiltros] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar registros
      const dadosRegistros = await registrosService.listar(filtros);
      setRegistros(dadosRegistros.registros || []);

      // Carregar indicadores
      const dadosIndicadores = await registrosService.obterIndicadores(filtros);
      setIndicadores(dadosIndicadores);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessSuccess = () => {
    setShowUpload(false);
    carregarDados();
    
    // Mostrar upload novamente após 3 segundos
    setTimeout(() => {
      setShowUpload(true);
    }, 3000);
  };

  const handleFiltrosChange = (novosFiltros) => {
    setFiltros(novosFiltros);
  };

  const handleLimparFiltros = () => {
    setFiltros({
      nome: '',
      data: '',
      catracaId: '',
      grupoHorario: '',
      duplicados: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Sistema de Controle de Catracas
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Processamento consolidado de registros
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFiltros(!showFiltros)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span>Filtros</span>
              </button>
              
              <button
                onClick={carregarDados}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Área de Upload Consolidado */}
        {showUpload && (
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
        )}

        {/* Filtros */}
        {showFiltros && (
          <section className="animate-slideDown">
            <Filtros 
              filtros={filtros} 
              onChange={handleFiltrosChange}
              onLimpar={handleLimparFiltros}
            />
          </section>
        )}

        {/* Indicadores */}
        {indicadores && (
          <section className="animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-green-600" />
                Indicadores por Período
              </h2>
              <p className="text-gray-600 mt-1">
                Estatísticas consolidadas dos registros
              </p>
            </div>
            <Indicadores dados={indicadores} />
          </section>
        )}

        {/* Tabela de Registros */}
        <section className="animate-fadeIn">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-purple-600" />
              Registros Detalhados
            </h2>
            <p className="text-gray-600 mt-1">
              Visualize todos os registros com entrada e saída pareadas
            </p>
          </div>
          <RegistrosTable registros={registros} loading={loading} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Sistema de Controle de Catracas - Processamento Consolidado</p>
            <p className="mt-1">
              Entrada e saída podem estar em catracas diferentes
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
