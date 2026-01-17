
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface TaxManagementProps {
  darkMode: boolean;
}

export default function TaxManagement({ darkMode }: TaxManagementProps) {
  const [taxRules, setTaxRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    region: '',
    tax_type: 'vat',
    rate: 23,
    is_default: false,
    is_active: true,
    applies_to: 'all',
    product_categories: '',
    min_amount: 0,
    max_amount: 0,
    is_compound: false,
    priority: 1,
  });

  useEffect(() => {
    loadTaxRules();
  }, []);

  const loadTaxRules = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tax_settings')
      .select('*')
      .order('country');
    setTaxRules(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRule) {
        const { error } = await supabase
          .from('tax_settings')
          .update(formData)
          .eq('id', editingRule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tax_settings')
          .insert([formData]);
        if (error) throw error;
      }
      alert('Regra de IVA salva com sucesso!');
      setShowModal(false);
      resetForm();
      loadTaxRules();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar regra de IVA');
    }
  };

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setFormData(rule);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
    const { error } = await supabase.from('tax_settings').delete().eq('id', id);
    if (!error) {
      alert('Regra excluída com sucesso!');
      loadTaxRules();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      region: '',
      tax_type: 'vat',
      rate: 23,
      is_default: false,
      is_active: true,
      applies_to: 'all',
      product_categories: '',
      min_amount: 0,
      max_amount: 0,
      is_compound: false,
      priority: 1,
    });
    setEditingRule(null);
  };

  const countries = [
    { name: 'Portugal', defaultVat: 23 },
    { name: 'França', defaultVat: 20 },
    { name: 'Alemanha', defaultVat: 19 },
    { name: 'Espanha', defaultVat: 21 },
    { name: 'Itália', defaultVat: 22 },
    { name: 'Luxemburgo', defaultVat: 17 },
    { name: 'Bélgica', defaultVat: 21 },
    { name: 'Holanda', defaultVat: 21 },
    { name: 'Reino Unido', defaultVat: 20 },
    { name: 'Suíça', defaultVat: 7.7 },
    { name: 'Áustria', defaultVat: 20 },
    { name: 'Brasil', defaultVat: 17 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-percent-line text-yellow-500"></i>
            Gestão de IVA / TVA / Impostos
          </h2>
          <p className="text-gray-400 mt-1">Configure taxas de IVA por país e categoria</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          Nova Regra de IVA
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Regras</p>
              <p className="text-2xl font-bold mt-1">{taxRules.length}</p>
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
                {taxRules.filter(r => r.is_active).length}
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
                {new Set(taxRules.map(r => r.country)).size}
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
              <p className="text-gray-400 text-sm">Taxa Média</p>
              <p className="text-2xl font-bold mt-1">
                {taxRules.length > 0 
                  ? (taxRules.reduce((acc, r) => acc + r.rate, 0) / taxRules.length).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-percent-line text-2xl text-yellow-500"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Informação IOSS */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border rounded-xl p-6`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-information-line text-2xl text-blue-500"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Modo IOSS Ready</h3>
            <p className="text-sm text-gray-400 mb-3">
              O sistema está preparado para o regime IOSS (Import One-Stop Shop) da União Europeia. 
              Configure as taxas de IVA por país para vendas B2C dentro da UE.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <i className="ri-checkbox-circle-line text-green-500"></i>
                <span>Cálculo automático de IVA</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-checkbox-circle-line text-green-500"></i>
                <span>Breakdown detalhado no checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-checkbox-circle-line text-green-500"></i>
                <span>Suporte a dropshipping UE/Extra-UE</span>
              </div>
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
                <th className="px-6 py-4 text-left text-sm font-semibold">Tipo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Taxa (%)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Aplica-se a</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Prioridade</th>
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
              ) : taxRules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Nenhuma regra de IVA cadastrada
                  </td>
                </tr>
              ) : (
                taxRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <i className="ri-percent-line text-yellow-500"></i>
                        <span className="font-medium">{rule.name}</span>
                        {rule.is_default && (
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-xs font-medium">
                            Padrão
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{rule.country}</p>
                        {rule.region && <p className="text-sm text-gray-400">{rule.region}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded text-xs font-medium uppercase">
                        {rule.tax_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-yellow-500">{rule.rate}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {rule.applies_to === 'all' ? 'Todos os produtos' : rule.applies_to}
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
                {editingRule ? 'Editar Regra de IVA' : 'Nova Regra de IVA'}
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
                    placeholder="Ex: IVA Portugal Standard"
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">País *</label>
                  <select
                    required
                    value={formData.country}
                    onChange={(e) => {
                      const country = countries.find(c => c.name === e.target.value);
                      setFormData({ 
                        ...formData, 
                        country: e.target.value,
                        rate: country?.defaultVat || 23
                      });
                    }}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  >
                    <option value="">Selecione...</option>
                    {countries.map(country => (
                      <option key={country.name} value={country.name}>
                        {country.name} ({country.defaultVat}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Região (Opcional)</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="Ex: Açores, Madeira"
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Imposto</label>
                  <select
                    value={formData.tax_type}
                    onChange={(e) => setFormData({ ...formData, tax_type: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  >
                    <option value="vat">IVA / VAT</option>
                    <option value="sales_tax">Sales Tax</option>
                    <option value="gst">GST</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Taxa (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prioridade</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Menor número = maior prioridade</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Aplica-se a</label>
                  <select
                    value={formData.applies_to}
                    onChange={(e) => setFormData({ ...formData, applies_to: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  >
                    <option value="all">Todos os produtos</option>
                    <option value="physical">Apenas produtos físicos</option>
                    <option value="digital">Apenas produtos digitais</option>
                    <option value="categories">Categorias específicas</option>
                  </select>
                </div>

                {formData.applies_to === 'categories' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Categorias (IDs separados por vírgula)</label>
                    <input
                      type="text"
                      value={formData.product_categories}
                      onChange={(e) => setFormData({ ...formData, product_categories: e.target.value })}
                      placeholder="1,2,3"
                      className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Valor Mínimo (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Valor Máximo (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.max_amount}
                    onChange={(e) => setFormData({ ...formData, max_amount: parseFloat(e.target.value) })}
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
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="is_default" className="text-sm font-medium">Definir como padrão para este país</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_compound"
                    checked={formData.is_compound}
                    onChange={(e) => setFormData({ ...formData, is_compound: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="is_compound" className="text-sm font-medium">Imposto composto (aplica sobre outros impostos)</label>
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
