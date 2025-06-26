-- Migration: Prayer Sessions System (Simplified)
-- Criado em: 2025-06-26
-- Descrição: Sistema de sessões de oração e estatísticas

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE SESSÕES DE ORAÇÃO
CREATE TABLE IF NOT EXISTS prayer_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    region_name TEXT NOT NULL,
    region_type TEXT NOT NULL CHECK (region_type IN ('country', 'state', 'city', 'locality')),
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ NOT NULL,
    prophetic_word TEXT NOT NULL,
    personal_reflection TEXT,
    spiritual_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE ESTATÍSTICAS POR REGIÃO
CREATE TABLE IF NOT EXISTS region_prayer_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_name TEXT NOT NULL,
    region_type TEXT NOT NULL CHECK (region_type IN ('country', 'state', 'city', 'locality')),
    total_sessions INTEGER DEFAULT 0,
    total_prayer_time INTEGER DEFAULT 0,
    unique_intercessors INTEGER DEFAULT 0,
    last_prayer_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(region_name, region_type)
);

-- 4. TABELA DE RANKING DE INTERCESSORES
CREATE TABLE IF NOT EXISTS intercessor_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_prayer_time INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    regions_prayed_for INTEGER DEFAULT 0,
    longest_session INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_prayer_date DATE,
    rank_position INTEGER,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 5. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_prayer_sessions_user_id ON prayer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_sessions_region ON prayer_sessions(region_name, region_type);
CREATE INDEX IF NOT EXISTS idx_prayer_sessions_date ON prayer_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_region_stats_region ON region_prayer_stats(region_name, region_type);
CREATE INDEX IF NOT EXISTS idx_intercessor_rankings_rank ON intercessor_rankings(rank_position);

-- 6. FUNÇÕES PARA ATUALIZAR ESTATÍSTICAS
CREATE OR REPLACE FUNCTION update_prayer_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas da região
    INSERT INTO region_prayer_stats (region_name, region_type, total_sessions, total_prayer_time, unique_intercessors, last_prayer_at)
    VALUES (NEW.region_name, NEW.region_type, 1, NEW.duration_seconds, 1, NEW.finished_at)
    ON CONFLICT (region_name, region_type) 
    DO UPDATE SET
        total_sessions = region_prayer_stats.total_sessions + 1,
        total_prayer_time = region_prayer_stats.total_prayer_time + NEW.duration_seconds,
        unique_intercessors = (
            SELECT COUNT(DISTINCT user_id) 
            FROM prayer_sessions 
            WHERE region_name = NEW.region_name AND region_type = NEW.region_type
        ),
        last_prayer_at = NEW.finished_at,
        updated_at = NOW();

    -- Atualizar ranking do intercessor
    INSERT INTO intercessor_rankings (user_id, total_prayer_time, total_sessions, regions_prayed_for, longest_session, last_prayer_date)
    VALUES (
        NEW.user_id, 
        NEW.duration_seconds, 
        1,
        1,
        NEW.duration_seconds,
        NEW.finished_at::DATE
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_prayer_time = intercessor_rankings.total_prayer_time + NEW.duration_seconds,
        total_sessions = intercessor_rankings.total_sessions + 1,
        regions_prayed_for = (
            SELECT COUNT(DISTINCT region_name || '|' || region_type) 
            FROM prayer_sessions 
            WHERE user_id = NEW.user_id
        ),
        longest_session = GREATEST(intercessor_rankings.longest_session, NEW.duration_seconds),
        current_streak = CASE 
            WHEN intercessor_rankings.last_prayer_date = NEW.finished_at::DATE - INTERVAL '1 day' THEN 
                intercessor_rankings.current_streak + 1
            WHEN intercessor_rankings.last_prayer_date = NEW.finished_at::DATE THEN 
                intercessor_rankings.current_streak
            ELSE 1
        END,
        last_prayer_date = NEW.finished_at::DATE,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGER PARA ATUALIZAR ESTATÍSTICAS AUTOMATICAMENTE
DROP TRIGGER IF EXISTS trigger_update_prayer_statistics ON prayer_sessions;
CREATE TRIGGER trigger_update_prayer_statistics
    AFTER INSERT ON prayer_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_prayer_statistics();

-- 8. FUNÇÃO PARA ATUALIZAR RANKINGS
CREATE OR REPLACE FUNCTION update_rankings()
RETURNS void AS $$
BEGIN
    -- Atualizar posições no ranking baseado no tempo total de oração
    WITH ranked_users AS (
        SELECT 
            user_id,
            ROW_NUMBER() OVER (ORDER BY total_prayer_time DESC, total_sessions DESC) as new_rank
        FROM intercessor_rankings
        WHERE total_prayer_time > 0
    )
    UPDATE intercessor_rankings 
    SET rank_position = ranked_users.new_rank
    FROM ranked_users
    WHERE intercessor_rankings.user_id = ranked_users.user_id;
END;
$$ LANGUAGE plpgsql;

-- 9. POLÍTICAS RLS (Row Level Security)

-- Prayer Sessions - usuários só veem suas próprias sessões
ALTER TABLE prayer_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prayer sessions" ON prayer_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayer sessions" ON prayer_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayer sessions" ON prayer_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Region Stats - todos podem ver estatísticas das regiões
ALTER TABLE region_prayer_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view region stats" ON region_prayer_stats
    FOR SELECT USING (true);

-- Intercessor Rankings - todos podem ver rankings (sem dados pessoais)
ALTER TABLE intercessor_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rankings" ON intercessor_rankings
    FOR SELECT USING (true);

CREATE POLICY "Users can update own ranking" ON intercessor_rankings
    FOR UPDATE USING (auth.uid() = user_id);

-- 10. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE prayer_sessions IS 'Registra todas as sessões de oração dos usuários';
COMMENT ON TABLE region_prayer_stats IS 'Estatísticas agregadas de oração por região';
COMMENT ON TABLE intercessor_rankings IS 'Ranking e estatísticas dos intercessores';
COMMENT ON FUNCTION update_prayer_statistics() IS 'Atualiza automaticamente as estatísticas quando uma nova sessão é criada';
COMMENT ON FUNCTION update_rankings() IS 'Recalcula as posições no ranking de intercessores';

-- 11. EXECUTAR PRIMEIRA ATUALIZAÇÃO DE RANKINGS
SELECT update_rankings();
