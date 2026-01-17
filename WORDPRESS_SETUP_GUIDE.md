# 📘 Guia de Configuração WordPress/WooCommerce

Este guia explica como configurar o WordPress e WooCommerce para integração com o seu site estático no GitHub Pages.

---

## 📋 Pré-requisitos

- ✅ WordPress instalado e funcionando
- ✅ WooCommerce plugin instalado e ativo
- ✅ Acesso ao painel de administração do WordPress
- ✅ Domínio com SSL/HTTPS (recomendado)

---

## 🔧 Passo 1: Configurar Permalinks

**Por que é importante:** A API REST do WordPress só funciona com permalinks "bonitos" ativados.

### Como configurar:

1. Acesse o painel do WordPress
2. Vá em **Configurações → Permalinks**
3. Selecione qualquer opção **EXCETO "Simples"**
4. Recomendado: **Nome do post** ou **Estrutura personalizada**
5. Clique em **Salvar alterações**

### Verificar se funcionou:

Acesse no navegador:
```
https://sua-loja.com/wp-json/
```

Deve retornar um JSON com informações da API. Se retornar erro 404, os permalinks não estão configurados corretamente.

---

## 🔑 Passo 2: Gerar Chaves de API do WooCommerce

### Como gerar:

1. Acesse o painel do WordPress
2. Vá em **WooCommerce → Configurações**
3. Clique na aba **Avançado**
4. Clique em **REST API**
5. Clique em **Adicionar chave**

### Configurações da chave:

| Campo | Valor |
|-------|-------|
| **Descrição** | Integração Site Estático |
| **Utilizador** | Selecione um administrador |
| **Permissões** | **Leitura/Escrita** |

6. Clique em **Gerar chave API**

### ⚠️ IMPORTANTE:

Após gerar, você verá:
- **Consumer Key** (começa com `ck_`)
- **Consumer Secret** (começa com `cs_`)

**COPIE E GUARDE ESTAS CHAVES IMEDIATAMENTE!** Elas só são mostradas uma vez.

---

## 🔒 Passo 3: Configurar SSL (HTTPS)

### Por que é importante:

O WooCommerce requer HTTPS para autenticação segura via REST API.

### Como verificar:

1. Acesse sua loja no navegador
2. Verifique se o URL começa com `https://` (não `http://`)
3. Deve aparecer um cadeado 🔒 na barra de endereço

### Se não tiver SSL:

**Opção 1: Let's Encrypt (Grátis)**
- A maioria dos hosts oferece SSL grátis via Let's Encrypt
- Ative no painel do seu host (cPanel, Plesk, etc)

