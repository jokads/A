import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface OrdersManagementProps {
  darkMode: boolean;
}

export default function OrdersManagement({ darkMode }: OrdersManagementProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(email, full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      await loadOrders();
      alert('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const handleRefund = async (orderId: string, amount: number, reason: string) => {
    try {
      const { error } = await supabase
        .from('refunds')
        .insert({
          order_id: orderId,
          amount,
          reason,
          status: 'pending'
        });

      if (error) throw error;
      
      alert('Reembolso solicitado com sucesso!');
      setShowRefundModal(false);
    } catch (error) {
      console.error('Erro ao processar reembolso:', error);
      alert('Erro ao processar reembolso');
    }
  };

  const generateInvoicePDF = (order: any) => {
    alert('Gerando PDF da fatura...');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const controls = [
    { id: 1, name: 'Visualizar Pedidos', icon: 'ri-eye-line' },
    { id: 2, name: 'Filtros Avançados', icon: 'ri-filter-line' },
    { id: 3, name: 'Editar Status', icon: 'ri-edit-line' },
    { id: 4, name: 'Reprocessar Pagamento', icon: 'ri-refresh-line' },
    { id: 5, name: 'Reembolsos Stripe', icon: 'ri-refund-line' },
    { id: 6, name: 'Gerar Invoice PDF', icon: 'ri-file-pdf-line' },
    { id: 7, name: 'Mapear Envios', icon: 'ri-map-pin-line' },
    { id: 8, name: 'Export Logística', icon: 'ri-download-line' },
    { id: 9, name: 'Monitor Chargebacks', icon: 'ri-alert-line' },
    { id: 10, name: 'E-mails Automatizados', icon: 'ri-mail-send-line' },
    { id: 11, name: 'Rastreamento Courier', icon: 'ri-truck-line' },
    { id: 12, name: 'Ajuste Manual Taxas', icon: 'ri-calculator-line' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pendente', color: 'yellow' },
    { value: 'processing', label: 'Processando', color: 'blue' },
    { value: 'shipped', label: 'Enviado', color: 'purple' },
    { value: 'delivered', label: 'Entregue', color: 'green' },
    { value: 'cancelled', label: 'Cancelado', color: 'red' }
  ];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="ri-function-line text-yellow-500"></i>
          12+ Controles de Pedidos & Pagamentos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar por ID ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
          >
            <option value="all">Todos Status</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
          <i className="ri-download-line text-xl"></i>
          Exportar Pedidos
        </button>
      </div>

      <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">ID Pedido</th>
                  <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left font-semibold">Data</th>
                  <th className="px-6 py-4 text-left font-semibold">Total</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-t ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">{order.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{order.profiles?.full_name || 'N/A'}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {order.profiles?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-yellow-500">
                        R$ {order.total?.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered'
                            ? 'bg-green-500/20 text-green-500'
                            : order.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : order.status === 'cancelled'
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-blue-500/20 text-blue-500'
                        } border-none cursor-pointer`}
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => generateInvoicePDF(order)}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                          title="Gerar PDF"
                        >
                          <i className="ri-file-pdf-line"></i>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRefundModal(true);
                          }}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          title="Reembolso"
                        >
                          <i className="ri-refund-line"></i>
                        </button>
                        <button
                          className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
                          title="Rastreamento"
                        >
                          <i className="ri-truck-line"></i>
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
