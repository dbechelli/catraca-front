import { useState } from 'react';
import { Clock, MapPin, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TabelaRegistros({ registros, loading }) {
  const [ordenacao, setOrdenacao] = useState({ campo: 'data', direcao: 'desc' });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const alternarOrdenacao = (campo) => {
    setOrdenacao((prev) => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc',
    }));
  };

  const registrosOrdenados = [...(registros || [])].sort((a, b) => {
    const multiplicador = ordenacao.direcao === 'asc' ? 1 : -1;
    
    if (ordenacao.campo === 'nome') {
      return multiplicador * a.nome.localeCompare(b.nome);
    }
    if (ordenacao.campo === 'data') {
      return multiplicador * new Date(a.data).getTime() - new Date(b.data).getTime();
    }
    if (ordenacao.campo === 'minutos') {
      return multiplicador * ((a.minutos_total || 0) - (b.minutos_total || 0));
    }
    
    return 0;
  });

  const formatarHora = (hora) => {
    if (!hora) return '-';
    return hora.substring(0, 5); // HH:MM
  };

  const formatarData = (data) => {
    try {
      return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return data;
    }
  };

  const getGrupoIcon = (grupo) => {
    const icons = {
      cafe: '☕',
      almoco: '🍽️',
      janta: '🌙',
      outro: '❓',
    };
    return icons[grupo] || '📋';
  };

  const getGrupoLabel = (grupo) => {
    const labels = {
      cafe: 'Café',
      almoco: 'Almoço',
      janta: 'Janta',
      outro: 'Outro',
    };
    return labels[grupo] || grupo;
  };

  const BotaoOrdenacao = ({ campo, label }) => (
    <button
      onClick={() => alternarOrdenacao(campo)}
      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
    >
      {label}
      <ArrowUpDown 
        className={`w-4 h-4 ${ordenacao.campo === campo ? 'text-blue-600' : 'text-gray-400'}`}
      />
    </button>
  );

  if (!registros || registros.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhum registro encontrado
            </h3>
            <p className="text-gray-600">
              Faça upload de um arquivo Excel ou ajuste os filtros
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          Registros ({registrosOrdenados.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <BotaoOrdenacao campo="nome" label="Nome" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <BotaoOrdenacao campo="data" label="Data" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entrada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saída
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <BotaoOrdenacao campo="minutos" label="Tempo (min)" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catraca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Período
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrosOrdenados.map((registro) => (
              <tr
                key={registro.id}
                className={`
                  hover:bg-gray-50 transition-colors
                  ${registro.is_duplicado ? 'bg-red-50 hover:bg-red-100' : ''}
                `}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {registro.is_duplicado && (
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${registro.is_duplicado ? 'text-red-900' : 'text-gray-900'}`}>
                      {registro.nome}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatarData(registro.data)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {formatarHora(registro.horario_entrada)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {formatarHora(registro.horario_saida)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{registro.minutos_total || '-'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>0{registro.catraca_id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getGrupoIcon(registro.grupo_horario)}
                    {getGrupoLabel(registro.grupo_horario)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
