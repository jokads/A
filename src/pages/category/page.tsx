
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, Product, Category } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { darkMode } = useTheme();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, sortBy, priceRange, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar categorias
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('display_order');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Carregar todos os produtos
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (productsData) {
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    // Filtro por preço
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Filtro por pesquisa
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    }
  };

  const handleBuyNow = async (product: Product) => {
    try {
      await addToCart(product, 1);
      window.location.href = '/cart';
    } catch (error) {
      console.error('Erro ao comprar:', error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#b62bff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011]' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar de Filtros */}
          <aside className={`w-80 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl p-6 h-fit sticky top-24 shadow-lg border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <i className="ri-filter-3-line mr-2 text-[#b62bff]"></i>
              Filtros
            </h2>

            {/* Pesquisa */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Pesquisar
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nome do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2.5 pl-10 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                />
                <i className={`ri-search-line absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
              </div>
            </div>

            {/* Categorias */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Categorias
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white'
                      : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="ri-apps-line mr-2"></i>
                  Todas as Categorias
                  <span className={`float-right ${selectedCategory === 'all' ? 'text-white' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    ({products.length})
                  </span>
                </button>
                {categories.map((category) => {
                  const count = products.filter(p => p.category_id === category.id).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white'
                          : darkMode
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                      <span className={`float-right ${selectedCategory === category.id ? 'text-white' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Faixa de Preço */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Faixa de Preço
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                  />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-[#b62bff]`}
                  />
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  R$ {priceRange[0].toFixed(2)} - R$ {priceRange[1].toFixed(2)}
                </div>
              </div>
            </div>

            {/* Ordenação */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-[#b62bff] cursor-pointer`}
              >
                <option value="name">Nome (A-Z)</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
              </select>
            </div>
          </aside>

          {/* Grid de Produtos */}
          <main className="flex-1">
            <div className="mb-6">
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Produtos
              </h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const imageUrl = Array.isArray(product.images) && product.images.length > 0 
                    ? product.images[0] 
                    : 'https://readdy.ai/api/search-image?query=product%20placeholder%20image%20on%20clean%20white%20minimalist%20background&width=400&height=400&seq=placeholder&orientation=squarish';

                  return (
                    <div
                      key={product.id}
                      className={`group ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl overflow-hidden border ${darkMode ? 'border-gray-800' : 'border-gray-200'} hover:shadow-xl transition-all duration-300`}
                      data-product-shop
                    >
                      {/* Imagem */}
                      <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                        />
                        
                        {/* Botões de Ação Flutuantes */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            className="w-10 h-10 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-[#b62bff] hover:text-white transition-colors cursor-pointer"
                            aria-label="Adicionar aos favoritos"
                          >
                            <i className="ri-heart-line text-lg"></i>
                          </button>
                        </div>

                        {/* Badge de Stock */}
                        {product.stock < 10 && product.stock > 0 && (
                          <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                            Últimas {product.stock} unidades
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            Esgotado
                          </div>
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="p-4">
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-2 mb-3 group-hover:text-[#b62bff] transition-colors`}>
                          {product.name}
                        </h3>
                        
                        <div className="mb-4">
                          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            R$ {product.price.toFixed(2).replace('.', ',')}
                          </span>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            ou 12x de R$ {(product.price / 12).toFixed(2).replace('.', ',')}
                          </p>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                            className={`flex-1 px-4 py-2.5 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} ${darkMode ? 'text-white' : 'text-gray-900'} rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium`}
                          >
                            <i className="ri-shopping-cart-line"></i>
                            Carrinho
                          </button>
                          <button
                            onClick={() => handleBuyNow(product)}
                            disabled={product.stock === 0}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                          >
                            <i className="ri-shopping-bag-line"></i>
                            Comprar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`text-center py-20 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <i className={`ri-inbox-line text-6xl ${darkMode ? 'text-gray-700' : 'text-gray-300'} mb-4`}></i>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Nenhum produto encontrado
                </h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tente ajustar os filtros ou pesquise por outro termo.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#1f2937' : '#f3f4f6'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4b5563' : '#d1d5db'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6b7280' : '#9ca3af'};
        }
      `}</style>
    </div>
  );
}
