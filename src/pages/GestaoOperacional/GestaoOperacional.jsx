import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import financeiroService from '../../services/financeiroService';
import { DollarSign, Truck, Shield, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import '../../styles/GestaoOperacional/GestaoOperacional.css';

export default function GestaoOperacional() {
  const [loading, setLoading] = useState(false);
  const [dataInicial, setDataInicial] = useState(new Date().toISOString().split('T')[0]);
  const [dataFinal, setDataFinal] = useState(new Date().toISOString().split('T')[0]);
  const [tipo, setTipo] = useState('');
  const [registros, setRegistros] = useState([]);
  const [resumo, setResumo] = useState({
    valorMercadoria: 0,
    seguro: 0,
    frete: 0,
    fretePercent: 0,
    despesas: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await financeiroService.getFluxoDiario(dataInicial, dataFinal);
      const data = response || [];
      
      let filteredData = [...data];
      
      // Filtros locais (se a API não filtrar tudo)
      if (tipo) {
        filteredData = filteredData.filter(item => item.tipo === tipo);
      }
      // Adicionar filtro de cod_sub_custo se necessário futuramente
      
      setRegistros(filteredData);
      calcularResumo(filteredData);

    } catch (error) {
      console.error("Erro ao carregar dados", error);
      // Mantendo array vazio em caso de erro para não quebrar a tela
      setRegistros([]);
      setResumo({
        valorMercadoria: 0,
        seguro: 0,
        frete: 0,
        fretePercent: 0,
        despesas: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularResumo = (dados) => {
    // Cálculos baseados estritamente nos dados retornados pela API
    // Assumindo categorização por descrição ou código (ajustar conforme códigos reais do backend)
    
    let totalMercadoria = 0;
    let totalSeguro = 0;
    let totalFrete = 0;
    let totalDespesas = 0;

    dados.forEach(item => {
      const valor = parseFloat(item.valor) || 0;
      const desc = item.descricao ? item.descricao.toLowerCase() : '';
      const tipoItem = item.tipo;
      const cod = item.cod_sub_custo;

      // Lógica de Soma Direta dos Registros
      if (tipoItem === 'RECEITA' || cod === '1' || desc.includes('mercadoria')) {
        totalMercadoria += valor;
      } 
      
      if (tipoItem === 'DESPESA') {
        totalDespesas += Math.abs(valor);
      }

      // Se houver itens específicos de Seguro e Frete na lista:
      if (desc.includes('seguro')) {
        totalSeguro += Math.abs(valor);
      }
      
      if (desc.includes('frete')) {
        totalFrete += Math.abs(valor);
      }
    });

    // Percentual de frete sobre mercadoria (Visual apenas)
    const fretePercent = totalMercadoria > 0 ? ((totalFrete / totalMercadoria) * 100) : 0;

    setResumo({
      valorMercadoria: totalMercadoria,
      seguro: totalSeguro,
      frete: totalFrete,
      fretePercent: fretePercent.toFixed(2), // 2 casas decimais visualmente
      despesas: totalDespesas
    });
  };

  useEffect(() => {
    fetchData();
  }, [dataInicial, dataFinal, tipo]);

  const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDataLocal = (dateStr) => {
    if (!dateStr) return '-';
    // Se for formato YYYY-MM-DD, tratamos manualmente para não sofrer alteração de timezone
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }
    // Fallback para outros formatos
    try {
        return format(new Date(dateStr), 'dd/MM/yyyy');
    } catch {
        return dateStr;
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 ml-64">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">GESTÃO OPERACIONAL</h1>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                <div className="flex gap-2">
                    <input 
                        type="date" 
                        value={dataInicial}
                        onChange={(e) => setDataInicial(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    />
                    <span className="self-center text-gray-400">até</span>
                    <input 
                        type="date" 
                        value={dataFinal}
                        onChange={(e) => setDataFinal(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    />
                </div>
            </div>
            
            <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select 
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                >
                    <option value="">Todos</option>
                    <option value="RECEITA">Receita</option>
                    <option value="DESPESA">Despesa</option>
                </select>
            </div>

            <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cod. Sub. Custo</label>
                <input 
                    type="text" 
                    placeholder="Código..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
            </div>
            
            <button 
                onClick={fetchData}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors h-[42px]"
            >
                Filtrar
            </button>

          </div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm font-semibold uppercase">Valor Mercadoria</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(resumo.valorMercadoria)}</h3>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm font-semibold uppercase">Seguro</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(resumo.seguro)}</h3>
                    </div>
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Shield className="w-6 h-6 text-indigo-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm font-semibold uppercase">Frete</p>
                        <div className="flex items-baseline gap-2">
                             <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(resumo.frete)}</h3>
                             <span className="text-sm text-green-600 font-medium">({resumo.fretePercent}%)</span>
                        </div>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Truck className="w-6 h-6 text-green-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm font-semibold uppercase">Despesas</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(resumo.despesas)}</h3>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg">
                        <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                </div>
            </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Tabela de Registros</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-600 border-b">Data</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 border-b">Tipo</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 border-b">Cod. Sub Custo</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 border-b">Descrição</th>
                            <th className="p-4 text-sm font-semibold text-gray-600 border-b text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                             <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">Carregando...</td>
                             </tr>
                        ) : registros.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">Nenhum registro encontrado.</td>
                            </tr>
                        ) : (
                            registros.map((registro, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm text-gray-700">
                                        {formatDataLocal(registro.data)}
                                    </td>
                                    <td className="p-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            registro.tipo === 'RECEITA' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                            {registro.tipo}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-700">{registro.cod_sub_custo}</td>
                                    <td className="p-4 text-sm text-gray-700">{registro.descricao}</td>
                                    <td className={`p-4 text-sm font-medium text-right ${
                                        registro.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {formatCurrency(registro.valor)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}
