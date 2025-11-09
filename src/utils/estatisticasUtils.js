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
    cafe: { entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0 },
    almoco: { entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0 },
    janta: { entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0 },
    outro: { entradas: 0, saidas: 0, completos: 0, semSaida: 0, semEntrada: 0 }
  };

  registros.forEach(registro => {
    const grupo = registro.grupo_horario || 'outro';
    if (!stats[grupo]) return;

    const temEntrada = registro.horario_entrada && registro.horario_entrada !== null;
    const temSaida = registro.horario_saida && registro.horario_saida !== null;

    if (temEntrada) stats[grupo].entradas++;
    if (temSaida) stats[grupo].saidas++;
    
    if (temEntrada && temSaida) {
      stats[grupo].completos++;
    } else if (temEntrada && !temSaida) {
      stats[grupo].semSaida++;
    } else if (!temEntrada && temSaida) {
      stats[grupo].semEntrada++;
    }
  });

  // Calcular totais e identificar maior concentração
  const totalSemSaida = stats.cafe.semSaida + stats.almoco.semSaida + stats.janta.semSaida + stats.outro.semSaida;
  const totalSemEntrada = stats.cafe.semEntrada + stats.almoco.semEntrada + stats.janta.semEntrada + stats.outro.semEntrada;

  // Encontrar grupo com mais entradas sem saída
  const gruposSemSaida = [
    { grupo: 'café', valor: stats.cafe.semSaida },
    { grupo: 'almoço', valor: stats.almoco.semSaida },
    { grupo: 'janta', valor: stats.janta.semSaida },
    { grupo: 'outro', valor: stats.outro.semSaida }
  ];
  const maiorSemSaida = gruposSemSaida.reduce((max, item) => item.valor > max.valor ? item : max);

  // Encontrar grupo com mais saídas sem entrada
  const gruposSemEntrada = [
    { grupo: 'café', valor: stats.cafe.semEntrada },
    { grupo: 'almoço', valor: stats.almoco.semEntrada },
    { grupo: 'janta', valor: stats.janta.semEntrada },
    { grupo: 'outro', valor: stats.outro.semEntrada }
  ];
  const maiorSemEntrada = gruposSemEntrada.reduce((max, item) => item.valor > max.valor ? item : max);

  return {
    ...stats,
    totais: {
      semSaida: totalSemSaida,
      semEntrada: totalSemEntrada,
      maiorConcentracaoSemSaida: maiorSemSaida.valor > 0 ? maiorSemSaida.grupo : null,
      maiorConcentracaoSemEntrada: maiorSemEntrada.valor > 0 ? maiorSemEntrada.grupo : null
    }
  };
}

/**
 * Formata nome do grupo para exibição
 */
export function formatarGrupo(grupo) {
  const nomes = {
    'cafe': 'Café',
    'almoco': 'Almoço',
    'janta': 'Janta',
    'outro': 'Outro'
  };
  return nomes[grupo] || grupo;
}
