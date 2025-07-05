-- =====================================================
-- SISTEMA DE PERSONAS PARA AGENTE INTELIGENTE
-- Otimizado para OpenAI GPT-4o
-- =====================================================

-- 1. TABELA DE PERSONAS
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identificação da Persona
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Configurações da Persona
  system_prompt TEXT NOT NULL,
  context TEXT,
  
  -- Embeddings (OpenAI text-embedding-3-large: 3072 dimensions)
  embedding VECTOR(3072),
  
  -- Configurações OpenAI GPT-4o
  model VARCHAR(50) DEFAULT 'gpt-4o' CHECK (model IN ('gpt-4o', 'gpt-4o-mini')),
  temperature FLOAT DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 1000 CHECK (max_tokens >= 1 AND max_tokens <= 4096),
  top_p FLOAT DEFAULT 1.0 CHECK (top_p >= 0 AND top_p <= 1),
  
  -- Personalidade e Expertise
  personality JSONB DEFAULT '{}',
  expertise TEXT[] DEFAULT '{}',
  
  -- Configurações Específicas
  spiritual_focus TEXT,
  tone VARCHAR(100),
  style VARCHAR(100),
  
  -- Metadados
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(name, created_by),
  CHECK (LENGTH(name) >= 3 AND LENGTH(name) <= 100),
  CHECK (LENGTH(system_prompt) >= 10)
);

-- 2. TABELA DE TAREFAS DO AGENTE
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relacionamentos
  persona_id UUID REFERENCES agent_personas(id) ON DELETE CASCADE,
  region_id UUID REFERENCES spiritual_regions(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Configurações da Tarefa
  task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('spiritual_data', 'prayer_points', 'cultural_context', 'historical_context', 'demographic_data', 'economic_context', 'religious_mapping')),
  
  -- Status da Tarefa
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'awaiting_approval')),
  priority INTEGER DEFAULT 50 CHECK (priority >= 1 AND priority <= 100),
  
  -- Dados de Entrada
  input_data JSONB,
  prompt_used TEXT,
  
  -- Resultados
  result_data JSONB,
  raw_response TEXT,
  
  -- Métricas
  tokens_used INTEGER DEFAULT 0,
  processing_time_ms INTEGER DEFAULT 0,
  confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Aprovação
  user_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  -- Errors
  error_message TEXT,
  error_code VARCHAR(50),
  retry_count INTEGER DEFAULT 0,
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE SESSÕES DE PROCESSAMENTO
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Configurações da Sessão
  session_name VARCHAR(255) NOT NULL,
  description TEXT,
  persona_id UUID REFERENCES agent_personas(id) ON DELETE CASCADE,
  
  -- Filtros aplicados
  target_regions UUID[] DEFAULT '{}',
  task_types TEXT[] DEFAULT '{}',
  
  -- Status da Sessão
  status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'running', 'paused', 'completed', 'cancelled', 'failed')),
  
  -- Progresso
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  failed_tasks INTEGER DEFAULT 0,
  
  -- Métricas
  total_tokens_used INTEGER DEFAULT 0,
  total_processing_time_ms INTEGER DEFAULT 0,
  estimated_cost_usd DECIMAL(10, 4) DEFAULT 0,
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Auditoria
  created_by UUID REFERENCES auth.users(id)
);

