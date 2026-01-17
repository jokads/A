import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface FinancialManagementProps {
  darkMode: boolean;
}

export default function FinancialManagement({ darkMode }: FinancialManagementProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalRefunds: 0,
    netRevenue: 0,
    avgOrderValue: 0
  });

  useEffect(() => {
    loadFinancialData();
  }, [dateRange]);

  const loadFinancialData = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const avgOrderValue = orders?.length ? totalRevenue / orders.length : 0;

      setStats({
        totalRevenue,
        totalRefunds: 0,
        netRevenue: totalRevenue,
        avgOrderValue
      });

      setTransactions(orders || []);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const controls = [
    { id: 1, name: 'Relatórios Periódicos', icon: 'ri-calendar-line' },
    { id: 2, name: 'Por Método Pagamento', icon: 'ri-bank-card-line' },
    { id: 3, name: 'Margem por Categoria', icon: 'ri-pie-chart-line' },
    { id: 4, name: 'KPIs (LTV/CAC/AOV)', icon: 'ri-dashboard-line' },
    { id: 5, name: 'Exports Financeiros', icon: 'ri-file-excel-line' },
    { id: 6, name: 'Reconciliação Stripe', icon: 'ri-refresh-line' },
    { id: 7, name: 'Impostos por Região', icon: 'ri-government-line' },
    { id: 8, name: 'Plano de Contas', icon: 'ri-book-line' }
  ];

  const kpis = [
    {
      label: 'Receita Total',
      value: `R$ ${stats.totalRevenue.toFixed(2)}`,
      icon: 'ri-money-dollar-circle-line',
      color: 'from-green-500 to-green-600',
      change: '+12.5%'
    },
    {
      label: 'Receita Líquida',
      value: `R$ ${stats.netRevenue.toFixed(2)}`,
      icon: 'ri-line-chart-line',
      color: 'from-blue-500 to-blue-600',
      change: '+8.2%'
    },
    {
      label: 'Ticket Médio (AOV)',
      value: `R$ ${stats.avgOrderValue.toFixed(2)}`,
      icon: 'ri-shopping-cart-line',
      color: 'from-purple-500 to-purple-600',
      change: '+5.1%'
    },
    {
      label: 'Reembolsos',
      value: `R$ ${stats.totalRefunds.toFixed(2)}`,
      icon: 'ri-refund-line',
      color: 'from-red-500 to-red-600',
      change: '-2.3%'
    }
  ];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="ri-function-line text-yellow-500"></i>
          8+ Controles Financeiros & Relatórios
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {controls.map(control => (
            <div
              key={control.id}
              className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <i className={`${control.icon} text-yellow-500`}></i>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
              <p className="text-xs font-medium">{control.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['day', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                dateRange === range
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                  : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === 'day' ? 'Hoje' : range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : 'Ano'}
            </button>
          ))}
        </div>

        <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
          <i className="ri-file-excel-line text-xl"></i>
          Exportar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <i className={`${kpi.icon} text-2xl text-white`}></i>
              </div>
              <span className={`text-sm font-medium ${kpi.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.change}
              </span>
            </div>
            <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{kpi.label}</h3>
            <p className="text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <h3 className="text-lg font-bold mb-4">Receita por Método de Pagamento</h3>
          <div className="space-y-3">
            {[
              { method: 'Cartão de Crédito', amount: 45230.50, percentage: 65, color: 'blue' },
              { method: 'PIX', amount: 18450.00, percentage: 25, color: 'green' },
              { method: 'Boleto', amount: 7380.00, percentage: 10, color: 'yellow' }
            ].map((item, index) => (
              <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.method}</span>
                  <span className="font-bold text-yellow-500">R$ {item.amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`bg-${item.color}-500 h-2 rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.percentage}% do total
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <h3 className="text-lg font-bold mb-4">Margem por Categoria</h3>
          <div className="space-y-3">
            {[
              { category: 'Tecnologia', revenue: 35000, cost: 20000, margin: 42.8 },
              { category: 'Casa & Decoração', revenue: 18000, cost: 12000, margin: 33.3 },
              { category: 'Ferramentas', revenue: 12000, cost: 7000, margin: 41.6 }
            ].map((item, index) => (
              <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-green-500 font-bold">{item.margin.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Receita: R$ {item.revenue.toFixed(2)}
                  </span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Custo: R$ {item.cost.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
