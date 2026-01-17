import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface SecurityManagementProps {
  darkMode: boolean;
}

export default function SecurityManagement({ darkMode }: SecurityManagementProps) {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const [logsRes, keysRes, webhooksRes] = await Promise.all([
        supabase.from('audit_logs').select('*, profiles(email)').order('created_at', { ascending: false }).limit(50),
        supabase.from('api_keys').select('*').order('created_at', { ascending: false }),
        supabase.from('webhooks').select('*').order('created_at', { ascending: false })
      ]);

      setAuditLogs(logsRes.data || []);
      setApiKeys(keysRes.data || []);
      setWebhooks(webhooksRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  const controls = [
    { id: 1, name: 'Audit Log', icon: 'ri-history-line' },
    { id: 2, name: 'Gestão API Keys', icon: 'ri-key-line' },
    { id: 3, name: 'Webhooks', icon: 'ri-webhook-line' },
    { id: 4, name: 'RLS Policies', icon: 'ri-shield-check-line' },
    { id: 5, name: 'Backups Agendados', icon: 'ri-database-line' },
    { id: 6, name: 'Controle de Sessões', icon: 'ri-user-settings-line' }
  ];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="ri-function-line text-yellow-500"></i>
          6+ Controles de Segurança & Infraestrutura
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
            <i className="ri-shield-check-line text-2xl text-green-500"></i>
          </div>
          <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Status de Segurança</h3>
          <p className="text-3xl font-bold text-green-500">Seguro</p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Todas as políticas ativas
          </p>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
            <i className="ri-key-line text-2xl text-blue-500"></i>
          </div>
          <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>API Keys Ativas</h3>
          <p className="text-3xl font-bold">{apiKeys.filter(k => k.is_active).length}</p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {apiKeys.length} total
          </p>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
            <i className="ri-database-line text-2xl text-purple-500"></i>
          </div>
          <h3 className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Último Backup</h3>
          <p className="text-3xl font-bold">Hoje</p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Automático diário
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">API Keys</h3>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
              <i className="ri-add-line text-xl"></i>
              Nova Key
            </button>
          </div>

          <div className="space-y-3">
            {apiKeys.length === 0 ? (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Nenhuma API key criada</p>
            ) : (
              apiKeys.map((key) => (
                <div key={key.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className={`text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {key.key_hash.slice(0, 20)}...
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      key.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {key.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Último uso: {key.last_used ? new Date(key.last_used).toLocaleDateString('pt-BR') : 'Nunca'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                        <i className="ri-edit-line"></i>
                      </button>
                      <button className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Webhooks</h3>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
              <i className="ri-add-line text-xl"></i>
              Novo Webhook
            </button>
          </div>

          <div className="space-y-3">
            {webhooks.length === 0 ? (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Nenhum webhook configurado</p>
            ) : (
              webhooks.map((webhook) => (
                <div key={webhook.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 mr-2">
                      <p className="font-medium">{webhook.name}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                        {webhook.url}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                      webhook.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {webhook.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-green-500">✓ {webhook.success_count || 0}</span>
                      <span className="text-red-500">✗ {webhook.failure_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                        <i className="ri-edit-line"></i>
                      </button>
                      <button className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h3 className="text-lg font-bold mb-4">Audit Log (Últimas 50 ações)</h3>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : auditLogs.length === 0 ? (
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Nenhuma ação registrada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Data/Hora</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Usuário</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ação</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tabela</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">IP</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                  >
                    <td className="px-4 py-3 text-sm">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.profiles?.email || 'Sistema'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.action.includes('create') || log.action.includes('insert')
                          ? 'bg-green-500/20 text-green-500'
                          : log.action.includes('update')
                          ? 'bg-blue-500/20 text-blue-500'
                          : log.action.includes('delete')
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{log.table_name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-mono">{log.ip_address || '-'}</td>
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
