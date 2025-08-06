import React, { useEffect, useState } from 'react';
import { X, MapPin, Heart, Shield, Star, Users, Calendar, Globe, ChevronDown, ChevronUp, FileText, Save, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';

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
  onSaveRegion?: (regionName: string, regionData: SpiritualData) => void;
  onGenerateAI?: (regionName: string, regionData: SpiritualData) => void;
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
    case 'urgent': return 'bg-ios-red text-white';
    case 'high': return 'bg-ios-orange text-white';
    case 'medium': return 'bg-ios-yellow text-black';
    case 'low': return 'bg-ios-gray3 text-ios-gray';
    default: return 'bg-ios-gray3 text-ios-gray';
  }
};

const getRevivalColor = (level: string) => {
  switch (level) {
    case 'avivamento': return 'text-ios-purple font-bold';
    case 'alto': return 'text-ios-green font-semibold';
    case 'médio': return 'text-ios-yellow';
    case 'baixo': return 'text-ios-gray';
    default: return 'text-ios-gray';
  }
};

const getAlertColor = (level: string) => {
  switch (level) {
    case 'vermelho': return 'bg-ios-red/10 border-ios-red text-ios-red';
    case 'laranja': return 'bg-ios-orange/10 border-ios-orange text-ios-orange';
    case 'amarelo': return 'bg-ios-yellow/10 border-ios-yellow text-ios-yellow';
    case 'verde': return 'bg-ios-green/10 border-ios-green text-ios-green';
    default: return 'bg-ios-gray5/10 border-ios-gray5 text-ios-gray';
  }
};

