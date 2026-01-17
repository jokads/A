// API Client para WooCommerce - Otimizado para GitHub Pages + InfinityFree

import { supabase } from '../lib/supabase';

const WOOCOMMERCE_API_BASE = '/api/integrations/woocommerce';

interface WooCredentials {
  store_url: string;
  consumer_key: string;
  consumer_secret: string;
  api_version: string;
  use_ssl: boolean;
  products_only: boolean;
}

// ✅ ADICIONAR INTERFACE PARA CREDENCIAIS DO TESTE DE CONEXÃO
interface WooCommerceCredentials {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  apiVersion: string;
  useSsl: boolean;
}

// ✅ ADICIONAR INTERFACE PARA RESULTADO DO TESTE
interface WooCommerceTestResult {
  success: boolean;
  message: string;
  data?: {
    totalProducts: number;
    wooVersion: string;
    apiVersion: string;
    storeUrl: string;
  };
}

interface ImportOptions {
  update_existing: boolean;
  create_new: boolean;
  sync_stock_only: boolean;
  import_images: boolean;
}

interface WooProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number;
  stock_status: string;
  manage_stock: boolean;
  images: Array<{ src: string; alt: string }>;
  categories: Array<{ id: number; name: string }>;
  tags: Array<{ id: number; name: string }>;
  description: string;
  short_description: string;
  weight: string;
  dimensions: any;
  variations: number[];
  attributes: any[];
}

/**
 * Normalizar URL da loja (remover trailing slash, garantir protocolo)
 */
function normalizeStoreUrl(url: string, useSSL: boolean): string {
  let normalized = url.trim().replace(/\/+$/, ''); // Remove trailing slashes
  
  // Adicionar protocolo se não existir
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `${useSSL ? 'https' : 'http'}://${normalized}`;
  }
  
  // Forçar HTTPS se useSSL for true
  if (useSSL && normalized.startsWith('http://')) {
    normalized = normalized.replace('http://', 'https://');
  }
  
  return normalized;
}

/**
 * Criar header de autenticação Basic Auth
 */
function createAuthHeader(consumerKey: string, consumerSecret: string): string {
  return `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`;
}

/**
 * Fazer requisição ao WooCommerce com retry e timeout
 */
async function fetchWooCommerce(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  } = {},
  timeout: number = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Timeout: O servidor demorou muito a responder. Verifique sua conexão ou tente novamente.');
    }
    
    throw error;
  }
}

/**
 * Testa a conexão com a API WooCommerce
 */
