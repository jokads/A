import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface CategoriesManagementProps {
  darkMode: boolean;
}

export default function CategoriesManagement({ darkMode }: CategoriesManagementProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const controls = [
    { id: 1, name: 'Árvore Aninhada', icon: 'ri-node-tree' },
    { id: 2, name: 'Drag & Drop', icon: 'ri-drag-move-line' },
    { id: 3, name: 'SEO por Categoria', icon: 'ri-seo-line' },
    { id: 4, name: 'Landing Pages Custom', icon: 'ri-pages-line' },
    { id: 5, name: 'Filtros Configuráveis', icon: 'ri-filter-3-line' },
    { id: 6, name: 'Banners por Categoria', icon: 'ri-image-line' },
    { id: 7, name: 'Priorização Produtos', icon: 'ri-sort-asc' },
    { id: 8, name: 'Redirecionamentos', icon: 'ri-arrow-right-line' }
  ];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="ri-function-line text-yellow-500"></i>
          8+ Controles de Categorias & Navegação
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Gerenciar Categorias</h3>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowModal(true);
          }}
          className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
        >
          <i className="ri-add-line text-xl"></i>
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <i className="ri-folder-line text-6xl text-gray-600 mb-4"></i>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Nenhuma categoria criada ainda
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Criar Primeira Categoria
            </button>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'} hover:border-yellow-500 transition-colors cursor-move`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {category.icon ? (
                    <i className={`${category.icon} text-3xl text-yellow-500`}></i>
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                      <i className="ri-folder-line text-2xl text-black"></i>
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg">{category.name}</h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {category.product_count || 0} produtos
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  category.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                }`}>
                  {category.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              {category.description && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  {category.description}
                </p>
              )}

              {category.seo_title && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-4`}>
                  <p className="text-xs text-yellow-500 mb-1">SEO Configurado</p>
                  <p className="text-sm font-medium">{category.seo_title}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setShowModal(true);
                  }}
                  className="flex-1 p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors font-medium whitespace-nowrap"
                >
                  <i className="ri-edit-line mr-2"></i>
                  Editar
                </button>
                <button className="flex-1 p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors font-medium whitespace-nowrap">
                  <i className="ri-image-line mr-2"></i>
                  Banner
                </button>
                <button className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h3 className="text-lg font-bold mb-4">Configurações Avançadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <i className="ri-filter-3-line text-yellow-500"></i>
              Filtros Personalizados
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
              Configure filtros específicos para cada categoria
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm whitespace-nowrap">
              Configurar Filtros
            </button>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <i className="ri-arrow-right-line text-yellow-500"></i>
              Redirecionamentos
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
              Gerencie redirecionamentos e sinônimos de categorias
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm whitespace-nowrap">
              Gerenciar Redirecionamentos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