export const SpiritualPopup: React.FC<SpiritualPopupProps> = ({ data, position, onClose, onStartPrayer, onSaveRegion, onGenerateAI }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { isAdmin, userProfile, user } = useAuth();
  
  // FASE 1A: Liberado para TODOS os usuários para facilitar testes e colaboração
  const isAdminUser = true; // Sempre true - qualquer usuário pode salvar regiões

  const handleStartPrayer = () => {
    console.log(`🙏 Iniciando oração por ${data.region}`);
    if (onStartPrayer) {
      onStartPrayer(data.region, data);
    }
  };

  const handleSaveRegion = async () => {
    console.log(`💾 Salvando região ${data.region} no banco`);
    setIsLoading(true);
    try {
      if (onSaveRegion) {
        await onSaveRegion(data.region, data);
      }
    } catch (error) {
      console.error('Erro ao salvar região:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    console.log(`🤖 Gerando dados espirituais IA para ${data.region}`);
    setIsLoading(true);
    try {
      if (onGenerateAI) {
        await onGenerateAI(data.region, data);
      }
    } catch (error) {
      console.error('Erro ao gerar dados IA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Detectar se a região precisa de dados espirituais - SIMPLIFICADO
  const needsSpiritualData = data.recentActivity.some(activity => activity.id === 'region-not-mapped');
  
  // SEMPRE mostrar os 2 botões quando não há dados espirituais
  const showButtons = needsSpiritualData;
  
  // Debug apenas quando necessário
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 SpiritualPopup - Região: ${data.region}, Precisa dados espirituais: ${needsSpiritualData}, Mostrar botões: ${showButtons}`);
  }

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

  // Desktop: Sidebar fixa na lateral esquerda - iOS Style
  if (!isMobile) {
    return (
      <>
        {/* Overlay escuro com blur */}
        <div 
          className="fixed inset-0 bg-ios-dark-bg/30 backdrop-blur-sm z-40 animate-ios-fade-in"
          onClick={onClose}
        />
        
        {/* Sidebar Desktop iOS Style */}
        <div className="fixed left-0 top-0 bottom-0 w-96 bg-white/90 dark:bg-ios-dark-bg2/90 backdrop-blur-ios shadow-ios-2xl z-50 overflow-y-auto border-r border-ios-gray5/20 dark:border-ios-dark-bg4/20 animate-ios-slide-right">
          <div className="p-6">
            {/* Header com botão fechar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-ios-dark-text">
                  <div className="w-8 h-8 rounded-ios-md bg-ios-blue/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-ios-blue" />
                  </div>
                  {data.region || t('spiritualPopup.regionNotIdentified')}
                </h2>
                <p className="text-ios-gray dark:text-ios-dark-text3 capitalize font-medium mt-1">
                  {data.type === 'continent' ? t('map.continent') : 
                   data.type === 'country' ? t('map.country') :
                   data.type === 'state' ? t('map.state') :
                   data.type === 'city' ? t('map.city') : t('map.neighborhood')}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="w-10 h-10 rounded-ios-md hover:bg-ios-gray6 dark:hover:bg-ios-dark-bg3 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5 text-ios-gray dark:text-ios-dark-text2" />
              </Button>
            </div>

            {/* Botões Administrativos - Região Sem Dados Espirituais */}
            {showButtons && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-ios-xl border border-blue-200 dark:border-blue-700/30 mb-6">
                <div className="text-center text-blue-800 dark:text-blue-200 font-semibold mb-3 text-sm">
                  🗺️ Esta região precisa de mapeamento espiritual
                </div>
                <div className="flex gap-3">
                  <Button 
                    size="sm" 
                    onClick={handleSaveRegion}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0 rounded-ios-lg font-medium shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    💾 Salvar Região
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleGenerateAI}
                    disabled={isLoading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-0 rounded-ios-lg font-medium shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    🤖 Gerar IA
                  </Button>
                </div>
              </div>
            )}

            {/* Conteúdo */}
            <div className="space-y-6">
              {/* Sistema Geopolítico */}
              <div className="p-4 rounded-ios-xl bg-ios-blue/10 border border-ios-blue/20 backdrop-blur-ios">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-ios-md bg-ios-blue/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-ios-blue" />
                  </div>
                  <span className="font-semibold text-ios-blue text-lg">{t('spiritualPopup.geopoliticalSystem')}</span>
                </div>
                <div className="text-sm text-gray-700 dark:text-ios-dark-text2 whitespace-pre-wrap leading-relaxed">
                  {data.recentActivity.find(activity => activity.id === 'sistema-geo')?.description || 
                   t('spiritualPopup.geopoliticalInfoUnavailable')}
                </div>
              </div>

              {/* Alvos de Intercessão */}
              <div className="p-4 rounded-ios-xl bg-ios-red/10 border border-ios-red/20 backdrop-blur-ios">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-ios-md bg-ios-red/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-ios-red" />
                  </div>
                  <span className="font-semibold text-ios-red text-lg">{t('spiritualPopup.intercessionTargets')}</span>
                </div>
                <div className="space-y-3">
                  {data.prayerTargets.map((target, index) => (
                    <div key={target.id} className="text-sm text-gray-700 dark:text-ios-dark-text2 flex items-start gap-3 p-3 rounded-ios-md bg-white/50 dark:bg-ios-dark-bg3/50">
                      <span className="text-ios-red font-bold mt-0.5 text-base">•</span>
                      <span className="leading-relaxed flex-1">{target.description}</span>
                    </div>
                  ))}
                  {data.prayerTargets.length === 0 && (
                    <div className="text-sm text-ios-gray dark:text-ios-dark-text3 italic p-3 rounded-ios-md bg-white/50 dark:bg-ios-dark-bg3/50">
                      {t('spiritualPopup.noTargetsDefined')}
                    </div>
                  )}
                </div>
              </div>

              {/* Outras Informações Importantes */}
              {data.recentActivity.find(activity => activity.id === 'outras-info') && (
                <div className="p-4 rounded-ios-xl bg-ios-purple/10 border border-ios-purple/20 backdrop-blur-ios">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-ios-md bg-ios-purple/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-ios-purple" />
                    </div>
                    <span className="font-semibold text-ios-purple text-lg">📋 Outras Informações Importantes</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-ios-dark-text2 whitespace-pre-wrap leading-relaxed p-3 rounded-ios-md bg-white/50 dark:bg-ios-dark-bg3/50">
                    {data.recentActivity.find(activity => activity.id === 'outras-info')?.description || 
                     'Nenhuma informação adicional disponível.'}
                  </div>
                </div>
              )}

              {/* Estatísticas */}
              <div>
                <h4 className="font-bold mb-4 flex items-center gap-3 text-gray-900 dark:text-ios-dark-text text-lg">
                  <div className="w-8 h-8 rounded-ios-md bg-ios-indigo/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-ios-indigo" />
                  </div>
                  {t('spiritualPopup.statistics')}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-ios-blue/10 p-4 rounded-ios-xl border border-ios-blue/20 backdrop-blur-ios">
                    <div className="font-bold text-ios-blue text-2xl">{data.stats.totalIntercessors}</div>
                    <div className="text-ios-blue font-medium">{t('spiritualPopup.intercessors')}</div>
                  </div>
                  <div className="bg-ios-green/10 p-4 rounded-ios-xl border border-ios-green/20 backdrop-blur-ios">
                    <div className="font-bold text-ios-green text-2xl">{data.stats.activePrayers}</div>
                    <div className="text-ios-green font-medium">{t('spiritualPopup.activePrayers')}</div>
                  </div>
                  <div className="bg-ios-purple/10 p-4 rounded-ios-xl border border-ios-purple/20 backdrop-blur-ios">
                    <div className="font-bold text-ios-purple text-2xl">{data.stats.propheticWords}</div>
                    <div className="text-ios-purple font-medium">{t('spiritualPopup.updatedData')}</div>
                  </div>
                  <div className="bg-ios-orange/10 p-4 rounded-ios-xl border border-ios-orange/20 backdrop-blur-ios">
                    <div className="font-bold text-ios-orange text-2xl">{data.prayerTargets.length}</div>
                    <div className="text-ios-orange font-medium">{t('spiritualPopup.definedTargets')}</div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4">
                <Button 
                  size="lg" 
                  onClick={handleStartPrayer}
                  className="flex-1 bg-gradient-to-r from-ios-blue to-ios-indigo hover:from-ios-blue/90 hover:to-ios-indigo/90 text-white border-0 rounded-ios-xl font-semibold shadow-ios-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-ios-xl"
                >
                  {t('map.prayFor', { region: data.region })}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="flex-1 bg-white/60 dark:bg-ios-dark-bg3/60 backdrop-blur-ios border border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 text-gray-900 dark:text-ios-dark-text hover:bg-white/80 dark:hover:bg-ios-dark-bg3/80"
                >
                  {t('map.viewDetails')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Mobile: Bottom Sheet iOS Style
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-ios-dark-bg/40 backdrop-blur-sm z-40 animate-ios-fade-in"
        onClick={onClose}
      />
      
      {/* Bottom Sheet Mobile iOS Style */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios rounded-t-ios-2xl shadow-ios-2xl z-50 transition-all duration-300 ease-ios-bounce flex flex-col ${
          isExpanded ? 'h-[90vh]' : 'h-[60vh]'
        } animate-ios-slide-up`}
      >
        {/* Handle para arrastar */}
        <div className="w-full p-4 cursor-pointer flex-shrink-0" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="w-12 h-1 bg-ios-gray3 rounded-full mx-auto mb-4"></div>
          
          {/* Header compacto */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-ios-lg bg-ios-blue/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-ios-blue" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-ios-dark-text">{data.region || t('spiritualPopup.regionNotIdentified')}</h3>
                <p className="text-ios-gray dark:text-ios-dark-text3 text-sm capitalize font-medium">
                  {data.type === 'continent' ? t('map.continent') : 
                   data.type === 'country' ? t('map.country') :
                   data.type === 'state' ? t('map.state') :
                   data.type === 'city' ? t('map.city') : t('map.neighborhood')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-10 h-10 rounded-ios-md hover:bg-ios-gray6 dark:hover:bg-ios-dark-bg3 transition-all duration-200"
              >
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="w-10 h-10 rounded-ios-md hover:bg-ios-gray6 dark:hover:bg-ios-dark-bg3 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-4">
            {/* Botões Administrativos - Mobile */}
            {showButtons && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-ios-xl border border-blue-200 dark:border-blue-700/30">
                <div className="text-center text-blue-800 dark:text-blue-200 font-semibold mb-3 text-sm">
                  🗺️ Esta região precisa de mapeamento espiritual
                </div>
                <div className="flex gap-3">
                  <Button 
                    size="sm" 
                    onClick={handleSaveRegion}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0 rounded-ios-lg font-medium shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    💾 Salvar Região
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleGenerateAI}
                    disabled={isLoading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-0 rounded-ios-lg font-medium shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    🤖 Gerar IA
                  </Button>
                </div>
              </div>
            )}
            {/* Sistema Geopolítico */}
            <div className="p-4 rounded-ios-xl bg-ios-blue/10 border border-ios-blue/20 backdrop-blur-ios">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-ios-sm bg-ios-blue/20 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-ios-blue" />
                </div>
                <span className="font-semibold text-ios-blue">{t('spiritualPopup.geopoliticalSystem')}</span>
              </div>
              <div className="text-sm text-gray-700 dark:text-ios-dark-text2 whitespace-pre-wrap leading-relaxed">
                {data.recentActivity.find(activity => activity.id === 'sistema-geo')?.description || 
                 t('spiritualPopup.geopoliticalInfoUnavailable')}
              </div>
            </div>

            {/* Alvos de Intercessão */}
            <div className="p-4 rounded-ios-xl bg-ios-red/10 border border-ios-red/20 backdrop-blur-ios">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-ios-sm bg-ios-red/20 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-ios-red" />
                </div>
                <span className="font-semibold text-ios-red">{t('spiritualPopup.intercessionTargets')}</span>
              </div>
              <div className="space-y-2">
                {data.prayerTargets.map((target, index) => (
                  <div key={target.id} className="text-sm text-gray-700 dark:text-ios-dark-text2 flex items-start gap-2 p-2 rounded-ios-md bg-white/50 dark:bg-ios-dark-bg3/50">
                    <span className="text-ios-red font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{target.description}</span>
                  </div>
                ))}
                {data.prayerTargets.length === 0 && (
                  <div className="text-sm text-ios-gray dark:text-ios-dark-text3 italic p-2 rounded-ios-md bg-white/50 dark:bg-ios-dark-bg3/50">
                    {t('spiritualPopup.noTargetsDefined')}
                  </div>
                )}
              </div>
            </div>

            {/* Outras Informações Importantes */}
            {data.recentActivity.find(activity => activity.id === 'outras-info') && (
              <div className="p-4 rounded-ios-xl bg-ios-purple/10 border border-ios-purple/20 backdrop-blur-ios">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 rounded-ios-sm bg-ios-purple/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-ios-purple" />
                  </div>
                  <span className="font-semibold text-ios-purple">📋 Outras Informações Importantes</span>
                </div>
                <div className="text-sm text-gray-700 dark:text-ios-dark-text2 whitespace-pre-wrap leading-relaxed p-2 rounded-ios-md bg-white/50 dark:bg-ios-dark-bg3/50">
                  {data.recentActivity.find(activity => activity.id === 'outras-info')?.description || 
                   'Nenhuma informação adicional disponível.'}
                </div>
              </div>
            )}

            {/* Estatísticas - Grid adaptado para mobile */}
            <div>
              <h4 className="font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-ios-dark-text">
                <div className="w-6 h-6 rounded-ios-sm bg-ios-indigo/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-ios-indigo" />
                </div>
                {t('spiritualPopup.statistics')}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-ios-blue/10 p-3 rounded-ios-lg border border-ios-blue/20 backdrop-blur-ios">
                  <div className="font-bold text-ios-blue text-lg">{data.stats.totalIntercessors}</div>
                  <div className="text-ios-blue font-medium">{t('spiritualPopup.intercessors')}</div>
                </div>
                <div className="bg-ios-green/10 p-3 rounded-ios-lg border border-ios-green/20 backdrop-blur-ios">
                  <div className="font-bold text-ios-green text-lg">{data.stats.activePrayers}</div>
                  <div className="text-ios-green font-medium">{t('spiritualPopup.activePrayers')}</div>
                </div>
                <div className="bg-ios-purple/10 p-3 rounded-ios-lg border border-ios-purple/20 backdrop-blur-ios">
                  <div className="font-bold text-ios-purple text-lg">{data.stats.propheticWords}</div>
                  <div className="text-ios-purple font-medium">{t('spiritualPopup.updatedData')}</div>
                </div>
                <div className="bg-ios-orange/10 p-3 rounded-ios-lg border border-ios-orange/20 backdrop-blur-ios">
                  <div className="font-bold text-ios-orange text-lg">{data.prayerTargets.length}</div>
                  <div className="text-ios-orange font-medium">{t('spiritualPopup.definedTargets')}</div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-3 pt-2 pb-4">
              {/* Primeira linha - Botão principal de oração */}
              <div className="flex gap-3">
                <Button 
                  size="lg" 
                  onClick={handleStartPrayer}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-ios-blue to-ios-indigo hover:from-ios-blue/90 hover:to-ios-indigo/90 text-white border-0 rounded-ios-xl font-semibold shadow-ios-lg transition-all duration-200 hover:scale-105 active:scale-95 min-h-[48px] disabled:opacity-50"
                >
                  {t('map.prayFor', { region: data.region })}
                </Button>
                {!needsSpiritualData && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    disabled={isLoading}
                    className="flex-1 bg-white/60 dark:bg-ios-dark-bg3/60 backdrop-blur-ios border border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 text-gray-900 dark:text-ios-dark-text hover:bg-white/80 dark:hover:bg-ios-dark-bg3/80 min-h-[48px] disabled:opacity-50"
                  >
                    {t('map.viewDetails')}
                  </Button>
                )}
              </div>




            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 