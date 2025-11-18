import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Play, Trash2 } from 'lucide-react';
import registrosService from '../services/registrosService';

export default function UploadAreaConsolidado({ onProcessSuccess }) {
  const [files, setFiles] = useState({
    catraca1: null,
    catraca2: null
  });
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (file, catracaId) => {
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Por favor, envie apenas arquivos Excel (.xlsx ou .xls)');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const catracaKey = `catraca${catracaId}`;
    setFiles(prev => ({ ...prev, [catracaKey]: file }));
    setError(null);
    setResults(null);
  };

  const handleRemoveFile = (catracaId) => {
    const catracaKey = `catraca${catracaId}`;
    setFiles(prev => ({ ...prev, [catracaKey]: null }));
  };

  const handleDrop = (e, catracaId) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file, catracaId);
  };

  const handleFileInput = (e, catracaId) => {
    const file = e.target.files[0];
    handleFileSelect(file, catracaId);
  };

  const handleProcessFiles = async () => {
    if (!files.catraca1 && !files.catraca2) {
      setError('Por favor, carregue pelo menos um arquivo');
      return;
    }

    setProcessing(true);
    setError(null);
    setResults(null);

    try {
      // Criar FormData com ambos os arquivos
      const formData = new FormData();
      
      if (files.catraca1) {
        formData.append('file1', files.catraca1);
      }
      
      if (files.catraca2) {
        formData.append('file2', files.catraca2);
      }

      // Chamar endpoint de processamento consolidado
      const result = await registrosService.uploadConsolidado(formData);
      
      setResults(result);
      
      if (onProcessSuccess) {
        onProcessSuccess(result);
      }

      // Limpar arquivos após sucesso
      setTimeout(() => {
        setFiles({ catraca1: null, catraca2: null });
        setResults(null);
      }, 5000);

    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Erro ao processar arquivos';
      setError(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const CatracaCard = ({ catracaId, title }) => {
    const catracaKey = `catraca${catracaId}`;
    const file = files[catracaKey];

    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        
        {file ? (
          <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-600">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFile(catracaId)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remover arquivo"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={(e) => handleDrop(e, catracaId)}
            onDragOver={(e) => e.preventDefault()}
            className="
              border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer
              hover:border-blue-400 hover:bg-gray-50 transition-all duration-200
            "
            onClick={() => document.getElementById(`file-input-${catracaId}`).click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium mb-1">
              Arraste o arquivo Excel aqui
            </p>
            <p className="text-xs text-gray-500">ou clique para selecionar</p>
          </div>
        )}

        <input
          id={`file-input-${catracaId}`}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => handleFileInput(e, catracaId)}
          className="hidden"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Área de Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CatracaCard catracaId={1} title="📤 Catraca 01" />
        <CatracaCard catracaId={2} title="📤 Catraca 02" />
      </div>

      {/* Área de Controle */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Processamento Consolidado</h3>
            <p className="text-sm text-gray-600 mt-1">
              {files.catraca1 && files.catraca2 
                ? 'Ambas as catracas carregadas - pronto para processar'
                : files.catraca1 || files.catraca2
                ? 'Apenas uma catraca carregada'
                : 'Aguardando arquivos'}
            </p>
          </div>
          
          <button
            onClick={handleProcessFiles}
            disabled={processing || (!files.catraca1 && !files.catraca2)}
            className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold
              transition-all duration-200 shadow-lg hover:shadow-xl
              ${processing 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : (!files.catraca1 && !files.catraca2)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105'
              }
            `}
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Executar</span>
              </>
            )}
          </button>
        </div>

        {/* Mensagens de Feedback */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {results && (
          <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">{results.message}</p>
                <p className="text-xs text-green-600 mt-1">
                  Total de registros processados: {results.total}
                </p>
                {results.detalhes && (
                  <div className="mt-2 text-xs text-green-600">
                    <p>Registros pareados: {results.detalhes.pareados}</p>
                    <p>Duplicidades detectadas: {results.detalhes.duplicados}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Informações sobre o processamento */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Como funciona:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• O sistema aguarda o upload dos arquivos das catracas</li>
            <li>• Ao clicar em "Executar", processa os dados de forma consolidada</li>
            <li>• Entrada e saída são pareadas automaticamente, mesmo em catracas diferentes</li>
            <li>• Duplicidades são identificadas e marcadas em vermelho</li>
            <li>• Os minutos totais são calculados entre entrada e saída</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
