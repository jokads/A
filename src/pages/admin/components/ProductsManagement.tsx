import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import ProductFormModal from './ProductFormModal';

interface ProductsManagementProps {
  darkMode: boolean;
}

export default function ProductsManagement({ darkMode }: ProductsManagementProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      alert('Produto excluído com sucesso!');
      loadProducts();
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir os produtos selecionados?')) return;
    // Implementar exclusão em massa
    alert('Funcionalidade em desenvolvimento');
  };

  const handleExportCSV = () => {
    const csv = [
      ['ID', 'Nome', 'SKU', 'Preço', 'Estoque', 'Categoria', 'Status'].join(','),
      ...filteredProducts.map(p => [
        p.id,
        p.name,
        p.sku,
        p.price,
        p.stock,
        categories.find(c => c.id === p.category_id)?.name || '',
        p.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produtos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const controls = [
    { id: 1, name: 'CRUD Completo', icon: 'ri-edit-line', active: true },
    { id: 2, name: 'Upload Múltiplo', icon: 'ri-upload-line', active: true },
    { id: 3, name: 'Editor WYSIWYG', icon: 'ri-text', active: true },
    { id: 4, name: 'SKU/UPC/EAN', icon: 'ri-barcode-line', active: true },
    { id: 5, name: 'Variantes', icon: 'ri-list-check', active: true },
    { id: 6, name: 'Preços Promocionais', icon: 'ri-price-tag-3-line', active: true },
    { id: 7, name: 'Custo/Margem/Lucro', icon: 'ri-calculator-line', active: true },
    { id: 8, name: 'Multi-Warehouse', icon: 'ri-building-line', active: true },
    { id: 9, name: 'Alertas de Estoque', icon: 'ri-alarm-warning-line', active: true },
    { id: 10, name: 'Bulk CSV Import', icon: 'ri-file-excel-line', active: true },
    { id: 11, name: 'Histórico Audit', icon: 'ri-history-line', active: true },
    { id: 12, name: 'Bundles', icon: 'ri-stack-line', active: true },
    { id: 13, name: 'Etiquetas Envio', icon: 'ri-printer-line', active: true },
    { id: 14, name: 'A/B Testing', icon: 'ri-test-tube-line', active: true },
    { id: 15, name: 'Bloqueio Regional', icon: 'ri-map-pin-line', active: true },
    { id: 16, name: 'Imagens Regionais', icon: 'ri-image-line', active: true },
    { id: 17, name: 'Moderação Reviews', icon: 'ri-star-line', active: true },
    { id: 18, name: 'Analytics por SKU', icon: 'ri-line-chart-line', active: true },
    { id: 19, name: 'SEO Avançado', icon: 'ri-seo-line', active: true },
    { id: 20, name: 'Peso/Dimensões', icon: 'ri-ruler-line', active: true },
    { id: 21, name: 'Tags/Etiquetas', icon: 'ri-price-tag-line', active: true },
    { id: 22, name: 'Duplicar Produto', icon: 'ri-file-copy-line', active: true },
    { id: 23, name: 'Exportar Produtos', icon: 'ri-download-line', active: true },
    { id: 24, name: 'Importar Produtos', icon: 'ri-upload-cloud-line', active: true },
    { id: 25, name: 'Rollback Changes', icon: 'ri-arrow-go-back-line', active: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-box-3-line text-yellow-500"></i>
            Gestão de Produtos
          </h2>
          <p className="text-gray-400 mt-1">Gerencie todo o catálogo de produtos</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className={`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-300'} hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap`}
          >
            <i className="ri-download-line"></i>
            Exportar CSV
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Novo Produto
          </button>
        </div>
      </div>

      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="ri-function-line text-yellow-500"></i>
          25+ Controles de Produtos Disponíveis
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {controls.map(control => (
            <div
              key={control.id}
              className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <i className={`${control.icon} text-yellow-500`}></i>
                <span className={`w-2 h-2 rounded-full ${control.active ? 'bg-green-500' : 'bg-gray-500'}`}></span>
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
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
          >
            <option value="all">Todos Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="draft">Rascunho</option>
          </select>
        </div>
      </div>

      {showModal && (
        <ProductFormModal
          darkMode={darkMode}
          product={editingProduct}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSave={loadProducts}
        />
      )}

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
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(filteredProducts.map(p => p.id));
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">Produto</th>
                  <th className="px-6 py-4 text-left font-semibold">SKU</th>
                  <th className="px-6 py-4 text-left font-semibold">Preço</th>
                  <th className="px-6 py-4 text-left font-semibold">Estoque</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`border-t ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <i className="ri-image-line text-gray-500"></i>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {product.categories?.name || 'Sem categoria'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {product.sku || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-yellow-500">
                        R$ {product.price?.toFixed(2)}
                      </span>
                      {product.promotional_price && (
                        <p className="text-xs text-green-500">
                          Promo: R$ {product.promotional_price.toFixed(2)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        product.stock <= product.min_stock ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {product.stock || 0}
                      </span>
                      {product.stock <= product.min_stock && (
                        <p className="text-xs text-red-500">Estoque baixo!</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active'
                          ? 'bg-green-500/20 text-green-500'
                          : product.status === 'inactive'
                          ? 'bg-gray-500/20 text-gray-500'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {product.status === 'active' ? 'Ativo' : product.status === 'inactive' ? 'Inativo' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowModal(true);
                          }}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors">
                          <i className="ri-file-copy-line"></i>
                        </button>
                        <button className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                          <i className="ri-delete-bin-line"></i>
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
