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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-ios-blue border-t-transparent"></div>
        <span className="ml-3 text-ios-gray dark:text-ios-dark-text2">Carregando estatísticas...</span>
      </div>
    );
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-ios-yellow" />;
      case 2: return <Trophy className="w-5 h-5 text-ios-gray" />;
      case 3: return <Trophy className="w-5 h-5 text-ios-orange" />;
      default: return <Target className="w-5 h-5 text-ios-blue" />;
    }
  };

  const getUserLevelBadge = (totalSeconds: number) => {
    const level = getIntercessorLevel(totalSeconds);
    return (
      <Badge className="bg-ios-blue/10 text-ios-blue border-ios-blue/20 rounded-ios-sm font-medium">
        {level.title}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com ação de atualizar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-ios-dark-text">📊 Estatísticas de Oração</h2>
          <p className="text-ios-gray dark:text-ios-dark-text3">Rankings e dados dos intercessores</p>
        </div>
        <Button 
          onClick={handleUpdateRankings}
          disabled={updating}
          variant="ghost"
          className="flex items-center gap-2 bg-ios-blue/10 hover:bg-ios-blue/20 text-ios-blue border-ios-blue/20 rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
          {updating ? 'Atualizando...' : 'Atualizar Rankings'}
        </Button>
      </div>

      {/* Estatísticas do usuário atual */}
      {userStats && (
        <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-ios-dark-text">
              <div className="w-8 h-8 rounded-ios-sm bg-ios-blue/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-ios-blue" />
              </div>
              Suas Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-ios-blue/5 rounded-ios-lg">
                <div className="text-2xl font-bold text-ios-blue">
                  #{userStats.rank_position || 'N/A'}
                </div>
                <div className="text-sm text-ios-gray dark:text-ios-dark-text3">Posição</div>
              </div>
              <div className="text-center p-4 bg-ios-green/5 rounded-ios-lg">
                <div className="text-2xl font-bold text-ios-green">
                  {formatPrayerTime(userStats.total_prayer_time)}
                </div>
                <div className="text-sm text-ios-gray dark:text-ios-dark-text3">Tempo Total</div>
              </div>
              <div className="text-center p-4 bg-ios-purple/5 rounded-ios-lg">
                <div className="text-2xl font-bold text-ios-purple">
                  {userStats.total_sessions}
                </div>
                <div className="text-sm text-ios-gray dark:text-ios-dark-text3">Sessões</div>
              </div>
              <div className="text-center p-4 bg-ios-orange/5 rounded-ios-lg">
                <div className="text-2xl font-bold text-ios-orange">
                  {userStats.current_streak}
                </div>
                <div className="text-sm text-ios-gray dark:text-ios-dark-text3">Sequência</div>
              </div>
            </div>
            <div className="mt-6 text-center">
              {getUserLevelBadge(userStats.total_prayer_time)}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Ranking de Intercessores */}
        <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-ios-dark-text">
              <div className="w-8 h-8 rounded-ios-sm bg-ios-yellow/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-ios-yellow" />
              </div>
              🏆 Top Intercessores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankings.length > 0 ? (
                rankings.map((intercessor, index) => (
                  <div 
                    key={intercessor.user_id} 
                    className="flex items-center justify-between p-4 bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 rounded-ios-lg hover:bg-ios-gray6/50 dark:hover:bg-ios-dark-bg3/50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-ios-sm bg-white/50 dark:bg-ios-dark-bg4/50 flex items-center justify-center">
                        {getRankIcon(intercessor.rank_position)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-ios-dark-text">
                          {intercessor.full_name}
                        </div>
                        <div className="text-sm text-ios-gray dark:text-ios-dark-text3">
                          {intercessor.total_sessions} sessões
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-ios-blue">
                        {formatPrayerTime(intercessor.total_prayer_time)}
                      </div>
                      <div className="text-xs text-ios-gray dark:text-ios-dark-text3">
                        #{intercessor.rank_position}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-ios-gray dark:text-ios-dark-text3">
                  📊 Nenhum dado de ranking disponível ainda
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Regiões Mais Oradas */}
        <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-ios-dark-text">
              <div className="w-8 h-8 rounded-ios-sm bg-ios-green/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-ios-green" />
              </div>
              🌍 Regiões Mais Oradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRegions.length > 0 ? (
                topRegions.map((region, index) => (
                  <div 
                    key={`${region.region_name}-${region.region_type}`}
                    className="flex items-center justify-between p-4 bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 rounded-ios-lg hover:bg-ios-gray6/50 dark:hover:bg-ios-dark-bg3/50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-ios-sm bg-white/50 dark:bg-ios-dark-bg4/50 flex items-center justify-center text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-ios-dark-text">
                          {region.region_name}
                        </div>
                        <div className="text-sm text-ios-gray dark:text-ios-dark-text3">
                          {region.unique_intercessors} intercessores
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-ios-green">
                        {formatPrayerTime(region.total_prayer_time)}
                      </div>
                      <div className="text-xs text-ios-gray dark:text-ios-dark-text3">
                        {region.total_sessions} sessões
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-ios-gray dark:text-ios-dark-text3">
                  🌍 Nenhuma região com orações registradas ainda
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Gerais */}
      <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-ios-dark-text">
            <div className="w-8 h-8 rounded-ios-sm bg-ios-purple/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-ios-purple" />
            </div>
            📈 Estatísticas Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-ios-blue/5 rounded-ios-lg">
              <div className="text-3xl font-bold text-ios-blue">
                {rankings.reduce((total, r) => total + r.total_sessions, 0)}
              </div>
              <div className="text-sm text-ios-gray dark:text-ios-dark-text3">Total de Sessões</div>
            </div>
            <div className="text-center p-6 bg-ios-green/5 rounded-ios-lg">
              <div className="text-3xl font-bold text-ios-green">
                {formatPrayerTime(rankings.reduce((total, r) => total + r.total_prayer_time, 0))}
              </div>
              <div className="text-sm text-ios-gray dark:text-ios-dark-text3">Tempo Total de Oração</div>
            </div>
            <div className="text-center p-6 bg-ios-purple/5 rounded-ios-lg">
              <div className="text-3xl font-bold text-ios-purple">
                {rankings.length}
              </div>
              <div className="text-sm text-ios-gray dark:text-ios-dark-text3">Intercessores Ativos</div>
            </div>
            <div className="text-center p-6 bg-ios-orange/5 rounded-ios-lg">
              <div className="text-3xl font-bold text-ios-orange">
                {topRegions.length}
              </div>
              <div className="text-sm text-ios-gray dark:text-ios-dark-text3">Regiões Cobertas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-ios-blue/5 border-ios-blue/20 rounded-ios-xl shadow-ios-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-ios-blue mb-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-ios-sm bg-ios-blue/10 flex items-center justify-center">
              💡
            </div>
            Como Funciona
          </h3>
          <ul className="text-sm text-ios-gray dark:text-ios-dark-text3 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-ios-blue">•</span>
              <span><strong>Rankings:</strong> Calculados automaticamente baseados no tempo total de oração</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ios-blue">•</span>
              <span><strong>Níveis:</strong> Sistema de progressão desde "Semente de Fé" até "Profeta das Nações"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ios-blue">•</span>
              <span><strong>Sequência:</strong> Dias consecutivos orando (resetada se pular um dia)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-ios-blue">•</span>
              <span><strong>Atualização:</strong> Estatísticas são atualizadas em tempo real após cada sessão</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}; 