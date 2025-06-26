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
    console.log('💾 Salvando sessão de oração:', sessionData);

    const { data, error } = await supabase
      .from('prayer_sessions')
      .insert([sessionData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar sessão de oração:', error);
      return null;
    }

    console.log('✅ Sessão de oração salva com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro inesperado ao salvar sessão:', error);
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
    console.error('❌ Erro inesperado ao buscar regiões:', error);
    return [];
  }
};

/**
 * Busca o ranking de intercessores
 */
export const getIntercessorRankings = async (limit = 20): Promise<IntercessorRanking[]> => {
  try {
    const { data, error } = await supabase
      .from('intercessor_rankings')
      .select(`
        *,
        user_profiles!intercessor_rankings_user_id_fkey (
          full_name
        )
      `)
      .order('rank_position', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar ranking de intercessores:', error);
      return [];
    }

    // Mapear dados para incluir informações do perfil
    return (data || []).map(item => ({
      user_id: item.user_id,
      total_prayer_time: item.total_prayer_time,
      total_sessions: item.total_sessions,
      regions_prayed_for: item.regions_prayed_for,
      longest_session: item.longest_session,
      current_streak: item.current_streak,
      rank_position: item.rank_position,
      full_name: item.user_profiles?.full_name || 'Intercessor Anônimo',
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