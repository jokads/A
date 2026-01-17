import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface CustomersManagementProps {
  darkMode: boolean;
}

interface Customer {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  phone?: string;
  city?: string;
  country?: string;
  total_spent?: number;
  order_count?: number;
}

export default function CustomersManagement({ darkMode }: CustomersManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'new' | 'vip' | 'inactive'>('all');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      // Buscar todos os clientes com informações de pedidos
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar estatísticas de pedidos para cada cliente
      const customersWithStats = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: ordersData } = await supabase
            .from('orders')
            .select('total, status')
            .eq('user_id', profile.id);

          const orderCount = ordersData?.length || 0;
          const totalSpent = ordersData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

          return {
            ...profile,
            order_count: orderCount,
            total_spent: totalSpent
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const controls = [
    { id: 1, name: 'Perfil Completo', icon: 'ri-user-line' },
    { id: 2, name: 'Busca Avançada', icon: 'ri-search-line' },
    { id: 3, name: 'Segmentação', icon: 'ri-group-line' },
    { id: 4, name: 'Campanhas', icon: 'ri-mail-send-line' },
    { id: 5, name: 'Templates E-mail', icon: 'ri-file-text-line' },
    { id: 6, name: 'Notas/Tickets', icon: 'ri-sticky-note-line' },
    { id: 7, name: 'Merge Contas', icon: 'ri-merge-cells-horizontal' },
    { id: 8, name: 'Export Marketing', icon: 'ri-download-line' },
    { id: 9, name: 'Cashback/Crédito', icon: 'ri-coin-line' },
    { id: 10, name: 'Recuperação Carrinho', icon: 'ri-shopping-cart-line' }
  ];

  // Filtrar clientes
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const daysSinceCreated = Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    switch (filterType) {
      case 'new':
        return daysSinceCreated <= 30; // Novos: últimos 30 dias
      case 'vip':
        return (customer.total_spent || 0) >= 500; // VIP: gastou mais de €500
      case 'inactive':
        return daysSinceCreated > 90 && (customer.order_count || 0) === 0; // Inativos: mais de 90 dias sem pedidos
      default:
        return true;
    }
  });

  // Calcular estatísticas
  const stats = {
    total: customers.length,
    new: customers.filter(c => {
      const days = Math.floor((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return days <= 30;
    }).length,
    vip: customers.filter(c => (c.total_spent || 0) >= 500).length,
    inactive: customers.filter(c => {
      const days = Math.floor((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return days > 90 && (c.order_count || 0) === 0;
    }).length
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">Admin</span>;
    }
    return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Cliente</span>;
  };

  const getCustomerType = (customer: Customer) => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreated <= 30) {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Novo</span>;
    }
    if ((customer.total_spent || 0) >= 500) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">VIP</span>;
    }
    if (daysSinceCreated > 90 && (customer.order_count || 0) === 0) {
      return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded">Inativo</span>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <i className="ri-user-line text-2xl text-blue-500"></i>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total de Clientes</p>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <i className="ri-user-add-line text-2xl text-green-500"></i>
            <span className="text-2xl font-bold">{stats.new}</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Novos (30 dias)</p>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <i className="ri-vip-crown-line text-2xl text-yellow-500"></i>
            <span className="text-2xl font-bold">{stats.vip}</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Clientes VIP</p>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <i className="ri-user-unfollow-line text-2xl text-red-500"></i>
            <span className="text-2xl font-bold">{stats.inactive}</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Inativos</p>
        </div>
      </div>

      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="ri-function-line text-yellow-500"></i>
          10+ Controles de Clientes & CRM
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'all'
                ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white'
                : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => setFilterType('new')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'new'
                ? 'bg-green-500 text-white'
                : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Novos ({stats.new})
          </button>
          <button
            onClick={() => setFilterType('vip')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'vip'
                ? 'bg-yellow-500 text-black'
                : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            VIP ({stats.vip})
          </button>
          <button
            onClick={() => setFilterType('inactive')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === 'inactive'
                ? 'bg-red-500 text-white'
                : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Inativos ({stats.inactive})
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
          />
        </div>

        <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
          <i className="ri-download-line text-xl"></i>
          Exportar
        </button>
      </div>

      <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left font-semibold">Tipo</th>
                  <th className="px-6 py-4 text-left font-semibold">Pedidos</th>
                  <th className="px-6 py-4 text-left font-semibold">Total Gasto</th>
                  <th className="px-6 py-4 text-left font-semibold">Cadastro</th>
                  <th className="px-6 py-4 text-left font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={`border-t ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] rounded-full flex items-center justify-center text-white font-bold">
                          {customer.full_name?.charAt(0) || customer.email?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{customer.full_name || 'Sem nome'}</p>
                            {getRoleBadge(customer.role)}
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getCustomerType(customer)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{customer.order_count || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#b62bff]">€{(customer.total_spent || 0).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(customer.created_at).toLocaleDateString('pt-PT')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                          <i className="ri-mail-line"></i>
                        </button>
                        <button 
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
