import { Search, Filter, X, Calendar } from "lucide-react";
import { useState } from "react";

export default function Filtros({ filtros, onChange, onLimpar, onAplicar }) {
  const [filtrosLocais, setFiltrosLocais] = useState(filtros);

  const handleChange = (campo, valor) => {
    setFiltrosLocais({ ...filtrosLocais, [campo]: valor });
  };

  const aplicarFiltros = () => {
    if (onAplicar) {
      onAplicar(filtrosLocais);
    } else if (onChange) {
      onChange(filtrosLocais);
    }
  };

  const temFiltrosAtivos = Object.values(filtrosLocais).some(
    (v) => v !== "" && v !== undefined
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
        </div>

        {temFiltrosAtivos && (
          <button
            onClick={() => {
              setFiltrosLocais({});
              onLimpar && onLimpar();
            }}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Linha 1: Nome e Período de Datas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filtrosLocais.nome || ""}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por Data Inicial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Data Inicial
            </label>
            <input
              type="date"
              value={
                filtrosLocais.data_inicial && isValidDate(filtrosLocais.data_inicial)
                  ? filtrosLocais.data_inicial
                  : ""
              }
              onChange={(e) =>
                handleChange("data_inicial", e.target.value || undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por Data Final */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Data Final
            </label>
            <input
              type="date"
              value={
                filtrosLocais.data_final && isValidDate(filtrosLocais.data_final)
                  ? filtrosLocais.data_final
                  : ""
              }
              onChange={(e) =>
                handleChange("data_final", e.target.value || undefined)
              }
              min={
                filtrosLocais.data_inicial && isValidDate(filtrosLocais.data_inicial)
                  ? filtrosLocais.data_inicial
                  : undefined
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Linha 2: Catraca, Período e Duplicados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro por Catraca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catraca
            </label>
            <select
              value={filtrosLocais.catraca_id || ""}
              onChange={(e) => handleChange("catraca_id", e.target.value)}
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
              Período do Dia
            </label>
            <select
              value={filtrosLocais.grupo_horario || ""}
              onChange={(e) => handleChange("grupo_horario", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="cafe">☕ Café</option>
              <option value="almoco">🍽️ Almoço</option>
              <option value="janta">🌙 Janta</option>
            </select>
          </div>
        </div>

        {/* Botão Aplicar Filtros */}
        <div className="flex justify-end mt-4">
          <button
            onClick={aplicarFiltros}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>

        {/* Mensagem de ajuda sobre período */}
        {/* Agora mostra só os filtros já aplicados (não os locais) */}
        {(filtros.data_inicial || filtros.data_final) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                {filtros.data_inicial && filtros.data_final ? (
                  <p>
                    Mostrando registros de{" "}
                    <strong>{formatarData(filtros.data_inicial)}</strong> até{" "}
                    <strong>{formatarData(filtros.data_final)}</strong>
                  </p>
                ) : filtros.data_inicial ? (
                  <p>
                    Mostrando registros a partir de{" "}
                    <strong>{formatarData(filtros.data_inicial)}</strong>
                  </p>
                ) : (
                  <p>
                    Mostrando registros até{" "}
                    <strong>{formatarData(filtros.data_final)}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Corrige a exibição da data (sem UTC, sem "voltar um dia")
function formatarData(dataISO) {
  if (!dataISO || !isValidDate(dataISO)) return "";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

// ✅ Validação segura
function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}