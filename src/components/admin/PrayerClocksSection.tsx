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
        {clocks.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-3 text-ios-gray" />
            <p className="text-ios-gray dark:text-ios-dark-text3">
              Nenhum compromisso de oração cadastrado ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {clocks.map((clock) => (
              <div
                key={clock.id}
                className="p-4 bg-white/50 dark:bg-ios-dark-bg3/50 rounded-ios-lg border border-ios-gray5/20 dark:border-ios-dark-bg4/20 hover:shadow-ios-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Usuário */}
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-ios-blue flex-shrink-0" />
                      <span className="font-semibold text-gray-900 dark:text-ios-dark-text">
                        {clock.display_name || 'Usuário Desconhecido'}
                      </span>
                    </div>

                    {/* Região */}
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-ios-green flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-ios-dark-text2">
                        {clock.region_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {clock.region_type}
                      </Badge>
                    </div>

                    {/* Horário */}
                    <div className="flex items-center gap-4 text-xs text-ios-gray dark:text-ios-dark-text3">
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
                    <div className="flex items-center gap-2 mt-2">
                      {clock.is_recurring && (
                        <Badge className="bg-ios-blue/10 text-ios-blue border-ios-blue/20 text-xs">
                          Recorrente
                        </Badge>
                      )}
                      {clock.notification_enabled && (
                        <Badge className="bg-ios-orange/10 text-ios-orange border-ios-orange/20 text-xs">
                          🔔 Notificações
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <Button
                    onClick={() => handleDelete(clock.id)}
                    variant="ghost"
                    size="sm"
                    className="text-ios-red hover:bg-ios-red/10 rounded-ios-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {clocks.length >= 50 && (
              <div className="mt-4 text-center">
                <p className="text-xs text-ios-gray dark:text-ios-dark-text3">
                  Mostrando os 50 compromissos mais recentes
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

