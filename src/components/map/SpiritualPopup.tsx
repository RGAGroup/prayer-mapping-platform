import React, { useEffect, useState } from 'react';
import { X, MapPin, Heart, Shield, Star, Users, Calendar, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

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

export const SpiritualPopup: React.FC<SpiritualPopupProps> = ({ data, position, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
                  {data.region || 'Região não identificada'}
                </h2>
                <p className="text-gray-700 capitalize font-medium">
                  {data.type === 'continent' ? 'Continente' : 
                   data.type === 'country' ? 'País' :
                   data.type === 'state' ? 'Estado' :
                   data.type === 'city' ? 'Cidade' : 'Bairro'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Conteúdo */}
            <div className="space-y-4">
              {/* Status Espiritual */}
              <div className={`p-3 rounded-lg border-2 ${getAlertColor(data.spiritualStatus.alertLevel)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="font-semibold text-gray-800">Status Espiritual</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Nível de Avivamento:</span>
                    <span className={`text-sm capitalize ${getRevivalColor(data.spiritualStatus.revivalLevel)}`}>
                      {data.spiritualStatus.revivalLevel}
                    </span>
                  </div>
                  <p className="text-sm">{data.spiritualStatus.description}</p>
                </div>
              </div>

              {/* Estatísticas */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-800">
                  <Users className="w-4 h-4" />
                  Estatísticas
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="font-semibold text-blue-700">{data.stats.totalIntercessors}</div>
                    <div className="text-blue-600">Intercessores</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="font-semibold text-green-700">{data.stats.activePrayers}</div>
                    <div className="text-green-600">Orações Ativas</div>
                  </div>
                  <div className="bg-purple-50 p-2 rounded">
                    <div className="font-semibold text-purple-700">{data.stats.propheticWords}</div>
                    <div className="text-purple-600">Palavras Proféticas</div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded">
                    <div className="font-semibold text-orange-700">{data.stats.testimonies}</div>
                    <div className="text-orange-600">Testemunhos</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Alvos de Oração Principais */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-800">
                  <Heart className="w-4 h-4 text-red-500" />
                  Alvos de Oração Prioritários
                </h4>
                <div className="space-y-2">
                  {data.prayerTargets.slice(0, 3).map((target) => (
                    <div key={target.id} className="border rounded-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-sm">{target.title}</h5>
                        <Badge className={`text-xs ${getPriorityColor(target.priority)}`}>
                          {target.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{target.description}</p>
                      <div className="text-xs text-blue-600">
                        {target.intercessors} intercessores orando
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
                <Button size="sm" className="flex-1">
                  Contribuir
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Ver Detalhes
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
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transition-transform duration-300 ${
          isExpanded ? 'h-[90vh]' : 'h-[50vh]'
        }`}
      >
        {/* Handle para arrastar */}
        <div className="w-full p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3"></div>
          
          {/* Header compacto */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-bold text-lg text-gray-900">{data.region || 'Região não identificada'}</h3>
                <p className="text-gray-700 text-sm capitalize font-medium">
                  {data.type === 'continent' ? 'Continente' : 
                   data.type === 'country' ? 'País' :
                   data.type === 'state' ? 'Estado' :
                   data.type === 'city' ? 'Cidade' : 'Bairro'}
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

        {/* Conteúdo scrollável */}
        <div className="px-4 pb-4 h-full overflow-y-auto">
          <div className="space-y-4">
            {/* Status Espiritual */}
            <div className={`p-3 rounded-lg border-2 ${getAlertColor(data.spiritualStatus.alertLevel)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" />
                <span className="font-semibold text-gray-800">Status Espiritual</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Nível de Avivamento:</span>
                  <span className={`text-sm capitalize ${getRevivalColor(data.spiritualStatus.revivalLevel)}`}>
                    {data.spiritualStatus.revivalLevel}
                  </span>
                </div>
                <p className="text-sm">{data.spiritualStatus.description}</p>
              </div>
            </div>

            {/* Estatísticas - Grid adaptado para mobile */}
            <div>
                             <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-800">
                 <Users className="w-4 h-4" />
                 Estatísticas
               </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-semibold text-blue-700 text-lg">{data.stats.totalIntercessors}</div>
                  <div className="text-blue-600">Intercessores</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="font-semibold text-green-700 text-lg">{data.stats.activePrayers}</div>
                  <div className="text-green-600">Orações Ativas</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="font-semibold text-purple-700 text-lg">{data.stats.propheticWords}</div>
                  <div className="text-purple-600">Palavras Proféticas</div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="font-semibold text-orange-700 text-lg">{data.stats.testimonies}</div>
                  <div className="text-orange-600">Testemunhos</div>
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
                     Alvos de Oração Prioritários
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
                          {target.intercessors} intercessores orando
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
                     Atividade Recente
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

            {/* Botões de Ação - sempre visíveis */}
            <div className="flex gap-2 pt-2">
              <Button size="default" className="flex-1">
                Contribuir
              </Button>
              <Button size="default" variant="outline" className="flex-1">
                Ver Detalhes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 