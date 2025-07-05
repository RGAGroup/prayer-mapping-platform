import React, { useEffect, useState } from 'react';
import { X, MapPin, Heart, Shield, Star, Users, Calendar, Globe, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useTranslation } from '../../hooks/useTranslation';

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

interface SpiritualPopupProps {
  data: SpiritualData;
  position: { x: number; y: number };
  onClose: () => void;
  onStartPrayer?: (regionName: string, regionData: SpiritualData) => void;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'prophetic_word': return <Star className="w-4 h-4" />;
    case 'prayer_target': return <Heart className="w-4 h-4" />;
    case 'testimony': return <Users className="w-4 h-4" />;
    case 'mission_base': return <Globe className="w-4 h-4" />;
    case 'alert': return <Shield className="w-4 h-4" />;
    default: return <MapPin className="w-4 h-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-500 text-white';
    case 'high': return 'bg-orange-500 text-white';
    case 'medium': return 'bg-yellow-500 text-black';
    case 'low': return 'bg-gray-300 text-gray-700';
    default: return 'bg-gray-300 text-gray-700';
  }
};

const getRevivalColor = (level: string) => {
  switch (level) {
    case 'avivamento': return 'text-purple-600 font-bold';
    case 'alto': return 'text-green-600 font-semibold';
    case 'médio': return 'text-yellow-600';
    case 'baixo': return 'text-gray-500';
    default: return 'text-gray-500';
  }
};

const getAlertColor = (level: string) => {
  switch (level) {
    case 'vermelho': return 'bg-red-100 border-red-500 text-red-700';
    case 'laranja': return 'bg-orange-100 border-orange-500 text-orange-700';
    case 'amarelo': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
    case 'verde': return 'bg-green-100 border-green-500 text-green-700';
    default: return 'bg-gray-100 border-gray-500 text-gray-700';
  }
};

