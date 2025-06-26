-- ============================================================================
-- AI PROCESSING QUEUE SYSTEM
-- Sistema de fila para processamento inteligente de dados espirituais
-- ============================================================================

-- 1. Expandir tabela spiritual_regions para suporte global
ALTER TABLE spiritual_regions 
ADD COLUMN IF NOT EXISTS country_code VARCHAR(3),
ADD COLUMN IF NOT EXISTS continent VARCHAR(50),
ADD COLUMN IF NOT EXISTS hierarchy_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_region_id UUID REFERENCES spiritual_regions(id),
ADD COLUMN IF NOT EXISTS population BIGINT,
ADD COLUMN IF NOT EXISTS area_km2 DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS coordinates POINT,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50),
ADD COLUMN IF NOT EXISTS official_languages TEXT[],
ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3);

-- 2. Tabela de fila de processamento IA
CREATE TABLE ai_processing_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES spiritual_regions(id) ON DELETE CASCADE,
    region_name VARCHAR(255) NOT NULL,
    region_type VARCHAR(20) NOT NULL CHECK (region_type IN ('country', 'state', 'city', 'neighborhood')),
    continent VARCHAR(50),
    country_code VARCHAR(3),
    parent_region_name VARCHAR(255),
    
    -- Status e controle
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'skipped', 'paused')),
    priority_level INTEGER DEFAULT 2 CHECK (priority_level BETWEEN 1 AND 5), -- 1=Máxima, 5=Mínima
    queue_order INTEGER,
    
    -- Estimativas e custos
    estimated_cost_usd DECIMAL(10,4) DEFAULT 0.02,
    estimated_duration_seconds INTEGER DEFAULT 45,
    actual_cost_usd DECIMAL(10,4),
    actual_duration_seconds INTEGER,
    
    -- Configuração de processamento
    ai_model VARCHAR(50) DEFAULT 'gpt-4',
    custom_prompt TEXT,
    max_attempts INTEGER DEFAULT 3,
    current_attempts INTEGER DEFAULT 0,
    
    -- Resultados
    ai_response JSONB,
    ai_tokens_used INTEGER,
    validation_score DECIMAL(3,2), -- 0.00 a 1.00
    
    -- Auditoria e controle
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    error_count INTEGER DEFAULT 0,
    
    -- Metadados adicionais
    batch_id UUID,
    processing_notes TEXT,
    manual_review_required BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- 3. Tabela de batches/campanhas de processamento
CREATE TABLE ai_processing_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    continent VARCHAR(50),
    region_types TEXT[], -- ['country', 'state', 'city']
    filters JSONB, -- Filtros aplicados na criação
    
    -- Status do batch
    status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'running', 'paused', 'completed', 'cancelled')),
    total_regions INTEGER DEFAULT 0,
    completed_regions INTEGER DEFAULT 0,
    failed_regions INTEGER DEFAULT 0,
    skipped_regions INTEGER DEFAULT 0,
    
    -- Estimativas e custos
    estimated_total_cost_usd DECIMAL(10,2),
    actual_total_cost_usd DECIMAL(10,2) DEFAULT 0,
    estimated_duration_hours DECIMAL(5,2),
    actual_duration_seconds INTEGER,
    
    -- Auditoria
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Configurações
    auto_approve BOOLEAN DEFAULT FALSE,
    quality_threshold DECIMAL(3,2) DEFAULT 0.70,
    processing_settings JSONB
);

-- 4. Tabela de templates de prompts
CREATE TABLE ai_prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    region_type VARCHAR(20) NOT NULL,
    continent VARCHAR(50),
    
    -- Prompt content
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,
    expected_output_format JSONB,
    
    -- Configurações
    model VARCHAR(50) DEFAULT 'gpt-4',
    max_tokens INTEGER DEFAULT 4000,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    
    -- Validação e qualidade
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    quality_score DECIMAL(3,2),
    success_rate DECIMAL(3,2),
    
    -- Auditoria
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(name, version)
);

