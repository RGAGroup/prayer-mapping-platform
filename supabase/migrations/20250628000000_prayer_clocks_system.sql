-- =====================================================
-- SISTEMA DE RELÓGIOS DE ORAÇÃO (PRAYER CLOCKS)
-- Modelo: Relógio Global 24/7
-- Data: 2025-06-28
-- =====================================================

-- =====================================================
-- 1. TABELA: prayer_clocks
-- Armazena os compromissos de oração dos usuários
-- =====================================================

CREATE TABLE IF NOT EXISTS prayer_clocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Região
  region_name TEXT NOT NULL,
  region_type TEXT NOT NULL CHECK (region_type IN ('country', 'state', 'city')),
  region_code TEXT, -- Código ISO do país (ex: 'BR', 'AR')
  
  -- Agendamento
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Domingo, 6=Sábado (NULL se for data específica)
  specific_date DATE, -- Para compromissos pontuais (NULL se for recorrente)
  start_time TIME NOT NULL, -- Hora de início (ex: '10:00:00')
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 1440), -- Máximo 24h
  
  -- Configurações
  is_recurring BOOLEAN DEFAULT true, -- Se repete semanalmente
  is_active BOOLEAN DEFAULT true, -- Se está ativo
  
  -- Notificações
  notify_before_minutes INTEGER DEFAULT 15 CHECK (notify_before_minutes >= 0), -- Notificar X minutos antes
  notification_enabled BOOLEAN DEFAULT true,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_schedule CHECK (
    (is_recurring = true AND day_of_week IS NOT NULL AND specific_date IS NULL) OR
    (is_recurring = false AND specific_date IS NOT NULL AND day_of_week IS NULL)
  )
);

-- Índices para performance
CREATE INDEX idx_prayer_clocks_user ON prayer_clocks(user_id);
CREATE INDEX idx_prayer_clocks_region ON prayer_clocks(region_name, region_type);
CREATE INDEX idx_prayer_clocks_schedule ON prayer_clocks(day_of_week, start_time) WHERE is_recurring = true;
CREATE INDEX idx_prayer_clocks_specific_date ON prayer_clocks(specific_date) WHERE is_recurring = false;
CREATE INDEX idx_prayer_clocks_active ON prayer_clocks(is_active) WHERE is_active = true;

-- =====================================================
-- 2. TABELA: prayer_clock_sessions
-- Registra quando o usuário realmente orou (execução do compromisso)
-- =====================================================

CREATE TABLE IF NOT EXISTS prayer_clock_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prayer_clock_id UUID NOT NULL REFERENCES prayer_clocks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Agendado vs Real
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL, -- Quando deveria orar
  actual_start_time TIMESTAMP WITH TIME ZONE, -- Quando realmente começou
  actual_duration_seconds INTEGER, -- Quanto tempo realmente orou
  
  -- Status
  completed BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  skipped_reason TEXT, -- Motivo de ter pulado (opcional)
  
  -- Reflexão (opcional)
  personal_reflection TEXT,
  prophetic_word TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_prayer_clock_sessions_clock ON prayer_clock_sessions(prayer_clock_id);
CREATE INDEX idx_prayer_clock_sessions_user ON prayer_clock_sessions(user_id);
CREATE INDEX idx_prayer_clock_sessions_scheduled ON prayer_clock_sessions(scheduled_time);
CREATE INDEX idx_prayer_clock_sessions_completed ON prayer_clock_sessions(completed);

-- =====================================================
-- 3. FUNÇÃO: get_clock_coverage_24h
-- Retorna a cobertura de oração 24h para uma região
-- =====================================================

