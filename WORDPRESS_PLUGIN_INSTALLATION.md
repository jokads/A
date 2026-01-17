# 📦 Guia de Instalação do Plugin WordPress

## 🎯 Visão Geral

Este plugin permite sincronizar produtos WooCommerce com Supabase automaticamente, sem necessidade de configuração manual de webhooks ou API.

---

## 📋 Pré-requisitos

Antes de instalar o plugin, certifique-se de ter:

- ✅ WordPress 5.8 ou superior
- ✅ WooCommerce 5.0 ou superior
- ✅ PHP 7.4 ou superior
- ✅ Conta no Supabase (gratuita ou paga)
- ✅ Acesso ao painel admin do WordPress

---

## 🚀 Instalação

### **Método 1: Upload Manual (Recomendado)**

1. **Baixe o plugin:**
   - Baixe a pasta `wordpress-plugin` completa
   - Renomeie para `readdy-woocommerce-sync`

2. **Comprima em ZIP:**
   ```bash
   # No terminal (Linux/Mac)
   cd wordpress-plugin
   zip -r readdy-woocommerce-sync.zip .
   
   # No Windows
   # Clique com botão direito → Enviar para → Pasta compactada
   ```

3. **Faça upload no WordPress:**
   - Acesse o painel admin do WordPress
   - Vá em **Plugins** → **Adicionar Novo**
   - Clique em **Fazer Upload do Plugin**
   - Escolha o arquivo `readdy-woocommerce-sync.zip`
   - Clique em **Instalar Agora**
   - Aguarde a instalação
   - Clique em **Ativar Plugin**

### **Método 2: FTP/SFTP**

1. **Conecte via FTP:**
   - Use FileZilla, WinSCP ou outro cliente FTP
   - Conecte ao seu servidor WordPress

2. **Faça upload:**
   - Navegue até `/wp-content/plugins/`
   - Faça upload da pasta `readdy-woocommerce-sync`
   - Aguarde o upload completo

3. **Ative o plugin:**
   - Acesse o painel admin do WordPress
   - Vá em **Plugins**
   - Encontre **Readdy WooCommerce Sync**
   - Clique em **Ativar**

---

## ⚙️ Configuração

### **Passo 1: Obter Credenciais do Supabase**

1. Acesse https://supabase.com
2. Faça login na sua conta
3. Selecione seu projeto
4. Vá em **Settings** → **API**
5. Copie:
   - **URL:** `https://seu-projeto.supabase.co`
   - **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **Passo 2: Configurar o Plugin**

1. No WordPress, vá em **Readdy Sync** → **Configurações**

2. **Aba "Conexão":**
   - **URL do Supabase:** Cole a URL do seu projeto
   - **Chave do Supabase:** Cole a Service Role Key
   - **Webhook Secret:** Clique em "Gerar Secret Aleatório" (opcional mas recomendado)
   - Clique em **Salvar Configurações**

3. **Testar Conexão:**
   - Role até "Testar Conexão"
   - Clique em **Testar Conexão**
   - Aguarde a mensagem: ✅ **Conexão estabelecida com sucesso!**

4. **Aba "Sincronização":**
   - ✅ Marque **Sincronização Automática**
   - ✅ Marque **Sincronizar Imagens**
   - Clique em **Salvar Configurações**

### **Passo 3: Sincronizar Produtos Existentes**

1. Na aba **Sincronização**
2. Role até "Sincronização Manual"
3. Clique em **Sincronizar Todos os Produtos**
4. Confirme a ação
5. Aguarde a conclusão (pode levar alguns minutos)

---

## 📊 Usando o Plugin

### **Dashboard**

O dashboard mostra estatísticas em tempo real:

```
┌─────────────────────────────────────────────────┐
│  Total de Produtos: 42                          │
│  Sincronizações: 156                            │
│  Última Sincronização: 15/01/2025 14:30        │
│  Status: ✅ Ativo                               │
└─────────────────────────────────────────────────┘
```

### **Sincronização Automática**

Quando ativada, os produtos são sincronizados automaticamente:

- ✅ **Criar produto** → Sincroniza imediatamente
- ✅ **Editar produto** → Sincroniza imediatamente
- ✅ **Deletar produto** → Sincroniza imediatamente
- ✅ **Atualizar stock** → Sincroniza imediatamente

### **Logs de Sincronização**

Veja o histórico completo em **Readdy Sync** → **Logs**:

| Data/Hora | Evento | Produto | Status | Mensagem |
|-----------|--------|---------|--------|----------|
| 15/01 14:30 | ➕ product.created | #123 | ✅ Sucesso | - |
| 15/01 14:25 | ✏️ product.updated | #456 | ✅ Sucesso | - |
| 15/01 14:20 | 📦 product.stock_updated | #789 | ✅ Sucesso | - |

---

## 🔧 Configurações Avançadas

### **REST API**

O plugin fornece endpoints REST para integração externa:

**Obter produtos:**
```bash
GET https://seu-site.com/wp-json/readdy-woo-sync/v1/products?per_page=50&page=1
```

**Sincronizar produtos:**
```bash
POST https://seu-site.com/wp-json/readdy-woo-sync/v1/sync
```

