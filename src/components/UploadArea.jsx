import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import registrosService from '../services/registrosService';

export default function UploadArea({ onUploadSuccess }) {
  const [uploading, setUploading] = useState({});
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  const handleFileUpload = async (file, catracaId) => {
    setUploading((prev) => ({ ...prev, [catracaId]: true }));
    setErrors((prev) => ({ ...prev, [catracaId]: null }));
    setResults((prev) => ({ ...prev, [catracaId]: null }));

    try {
      const result = await registrosService.upload(file, catracaId);
      setResults((prev) => ({ ...prev, [catracaId]: result }));
      
      if (onUploadSuccess) {
        onUploadSuccess(catracaId, result);
      }

      // Limpar resultado após 5 segundos
      setTimeout(() => {
        setResults((prev) => ({ ...prev, [catracaId]: null }));
      }, 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Erro ao fazer upload';
      setErrors((prev) => ({ ...prev, [catracaId]: errorMsg }));
    } finally {
      setUploading((prev) => ({ ...prev, [catracaId]: false }));
    }
  };

  const handleDrop = (e, catracaId) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileUpload(file, catracaId);
    } else {
      setErrors((prev) => ({ ...prev, [catracaId]: 'Por favor, envie apenas arquivos Excel (.xlsx ou .xls)' }));
    }
  };

  const handleFileSelect = (e, catracaId) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, catracaId);
    }
  };

  const UploadCard = ({ catracaId, title }) => {
    const isUploading = uploading[catracaId];
    const result = results[catracaId];
    const error = errors[catracaId];

    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        
        <div
          onDrop={(e) => handleDrop(e, catracaId)}
          onDragOver={(e) => e.preventDefault()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
            ${error ? 'border-red-400 bg-red-50' : ''}
            ${result ? 'border-green-400 bg-green-50' : ''}
          `}
          onClick={() => !isUploading && document.getElementById(`file-input-${catracaId}`).click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-sm text-blue-600 font-medium">Processando arquivo...</p>
            </div>
          ) : result ? (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="text-sm text-green-700 font-medium">{result.message}</p>
              <p className="text-xs text-green-600">{result.total} registros inseridos</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
              <p className="text-xs text-red-600">Clique para tentar novamente</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Arraste o arquivo Excel aqui
                </p>
                <p className="text-xs text-gray-500">ou clique para selecionar</p>
              </div>
              <FileSpreadsheet className="w-6 h-6 text-gray-300" />
            </div>
          )}
        </div>

        <input
          id={`file-input-${catracaId}`}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => handleFileSelect(e, catracaId)}
          className="hidden"
        />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UploadCard catracaId={1} title="📤 Upload Catraca 01" />
      <UploadCard catracaId={2} title="📤 Upload Catraca 02" />
    </div>
  );
}
