import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  getIntercessorRankings, 
  getTopPrayedRegions, 
  getCurrentUserStats,
  formatPrayerTime,
  getIntercessorLevel,
  updateRankings
} from '@/services/prayerSessionService';
import { Trophy, Crown, Target, Clock, Users, TrendingUp, RefreshCw } from 'lucide-react';

interface PrayerStatsTabProps {
  // Props opcionais para futura extensão
}

export const PrayerStatsTab: React.FC<PrayerStatsTabProps> = () => {
  const [rankings, setRankings] = useState<any[]>([]);
  const [topRegions, setTopRegions] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [rankingsData, regionsData, userStatsData] = await Promise.all([
        getIntercessorRankings(10),
        getTopPrayedRegions(10),
        getCurrentUserStats()
      ]);

      setRankings(rankingsData);
      setTopRegions(regionsData);
      setUserStats(userStatsData);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRankings = async () => {
    try {
      setUpdating(true);
      await updateRankings();
      await loadData(); // Recarregar dados
      console.log('✅ Rankings atualizados!');
    } catch (error) {
      console.error('❌ Erro ao atualizar rankings:', error);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando estatísticas...</span>
      </div>
    );
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3: return <Trophy className="w-5 h-5 text-amber-600" />;
      default: return <Target className="w-5 h-5 text-blue-500" />;
    }
  };

  const getUserLevelBadge = (totalSeconds: number) => {
    const level = getIntercessorLevel(totalSeconds);
    return (
      <Badge variant="secondary" className={level.color}>
        {level.title}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com ação de atualizar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Estatísticas de Oração</h2>
          <p className="text-gray-600">Rankings e dados dos intercessores</p>
        </div>
        <Button 
          onClick={handleUpdateRankings}
          disabled={updating}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
          {updating ? 'Atualizando...' : 'Atualizar Rankings'}
        </Button>
      </div>

      {/* Estatísticas do usuário atual */}
      {userStats && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Suas Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  #{userStats.rank_position || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Posição</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatPrayerTime(userStats.total_prayer_time)}
                </div>
                <div className="text-sm text-gray-600">Tempo Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {userStats.total_sessions}
                </div>
                <div className="text-sm text-gray-600">Sessões</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {userStats.current_streak}
                </div>
                <div className="text-sm text-gray-600">Sequência</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              {getUserLevelBadge(userStats.total_prayer_time)}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Ranking de Intercessores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              🏆 Top Intercessores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankings.length > 0 ? (
                rankings.map((intercessor, index) => (
                  <div 
                    key={intercessor.user_id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getRankIcon(intercessor.rank_position)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {intercessor.full_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {intercessor.total_sessions} sessões
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">
                        {formatPrayerTime(intercessor.total_prayer_time)}
                      </div>
                      <div className="text-xs text-gray-500">
                        #{intercessor.rank_position}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  📊 Nenhum dado de ranking disponível ainda
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Regiões Mais Oradas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              🌍 Regiões Mais Oradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRegions.length > 0 ? (
                topRegions.map((region, index) => (
                  <div 
                    key={`${region.region_name}-${region.region_type}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {region.region_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {region.unique_intercessors} intercessores
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatPrayerTime(region.total_prayer_time)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {region.total_sessions} sessões
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  🌍 Nenhuma região com orações registradas ainda
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            📈 Estatísticas Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {rankings.reduce((total, r) => total + r.total_sessions, 0)}
              </div>
              <div className="text-sm text-gray-600">Total de Sessões</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatPrayerTime(rankings.reduce((total, r) => total + r.total_prayer_time, 0))}
              </div>
              <div className="text-sm text-gray-600">Tempo Total de Oração</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {rankings.length}
              </div>
              <div className="text-sm text-gray-600">Intercessores Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {topRegions.length}
              </div>
              <div className="text-sm text-gray-600">Regiões Cobertas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Como Funciona</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Rankings:</strong> Calculados automaticamente baseados no tempo total de oração</li>
            <li>• <strong>Níveis:</strong> Sistema de progressão desde "Semente de Fé" até "Profeta das Nações"</li>
            <li>• <strong>Sequência:</strong> Dias consecutivos orando (resetada se pular um dia)</li>
            <li>• <strong>Atualização:</strong> Estatísticas são atualizadas em tempo real após cada sessão</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}; 