# 🔌 Documentação da Integração WooCommerce

Este documento descreve a arquitetura, endpoints, fluxos de dados e como testar a integração WooCommerce.

---

## 📐 Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE SINCRONIZAÇÃO                        │
└─────────────────────────────────────────────────────────────────┘

1. WORDPRESS/WOOCOMMERCE (Loja Externa)
   ├── REST API: /wp-json/wc/v3/
   ├── Autenticação: Basic Auth (Consumer Key + Secret)
   └── Webhooks: Notificações em tempo real

                    ↓ HTTPS

2. SUPABASE (Backend + Database)
   ├── Tabelas:
   │   ├── integrations_woocommerce (credenciais)
   │   ├── products (produtos sincronizados)
   │   ├── product_mappings (woo_id ↔ local_id)
   │   ├── woocommerce_import_jobs (progresso)
   │   └── woocommerce_webhooks (eventos)
   │
   ├── API Client (src/api/woocommerce.ts):
   │   ├── testWooCommerceConnection()
   │   ├── fetchWooCommerceProducts()
   │   ├── importWooCommerceProducts()
   │   └── checkWooCommerceHealth()
   │
   └── RLS: Apenas admins podem gerenciar

                    ↓ Supabase Client

3. DASHBOARD ADMIN (React/TSX)
   ├── WooCommerceIntegration.tsx
   │   ├── Formulário de conexão
   │   ├── Testar conexão
   │   ├── Preview (50 produtos)
   │   ├── Import wizard
   │   └── Jobs panel
   │
   └── ProductsManagement.tsx
       └── Listar/editar produtos

                    ↓ Supabase Anon Key

4. FRONTEND (GitHub Pages)
   ├── HomePage → FeaturedCarousel
   ├── Busca: featured_items WHERE active = true
   └── Exibe: Até 10 produtos em destaque
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `integrations_woocommerce`

Armazena credenciais e configurações da conexão.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único |
| `store_url` | TEXT | URL da loja (ex: https://loja.com) |
| `consumer_key` | TEXT | Consumer Key do WooCommerce |
| `consumer_secret` | TEXT | Consumer Secret do WooCommerce |
| `api_version` | TEXT | Versão da API (wc/v3) |
| `use_ssl` | BOOLEAN | Usar HTTPS |
| `products_only` | BOOLEAN | Sincronizar apenas produtos |
| `sync_schedule` | TEXT | manual, hourly, daily, weekly |
| `last_sync_at` | TIMESTAMPTZ | Última sincronização |
| `webhook_secret` | TEXT | Secret para validação HMAC |
| `is_active` | BOOLEAN | Conexão ativa |

**RLS:** Apenas admins podem acessar.

---

### Tabela: `product_mappings`

Mapeia produtos WooCommerce ↔ produtos locais.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único |
| `woo_product_id` | BIGINT | ID do produto no WooCommerce |
| `local_product_id` | UUID | ID do produto local (FK: products) |
| `sku` | TEXT | SKU do produto |
| `last_synced_at` | TIMESTAMPTZ | Última sincronização |
| `sync_status` | TEXT | synced, pending, error |
| `sync_error` | TEXT | Mensagem de erro (se houver) |

**RLS:** Admins podem gerenciar, público pode ler.

---

### Tabela: `woocommerce_import_jobs`

Rastreia jobs de importação em batch.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único |
| `status` | TEXT | pending, running, completed, failed |
| `total_items` | INTEGER | Total de produtos |
| `processed_items` | INTEGER | Produtos processados |
| `created_items` | INTEGER | Produtos criados |
| `updated_items` | INTEGER | Produtos atualizados |
| `failed_items` | INTEGER | Produtos com erro |
| `import_mode` | TEXT | preview, full, stock_only |
| `import_options` | JSONB | Opções de importação |
| `error_message` | TEXT | Mensagem de erro |
| `snapshot_id` | UUID | ID do snapshot (para rollback) |
| `started_at` | TIMESTAMPTZ | Início do job |
| `completed_at` | TIMESTAMPTZ | Fim do job |

**RLS:** Apenas admins podem acessar.

---

### Tabela: `woocommerce_webhooks`

Armazena eventos recebidos via webhooks.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único |
| `event_type` | TEXT | product.created, updated, deleted |
| `woo_product_id` | BIGINT | ID do produto no WooCommerce |
| `payload` | JSONB | Dados completos do evento |
| `processed` | BOOLEAN | Evento processado |
| `processed_at` | TIMESTAMPTZ | Data de processamento |
| `error_message` | TEXT | Erro (se houver) |
| `signature` | TEXT | HMAC signature |

**RLS:** Apenas admins podem acessar.

---

## 🔌 API Client (src/api/woocommerce.ts)

### 1. `testWooCommerceConnection(credentials)`

Testa a conexão com o WooCommerce.

**Parâmetros:**
```typescript
{
  store_url: string;        // https://loja.com
  consumer_key: string;     // ck_...
  consumer_secret: string;  // cs_...
  api_version: string;      // wc/v3
  use_ssl: boolean;         // true
  products_only: boolean;   // true
}
```

**Retorno:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    store_url: string;
    api_version: string;
    total_products: number;
    woocommerce_version: string;
  }
}
```

**Exemplo de uso:**
```typescript
const result = await testWooCommerceConnection({
  store_url: 'https://minhaloja.com',
  consumer_key: 'ck_abc123',
  consumer_secret: 'cs_xyz789',
  api_version: 'wc/v3',
  use_ssl: true,
  products_only: true
});