export async function testWooCommerceConnection(
  credentials: WooCommerceCredentials
): Promise<WooCommerceTestResult> {
  try {
    const { storeUrl, consumerKey, consumerSecret, apiVersion, useSsl } = credentials;

    // Validar campos obrigatórios
    if (!storeUrl || !consumerKey || !consumerSecret) {
      return {
        success: false,
        message: '❌ Preencha todos os campos obrigatórios (URL, Consumer Key e Consumer Secret)',
      };
    }

    // Normalizar URL
    let normalizedUrl = storeUrl.trim();
    
    // Remover barra final
    if (normalizedUrl.endsWith('/')) {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }

    // Adicionar protocolo se não tiver
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = useSsl ? `https://${normalizedUrl}` : `http://${normalizedUrl}`;
    }

    // Forçar HTTP se useSsl = false
    if (!useSsl && normalizedUrl.startsWith('https://')) {
      normalizedUrl = normalizedUrl.replace('https://', 'http://');
    }

    // Forçar HTTPS se useSsl = true
    if (useSsl && normalizedUrl.startsWith('http://')) {
      normalizedUrl = normalizedUrl.replace('http://', 'https://');
    }

    console.log('🔍 Testando conexão:', {
      url: normalizedUrl,
      ssl: useSsl,
      apiVersion: apiVersion || 'wc/v3'
    });

    // PASSO 1: Verificar se o site está online
    try {
      console.log('📡 Verificando se o site está acessível...');
      const siteCheckResponse = await fetchWooCommerce(
        normalizedUrl,
        {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/json',
          }
        },
        10000 // 10s timeout
      );

      if (!siteCheckResponse.ok) {
        return {
          success: false,
          message: `❌ Site retornou erro ${siteCheckResponse.status}

🔍 Diagnóstico:
• O domínio existe mas retornou erro
• Pode estar em manutenção ou com problemas

✅ Soluções:
1. Abra ${normalizedUrl} no navegador e veja o que aparece
2. Verifique o painel do InfinityFree se a conta está ativa
3. Aguarde alguns minutos e tente novamente
4. Verifique se o WordPress foi instalado corretamente`,
        };
      }

      console.log('✅ Site está acessível');
    } catch (siteError: any) {
      console.error('❌ Site não está acessível:', siteError);
      
      return {
        success: false,
        message: `❌ Não foi possível aceder a ${normalizedUrl}

🔍 Possíveis causas:
1. ⚠️ Site ainda não foi configurado no InfinityFree
2. ⚠️ WordPress não foi instalado
3. ⚠️ Domínio não está a apontar corretamente
4. ⚠️ Conta InfinityFree suspensa ou inativa
5. ⚠️ DNS ainda não propagou (pode demorar até 48h)

✅ Soluções:
1. Aceda ao painel InfinityFree e verifique se a conta está ativa
2. Abra ${normalizedUrl} no navegador - deve aparecer o WordPress
3. Se aparecer página em branco, instale o WordPress via Softaculous
4. Aguarde a propagação do DNS (pode demorar até 48h)
5. Tente usar HTTP em vez de HTTPS (desmarque "Usar SSL")

📚 Precisa de ajuda? Consulte: WORDPRESS_INFINITYFREE_SETUP.md`,
      };
    }

    // PASSO 2: Verificar se a API REST está ativa
    const wpJsonUrl = `${normalizedUrl}/wp-json/`;
    console.log('🔍 Verificando API REST:', wpJsonUrl);

    try {
      const wpJsonResponse = await fetchWooCommerce(
        wpJsonUrl,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        },
        10000
      );

      if (!wpJsonResponse.ok) {
        return {
          success: false,
          message: `❌ API REST não está acessível (erro ${wpJsonResponse.status})

🔍 Diagnóstico:
• WordPress está instalado mas a API REST não funciona
• Pode ser problema de permalinks ou .htaccess

✅ Soluções:
1. No WordPress admin, vá em Definições → Permalinks
2. Selecione "Nome do artigo"
3. Clique em "Guardar alterações"
4. Tente novamente

Se o erro persistir:
• Verifique se o ficheiro .htaccess existe na raiz do WordPress
• Confirme que mod_rewrite está ativo no servidor`,
        };
      }

      const wpJsonData = await wpJsonResponse.json();
      console.log('✅ API REST está ativa:', wpJsonData);

      // Verificar se WooCommerce está instalado
      if (!wpJsonData.namespaces || !wpJsonData.namespaces.includes('wc/v3')) {
        return {
          success: false,
          message: `❌ WooCommerce não está instalado ou ativo

🔍 Diagnóstico:
• WordPress está funcional
• API REST está ativa
• Mas WooCommerce não foi detetado

✅ Soluções:
1. No WordPress admin, vá em Plugins
2. Procure por "WooCommerce"
3. Clique em "Instalar Agora"
4. Clique em "Ativar"
5. Tente novamente

Namespaces detetados: ${wpJsonData.namespaces?.join(', ') || 'nenhum'}`,
        };
      }

      console.log('✅ WooCommerce está instalado');
    } catch (wpJsonError: any) {
      console.error('❌ Erro ao verificar API REST:', wpJsonError);
      
      return {
        success: false,
        message: `❌ API REST não responde

🔍 Possíveis causas:
1. Permalinks não estão configurados
2. Ficheiro .htaccess com problemas
3. mod_rewrite não está ativo

✅ Soluções:
1. Aceda ao WordPress admin: ${normalizedUrl}/wp-admin
2. Vá em Definições → Permalinks
3. Selecione "Nome do artigo"
4. Clique em "Guardar alterações"
5. Tente novamente

Erro técnico: ${wpJsonError.message}`,
      };
    }

    // PASSO 3: Testar credenciais WooCommerce
    const version = apiVersion || 'wc/v3';
    const testUrl = `${normalizedUrl}/wp-json/${version}/products`;
    
    console.log('🔍 Testando credenciais WooCommerce:', testUrl);

    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    
    const response = await fetchWooCommerce(
      `${testUrl}?per_page=1`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        }
      },
      15000
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na autenticação:', response.status, errorText);

      if (response.status === 401) {
        return {
          success: false,
          message: `❌ Credenciais inválidas (erro 401)

🔍 Diagnóstico:
• Consumer Key ou Consumer Secret estão incorretos
• Ou as chaves foram revogadas

✅ Soluções:
1. No WordPress admin, vá em WooCommerce → Definições → Avançado → REST API
2. Verifique se a chave existe e está ativa
3. Se necessário, crie uma nova chave:
   - Clique em "Adicionar chave"
   - Descrição: "Integração GitHub Pages"
   - Permissões: "Leitura/Escrita"
   - Clique em "Gerar chave API"
4. Copie as novas chaves e cole aqui
5. Tente novamente`,
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          message: `❌ Endpoint não encontrado (erro 404)

🔍 Diagnóstico:
• A versão da API "${version}" não existe
• Ou os permalinks não estão configurados

✅ Soluções:
1. Tente mudar a versão da API para "wc/v3"
2. Verifique os permalinks (Definições → Permalinks → Nome do artigo)
3. Tente novamente`,
        };
      }

      return {
        success: false,
        message: `❌ Erro ao conectar (${response.status})

Detalhes: ${errorText.substring(0, 200)}

✅ Verifique:
• Consumer Key e Consumer Secret estão corretos
• Permissões da chave estão em "Leitura/Escrita"
• Permalinks configurados como "Nome do artigo"`,
      };
    }

    const data = await response.json();
    console.log('✅ Conexão bem-sucedida!', data);

    // Obter informações adicionais
    let totalProducts = 0;
    let wooVersion = 'Desconhecido';

    try {
      const systemStatusUrl = `${normalizedUrl}/wp-json/${version}/system_status`;
      const systemResponse = await fetchWooCommerce(
        systemStatusUrl,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
          }
        },
        10000
      );

      if (systemResponse.ok) {
        const systemData = await systemResponse.json();
        wooVersion = systemData.environment?.version || 'Desconhecido';
      }
    } catch (e) {
      console.warn('Não foi possível obter versão do WooCommerce');
    }

    // Contar produtos
    try {
      const countUrl = `${normalizedUrl}/wp-json/${version}/products`;
      const countResponse = await fetchWooCommerce(
        `${countUrl}?per_page=1`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
          }
        },
        10000
      );

      if (countResponse.ok) {
        const totalHeader = countResponse.headers.get('X-WP-Total');
        totalProducts = totalHeader ? parseInt(totalHeader, 10) : 0;
      }
    } catch (e) {
      console.warn('Não foi possível contar produtos');
    }

    return {
      success: true,
      message: '✅ Conexão estabelecida com sucesso!',
      data: {
        totalProducts,
        wooVersion,
        apiVersion: version,
        storeUrl: normalizedUrl,
      },
    };

  } catch (error: any) {
    console.error('❌ Erro inesperado:', error);
    
    return {
      success: false,
      message: `❌ Erro inesperado ao testar conexão

Detalhes: ${error.message}

✅ Tente:
1. Verificar se o site está online: abra no navegador
2. Verificar se o WordPress está instalado
3. Verificar se o WooCommerce está ativo
4. Aguardar alguns minutos e tentar novamente`,
    };
  }
}

