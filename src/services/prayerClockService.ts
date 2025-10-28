/**
 * PRAYER CLOCK SERVICE
 * Serviço para gerenciar Relógios de Oração (Prayer Clocks)
 * Modelo: Relógio Global 24/7
 */

import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface PrayerClock {
  id: string;
  user_id: string;
  region_name: string;
  region_type: 'continent' | 'country' | 'state' | 'city' | 'neighborhood';
  region_code?: string;
  day_of_week?: number; // 0=Domingo, 6=Sábado
  specific_date?: string; // ISO date string
  start_time: string; // HH:MM:SS
  duration_minutes: number;
  is_recurring: boolean;
  is_active: boolean;
  notify_before_minutes: number;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrayerClockSession {
  id: string;
  prayer_clock_id: string;
  user_id: string;
  scheduled_time: string;
  actual_start_time?: string;
  actual_duration_seconds?: number;
  completed: boolean;
  skipped: boolean;
  skipped_reason?: string;
  personal_reflection?: string;
  prophetic_word?: string;
  created_at: string;
}

export interface ClockCoverage {
  hour_slot: number; // 0-23
  total_intercessors: number;
  total_duration_minutes: number;
  is_covered: boolean;
}

export interface EmptySlot {
  hour_slot: number;
  day_name: string;
}

export interface UserClockStats {
  total_commitments: number;
  active_commitments: number;
  total_sessions: number;
  completed_sessions: number;
  skipped_sessions: number;
  completion_rate: number;
  total_prayer_time_seconds: number;
  current_streak: number;
}

export interface CreateClockInput {
  region_name: string;
  region_type: 'continent' | 'country' | 'state' | 'city' | 'neighborhood';
  region_code?: string;
  day_of_week?: number;
  specific_date?: string;
  start_time: string;
  duration_minutes: number;
  is_recurring: boolean;
  notify_before_minutes?: number;
}

// =====================================================
// CRUD OPERATIONS
// =====================================================

/**
 * Cria um novo compromisso de oração
 */
export const createPrayerClock = async (input: CreateClockInput): Promise<PrayerClock | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ Usuário não autenticado');
      return null;
    }

    const { data, error } = await supabase
      .from('prayer_clocks')
      .insert({
        user_id: user.id,
        region_name: input.region_name,
        region_type: input.region_type,
        region_code: input.region_code,
        day_of_week: input.day_of_week,
        specific_date: input.specific_date,
        start_time: input.start_time,
        duration_minutes: input.duration_minutes,
        is_recurring: input.is_recurring,
        notify_before_minutes: input.notify_before_minutes || 15,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar compromisso:', error);
      return null;
    }

    console.log('✅ Compromisso criado:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro inesperado ao criar compromisso:', error);
    return null;
  }
};

/**
 * Busca todos os compromissos de uma região
 */
export const getRegionClocks = async (
  regionName: string,
  regionType: string
): Promise<PrayerClock[]> => {
  try {
    const { data, error } = await supabase
      .from('prayer_clocks')
      .select('*')
      .eq('region_name', regionName)
      .eq('region_type', regionType)
      .eq('is_active', true)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar compromissos da região:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar compromissos:', error);
    return [];
  }
};

/**
 * Busca os compromissos do usuário atual
 */
export const getUserClocks = async (): Promise<PrayerClock[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('⚠️ Usuário não logado');
      return [];
    }

    const { data, error } = await supabase
      .from('prayer_clocks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar compromissos do usuário:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar compromissos:', error);
    return [];
  }
};

/**
 * Busca TODOS os compromissos de oração (apenas para admins)
 */
export const getAllClocks = async (limit = 50): Promise<(PrayerClock & { display_name?: string })[]> => {
  try {
    // 1. Buscar os compromissos
    const { data: clocks, error: clocksError } = await supabase
      .from('prayer_clocks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (clocksError) {
      console.error('❌ Erro ao buscar todos os compromissos:', clocksError);
      return [];
    }

    if (!clocks || clocks.length === 0) {
      return [];
    }

    // 2. Buscar os perfis dos usuários
    const userIds = [...new Set(clocks.map(c => c.user_id))];
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
    return clocks.map(clock => ({
      ...clock,
      display_name: profileMap.get(clock.user_id) || 'Usuário Desconhecido',
    }));
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar todos os compromissos:', error);
    return [];
  }
};

/**
 * Atualiza um compromisso
 */
export const updatePrayerClock = async (
  id: string,
  updates: Partial<CreateClockInput>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('prayer_clocks')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao atualizar compromisso:', error);
      return false;
    }

    console.log('✅ Compromisso atualizado');
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado ao atualizar compromisso:', error);
    return false;
  }
};

/**
 * Desativa um compromisso (soft delete)
 */
export const deactivatePrayerClock = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('prayer_clocks')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao desativar compromisso:', error);
      return false;
    }

    console.log('✅ Compromisso desativado');
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado ao desativar compromisso:', error);
    return false;
  }
};

/**
 * Deleta permanentemente um compromisso
 */
export const deletePrayerClock = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('prayer_clocks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar compromisso:', error);
      return false;
    }

    console.log('✅ Compromisso deletado');
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado ao deletar compromisso:', error);
    return false;
  }
};

