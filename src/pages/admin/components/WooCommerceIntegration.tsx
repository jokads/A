import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { testWooCommerceConnection, fetchWooCommerceProducts, importWooCommerceProducts } from '../../../api/woocommerce';

interface WooCommerceIntegrationProps {
  darkMode: boolean;
}

// ✅ CORRIGIR: Usar mesma interface do woocommerce.ts
interface WooCredentials {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  apiVersion: string;
  useSsl: boolean;
  onlyProducts: boolean;
}

interface ImportJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_items: number;
  processed_items: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

interface ImportedProduct {
  id: string;
  woo_id: number;
  title: string;
  sku: string;
  price: number;
  sale_price?: number;
  stock: number;
  images: string[];
  description: string;
  short_description: string;
  category: string;
  weight?: string;
  dimensions?: any;
  manage_stock: boolean;
  stock_status: string;
  last_synced_at: string;
}

export default function WooCommerceIntegration({ darkMode }: WooCommerceIntegrationProps) {
  const [credentials, setCredentials] = useState<WooCredentials>({
    storeUrl: '',
    consumerKey: '',
    consumerSecret: '',
    apiVersion: 'wc/v3',
    useSsl: true,
    onlyProducts: true
  });
  const [isConnected, setIsConnected] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [previewProducts, setPreviewProducts] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  // ✅ ADICIONAR: Estado 'saving' que estava faltando
  const [saving, setSaving] = useState(false);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [importedProducts, setImportedProducts] = useState<ImportedProduct[]>([]);
  const [showImportedProducts, setShowImportedProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ImportedProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState<ImportedProduct | null>(null);
  const [categoryMapping, setCategoryMapping] = useState<Record<string, string>>({});
  const [syncSchedule, setSyncSchedule] = useState('manual');
  const [importOptions, setImportOptions] = useState({
    update_existing: true,
    create_new: true,
    sync_stock_only: false,
    import_images: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadConnection();
    loadImportJobs();
    loadCategories();
  }, []);

  const loadConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('integrations_woocommerce')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setIsConnected(true);
        setCredentials({
          storeUrl: data.store_url,
          consumerKey: '••••••••',
          consumerSecret: '••••••••',
          apiVersion: data.api_version || 'wc/v3',
          useSsl: data.use_ssl ?? true,
          onlyProducts: data.products_only ?? true
        });
        setSyncSchedule(data.sync_schedule || 'manual');
        loadImportedProducts();
      }
    } catch (error: any) {
      console.error('Erro ao carregar conexão:', error);
      setError('Falha ao carregar configurações de conexão');
    } finally {
      setLoading(false);
    }
  };

  const loadImportJobs = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('woocommerce_import_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setImportJobs(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar jobs:', error);
      setError('Falha ao carregar histórico de importações');
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadImportedProducts = async () => {
    try {
      const { data: mappings, error: mappingsError } = await supabase
        .from('product_mappings')
        .select(`
          woo_product_id,
          local_product_id,
          sku,
          last_synced_at,
          products (
            id,
            title,
            sku,
            price,
            sale_price,
            stock,
            images,
            description,
            short_description,
            category_id,
            weight,
            dimensions,
            manage_stock,
            stock_status,
            categories (
              name
            )
          )
        `)
        .order('last_synced_at', { ascending: false });

      if (mappingsError) throw mappingsError;

      const products = mappings?.map((m: any) => ({
        id: m.products.id,
        woo_id: m.woo_product_id,
        title: m.products.title,
        sku: m.products.sku,
        price: m.products.price,
        sale_price: m.products.sale_price,
        stock: m.products.stock,
        images: m.products.images || [],
        description: m.products.description || '',
        short_description: m.products.short_description || '',
        category: m.products.categories?.name || 'Sem categoria',
        weight: m.products.weight,
        dimensions: m.products.dimensions,
        manage_stock: m.products.manage_stock,
        stock_status: m.products.stock_status,
        last_synced_at: m.last_synced_at
      })) || [];

      setImportedProducts(products);
    } catch (error: any) {
      console.error('Erro ao carregar produtos importados:', error);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const startTime = Date.now();
      
      const result = await testWooCommerceConnection(credentials);
      const latency = Date.now() - startTime;

      setTestResult({
        success: result.success,
        latency,
        message: result.message,
        data: result.data
      });

      if (result.success) {
        setIsConnected(true);
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Erro ao testar conexão'
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConnection = async () => {
    if (!credentials.storeUrl || !credentials.consumerKey || !credentials.consumerSecret) {
      setError('Por favor, preencha todos os campos de conexão');
      return;
    }

    try {
      // ✅ ADICIONAR: Ativar estado de salvamento
      setSaving(true);
      setError(null);
      const { error } = await supabase
        .from('integrations_woocommerce')
        .upsert({
          store_url: credentials.storeUrl,
          consumer_key: credentials.consumerKey.replace(/•/g, ''),
          consumer_secret: credentials.consumerSecret.replace(/•/g, ''),
          api_version: credentials.apiVersion,
          use_ssl: credentials.useSsl,
          products_only: credentials.onlyProducts,
          sync_schedule: syncSchedule,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('✅ Conexão salva com sucesso!');
      loadConnection();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setError('Erro ao salvar conexão. Tente novamente.');
    } finally {
      // ✅ ADICIONAR: Desativar estado de salvamento
      setSaving(false);
    }
  };

  const loadPreview = async () => {
    try {
      setShowPreview(true);
      const result = await fetchWooCommerceProducts(50);
      
      if (result.success) {
        setPreviewProducts(result.products || []);
      } else {
        alert(`❌ Erro: ${result.message}`);
      }
    } catch (error) {
      console.error('Erro ao carregar preview:', error);
      alert('❌ Erro ao carregar preview');
    }
  };

  const startImport = async (mode: 'preview' | 'full') => {
    setImporting(true);
    
    try {
      const result = await importWooCommerceProducts(mode, importOptions, categoryMapping);

      if (result.success) {
        alert(`✅ Import ${mode === 'preview' ? 'preview' : 'completo'} concluído!\n\nProcessados: ${result.processed}/${result.total}\nCriados: ${result.created}\nAtualizados: ${result.updated}`);
        loadImportJobs();
        loadImportedProducts();
      } else {
        alert(`❌ Erro: ${result.message}`);
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      alert('❌ Erro ao iniciar importação');
    } finally {
      setImporting(false);
    }
  };

  const disconnectWooCommerce = async () => {
    if (!confirm('Tem certeza que deseja desconectar o WooCommerce?')) return;

    try {
      setError(null);
      const { error } = await supabase
        .from('integrations_woocommerce')
        .delete()
        .eq('store_url', credentials.storeUrl);

      if (error) throw error;

      setIsConnected(false);
      setCredentials({
        storeUrl: '',
        consumerKey: '',
        consumerSecret: '',
        apiVersion: 'wc/v3',
        useSsl: true,
        onlyProducts: true
      });
      setImportJobs([]);
      setPreviewProducts([]);
      setShowPreview(false);
      setImportedProducts([]);
      setShowImportedProducts(false);
      alert('✅ Desconectado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao desconectar:', error);
      setError('Erro ao desconectar. Tente novamente.');
    }
  };

  const saveProductEdit = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: editingProduct.title,
          price: editingProduct.price,
          sale_price: editingProduct.sale_price,
          stock: editingProduct.stock,
          description: editingProduct.description,
          short_description: editingProduct.short_description,
          images: editingProduct.images,
          weight: editingProduct.weight,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      alert('✅ Produto atualizado com sucesso!');
      setEditingProduct(null);
      loadImportedProducts();
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      alert('❌ Erro ao salvar produto');
    }
  };

  const filteredProducts = importedProducts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Integração WooCommerce</h2>
            <p className="text-gray-600 mt-1">
              Conecte sua loja WooCommerce e sincronize produtos automaticamente
            </p>
          </div>
          {isConnected && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
              <i className="ri-checkbox-circle-fill text-xl"></i>
              <span className="font-medium">Conectado</span>
            </div>
          )}
        </div>

        {/* Guia Rápido para InfinityFree */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <i className="ri-information-fill text-blue-600 text-xl mt-0.5"></i>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">
                📘 Guia Rápido - InfinityFree
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>1. URL da Loja:</strong> Use o domínio completo (ex: <code className="bg-blue-100 px-1 rounded">seusite.ct.ws</code>)</p>
                <p><strong>2. SSL/HTTPS:</strong> Se tiver erro de conexão, <strong>desative "Usar SSL"</strong> primeiro para testar</p>
                <p><strong>3. Chaves API:</strong> WordPress → WooCommerce → Configurações → Avançado → REST API → Adicionar chave</p>
                <p><strong>4. Permissões:</strong> Selecione <strong>"Leitura/Escrita"</strong> ao gerar as chaves</p>
                <p><strong>5. Permalinks:</strong> WordPress → Configurações → Permalinks → Selecione <strong>"Nome do post"</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Conexão */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da Loja *
            </label>
            <input
              type="text"
              value={credentials.storeUrl}
              onChange={(e) => setCredentials({ ...credentials, storeUrl: e.target.value })}
              placeholder="https://sua-loja.com ou sua-loja.ct.ws"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pode usar com ou sem https://
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Versão da API
            </label>
            <select
              value={credentials.apiVersion}
              onChange={(e) => setCredentials({ ...credentials, apiVersion: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="wc/v3">wc/v3 (Recomendado)</option>
              <option value="wc/v2">wc/v2</option>
              <option value="wc/v1">wc/v1</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consumer Key *
            </label>
            <input
              type="text"
              value={credentials.consumerKey}
              onChange={(e) => setCredentials({ ...credentials, consumerKey: e.target.value })}
              placeholder="ck_xxxxxxxxxxxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consumer Secret *
            </label>
            <input
              type="password"
              value={credentials.consumerSecret}
              onChange={(e) => setCredentials({ ...credentials, consumerSecret: e.target.value })}
              placeholder="cs_xxxxxxxxxxxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>

        {/* Opções */}
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={credentials.useSsl}
              onChange={(e) => setCredentials({ ...credentials, useSsl: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Usar SSL (HTTPS)</span>
              <p className="text-xs text-gray-500">
                ⚠️ Se tiver erro de conexão no InfinityFree, desative esta opção primeiro
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={credentials.onlyProducts}
              onChange={(e) => setCredentials({ ...credentials, onlyProducts: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Sincronizar apenas produtos</span>
              <p className="text-xs text-gray-500">
                Ignora pedidos, clientes e outras entidades
              </p>
            </div>
          </label>
        </div>

        {/* Botões de Ação */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={testConnection}
            disabled={testing || !credentials.storeUrl || !credentials.consumerKey || !credentials.consumerSecret}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {testing ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Testando...
              </>
            ) : (
              <>
                <i className="ri-plug-line"></i>
                Testar Conexão
              </>
            )}
          </button>

          <button
            onClick={saveConnection}
            disabled={saving || !testResult?.success}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {saving ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Salvando...
              </>
            ) : (
              <>
                <i className="ri-save-line"></i>
                Salvar Conexão
              </>
            )}
          </button>

          {isConnected && (
            <button
              onClick={disconnectWooCommerce}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 whitespace-nowrap"
            >
              <i className="ri-link-unlink"></i>
              Desconectar
            </button>
          )}
        </div>

        {/* Resultado do Teste */}
        {testResult && (
          <div className={`mt-4 p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-3">
              <i className={`${testResult.success ? 'ri-checkbox-circle-fill text-green-600' : 'ri-error-warning-fill text-red-600'} text-xl mt-0.5`}></i>
              <div className="flex-1">
                <pre className="text-sm whitespace-pre-wrap font-sans" style={{ fontFamily: 'inherit' }}>
                  {testResult.message}
                </pre>
                {testResult.success && testResult.latency && (
                  <p className="text-sm text-gray-600 mt-2">
                    ⚡ Latência: {testResult.latency}ms
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isConnected && (
        <>
          {/* Importação de Produtos */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="ri-download-cloud-line text-accent"></i>
              Importação de Produtos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importOptions.update_existing}
                  onChange={(e) => setImportOptions({ ...importOptions, update_existing: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Atualizar produtos existentes (por SKU)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importOptions.create_new}
                  onChange={(e) => setImportOptions({ ...importOptions, create_new: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Criar novos produtos</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importOptions.sync_stock_only}
                  onChange={(e) => setImportOptions({ ...importOptions, sync_stock_only: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sincronizar apenas stock</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={importOptions.import_images}
                  onChange={(e) => setImportOptions({ ...importOptions, import_images: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Importar imagens</span>
              </label>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Agendamento de Sincronização</label>
              <select
                value={syncSchedule}
                onChange={(e) => setSyncSchedule(e.target.value)}
                className={`w-full max-w-xs px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
              >
                <option value="manual">Manual</option>
                <option value="hourly">A cada hora</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadPreview}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 whitespace-nowrap font-medium shadow-lg"
              >
                <i className="ri-eye-line"></i>
                Preview (50 produtos)
              </button>

              <button
                onClick={() => startImport('full')}
                disabled={importing}
                className="px-6 py-2.5 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap font-medium shadow-lg"
              >
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <i className="ri-download-line"></i>
                    Importar Todos
                  </>
                )}
              </button>

              {importedProducts.length > 0 && (
                <button
                  onClick={() => setShowImportedProducts(!showImportedProducts)}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap font-medium shadow-lg"
                >
                  <i className="ri-list-check"></i>
                  Ver Produtos Importados ({importedProducts.length})
                </button>
              )}
            </div>
          </div>

          {/* Preview de Produtos */}
          {showPreview && previewProducts.length > 0 && (
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Preview de Produtos</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-100'}>
                    <tr>
                      <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Imagem</th>
                      <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Nome</th>
                      <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>SKU</th>
                      <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Preço</th>
                      <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Stock</th>
                      <th className={`px-4 py-3 text-left font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Categoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewProducts.slice(0, 10).map((product, index) => (
                      <tr key={index} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="px-4 py-3">
                          <div className={`w-12 h-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded overflow-hidden`}>
                            {product.image && (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                        </td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{product.name}</td>
                        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{product.sku || '-'}</td>
                        <td className="px-4 py-3 text-primary font-medium">€{product.price}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{product.stock}</td>
                        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{product.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Produtos Importados - Vista Detalhada */}
          {showImportedProducts && (
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <i className="ri-box-3-line text-primary"></i>
                  Produtos Importados ({filteredProducts.length})
                </h3>
                <button
                  onClick={() => setShowImportedProducts(false)}
                  className={`text-gray-400 hover:${darkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Pesquisar</label>
                  <input
                    type="text"
                    placeholder="Nome ou SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Categoria</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                  >
                    <option value="all">Todas as categorias</option>
                    {Array.from(new Set(importedProducts.map(p => p.category))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid de Produtos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:border-primary transition-colors cursor-pointer`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className={`w-full h-48 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg overflow-hidden mb-3`}>
                      {product.images[0] && (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{product.title}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-primary font-bold text-lg">€{product.price}</span>
                      {product.sale_price && (
                        <span className={`text-sm line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>€{product.sale_price}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>SKU: {product.sku}</span>
                      <span className={`px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                    <div className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {product.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal de Detalhes do Produto */}
          {selectedProduct && !editingProduct && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProduct(null)}>
              <div
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
                  <h3 className="text-xl font-bold">Detalhes do Produto</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap font-medium"
                    >
                      <i className="ri-edit-line"></i>
                      Editar
                    </button>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className={`text-gray-400 hover:${darkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      <i className="ri-close-line text-2xl"></i>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Imagens */}
                    <div>
                      <h4 className={`font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Imagens</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.images.map((img, idx) => (
                          <div key={idx} className={`w-full h-48 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-lg overflow-hidden`}>
                            <img src={img} alt={`${selectedProduct.title} ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="space-y-4">
                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nome</label>
                        <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedProduct.title}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Preço</label>
                          <p className="text-xl font-bold text-primary">€{selectedProduct.price}</p>
                        </div>
                        {selectedProduct.sale_price && (
                          <div>
                            <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Preço Promocional</label>
                            <p className="text-xl font-bold text-accent">€{selectedProduct.sale_price}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>SKU</label>
                          <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{selectedProduct.sku}</p>
                        </div>
                        <div>
                          <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stock</label>
                          <p className={`font-semibold ${selectedProduct.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {selectedProduct.stock} unidades
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Categoria</label>
                        <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{selectedProduct.category}</p>
                      </div>

                      {selectedProduct.weight && (
                        <div>
                          <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Peso</label>
                          <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{selectedProduct.weight} kg</p>
                        </div>
                      )}

                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status do Stock</label>
                        <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{selectedProduct.stock_status}</p>
                      </div>

                      <div>
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Última Sincronização</label>
                        <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                          {new Date(selectedProduct.last_synced_at).toLocaleString('pt-PT')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Descrições */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Descrição Curta</label>
                      <div
                        className={`mt-2 p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
                        dangerouslySetInnerHTML={{ __html: selectedProduct.short_description || 'Sem descrição curta' }}
                      />
                    </div>

                    <div>
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Descrição Completa</label>
                      <div
                        className={`mt-2 p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} max-h-64 overflow-y-auto`}
                        dangerouslySetInnerHTML={{ __html: selectedProduct.description || 'Sem descrição' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Edição do Produto */}
          {editingProduct && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingProduct(null)}>
              <div
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
                  <h3 className="text-xl font-bold">Editar Produto</h3>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className={`text-gray-400 hover:${darkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Nome do Produto</label>
                    <input
                      type="text"
                      value={editingProduct.title}
                      onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Preço (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                        className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Preço Promocional (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingProduct.sale_price || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sale_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Stock</label>
                      <input
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                        className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Descrição Curta</label>
                    <textarea
                      rows={3}
                      value={editingProduct.short_description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Descrição Completa</label>
                    <textarea
                      rows={6}
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>URLs das Imagens (uma por linha)</label>
                    <textarea
                      rows={4}
                      value={editingProduct.images.join('\n')}
                      onChange={(e) => setEditingProduct({ ...editingProduct, images: e.target.value.split('\n').filter(url => url.trim()) })}
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                      placeholder="https://exemplo.com/imagem1.jpg&#10;https://exemplo.com/imagem2.jpg"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Peso (kg)</label>
                    <input
                      type="text"
                      value={editingProduct.weight || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={saveProductEdit}
                      className="px-6 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap font-medium shadow-lg"
                    >
                      <i className="ri-save-line"></i>
                      Salvar Alterações
                    </button>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className={`px-6 py-2.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${darkMode ? 'text-white' : 'text-gray-800'} rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap font-medium`}
                    >
                      <i className="ri-close-line"></i>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Histórico de Importações */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="ri-history-line text-primary"></i>
              Histórico de Importações
            </h3>

            {importJobs.length === 0 ? (
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center py-8`}>Nenhuma importação realizada ainda</p>
            ) : (
              <div className="space-y-3">
                {importJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          job.status === 'completed'
                            ? 'bg-green-500/20 text-green-500'
                            : job.status === 'failed'
                            ? 'bg-red-500/20 text-red-500'
                            : job.status === 'running'
                            ? 'bg-blue-500/20 text-blue-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {job.status === 'completed' ? 'Concluído' : job.status === 'failed' ? 'Falhou' : job.status === 'running' ? 'Em execução' : 'Pendente'}
                        </span>
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {job.processed_items} / {job.total_items} produtos
                        </span>
                      </div>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(job.created_at).toLocaleString('pt-PT')}
                      </span>
                    </div>
                    {job.error_message && (
                      <p className="text-sm text-red-500 mt-2">{job.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
