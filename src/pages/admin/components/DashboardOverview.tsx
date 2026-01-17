import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface DashboardOverviewProps {
  darkMode: boolean;
}

export default function DashboardOverview({ darkMode }: DashboardOverviewProps) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStock: 0,
    openTickets: 0,
    activeCampaigns: 0
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [productsRes, ordersRes, customersRes, ticketsRes] = await Promise.all([
        supabase.from('products').select('id, stock, min_stock'),
        supabase.from('orders').select('id, total, status, created_at, user_id'),
        supabase.from('profiles').select('id'),
        supabase.from('support_tickets').select('id, status')
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const customers = customersRes.data || [];
      const tickets = ticketsRes.data || [];

      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const lowStock = products.filter(p => p.stock <= p.min_stock).length;
      const openTickets = tickets.filter(t => t.status === 'open').length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        totalRevenue,
        pendingOrders,
        lowStock,
        openTickets,
        activeCampaigns: 0
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Receita Total',
      value: `R$ ${stats.totalRevenue.toFixed(2)}`,
      icon: 'ri-money-dollar-circle-line',
      color: 'from-green-500 to-green-600',
      change: '+12.5%'
    },
    {
      title: 'Pedidos',
      value: stats.totalOrders.toString(),
      icon: 'ri-shopping-cart-line',
      color: 'from-blue-500 to-blue-600',
      change: '+8.2%'
    },
    {
      title: 'Produtos',
      value: stats.totalProducts.toString(),
      icon: 'ri-shopping-bag-line',
      color: 'from-purple-500 to-purple-600',
      change: '+5.1%'
    },
    {
      title: 'Clientes',
      value: stats.totalCustomers.toString(),
      icon: 'ri-user-line',
      color: 'from-yellow-500 to-yellow-600',
      change: '+15.3%'
    }
  ];

  const alerts = [
    {
      type: 'warning',
      icon: 'ri-alert-line',
      message: `${stats.lowStock} produtos com estoque baixo`,
      action: 'Ver produtos'
    },
    {
      type: 'info',
      icon: 'ri-time-line',
      message: `${stats.pendingOrders} pedidos pendentes`,
      action: 'Processar'
    },
    {
      type: 'error',
      icon: 'ri-customer-service-line',
      message: `${stats.openTickets} tickets abertos`,
      action: 'Responder'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl ${
              darkMode ? 'bg-gray-900' : 'bg-gray-50'
            } border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <i className={`${card.icon} text-2xl text-white`}></i>
              </div>
              <span className="text-green-500 text-sm font-medium">{card.change}</span>
            </div>
            <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{card.title}</h3>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                alert.type === 'warning'
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : alert.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <i className={`${alert.icon} text-xl ${
                  alert.type === 'warning'
                    ? 'text-yellow-500'
                    : alert.type === 'error'
                    ? 'text-red-500'
                    : 'text-blue-500'
                }`}></i>
                <div className="flex-1">
                  <p className="text-sm mb-2">{alert.message}</p>
                  <button className={`text-xs font-medium ${
                    alert.type === 'warning'
                      ? 'text-yellow-500'
                      : alert.type === 'error'
                      ? 'text-red-500'
                      : 'text-blue-500'
                  } hover:underline whitespace-nowrap`}>
                    {alert.action} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <h3 className="text-lg font-bold mb-4">Pedidos Recentes</h3>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Nenhum pedido ainda</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pedido #{order.id.slice(0, 8)}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-500">R$ {order.total?.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed'
                          ? 'bg-green-500/20 text-green-500'
                          : order.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <h3 className="text-lg font-bold mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Novo Produto', icon: 'ri-add-circle-line', color: 'from-blue-500 to-blue-600' },
              { label: 'Nova Categoria', icon: 'ri-folder-add-line', color: 'from-purple-500 to-purple-600' },
              { label: 'Criar Cupom', icon: 'ri-coupon-line', color: 'from-green-500 to-green-600' },
              { label: 'Nova Campanha', icon: 'ri-megaphone-line', color: 'from-yellow-500 to-yellow-600' },
              { label: 'Exportar Dados', icon: 'ri-download-line', color: 'from-red-500 to-red-600' },
              { label: 'Relatórios', icon: 'ri-bar-chart-line', color: 'from-indigo-500 to-indigo-600' }
            ].map((action, index) => (
              <button
                key={index}
                className={`p-4 rounded-lg bg-gradient-to-br ${action.color} hover:opacity-90 transition-opacity text-white text-left whitespace-nowrap`}
              >
                <i className={`${action.icon} text-2xl mb-2 block`}></i>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
