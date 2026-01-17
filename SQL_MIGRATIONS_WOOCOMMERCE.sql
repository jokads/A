-- ============================================================================
-- MIGRATIONS SQL - INTEGRAÇÃO WOOCOMMERCE
-- ============================================================================
-- Versão: 1.0.0
-- Data: 2024
-- Descrição: Tabelas, RLS, índices e triggers para sincronização WooCommerce
-- ============================================================================

-- ============================================================================
-- 1. TABELA: integrations_woocommerce
-- Armazena credenciais e configurações da conexão WooCommerce
-- ============================================================================

CREATE TABLE IF NOT EXISTS integrations_woocommerce (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_url TEXT NOT NULL UNIQUE,
  consumer_key TEXT NOT NULL, -- Encriptado no backend
  consumer_secret TEXT NOT NULL, -- Encriptado no backend
  api_version TEXT NOT NULL DEFAULT 'wc/v3',
  use_ssl BOOLEAN NOT NULL DEFAULT true,
  products_only BOOLEAN NOT NULL DEFAULT true,
  sync_schedule TEXT DEFAULT 'manual', -- manual, hourly, daily, weekly
  last_sync_at TIMESTAMPTZ,
  webhook_secret TEXT, -- Para validação HMAC de webhooks
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_integrations_woocommerce_store_url ON integrations_woocommerce(store_url);
CREATE INDEX IF NOT EXISTS idx_integrations_woocommerce_is_active ON integrations_woocommerce(is_active);

-- RLS: Apenas admins podem acessar
ALTER TABLE integrations_woocommerce ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to integrations_woocommerce" ON integrations_woocommerce;
CREATE POLICY "Admin full access to integrations_woocommerce"
  ON integrations_woocommerce
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 2. TABELA: product_mappings
-- Mapeia produtos WooCommerce ↔ produtos locais
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  woo_product_id BIGINT NOT NULL, -- ID do produto no WooCommerce
  local_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced', -- synced, pending, error
  sync_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(woo_product_id),
  UNIQUE(local_product_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_product_mappings_woo_id ON product_mappings(woo_product_id);
CREATE INDEX IF NOT EXISTS idx_product_mappings_local_id ON product_mappings(local_product_id);
CREATE INDEX IF NOT EXISTS idx_product_mappings_sku ON product_mappings(sku);
CREATE INDEX IF NOT EXISTS idx_product_mappings_sync_status ON product_mappings(sync_status);

-- RLS: Admins podem gerenciar, usuários podem ler
ALTER TABLE product_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to product_mappings" ON product_mappings;
CREATE POLICY "Admin full access to product_mappings"
  ON product_mappings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Public read access to product_mappings" ON product_mappings;
CREATE POLICY "Public read access to product_mappings"
  ON product_mappings
  FOR SELECT
  USING (true);

-- ============================================================================
-- 3. TABELA: woocommerce_import_jobs
-- Rastreia jobs de importação (batch processing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS woocommerce_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed, cancelled
  total_items INTEGER NOT NULL DEFAULT 0,
  processed_items INTEGER NOT NULL DEFAULT 0,
  created_items INTEGER NOT NULL DEFAULT 0,
  updated_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  import_mode TEXT NOT NULL DEFAULT 'full', -- preview, full, stock_only
  import_options JSONB, -- Opções de importação (update_existing, create_new, etc)
  error_message TEXT,
  error_details JSONB,
  snapshot_id UUID, -- Para rollback
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_woocommerce_import_jobs_status ON woocommerce_import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_woocommerce_import_jobs_created_at ON woocommerce_import_jobs(created_at DESC);

-- RLS: Apenas admins podem acessar
ALTER TABLE woocommerce_import_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to woocommerce_import_jobs" ON woocommerce_import_jobs;
CREATE POLICY "Admin full access to woocommerce_import_jobs"
  ON woocommerce_import_jobs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 4. TABELA: woocommerce_webhooks
-- Armazena eventos recebidos via webhooks
-- ============================================================================

CREATE TABLE IF NOT EXISTS woocommerce_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- product.created, product.updated, product.deleted, etc
  woo_product_id BIGINT,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  signature TEXT, -- HMAC signature para validação
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_woocommerce_webhooks_event_type ON woocommerce_webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_woocommerce_webhooks_processed ON woocommerce_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_woocommerce_webhooks_woo_product_id ON woocommerce_webhooks(woo_product_id);
CREATE INDEX IF NOT EXISTS idx_woocommerce_webhooks_created_at ON woocommerce_webhooks(created_at DESC);

-- RLS: Apenas admins podem acessar
ALTER TABLE woocommerce_webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to woocommerce_webhooks" ON woocommerce_webhooks;
CREATE POLICY "Admin full access to woocommerce_webhooks"
  ON woocommerce_webhooks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 5. TABELA: woocommerce_sync_logs
-- Logs detalhados de sincronizações
-- ============================================================================

CREATE TABLE IF NOT EXISTS woocommerce_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES woocommerce_import_jobs(id) ON DELETE CASCADE,
  log_level TEXT NOT NULL DEFAULT 'info', -- info, warning, error
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_woocommerce_sync_logs_job_id ON woocommerce_sync_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_woocommerce_sync_logs_log_level ON woocommerce_sync_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_woocommerce_sync_logs_created_at ON woocommerce_sync_logs(created_at DESC);

-- RLS: Apenas admins podem acessar
ALTER TABLE woocommerce_sync_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to woocommerce_sync_logs" ON woocommerce_sync_logs;
CREATE POLICY "Admin full access to woocommerce_sync_logs"
  ON woocommerce_sync_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 6. TRIGGERS: Atualizar updated_at automaticamente
-- ============================================================================

-- Função genérica para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para integrations_woocommerce
DROP TRIGGER IF EXISTS update_integrations_woocommerce_updated_at ON integrations_woocommerce;
CREATE TRIGGER update_integrations_woocommerce_updated_at
  BEFORE UPDATE ON integrations_woocommerce
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para product_mappings
DROP TRIGGER IF EXISTS update_product_mappings_updated_at ON product_mappings;
CREATE TRIGGER update_product_mappings_updated_at
  BEFORE UPDATE ON product_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para woocommerce_import_jobs
DROP TRIGGER IF EXISTS update_woocommerce_import_jobs_updated_at ON woocommerce_import_jobs;
CREATE TRIGGER update_woocommerce_import_jobs_updated_at
  BEFORE UPDATE ON woocommerce_import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. VIEWS: Estatísticas e relatórios
-- ============================================================================

-- View: Estatísticas de sincronização
CREATE OR REPLACE VIEW woocommerce_sync_stats AS
SELECT
  COUNT(DISTINCT pm.woo_product_id) as total_synced_products,
  COUNT(DISTINCT CASE WHEN pm.sync_status = 'synced' THEN pm.id END) as synced_count,
  COUNT(DISTINCT CASE WHEN pm.sync_status = 'error' THEN pm.id END) as error_count,
  MAX(pm.last_synced_at) as last_sync_time,
  (SELECT last_sync_at FROM integrations_woocommerce WHERE is_active = true LIMIT 1) as last_full_sync,
  (SELECT COUNT(*) FROM woocommerce_import_jobs WHERE status = 'completed') as completed_jobs,
  (SELECT COUNT(*) FROM woocommerce_import_jobs WHERE status = 'failed') as failed_jobs,
  (SELECT COUNT(*) FROM woocommerce_webhooks WHERE processed = false) as pending_webhooks
FROM product_mappings pm;

-- View: Produtos com problemas de sincronização
CREATE OR REPLACE VIEW woocommerce_sync_errors AS
SELECT
  pm.id,
  pm.woo_product_id,
  pm.sku,
  p.title as product_name,
  pm.sync_status,
  pm.sync_error,
  pm.last_synced_at,
  pm.updated_at
FROM product_mappings pm
LEFT JOIN products p ON p.id = pm.local_product_id
WHERE pm.sync_status = 'error'
ORDER BY pm.updated_at DESC;

-- ============================================================================
-- 8. FUNÇÕES: Helpers para sincronização
-- ============================================================================

-- Função: Limpar webhooks antigos (>30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_webhooks()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM woocommerce_webhooks
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND processed = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função: Limpar logs antigos (>90 dias)
CREATE OR REPLACE FUNCTION cleanup_old_sync_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM woocommerce_sync_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função: Obter produtos que precisam de sincronização
CREATE OR REPLACE FUNCTION get_products_needing_sync(hours_threshold INTEGER DEFAULT 24)
RETURNS TABLE (
  woo_product_id BIGINT,
  local_product_id UUID,
  sku TEXT,
  last_synced_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.woo_product_id,
    pm.local_product_id,
    pm.sku,
    pm.last_synced_at
  FROM product_mappings pm
  WHERE pm.last_synced_at < NOW() - (hours_threshold || ' hours')::INTERVAL
  OR pm.sync_status = 'error'
  ORDER BY pm.last_synced_at ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. DADOS INICIAIS (OPCIONAL)
-- ============================================================================

-- Inserir configuração padrão de webhook secret (deve ser alterado!)
-- INSERT INTO integrations_woocommerce (store_url, consumer_key, consumer_secret, webhook_secret)
-- VALUES ('https://example.com', 'ck_CHANGE_ME', 'cs_CHANGE_ME', 'whs_CHANGE_ME')
-- ON CONFLICT (store_url) DO NOTHING;

-- ============================================================================
-- 10. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE integrations_woocommerce IS 'Armazena credenciais e configurações da conexão WooCommerce';
COMMENT ON TABLE product_mappings IS 'Mapeia produtos WooCommerce ↔ produtos locais';
COMMENT ON TABLE woocommerce_import_jobs IS 'Rastreia jobs de importação em batch';
COMMENT ON TABLE woocommerce_webhooks IS 'Armazena eventos recebidos via webhooks do WooCommerce';
COMMENT ON TABLE woocommerce_sync_logs IS 'Logs detalhados de sincronizações';

COMMENT ON COLUMN integrations_woocommerce.consumer_key IS 'Consumer Key do WooCommerce (deve ser encriptado)';
COMMENT ON COLUMN integrations_woocommerce.consumer_secret IS 'Consumer Secret do WooCommerce (deve ser encriptado)';
COMMENT ON COLUMN integrations_woocommerce.webhook_secret IS 'Secret para validação HMAC de webhooks';
COMMENT ON COLUMN product_mappings.woo_product_id IS 'ID do produto no WooCommerce';
COMMENT ON COLUMN product_mappings.local_product_id IS 'ID do produto na tabela local';
COMMENT ON COLUMN woocommerce_import_jobs.snapshot_id IS 'ID do snapshot para rollback em caso de erro';

-- ============================================================================
-- FIM DAS MIGRATIONS
-- ============================================================================

-- Para executar este script no Supabase:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Clique em "Run"
-- 5. Verifique se todas as tabelas foram criadas com sucesso

-- Para verificar as tabelas criadas:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%woocommerce%';

-- Para verificar as policies RLS:
-- SELECT * FROM pg_policies WHERE tablename LIKE '%woocommerce%';