CREATE OR REPLACE FUNCTION get_clock_coverage_24h(
  p_region_name TEXT,
  p_region_type TEXT,
  p_day_of_week INTEGER DEFAULT NULL -- NULL = todos os dias
)
RETURNS TABLE (
  hour_slot INTEGER, -- 0-23
  total_intercessors BIGINT,
  total_duration_minutes BIGINT,
  is_covered BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH hours AS (
    SELECT generate_series(0, 23) AS hour_slot
  ),
  coverage AS (
    SELECT 
      EXTRACT(HOUR FROM start_time)::INTEGER AS hour_slot,
      COUNT(DISTINCT user_id) AS total_intercessors,
      SUM(duration_minutes) AS total_duration_minutes
    FROM prayer_clocks
    WHERE 
      region_name = p_region_name
      AND region_type = p_region_type
      AND is_active = true
      AND is_recurring = true
      AND (p_day_of_week IS NULL OR day_of_week = p_day_of_week)
    GROUP BY EXTRACT(HOUR FROM start_time)::INTEGER
  )
  SELECT 
    h.hour_slot,
    COALESCE(c.total_intercessors, 0) AS total_intercessors,
    COALESCE(c.total_duration_minutes, 0) AS total_duration_minutes,
    COALESCE(c.total_intercessors, 0) > 0 AS is_covered
  FROM hours h
  LEFT JOIN coverage c ON h.hour_slot = c.hour_slot
  ORDER BY h.hour_slot;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 4. FUNÇÃO: get_empty_slots
-- Retorna os horários vazios (sem cobertura) para uma região
-- =====================================================

CREATE OR REPLACE FUNCTION get_empty_slots(
  p_region_name TEXT,
  p_region_type TEXT,
  p_day_of_week INTEGER DEFAULT NULL
)
RETURNS TABLE (
  hour_slot INTEGER,
  day_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hour_slot,
    CASE p_day_of_week
      WHEN 0 THEN 'Domingo'
      WHEN 1 THEN 'Segunda-feira'
      WHEN 2 THEN 'Terça-feira'
      WHEN 3 THEN 'Quarta-feira'
      WHEN 4 THEN 'Quinta-feira'
      WHEN 5 THEN 'Sexta-feira'
      WHEN 6 THEN 'Sábado'
      ELSE 'Todos os dias'
    END AS day_name
  FROM get_clock_coverage_24h(p_region_name, p_region_type, p_day_of_week)
  WHERE is_covered = false
  ORDER BY hour_slot;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 5. FUNÇÃO: get_user_clock_stats
-- Retorna estatísticas de compromissos do usuário
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_clock_stats(p_user_id UUID)
RETURNS TABLE (
  total_commitments BIGINT,
  active_commitments BIGINT,
  total_sessions BIGINT,
  completed_sessions BIGINT,
  skipped_sessions BIGINT,
  completion_rate NUMERIC,
  total_prayer_time_seconds BIGINT,
  current_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM prayer_clocks WHERE user_id = p_user_id) AS total_commitments,
    (SELECT COUNT(*) FROM prayer_clocks WHERE user_id = p_user_id AND is_active = true) AS active_commitments,
    (SELECT COUNT(*) FROM prayer_clock_sessions WHERE user_id = p_user_id) AS total_sessions,
    (SELECT COUNT(*) FROM prayer_clock_sessions WHERE user_id = p_user_id AND completed = true) AS completed_sessions,
    (SELECT COUNT(*) FROM prayer_clock_sessions WHERE user_id = p_user_id AND skipped = true) AS skipped_sessions,
    (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((COUNT(*) FILTER (WHERE completed = true)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
        END
      FROM prayer_clock_sessions 
      WHERE user_id = p_user_id
    ) AS completion_rate,
    (SELECT COALESCE(SUM(actual_duration_seconds), 0) FROM prayer_clock_sessions WHERE user_id = p_user_id AND completed = true) AS total_prayer_time_seconds,
    0 AS current_streak; -- TODO: Implementar cálculo de streak
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 6. TRIGGER: update_updated_at
-- Atualiza automaticamente o campo updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_prayer_clocks_updated_at
  BEFORE UPDATE ON prayer_clocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE prayer_clocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_clock_sessions ENABLE ROW LEVEL SECURITY;

-- prayer_clocks: Usuários podem ver todos os relógios (para visualizar cobertura global)
CREATE POLICY "prayer_clocks_select_all" ON prayer_clocks
  FOR SELECT
  USING (true);

-- prayer_clocks: Usuários podem inserir seus próprios compromissos
CREATE POLICY "prayer_clocks_insert_own" ON prayer_clocks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- prayer_clocks: Usuários podem atualizar seus próprios compromissos
CREATE POLICY "prayer_clocks_update_own" ON prayer_clocks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- prayer_clocks: Usuários podem deletar seus próprios compromissos
CREATE POLICY "prayer_clocks_delete_own" ON prayer_clocks
  FOR DELETE
  USING (auth.uid() = user_id);

-- prayer_clock_sessions: Usuários podem ver suas próprias sessões
CREATE POLICY "prayer_clock_sessions_select_own" ON prayer_clock_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- prayer_clock_sessions: Usuários podem inserir suas próprias sessões
CREATE POLICY "prayer_clock_sessions_insert_own" ON prayer_clock_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- prayer_clock_sessions: Usuários podem atualizar suas próprias sessões
CREATE POLICY "prayer_clock_sessions_update_own" ON prayer_clock_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 8. COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE prayer_clocks IS 'Armazena os compromissos de oração dos usuários (Relógio de Oração 24/7)';
COMMENT ON TABLE prayer_clock_sessions IS 'Registra as execuções dos compromissos de oração';
COMMENT ON FUNCTION get_clock_coverage_24h IS 'Retorna a cobertura de oração 24h para uma região';
COMMENT ON FUNCTION get_empty_slots IS 'Retorna os horários vazios (sem cobertura) para uma região';
COMMENT ON FUNCTION get_user_clock_stats IS 'Retorna estatísticas de compromissos do usuário';

