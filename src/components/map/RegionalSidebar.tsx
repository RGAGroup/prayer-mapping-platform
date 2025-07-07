import React from 'react';
import { X, MapPin, Heart, Shield, Star, Users, Calendar, Globe, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { useMobile } from '@/hooks/use-mobile';

interface SpiritualData {
  region: string;
  type: 'continent' | 'country' | 'state' | 'city' | 'neighborhood';
  
  // Estatísticas gerais
  stats: {
    totalIntercessors: number;
    activePrayers: number;
    propheticWords: number;
    testimonies: number;
    missionBases: number;
    alerts: number;
  };
  
  // Atividades recentes
  recentActivity: Array<{
    id: string;
    type: 'prophetic_word' | 'prayer_target' | 'testimony' | 'mission_base' | 'alert';
    title: string;
    description: string;
    author: string;
    date: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }>;
  
  // Alvos de oração principais
  prayerTargets: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    intercessors: number;
  }>;
  
  // Status espiritual
  spiritualStatus: {
    revivalLevel: 'baixo' | 'médio' | 'alto' | 'avivamento';
    alertLevel: 'verde' | 'amarelo' | 'laranja' | 'vermelho';
    description: string;
  };
}

interface RegionalSidebarProps {
  data: SpiritualData | null;
  isOpen: boolean;
  onClose: () => void;
}

const getTypeIcon = (type: 'continent' | 'country' | 'state' | 'city' | 'neighborhood') => {
  switch (type) {
    case 'continent': return '🌍';
    case 'country': return '🏳️';
    case 'state': return '🏛️';
    case 'city': return '🏙️';
    case 'neighborhood': return '🏘️';
    default: return '📍';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'continent': return 'Continente';
    case 'country': return 'País';
    case 'state': return 'Estado/Região';
    case 'city': return 'Cidade';
    case 'neighborhood': return 'Bairro';
    default: return type;
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'prophetic_word': return <Heart className="w-4 h-4 text-purple-500" />;
    case 'prayer_target': return <Shield className="w-4 h-4 text-blue-500" />;
    case 'testimony': return <Star className="w-4 h-4 text-yellow-500" />;
    case 'mission_base': return <Users className="w-4 h-4 text-green-500" />;
    case 'alert': return <Calendar className="w-4 h-4 text-red-500" />;
    default: return <Globe className="w-4 h-4 text-gray-500" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getRevivalColor = (level: string) => {
  switch (level) {
    case 'avivamento': return 'text-yellow-500';
    case 'alto': return 'text-green-500';
    case 'médio': return 'text-blue-500';
    case 'baixo': return 'text-gray-500';
    default: return 'text-gray-500';
  }
};

const getAlertColor = (level: string) => {
  switch (level) {
    case 'vermelho': return 'text-red-500';
    case 'laranja': return 'text-orange-500';
    case 'amarelo': return 'text-yellow-500';
    case 'verde': return 'text-green-500';
    default: return 'text-gray-500';
  }
};

export const RegionalSidebar: React.FC<RegionalSidebarProps> = ({ data, isOpen, onClose }) => {
  const { isMobile } = useMobile();

  if (!data) return null;

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-slate-900 to-blue-900">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getTypeIcon(data.type)}</span>
          <div>
            <h2 className="text-lg font-bold text-white">{data.region}</h2>
            <p className="text-sm text-blue-200">{getTypeLabel(data.type)}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10">
          {isMobile ? <X className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Estatísticas */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">ESTATÍSTICAS GERAIS</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{data.stats.totalIntercessors}</div>
                <div className="text-xs text-blue-500">Intercessores</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{data.stats.activePrayers}</div>
                <div className="text-xs text-purple-500">Orações Ativas</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{data.stats.propheticWords}</div>
                <div className="text-xs text-green-500">Palavras Proféticas</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-yellow-600">{data.stats.testimonies}</div>
                <div className="text-xs text-yellow-500">Testemunhos</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Espiritual */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">STATUS ESPIRITUAL</h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Nível de Avivamento</span>
                <Badge className={getRevivalColor(data.spiritualStatus.revivalLevel)}>
                  {data.spiritualStatus.revivalLevel.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Nível de Alerta</span>
                <Badge className={getAlertColor(data.spiritualStatus.alertLevel)}>
                  {data.spiritualStatus.alertLevel.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{data.spiritualStatus.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com conteúdo */}
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity">Atividade</TabsTrigger>
            <TabsTrigger value="prayer">Oração</TabsTrigger>
            <TabsTrigger value="ministry">Ministério</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">ATIVIDADES RECENTES</h4>
            <div className="space-y-2">
              {data.recentActivity.map((activity) => (
                <Card key={activity.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-sm font-medium truncate">{activity.title}</h5>
                          {activity.priority && (
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(activity.priority)}`} />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{activity.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{activity.author}</span>
                          <span>{activity.date}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prayer" className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">ALVOS DE ORAÇÃO</h4>
            <div className="space-y-2">
              {data.prayerTargets.map((target) => (
                <Card key={target.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-medium">{target.title}</h5>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(target.priority)}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{target.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {target.intercessors} intercessores
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {target.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ministry" className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">MINISTÉRIOS E BASES</h4>
            <div className="grid gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Bases Missionárias</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{data.stats.missionBases}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Grupos de Intercessão</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{Math.floor(data.stats.totalIntercessors / 10)}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // Mobile: usar Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Informações Regionais</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: usar sidebar fixa
  return (
    <div className={`fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg transform transition-transform z-50 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      {sidebarContent}
    </div>
  );
}; 