/**
 * Buscar produtos do WooCommerce diretamente (sem Supabase)
 * Otimizado para InfinityFree (cache + retry)
 */
export async function fetchWooCommerceProductsDirect(
  credentials: WooCredentials,
  limit: number = 50,
  page: number = 1
) {
  try {
    const storeUrl = normalizeStoreUrl(credentials.store_url, credentials.use_ssl);
    const url = `${storeUrl}/wp-json/${credentials.api_version}/products?per_page=${limit}&page=${page}&status=publish&orderby=date&order=desc`;
    const auth = createAuthHeader(credentials.consumer_key, credentials.consumer_secret);
    
    console.log(`🔍 Buscando produtos (página ${page}, limite ${limit})...`);
    
    const response = await fetchWooCommerce(url, {
      method: 'GET',
      headers: {
        'Authorization': auth
      }
    }, 20000); // 20s timeout para InfinityFree

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const products: WooProduct[] = await response.json();
    const totalProducts = parseInt(response.headers.get('X-WP-Total') || '0');
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    
    console.log(`✅ ${products.length} produtos carregados (${totalProducts} total)`);
    
    // Mapear produtos para formato interno
    return {
      success: true,
      total: totalProducts,
      total_pages: totalPages,
      current_page: page,
      products: products.map((p: WooProduct) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku || `woo-${p.id}`,
        price: p.price || p.regular_price || '0',
        regular_price: p.regular_price || '0',
        sale_price: p.sale_price || null,
        stock: p.stock_quantity || 0,
        stock_status: p.stock_status,
        manage_stock: p.manage_stock,
        image: p.images?.[0]?.src || '',
        images: p.images?.map((img) => img.src) || [],
        category: p.categories?.[0]?.name || 'Sem categoria',
        categories: p.categories?.map((cat) => cat.name) || [],
        description: p.description || '',
        short_description: p.short_description || '',
        weight: p.weight || null,
        dimensions: p.dimensions || null,
        variations: p.variations || [],
        attributes: p.attributes || [],
        tags: p.tags?.map((tag) => tag.name) || []
      }))
    };
  } catch (error: any) {
    console.error('❌ Erro ao buscar produtos:', error);
    return {
      success: false,
      message: error.message || 'Erro ao buscar produtos',
      products: []
    };
  }
}

