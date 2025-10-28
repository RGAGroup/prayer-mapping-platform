import { supabase } from '@/integrations/supabase/client';

export interface PrayerSession {
  id?: string;
  user_id: string;
  region_name: string;
  region_type: 'country' | 'state' | 'city' | 'locality';
  duration_seconds: number;
  started_at: string;
  finished_at: string;
  prophetic_word: string;
  personal_reflection?: string;
  spiritual_data?: any;
}

export interface PrayerSessionStats {
  total_sessions: number;
  total_prayer_time: number;
  unique_intercessors: number;
  last_prayer_at?: string;
}

export interface IntercessorRanking {
  user_id: string;
  total_prayer_time: number;
  total_sessions: number;
  regions_prayed_for: number;
  longest_session: number;
  current_streak: number;
  rank_position?: number;
  user_email?: string;
  full_name?: string;
}

/**
 * Salva uma nova sessão de oração no banco de dados
 */
export const savePrayerSession = async (sessionData: Omit<PrayerSession, 'id'>): Promise<PrayerSession | null> => {
  try {
    console.log('💾 [prayerSessionService] Salvando sessão de oração:', sessionData);

    const { data, error } = await supabase
      .from('prayer_sessions')
      .insert([sessionData])
      .select()
      .single();

    if (error) {
      console.error('❌ [prayerSessionService] Erro ao salvar sessão de oração:', error);
      console.error('❌ [prayerSessionService] Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }

    console.log('✅ [prayerSessionService] Sessão de oração salva com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ [prayerSessionService] Erro inesperado ao salvar sessão:', error);
    return null;
  }
};

/**
 * Busca as sessões de oração do usuário atual
 */
export const getUserPrayerSessions = async (limit = 10): Promise<PrayerSession[]> => {
  try {
    const { data, error } = await supabase
      .from('prayer_sessions')
      .select('*')
      .order('finished_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar sessões do usuário:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar sessões:', error);
    return [];
  }
};

/**
 * Busca estatísticas de oração para uma região específica
 */
export const getRegionPrayerStats = async (regionName: string, regionType: string): Promise<PrayerSessionStats | null> => {
  try {
    const { data, error } = await supabase
      .from('region_prayer_stats')
      .select('*')
      .eq('region_name', regionName)
      .eq('region_type', regionType)
      .single();

    if (error) {
      console.log('ℹ️ Nenhuma estatística encontrada para a região:', regionName);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas da região:', error);
    return null;
  }
};

/**
 * Busca as regiões mais oradas
 */
export const getTopPrayedRegions = async (limit = 10): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('region_prayer_stats')
      .select('*')
      .order('total_prayer_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar regiões mais oradas:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar regiões mais oradas:', error);
    return [];
  }
};

/**
 * Busca as regiões menos oradas (que precisam de mais intercessão)
 */
export const getLeastPrayedRegions = async (limit = 10): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('region_prayer_stats')
      .select('*')
      .order('total_prayer_time', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar regiões menos oradas:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar regiões:', error);
    return [];
  }
};

/**
 * Busca o ranking de intercessores
 */
export const getIntercessorRankings = async (limit = 20): Promise<IntercessorRanking[]> => {
  try {
    // Buscar rankings
    const { data: rankingsData, error: rankingsError } = await supabase
      .from('intercessor_rankings')
      .select('*')
      .order('rank_position', { ascending: true })
      .limit(limit);

    if (rankingsError) {
      console.error('❌ Erro ao buscar ranking de intercessores:', rankingsError);
      return [];
    }

    if (!rankingsData || rankingsData.length === 0) {
      console.log('ℹ️ Nenhum ranking encontrado');
      return [];
    }

    // Buscar perfis dos usuários
    const userIds = rankingsData.map(r => r.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('⚠️ Erro ao buscar perfis, continuando sem nomes:', profilesError);
    }

    // Criar mapa de perfis para lookup rápido
    const profilesMap = new Map(
      (profilesData || []).map(p => [p.user_id, p.display_name])
    );

    // Mapear dados combinando rankings com perfis
    return rankingsData.map(item => ({
      user_id: item.user_id,
      total_prayer_time: item.total_prayer_time,
      total_sessions: item.total_sessions,
      regions_prayed_for: item.regions_prayed_for,
      longest_session: item.longest_session,
      current_streak: item.current_streak,
      rank_position: item.rank_position,
      full_name: profilesMap.get(item.user_id) || 'Intercessor Anônimo',
    }));
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar rankings:', error);
    return [];
  }
};

/**
 * Busca estatísticas do usuário atual
 */
