/**
 * PRAYER CLOCKS SECTION
 * Seção para visualizar todos os Relógios de Oração (Admin)
 * Agrupado por região com visualização expansível
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Calendar, MapPin, TrendingUp, RefreshCw, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  getAllClocks,
  deactivatePrayerClock,
  getDayName,
  formatTime,
  formatDuration,
  type PrayerClock
} from '@/services/prayerClockService';

interface PrayerClocksSectionProps {
  isAdmin: boolean;
}

interface RegionGroup {
  region_name: string;
  region_type: string;
  clocks: (PrayerClock & { display_name?: string })[];
  totalIntercessors: number;
  coveragePercentage: number;
}

export const PrayerClocksSection: React.FC<PrayerClocksSectionProps> = ({ isAdmin }) => {
  const [clocks, setClocks] = useState<(PrayerClock & { display_name?: string })[]>([]);
  const [regionGroups, setRegionGroups] = useState<RegionGroup[]>([]);
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadClocks();
    }
  }, [isAdmin]);

  const loadClocks = async () => {
    setLoading(true);
    const data = await getAllClocks(100); // Aumentei o limite
    setClocks(data);

    // Agrupar por região
    const groups = groupByRegion(data);
    setRegionGroups(groups);

    setLoading(false);
  };

  const groupByRegion = (clocks: (PrayerClock & { display_name?: string })[]): RegionGroup[] => {
    const groupMap = new Map<string, (PrayerClock & { display_name?: string })[]>();

    // Agrupar por região
    clocks.forEach(clock => {
      const key = `${clock.region_name}|${clock.region_type}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(clock);
    });

    // Converter para array e calcular estatísticas
    const groups: RegionGroup[] = [];
    groupMap.forEach((clocks, key) => {
      const [region_name, region_type] = key.split('|');

      // Calcular intercessores únicos
      const uniqueUsers = new Set(clocks.map(c => c.user_id));

      // Calcular cobertura (168 horas na semana)
      const coveredHours = new Set<string>();
      clocks.forEach(clock => {
        if (clock.is_recurring && clock.day_of_week !== null) {
          const key = `${clock.day_of_week}-${clock.start_time}`;
          coveredHours.add(key);
        }
      });
      const coveragePercentage = (coveredHours.size / 168) * 100;

      groups.push({
        region_name,
        region_type,
        clocks,
        totalIntercessors: uniqueUsers.size,
        coveragePercentage: Math.round(coveragePercentage * 10) / 10,
      });
    });

    // Ordenar por cobertura (maior primeiro)
    return groups.sort((a, b) => b.coveragePercentage - a.coveragePercentage);
  };

  const toggleRegion = (regionName: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(regionName)) {
      newExpanded.delete(regionName);
    } else {
      newExpanded.add(regionName);
    }
    setExpandedRegions(newExpanded);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClocks();
    setRefreshing(false);
  };

  const handleDelete = async (id: string, regionName: string) => {
    if (confirm(`Tem certeza que deseja remover este compromisso de ${regionName}?`)) {
      const success = await deactivatePrayerClock(id);
      if (success) {
        alert('✅ Compromisso removido com sucesso!');
        loadClocks();
      } else {
        alert('❌ Erro ao remover compromisso.');
      }
    }
  };

  const getRegionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'country': 'País',
      'continent': 'Continente',
      'state': 'Estado',
      'city': 'Cidade',
      'neighborhood': 'Bairro',
    };
    return labels[type] || type;
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg">
        <CardContent className="p-8 text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-ios-blue" />
          <p className="text-ios-gray dark:text-ios-dark-text3">Carregando relógios de oração...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-ios-dark-text">
            <div className="w-8 h-8 rounded-ios-sm bg-ios-indigo/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-ios-indigo" />
            </div>
            🕐 Relógios de Oração (Todos os Usuários)
          </CardTitle>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 bg-ios-indigo/10 hover:bg-ios-indigo/20 text-ios-indigo rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {regionGroups.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-3 text-ios-gray" />
            <p className="text-ios-gray dark:text-ios-dark-text3">
              Nenhum compromisso de oração cadastrado ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Estatísticas gerais */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-ios-blue/5 rounded-ios-lg border border-ios-blue/10">
                <div className="text-xs text-ios-gray dark:text-ios-dark-text3 mb-1">Total de Regiões</div>
                <div className="text-2xl font-bold text-ios-blue">{regionGroups.length}</div>
              </div>
              <div className="p-3 bg-ios-green/5 rounded-ios-lg border border-ios-green/10">
                <div className="text-xs text-ios-gray dark:text-ios-dark-text3 mb-1">Total de Compromissos</div>
                <div className="text-2xl font-bold text-ios-green">{clocks.length}</div>
              </div>
              <div className="p-3 bg-ios-purple/5 rounded-ios-lg border border-ios-purple/10">
                <div className="text-xs text-ios-gray dark:text-ios-dark-text3 mb-1">Intercessores Únicos</div>
                <div className="text-2xl font-bold text-ios-purple">
                  {new Set(clocks.map(c => c.user_id)).size}
                </div>
              </div>
            </div>

            {/* Lista de regiões agrupadas */}
            {regionGroups.map((group) => {
              const isExpanded = expandedRegions.has(group.region_name);

              return (
                <div
                  key={`${group.region_name}-${group.region_type}`}
                  className="bg-white/50 dark:bg-ios-dark-bg3/50 rounded-ios-lg border border-ios-gray5/20 dark:border-ios-dark-bg4/20 overflow-hidden"
                >
                  {/* Header da região (clicável) */}
                  <button
                    onClick={() => toggleRegion(group.region_name)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/80 dark:hover:bg-ios-dark-bg3/80 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Ícone de expandir/colapsar */}
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-ios-blue flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-ios-gray flex-shrink-0" />
                      )}

                      {/* Nome da região */}
                      <div className="flex items-center gap-2 flex-1">
                        <MapPin className="w-5 h-5 text-ios-green flex-shrink-0" />
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900 dark:text-ios-dark-text">
                            {group.region_name}
                          </h3>
                          <p className="text-xs text-ios-gray dark:text-ios-dark-text3">
                            {getRegionTypeLabel(group.region_type)}
                          </p>
                        </div>
                      </div>

                      {/* Estatísticas */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-ios-gray dark:text-ios-dark-text3">Cobertura</div>
                          <div className="font-semibold text-ios-blue">
                            {group.coveragePercentage}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-ios-gray dark:text-ios-dark-text3">Intercessores</div>
                          <div className="font-semibold text-ios-green">
                            {group.totalIntercessors}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-ios-gray dark:text-ios-dark-text3">Compromissos</div>
                          <div className="font-semibold text-ios-purple">
                            {group.clocks.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Conteúdo expandido (horários) */}
                  {isExpanded && (
                    <div className="border-t border-ios-gray5/20 dark:border-ios-dark-bg4/20 bg-white/30 dark:bg-ios-dark-bg4/30">
                      <div className="p-4 space-y-2">
                        {group.clocks.map((clock) => (
                          <div
                            key={clock.id}
                            className="p-3 bg-white/60 dark:bg-ios-dark-bg3/60 rounded-ios-md border border-ios-gray5/10 dark:border-ios-dark-bg4/10 flex items-center justify-between gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              {/* Usuário */}
                              <div className="flex items-center gap-2 mb-1">
                                <Users className="w-3 h-3 text-ios-blue flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">
                                  {clock.display_name || 'Usuário Desconhecido'}
                                </span>
                              </div>

                              {/* Horário */}
                              <div className="flex items-center gap-3 text-xs text-ios-gray dark:text-ios-dark-text3">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {clock.is_recurring
                                    ? `${getDayName(clock.day_of_week || 0)}s`
                                    : new Date(clock.specific_date || '').toLocaleDateString('pt-BR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(clock.start_time)} ({formatDuration(clock.duration_minutes)})
                                </span>
                              </div>

                              {/* Badges */}
                              <div className="flex items-center gap-1 mt-1">
                                {clock.is_recurring && (
                                  <Badge className="bg-ios-blue/10 text-ios-blue border-ios-blue/20 text-xs py-0 px-1.5">
                                    Recorrente
                                  </Badge>
                                )}
                                {clock.notification_enabled && (
                                  <Badge className="bg-ios-orange/10 text-ios-orange border-ios-orange/20 text-xs py-0 px-1.5">
                                    🔔
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Botão deletar */}
                            <Button
                              onClick={() => handleDelete(clock.id, group.region_name)}
                              variant="ghost"
                              size="sm"
                              className="text-ios-red hover:bg-ios-red/10 rounded-ios-md h-8 w-8 p-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {clocks.length >= 100 && (
              <div className="mt-4 text-center">
                <p className="text-xs text-ios-gray dark:text-ios-dark-text3">
                  Mostrando os 100 compromissos mais recentes
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

