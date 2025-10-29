import { useState, useEffect } from 'react';
import { Bell, Eye, Zap, Globe, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocations } from '@/hooks/useLocations';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface GlobalWatchProps {
  isOpen: boolean;
  onToggle: () => void;
}

const GlobalWatch = ({ isOpen, onToggle }: GlobalWatchProps) => {
  const { t } = useTranslation();
  const { data: locations = [] } = useLocations();
  const [watchMode, setWatchMode] = useState<'normal' | 'vigilia'>('normal');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'revival' | 'breakthrough' | 'alert' | 'prayer';
    message: string;
    location: string;
    time: string;
    severity: 'info' | 'warning' | 'critical';
  }>>([]);

  // Simular atividade espiritual em tempo real
  useEffect(() => {
    if (watchMode === 'vigilia') {
      const interval = setInterval(() => {
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        if (!randomLocation) return;

        const activities = [
          {
            type: 'prayer' as const,
            message: t('globalWatch.notifications.newPrayerGroup'),
            severity: 'info' as const
          },
          {
            type: 'breakthrough' as const,
            message: t('globalWatch.notifications.spiritualBreakthrough'),
            severity: 'warning' as const
          },
          {
            type: 'revival' as const,
            message: t('globalWatch.notifications.revivalMoving'),
            severity: 'critical' as const
          },
          {
            type: 'alert' as const,
            message: t('globalWatch.notifications.spiritualAlert'),
            severity: 'warning' as const
          }
        ];

        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        
        const newNotification = {
          id: Date.now().toString(),
          ...randomActivity,
          location: randomLocation.name,
          time: new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);

        // Mostrar toast para eventos críticos
        if (randomActivity.severity === 'critical') {
          toast({
            title: `🔥 ${randomActivity.message}`,
            description: `${randomLocation.name} - ${newNotification.time}`,
            duration: 5000
          });
        }
      }, Math.random() * 15000 + 5000); // Entre 5-20 segundos

      return () => clearInterval(interval);
    }
  }, [watchMode, locations]);

  const getActiveAlerts = () => {
    return locations.filter(loc => 
      loc.spiritualAlerts.some(alert => alert.severity === 'danger')
    ).length;
  };

  const getTotalIntercessors = () => {
    return locations.reduce((total, loc) => total + loc.intercessorCount, 0);
  };

  const getRevivalCenters = () => {
    return locations.filter(loc => 
      loc.spiritualAlerts.some(alert => alert.type === 'revival')
    ).length;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'revival': return '🔥';
      case 'breakthrough': return '⚡';
      case 'alert': return '🚨';
      case 'prayer': return '🙏';
      default: return '📿';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-2xl"
        size="lg"
      >
        <div className="relative">
          <Eye className="h-6 w-6" />
          {getActiveAlerts() > 0 && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">{getActiveAlerts()}</span>
            </div>
          )}
        </div>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 max-h-96">
      <Card className="bg-white/90 dark:bg-ios-dark-bg2/90 backdrop-blur-md border-ios-gray5/30 dark:border-ios-dark-bg4/30 text-gray-900 dark:text-ios-dark-text rounded-ios-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-purple-400" />
              <span>{t('globalWatch.title')}</span>
              {watchMode === 'vigilia' && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-white hover:bg-white/10"
            >
              ×
            </Button>
          </CardTitle>

          {/* Estatísticas Globais */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="text-purple-400 font-bold">{getTotalIntercessors()}</div>
              <div className="text-gray-300">{t('globalWatch.stats.watchers')}</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="text-orange-400 font-bold">{getRevivalCenters()}</div>
              <div className="text-gray-300">{t('globalWatch.stats.revivals')}</div>
            </div>
            <div className="text-center p-2 bg-white/5 rounded">
              <div className="text-red-400 font-bold">{getActiveAlerts()}</div>
              <div className="text-gray-300">{t('globalWatch.stats.alerts')}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Controles de Vigília */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant={watchMode === 'normal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWatchMode('normal')}
              className="flex-1 text-xs"
            >
              <Globe className="h-3 w-3 mr-1" />
              {t('globalWatch.modes.normal')}
            </Button>
            <Button
              variant={watchMode === 'vigilia' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWatchMode('vigilia')}
              className="flex-1 text-xs bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Bell className="h-3 w-3 mr-1" />
              {t('globalWatch.modes.vigil')}
            </Button>
          </div>

          {/* Feed de Atividade */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">{t('globalWatch.activity.title')}</span>
              <Badge variant="outline" className="text-xs">
                {t('globalWatch.activity.realTime')}
              </Badge>
            </div>

            <ScrollArea className="h-48">
              <div className="space-y-2">
                {watchMode === 'vigilia' && notifications.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">{t('globalWatch.activity.starting')}</p>
                    <p className="text-xs opacity-70">{t('globalWatch.activity.connecting')}</p>
                  </div>
                )}

                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-2 rounded border ${getSeverityColor(notification.severity)}`}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-300 truncate">
                          {notification.location} • {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {watchMode === 'normal' && (
                  <div className="text-center py-4 text-gray-400">
                    <div className="text-xs space-y-1">
                      <p>🌍 {locations.length} {t('globalWatch.stats.centersMonitored')}</p>
                      <p>📿 {getTotalIntercessors()} {t('globalWatch.stats.activeIntercessors')}</p>
                      <p className="opacity-70">{t('globalWatch.activity.activateVigilMessage')}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Ações Rápidas */}
          <div className="mt-4 flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <Users className="h-3 w-3 mr-1" />
              {t('globalWatch.actions.groups')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {t('globalWatch.actions.alerts')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalWatch; 