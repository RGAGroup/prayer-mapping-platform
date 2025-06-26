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
  WifiOff
} from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import RegionsTab from '@/components/admin/RegionsTab';
import { PrayerStatsTab } from '@/components/admin/PrayerStatsTab';
import { QueueBuilderTab } from '@/components/admin/QueueBuilderTab';
import { WorldMappingTab } from '@/components/admin/WorldMappingTab';


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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard admin...</p>
        </div>
      </div>
    );
  }

  // Componente invisível para carregar Google Maps
  const GoogleMapsLoader = () => <div style={{ display: 'none' }} />;

  return (
    <Wrapper apiKey={apiKey} version="beta" libraries={["marker", "geometry", "places"]}>
      <GoogleMapsLoader />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
              <p className="text-gray-600">Gerenciamento do Mapa Global de Intercessão</p>
            </div>
            <div className="flex items-center gap-4">
              {isConnected ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Wifi className="w-3 h-3 mr-1" />
                  Supabase Conectado
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              )}
              {error && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 max-w-xs truncate">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {error.length > 30 ? error.substring(0, 30) + '...' : error}
                </Badge>
              )}
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">📊 Visão Geral</TabsTrigger>
            <TabsTrigger value="world-mapping">🌍 Mapeamento Mundial</TabsTrigger>
            <TabsTrigger value="regions">🗺️ Mapeamento Global</TabsTrigger>
            <TabsTrigger value="prayer-stats">🙏 Oração</TabsTrigger>
            <TabsTrigger value="queue-builder">🤖 IA</TabsTrigger>
            <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Regiões</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRegions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12 nas últimas 24h
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aprovações Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
                  <p className="text-xs text-muted-foreground">
                    Requer atenção
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeIntercessors} intercessores ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dados por IA</CardTitle>
                  <Database className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.aiGeneratedData}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.manualEntries} entradas manuais
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Atividade Recente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>Últimas ações no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        action: 'Nova região aprovada',
                        region: 'São Paulo, Brasil',
                        user: 'Admin João',
                        time: '2 min atrás',
                        type: 'approval'
                      },
                      {
                        action: 'Dados AI gerados',
                        region: 'Estados Unidos',
                        user: 'Sistema AI',
                        time: '15 min atrás',
                        type: 'ai'
                      },
                      {
                        action: 'Usuário promovido',
                        region: 'Maria Silva → Moderador',
                        user: 'Admin Pedro',
                        time: '1h atrás',
                        type: 'user'
                      },
                      {
                        action: 'Alerta criado',
                        region: 'Venezuela',
                        user: 'Moderador Ana',
                        time: '2h atrás',
                        type: 'alert'
                      }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'approval' ? 'bg-green-500' :
                          activity.type === 'ai' ? 'bg-blue-500' :
                          activity.type === 'user' ? 'bg-purple-500' :
                          'bg-orange-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.region} • por {activity.user}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status do Sistema</CardTitle>
                  <CardDescription>Monitoramento em tempo real</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">API Google Maps</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Banco de Dados</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Conectado
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">OpenAI API</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativo
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Queue de Processamento</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        12 pendentes
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesso rápido às funções principais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <MapPin className="h-5 w-5" />
                    <span className="text-sm">Nova Região</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Gerenciar Usuários</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Database className="h-5 w-5" />
                    <span className="text-sm">Gerar Dados AI</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm">Relatórios</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* World Mapping Tab */}
          <TabsContent value="world-mapping">
            <WorldMappingTab />
          </TabsContent>

          {/* Regions Tab */}
          <TabsContent value="regions">
            <RegionsTab />
          </TabsContent>

          {/* Prayer Stats Tab */}
          <TabsContent value="prayer-stats">
            <PrayerStatsTab />
          </TabsContent>

          {/* Queue Builder Tab */}
          <TabsContent value="queue-builder">
            <QueueBuilderTab />
          </TabsContent>



          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics e Relatórios</CardTitle>
                <CardDescription>Em desenvolvimento...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Dashboard de analytics será implementado aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </Wrapper>
  );
};

export default AdminDashboard; 