if (result.success) {
  console.log('✅ Conectado!', result.data);
} else {
  console.error('❌ Erro:', result.message);
}
```

---

### 2. `fetchWooCommerceProducts(limit)`

Busca produtos do WooCommerce (preview).

**Parâmetros:**
- `limit` (number): Número máximo de produtos (padrão: 50)

**Retorno:**
```typescript
{
  success: boolean;
  total: number;
  products: Array<{
    id: number;
    name: string;
    slug: string;
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string | null;
    stock: number;
    stock_status: string;
    manage_stock: boolean;
    image: string;
    images: string[];
    category: string;
    categories: string[];
    description: string;
    short_description: string;
    weight: string | null;
    dimensions: object | null;
  }>
}
```

**Exemplo de uso:**
```typescript
const result = await fetchWooCommerceProducts(50);

if (result.success) {
  console.log(`Total: ${result.total} produtos`);
  console.log('Preview:', result.products);
} else {
  console.error('Erro:', result.message);
}
```

---

### 3. `importWooCommerceProducts(mode, options, categoryMapping)`

Importa produtos do WooCommerce para o Supabase.

**Parâmetros:**
```typescript
mode: 'preview' | 'full';  // preview = 50, full = todos

options: {
  update_existing: boolean;   // Atualizar produtos existentes (por SKU)
  create_new: boolean;        // Criar novos produtos
  sync_stock_only: boolean;   // Sincronizar apenas stock
  import_images: boolean;     // Importar imagens
}

categoryMapping: {
  [wooCategory: string]: string;  // Mapear categorias WooCommerce → locais
}
```

**Retorno:**
```typescript
{
  success: boolean;
  job_id: string;
  processed: number;
  created: number;
  updated: number;
  total: number;
  errors: string[];
}
```

**Exemplo de uso:**
```typescript
const result = await importWooCommerceProducts(
  'full',
  {
    update_existing: true,
    create_new: true,
    sync_stock_only: false,
    import_images: true
  },
  {
    'Eletrônicos': 'electronics',
    'Roupas': 'clothing'
  }
);

if (result.success) {
  console.log(`✅ Importação concluída!`);
  console.log(`Processados: ${result.processed}/${result.total}`);
  console.log(`Criados: ${result.created}`);
  console.log(`Atualizados: ${result.updated}`);
} else {
  console.error('❌ Erro:', result.message);
}
```

---

### 4. `checkWooCommerceHealth()`

Verifica a saúde da conexão WooCommerce.

**Retorno:**
```typescript
{
  connected: boolean;
  message: string;
  last_sync?: string;
}
```

**Exemplo de uso:**
```typescript
const health = await checkWooCommerceHealth();

if (health.connected) {
  console.log('✅ Conexão ativa');
  console.log('Última sincronização:', health.last_sync);
} else {
  console.log('❌ Desconectado:', health.message);
}
```

---

## 🧪 Como Testar

### Teste 1: Testar Conexão

**No Dashboard:**
1. Vá em **Integrações → WooCommerce**
2. Preencha os campos de conexão
3. Clique em **Testar Conexão**

**Via cURL:**
```bash
curl -X POST https://SEU_PROJETO.supabase.co/rest/v1/rpc/test_woocommerce_connection \
  -H "apikey: SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "store_url": "https://minhaloja.com",
    "consumer_key": "ck_abc123",
    "consumer_secret": "cs_xyz789",
    "api_version": "wc/v3",
    "use_ssl": true
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "✅ Conexão estabelecida com sucesso!",
  "data": {
    "store_url": "https://minhaloja.com",
    "api_version": "wc/v3",
    "total_products": 42,
    "woocommerce_version": "8.5.2"
  }
}
```

---

### Teste 2: Preview de Produtos

**No Dashboard:**
1. Após conectar, clique em **Preview (50 produtos)**
2. Deve aparecer uma tabela com os produtos

**Via API:**
```typescript
const result = await fetchWooCommerceProducts(10);
console.log(result.products);
```

**Resultado esperado:**
```json
{
  "success": true,
  "total": 42,
  "products": [
    {
      "id": 123,
      "name": "Produto Exemplo",
      "sku": "PROD-001",
      "price": "29.99",
      "stock": 10,
      "image": "https://loja.com/wp-content/uploads/produto.jpg",
      "category": "Eletrônicos"
    }
  ]
}
```

---

### Teste 3: Importar Produtos

**No Dashboard:**
1. Configure as opções de importação
2. Clique em **Importar Todos**
3. Acompanhe o progresso no painel de jobs

**Via API:**
```typescript
const result = await importWooCommerceProducts('preview', {
  update_existing: true,
  create_new: true,
  sync_stock_only: false,
  import_images: true
});

