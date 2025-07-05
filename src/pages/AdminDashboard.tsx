import React, { useState, useEffect } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Globe, 
  MapPin, 
  Shield, 
  Activity, 
  Settings, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Wifi,
  WifiOff,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import RegionsTab from '@/components/admin/RegionsTab';
import { PrayerStatsTab } from '@/components/admin/PrayerStatsTab';
import { AdvancedAgentTab } from '@/components/admin/AdvancedAgentTab';

const AdminDashboard = () => {
  const { stats, loading, error, isConnected } = useAdminData();
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKey, setApiKey] = useState<string>('AIzaSyCbk0kgeAlS_eU3QFNsR-Cysk_sRsPXTW0');

  useEffect(() => {
    const savedApiKey = localStorage.getItem('google-maps-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // Configurar API key padrão
      localStorage.setItem('google-maps-api-key', 'AIzaSyCbk0kgeAlS_eU3QFNsR-Cysk_sRsPXTW0');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray6 to-white dark:from-ios-dark-bg to-ios-dark-bg2 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-ios-xl bg-ios-glass backdrop-blur-ios border border-white/20 flex items-center justify-center mb-6 animate-ios-bounce">
            <div className="w-8 h-8 border-3 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-ios-gray dark:text-ios-dark-text2 font-medium">Carregando dashboard admin...</p>
        </div>
      </div>
    );
  }

  // Componente invisível para carregar Google Maps
  const GoogleMapsLoader = () => <div style={{ display: 'none' }} />;

  return (
    <Wrapper apiKey={apiKey} version="beta" libraries={["marker", "geometry", "places"]}>
      <GoogleMapsLoader />
      <div className="min-h-screen bg-gradient-to-br from-ios-gray6 to-white dark:from-ios-dark-bg to-ios-dark-bg2">
        {/* Header iOS Style */}
        <div className="bg-white/80 dark:bg-ios-dark-bg2/80 backdrop-blur-ios border-b border-ios-gray5/30 dark:border-ios-dark-bg4/30 sticky top-20 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-ios-dark-text tracking-tight truncate">
                  Dashboard Administrativo
                </h1>
                <p className="text-ios-gray dark:text-ios-dark-text3 font-medium mt-1 text-sm sm:text-base">
                  Gerenciamento do Mapa Global de Intercessão
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {isConnected ? (
                  <Badge className="bg-ios-green/10 text-ios-green border-ios-green/20 rounded-ios-md px-2 sm:px-3 py-1 text-xs sm:text-sm">
                    <Wifi className="w-3 h-3 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Supabase </span>Conectado
                  </Badge>
                ) : (
                  <Badge className="bg-ios-red/10 text-ios-red border-ios-red/20 rounded-ios-md px-2 sm:px-3 py-1 text-xs sm:text-sm">
                    <WifiOff className="w-3 h-3 mr-1 sm:mr-2" />
                    Offline
                  </Badge>
                )}
                {error && (
                  <Badge className="bg-ios-orange/10 text-ios-orange border-ios-orange/20 rounded-ios-md px-2 sm:px-3 py-1 max-w-xs truncate text-xs sm:text-sm">
                    <AlertTriangle className="w-3 h-3 mr-1 sm:mr-2" />
                    {error.length > 20 ? error.substring(0, 20) + '...' : error}
                  </Badge>
                )}
                <Button className="ios-button bg-ios-gray6/50 dark:bg-ios-dark-bg3/50 hover:bg-ios-gray6 dark:hover:bg-ios-dark-bg3 text-ios-gray dark:text-ios-dark-text2 border border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-md text-xs sm:text-sm px-2 sm:px-3 py-2">
                  <Settings className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Configurações</span>
                  <span className="sm:hidden">Config</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
            {/* iOS Style Tab Navigation - Responsivo */}
            <div className="bg-white/60 dark:bg-ios-dark-bg2/60 backdrop-blur-ios rounded-ios-xl border border-ios-gray5/20 dark:border-ios-dark-bg4/20 p-1 sm:p-2 shadow-ios-lg">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-transparent gap-1 sm:gap-2">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-ios-blue data-[state=active]:text-white data-[state=active]:shadow-ios-md rounded-ios-md transition-all duration-200 hover:scale-105 active:scale-95 font-medium text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-3"
                >
                  <span className="hidden sm:inline">📊 Visão Geral</span>
                  <span className="sm:hidden">📊</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="regions"
                  className="data-[state=active]:bg-ios-blue data-[state=active]:text-white data-[state=active]:shadow-ios-md rounded-ios-md transition-all duration-200 hover:scale-105 active:scale-95 font-medium text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-3"
                >
                  <span className="hidden sm:inline">🗺️ Mapeamento</span>
                  <span className="sm:hidden">🗺️</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="prayer-stats"
                  className="data-[state=active]:bg-ios-blue data-[state=active]:text-white data-[state=active]:shadow-ios-md rounded-ios-md transition-all duration-200 hover:scale-105 active:scale-95 font-medium text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-3 col-span-2 sm:col-span-1"
                >
                  <span className="hidden sm:inline">🙏 Oração</span>
                  <span className="sm:hidden">🙏 Oração</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="queue-builder"
                  className="data-[state=active]:bg-ios-blue data-[state=active]:text-white data-[state=active]:shadow-ios-md rounded-ios-md transition-all duration-200 hover:scale-105 active:scale-95 font-medium text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-3 hidden sm:inline-flex"
                >
                  🤖 Agente IA
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="data-[state=active]:bg-ios-blue data-[state=active]:text-white data-[state=active]:shadow-ios-md rounded-ios-md transition-all duration-200 hover:scale-105 active:scale-95 font-medium text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-3 hidden sm:inline-flex"
                >
                  📈 Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 sm:space-y-8 animate-ios-fade-in">
              {/* Estatísticas Principais - iOS Cards - Grid Responsivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg hover:shadow-ios-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-ios-gray dark:text-ios-dark-text2">Total de Regiões</CardTitle>
                    <div className="w-10 h-10 rounded-ios-md bg-ios-blue/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-ios-blue" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-ios-dark-text">{stats.totalRegions.toLocaleString()}</div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-ios-green mr-1" />
                      <p className="text-xs sm:text-sm text-ios-green font-medium">+12 nas últimas 24h</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg hover:shadow-ios-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-ios-gray dark:text-ios-dark-text2">Aprovações Pendentes</CardTitle>
                    <div className="w-10 h-10 rounded-ios-md bg-ios-orange/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-ios-orange" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-ios-orange">{stats.pendingApprovals}</div>
                    <div className="flex items-center mt-2">
                      <Zap className="w-4 h-4 text-ios-orange mr-1" />
                      <p className="text-xs sm:text-sm text-ios-orange font-medium">Requer atenção</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg hover:shadow-ios-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-ios-gray dark:text-ios-dark-text2">Usuários Ativos</CardTitle>
                    <div className="w-10 h-10 rounded-ios-md bg-ios-purple/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-ios-purple" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-ios-dark-text">{stats.totalUsers.toLocaleString()}</div>
                    <div className="flex items-center mt-2">
                      <Activity className="w-4 h-4 text-ios-purple mr-1" />
                      <p className="text-xs sm:text-sm text-ios-purple font-medium">{stats.activeIntercessors} intercessores ativos</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg hover:shadow-ios-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-ios-gray dark:text-ios-dark-text2">Dados por IA</CardTitle>
                    <div className="w-10 h-10 rounded-ios-md bg-ios-indigo/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-ios-indigo" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-ios-indigo">{stats.aiGeneratedData}</div>
                    <div className="flex items-center mt-2">
                      <Database className="w-4 h-4 text-ios-indigo mr-1" />
                      <p className="text-xs sm:text-sm text-ios-indigo font-medium">{stats.manualEntries} entradas manuais</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Regions Tab */}
            <TabsContent value="regions" className="animate-ios-fade-in">
              <RegionsTab />
            </TabsContent>

            {/* Prayer Stats Tab */}
            <TabsContent value="prayer-stats" className="animate-ios-fade-in">
              <PrayerStatsTab />
            </TabsContent>

            {/* Queue Builder Tab */}
            <TabsContent value="queue-builder" className="animate-ios-fade-in">
              <AdvancedAgentTab />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="animate-ios-fade-in">
              <div className="text-center py-20">
                <BarChart3 className="w-16 h-16 mx-auto text-ios-gray mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-ios-dark-text mb-2">Analytics em Desenvolvimento</h3>
                <p className="text-ios-gray dark:text-ios-dark-text3">Esta seção estará disponível em breve.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Wrapper>
  );
};

export default AdminDashboard;