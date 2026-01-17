
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface ProductFormModalProps {
  darkMode: boolean;
  product: any;
  onClose: () => void;
  onSave: () => void;
}

export default function ProductFormModal({ darkMode, product, onClose, onSave }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    cost: 0,
    promotional_price: 0,
    category_id: '',
    stock: 0,
    min_stock: 5,
    sku: '',
    barcode: '',
    weight: 0,
    dimensions: '',
    status: 'active',
    type: 'physical',
    tax_rate: 23,
    country_origin: '',
    warehouse_location: '',
    is_dropshipping: false,
    supplier_id: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    tags: '',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        short_description: product.short_description || '',
        price: product.price || 0,
        cost: product.cost || 0,
        promotional_price: product.promotional_price || 0,
        category_id: product.category_id || '',
        stock: product.stock || 0,
        min_stock: product.min_stock || 5,
        sku: product.sku || '',
        barcode: product.barcode || '',
        weight: product.weight || 0,
        dimensions: product.dimensions || '',
        status: product.status || 'active',
        type: product.type || 'physical',
        tax_rate: product.tax_rate || 23,
        country_origin: product.country_origin || '',
        warehouse_location: product.warehouse_location || '',
        is_dropshipping: product.is_dropshipping || false,
        supplier_id: product.supplier_id || '',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        meta_keywords: product.meta_keywords || '',
        tags: product.tags || '',
      });
      setImages(product.images || []);
      setVariants(product.variants || []);
    }
  }, [product]);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        images,
        variants,
        margin: formData.price - formData.cost,
        margin_percentage: ((formData.price - formData.cost) / formData.price * 100).toFixed(2),
        updated_at: new Date().toISOString(),
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{ ...productData, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }

      alert('Produto salvo com sucesso!');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`sticky top-0 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} p-6 flex items-center justify-between z-10`}>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-box-3-line text-yellow-500"></i>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <i className="ri-information-line text-yellow-500"></i>
                Informações Básicas
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) });
                  }}
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slug (URL)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição Curta</label>
                <textarea
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição Completa</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  >
                    <option value="">Selecione...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="draft">Rascunho</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  >
                    <option value="physical">Físico</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <i className="ri-money-dollar-circle-line text-yellow-500"></i>
                Preços & Financeiro
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Custo *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Preço de Venda *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preço Promocional</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.promotional_price}
                  onChange={(e) => setFormData({ ...formData, promotional_price: parseFloat(e.target.value) })}
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Taxa IVA (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })}
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>

              {formData.price > 0 && formData.cost > 0 && (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <p className="text-sm mb-2">Margem: <span className="font-bold text-green-500">€{(formData.price - formData.cost).toFixed(2)}</span></p>
                  <p className="text-sm">Margem %: <span className="font-bold text-green-500">{((formData.price - formData.cost) / formData.price * 100).toFixed(2)}%</span></p>
                </div>
              )}

              <h3 className="text-lg font-semibold flex items-center gap-2 pt-4">
                <i className="ri-stack-line text-yellow-500"></i>
                Estoque & Logística
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Estoque Atual</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Localização no Armazém</label>
                <input
                  type="text"
                  value={formData.warehouse_location}
                  onChange={(e) => setFormData({ ...formData, warehouse_location: e.target.value })}
                  placeholder="Ex: A-12-3"
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Dimensões (LxAxP cm)</label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="30x20x10"
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">País de Origem</label>
                <input
                  type="text"
                  value={formData.country_origin}
                  onChange={(e) => setFormData({ ...formData, country_origin: e.target.value })}
                  placeholder="Portugal"
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_dropshipping"
                  checked={formData.is_dropshipping}
                  onChange={(e) => setFormData({ ...formData, is_dropshipping: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="is_dropshipping" className="text-sm font-medium">Produto Dropshipping</label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <i className="ri-seo-line text-yellow-500"></i>
              SEO & Meta Tags
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Meta Título</label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  maxLength={60}
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.meta_title.length}/60 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Meta Descrição</label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  maxLength={160}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.meta_description.length}/160 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Palavras-chave (separadas por vírgula)</label>
                <input
                  type="text"
                  value={formData.meta_keywords}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="eletrônicos, tecnologia, gadgets"
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="ri-save-line"></i>
                  Salvar Produto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