export const getCurrentUserStats = async (): Promise<IntercessorRanking | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('intercessor_rankings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.log('ℹ️ Usuário ainda não possui estatísticas');
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas do usuário:', error);
    return null;
  }
};

/**
 * Formata tempo em segundos para formato legível
 */
export const formatPrayerTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

/**
 * Calcula nível de intercessor baseado no tempo total
 */
export const getIntercessorLevel = (totalSeconds: number): {
  level: string;
  title: string;
  color: string;
  nextLevelSeconds?: number;
} => {
  const minutes = totalSeconds / 60;
  
  if (minutes < 30) {
    return {
      level: 'Iniciante',
      title: '🌱 Semente de Fé',
      color: 'text-green-600',
      nextLevelSeconds: 30 * 60,
    };
  } else if (minutes < 120) {
    return {
      level: 'Compromissado',
      title: '🌿 Crescendo na Oração',
      color: 'text-blue-600',
      nextLevelSeconds: 120 * 60,
    };
  } else if (minutes < 300) {
    return {
      level: 'Dedicado',
      title: '🌳 Árvore Plantada',
      color: 'text-purple-600',
      nextLevelSeconds: 300 * 60,
    };
  } else if (minutes < 600) {
    return {
      level: 'Guerreiro',
      title: '⚔️ Guerreiro de Oração',
      color: 'text-red-600',
      nextLevelSeconds: 600 * 60,
    };
  } else if (minutes < 1200) {
    return {
      level: 'Intercessor',
      title: '🔥 Intercessor Poderoso',
      color: 'text-orange-600',
      nextLevelSeconds: 1200 * 60,
    };
  } else {
    return {
      level: 'Profeta',
      title: '👑 Profeta das Nações',
      color: 'text-yellow-600',
    };
  }
};

/**
 * Atualiza rankings (deve ser chamado periodicamente)
 */
export const updateRankings = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('update_rankings');

    if (error) {
      console.error('❌ Erro ao atualizar rankings:', error);
      return false;
    }

    console.log('✅ Rankings atualizados com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado ao atualizar rankings:', error);
    return false;
  }
};

export interface PersonalReflection {
  id: string;
  region_name: string;
  region_type: string;
  duration_seconds: number;
  personal_reflection: string;
  prophetic_word: string;
  created_at: string;
  finished_at: string;
  user_id?: string;
  user_email?: string;
  display_name?: string;
}

/**
 * Busca reflexões pessoais do usuário atual
 */
export const getUserReflections = async (limit = 10): Promise<PersonalReflection[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('⚠️ Usuário não logado');
      return [];
    }

    const { data, error } = await supabase
      .from('prayer_sessions')
      .select('id, region_name, region_type, duration_seconds, personal_reflection, prophetic_word, created_at, finished_at, user_id')
      .eq('user_id', user.id)
      .not('personal_reflection', 'is', null)
      .neq('personal_reflection', '')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar reflexões:', error);
      return [];
    }

    console.log(`✅ ${data?.length || 0} reflexões encontradas`);
    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar reflexões:', error);
    return [];
  }
};

/**
 * Busca reflexões pessoais de TODOS os usuários (apenas para admins)
 */
export const getAllReflections = async (limit = 20): Promise<PersonalReflection[]> => {
  try {
    // 1. Buscar as reflexões
    const { data: sessions, error: sessionsError } = await supabase
      .from('prayer_sessions')
      .select('id, region_name, region_type, duration_seconds, personal_reflection, prophetic_word, created_at, finished_at, user_id')
      .not('personal_reflection', 'is', null)
      .neq('personal_reflection', '')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (sessionsError) {
      console.error('❌ Erro ao buscar todas as reflexões:', sessionsError);
      return [];
    }

    if (!sessions || sessions.length === 0) {
      return [];
    }

    // 2. Buscar os perfis dos usuários
    const userIds = [...new Set(sessions.map(s => s.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('⚠️ Erro ao buscar perfis:', profilesError);
    }

    // 3. Criar um mapa de user_id -> display_name
    const profileMap = new Map<string, string>();
    (profiles || []).forEach(p => {
      profileMap.set(p.user_id, p.display_name || 'Usuário Desconhecido');
    });

    // 4. Combinar os dados
    return sessions.map(session => ({
      id: session.id,
      region_name: session.region_name,
      region_type: session.region_type,
      duration_seconds: session.duration_seconds,
      personal_reflection: session.personal_reflection,
      prophetic_word: session.prophetic_word,
      created_at: session.created_at,
      finished_at: session.finished_at,
      user_id: session.user_id,
      display_name: profileMap.get(session.user_id) || 'Usuário Desconhecido',
    }));
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar todas as reflexões:', error);
    return [];
  }
};