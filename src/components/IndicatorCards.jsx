import { Coffee, Utensils, Moon, AlertCircle, LogIn, LogOut } from 'lucide-react';

export default function IndicatorCards({ indicadores, estatisticasAvancadas, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-16 bg-gray-200 rounded-full w-16 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'cafe',
      title: 'Café da Manhã',
      icon: Coffee,
      emoji: '☕',
      color: 'blue',
      borderColor: 'border-blue-500',
      bgGradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      data: indicadores?.cafe || {total: 0, entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0, duplicados: 0, media_minutos: '0'},
      stats: estatisticasAvancadas?.cafe || {entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0 }
    },
    {
      id: 'almoco',
      title: 'Almoço',
      icon: Utensils,
      emoji: '🍽️',
      color: 'green',
      borderColor: 'border-green-500',
      bgGradient: 'from-green-50 to-green-100',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100',
      data: indicadores?.almoco || {total: 0, entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0, duplicados: 0, media_minutos: '0'},
      stats: estatisticasAvancadas?.almoco || {entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0 }
    },
    {
      id: 'janta',
      title: 'Janta',
      icon: Moon,
      emoji: '🌙',
      color: 'purple',
      borderColor: 'border-purple-500',
      bgGradient: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      data: indicadores?.janta || {total: 0, entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0, duplicados: 0, media_minutos: '0'},
      stats: estatisticasAvancadas?.janta || {entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0 }
    },
    {
      id: 'duplicados',
      title: 'Duplicados',
      icon: AlertCircle,
      emoji: '⚠️',
      color: 'red',
      borderColor: 'border-red-500',
      bgGradient: 'from-red-50 to-red-100',
      textColor: 'text-red-600',
      iconBg: 'bg-red-100',
      data: {
        total: (indicadores?.cafe?.duplicados || 0) + 
              (indicadores?.almoco?.duplicados || 0) + 
              (indicadores?.janta?.duplicados || 0),
        // preencher duplicados com o mesmo total facilita reuso
        duplicados: (indicadores?.cafe?.duplicados || 0) + 
                    (indicadores?.almoco?.duplicados || 0) + 
                    (indicadores?.janta?.duplicados || 0),
        // se o backend já tem média por grupo, você pode calcular uma média ponderada aqui,
        // por enquanto mantém o campo para compatibilidade:
        media_minutos: indicadores?.cafe?.media_minutos || indicadores?.almoco?.media_minutos || indicadores?.janta?.media_minutos || '0'
      },
      stats: null
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`
            relative bg-white rounded-xl shadow-md p-6 
            border-t-4 ${card.borderColor}
            hover:shadow-xl hover:-translate-y-1 
            transition-all duration-300 cursor-pointer
            overflow-hidden
          `}
        >
          {/* Background Pattern */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.bgGradient} opacity-20 rounded-full -mr-16 -mt-16`}></div>
          
          {/* Icon */}
          <div className="relative mb-4">
            <div className={`inline-flex p-4 rounded-full ${card.iconBg}`}>
              <card.icon className={`w-8 h-8 ${card.textColor}`} strokeWidth={2.5} />
            </div>
          </div>

          {/* Number */}
          <div className="relative">
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {card.data.total ?? ((card.stats?.entradas || 0) + (card.stats?.saidas || 0))}
            </p>
            
            {/* Label */}
            <p className="text-base font-semibold text-gray-700 mb-3">
              {card.title}
            </p>
            
            {/* Entradas e Saídas (apenas para café, almoço, janta) */}
            {card.id !== 'duplicados' && card.stats && (
              <div className="space-y-2 mb-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-600">
                    <LogIn className="w-3 h-3" />
                    <span>Entradas</span>
                  </div>
                  <span className="font-semibold text-gray-900">{card.stats.entradas}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-gray-600">
                    <AlertCircle className="w-3 h-3 text-yellow-500" />
                    Sem Saída
                  </span>
                  <span className="font-semibold text-gray-900">{card.stats?.semSaida ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-600">
                    <LogOut className="w-3 h-3" />
                    <span>Saídas</span>
                  </div>
                  <span className="font-semibold text-gray-900">{card.stats.saidas}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-gray-600">
                    <AlertCircle className="w-3 h-3 text-rose-500" />
                     Sem Entrada
                  </span>
                  <span className="font-semibold text-gray-900">{card.stats?.semEntrada ?? 0}</span>
                </div>               
              </div>
            )}
            
            {/* Média (apenas para café, almoço, janta) */}
            {card.id !== 'duplicados' && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Média: <span className="font-medium text-gray-700">{Math.round(parseFloat(card.data.media_minutos) || 0)} min</span>
                </p>
              </div>
            )}
            
            {/* Alert para duplicados */}
            {card.id === 'duplicados' && card.data.total > 0 && (
              <div className="flex items-center gap-3">
                <p className="text-sm text-red-600 font-medium">
                  Requer atenção — {card.data.total} registros duplicados
                </p>                
              </div>
            )}

          </div>

          {/* Decorative emoji (subtle) */}
          <div className="absolute bottom-3 right-3 text-4xl opacity-10">
            {card.emoji}
          </div>
        </div>
      ))}
    </div>
  );
}