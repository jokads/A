# 🔧 Guia Completo: WordPress + WooCommerce no InfinityFree

## 📋 Checklist Rápido

Antes de começar, verifique:
- [ ] WordPress instalado e funcionando
- [ ] WooCommerce instalado e ativo
- [ ] Site acessível via navegador
- [ ] HTTPS ativo (certificado SSL)
- [ ] Acesso ao painel admin do WordPress

---

## 🚀 Passo 1: Verificar se o Site Está Acessível

### **Teste Manual:**

1. Abra o navegador
2. Acesse: `https://joka.ct.ws`
3. O site deve carregar normalmente

**Se o site NÃO carregar:**
- ✅ Verifique se o domínio está correto
- ✅ Verifique se o hosting está ativo no InfinityFree
- ✅ Aguarde propagação DNS (pode levar até 24h)
- ✅ Tente acessar via IP direto

---

## 🔐 Passo 2: Ativar HTTPS (SSL)

### **No InfinityFree:**

1. Faça login no painel do InfinityFree
2. Vá em **SSL Certificates**
3. Clique em **Install SSL Certificate**
4. Escolha **Free SSL (Let's Encrypt)**
5. Aguarde 5-10 minutos para ativação

### **No WordPress:**

1. Acesse o painel admin: `https://joka.ct.ws/wp-admin`
2. Vá em **Configurações** → **Geral**
3. Altere AMBOS os campos para `https://`:
   - **Endereço do WordPress (URL):** `https://joka.ct.ws`
   - **Endereço do site (URL):** `https://joka.ct.ws`
4. Clique em **Salvar alterações**

**⚠️ IMPORTANTE:** Use `https://` (com S) em ambos os campos!

---

## 🔧 Passo 3: Configurar Permalinks

### **Por que é necessário?**
Os permalinks controlam como as URLs são estruturadas. A API REST do WordPress precisa de permalinks "bonitos" para funcionar.

### **Como configurar:**

1. No WordPress, vá em **Configurações** → **Permalinks**
2. Selecione **Nome do post**
3. Clique em **Salvar alterações**

**Verificar se funcionou:**
- Acesse: `https://joka.ct.ws/wp-json/`
- Deve retornar um JSON com informações da API

**Exemplo de resposta correta:**
```json
{
  "name": "Meu Site",
  "description": "...",
  "url": "https://joka.ct.ws",
  "namespaces": [
    "wp/v2",
    "wc/v1",
    "wc/v2",
    "wc/v3"
  ]
}
```

**Se retornar 404:**
- ✅ Salve os permalinks novamente
- ✅ Verifique se o arquivo `.htaccess` existe na raiz do WordPress
- ✅ Verifique permissões do arquivo (644)

---

## 🛒 Passo 4: Verificar WooCommerce

### **Confirmar que está instalado:**

1. No WordPress, vá em **Plugins**
2. Procure por **WooCommerce**
3. Deve estar **Ativo** (não apenas instalado)

**Se não estiver instalado:**
1. Vá em **Plugins** → **Adicionar Novo**
2. Pesquise "WooCommerce"
3. Clique em **Instalar Agora**
4. Clique em **Ativar**

### **Verificar API WooCommerce:**

Acesse: `https://joka.ct.ws/wp-json/wc/v3/`

**Resposta esperada:**
```json
{
  "namespace": "wc/v3",
  "routes": {
    "/wc/v3": {...},
    "/wc/v3/products": {...}
  }
}
```

**Se retornar erro:**
- ✅ WooCommerce não está ativo
- ✅ Permalinks não estão configurados
- ✅ Conflito com outro plugin

---

## 🔑 Passo 5: Gerar Chaves de API

### **Como gerar:**

1. No WordPress, vá em **WooCommerce** → **Configurações**
2. Clique na aba **Avançado**
3. Clique em **REST API**
4. Clique em **Adicionar chave**
5. Preencha:
   - **Descrição:** `Integração GitHub Pages`
   - **Utilizador:** Seu usuário admin
   - **Permissões:** **Leitura/Escrita**
6. Clique em **Gerar chave de API**

### **Copiar as chaves:**

Você verá duas chaves:

```
Consumer Key: ck_1234567890abcdef1234567890abcdef12345678
Consumer Secret: cs_1234567890abcdef1234567890abcdef12345678
```

**⚠️ MUITO IMPORTANTE:**
- Copie AMBAS as chaves AGORA
- Você só verá o Consumer Secret UMA VEZ
- Guarde em local seguro (bloco de notas, gerenciador de senhas)

---

## 🌐 Passo 6: Configurar CORS

### **O que é CORS?**
CORS (Cross-Origin Resource Sharing) permite que seu site no GitHub Pages acesse a API do WordPress.

### **Método 1: Plugin Code Snippets (Recomendado)**

1. Instale o plugin **Code Snippets**:
   - WordPress → Plugins → Adicionar Novo
   - Pesquise "Code Snippets"
   - Instale e ative

2. Vá em **Snippets** → **Adicionar Novo**

3. **Título:** `CORS para GitHub Pages`

4. **Código:**

```php
<?php
/**
 * CORS para GitHub Pages
 * Permite requisições do GitHub Pages para a API do WooCommerce
 */

add_action('rest_api_init', function () {
    // Seu domínio GitHub Pages
    $allowed_origin = 'https://jokads.github.io';
    
    // Obter origem da requisição
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    // Verificar se a origem é permitida
    if ($origin === $allowed_origin) {
        header("Access-Control-Allow-Origin: $allowed_origin");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Max-Age: 86400");
    }
    
    // Responder a requisições OPTIONS (preflight)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
}, 15);

// CORS para uploads de imagens
add_filter('wp_handle_upload_prefilter', function($file) {
    header("Access-Control-Allow-Origin: https://jokads.github.io");
    return $file;
});
```

5. Marque **Executar snippet em todos os lugares**
6. Clique em **Salvar alterações e ativar**

### **Método 2: Via .htaccess (Alternativo)**

Se o método 1 não funcionar, adicione ao arquivo `.htaccess` na raiz do WordPress:

```apache
# CORS para GitHub Pages
<IfModule mod_headers.c>
    SetEnvIf Origin "^https://jokads\.github\.io$" ORIGIN_ALLOWED=$0
    Header always set Access-Control-Allow-Origin "%{ORIGIN_ALLOWED}e" env=ORIGIN_ALLOWED
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type, X-WP-Nonce"
    Header always set Access-Control-Allow-Credentials "true"
    Header always set Access-Control-Max-Age "86400"
</IfModule>

# Responder OPTIONS com 200
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
```

---

## 🧪 Passo 7: Testar a Conexão

### **Teste 1: API REST Básica**

Abra o navegador e acesse:
```
https://joka.ct.ws/wp-json/
```

**✅ Sucesso:** Retorna JSON com informações da API  
**❌ Erro 404:** Permalinks não configurados  
**❌ Erro 500:** Problema no servidor/WordPress  

---

### **Teste 2: API WooCommerce**

Abra o navegador e acesse:
```
https://joka.ct.ws/wp-json/wc/v3/
```

**✅ Sucesso:** Retorna JSON com rotas da API WooCommerce  
**❌ Erro 404:** WooCommerce não está ativo  

---

### **Teste 3: Autenticação (via Terminal/CMD)**

**No Windows (PowerShell):**
```powershell
$user = "ck_SUA_CONSUMER_KEY"
$pass = "cs_SEU_CONSUMER_SECRET"
$pair = "$($user):$($pass)"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)
$headers = @{ Authorization = "Basic $base64" }

Invoke-RestMethod -Uri "https://joka.ct.ws/wp-json/wc/v3/products?per_page=1" -Headers $headers
```

**No Mac/Linux (Terminal):**
```bash
curl "https://joka.ct.ws/wp-json/wc/v3/products?per_page=1" \
  -u "ck_SUA_KEY:cs_SEU_SECRET"
```

**✅ Sucesso:** Retorna lista de produtos (mesmo que vazia: `[]`)  
**❌ Erro 401:** Credenciais inválidas  
**❌ Erro 403:** Permissões insuficientes  

---

### **Teste 4: CORS (via Console do Navegador)**

1. Abra seu site no GitHub Pages: `https://jokads.github.io/A/`
2. Pressione **F12** para abrir o console
3. Cole este código:

```javascript
const consumerKey = 'ck_SUA_KEY';
const consumerSecret = 'cs_SEU_SECRET';
const auth = btoa(`${consumerKey}:${consumerSecret}`);

fetch('https://joka.ct.ws/wp-json/wc/v3/products?per_page=1', {
  headers: {
    'Authorization': `Basic ${auth}`
  }
})
.then(r => r.json())
.then(data => console.log('✅ CORS funcionando!', data))
.catch(err => console.error('❌ Erro CORS:', err));
```

**✅ Sucesso:** Console mostra `✅ CORS funcionando!` + produtos  
**❌ Erro CORS:** Mensagem sobre "blocked by CORS policy"  

---

## 🔍 Diagnóstico de Problemas

### **Problema: "Não foi possível conectar"**

**Possíveis causas:**

1. **Site não está acessível**
   - ✅ Teste: Abra `https://joka.ct.ws` no navegador
   - ✅ Solução: Verifique hosting no InfinityFree

2. **SSL não está ativo**
   - ✅ Teste: URL deve começar com `https://` (com S)
   - ✅ Solução: Ative SSL no InfinityFree (Passo 2)

3. **Permalinks não configurados**
   - ✅ Teste: Acesse `https://joka.ct.ws/wp-json/`
   - ✅ Solução: Configure permalinks (Passo 3)

4. **CORS não configurado**
   - ✅ Teste: Use o Teste 4 acima
   - ✅ Solução: Configure CORS (Passo 6)

---

### **Problema: "401 Unauthorized"**

**Possíveis causas:**

1. **Consumer Key incorreta**
   - ✅ Verifique se copiou corretamente
   - ✅ Deve começar com `ck_`

2. **Consumer Secret incorreta**
   - ✅ Verifique se copiou corretamente
   - ✅ Deve começar com `cs_`

3. **Chaves expiraram**
   - ✅ Gere novas chaves no WordPress

---

### **Problema: "403 Forbidden"**

**Causa:** Permissões insuficientes

**Solução:**
1. Vá em WooCommerce → Configurações → Avançado → REST API
2. Encontre sua chave
3. Clique em **Editar**
4. Altere permissões para **Leitura/Escrita**
5. Clique em **Atualizar**

---

### **Problema: "404 Not Found"**

**Possíveis causas:**

1. **Permalinks não configurados**
   - ✅ Solução: Passo 3

2. **WooCommerce não está ativo**
   - ✅ Solução: Passo 4

3. **Versão da API incorreta**
   - ✅ Tente `wc/v3`, `wc/v2` ou `wc/v1`

---

### **Problema: "CORS blocked"**

**Causa:** CORS não configurado ou configurado incorretamente

**Solução:**
1. Verifique se o snippet CORS está **ativo** no Code Snippets
2. Verifique se o domínio está correto: `https://jokads.github.io`
3. Limpe cache do navegador (Ctrl+Shift+Delete)
4. Tente em modo anônimo/privado

---

## 📊 Checklist Final

Antes de conectar no dashboard, verifique:

- [ ] ✅ Site acessível: `https://joka.ct.ws` carrega
- [ ] ✅ HTTPS ativo: URL começa com `https://`
- [ ] ✅ Permalinks: `https://joka.ct.ws/wp-json/` retorna JSON
- [ ] ✅ WooCommerce: `https://joka.ct.ws/wp-json/wc/v3/` retorna JSON
- [ ] ✅ Chaves geradas: Consumer Key + Secret copiadas
- [ ] ✅ CORS configurado: Snippet ativo no Code Snippets
- [ ] ✅ Teste de autenticação: curl retorna produtos
- [ ] ✅ Teste CORS: Console não mostra erro

---

## 🎯 Próximo Passo

Após completar TODOS os passos acima:

1. Acesse seu dashboard: `https://jokads.github.io/A/admin`
2. Vá em **Integrações** → **WooCommerce**
3. Preencha:
   - **URL da Loja:** `https://joka.ct.ws`
   - **Consumer Key:** `ck_...` (cole a chave)
   - **Consumer Secret:** `cs_...` (cole a chave)
   - **Versão da API:** `wc/v3`
   - ✅ **Usar SSL (HTTPS)**
4. Clique em **Testar Conexão**

**Resultado esperado:**
```
✅ Conexão estabelecida com sucesso!
Latência: 250ms
Total de produtos: 42
Versão WooCommerce: 8.5.2
```

---

## 🆘 Ainda com Problemas?

Se após seguir TODOS os passos ainda não funcionar:

### **Informações para Debug:**

Colete estas informações:

1. **URL do site:** `https://joka.ct.ws`
2. **Teste 1:** `https://joka.ct.ws/wp-json/` retorna? (Sim/Não)
3. **Teste 2:** `https://joka.ct.ws/wp-json/wc/v3/` retorna? (Sim/Não)
4. **Versão WordPress:** (Painel → Atualizações)
5. **Versão WooCommerce:** (Plugins → WooCommerce)
6. **CORS configurado:** Snippet ativo? (Sim/Não)
7. **Erro exato:** (Copie a mensagem de erro completa)

### **Logs do InfinityFree:**

1. Acesse o painel do InfinityFree
2. Vá em **Error Logs**
3. Procure por erros recentes
4. Copie os erros relacionados ao WordPress

---

## 📚 Recursos Úteis

- **Documentação WooCommerce REST API:** https://woocommerce.github.io/woocommerce-rest-api-docs/
- **Suporte InfinityFree:** https://forum.infinityfree.net/
- **Testar API REST:** https://reqbin.com/

---

**Configuração completa!** 🚀

Agora seu WordPress está pronto para se conectar com o GitHub Pages!