**Opção 2: Cloudflare (Grátis)**
- Crie conta no [Cloudflare](https://cloudflare.com)
- Adicione seu domínio
- Ative SSL/TLS → Flexível ou Completo

**Opção 3: Plugin WordPress**
- Instale o plugin **Really Simple SSL**
- Ative e configure automaticamente

---

## 🌐 Passo 4: Testar a API REST

### Teste 1: API WordPress

Acesse no navegador:
```
https://sua-loja.com/wp-json/
```

**Resposta esperada:**
```json
{
  "name": "Nome da Sua Loja",
  "description": "Descrição",
  "url": "https://sua-loja.com",
  "namespaces": [
    "oembed/1.0",
    "wp/v2",
    "wc/v1",
    "wc/v2",
    "wc/v3"
  ]
}
```

✅ Se aparecer `"wc/v3"` nos namespaces, o WooCommerce está ativo!

### Teste 2: API WooCommerce (com autenticação)

**No terminal (Linux/Mac):**
```bash
curl -u "ck_SEU_CONSUMER_KEY:cs_SEU_CONSUMER_SECRET" \
  https://sua-loja.com/wp-json/wc/v3/products?per_page=1
```

**No PowerShell (Windows):**
```powershell
$headers = @{
  Authorization = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("ck_SEU_CONSUMER_KEY:cs_SEU_CONSUMER_SECRET"))
}
Invoke-RestMethod -Uri "https://sua-loja.com/wp-json/wc/v3/products?per_page=1" -Headers $headers
```

**Resposta esperada:**
```json
[
  {
    "id": 123,
    "name": "Nome do Produto",
    "price": "29.99",
    "stock_quantity": 10,
    ...
  }
]
```

### Possíveis erros:

| Erro | Causa | Solução |
|------|-------|---------|
| **404 Not Found** | Permalinks não configurados | Vá em Configurações → Permalinks e salve novamente |
| **401 Unauthorized** | Chaves inválidas | Gere novas chaves no WooCommerce |
| **403 Forbidden** | Permissões insuficientes | Certifique-se que as chaves têm permissão "Leitura/Escrita" |
| **SSL Error** | Certificado inválido | Configure SSL corretamente ou use Cloudflare |

---

## 🪝 Passo 5: Configurar Webhooks (Opcional mas Recomendado)

Webhooks permitem que o WooCommerce notifique automaticamente seu site quando produtos são criados/atualizados/deletados.

### Como configurar:

1. Acesse **WooCommerce → Configurações → Avançado → Webhooks**
2. Clique em **Adicionar webhook**

### Configurações do webhook:

| Campo | Valor |
|-------|-------|
| **Nome** | Sincronização de Produtos |
| **Status** | Ativo |
| **Tópico** | Produto atualizado |
| **URL de entrega** | `https://SEU_PROJETO.supabase.co/functions/v1/woocommerce-webhook` |
| **Secret** | Gere um secret aleatório (ex: `whs_abc123xyz`) |
| **Versão da API** | WP REST API Integration v3 |

3. Clique em **Salvar webhook**

### Webhooks recomendados:

Crie 4 webhooks separados:

1. **Produto criado** → `product.created`
2. **Produto atualizado** → `product.updated`
3. **Produto deletado** → `product.deleted`
4. **Stock atualizado** → `product.updated` (filtra apenas mudanças de stock)

### Testar webhook:

1. Edite um produto no WooCommerce
2. Salve as alterações
3. Vá em **WooCommerce → Status → Logs**
4. Procure por logs de webhook
5. Deve aparecer status **200 OK**

---

## 🧪 Passo 6: Testar Conexão no Dashboard

Agora que o WordPress está configurado, teste a conexão no seu dashboard:

1. Acesse o dashboard do seu site
2. Vá em **Integrações → WooCommerce**
3. Preencha os campos:
   - **URL da Loja:** `https://sua-loja.com`
   - **Consumer Key:** `ck_...`
   - **Consumer Secret:** `cs_...`
   - **Versão da API:** `wc/v3`
   - ✅ **Usar SSL (HTTPS)**
   - ✅ **Apenas Produtos**
4. Clique em **Testar Conexão**

### Resultado esperado:

```
✅ Conexão estabelecida com sucesso!
Latência: 250ms
Total de produtos: 42
Versão WooCommerce: 8.5.2
```

---

## 🔍 Troubleshooting

### Problema: "API REST não acessível"

**Causas possíveis:**
- Permalinks não configurados
- Plugin de segurança bloqueando API
- .htaccess corrompido

**Soluções:**
1. Vá em Configurações → Permalinks e salve novamente
2. Desative temporariamente plugins de segurança (Wordfence, iThemes Security)
3. Regenere o arquivo .htaccess

### Problema: "WooCommerce não detectado"

**Causas possíveis:**
- Plugin WooCommerce não instalado
- Plugin WooCommerce desativado
- Versão antiga do WooCommerce

**Soluções:**
1. Vá em Plugins → Plugins instalados
2. Certifique-se que WooCommerce está **Ativo**
3. Atualize para a versão mais recente

### Problema: "Credenciais inválidas"

**Causas possíveis:**
- Consumer Key ou Secret incorretos
- Chaves copiadas com espaços extras
- Chaves expiradas ou deletadas

**Soluções:**
1. Gere novas chaves no WooCommerce
2. Copie e cole com cuidado (sem espaços)
3. Certifique-se que as permissões são "Leitura/Escrita"

### Problema: "Acesso negado (403)"

**Causas possíveis:**
- Permissões da chave insuficientes
- Firewall bloqueando requisições
- Plugin de segurança bloqueando

**Soluções:**
1. Verifique se as chaves têm permissão "Leitura/Escrita"
2. Adicione o IP do Supabase na whitelist do firewall
3. Desative temporariamente plugins de segurança

---

## 📊 Verificar Produtos

Após conectar com sucesso, verifique se os produtos estão acessíveis:

### No navegador:

```
https://sua-loja.com/wp-json/wc/v3/products?consumer_key=ck_...&consumer_secret=cs_...&per_page=5
```

### Deve retornar:

```json
[
  {
    "id": 123,
    "name": "Produto Exemplo",
    "slug": "produto-exemplo",
    "sku": "PROD-001",
    "price": "29.99",
    "regular_price": "29.99",
    "sale_price": "",
    "stock_quantity": 10,
    "stock_status": "instock",
    "images": [
      {
        "src": "https://sua-loja.com/wp-content/uploads/produto.jpg"
      }
    ],
    "categories": [
      {
        "id": 15,
        "name": "Eletrônicos"
      }
    ]
  }
]
```

---

## 🎯 Próximos Passos

Após configurar o WordPress:

1. ✅ Testar conexão no dashboard
2. ✅ Fazer preview de 50 produtos
3. ✅ Importar produtos para o Supabase
4. ✅ Configurar webhooks para sincronização automática
5. ✅ Verificar produtos na homepage do site

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do WordPress: **Ferramentas → Saúde do site**
2. Verifique os logs do WooCommerce: **WooCommerce → Status → Logs**
3. Ative o modo debug do WordPress (wp-config.php):
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```

---

## 🔐 Segurança

**NUNCA:**
- ❌ Compartilhe suas chaves publicamente
- ❌ Commit chaves no Git
- ❌ Use HTTP sem SSL
- ❌ Dê permissões desnecessárias

**SEMPRE:**
- ✅ Use HTTPS
- ✅ Guarde chaves em variáveis de ambiente
- ✅ Use permissões mínimas necessárias
- ✅ Regenere chaves periodicamente

---

**Tudo pronto!** 🎉

Agora seu WordPress está configurado e pronto para sincronizar produtos com o seu site estático no GitHub Pages.