**Autenticação:**
- Use Application Passwords do WordPress
- Ou autenticação via cookie (para admin logado)

### **Webhook Secret**

O Webhook Secret é usado para validação HMAC:

1. Gere um secret aleatório no plugin
2. Copie o secret
3. Configure no Supabase (se necessário)

**Formato:**
```
whs_abc123xyz456
```

### **Sincronizar Imagens**

Quando ativado, o plugin envia as URLs das imagens:

```json
{
  "images": [
    "https://seu-site.com/wp-content/uploads/2025/01/produto-1.jpg",
    "https://seu-site.com/wp-content/uploads/2025/01/produto-2.jpg"
  ]
}
```

---

## 🐛 Troubleshooting

### **Problema: "WooCommerce não detectado"**

**Solução:**
1. Certifique-se que o WooCommerce está instalado
2. Ative o plugin WooCommerce
3. Recarregue a página

### **Problema: "Erro ao conectar com Supabase"**

**Verificar:**
1. URL do Supabase está correta (com `https://`)
2. Service Role Key está correta (não use Anon Key)
3. Projeto Supabase está ativo
4. Firewall não está bloqueando requisições

**Testar manualmente:**
```bash
curl "https://seu-projeto.supabase.co/rest/v1/" \
  -H "apikey: SUA_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer SUA_SERVICE_ROLE_KEY"
```

### **Problema: "Produtos não sincronizam automaticamente"**

**Verificar:**
1. Sincronização automática está ativada
2. Produto está publicado (não rascunho)
3. Veja os logs para erros

### **Problema: "Sincronização manual falha"**

**Verificar:**
1. Conexão com Supabase está funcionando
2. Tabela `woocommerce_webhooks` existe no Supabase
3. RLS (Row Level Security) permite inserção
4. Veja os logs do WordPress (WP_DEBUG)

---

## 📈 Performance

### **Métricas Esperadas:**

| Operação | Tempo Esperado |
|----------|----------------|
| Sincronizar 1 produto | <1s |
| Sincronizar 100 produtos | <30s |
| Sincronizar 1000 produtos | <5min |
| Webhook em tempo real | <1s |

### **Otimizações:**

- ✅ Batch processing (20 produtos por vez)
- ✅ Timeout de 15s por requisição
- ✅ Retry automático em caso de erro
- ✅ Cache de conexão

---

## 🔒 Segurança

### **Boas Práticas:**

- ✅ Use HTTPS no WordPress
- ✅ Use Service Role Key (não Anon Key)
- ✅ Configure Webhook Secret
- ✅ Mantenha o plugin atualizado
- ✅ Faça backup regular do banco de dados

### **Permissões:**

- Apenas usuários com permissão `manage_woocommerce` podem:
  - Acessar configurações
  - Ver logs
  - Sincronizar produtos
  - Usar REST API

---

## 📚 Estrutura do Plugin

```
readdy-woocommerce-sync/
├── readdy-woocommerce-sync.php  # Arquivo principal
├── templates/
│   ├── admin-settings.php       # Página de configurações
│   └── admin-logs.php           # Página de logs
├── assets/
│   ├── admin.css                # Estilos do admin
│   └── admin.js                 # Scripts do admin
└── readme.txt                   # Documentação WordPress
```

---

## 🎉 Resultado Final

Após a instalação e configuração, você terá:

1. ✅ **Sincronização automática** de produtos WooCommerce → Supabase
2. ✅ **Dashboard** com estatísticas em tempo real
3. ✅ **Logs detalhados** de todas as sincronizações
4. ✅ **REST API** para integração externa
5. ✅ **Webhooks** em tempo real
6. ✅ **Segurança** com validação HMAC
7. ✅ **Interface admin** intuitiva e profissional

---

## 🆘 Suporte

**Precisa de ajuda?**

1. Veja a documentação completa em `INTEGRATIONS_WOOCOMMERCE.md`
2. Verifique os logs em **Readdy Sync** → **Logs**
3. Ative WP_DEBUG para ver erros detalhados
4. Entre em contato: https://readdy.ai/support

---

## 📝 Checklist de Instalação

Use este checklist para garantir que tudo está funcionando:

- [ ] ✅ WordPress 5.8+ instalado
- [ ] ✅ WooCommerce 5.0+ instalado e ativo
- [ ] ✅ PHP 7.4+ configurado
- [ ] ✅ Plugin instalado e ativado
- [ ] ✅ URL do Supabase configurada
- [ ] ✅ Service Role Key configurada
- [ ] ✅ Webhook Secret gerado
- [ ] ✅ Conexão testada com sucesso
- [ ] ✅ Sincronização automática ativada
- [ ] ✅ Sincronizar imagens ativado
- [ ] ✅ Produtos existentes sincronizados
- [ ] ✅ Logs aparecem corretamente
- [ ] ✅ Criar novo produto sincroniza automaticamente
- [ ] ✅ Editar produto sincroniza automaticamente
- [ ] ✅ Atualizar stock sincroniza automaticamente

---

**Tudo pronto!** 🚀

Agora seus produtos WooCommerce são sincronizados automaticamente com o Supabase, e você pode exibi-los no seu site estático no GitHub Pages!

Precisa de ajuda? Entre em contato! 😊
