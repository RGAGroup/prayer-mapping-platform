import { X, MapPin, Users, AlertTriangle, Heart, Sword, Crown, Globe2, Flag, Building, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { LocationData } from '@/types/Location';
import { useHierarchicalData } from '@/hooks/useHierarchicalData';

interface LocationPanelProps {
  location: LocationData;
  onClose: () => void;
  onContribute: () => void;
  isAuthenticated: boolean;
}

const LocationPanel = ({ location, onClose, onContribute, isAuthenticated }: LocationPanelProps) => {
  const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);
  
  // Hook para dados hierárquicos
  const { hierarchicalData, allLocations } = useHierarchicalData({
    currentZoom: 8,
    currentCenter: { lat: location.coordinates[1], lng: location.coordinates[0] },
    selectedLocationId: location.id
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'danger': return 'border-red-500 bg-red-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'continent': return Globe2;
      case 'country': return Flag;
      case 'state': return Building;
      case 'city': return MapPin;
      case 'neighborhood': return Users;
      default: return MapPin;
    }
  };

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'continent': return 'CONTINENTE';
      case 'country': return 'PAÍS';
      case 'state': return 'ESTADO/REGIÃO';
      case 'city': return 'CIDADE';
      case 'neighborhood': return 'BAIRRO';
      default: return type.toUpperCase();
    }
  };

  // Função para buscar hierarquia completa
  const getLocationHierarchy = () => {
    const hierarchy: LocationData[] = [];
    let current = location;
    
    // Adicionar localização atual
    hierarchy.unshift(current);
    
    // Buscar pais recursivamente
    while (current.parentId) {
      current = allLocations.find(loc => loc.id === current.parentId) || current;
      if (current) {
        hierarchy.unshift(current);
      } else {
        break;
      }
    }
    
    return hierarchy;
  };

  // Função para buscar filhos
  const getLocationChildren = () => {
    return allLocations.filter(loc => loc.parentId === location.id);
  };

  const hierarchy = getLocationHierarchy();
  const children = getLocationChildren();
  const LocationIcon = getLocationIcon(location.type);
  const aggregatedData = hierarchicalData?.aggregatedData;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white/95 dark:bg-ios-dark-bg/95 backdrop-blur-ios-heavy border-l border-ios-gray5/20 dark:border-ios-dark-bg4/20 shadow-ios-2xl overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-ios-lg bg-gradient-to-r from-ios-blue to-ios-purple flex items-center justify-center shadow-ios-sm">
              <LocationIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-ios-dark-text">{location.name}</h2>
                <Badge className="bg-ios-blue/10 text-ios-blue border-ios-blue/20 rounded-ios-sm font-medium text-xs">
                  {getLocationTypeLabel(location.type)}
                </Badge>
              </div>
              <p className="text-sm text-ios-gray dark:text-ios-dark-text3">
                {aggregatedData?.totalIntercessors || location.intercessorCount} intercessores ativos
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="w-8 h-8 rounded-ios-sm bg-ios-gray6/50 dark:bg-ios-dark-bg3/50 hover:bg-ios-gray6 dark:hover:bg-ios-dark-bg3 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="h-4 w-4 text-ios-gray dark:text-ios-dark-text2" />
          </Button>
        </div>

        {/* Hierarquia de Localização */}
        {hierarchy.length > 1 && (
          <Collapsible open={isHierarchyOpen} onOpenChange={setIsHierarchyOpen} className="mb-6">
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between text-sm bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 hover:bg-ios-gray6/50 dark:hover:bg-ios-dark-bg3/50 rounded-ios-lg transition-all duration-200 text-ios-gray dark:text-ios-dark-text2"
              >
                <span>📍 Hierarquia Geográfica</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-3">
              {hierarchy.map((loc, index) => {
                const Icon = getLocationIcon(loc.type);
                return (
                  <div key={loc.id} className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center space-x-2" style={{ marginLeft: `${index * 12}px` }}>
                      <Icon className="h-3 w-3 text-ios-gray dark:text-ios-dark-text3" />
                      <span className={loc.id === location.id ? 'font-semibold text-gray-900 dark:text-ios-dark-text' : 'text-ios-gray dark:text-ios-dark-text3'}>
                        {loc.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Estatísticas Agregadas */}
        {aggregatedData && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 rounded-ios-sm bg-ios-red/10 flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-4 w-4 text-ios-red" />
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-ios-dark-text">{aggregatedData.totalPropheticWords}</p>
                <p className="text-xs text-ios-gray dark:text-ios-dark-text3">Palavras</p>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 rounded-ios-sm bg-ios-blue/10 flex items-center justify-center mx-auto mb-2">
                  <Sword className="h-4 w-4 text-ios-blue" />
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-ios-dark-text">{aggregatedData.totalPrayerTargets}</p>
                <p className="text-xs text-ios-gray dark:text-ios-dark-text3">Alvos</p>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 rounded-ios-sm bg-ios-orange/10 flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="h-4 w-4 text-ios-orange" />
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-ios-dark-text">{aggregatedData.totalAlerts}</p>
                <p className="text-xs text-ios-gray dark:text-ios-dark-text3">Alertas</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alertas Críticos */}
        {(aggregatedData?.criticalAlerts.length > 0 || location.spiritualAlerts.some(alert => alert.severity === 'danger')) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-ios-dark-text mb-3 flex items-center">
              <div className="w-6 h-6 rounded-ios-sm bg-ios-red/10 flex items-center justify-center mr-2">
                <AlertTriangle className="h-4 w-4 text-ios-red" />
              </div>
              Alertas Espirituais Críticos
            </h3>
            <div className="space-y-3">
              {location.spiritualAlerts
                .filter(alert => alert.severity === 'danger')
                .slice(0, 2)
                .map((alert) => (
                  <Card key={alert.id} className="bg-ios-red/5 border-ios-red/20 rounded-ios-lg shadow-ios-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">{alert.title}</p>
                          <p className="text-xs text-ios-gray dark:text-ios-dark-text3 mt-1">{alert.description}</p>
                        </div>
                        <Badge className="bg-ios-red/10 text-ios-red border-ios-red/20 rounded-ios-sm font-medium text-xs">
                          {alert.type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Centros de Avivamento */}
        {aggregatedData?.revivalCenters.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-ios-dark-text mb-3 flex items-center">
              <div className="w-6 h-6 rounded-ios-sm bg-ios-green/10 flex items-center justify-center mr-2">
                <Crown className="h-4 w-4 text-ios-green" />
              </div>
              Centros de Avivamento Ativo
            </h3>
            <div className="space-y-3">
              {aggregatedData.revivalCenters.slice(0, 3).map((center) => (
                <Card key={center.id} className="bg-ios-green/5 border-ios-green/20 rounded-ios-lg shadow-ios-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">{center.name}</p>
                        <p className="text-xs text-ios-green">{center.intercessorCount} intercessores ativos</p>
                      </div>
                      <span className="text-lg">🔥</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Palavra Profética em Destaque */}
        {location.propheticWords.length > 0 && (
          <div className="mb-6">
            <Card className="bg-ios-yellow/5 border-ios-yellow/20 rounded-ios-lg shadow-ios-sm">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 rounded-ios-sm bg-ios-yellow/10 flex items-center justify-center mr-2">
                    <Crown className="h-4 w-4 text-ios-yellow" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-ios-dark-text">Palavra Profética para {location.name}</span>
                </div>
                <p className="text-sm text-gray-900 dark:text-ios-dark-text mb-3 font-serif italic">
                  "{location.propheticWords[0].content}"
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-ios-gray dark:text-ios-dark-text3">— {location.propheticWords[0].author}</p>
                  <Badge className={`${location.propheticWords[0].isVerified ? "bg-ios-green/10 text-ios-green border-ios-green/20" : "bg-ios-orange/10 text-ios-orange border-ios-orange/20"} rounded-ios-sm font-medium text-xs`}>
                    {location.propheticWords[0].isVerified ? "Verificada" : "Em análise"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subdivisões (Filhos) */}
        {children.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <Building className="h-4 w-4 text-purple-500 mr-2" />
              Subdivisões de {location.name}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {children.slice(0, 6).map((child) => {
                const ChildIcon = getLocationIcon(child.type);
                return (
                  <Card key={child.id} className="prayer-card cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <ChildIcon className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium">{child.name}</p>
                          <p className="text-xs text-muted-foreground">{child.intercessorCount} vigias</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {children.length > 6 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                +{children.length - 6} mais subdivisões
              </p>
            )}
          </div>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="prophetic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="prophetic" className="text-xs">Proféticas</TabsTrigger>
            <TabsTrigger value="prayer" className="text-xs">Oração</TabsTrigger>
            <TabsTrigger value="testimonies" className="text-xs">Testemunhos</TabsTrigger>
            <TabsTrigger value="missions" className="text-xs">Missões</TabsTrigger>
          </TabsList>

          <TabsContent value="prophetic" className="space-y-3 max-h-64 overflow-y-auto">
            {location.propheticWords.length > 0 ? (
              location.propheticWords.map((word) => (
                <Card key={word.id} className="prayer-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={word.isVerified ? "default" : "secondary"} className="text-xs">
                        {word.isVerified ? "Verificada" : "Em análise"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{word.date}</span>
                    </div>
                    <p className="text-sm text-foreground mb-2 font-serif italic">"{word.content}"</p>
                    <p className="text-xs text-muted-foreground">— {word.author}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Crown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma palavra profética registrada ainda.</p>
                <p className="text-xs mt-1">Seja o primeiro a compartilhar uma revelação!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prayer" className="space-y-3 max-h-64 overflow-y-auto">
            {location.prayerTargets.length > 0 ? (
              location.prayerTargets.map((target) => (
                <Card key={target.id} className="prayer-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className={`text-xs ${getSeverityColor(target.urgency)} text-white border-0`}>
                        {target.urgency}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {target.category}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-medium text-foreground mb-1">{target.title}</h4>
                    <p className="text-xs text-muted-foreground">{target.description}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sword className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum alvo de oração específico registrado.</p>
                <p className="text-xs mt-1">Identifique necessidades espirituais locais!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="testimonies" className="space-y-3 max-h-64 overflow-y-auto">
            {location.testimonies.length > 0 ? (
              location.testimonies.map((testimony) => (
                <Card key={testimony.id} className="prayer-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {testimony.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{testimony.date}</span>
                    </div>
                    <h4 className="text-sm font-medium text-foreground mb-2">{testimony.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{testimony.content}</p>
                    <p className="text-xs text-divine-400">— {testimony.author}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum testemunho compartilhado ainda.</p>
                <p className="text-xs mt-1">Compartilhe como Deus tem se movido!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="missions" className="space-y-3 max-h-64 overflow-y-auto">
            {location.missionBases.length > 0 ? (
              location.missionBases.map((base) => (
                <Card key={base.id} className="prayer-card">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-foreground mb-1">{base.name}</h4>
                    <p className="text-xs text-celestial-400 mb-2">{base.organization}</p>
                    <p className="text-xs text-muted-foreground mb-2">{base.focus.join(", ")}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Est. {base.established}</span>
                      <Button size="sm" variant="outline" className="text-xs h-6">
                        Contato
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma base missionária cadastrada.</p>
                <p className="text-xs mt-1">Registre ministérios e organizações locais!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Button 
            onClick={onContribute}
            className="w-full bg-gradient-to-r from-celestial-500 to-divine-500 hover:from-celestial-600 hover:to-divine-600"
          >
            <Crown className="h-4 w-4 mr-2" />
            Contribuir com Dados Espirituais
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <Heart className="h-4 w-4 mr-2" />
            🙏 Quero Interceder por {location.name}
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>Dados atualizados em tempo real</p>
          <p className="mt-1">Última atividade: {location.lastActivity}</p>
        </div>
      </div>
    </div>
  );
};

export default LocationPanel;
