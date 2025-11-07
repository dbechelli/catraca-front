import { Search, Filter, X } from 'lucide-react';

export default function Filtros({ filtros, onChange, onLimpar }) {
  const handleChange = (campo, valor) => {
    onChange({ ...filtros, [campo]: valor });
  };

  const temFiltrosAtivos = Object.values(filtros).some(v => v !== '' && v !== undefined);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
        </div>
        
        {temFiltrosAtivos && (
          <button
            onClick={onLimpar}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <X className="w-4 h-4" />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Filtro por Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filtros.nome || ''}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtro por Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data
          </label>
          <input
            type="date"
            value={filtros.data || ''}
            onChange={(e) => handleChange('data', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por Catraca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catraca
          </label>
          <select
            value={filtros.catraca_id || ''}
            onChange={(e) => handleChange('catraca_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas</option>
            <option value="1">Catraca 01</option>
            <option value="2">Catraca 02</option>
          </select>
        </div>

        {/* Filtro por Grupo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Período
          </label>
          <select
            value={filtros.grupo_horario || ''}
            onChange={(e) => handleChange('grupo_horario', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="cafe">☕ Café</option>
            <option value="almoco">🍽️ Almoço</option>
            <option value="janta">🌙 Janta</option>
            <option value="outro">❓ Outro</option>
          </select>
        </div>

        {/* Filtro por Duplicados */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duplicados
          </label>
          <select
            value={filtros.duplicados !== undefined ? filtros.duplicados.toString() : ''}
            onChange={(e) => handleChange('duplicados', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="true">Apenas duplicados</option>
            <option value="false">Sem duplicados</option>
          </select>
        </div>
      </div>
    </div>
  );
}
