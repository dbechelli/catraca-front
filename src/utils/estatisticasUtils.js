/**
 * Calcula estatísticas avançadas dos registros
 */
export function calcularEstatisticasAvancadas(registros) {
  if (!registros || registros.length === 0) {
    return {
      cafe: { entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0 },
      almoco: { entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0 },
      janta: { entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0 },
      totais: { semSaida: 0, semEntrada: 0, maiorConcentracaoSemSaida: null, maiorConcentracaoSemEntrada: null }
    };
  }

  const stats = {
    cafe: { entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0, duplicados: 0 },
    almoco: { entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0, duplicados: 0},
    janta: { entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0, duplicados: 0 }
  };

  // 🧩 Novos arrays para exportação detalhada
  const duplicadosDetalhes = [];
  const semSaidaDetalhes = [];
  const semEntradaDetalhes = [];

  registros.forEach(registro => {
    const grupo = registro.grupo_horario || 'outro';
    if (!stats[grupo]) return;

    // ✅ Correção mínima: agora considera apenas valores realmente não nulos e não vazios
    const temEntrada = registro.horario_entrada != null && String(registro.horario_entrada).trim() !== '';
    const temSaida   = registro.horario_saida   != null && String(registro.horario_saida).trim() !== '';

    if (temEntrada) stats[grupo].entradas++;
    if (temSaida) stats[grupo].saidas++;
    stats[grupo].total = (stats[grupo].entradas || 0) + (stats[grupo].saidas || 0);
    
    // Preenche contadores e listas
    if (temEntrada && temSaida) {
      stats[grupo].completos++;
    } else if (temEntrada && !temSaida) {
      stats[grupo].semSaida++;
      semSaidaDetalhes.push(registro);
    } else if (!temEntrada && temSaida) {
      stats[grupo].semEntrada++;
      semEntradaDetalhes.push(registro);
    }

    // ✅ Novo: contabiliza duplicados independente de entrada/saída
    if (registro.is_duplicado) {
      stats[grupo].duplicados++;
      duplicadosDetalhes.push(registro);
    }
  });

  // Calcular totais e identificar maior concentração
  const totalSemSaida = stats.cafe.semSaida + stats.almoco.semSaida + stats.janta.semSaida;
  const totalSemEntrada = stats.cafe.semEntrada + stats.almoco.semEntrada + stats.janta.semEntrada;
  const totalEntradas = stats.cafe.entradas + stats.almoco.entradas + stats.janta.entradas;
  const totalSaidas   = stats.cafe.saidas   + stats.almoco.saidas   + stats.janta.saidas;
  const totalGeral    = totalEntradas + totalSaidas;
  const totalDuplicados = stats.cafe.duplicados + stats.almoco.duplicados + stats.janta.duplicados;


  // Encontrar grupo com mais entradas sem saída
  const gruposSemSaida = [
    { grupo: 'café', valor: stats.cafe.semSaida },
    { grupo: 'almoço', valor: stats.almoco.semSaida },
    { grupo: 'janta', valor: stats.janta.semSaida }
  ];
  const maiorSemSaida = gruposSemSaida.reduce((max, item) => item.valor > max.valor ? item : max);

  // Encontrar grupo com mais saídas sem entrada
  const gruposSemEntrada = [
    { grupo: 'café', valor: stats.cafe.semEntrada },
    { grupo: 'almoço', valor: stats.almoco.semEntrada },
    { grupo: 'janta', valor: stats.janta.semEntrada }
  ];
  const maiorSemEntrada = gruposSemEntrada.reduce((max, item) => item.valor > max.valor ? item : max);

  return {
    ...stats,
    totais: {
      entradas: totalEntradas,
      saidas: totalSaidas,
      total: totalGeral,
      duplicados: totalDuplicados,
      semSaida: totalSemSaida,
      semEntrada: totalSemEntrada,
      maiorConcentracaoSemSaida: maiorSemSaida.valor > 0 ? maiorSemSaida.grupo : null,
      maiorConcentracaoSemEntrada: maiorSemEntrada.valor > 0 ? maiorSemEntrada.grupo : null
    },
  duplicadosDetalhes,
  semSaidaDetalhes,
  semEntradaDetalhes
  };
}

/**
 * Formata nome do grupo para exibição
 */
export function formatarGrupo(grupo) {
  const nomes = {
    'cafe': 'Café',
    'almoco': 'Almoço',
    'janta': 'Janta'
  };
  return nomes[grupo] || grupo;
}