console.log(`Criados: ${result.created}`);
console.log(`Atualizados: ${result.updated}`);
```

**Verificar no Supabase:**
```sql
-- Ver produtos importados
SELECT p.*, pm.woo_product_id, pm.last_synced_at
FROM products p
JOIN product_mappings pm ON pm.local_product_id = p.id
ORDER BY pm.last_synced_at DESC
LIMIT 10;

-- Ver jobs de importação
SELECT * FROM woocommerce_import_jobs
ORDER BY created_at DESC
LIMIT 5;
```

---

### Teste 4: Webhooks (Opcional)

**Configurar webhook no WooCommerce:**
1. Vá em **WooCommerce → Configurações → Avançado → Webhooks**
2. Adicione webhook:
   - **Tópico:** Produto atualizado
   - **URL:** `https://SEU_PROJETO.supabase.co/functions/v1/woocommerce-webhook`
   - **Secret:** `whs_abc123`

**Testar webhook:**
1. Edite um produto no WooCommerce
2. Salve as alterações
3. Verifique no Supabase:

```sql
SELECT * FROM woocommerce_webhooks
ORDER BY created_at DESC
LIMIT 5;
```

**Payload esperado:**
```json
{
  "id": "webhook_123",
  "event_type": "product.updated",
  "woo_product_id": 123,
  "payload": {
    "id": 123,
    "name": "Produto Atualizado",
    "price": "39.99",
    "stock_quantity": 5
  },
  "processed": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## 🔄 Fluxos de Sincronização

### Fluxo 1: Sincronização Manual (Preview + Import)

```
1. Admin acessa Dashboard → WooCommerce
2. Clica em "Preview (50 produtos)"
   └── fetchWooCommerceProducts(50)
   └── Exibe tabela com produtos
3. Admin clica em "Importar Todos"
   └── importWooCommerceProducts('full', options)
   └── Cria job de importação
   └── Processa produtos em batch (20 por vez)
   └── Cria/atualiza produtos no Supabase
   └── Cria mapeamentos (woo_id ↔ local_id)
4. Admin vê progresso no painel de jobs
5. Produtos aparecem na homepage automaticamente
```

---

### Fluxo 2: Sincronização Automática (Webhooks)

```
1. Produto é criado/atualizado no WooCommerce
2. WooCommerce envia webhook para Supabase
   └── POST /functions/v1/woocommerce-webhook
   └── Valida HMAC signature
   └── Salva evento na tabela woocommerce_webhooks
3. Worker processa webhook
   └── Busca produto no WooCommerce
   └── Atualiza produto local
   └── Atualiza mapeamento
4. Produto atualizado aparece na homepage em <60s
```

---

### Fluxo 3: Sincronização Agendada (Hourly/Daily)

```
1. Cron job executa a cada hora/dia
2. Busca produtos modificados desde última sincronização
   └── GET /wp-json/wc/v3/products?modified_after=...
3. Atualiza apenas produtos alterados
4. Registra log de sincronização
5. Atualiza last_sync_at
```

---

## 📊 Monitoramento

### Estatísticas de Sincronização

```sql
-- Ver estatísticas gerais
SELECT * FROM woocommerce_sync_stats;

-- Ver produtos com erro
SELECT * FROM woocommerce_sync_errors;

-- Ver últimos jobs
SELECT
  id,
  status,
  processed_items || '/' || total_items as progress,
  created_items,
  updated_items,
  failed_items,
  created_at
FROM woocommerce_import_jobs
ORDER BY created_at DESC
LIMIT 10;