// =====================================================
// COVERAGE & ANALYTICS
// =====================================================

/**
 * Busca a cobertura 24h de uma região
 */
export const getClockCoverage24h = async (
  regionName: string,
  regionType: string,
  dayOfWeek?: number
): Promise<ClockCoverage[]> => {
  try {
    const { data, error } = await supabase.rpc('get_clock_coverage_24h', {
      p_region_name: regionName,
      p_region_type: regionType,
      p_day_of_week: dayOfWeek || null,
    });

    if (error) {
      console.error('❌ Erro ao buscar cobertura 24h:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar cobertura:', error);
    return [];
  }
};

/**
 * Busca os horários vazios (sem cobertura) de uma região
 */
export const getEmptySlots = async (
  regionName: string,
  regionType: string,
  dayOfWeek?: number
): Promise<EmptySlot[]> => {
  try {
    const { data, error } = await supabase.rpc('get_empty_slots', {
      p_region_name: regionName,
      p_region_type: regionType,
      p_day_of_week: dayOfWeek || null,
    });

    if (error) {
      console.error('❌ Erro ao buscar horários vazios:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar horários vazios:', error);
    return [];
  }
};

/**
 * Busca estatísticas do usuário
 */
export const getUserClockStats = async (): Promise<UserClockStats | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('⚠️ Usuário não logado');
      return null;
    }

    const { data, error } = await supabase.rpc('get_user_clock_stats', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('❌ Erro ao buscar estatísticas do usuário:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar estatísticas:', error);
    return null;
  }
};

// =====================================================
// SESSION MANAGEMENT
// =====================================================

/**
 * Cria uma sessão de oração (quando o usuário realmente ora)
 */
export const createPrayerClockSession = async (
  clockId: string,
  scheduledTime: string,
  actualStartTime: string,
  actualDurationSeconds: number,
  completed: boolean,
  personalReflection?: string,
  propheticWord?: string
): Promise<PrayerClockSession | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('❌ Usuário não autenticado');
      return null;
    }

    const { data, error } = await supabase
      .from('prayer_clock_sessions')
      .insert({
        prayer_clock_id: clockId,
        user_id: user.id,
        scheduled_time: scheduledTime,
        actual_start_time: actualStartTime,
        actual_duration_seconds: actualDurationSeconds,
        completed,
        personal_reflection: personalReflection,
        prophetic_word: propheticWord,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar sessão:', error);
      return null;
    }

    console.log('✅ Sessão criada:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro inesperado ao criar sessão:', error);
    return null;
  }
};

/**
 * Marca uma sessão como pulada
 */
export const skipPrayerClockSession = async (
  clockId: string,
  scheduledTime: string,
  reason?: string
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('❌ Usuário não autenticado');
      return false;
    }

    const { error } = await supabase
      .from('prayer_clock_sessions')
      .insert({
        prayer_clock_id: clockId,
        user_id: user.id,
        scheduled_time: scheduledTime,
        skipped: true,
        skipped_reason: reason,
      });

    if (error) {
      console.error('❌ Erro ao marcar sessão como pulada:', error);
      return false;
    }

    console.log('✅ Sessão marcada como pulada');
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado ao marcar sessão:', error);
    return false;
  }
};

/**
 * Busca as sessões de um compromisso
 */
export const getClockSessions = async (clockId: string): Promise<PrayerClockSession[]> => {
  try {
    const { data, error } = await supabase
      .from('prayer_clock_sessions')
      .select('*')
      .eq('prayer_clock_id', clockId)
      .order('scheduled_time', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar sessões:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar sessões:', error);
    return [];
  }
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Formata horário (HH:MM:SS) para exibição (HH:MM)
 */
export const formatTime = (time: string): string => {
  return time.substring(0, 5); // "10:00:00" -> "10:00"
};

/**
 * Converte dia da semana (número) para nome
 */
export const getDayName = (dayOfWeek: number): string => {
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return days[dayOfWeek] || '';
};

/**
 * Converte dia da semana (número) para nome curto
 */
export const getDayShortName = (dayOfWeek: number): string => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[dayOfWeek] || '';
};

/**
 * Calcula a porcentagem de cobertura
 */
export const calculateCoveragePercentage = (coverage: ClockCoverage[]): number => {
  const coveredHours = coverage.filter(c => c.is_covered).length;
  return Math.round((coveredHours / 24) * 100);
};

/**
 * Verifica se um horário está disponível (tem poucos intercessores)
 */
export const isSlotAvailable = (coverage: ClockCoverage, threshold = 3): boolean => {
  return coverage.total_intercessors < threshold;
};

/**
 * Agrupa compromissos por dia da semana
 */
export const groupClocksByDay = (clocks: PrayerClock[]): Record<number, PrayerClock[]> => {
  const grouped: Record<number, PrayerClock[]> = {};

  clocks.forEach(clock => {
    if (clock.is_recurring && clock.day_of_week !== undefined) {
      if (!grouped[clock.day_of_week]) {
        grouped[clock.day_of_week] = [];
      }
      grouped[clock.day_of_week].push(clock);
    }
  });

  return grouped;
};

/**
 * Formata duração em minutos para texto legível
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

