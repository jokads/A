
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface ShippingManagementProps {
  darkMode: boolean;
}

export default function ShippingManagement({ darkMode }: ShippingManagementProps) {
  const [shippingRules, setShippingRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    region: '',
    method: 'standard',
    base_cost: 0,
    cost_per_kg: 0,
    cost_per_item: 0,
    free_shipping_threshold: 0,
    min_delivery_days: 3,
    max_delivery_days: 7,
    is_active: true,
    is_dropshipping: false,
    carrier: '',
    tracking_enabled: true,
  });

  useEffect(() => {
    loadShippingRules();
  }, []);

  const loadShippingRules = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('shipping_rules')
      .select('*')
      .order('country');
    setShippingRules(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRule) {
        const { error } = await supabase
          .from('shipping_rules')
          .update(formData)
          .eq('id', editingRule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shipping_rules')
          .insert([formData]);
        if (error) throw error;
      }
      alert('Regra de envio salva com sucesso!');
      setShowModal(false);
      resetForm();
      loadShippingRules();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar regra de envio');
    }
  };

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setFormData(rule);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
    const { error } = await supabase.from('shipping_rules').delete().eq('id', id);
    if (!error) {
      alert('Regra excluída com sucesso!');
      loadShippingRules();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      region: '',
      method: 'standard',
      base_cost: 0,
      cost_per_kg: 0,
      cost_per_item: 0,
      free_shipping_threshold: 0,
      min_delivery_days: 3,
      max_delivery_days: 7,
      is_active: true,
      is_dropshipping: false,
      carrier: '',
      tracking_enabled: true,
    });
    setEditingRule(null);
  };

  const countries = [
    'Portugal', 'França', 'Alemanha', 'Espanha', 'Itália', 'Luxemburgo',
    'Bélgica', 'Holanda', 'Reino Unido', 'Suíça', 'Áustria', 'Brasil'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-truck-line text-yellow-500"></i>
            Gestão de Envios & Logística
          </h2>
          <p className="text-gray-400 mt-1">Configure taxas de envio por país, peso e método</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          Nova Regra de Envio
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Regras</p>
              <p className="text-2xl font-bold mt-1">{shippingRules.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-list-check text-2xl text-blue-500"></i>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Regras Ativas</p>
              <p className="text-2xl font-bold mt-1">
                {shippingRules.filter(r => r.is_active).length}
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
              <p className="text-gray-400 text-sm">Países Cobertos</p>
              <p className="text-2xl font-bold mt-1">
                {new Set(shippingRules.map(r => r.country)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-global-line text-2xl text-purple-500"></i>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Dropshipping</p>
              <p className="text-2xl font-bold mt-1">
                {shippingRules.filter(r => r.is_dropshipping).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-box-3-line text-2xl text-yellow-500"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Regras */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">País/Região</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Método</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Custo Base</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Por Kg</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Prazo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : shippingRules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Nenhuma regra de envio cadastrada
                  </td>
                </tr>
              ) : (
                shippingRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <i className={`ri-${rule.is_dropshipping ? 'box-3' : 'truck'}-line text-yellow-500`}></i>
                        <span className="font-medium">{rule.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{rule.country}</p>
                        {rule.region && <p className="text-sm text-gray-400">{rule.region}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-medium">
                        {rule.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">€{rule.base_cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-400">€{rule.cost_per_kg.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {rule.min_delivery_days}-{rule.max_delivery_days} dias
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
                          onClick={() => handleEdit(rule)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <i className="ri-edit-line text-blue-500"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
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

      {/* Modal de Formulário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} p-6 flex items-center justify-between`}>
              <h3 className="text-xl font-bold">
                {editingRule ? 'Editar Regra de Envio' : 'Nova Regra de Envio'}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Regra *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Envio Standard Portugal"
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">País *</label>
                  <select
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  >
                    <option value="">Selecione...</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Região (Opcional)</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="Ex: Lisboa, Porto"
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Método de Envio</label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  >
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="priority">Priority</option>
                    <option value="economy">Economy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Transportadora</label>
                  <input
                    type="text"
                    value={formData.carrier}
                    onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                    placeholder="Ex: CTT, DHL, UPS"
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Custo Base (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.base_cost}
                    onChange={(e) => setFormData({ ...formData, base_cost: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Custo por Kg (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_per_kg}
                    onChange={(e) => setFormData({ ...formData, cost_per_kg: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Custo por Item (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_per_item}
                    onChange={(e) => setFormData({ ...formData, cost_per_item: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Envio Grátis Acima de (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.free_shipping_threshold}
                    onChange={(e) => setFormData({ ...formData, free_shipping_threshold: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prazo Mínimo (dias)</label>
                  <input
                    type="number"
                    value={formData.min_delivery_days}
                    onChange={(e) => setFormData({ ...formData, min_delivery_days: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prazo Máximo (dias)</label>
                  <input
                    type="number"
                    value={formData.max_delivery_days}
                    onChange={(e) => setFormData({ ...formData, max_delivery_days: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>
              </div>

              <div className="space-y-3">
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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_dropshipping"
                    checked={formData.is_dropshipping}
                    onChange={(e) => setFormData({ ...formData, is_dropshipping: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="is_dropshipping" className="text-sm font-medium">Dropshipping</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="tracking_enabled"
                    checked={formData.tracking_enabled}
                    onChange={(e) => setFormData({ ...formData, tracking_enabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="tracking_enabled" className="text-sm font-medium">Rastreamento Habilitado</label>
                </div>
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