-- Ver webhooks pendentes
SELECT COUNT(*) as pending_webhooks
FROM woocommerce_webhooks
WHERE processed = false;
```

---

### Limpeza de Dados Antigos

```sql
-- Limpar webhooks antigos (>30 dias)
SELECT cleanup_old_webhooks();

-- Limpar logs antigos (>90 dias)
SELECT cleanup_old_sync_logs();

-- Ver produtos que precisam de sincronização
SELECT * FROM get_products_needing_sync(24); -- últimas 24h
```

---

## 🔒 Segurança

### Credenciais

- ✅ Consumer Key e Secret são armazenados no Supabase (backend)
- ✅ Nunca expostos no frontend
- ✅ RLS garante que apenas admins podem acessar
- ❌ NUNCA commit credenciais no Git

### Webhooks

- ✅ Validação HMAC de todas as requisições
- ✅ Secret armazenado no Supabase
- ✅ Rejeita webhooks com signature inválida
- ✅ Rate limiting para prevenir abuse

### API

- ✅ Todas as requisições usam HTTPS
- ✅ Basic Auth com Consumer Key + Secret
- ✅ Timeout de 30s para prevenir travamentos
- ✅ Retry com backoff exponencial

---

## 🐛 Troubleshooting

### Problema: "Conexão falhou"

**Verificar:**
1. URL da loja está correta (com https://)
2. Permalinks configurados no WordPress
3. WooCommerce instalado e ativo
4. Chaves válidas e com permissões corretas

**Logs:**
```sql
SELECT * FROM woocommerce_sync_logs
WHERE log_level = 'error'
ORDER BY created_at DESC
LIMIT 10;
```

---

### Problema: "Produtos não aparecem na homepage"

**Verificar:**
1. Produtos foram importados com sucesso
2. Produtos estão marcados como `is_published = true`
3. Produtos estão na tabela `featured_items`

**Query:**
```sql
-- Ver produtos importados
SELECT COUNT(*) FROM products
WHERE id IN (SELECT local_product_id FROM product_mappings);

-- Ver produtos em destaque
SELECT COUNT(*) FROM featured_items WHERE active = true;
```

**Solução:**
```sql
-- Adicionar produtos importados aos destaques
INSERT INTO featured_items (title, description, price, image_url, active, priority)
SELECT
  p.title,
  p.short_description,
  p.price,
  p.images[1],
  true,
  1
FROM products p
JOIN product_mappings pm ON pm.local_product_id = p.id
WHERE p.is_published = true
LIMIT 10;
```

---

### Problema: "Webhooks não funcionam"

**Verificar:**
1. URL do webhook está correta
2. Secret configurado corretamente
3. Webhook está ativo no WooCommerce

**Testar manualmente:**
```bash
curl -X POST https://SEU_PROJETO.supabase.co/functions/v1/woocommerce-webhook \
  -H "Content-Type: application/json" \
  -H "X-WC-Webhook-Signature: HMAC_SIGNATURE" \
  -d '{
    "id": 123,
    "name": "Produto Teste",
    "price": "29.99"
  }'
```

---

## 📈 Performance

### Otimizações Implementadas

- ✅ **Batch processing:** 20 produtos por vez
- ✅ **Índices:** Em todas as colunas de busca
- ✅ **Cache:** Produtos em destaque cacheados no frontend
- ✅ **Lazy loading:** Imagens carregadas sob demanda
- ✅ **Retry logic:** Tentativas automáticas em caso de erro

### Métricas Esperadas

| Operação | Tempo Esperado |
|----------|----------------|
| Testar conexão | <2s |
| Preview 50 produtos | <5s |
| Importar 100 produtos | <30s |
| Importar 1000 produtos | <5min |
| Processar webhook | <1s |
| Carregar homepage | <2s |

---

## 🎯 Checklist de Aceitação

Após implementar, verifique:

- [ ] ✅ Conexão com WooCommerce funciona
- [ ] ✅ Preview de produtos exibe corretamente
- [ ] ✅ Importação cria produtos no Supabase
- [ ] ✅ Mapeamentos (woo_id ↔ local_id) criados
- [ ] ✅ Jobs de importação rastreados
- [ ] ✅ Produtos aparecem na homepage
- [ ] ✅ Carousel funciona com autoplay
- [ ] ✅ Webhooks recebem eventos (opcional)
- [ ] ✅ Sincronização automática funciona (opcional)
- [ ] ✅ RLS protege dados sensíveis
- [ ] ✅ Credenciais não expostas no frontend
- [ ] ✅ Logs de erro registrados
- [ ] ✅ Performance adequada (<5s para 100 produtos)

---

**Tudo pronto!** 🎉

Agora você tem uma integração WooCommerce completa, segura e pronta para produção.