-- 4. ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_agent_personas_user ON agent_personas(created_by);
CREATE INDEX IF NOT EXISTS idx_agent_personas_active ON agent_personas(is_active);
CREATE INDEX IF NOT EXISTS idx_agent_personas_default ON agent_personas(is_default);
CREATE INDEX IF NOT EXISTS idx_agent_personas_name ON agent_personas(name);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_persona ON agent_tasks(persona_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_region ON agent_tasks(region_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_type ON agent_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created ON agent_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_approval ON agent_tasks(user_approved);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_user ON agent_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_persona ON agent_sessions(persona_id);

-- 5. TRIGGERS PARA UPDATED_AT
-- =====================================================
CREATE TRIGGER update_agent_personas_updated_at 
    BEFORE UPDATE ON agent_personas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_tasks_updated_at 
    BEFORE UPDATE ON agent_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_sessions_updated_at 
    BEFORE UPDATE ON agent_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para buscar personas similares por embedding
CREATE OR REPLACE FUNCTION find_similar_personas(
  query_embedding VECTOR(3072),
  similarity_threshold FLOAT DEFAULT 0.8,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  persona_id UUID,
  name VARCHAR(255),
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    (1 - (p.embedding <-> query_embedding)) as similarity
  FROM agent_personas p
  WHERE p.is_active = true
    AND p.embedding IS NOT NULL
    AND (1 - (p.embedding <-> query_embedding)) >= similarity_threshold
  ORDER BY similarity DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular estatísticas de sessão
CREATE OR REPLACE FUNCTION calculate_session_stats(session_uuid UUID)
RETURNS TABLE(
  total_tasks INTEGER,
  completed_tasks INTEGER,
  failed_tasks INTEGER,
  pending_tasks INTEGER,
  success_rate FLOAT,
  total_tokens INTEGER,
  estimated_cost DECIMAL(10, 4)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::INTEGER as completed_tasks,
    COUNT(CASE WHEN t.status = 'failed' THEN 1 END)::INTEGER as failed_tasks,
    COUNT(CASE WHEN t.status IN ('pending', 'processing') THEN 1 END)::INTEGER as pending_tasks,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::FLOAT / COUNT(*)::FLOAT) * 100, 2)
      ELSE 0
    END as success_rate,
    COALESCE(SUM(t.tokens_used), 0)::INTEGER as total_tokens,
    ROUND(COALESCE(SUM(t.tokens_used), 0) * 0.00003, 4) as estimated_cost -- GPT-4o pricing
  FROM agent_tasks t
  WHERE EXISTS (
    SELECT 1 FROM agent_sessions s 
    WHERE s.id = session_uuid 
    AND t.persona_id = s.persona_id
    AND t.created_at >= s.created_at
  );
END;
$$ LANGUAGE plpgsql;

-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE agent_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;

-- Policies para personas
CREATE POLICY "Users can view their own personas" ON agent_personas
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create personas" ON agent_personas
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own personas" ON agent_personas
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own personas" ON agent_personas
    FOR DELETE USING (created_by = auth.uid());

-- Policies para tasks
CREATE POLICY "Users can view their own tasks" ON agent_tasks
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create tasks" ON agent_tasks
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own tasks" ON agent_tasks
    FOR UPDATE USING (created_by = auth.uid());

-- Policies para sessions
CREATE POLICY "Users can view their own sessions" ON agent_sessions
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create sessions" ON agent_sessions
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own sessions" ON agent_sessions
    FOR UPDATE USING (created_by = auth.uid());

-- Admins podem ver tudo
CREATE POLICY "Admins can view all personas" ON agent_personas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all tasks" ON agent_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all sessions" ON agent_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- 8. PERSONAS PADRÃO
-- =====================================================
INSERT INTO agent_personas (
    name, 
    description, 
    system_prompt, 
    context,
    model,
    temperature,
    max_tokens,
    personality,
    expertise,
    spiritual_focus,
    tone,
    style,
    is_default,
    created_by
) VALUES 
(
    'Atalaia - Intercessor Espiritual',
    'Especialista em mapeamento espiritual e intercessão, focado em identificar necessidades espirituais específicas de cada região.',
    'Você é Atalaia, um especialista em mapeamento espiritual e intercessão. Sua missão é identificar necessidades espirituais específicas de cada região do mundo, baseando-se em princípios bíblicos de intercessão. Você tem conhecimento profundo sobre contextos culturais, históricos e espirituais globais. Sempre mantenha um tom respeitoso e informativo, focado em oração e intercessão.',
    'Especialista em geografia espiritual com foco em identificar pontos estratégicos de oração e necessidades espirituais específicas de cada região.',
    'gpt-4o',
    0.7,
    1500,
    '{"tone": "Respeitoso e informativo", "style": "Focado em oração", "approach": "Baseado em princípios bíblicos"}',
    '{"Intercessão", "Geografia Espiritual", "Contexto Cultural", "História Espiritual", "Estratégias de Oração"}',
    'Identificar necessidades espirituais específicas e pontos estratégicos de oração',
    'Respeitoso, informativo, focado em oração',
    'Baseado em princípios bíblicos de intercessão',
    true,
    (SELECT id FROM auth.users WHERE email = 'admin@atalaia.com' LIMIT 1)
);

-- 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE agent_personas IS 'Tabela para armazenar personas personalizadas do agente com embeddings OpenAI';
COMMENT ON TABLE agent_tasks IS 'Tabela para gerenciar tarefas do agente com controle de aprovação';
COMMENT ON TABLE agent_sessions IS 'Tabela para gerenciar sessões de processamento em lote';

COMMENT ON COLUMN agent_personas.embedding IS 'Vetor de embedding OpenAI text-embedding-3-large (3072 dimensões)';
COMMENT ON COLUMN agent_personas.system_prompt IS 'Prompt do sistema que define a personalidade da persona';
COMMENT ON COLUMN agent_personas.temperature IS 'Controla a criatividade das respostas (0-2)';
COMMENT ON COLUMN agent_personas.max_tokens IS 'Limite máximo de tokens por resposta';

COMMENT ON COLUMN agent_tasks.confidence_score IS 'Nível de confiança da IA na resposta gerada (0-100)';
COMMENT ON COLUMN agent_tasks.user_approved IS 'Indica se o usuário aprovou o resultado';
COMMENT ON COLUMN agent_tasks.tokens_used IS 'Quantidade de tokens consumidos na geração';

-- =====================================================
-- SISTEMA DE PERSONAS CRIADO COM SUCESSO
-- Otimizado para OpenAI GPT-4o
-- ===================================================== 

DELETE FROM agent_personas WHERE name = 'Atalaia - Intercessor Espiritual'; 