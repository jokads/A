import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface SupportManagementProps {
  darkMode: boolean;
}

export default function SupportManagement({ darkMode }: SupportManagementProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles!support_tickets_user_id_fkey(email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;
      await loadTickets();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const controls = [
    { id: 1, name: 'Chat Interno', icon: 'ri-chat-3-line' },
    { id: 2, name: 'Sistema de Tickets', icon: 'ri-ticket-line' },
    { id: 3, name: 'Import/Export Catálogo', icon: 'ri-file-transfer-line' },
    { id: 4, name: 'Painel de Tarefas', icon: 'ri-task-line' },
    { id: 5, name: 'Modo Manutenção', icon: 'ri-tools-line' },
    { id: 6, name: 'Simular Pedido', icon: 'ri-shopping-cart-2-line' }
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const statusOptions = [
    { value: 'open', label: 'Aberto', color: 'yellow' },
    { value: 'in_progress', label: 'Em Progresso', color: 'blue' },
    { value: 'waiting', label: 'Aguardando', color: 'purple' },
    { value: 'resolved', label: 'Resolvido', color: 'green' },
    { value: 'closed', label: 'Fechado', color: 'gray' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baixa', color: 'gray' },
    { value: 'medium', label: 'Média', color: 'blue' },
    { value: 'high', label: 'Alta', color: 'yellow' },
    { value: 'urgent', label: 'Urgente', color: 'red' }
  ];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="ri-function-line text-yellow-500"></i>
          6+ Controles de Suporte & Operações
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
        <div className="flex items-center gap-3">
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

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
          >
            <option value="all">Todas Prioridades</option>
            {priorityOptions.map(priority => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
            <i className="ri-download-line text-xl"></i>
            Exportar Catálogo
          </button>
          <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
            <i className="ri-upload-line text-xl"></i>
            Importar Catálogo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusOptions.map((status) => {
          const count = tickets.filter(t => t.status === status.value).length;
          return (
            <div
              key={status.value}
              className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
            >
              <div className={`w-10 h-10 rounded-lg bg-${status.color}-500/20 flex items-center justify-center mb-3`}>
                <i className={`ri-ticket-line text-xl text-${status.color}-500`}></i>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{status.label}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-customer-service-line text-6xl text-gray-600 mb-4"></i>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Nenhum ticket encontrado
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Assunto</th>
                  <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left font-semibold">Prioridade</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Data</th>
                  <th className="px-6 py-4 text-left font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className={`border-t ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">#{ticket.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{ticket.subject}</p>
                      {ticket.category && (
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {ticket.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{ticket.profiles?.full_name || 'N/A'}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {ticket.profiles?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.priority === 'urgent'
                          ? 'bg-red-500/20 text-red-500'
                          : ticket.priority === 'high'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : ticket.priority === 'medium'
                          ? 'bg-blue-500/20 text-blue-500'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {priorityOptions.find(p => p.value === ticket.priority)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'resolved'
                            ? 'bg-green-500/20 text-green-500'
                            : ticket.status === 'open'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : ticket.status === 'closed'
                            ? 'bg-gray-500/20 text-gray-500'
                            : 'bg-blue-500/20 text-blue-500'
                        } border-none cursor-pointer`}
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                          title="Ver detalhes"
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                        <button
                          className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                          title="Responder"
                        >
                          <i className="ri-reply-line"></i>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <h3 className="text-lg font-bold mb-4">Ferramentas de Operação</h3>
          <div className="space-y-3">
            <button className="w-full p-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-left hover:opacity-90 transition-opacity">
              <div className="flex items-center gap-3">
                <i className="ri-shopping-cart-2-line text-2xl"></i>
                <div>
                  <p className="font-medium">Simular Pedido</p>
                  <p className="text-sm opacity-80">Testar fluxo completo de compra</p>
                </div>
              </div>
            </button>

            <button className="w-full p-4 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-left hover:opacity-90 transition-opacity">
              <div className="flex items-center gap-3">
                <i className="ri-tools-line text-2xl"></i>
                <div>
                  <p className="font-medium">Modo Manutenção</p>
                  <p className="text-sm opacity-80">Ativar/desativar site temporariamente</p>
                </div>
              </div>
            </button>

            <button className="w-full p-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white text-left hover:opacity-90 transition-opacity">
              <div className="flex items-center gap-3">
                <i className="ri-task-line text-2xl"></i>
                <div>
                  <p className="font-medium">Painel de Tarefas</p>
                  <p className="text-sm opacity-80">Gerenciar tarefas da equipe</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <h3 className="text-lg font-bold mb-4">Estatísticas de Suporte</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Tempo Médio de Resposta</span>
                <span className="font-bold text-yellow-500">2.5h</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Taxa de Resolução</span>
                <span className="font-bold text-green-500">87%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Satisfação do Cliente</span>
                <span className="font-bold text-blue-500">4.6/5.0</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
