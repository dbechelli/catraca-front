import { Upload } from 'lucide-react';

export default function UploadButton({ onClick }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow">
      <button
        onClick={onClick}
        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
      >
        <Upload className="w-6 h-6" />
        <span>Importar Arquivo Excel</span>
      </button>
      <p className="text-sm text-gray-600 mt-4">
        Clique para selecionar a catraca e fazer upload dos registros
      </p>
    </div>
  );
}
