/**
 * USER DASHBOARD
 * Dashboard simplificado para usuários comuns (não-admin)
 * Mostra apenas estatísticas de oração e dados pessoais
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import {
  getIntercessorRankings,
  getTopPrayedRegions,
  getLeastPrayedRegions,
  getCurrentUserStats,
  formatPrayerTime,
  getIntercessorLevel,
  getUserReflections,
  type PersonalReflection
} from '@/services/prayerSessionService';
import { getUserClocks, getDayName, formatTime, formatDuration, type PrayerClock } from '@/services/prayerClockService';
import { 
  Trophy, 
  Crown, 
  Target, 
  Clock, 
  Users, 
  TrendingUp, 
  RefreshCw, 
  BookOpen, 
  Calendar, 
  AlertCircle,
  Home,
  MapPin,
  Sparkles,
  Heart
} from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [rankings, setRankings] = useState<any[]>([]);
  const [topRegions, setTopRegions] = useState<any[]>([]);
  const [leastPrayedRegions, setLeastPrayedRegions] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [reflections, setReflections] = useState<PersonalReflection[]>([]);
  const [userClocks, setUserClocks] = useState<PrayerClock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [rankingsData, regionsData, leastRegionsData, userStatsData, reflectionsData, clocksData] = await Promise.all([
        getIntercessorRankings(10),
        getTopPrayedRegions(10),
        getLeastPrayedRegions(10),
        getCurrentUserStats(),
        getUserReflections(10),
        getUserClocks()
      ]);

      setRankings(rankingsData);
      setTopRegions(regionsData);
      setLeastPrayedRegions(leastRegionsData);
      setUserStats(userStatsData);
      setReflections(reflectionsData);
      setUserClocks(clocksData);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleClose = () => {
    navigate('/');
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray6 to-white dark:from-ios-dark-bg to-ios-dark-bg2 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-ios-xl bg-ios-glass backdrop-blur-ios border border-white/20 flex items-center justify-center mb-6 animate-ios-bounce">
            <div className="w-8 h-8 border-3 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-ios-gray dark:text-ios-dark-text2 font-medium">{t('userDashboard.loading')}</p>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-ios-gray6 to-white dark:from-ios-dark-bg to-ios-dark-bg2">
      {/* Header */}
      <div className="bg-white/80 dark:bg-ios-dark-bg2/80 backdrop-blur-ios border-b border-ios-gray5/30 dark:border-ios-dark-bg4/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-ios-dark-text tracking-tight truncate">
                {t('userDashboard.title')}
              </h1>
              <p className="text-ios-gray dark:text-ios-dark-text3 font-medium mt-1 text-sm sm:text-base">
                {t('userDashboard.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="ios-button bg-ios-gray6/50 dark:bg-ios-dark-bg3/50 hover:bg-ios-gray6 dark:hover:bg-ios-dark-bg3 text-ios-gray dark:text-ios-dark-text2 border border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-md text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                <RefreshCw className={`w-4 h-4 mr-1 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
              </Button>
              <Button 
                onClick={handleClose}
                className="ios-button bg-ios-blue/10 hover:bg-ios-blue/20 text-ios-blue border border-ios-blue/20 rounded-ios-md text-xs sm:text-sm px-2 sm:px-3 py-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Home className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Voltar ao Mapa</span>
                <span className="sm:hidden">Mapa</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Suas Estatísticas */}
          <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-ios-dark-text">
                <div className="w-8 h-8 rounded-ios-sm bg-ios-blue/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-ios-blue" />
                </div>
                {t('userDashboard.yourStats')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-ios-blue/5 to-ios-blue/10 rounded-ios-lg border border-ios-blue/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-ios-blue" />
                      <span className="text-sm text-ios-gray dark:text-ios-dark-text3">{t('userDashboard.totalTime')}</span>
                    </div>
                    <p className="text-2xl font-bold text-ios-blue">{formatPrayerTime(userStats.total_prayer_time)}</p>
                    <div className="mt-2">
                      {getUserLevelBadge(userStats.total_prayer_time)}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-ios-green/5 to-ios-green/10 rounded-ios-lg border border-ios-green/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-ios-green" />
                      <span className="text-sm text-ios-gray dark:text-ios-dark-text3">{t('userDashboard.totalSessions')}</span>
                    </div>
                    <p className="text-2xl font-bold text-ios-green">{userStats.total_sessions}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-ios-purple/5 to-ios-purple/10 rounded-ios-lg border border-ios-purple/20">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-ios-purple" />
                      <span className="text-sm text-ios-gray dark:text-ios-dark-text3">{t('userDashboard.regionsReached')}</span>
                    </div>
                    <p className="text-2xl font-bold text-ios-purple">{userStats.regions_prayed_for || 0}</p>
                    <p className="text-xs text-ios-gray dark:text-ios-dark-text3 mt-1">
                      {userStats.regions_prayed_for === 1 ? t('userDashboard.regionReached') : t('userDashboard.regionsReachedPlural')}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-ios-gray dark:text-ios-dark-text3 py-4">
                  Nenhuma estatística disponível ainda. Comece a orar!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Grid de 2 colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Intercessores */}
            <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-ios-dark-text">
                  <div className="w-8 h-8 rounded-ios-sm bg-ios-yellow/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-ios-yellow" />
                  </div>
                  {t('userDashboard.topIntercessors')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rankings.slice(0, 10).map((rank, index) => (
                    <div
                      key={rank.user_id}
                      className="flex items-center justify-between p-3 bg-white/50 dark:bg-ios-dark-bg3/50 rounded-ios-lg hover:shadow-ios-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-ios-sm bg-ios-gray6/50 dark:bg-ios-dark-bg4/50 flex items-center justify-center">
                          {getRankIcon(index + 1)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-ios-dark-text">
                            {rank.display_name || 'Intercessor Anônimo'}
                          </p>
                          <p className="text-xs text-ios-gray dark:text-ios-dark-text3">
                            {rank.total_sessions} {t('userDashboard.sessions')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-ios-blue">{formatPrayerTime(rank.total_prayer_time)}</p>
                      </div>
                    </div>
                  ))}
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
                  {t('userDashboard.topRegions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topRegions.map((region, index) => (
                    <div
                      key={`${region.region_name}-${region.region_type}`}
                      className="flex items-center justify-between p-3 bg-white/50 dark:bg-ios-dark-bg3/50 rounded-ios-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-lg font-bold text-ios-green w-6 text-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-ios-dark-text truncate">
                            {region.region_name}
                          </p>
                          <p className="text-xs text-ios-gray dark:text-ios-dark-text3">
                            {region.total_sessions} {t('userDashboard.sessions')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-ios-green">{formatPrayerTime(region.total_prayer_time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regiões Menos Oradas */}
          <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-ios-dark-text">
                <div className="w-8 h-8 rounded-ios-sm bg-ios-orange/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-ios-orange" />
                </div>
                {t('userDashboard.leastRegions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {leastPrayedRegions.map((region) => (
                  <div
                    key={`${region.region_name}-${region.region_type}`}
                    className="p-3 bg-gradient-to-br from-ios-orange/5 to-ios-orange/10 rounded-ios-lg border border-ios-orange/20"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Heart className="w-4 h-4 text-ios-orange flex-shrink-0 mt-0.5" />
                      <p className="font-semibold text-gray-900 dark:text-ios-dark-text text-sm">
                        {region.region_name}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ios-gray dark:text-ios-dark-text3">
                        {region.total_sessions} {region.total_sessions === 1 ? t('userDashboard.session') : t('userDashboard.sessions')}
                      </span>
                      <span className="font-semibold text-ios-orange">
                        {formatPrayerTime(region.total_prayer_time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reflexões Pessoais */}
          <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-ios-dark-text">
                <div className="w-8 h-8 rounded-ios-sm bg-ios-purple/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-ios-purple" />
                </div>
                {t('userDashboard.yourReflections')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reflections.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-ios-gray" />
                  <p className="text-ios-gray dark:text-ios-dark-text3">
                    {t('userDashboard.noReflections')}
                  </p>
                  <p className="text-xs text-ios-gray dark:text-ios-dark-text3 mt-1">
                    {t('userDashboard.addReflections')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reflections.map((reflection, index) => (
                    <div
                      key={reflection.id}
                      className="p-4 bg-white/50 dark:bg-ios-dark-bg3/50 rounded-ios-lg border border-ios-gray5/20 dark:border-ios-dark-bg4/20"
                    >
                      {/* Região e Data */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <MapPin className="w-4 h-4 text-ios-green flex-shrink-0" />
                          <span className="font-semibold text-ios-green truncate">
                            {reflection.region_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-ios-gray dark:text-ios-dark-text3 flex-shrink-0">
                          <Calendar className="w-3 h-3" />
                          {new Date(reflection.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      {/* Reflexão */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 dark:text-ios-dark-text2 italic">
                          "{reflection.personal_reflection}"
                        </p>
                      </div>

                      {/* Palavra Profética (se houver) */}
                      {reflection.prophetic_word && (
                        <div className="mt-3 p-3 bg-ios-blue/5 rounded-ios-md border border-ios-blue/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-ios-blue" />
                            <span className="text-xs font-semibold text-ios-blue">Palavra Profética</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-ios-dark-text2">
                            {reflection.prophetic_word}
                          </p>
                        </div>
                      )}

                      {/* Duração */}
                      <div className="mt-3 flex items-center gap-2 text-xs text-ios-gray dark:text-ios-dark-text3">
                        <Clock className="w-3 h-3" />
                        Duração: {formatPrayerTime(reflection.duration_seconds)}
                      </div>
                    </div>
                  ))}

                  {reflections.length >= 10 && (
                    <div className="text-center">
                      <p className="text-xs text-ios-gray dark:text-ios-dark-text3">
                        {t('userDashboard.showingReflections')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seus Relógios de Oração */}
          <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-ios-dark-text">
                <div className="w-8 h-8 rounded-ios-sm bg-ios-indigo/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-ios-indigo" />
                </div>
                {t('userDashboard.yourPrayerClocks')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userClocks.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-ios-gray" />
                  <p className="text-ios-gray dark:text-ios-dark-text3">
                    {t('userDashboard.noPrayerClocks')}
                  </p>
                  <p className="text-xs text-ios-gray dark:text-ios-dark-text3 mt-1">
                    {t('userDashboard.createFirstClock')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userClocks.map((clock) => (
                    <div
                      key={clock.id}
                      className="p-4 bg-white/50 dark:bg-ios-dark-bg3/50 rounded-ios-lg border border-ios-gray5/20 dark:border-ios-dark-bg4/20"
                    >
                      {/* Região */}
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-ios-green flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-ios-dark-text truncate">
                            {clock.region_name}
                          </h3>
                          <p className="text-xs text-ios-gray dark:text-ios-dark-text3">
                            {clock.region_type}
                          </p>
                        </div>
                      </div>

                      {/* Horário */}
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-ios-blue" />
                          <span className="text-gray-700 dark:text-ios-dark-text2">
                            {clock.is_recurring
                              ? `${getDayName(clock.day_of_week || 0)}s`
                              : new Date(clock.specific_date || '').toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-ios-purple" />
                          <span className="text-gray-700 dark:text-ios-dark-text2">
                            {formatTime(clock.start_time)} ({formatDuration(clock.duration_minutes)})
                          </span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

