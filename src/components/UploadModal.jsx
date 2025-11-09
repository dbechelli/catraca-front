import { X } from 'lucide-react';
import { useState } from 'react';
import registrosService from '../services/registrosService';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [uploading, setUploading] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  if (!isOpen) return null;

  const handleFileSelect = async (file, catracaId) => {
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Por favor, envie apenas arquivos Excel (.xlsx ou .xls)');
      return;
    }

    setUploading(catracaId);

    try {
      const result = await registrosService.upload(file, catracaId);
      
      if (onUploadSuccess) {
        onUploadSuccess(catracaId, result);
      }

      // Fechar modal após sucesso
      setTimeout(() => {
        onClose();
        setUploading(null);
      }, 1500);

    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Erro ao fazer upload';
      alert(`Erro: ${errorMsg}`);
      setUploading(null);
    }
  };

  const handleDrop = (e, catracaId) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file, catracaId);
  };

  const handleFileInput = (e, catracaId) => {
    const file = e.target.files[0];
    handleFileSelect(file, catracaId);
  };

  const CatracaOption = ({ catracaId, title, description, emoji }) => {
    const isUploading = uploading === catracaId;
    const isDragging = dragOver === catracaId;

    return (
      <div
        onDrop={(e) => handleDrop(e, catracaId)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(catracaId);
        }}
        onDragLeave={() => setDragOver(null)}
        onClick={() => !isUploading && document.getElementById(`modal-file-${catracaId}`).click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 transform
          ${isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300'}
          ${isUploading ? 'pointer-events-none opacity-60' : 'hover:border-blue-500 hover:bg-blue-50 hover:scale-105 hover:shadow-lg'}
        `}
      >
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-blue-600">Processando...</p>
            </div>
          </div>
        )}

        <div className="text-6xl mb-4">{emoji}</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>

        <input
          id={`modal-file-${catracaId}`}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => handleFileInput(e, catracaId)}
          className="hidden"
        />
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📂 Importar Arquivos Excel</h2>
            <p className="text-gray-600 mt-1">Selecione de qual catraca deseja importar os dados</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={uploading !== null}
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <CatracaOption
            catracaId={1}
            title="Catraca 01"
            description="Entrada principal do refeitório"
            emoji="🚪"
          />
          <CatracaOption
            catracaId={2}
            title="Catraca 02"
            description="Entrada secundária do refeitório"
            emoji="🚪"
          />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Arraste e solte o arquivo ou clique para selecionar
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Formatos aceitos: .xlsx, .xls
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
