import { AlertTriangle, LogIn, LogOut, TrendingUp } from 'lucide-react';
import { formatarGrupo } from '../utils/estatisticasUtils';

export default function DuplicadosAlert({ totalDuplicados, estatisticasAvancadas }) {
  if (!estatisticasAvancadas) return null;

  const { totais } = estatisticasAvancadas;
  const temAlerta = totalDuplicados > 0 || totais.semSaida > 0 || totais.semEntrada > 0;

  if (!temAlerta) return null;

  return (
    <div className="space-y-4">
      {/* Alerta de Duplicados */}
      {totalDuplicados > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-base font-semibold text-red-900 mb-1">
                ⚠️ Registros Duplicados Detectados
              </h3>
              <p className="text-sm text-red-700">
                Foram encontrados <strong>{totalDuplicados} registros duplicados</strong> no sistema. 
                Registros duplicados aparecem quando uma pessoa passa pela catraca mais de uma vez no mesmo período.
              </p>
              <p className="text-xs text-red-600 mt-2">
                💡 Use os filtros para visualizar apenas os registros duplicados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alertas de Entradas sem Saída e Saídas sem Entrada */}
      {(totais.semSaida > 0 || totais.semEntrada > 0) && (
        <div className="bg-white border-2 border-amber-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Análise de Fluxo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entradas sem Saída */}
            {totais.semSaida > 0 && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <LogIn className="w-5 h-5 text-amber-700" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      Entradas sem Saída
                    </p>
                    <p className="text-2xl font-bold text-amber-700 mb-2">
                      {totais.semSaida}
                    </p>
                    {totais.maiorConcentracaoSemSaida && (
                      <div className="flex items-center gap-1 text-xs text-amber-700">
                        <span className="font-medium">Maior concentração:</span>
                        <span className="px-2 py-0.5 bg-amber-200 rounded-full font-semibold">
                          {formatarGrupo(totais.maiorConcentracaoSemSaida)}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-amber-600 mt-2">
                      Pessoas que entraram mas não têm registro de saída
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Saídas sem Entrada */}
            {totais.semEntrada > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <LogOut className="w-5 h-5 text-blue-700" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Saídas sem Entrada
                    </p>
                    <p className="text-2xl font-bold text-blue-700 mb-2">
                      {totais.semEntrada}
                    </p>
                    {totais.maiorConcentracaoSemEntrada && (
                      <div className="flex items-center gap-1 text-xs text-blue-700">
                        <span className="font-medium">Maior concentração:</span>
                        <span className="px-2 py-0.5 bg-blue-200 rounded-full font-semibold">
                          {formatarGrupo(totais.maiorConcentracaoSemEntrada)}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-blue-600 mt-2">
                      Pessoas que saíram mas não têm registro de entrada
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dica */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              💡 <strong>Dica:</strong> Registros incompletos podem indicar problemas na catraca ou 
              pessoas que entraram/saíram fora do horário de refeição principal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