/**
 * Buscar produtos do WooCommerce (preview) - Mantém compatibilidade com código existente
 */
export async function fetchWooCommerceProducts(limit: number = 50) {
  try {
    // Buscar credenciais do Supabase
    const { data: config, error } = await supabase
      .from('integrations_woocommerce')
      .select('*')
      .maybeSingle();

    if (error || !config) {
      throw new Error('Configuração WooCommerce não encontrada. Por favor, conecte primeiro.');
    }

    const credentials: WooCredentials = {
      store_url: config.store_url,
      consumer_key: config.consumer_key,
      consumer_secret: config.consumer_secret,
      api_version: config.api_version || 'wc/v3',
      use_ssl: config.use_ssl ?? true,
      products_only: config.products_only ?? true
    };

    return await fetchWooCommerceProductsDirect(credentials, limit);
  } catch (error: any) {
    console.error('Erro ao buscar produtos:', error);
    return {
      success: false,
      message: error.message || 'Erro ao buscar produtos',
      products: []
    };
  }
}

/**
 * Criar produto no WooCommerce
 */
export async function createWooCommerceProduct(
  credentials: WooCredentials,
  productData: {
    name: string;
    sku: string;
    regular_price: string;
    description?: string;
    short_description?: string;
    categories?: Array<{ id: number }>;
    images?: Array<{ src: string }>;
    stock_quantity?: number;
    manage_stock?: boolean;
  }
) {
  try {
    const storeUrl = normalizeStoreUrl(credentials.store_url, credentials.use_ssl);
    const url = `${storeUrl}/wp-json/${credentials.api_version}/products`;
    const auth = createAuthHeader(credentials.consumer_key, credentials.consumer_secret);
    
    console.log('🔍 Criando produto:', productData.name);
    
    const response = await fetchWooCommerce(url, {
      method: 'POST',
      headers: {
        'Authorization': auth
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro ${response.status}`);
    }

    const product = await response.json();
    console.log('✅ Produto criado com sucesso! ID:', product.id);
    
    return {
      success: true,
      product
    };
  } catch (error: any) {
    console.error('❌ Erro ao criar produto:', error);
    return {
      success: false,
      message: error.message || 'Erro ao criar produto'
    };
  }
}

/**
 * Atualizar produto no WooCommerce
 */
export async function updateWooCommerceProduct(
  credentials: WooCredentials,
  productId: number,
  productData: Partial<{
    name: string;
    sku: string;
    regular_price: string;
    sale_price: string;
    description: string;
    short_description: string;
    stock_quantity: number;
    manage_stock: boolean;
    images: Array<{ src: string }>;
  }>
) {
  try {
    const storeUrl = normalizeStoreUrl(credentials.store_url, credentials.use_ssl);
    const url = `${storeUrl}/wp-json/${credentials.api_version}/products/${productId}`;
    const auth = createAuthHeader(credentials.consumer_key, credentials.consumer_secret);
    
    console.log('🔍 Atualizando produto ID:', productId);
    
    const response = await fetchWooCommerce(url, {
      method: 'PUT',
      headers: {
        'Authorization': auth
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro ${response.status}`);
    }

    const product = await response.json();
    console.log('✅ Produto atualizado com sucesso!');
    
    return {
      success: true,
      product
    };
  } catch (error: any) {
    console.error('❌ Erro ao atualizar produto:', error);
    return {
      success: false,
      message: error.message || 'Erro ao atualizar produto'
    };
  }
}

/**
 * Deletar produto no WooCommerce
 */
export async function deleteWooCommerceProduct(
  credentials: WooCredentials,
  productId: number,
  force: boolean = false
) {
  try {
    const storeUrl = normalizeStoreUrl(credentials.store_url, credentials.use_ssl);
    const url = `${storeUrl}/wp-json/${credentials.api_version}/products/${productId}?force=${force}`;
    const auth = createAuthHeader(credentials.consumer_key, credentials.consumer_secret);
    
    console.log('🔍 Deletando produto ID:', productId);
    
    const response = await fetchWooCommerce(url, {
      method: 'DELETE',
      headers: {
        'Authorization': auth
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro ${response.status}`);
    }

    console.log('✅ Produto deletado com sucesso!');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('❌ Erro ao deletar produto:', error);
    return {
      success: false,
      message: error.message || 'Erro ao deletar produto'
    };
  }
}

/**
 * Atualizar apenas stock de um produto
 */
export async function updateWooCommerceStock(
  credentials: WooCredentials,
  productId: number,
  stockQuantity: number
) {
  return updateWooCommerceProduct(credentials, productId, {
    stock_quantity: stockQuantity,
    manage_stock: true
  });
}

/**
 * Atualizar apenas preço de um produto
 */
export async function updateWooCommercePrice(
  credentials: WooCredentials,
  productId: number,
  regularPrice: string,
  salePrice?: string
) {
  return updateWooCommerceProduct(credentials, productId, {
    regular_price: regularPrice,
    sale_price: salePrice
  });
}

/**
 * Importar produtos do WooCommerce
 */
export async function importWooCommerceProducts(
  mode: 'preview' | 'full',
  options: ImportOptions,
  categoryMapping: Record<string, string> = {}
) {
  try {
    // Criar job de importação
    const { data: job, error: jobError } = await supabase
      .from('woocommerce_import_jobs')
      .insert({
        status: 'pending',
        total_items: 0,
        processed_items: 0
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Buscar produtos
    const limit = mode === 'preview' ? 50 : 1000;
    const result = await fetchWooCommerceProducts(limit);
    
    if (!result.success) {
      throw new Error(result.message);
    }

    // Atualizar job com total de items
    await supabase
      .from('woocommerce_import_jobs')
      .update({
        status: 'running',
        total_items: result.products.length
      })
      .eq('id', job.id);

    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    // Processar cada produto
    for (const product of result.products) {
      try {
        // Verificar se produto já existe (por SKU)
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('sku', product.sku)
          .maybeSingle();

        if (existing && options.update_existing) {
          // Atualizar produto existente
          const updateData: any = {
            title: product.name,
            updated_at: new Date().toISOString()
          };

          if (options.sync_stock_only) {
            // Apenas atualizar stock
            updateData.stock = product.stock || 0;
          } else {
            // Atualização completa
            updateData.description = product.description;
            updateData.price = parseFloat(product.price) || 0;
            updateData.stock = product.stock || 0;
            updateData.weight = product.weight;
            updateData.dimensions = product.dimensions;
            
            if (options.import_images && product.images.length > 0) {
              updateData.images = product.images;
            }
          }

          const { error: updateError } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', existing.id);

          if (updateError) throw updateError;

          // Atualizar mapeamento
          await supabase
            .from('product_mappings')
            .upsert({
              woo_product_id: product.id,
              local_product_id: existing.id,
              sku: product.sku,
              last_synced_at: new Date().toISOString()
            });

          updatedCount++;

        } else if (!existing && options.create_new) {
          // Criar novo produto
          const { data: newProduct, error: createError } = await supabase
            .from('products')
            .insert({
              title: product.name,
              description: product.description,
              sku: product.sku,
              price: parseFloat(product.price) || 0,
              stock: product.stock || 0,
              weight: product.weight,
              dimensions: product.dimensions,
              images: options.import_images ? product.images : [],
              is_active: true,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) throw createError;

          if (newProduct) {
            // Criar mapeamento
            await supabase
              .from('product_mappings')
              .insert({
                woo_product_id: product.id,
                local_product_id: newProduct.id,
                sku: product.sku,
                last_synced_at: new Date().toISOString()
              });

            createdCount++;
          }
        }

        processedCount++;

        // Atualizar progresso do job a cada 10 produtos
        if (processedCount % 10 === 0) {
          await supabase
            .from('woocommerce_import_jobs')
            .update({ processed_items: processedCount })
            .eq('id', job.id);
        }

      } catch (error: any) {
        console.error(`Erro ao processar produto ${product.sku}:`, error);
        errors.push(`${product.sku}: ${error.message}`);
      }
    }

    // Finalizar job
    await supabase
      .from('woocommerce_import_jobs')
      .update({
        status: errors.length > 0 && processedCount === 0 ? 'failed' : 'completed',
        processed_items: processedCount,
        completed_at: new Date().toISOString(),
        error_message: errors.length > 0 ? errors.slice(0, 5).join('; ') : null
      })
      .eq('id', job.id);

    // Atualizar último sync
    await supabase
      .from('integrations_woocommerce')
      .update({ last_sync_at: new Date().toISOString() })
      .limit(1);

    // Salvar no localStorage para debug panel
    localStorage.setItem('last_woo_sync', JSON.stringify({
      timestamp: new Date().toISOString(),
      processed: processedCount,
      created: createdCount,
      updated: updatedCount,
      errors: errors.length
    }));

    return {
      success: true,
      job_id: job.id,
      processed: processedCount,
      created: createdCount,
      updated: updatedCount,
      total: result.products.length,
      errors
    };

  } catch (error: any) {
    console.error('Erro ao importar produtos:', error);
    return {
      success: false,
      message: error.message || 'Erro ao importar produtos'
    };
  }
}

/**
 * Buscar status de um job de importação
 */
export async function getImportJobStatus(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('woocommerce_import_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw error;

    return {
      success: true,
      job: data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Erro ao buscar status do job'
    };
  }
}

/**
 * Verificar saúde da conexão WooCommerce
 */
export async function checkWooCommerceHealth() {
  try {
    const { data: config, error } = await supabase
      .from('integrations_woocommerce')
      .select('*')
      .maybeSingle();

    if (error || !config) {
      return {
        connected: false,
        message: 'Não conectado'
      };
    }

    const storeUrl = normalizeStoreUrl(config.store_url, config.use_ssl);
    const url = `${storeUrl}/wp-json/`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    return {
      connected: response.ok,
      message: response.ok ? 'Conectado' : 'Erro de conexão',
      last_sync: config.last_sync_at
    };
  } catch (error) {
    return {
      connected: false,
      message: 'Erro ao verificar conexão'
    };
  }
}

export default {
  testWooCommerceConnection,
  fetchWooCommerceProducts,
  importWooCommerceProducts,
  getImportJobStatus,
  checkWooCommerceHealth
};