export const SpiritualPopup: React.FC<SpiritualPopupProps> = ({ data, position, onClose, onStartPrayer }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  const handleStartPrayer = () => {
    console.log(`🙏 Iniciando oração por ${data.region}`);
    if (onStartPrayer) {
      onStartPrayer(data.region, data);
    }
  };

  // Debug - verificar dados recebidos
  console.log(`🎯 SpiritualPopup renderizado com dados:`, data);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Desktop: Sidebar fixa na lateral esquerda
  if (!isMobile) {
    return (
      <>
        {/* Overlay escuro */}
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
        
        {/* Sidebar Desktop */}
        <div className="fixed left-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto border-r-2">
          <div className="p-4">
            {/* Header com botão fechar */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  {data.region || t('spiritualPopup.regionNotIdentified')}
                </h2>
                <p className="text-gray-700 capitalize font-medium">
                  {data.type === 'continent' ? t('map.continent') : 
                   data.type === 'country' ? t('map.country') :
                   data.type === 'state' ? t('map.state') :
                   data.type === 'city' ? t('map.city') : t('map.neighborhood')}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Conteúdo */}
            <div className="space-y-4">
              {/* Sistema Geopolítico */}
              <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">{t('spiritualPopup.geopoliticalSystem')}</span>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {data.recentActivity.find(activity => activity.id === 'sistema-geo')?.description || 
                   t('spiritualPopup.geopoliticalInfoUnavailable')}
                </div>
              </div>

              {/* Alvos de Intercessão */}
              <div className="p-3 rounded-lg border-2 border-red-200 bg-red-50">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800">{t('spiritualPopup.intercessionTargets')}</span>
                </div>
                <div className="space-y-2">
                  {data.prayerTargets.map((target, index) => (
                    <div key={target.id} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-red-600 font-bold mt-0.5">•</span>
                      <span className="leading-relaxed">{target.description}</span>
                    </div>
                  ))}
                  {data.prayerTargets.length === 0 && (
                    <div className="text-sm text-gray-500 italic">
                      {t('spiritualPopup.noTargetsDefined')}
                    </div>
                  )}
                </div>
              </div>

              {/* Outras Informações Importantes */}
              {data.recentActivity.find(activity => activity.id === 'outras-info') && (
                <div className="p-3 rounded-lg border-2 border-purple-200 bg-purple-50">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">📋 Outras Informações Importantes</span>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {data.recentActivity.find(activity => activity.id === 'outras-info')?.description || 
                     'Nenhuma informação adicional disponível.'}
                  </div>
                </div>
              )}

              {/* Estatísticas */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
                  <Users className="w-5 h-5" />
                  {t('spiritualPopup.statistics')}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="font-bold text-blue-700 text-lg">{data.stats.totalIntercessors}</div>
                    <div className="text-blue-600">{t('spiritualPopup.intercessors')}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="font-bold text-green-700 text-lg">{data.stats.activePrayers}</div>
                    <div className="text-green-600">{t('spiritualPopup.activePrayers')}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="font-bold text-purple-700 text-lg">{data.stats.propheticWords}</div>
                    <div className="text-purple-600">{t('spiritualPopup.updatedData')}</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="font-bold text-orange-700 text-lg">{data.prayerTargets.length}</div>
                    <div className="text-orange-600">{t('spiritualPopup.definedTargets')}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Atividade Recente */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-800">
                  <Calendar className="w-4 h-4" />
                  Atividade Recente
                </h4>
                <div className="space-y-2">
                  {data.recentActivity.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                      <div className="text-gray-500 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h6 className="font-medium text-xs truncate">{activity.title}</h6>
                          {activity.priority && (
                            <Badge className={`text-xs ${getPriorityColor(activity.priority)}`}>
                              {activity.priority}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{activity.description}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          por {activity.author} • {activity.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="default" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleStartPrayer}
                >
                  {t('map.prayFor', { region: data.region })}
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  {t('map.viewDetails')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Mobile: Bottom Sheet (meia tela)
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      
      {/* Bottom Sheet Mobile */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transition-transform duration-300 flex flex-col ${
          isExpanded ? 'h-[90vh]' : 'h-[60vh]'
        }`}
      >
        {/* Handle para arrastar */}
        <div className="w-full p-4 cursor-pointer flex-shrink-0" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3"></div>
          
          {/* Header compacto */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-bold text-lg text-gray-900">{data.region || t('spiritualPopup.regionNotIdentified')}</h3>
                <p className="text-gray-700 text-sm capitalize font-medium">
                  {data.type === 'continent' ? t('map.continent') : 
                   data.type === 'country' ? t('map.country') :
                   data.type === 'state' ? t('map.state') :
                   data.type === 'city' ? t('map.city') : t('map.neighborhood')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo scrollável - agora com flex-1 para ocupar espaço disponível */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-4 pb-4">
            {/* Sistema Geopolítico */}
            <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">{t('spiritualPopup.geopoliticalSystem')}</span>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {data.recentActivity.find(activity => activity.id === 'sistema-geo')?.description || 
                 t('spiritualPopup.geopoliticalInfoUnavailable')}
              </div>
            </div>

            {/* Alvos de Intercessão */}
            <div className="p-3 rounded-lg border-2 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">{t('spiritualPopup.intercessionTargets')}</span>
              </div>
              <div className="space-y-2">
                {data.prayerTargets.map((target, index) => (
                  <div key={target.id} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{target.description}</span>
                  </div>
                ))}
                {data.prayerTargets.length === 0 && (
                  <div className="text-sm text-gray-500 italic">
                    {t('spiritualPopup.noTargetsDefined')}
                  </div>
                )}
              </div>
            </div>

            {/* Outras Informações Importantes */}
            {data.recentActivity.find(activity => activity.id === 'outras-info') && (
              <div className="p-3 rounded-lg border-2 border-purple-200 bg-purple-50">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">📋 Outras Informações Importantes</span>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {data.recentActivity.find(activity => activity.id === 'outras-info')?.description || 
                   'Nenhuma informação adicional disponível.'}
                </div>
              </div>
            )}

            {/* Estatísticas - Grid adaptado para mobile */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
                <Users className="w-5 h-5" />
                {t('spiritualPopup.statistics')}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="font-bold text-blue-700 text-lg">{data.stats.totalIntercessors}</div>
                  <div className="text-blue-600">{t('spiritualPopup.intercessors')}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="font-bold text-green-700 text-lg">{data.stats.activePrayers}</div>
                  <div className="text-green-600">{t('spiritualPopup.activePrayers')}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="font-bold text-purple-700 text-lg">{data.stats.propheticWords}</div>
                  <div className="text-purple-600">{t('spiritualPopup.updatedData')}</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="font-bold text-orange-700 text-lg">{data.prayerTargets.length}</div>
                  <div className="text-orange-600">{t('spiritualPopup.definedTargets')}</div>
                </div>
              </div>
            </div>

            {/* Mostrar mais conteúdo quando expandido */}
            {isExpanded && (
              <>
                <Separator />

                {/* Alvos de Oração Principais */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-800">
                    <Heart className="w-4 h-4 text-red-500" />
                    {t('spiritualPopup.priorityPrayerTargets')}
                  </h4>
                  <div className="space-y-2">
                    {data.prayerTargets.slice(0, 3).map((target) => (
                      <div key={target.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-sm">{target.title}</h5>
                          <Badge className={`text-xs ${getPriorityColor(target.priority)}`}>
                            {target.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{target.description}</p>
                        <div className="text-xs text-blue-600">
                          {target.intercessors} {t('spiritualPopup.intercessorsPraying')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Atividade Recente */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-800">
                    <Calendar className="w-4 h-4" />
                    {t('spiritualPopup.recentActivity')}
                  </h4>
                  <div className="space-y-2">
                    {data.recentActivity.slice(0, 4).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                        <div className="text-gray-500 mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h6 className="font-medium text-sm truncate">{activity.title}</h6>
                            {activity.priority && (
                              <Badge className={`text-xs ${getPriorityColor(activity.priority)}`}>
                                {activity.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            por {activity.author} • {activity.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Botões de Ação - FIXOS na parte inferior, fora do scroll */}
        <div className="flex-shrink-0 p-4 border-t bg-white">
          <div className="flex gap-2">
            <Button 
              size="default" 
              variant="default" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleStartPrayer}
            >
              {t('map.prayFor', { region: data.region })}
            </Button>
            <Button size="default" variant="outline" className="flex-1">
              {t('map.viewDetails')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}; 