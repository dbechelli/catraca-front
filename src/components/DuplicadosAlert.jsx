import { AlertTriangle, LogIn, LogOut, TrendingUp } from 'lucide-react';
import { formatarGrupo } from '../utils/estatisticasUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function DuplicadosAlert({ totalDuplicados, estatisticasAvancadas, indicadores = {}, registros=[] }) {

  const exportarDuplicadosPDF = () => {
    const duplicados = registros.filter(r => r.is_duplicado);
    
    if (!duplicados || duplicados.length === 0) {
      alert('Nenhum registro duplicado disponível para exportar.');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Relatório de Registros Duplicados', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Sistema de Controle de Catracas', 14, 28);
    doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 34);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total de Duplicados: ${duplicados.length}`, 14, 44);

    const porPeriodo = {
      cafe: duplicados.filter(d => d.grupo_horario === 'cafe'),
      almoco: duplicados.filter(d => d.grupo_horario === 'almoco'),
      janta: duplicados.filter(d => d.grupo_horario === 'janta'),
      outro: duplicados.filter(d => d.grupo_horario === 'outro')
    };

    let startY = 58;

    ['cafe', 'almoco', 'janta', 'outro'].forEach(periodo => {
      const registrosPeriodo = porPeriodo[periodo];
      if (registrosPeriodo.length === 0) return;

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`${formatarGrupo(periodo)} (${registrosPeriodo.length} registros)`, 14, startY);
      startY += 8;

      const porNome = {};
      registrosPeriodo.forEach(registro => {
        const nome = registro.nome || 'Sem Nome';
        if (!porNome[nome]) {
          porNome[nome] = [];
        }
        porNome[nome].push(registro);
      });

      Object.keys(porNome).forEach(nome => {
        porNome[nome].sort((a, b) => new Date(a.data) - new Date(b.data));
      });

      const nomesOrdenados = Object.keys(porNome).sort();

      const dadosTabela = [];
      nomesOrdenados.forEach(nome => {
        porNome[nome].forEach(d => {
          dadosTabela.push([
            d.nome || '-',
            formatarData(d.data),
            formatarHora(d.horario_entrada),
            formatarHora(d.horario_saida),
            d.minutos_total ? `${d.minutos_total} min` : '-',
            `Catraca ${d.catraca_id || '-'}`
          ]);
        });
      });

      autoTable(doc, {
        startY: startY,
        head: [['Nome', 'Data', 'Entrada', 'Saída', 'Tempo', 'Catraca']],
        body: dadosTabela,
        theme: 'grid',
        headStyles: { 
          fillColor: [239, 68, 68],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8
        },
        alternateRowStyles: {
          fillColor: [255, 245, 245]
        },
        margin: { left: 14, right: 14 }
      });

      startY = doc.lastAutoTable.finalY + 12;

      if (startY > 240) {
        doc.addPage();
        startY = 20;
      }
    });

    doc.save(`duplicados_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const exportarEntradasSemSaidaPDF = () => {
    const entradasSemSaida = registros.filter(r => 
      r.horario_entrada && !r.horario_saida
    );
    
    if (!entradasSemSaida || entradasSemSaida.length === 0) {
      alert('Nenhum registro de entrada sem saída disponível.');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Relatório de Entradas sem Saída', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Sistema de Controle de Catracas', 14, 28);
    doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 34);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total: ${entradasSemSaida.length} registros`, 14, 44);

    // Agrupar por período
    const porPeriodo = {
      cafe: entradasSemSaida.filter(d => d.grupo_horario === 'cafe'),
      almoco: entradasSemSaida.filter(d => d.grupo_horario === 'almoco'),
      janta: entradasSemSaida.filter(d => d.grupo_horario === 'janta')
    };

    let startY = 58;

    ['cafe', 'almoco', 'janta'].forEach(periodo => {
      const registrosPeriodo = porPeriodo[periodo];
      if (registrosPeriodo.length === 0) return;

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`${formatarGrupo(periodo)} (${registrosPeriodo.length} registros)`, 14, startY);
      startY += 8;

      const porNome = {};
      registrosPeriodo.forEach(registro => {
        const nome = registro.nome || 'Sem Nome';
        if (!porNome[nome]) {
          porNome[nome] = [];
        }
        porNome[nome].push(registro);
      });

      Object.keys(porNome).forEach(nome => {
        porNome[nome].sort((a, b) => new Date(a.data) - new Date(b.data));
      });

      const nomesOrdenados = Object.keys(porNome).sort();

      const dadosTabela = [];
      nomesOrdenados.forEach(nome => {
        porNome[nome].forEach(d => {
          dadosTabela.push([
            d.nome || '-',
            formatarData(d.data),
            formatarHora(d.horario_entrada),
            formatarHora(d.horario_saida),
            d.minutos_total ? `${d.minutos_total} min` : '-',
            `Catraca ${d.catraca_id || '-'}`
          ]);
        });
      });

      autoTable(doc, {
        startY: startY,
        head: [['Nome', 'Data', 'Entrada', 'Saída', 'Tempo', 'Catraca']],
        body: dadosTabela,
        theme: 'grid',
        headStyles: { 
          fillColor: [245, 158, 11],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [255, 251, 235]
        },
        margin: { left: 14, right: 14 }
      });

      startY = doc.lastAutoTable.finalY + 12;

      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }
    });

    doc.save(`entradas_sem_saida_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const exportarSaidasSemEntradaPDF = () => {
    const saidasSemEntrada = registros.filter(r => 
      !r.horario_entrada && r.horario_saida
    );
    
    if (!saidasSemEntrada || saidasSemEntrada.length === 0) {
      alert('Nenhum registro de saída sem entrada disponível.');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Relatório de Saídas sem Entrada', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Sistema de Controle de Catracas', 14, 28);
    doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 34);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total: ${saidasSemEntrada.length} registros`, 14, 44);

    // Agrupar por período
    const porPeriodo = {
      cafe: saidasSemEntrada.filter(d => d.grupo_horario === 'cafe'),
      almoco: saidasSemEntrada.filter(d => d.grupo_horario === 'almoco'),
      janta: saidasSemEntrada.filter(d => d.grupo_horario === 'janta')
    };

    let startY = 58;

    ['cafe', 'almoco', 'janta'].forEach(periodo => {
      const registrosPeriodo = porPeriodo[periodo];
      if (registrosPeriodo.length === 0) return;

      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`${formatarGrupo(periodo)} (${registrosPeriodo.length} registros)`, 14, startY);
      startY += 8;

      const porNome = {};
      registrosPeriodo.forEach(registro => {
        const nome = registro.nome || 'Sem Nome';
        if (!porNome[nome]) {
          porNome[nome] = [];
        }
        porNome[nome].push(registro);
      });

      Object.keys(porNome).forEach(nome => {
        porNome[nome].sort((a, b) => new Date(a.data) - new Date(b.data));
      });

      const nomesOrdenados = Object.keys(porNome).sort();

      const dadosTabela = [];
      nomesOrdenados.forEach(nome => {
        porNome[nome].forEach(d => {
          dadosTabela.push([
            d.nome || '-',
            formatarData(d.data),
            formatarHora(d.horario_entrada),
            formatarHora(d.horario_saida),
            d.minutos_total ? `${d.minutos_total} min` : '-',
            `Catraca ${d.catraca_id || '-'}`
          ]);
        });
      });

      autoTable(doc, {
        startY: startY,
        head: [['Nome', 'Data', 'Entrada', 'Saída', 'Tempo', 'Catraca']],
        body: dadosTabela,
        theme: 'grid',
        headStyles: { 
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [239, 246, 255]
        },
        margin: { left: 14, right: 14 }
      });

      startY = doc.lastAutoTable.finalY + 12;

      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }
    });

    doc.save(`saidas_sem_entrada_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // ✅ FUNÇÃO CORRIGIDA - Formata data ISO para pt-BR
  const formatarData = (dataString) => {
    if (!dataString) return '-';
    
    // Se a data vier no formato ISO (2025-10-31T00:00:00.000Z)
    try {
      const data = new Date(dataString);
      
      // Verifica se a data é válida
      if (isNaN(data.getTime())) return '-';
      
      // Formata para pt-BR (dd/mm/yyyy)
      return data.toLocaleDateString('pt-BR', {
        timeZone: 'UTC',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  };

  const formatarHora = (hora) => {
    if (!hora) return '-';
    return hora.substring(0, 5);
  };
   
   
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
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-semibold text-red-900">
                  ⚠️ Registros Duplicados Detectados
                </h3>

                <button
                  onClick={exportarDuplicadosPDF}
                  className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 border border-red-300 rounded-md text-red-700 font-medium transition"
                >
                  📄 Exportar PDF
                </button>
              </div>

              <p className="text-sm text-red-700 mb-3">
                Foram encontrados <strong>{totalDuplicados} registros duplicados</strong> no sistema. 
                Registros duplicados aparecem quando uma pessoa passa pela catraca mais de uma vez no mesmo período.
              </p>

              {/* 🧩 Distribuição por grupo (só se indicadores vier por props) */}
              {estatisticasAvancadas && (
                <div className="mt-3 bg-white/70 border border-red-100 rounded-lg p-3 text-xs text-red-800">
                  <table className="w-full">
                    <thead>
                      <tr className="text-red-900 font-semibold border-b border-red-200">
                        <th className="text-left py-1">Grupo</th>
                        <th className="text-right py-1">Qtd</th>
                        <th className="text-right py-1">% do total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['cafe', 'almoco', 'janta'].map((grupo) => {
                        const valor =
                          estatisticasAvancadas?.[grupo]?.duplicados || 0;
                        const pct = totalDuplicados
                          ? ((valor / totalDuplicados) * 100).toFixed(1)
                          : 0;
                        return (
                          <tr key={grupo} className="border-b border-red-100">
                            <td className="py-1 font-medium">{formatarGrupo(grupo)}</td>
                            <td className="text-right py-1">{valor}</td>
                            <td className="text-right py-1 text-red-600">{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-xs text-red-600 mt-3">
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
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-amber-900 mb-1">
                        Entradas sem Saída
                      </h3>
                      <button
                        onClick={exportarEntradasSemSaidaPDF}
                        className="text-xs px-3 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-md text-amber-700 font-medium transition"
                      >
                        📄 Exportar PDF
                      </button>
                    </div>
                    
                    <p className="text-2xl font-bold text-amber-700 mb-2">
                      {totais.semSaida}
                    </p>

                    {/* ✅ Nova seção: distribuição por grupo */}
                    <div className="text-xs text-amber-800 mb-3">
                      <table className="w-full border-t border-amber-200 pt-2 mt-2">
                        <tbody>
                          {['cafe', 'almoco', 'janta'].map((grupo) => {
                            const valor = estatisticasAvancadas?.[grupo]?.semSaida || 0;
                            const pct = totais.semSaida
                              ? ((valor / totais.semSaida) * 100).toFixed(1)
                              : 0;
                            return (
                              <tr key={grupo} className="border-b border-amber-100">
                                <td className="py-1 font-medium text-amber-900">
                                  {formatarGrupo(grupo)}
                                </td>
                                <td className="text-right py-1">{valor}</td>
                                <td className="text-right py-1 text-amber-600">{pct}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Maior concentração */}
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
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-blue-900 mb-1">
                        Saídas sem Entrada
                      </h3>
                      <button
                        onClick={exportarSaidasSemEntradaPDF}
                        className="text-xs px-3 py-1 bg-blue-100 hover:bg-red-blue border border-blue-300 rounded-md text-blue-700 font-medium transition"
                      >
                        📄 Exportar PDF
                      </button>
                    </div>
                    
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      
                    </p>
                    <p className="text-2xl font-bold text-blue-700 mb-2">
                      {totais.semEntrada}
                    </p>

                    {/* ✅ Distribuição por grupo */}
                    <div className="text-xs text-blue-800 mb-3">
                      <table className="w-full border-t border-blue-200 pt-2 mt-2">
                        <tbody>
                          {['cafe', 'almoco', 'janta'].map((grupo) => {
                            const valor = estatisticasAvancadas?.[grupo]?.semEntrada || 0;
                            const pct = totais.semEntrada
                              ? ((valor / totais.semEntrada) * 100).toFixed(1)
                              : 0;
                            return (
                              <tr key={grupo} className="border-b border-blue-100">
                                <td className="py-1 font-medium text-blue-900">
                                  {formatarGrupo(grupo)}
                                </td>
                                <td className="text-right py-1">{valor}</td>
                                <td className="text-right py-1 text-blue-600">{pct}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Maior concentração */}
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