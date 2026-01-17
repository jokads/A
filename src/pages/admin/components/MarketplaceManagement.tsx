
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface MarketplaceManagementProps {
  darkMode: boolean;
}

export default function MarketplaceManagement({ darkMode }: MarketplaceManagementProps) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [commissionRules, setCommissionRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vendors');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    commission_type: 'percentage',
    commission_value: 15,
    applies_to: 'all',
    category_ids: '',
    vendor_ids: '',
    min_order_value: 0,
    max_order_value: 0,
    is_active: true,
    priority: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Carregar vendedores
    const { data: vendorsData } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });
    setVendors(vendorsData || []);

    // Carregar regras de comissão
    const { data: rulesData } = await supabase
      .from('commission_rules')
      .select('*')
      .order('priority');
    setCommissionRules(rulesData || []);

    setLoading(false);
  };

  const handleSubmitRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRule) {
        const { error } = await supabase
          .from('commission_rules')
          .update(formData)
          .eq('id', editingRule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('commission_rules')
          .insert([formData]);
        if (error) throw error;
      }
      alert('Regra de comissão salva com sucesso!');
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar regra de comissão');
    }
  };

  const handleApproveVendor = async (vendorId: string) => {
    const { error } = await supabase
      .from('vendors')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', vendorId);
    
    if (!error) {
      alert('Vendedor aprovado com sucesso!');
      loadData();
    }
  };

  const handleRejectVendor = async (vendorId: string) => {
    const { error } = await supabase
      .from('vendors')
      .update({ status: 'rejected' })
      .eq('id', vendorId);
    
    if (!error) {
      alert('Vendedor rejeitado!');
      loadData();
    }
  };

  const handleSuspendVendor = async (vendorId: string) => {
    const { error } = await supabase
      .from('vendors')
      .update({ status: 'suspended' })
      .eq('id', vendorId);
    
    if (!error) {
      alert('Vendedor suspenso!');
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      commission_type: 'percentage',
      commission_value: 15,
      applies_to: 'all',
      category_ids: '',
      vendor_ids: '',
      min_order_value: 0,
      max_order_value: 0,
      is_active: true,
      priority: 1,
    });
    setEditingRule(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/10 text-green-500';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'rejected': return 'bg-red-500/10 text-red-500';
      case 'suspended': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-store-3-line text-yellow-500"></i>
            Gestão de Marketplace
          </h2>
          <p className="text-gray-400 mt-1">Gerencie vendedores e comissões do marketplace</p>
        </div>
        {activeTab === 'commissions' && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Nova Regra de Comissão
          </button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Vendedores</p>
              <p className="text-2xl font-bold mt-1">{vendors.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-store-3-line text-2xl text-blue-500"></i>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Aprovados</p>
              <p className="text-2xl font-bold mt-1">
                {vendors.filter(v => v.status === 'approved').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-2xl text-green-500"></i>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pendentes</p>
              <p className="text-2xl font-bold mt-1">
                {vendors.filter(v => v.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-2xl text-yellow-500"></i>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Regras de Comissão</p>
              <p className="text-2xl font-bold mt-1">{commissionRules.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-percent-line text-2xl text-purple-500"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-2 flex gap-2`}>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'vendors'
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
              : 'hover:bg-gray-700'
          }`}
        >
          <i className="ri-store-3-line mr-2"></i>
          Vendedores
        </button>
        <button
          onClick={() => setActiveTab('commissions')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'commissions'
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
              : 'hover:bg-gray-700'
          }`}
        >
          <i className="ri-percent-line mr-2"></i>
          Comissões
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'vendors' && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Vendedor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Produtos</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Vendas</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Comissão</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        Carregando...
                      </div>
                    </td>
                  </tr>
                ) : vendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      Nenhum vendedor cadastrado
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold">
                            {vendor.store_name?.charAt(0) || 'V'}
                          </div>
                          <div>
                            <p className="font-medium">{vendor.store_name}</p>
                            <p className="text-sm text-gray-400">{vendor.company_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{vendor.email}</td>
                      <td className="px-6 py-4 font-medium">{vendor.total_products || 0}</td>
                      <td className="px-6 py-4 font-medium">€{vendor.total_sales?.toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-4 text-yellow-500 font-medium">{vendor.commission_rate || 15}%</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(vendor.status)}`}>
                          {vendor.status === 'approved' && 'Aprovado'}
                          {vendor.status === 'pending' && 'Pendente'}
                          {vendor.status === 'rejected' && 'Rejeitado'}
                          {vendor.status === 'suspended' && 'Suspenso'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {vendor.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveVendor(vendor.id)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                title="Aprovar"
                              >
                                <i className="ri-checkbox-circle-line text-green-500"></i>
                              </button>
                              <button
                                onClick={() => handleRejectVendor(vendor.id)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                title="Rejeitar"
                              >
                                <i className="ri-close-circle-line text-red-500"></i>
                              </button>
                            </>
                          )}
                          {vendor.status === 'approved' && (
                            <button
                              onClick={() => handleSuspendVendor(vendor.id)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Suspender"
                            >
                              <i className="ri-forbid-line text-orange-500"></i>
                            </button>
                          )}
                          <button
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Ver Detalhes"
                          >
                            <i className="ri-eye-line text-blue-500"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'commissions' && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Valor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Aplica-se a</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Prioridade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        Carregando...
                      </div>
                    </td>
                  </tr>
                ) : commissionRules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      Nenhuma regra de comissão cadastrada
                    </td>
                  </tr>
                ) : (
                  commissionRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <i className="ri-percent-line text-yellow-500"></i>
                          <span className="font-medium">{rule.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded text-xs font-medium">
                          {rule.commission_type === 'percentage' ? 'Percentual' : 'Fixo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-yellow-500">
                          {rule.commission_type === 'percentage' ? `${rule.commission_value}%` : `€${rule.commission_value}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {rule.applies_to === 'all' ? 'Todos' : rule.applies_to}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs font-medium">
                          {rule.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          rule.is_active 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {rule.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingRule(rule);
                              setFormData(rule);
                              setShowModal(true);
                            }}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <i className="ri-edit-line text-blue-500"></i>
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
                              const { error } = await supabase.from('commission_rules').delete().eq('id', rule.id);
                              if (!error) {
                                alert('Regra excluída com sucesso!');
                                loadData();
                              }
                            }}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <i className="ri-delete-bin-line text-red-500"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Formulário de Comissão */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} p-6 flex items-center justify-between`}>
              <h3 className="text-xl font-bold">
                {editingRule ? 'Editar Regra de Comissão' : 'Nova Regra de Comissão'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitRule} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Nome da Regra *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Comissão Padrão"
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Comissão</label>
                  <select
                    value={formData.commission_type}
                    onChange={(e) => setFormData({ ...formData, commission_type: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  >
                    <option value="percentage">Percentual (%)</option>
                    <option value="fixed">Valor Fixo (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Valor {formData.commission_type === 'percentage' ? '(%)' : '(€)'} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.commission_value}
                    onChange={(e) => setFormData({ ...formData, commission_value: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Aplica-se a</label>
                  <select
                    value={formData.applies_to}
                    onChange={(e) => setFormData({ ...formData, applies_to: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  >
                    <option value="all">Todos os vendedores</option>
                    <option value="categories">Categorias específicas</option>
                    <option value="vendors">Vendedores específicos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prioridade</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Valor Mínimo do Pedido (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Valor Máximo do Pedido (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.max_order_value}
                    onChange={(e) => setFormData({ ...formData, max_order_value: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="is_active" className="text-sm font-medium">Regra Ativa</label>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
                >
                  <i className="ri-save-line"></i>
                  Salvar Regra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
