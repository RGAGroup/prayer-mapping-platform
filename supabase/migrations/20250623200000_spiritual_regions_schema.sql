-- =====================================================
-- SCHEMA PARA SISTEMA DE MAPEAMENTO ESPIRITUAL GLOBAL
-- =====================================================
-- Data: 2025-06-23
-- Descrição: Estrutura hierárquica para dados espirituais
-- Países → Estados → Cidades → Bairros

-- 1. TABELA PRINCIPAL: spiritual_regions
-- =====================================================
CREATE TABLE IF NOT EXISTS spiritual_regions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Informações Geográficas
  name VARCHAR(255) NOT NULL,
  region_type VARCHAR(50) NOT NULL CHECK (region_type IN ('country', 'state', 'city', 'neighborhood')),
  country_code VARCHAR(3), -- ISO 3166-1 alpha-3
  parent_id UUID REFERENCES spiritual_regions(id),
  
  -- Coordenadas
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Dados Espirituais (JSON para flexibilidade)
  spiritual_data JSONB,
  
  -- Metadados
  data_source VARCHAR(50) DEFAULT 'ai_generated' CHECK (data_source IN ('ai_generated', 'manual', 'imported')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_review')),
  confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Índices para performance
  UNIQUE(name, region_type, parent_id)
);

-- 2. TABELA DE QUEUE PARA PROCESSAMENTO AI
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_generation_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Informações da Região
  region_name VARCHAR(255) NOT NULL,
  region_type VARCHAR(50) NOT NULL,
  country_code VARCHAR(3),
  parent_region VARCHAR(255),
  coordinates JSONB, -- {lat: number, lng: number}
  
  -- Status do Processamento
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retry')),
  priority INTEGER DEFAULT 50 CHECK (priority >= 1 AND priority <= 100),
  
  -- Resultados
  result_data JSONB,
  error_message TEXT,
  processing_attempts INTEGER DEFAULT 0,
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- AI Metadata
  ai_assistant_id VARCHAR(100),
  ai_thread_id VARCHAR(100),
  ai_run_id VARCHAR(100),
  
  -- Auditoria
  created_by UUID REFERENCES auth.users(id)
);

-- 3. TABELA DE ATIVIDADES/LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS spiritual_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  region_id UUID REFERENCES spiritual_regions(id) ON DELETE CASCADE,
  
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('prayer_report', 'revival_testimony', 'spiritual_alert', 'intercession_request', 'breakthrough_report')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Dados específicos por tipo
  activity_data JSONB,
  
  -- Status e prioridade
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending_review')),
  urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  
  -- Timing
  event_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Auditoria
  created_by UUID REFERENCES auth.users(id),
  data_source VARCHAR(50) DEFAULT 'user_input'
);

-- 4. ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_type ON spiritual_regions(region_type);
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_parent ON spiritual_regions(parent_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_country ON spiritual_regions(country_code);
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_status ON spiritual_regions(status);
CREATE INDEX IF NOT EXISTS idx_spiritual_regions_source ON spiritual_regions(data_source);
-- Índice de coordenadas será criado em migração separada

CREATE INDEX IF NOT EXISTS idx_ai_queue_status ON ai_generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_ai_queue_priority ON ai_generation_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_ai_queue_created ON ai_generation_queue(created_at);

CREATE INDEX IF NOT EXISTS idx_activities_region ON spiritual_activities(region_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON spiritual_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_urgency ON spiritual_activities(urgency);

-- 5. TRIGGERS PARA UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_spiritual_regions_updated_at 
    BEFORE UPDATE ON spiritual_regions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_spiritual_activities_updated_at 
    BEFORE UPDATE ON spiritual_activities 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE spiritual_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_activities ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (todos podem ler dados aprovados)
CREATE POLICY "Approved regions are viewable by everyone" 
    ON spiritual_regions FOR SELECT 
    USING (status = 'approved');

-- Admins podem fazer tudo
CREATE POLICY "Admins can do everything on regions" 
    ON spiritual_regions FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Moderadores podem aprovar
CREATE POLICY "Moderators can update regions" 
    ON spiritual_regions FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'moderator')
        )
    );

-- Queue policies
CREATE POLICY "Admins can manage AI queue" 
    ON ai_generation_queue FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'moderator')
        )
    );

-- Activities policies
CREATE POLICY "Users can view activities" 
    ON spiritual_activities FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can create activities" 
    ON spiritual_activities FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- 7. DADOS INICIAIS - PAÍSES DA AMÉRICA DO SUL
-- =====================================================
INSERT INTO spiritual_regions (name, region_type, country_code, latitude, longitude, data_source, status, confidence_score) VALUES
('Brasil', 'country', 'BRA', -14.2350, -51.9253, 'manual', 'approved', 100),
('Argentina', 'country', 'ARG', -38.4161, -63.6167, 'manual', 'approved', 100),
('Chile', 'country', 'CHL', -35.6751, -71.5430, 'manual', 'approved', 100),
('Peru', 'country', 'PER', -9.1900, -75.0152, 'manual', 'approved', 100),
('Colômbia', 'country', 'COL', 4.5709, -74.2973, 'manual', 'approved', 100),
('Venezuela', 'country', 'VEN', 6.4238, -66.5897, 'manual', 'approved', 100),
('Equador', 'country', 'ECU', -1.8312, -78.1834, 'manual', 'approved', 100),
('Bolívia', 'country', 'BOL', -16.2902, -63.5887, 'manual', 'approved', 100),
('Paraguai', 'country', 'PRY', -23.4425, -58.4438, 'manual', 'approved', 100),
('Uruguai', 'country', 'URY', -32.5228, -55.7658, 'manual', 'approved', 100),
('Guiana', 'country', 'GUY', 4.8604, -58.9302, 'manual', 'approved', 100),
('Suriname', 'country', 'SUR', 3.9193, -56.0278, 'manual', 'approved', 100)
ON CONFLICT (name, region_type, parent_id) DO NOTHING;

-- 8. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para buscar hierarchy completa
CREATE OR REPLACE FUNCTION get_region_hierarchy(region_uuid UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    region_type VARCHAR,
    level INTEGER
) AS $$
WITH RECURSIVE region_tree AS (
    -- Base case: start with the given region
    SELECT r.id, r.name, r.region_type, r.parent_id, 0 as level
    FROM spiritual_regions r
    WHERE r.id = region_uuid
    
    UNION ALL
    
    -- Recursive case: get parent regions
    SELECT r.id, r.name, r.region_type, r.parent_id, rt.level + 1
    FROM spiritual_regions r
    INNER JOIN region_tree rt ON r.id = rt.parent_id
)
SELECT rt.id, rt.name, rt.region_type, rt.level
FROM region_tree rt
ORDER BY rt.level DESC;
$$ LANGUAGE sql STABLE;

-- Função para contar filhos por região
CREATE OR REPLACE FUNCTION count_child_regions(region_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM spiritual_regions 
    WHERE parent_id = region_uuid;
$$ LANGUAGE sql STABLE;

COMMENT ON TABLE spiritual_regions IS 'Tabela principal para dados espirituais hierárquicos (países → estados → cidades → bairros)';
COMMENT ON TABLE ai_generation_queue IS 'Queue para processamento de dados via AI (OpenAI Assistant)';
COMMENT ON TABLE spiritual_activities IS 'Log de atividades espirituais e relatórios por região'; 