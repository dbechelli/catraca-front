import { Coffee, Utensils, Moon, AlertTriangle } from 'lucide-react';

export default function IndicatorCards({ indicadores, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Café',
      icon: Coffee,
      color: 'blue',
      data: indicadores?.cafe || { total: 0, duplicados: 0, media_minutos: 0 },
    },
    {
      title: 'Almoço',
      icon: Utensils,
      color: 'green',
      data: indicadores?.almoco || { total: 0, duplicados: 0, media_minutos: 0 },
    },
    {
      title: 'Janta',
      icon: Moon,
      color: 'purple',
      data: indicadores?.janta || { total: 0, duplicados: 0, media_minutos: 0 },
    },
    {
      title: 'Duplicados',
      icon: AlertTriangle,
      color: 'red',
      data: { 
        total: (indicadores?.cafe?.duplicados || 0) + 
               (indicadores?.almoco?.duplicados || 0) + 
               (indicadores?.janta?.duplicados || 0),
        subtotal: indicadores?.total_geral?.duplicados || 0
      },
    },
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-200',
    green: 'from-green-500 to-green-600 shadow-green-200',
    purple: 'from-purple-500 to-purple-600 shadow-purple-200',
    red: 'from-red-500 to-red-600 shadow-red-200',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isDuplicados = card.title === 'Duplicados';

        return (
          <div
            key={card.title}
            className={`
              bg-gradient-to-br ${colorClasses[card.color]}
              rounded-lg shadow-lg p-6 text-white
              hover:scale-105 transition-transform duration-200
            `}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <Icon className="w-8 h-8 opacity-80" />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {isDuplicados ? card.data.total : card.data.total}
                </span>
                <span className="text-sm opacity-80">
                  {isDuplicados ? 'registros' : 'entradas'}
                </span>
              </div>

              {!isDuplicados && (
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <span>⏱️ Média: {card.data.media_minutos} min</span>
                </div>
              )}

              {!isDuplicados && card.data.duplicados > 0 && (
                <div className="flex items-center gap-1 text-xs bg-white/20 rounded px-2 py-1 w-fit">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{card.data.duplicados} duplicados</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