-- 5. Tabela de logs de processamento
CREATE TABLE ai_processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_item_id UUID REFERENCES ai_processing_queue(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES ai_processing_batches(id) ON DELETE CASCADE,
    
    -- Log data
    log_level VARCHAR(10) CHECK (log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR')),
    message TEXT NOT NULL,
    details JSONB,
    
    -- Context
    step VARCHAR(100), -- 'validation', 'ai_request', 'parsing', 'saving'
    duration_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices na tabela spiritual_regions expandida
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_country_code ON spiritual_regions(country_code);
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_continent ON spiritual_regions(continent);
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_hierarchy ON spiritual_regions(hierarchy_level);
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_parent ON spiritual_regions(parent_region_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_coordinates ON spiritual_regions USING GIST(coordinates);

-- Índices na fila de processamento
CREATE INDEX IF NOT EXISTS idx_ai_queue_status ON ai_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_ai_queue_priority ON ai_processing_queue(priority_level, queue_order);
CREATE INDEX IF NOT EXISTS idx_ai_queue_batch ON ai_processing_queue(batch_id);
CREATE INDEX IF NOT EXISTS idx_ai_queue_region_type ON ai_processing_queue(region_type);
CREATE INDEX IF NOT EXISTS idx_ai_queue_continent ON ai_processing_queue(continent);
CREATE INDEX IF NOT EXISTS idx_ai_queue_created_at ON ai_processing_queue(created_at);

-- Índices nos batches
CREATE INDEX IF NOT EXISTS idx_ai_batches_status ON ai_processing_batches(status);
CREATE INDEX IF NOT EXISTS idx_ai_batches_created_by ON ai_processing_batches(created_by);
CREATE INDEX IF NOT EXISTS idx_ai_batches_continent ON ai_processing_batches(continent);

-- Índices nos templates
CREATE INDEX IF NOT EXISTS idx_ai_templates_active ON ai_prompt_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_templates_region_type ON ai_prompt_templates(region_type);

-- Índices nos logs
CREATE INDEX IF NOT EXISTS idx_ai_logs_queue_item ON ai_processing_logs(queue_item_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_batch ON ai_processing_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_level ON ai_processing_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_processing_logs(created_at);

-- ============================================================================
-- FUNÇÕES UTILITÁRIAS
-- ============================================================================

-- Função para calcular progresso de um batch
CREATE OR REPLACE FUNCTION get_batch_progress(batch_uuid UUID)
RETURNS JSONB
LANGUAGE SQL
STABLE
AS $$
    SELECT jsonb_build_object(
        'total', COUNT(*),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'failed', COUNT(*) FILTER (WHERE status = 'failed'),
        'processing', COUNT(*) FILTER (WHERE status = 'processing'),
        'queued', COUNT(*) FILTER (WHERE status = 'queued'),
        'skipped', COUNT(*) FILTER (WHERE status = 'skipped'),
        'progress_percent', 
            CASE 
                WHEN COUNT(*) = 0 THEN 0
                ELSE ROUND((COUNT(*) FILTER (WHERE status IN ('completed', 'skipped'))::DECIMAL / COUNT(*)) * 100, 2)
            END
    )
    FROM ai_processing_queue 
    WHERE batch_id = batch_uuid;
$$;

-- Função para estimar custo total de um batch
CREATE OR REPLACE FUNCTION estimate_batch_cost(batch_uuid UUID)
RETURNS DECIMAL(10,2)
LANGUAGE SQL
STABLE
AS $$
    SELECT COALESCE(SUM(estimated_cost_usd), 0.00)
    FROM ai_processing_queue 
    WHERE batch_id = batch_uuid;
$$;

-- Função para obter próximo item da fila
CREATE OR REPLACE FUNCTION get_next_queue_item()
RETURNS TABLE(
    queue_id UUID,
    region_id UUID,
    region_name VARCHAR(255),
    region_type VARCHAR(20),
    continent VARCHAR(50),
    prompt_text TEXT
)
LANGUAGE SQL
STABLE
AS $$
    SELECT 
        q.id,
        q.region_id,
        q.region_name,
        q.region_type,
        q.continent,
        COALESCE(q.custom_prompt, pt.user_prompt_template) as prompt_text
    FROM ai_processing_queue q
    LEFT JOIN ai_prompt_templates pt ON (
        pt.region_type = q.region_type 
        AND (pt.continent = q.continent OR pt.continent IS NULL)
        AND pt.is_active = true
    )
    WHERE q.status = 'queued'
    ORDER BY q.priority_level ASC, q.queue_order ASC, q.created_at ASC
    LIMIT 1;
$$;

-- ============================================================================
-- TRIGGERS PARA AUDITORIA
-- ============================================================================

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nos templates
CREATE TRIGGER trigger_ai_templates_updated_at
    BEFORE UPDATE ON ai_prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar estatísticas do batch
CREATE OR REPLACE FUNCTION update_batch_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contadores do batch quando status de item muda
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        UPDATE ai_processing_batches 
        SET 
            completed_regions = (
                SELECT COUNT(*) 
                FROM ai_processing_queue 
                WHERE batch_id = NEW.batch_id AND status = 'completed'
            ),
            failed_regions = (
                SELECT COUNT(*) 
                FROM ai_processing_queue 
                WHERE batch_id = NEW.batch_id AND status = 'failed'
            ),
            skipped_regions = (
                SELECT COUNT(*) 
                FROM ai_processing_queue 
                WHERE batch_id = NEW.batch_id AND status = 'skipped'
            )
        WHERE id = NEW.batch_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_batch_stats
    AFTER UPDATE ON ai_processing_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_batch_stats();

-- ============================================================================
-- PERMISSÕES RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_logs ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (admins podem ver tudo, usuários só o que criaram)
CREATE POLICY "Admins can access all queue items" ON ai_processing_queue
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can access their queue items" ON ai_processing_queue
    FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can access all batches" ON ai_processing_batches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can access their batches" ON ai_processing_batches
    FOR ALL USING (created_by = auth.uid());

-- Templates são públicos para leitura, apenas admins podem modificar
CREATE POLICY "Everyone can read templates" ON ai_prompt_templates
    FOR SELECT USING (true);

CREATE POLICY "Admins can modify templates" ON ai_prompt_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Logs seguem as mesmas regras dos batches
CREATE POLICY "Admins can access all logs" ON ai_processing_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================

-- Template profético para países
INSERT INTO ai_prompt_templates (
    name,
    description,
    region_type,
    system_prompt,
    user_prompt_template,
    expected_output_format
) VALUES (
    'Prophetic Country Template',
    'Template profético para análise espiritual territorial de países',
    'country',
    'Você é um Agente de Inteligência Espiritual Profética, capacitado para aconselhar estrategicamente intercessores e líderes espirituais.

Sua missão é gerar relatórios espirituais territoriais resumidos, com foco exclusivo nos seguintes pontos:

🏛️ Sistema Geopolítico – Informações sobre o sistema político e sua carga espiritual
🔥 Alvos de Intercessão – Pontos espirituais estratégicos a serem cobertos em oração com precisão

Sempre responda com linguagem firme, bíblica, profética e estratégica.
Fundamente-se em discernimento espiritual e nas palavras de líderes proféticos confiáveis.
Não invente. Se não tiver base profética clara, diga: "Preciso de mais base espiritual para responder com fidelidade."',
    'Gere um relatório espiritual territorial para: {{region_name}}

🏛️ Sistema Geopolítico – Informações sobre o sistema político e sua carga espiritual, incluindo:
- Tipo de governo
- Cargos principais  
- Locais físicos de poder (como Palácio do Planalto, Congresso, Tribunais etc.)
- Filosofias dominantes espiritualmente discerníveis (ex: progressismo, idolatria mariana, secularismo etc.)

🔥 Alvos de Intercessão – Pontos espirituais estratégicos a serem cobertos em oração com precisão.

Formato da Resposta:

🏛️ Sistema Geopolítico:
- Tipo de governo:
- Cargos principais:
- Locais físicos de poder:
- Filosofia dominante:

🔥 Alvos de Intercessão:
- [item 1]
- [item 2] 
- [item 3]',
    '{"geopoliticalSystem": {"governmentType": "", "mainPositions": [], "powerLocations": [], "dominantPhilosophy": ""}, "intercessionTargets": []}'::jsonb
);

-- Template profético para estados/províncias
INSERT INTO ai_prompt_templates (
    name,
    description,
    region_type,
    system_prompt,
    user_prompt_template,
    expected_output_format
) VALUES (
    'Prophetic State Template',
    'Template profético para análise espiritual territorial de estados/províncias',
    'state',
    'Você é um Agente de Inteligência Espiritual Profética, capacitado para aconselhar estrategicamente intercessores e líderes espirituais.

Sua missão é gerar relatórios espirituais territoriais resumidos para níveis estaduais/provinciais, com foco exclusivo nos seguintes pontos:

🏛️ Sistema Geopolítico Regional – Informações sobre o sistema político regional e sua carga espiritual
🔥 Alvos de Intercessão – Pontos espirituais estratégicos regionais a serem cobertos em oração com precisão

Sempre responda com linguagem firme, bíblica, profética e estratégica.
Fundamente-se em discernimento espiritual e nas palavras de líderes proféticos confiáveis.
Não invente. Se não tiver base profética clara, diga: "Preciso de mais base espiritual para responder com fidelidade."',
    'Gere um relatório espiritual territorial para o estado/província: {{region_name}} em {{parent_region_name}}

🏛️ Sistema Geopolítico Regional – Informações sobre o sistema político regional e sua carga espiritual, incluindo:
- Tipo de governo regional
- Cargos principais (Governador, Assembleia, etc.)
- Locais físicos de poder regional (Palácio do Governo, Assembleia Legislativa, etc.)
- Filosofias dominantes espiritualmente discerníveis na região

🔥 Alvos de Intercessão Regional – Pontos espirituais estratégicos regionais a serem cobertos em oração com precisão.

Formato da Resposta:

🏛️ Sistema Geopolítico Regional:
- Tipo de governo:
- Cargos principais:
- Locais físicos de poder:
- Filosofia dominante:

🔥 Alvos de Intercessão Regional:
- [item 1]
- [item 2] 
- [item 3]',
    '{"regionalGeopoliticalSystem": {"governmentType": "", "mainPositions": [], "powerLocations": [], "dominantPhilosophy": ""}, "regionalIntercessionTargets": []}'::jsonb
);

-- Comentário final
COMMENT ON TABLE ai_processing_queue IS 'Fila de processamento IA para geração de dados espirituais';
COMMENT ON TABLE ai_processing_batches IS 'Batches/campanhas de processamento em lote';
COMMENT ON TABLE ai_prompt_templates IS 'Templates de prompts para IA por tipo de região';
COMMENT ON TABLE ai_processing_logs IS 'Logs detalhados do processamento IA'; 