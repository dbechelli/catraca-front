import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { registrosService } from '../services/registrosService';
import Sidebar from '../components/Sidebar';
import '../styles/ConferenciaICMS.css';

export default function ConferenciaICMS() {
  const [filteredData, setFilteredData] = useState([]);
  const [allFilteredData, setAllFilteredData] = useState([]);
  const [percentuaisInformados, setPercentuaisInformados] = useState({});
  // Inicializa lista apenas com o padrão, sem buscar da API
  const [tomadoresList, setTomadoresList] = useState(['BIM DISTRIBUIDORA LTDA']);
  
  const [filters, setFilters] = useState({
    tomador: 'BIM DISTRIBUIDORA LTDA', // Padrão inicial
    dataInicio: '',
    dataFim: ''
  });

  const [loading, setLoading] = useState(false);
  const [showDivergenciasOnly, setShowDivergenciasOnly] = useState(false);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilter = async (overrideFilters = null) => {
    setLoading(true);
    const currentFilters = overrideFilters || filters;
    
    try {
      const resp = await api.get('/api/registros/conferencia-icms-cte', {
        params: {
          tomador: currentFilters.tomador,
          data_inicio: currentFilters.dataInicio,
          data_fim: currentFilters.dataFim
        }
      });
      
      let data = resp.data;

      // Garantir que data seja um array
      if (!Array.isArray(data)) {
        if (data.dados && Array.isArray(data.dados)) {
          data = data.dados;
        } else if (data.data && Array.isArray(data.data)) {
          data = data.data;
        } else if (data.registros && Array.isArray(data.registros)) {
          data = data.registros;
        } else {
          console.error('Formato de dados inesperado:', data);
          data = [];
        }
      }

      const normalizedData = data.map((r, index) => ({
        id: index, // Adding an ID for React keys
        emissor: r.emissor,
        numero_cte: r.numero_cte,
        tomador: r.tomador,
        destinatario: r.destinatario,
        data_emissao: r.data_emissao,
        valor_mercadoria: r.valor_mercadoria,
        valor_total_frete: r.valor_total_frete,
        valor_frete_cte: r.valor_frete_cte,
        frete_sem_icms: r.frete_sem_icms,
        seguro: r.seguro,
        valor_despacho: r.valor_despacho,
        base_calculo_icms: r.base_calculo_icms,
        valor_icms: r.valor_icms,
        aliq_icms: r.aliq_icms,
        icms_calculado: r.icms_calculado,
        status_icms: r.status_icms,
        _divergencia_frete: false,
        valor_frete_calculado: 0,
        status_frete: '-'
      }));

      setFilteredData(normalizedData);
      setAllFilteredData(normalizedData);
      setShowDivergenciasOnly(false);
      setPercentuaisInformados({});

    } catch (err) {
      alert('Erro ao carregar dados da API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    // Função para formatar YYYY-MM-DD localmente
    const toLocalYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const initialFilters = {
      tomador: 'BIM DISTRIBUIDORA LTDA',
      dataInicio: toLocalYYYYMMDD(primeiroDia),
      dataFim: toLocalYYYYMMDD(hoje)
    };

    setFilters(initialFilters);
    
    // Carregar dados iniciais automaticamente
    applyFilter(initialFilters);
  }, []);

  const parseNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;
    const v = value.toString().replace(/[R$\s\.]/g, '').replace(',', '.');
    return parseFloat(v) || 0;
  };

  const formatCurrency = (value) => {
    const v = parseNumber(value);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '0,00%';
    return parseFloat(value).toFixed(2).replace('.', ',') + '%';
  };

  const formatDate = (d) => {
    if (!d) return '';
    
    // Se for string, tenta extrair a parte da data YYYY-MM-DD ignorando timezones e horas
    if (typeof d === 'string') {
        // Pega os primeiros 10 caracteres se parecer uma data ISO ou YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
            const [ano, mes, dia] = d.substring(0, 10).split('-');
            return `${dia}/${mes}/${ano}`;
        }
    }
    
    const dt = new Date(d);
    if (!isNaN(dt)) return dt.toLocaleDateString('pt-BR');
    return d;
  };

  const toggleDivergencias = () => {
    if (showDivergenciasOnly) {
      // Show all
      setFilteredData(allFilteredData);
      setShowDivergenciasOnly(false);
    } else {
      // Filter
      const divergencias = allFilteredData.filter(r => 
        (r.status_icms && r.status_icms !== 'OK') || r._divergencia_frete
      );
      setFilteredData(divergencias);
      setShowDivergenciasOnly(true);
    }
  };
  
  const handlePercentChange = (id, value) => {
    // Update allFilteredData
    const newAllData = allFilteredData.map(row => {
      if (row.id === id) {
        const valorMercadoria = parseNumber(row.valor_mercadoria);
        let newRow = { ...row };
        
        if (!value || value === '') {
          newRow.valor_frete_calculado = 0;
          newRow.status_frete = '-';
          newRow._divergencia_frete = false;
        } else {
          const valorFreteCalculado = valorMercadoria * (parseFloat(value) / 100);
          newRow.valor_frete_calculado = valorFreteCalculado;
          
          const freteSemIcms = parseNumber(newRow.frete_sem_icms);
          const diferenca = Math.abs(valorFreteCalculado - freteSemIcms);
          
          if (diferenca > 1) {
            newRow.status_frete = 'Divergência';
            newRow._divergencia_frete = true;
          } else {
            newRow.status_frete = 'OK';
            newRow._divergencia_frete = false;
          }
        }
        return newRow;
      }
      return row;
    });
    
    setAllFilteredData(newAllData);
    
    // Update filteredData based on newAllData
    if (showDivergenciasOnly) {
      setFilteredData(newAllData.filter(r => (r.status_icms && r.status_icms !== 'OK') || r._divergencia_frete));
    } else {
      setFilteredData(newAllData);
    }

    setPercentuaisInformados(prev => ({ ...prev, [id]: value }));
  };


  const exportAllExcel = () => {
    if (allFilteredData.length === 0) return alert('Sem dados para exportar');
    const wb = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(allFilteredData.map(r => ({
      Emissor: r.emissor,
      'Nº CTe': r.numero_cte,
      Tomador: r.tomador,
      Destinatario: r.destinatario,
      'Data Emissão': r.data_emissao,
      'Valor Mercadoria': r.valor_mercadoria,
      'Valor Total Frete': r.valor_total_frete,
      'Valor Frete (CTe)': r.valor_frete_cte,
      'Frete Sem ICMS': r.frete_sem_icms,
      Seguro: r.seguro,
      'Valor Despacho': r.valor_despacho,
      'Base Cálc. ICMS': r.base_calculo_icms,
      'Valor ICMS': r.valor_icms,
      'Alíq. ICMS': r.aliq_icms,
      'ICMS Calculado': r.icms_calculado,
      'Status ICMS': r.status_icms
    })));
    XLSX.utils.book_append_sheet(wb, sheet, 'Todos');
    XLSX.writeFile(wb, `conferencia_icms_todos_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportErrorsExcel = () => {
    const errors = allFilteredData.filter(r => (r.status_icms && r.status_icms !== 'OK') || r._divergencia_frete);
    if (errors.length === 0) return alert('Sem divergências para exportar');
    const wb = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(errors.map(r => ({
      Emissor: r.emissor,
      'Nº CTe': r.numero_cte,
      Tomador: r.tomador,
      Destinatario: r.destinatario,
      'Data Emissão': r.data_emissao,
      'Valor Mercadoria': r.valor_mercadoria,
      'Valor Total Frete': r.valor_total_frete,
      'Valor Frete (CTe)': r.valor_frete_cte,
      'Frete Sem ICMS': r.frete_sem_icms,
      Seguro: r.seguro,
      'Valor Despacho': r.valor_despacho,
      'Status ICMS': r.status_icms,
      'Divergência Frete': r._divergencia_frete ? 'SIM' : 'NAO'
    })));
    XLSX.utils.book_append_sheet(wb, sheet, 'Erros');
    XLSX.writeFile(wb, `conferencia_icms_erros_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Stats
  const totalRegistros = filteredData.length; 
  const statsData = allFilteredData;
  const divergenciasFrete = statsData.filter(r => r._divergencia_frete).length;
  const divergenciasIcms = statsData.filter(r => r.status_icms && r.status_icms !== 'OK').length;
  const valorTotal = statsData.reduce((s,r)=> s + parseNumber(r.valor_total_frete),0);
  const valorTotalIcms = statsData.reduce((s,r)=> s + parseNumber(r.valor_icms),0);


  return (
    <div className="conferencia-icms-container">
      <Sidebar />
      <div className="conferencia-content">
        <div className="conferencia-header">
          <h1>🚚 Sistema de Conferência ICMS - CTe</h1>
          <p>Sistema de validação e conferência de ICMS em documentos de transporte</p>
        </div>

        <div className="conferencia-controls">
          <div className="conferencia-filters">
            <div className="conferencia-filter-group">
              <label htmlFor="tomadorFilter">Tomador:</label>
              <select 
                id="tomadorFilter" 
                name="tomador"
                value={filters.tomador}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {tomadoresList.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="conferencia-filter-group">
              <label htmlFor="dataInicio">Data Início:</label>
              <input 
                type="date" 
                id="dataInicio" 
                name="dataInicio"
                value={filters.dataInicio}
                onChange={handleFilterChange}
              />
            </div>
            <div className="conferencia-filter-group">
              <label htmlFor="dataFim">Data Fim:</label>
              <input 
                type="date" 
                id="dataFim" 
                name="dataFim"
                value={filters.dataFim}
                onChange={handleFilterChange}
              />
            </div>
            <button className="conferencia-apply-filter-btn" onClick={() => applyFilter()}>
              🔍 Aplicar Filtro
            </button>
          </div>

          {allFilteredData.length > 0 && (
            <div className="conferencia-action-buttons">
              <button 
                className={showDivergenciasOnly ? "conferencia-show-all-btn" : "conferencia-filter-divergencias-btn"}
                onClick={toggleDivergencias}
              >
                {showDivergenciasOnly ? "📋 Mostrar Todos" : "⚠️ Mostrar Apenas Divergências"}
              </button>

              <button className="conferencia-export-btn" onClick={exportErrorsExcel}>
                ⬇️ Exportar Erros
              </button>
              <button className="conferencia-export-btn" onClick={exportAllExcel}>
                ⬇️ Exportar Tudo
              </button>
            </div>
          )}
        </div>

        {allFilteredData.length > 0 && (
          <div className="conferencia-stats">
            <div className="conferencia-stat-card"><h3>Total Registros</h3><div className="value">{statsData.length}</div></div>
            <div className="conferencia-stat-card"><h3>Divergências Frete</h3><div className="value">{divergenciasFrete}</div></div>
            <div className="conferencia-stat-card"><h3>Divergências ICMS</h3><div className="value">{divergenciasIcms}</div></div>
            <div className="conferencia-stat-card"><h3>Valor Total Frete</h3><div className="value">{formatCurrency(valorTotal)}</div></div>
            <div className="conferencia-stat-card"><h3>Valor Total ICMS</h3><div className="value">{formatCurrency(valorTotalIcms)}</div></div>
          </div>
        )}

        {loading ? (
          <div className="conferencia-loading">Processando dados...</div>
        ) : (
          <div className="conferencia-table-container" style={{ display: allFilteredData.length ? 'block' : 'none' }}>
            <table className="conferencia-table">
              <thead>
                <tr>
                  <th style={{minWidth: '80px'}}>Emissor</th>
                  <th style={{minWidth: '120px'}}>Nº CTe</th>
                  <th style={{minWidth: '120px'}}>Tomador</th>
                  <th style={{minWidth: '150px'}}>Destinatário</th>
                  <th style={{minWidth: '80px'}}>Data Emissão</th>
                  <th style={{minWidth: '100px'}}>Valor Mercadoria</th>
                  <th style={{minWidth: '110px'}}>Valor Total Frete</th>
                  <th style={{minWidth: '100px'}}>Valor Frete (CTe)</th>
                  <th style={{minWidth: '110px'}} className="highlight-calc">Frete Sem ICMS</th>
                  <th style={{minWidth: '70px'}}>Seguro</th>
                  <th style={{minWidth: '90px'}}>Valor Despacho</th>
                  <th style={{minWidth: '70px'}}>% Informado</th>
                  <th style={{minWidth: '100px'}}>Valor Calculado</th>
                  <th style={{minWidth: '80px'}}>Status Frete</th>
                  <th style={{minWidth: '100px'}}>Base Cálc. ICMS</th>
                  <th style={{minWidth: '80px'}}>Valor ICMS</th>
                  <th style={{minWidth: '60px'}}>Alíq. ICMS</th>
                  <th style={{minWidth: '100px'}}>ICMS Calculado</th>
                  <th style={{minWidth: '80px'}}>Status ICMS</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                   <tr><td colSpan="19" style={{textAlign:'center', padding:'40px', color:'#6c757d'}}><h3>Nenhum registro encontrado</h3><p>Verifique os filtros aplicados</p></td></tr>
                ) : (
                  filteredData.map((row) => {
                    const isDivergenciaIcms = row.status_icms && row.status_icms !== 'OK';
                    const isDivergenciaFrete = row._divergencia_frete;
                    let rowClass = '';
                    if (isDivergenciaIcms) rowClass += ' divergencia-icms';
                    if (isDivergenciaFrete) rowClass += ' divergencia-frete';

                    return (
                      <tr key={row.id} className={rowClass}>
                        <td>{row.emissor || ''}</td>
                        <td>{row.numero_cte || ''}</td>
                        <td>{row.tomador || ''}</td>
                        <td>{row.destinatario || ''}</td>
                        <td>{formatDate(row.data_emissao)}</td>
                        <td className="currency">{formatCurrency(row.valor_mercadoria)}</td>
                        <td className="currency">{formatCurrency(row.valor_total_frete)}</td>
                        <td className="currency">{formatCurrency(row.valor_frete_cte)}</td>
                        <td className="currency highlight-calc">{formatCurrency(row.frete_sem_icms)}</td>
                        <td className="currency">{formatCurrency(row.seguro)}</td>
                        <td className="currency">{formatCurrency(row.valor_despacho)}</td>
                        <td>
                          <input 
                            type="number" 
                            className="conferencia-input-percent" 
                            step="0.01" 
                            placeholder="0,00"
                            value={percentuaisInformados[row.id] || ''}
                            onChange={(e) => handlePercentChange(row.id, e.target.value)}
                          />
                        </td>
                        <td className="currency">
                          {row.valor_frete_calculado ? formatCurrency(row.valor_frete_calculado) : 'R$ 0,00'}
                        </td>
                        <td>
                          {row.status_frete === 'Divergência' ? (
                            <><span className="alert-icon">!</span>Divergência</>
                          ) : (
                            row.status_frete
                          )}
                        </td>
                        <td className="currency">{formatCurrency(row.base_calculo_icms)}</td>
                        <td className="currency">{formatCurrency(row.valor_icms)}</td>
                        <td className="percent">{formatPercent(row.aliq_icms)}</td>
                        <td className="currency">{formatCurrency(row.icms_calculado)}</td>
                        <td>{row.status_icms || 'OK'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
