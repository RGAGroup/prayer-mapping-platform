import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/useTranslation';
import {
  queueManagementService,
  type QueueBuilderConfig,
  type QueuePreview,
  type ProcessingProgress,
  type Batch
} from '@/services/queueManagementService';
import {
  Play,
  Pause,
  Square,
  Eye,
  Settings,
  List,
  Zap,
  DollarSign,
  Clock,
  Globe,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface QueueBuilderState {
  // Configuração
  config: QueueBuilderConfig;
  preview: QueuePreview | null;
  
  // Estados
  isGeneratingPreview: boolean;
  isCreatingBatch: boolean;
  
  // Batch ativo
  activeBatch: string | null;
  batchProgress: ProcessingProgress | null;
  
  // Histórico
  userBatches: Batch[];
}

export const QueueBuilderTab: React.FC = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<QueueBuilderState>({
    config: {
      continent: 'Americas',
      regionTypes: ['country'],
      filters: {},
      estimatedCostPerRegion: 0.03
    },
    preview: null,
    isGeneratingPreview: false,
    isCreatingBatch: false,
    activeBatch: null,
    batchProgress: null,
    userBatches: []
  });

  // Carregar batches do usuário
  useEffect(() => {
    loadUserBatches();
  }, []);

  // Monitorar progresso do batch ativo
  useEffect(() => {
    if (state.activeBatch) {
      const interval = setInterval(() => {
        updateBatchProgress();
      }, 3000); // Atualizar a cada 3 segundos

      return () => clearInterval(interval);
    }
  }, [state.activeBatch]);

  const loadUserBatches = async () => {
    try {
      const batches = await queueManagementService.getUserBatches();
      setState(prev => ({ ...prev, userBatches: batches }));
    } catch (error) {
      console.error('❌ Erro ao carregar batches:', error);
    }
  };

  const updateBatchProgress = async () => {
    if (!state.activeBatch) return;

    try {
      const progress = await queueManagementService.getBatchProgress(state.activeBatch);
      setState(prev => ({ ...prev, batchProgress: progress }));
    } catch (error) {
      console.error('❌ Erro ao atualizar progresso:', error);
    }
  };

  const generatePreview = async () => {
    setState(prev => ({ ...prev, isGeneratingPreview: true, preview: null }));

    try {
      const preview = await queueManagementService.buildQueuePreview(state.config);
      setState(prev => ({ ...prev, preview, isGeneratingPreview: false }));
    } catch (error) {
      console.error('❌ Erro ao gerar preview:', error);
      setState(prev => ({ ...prev, isGeneratingPreview: false }));
    }
  };

  const createAndStartBatch = async () => {
    if (!state.preview) return;

    setState(prev => ({ ...prev, isCreatingBatch: true }));

    try {
      const batchName = `${state.config.continent} - ${state.config.regionTypes.join(', ')}`;
      const description = `Processamento automático: ${state.preview.summary.totalRegions} regiões`;

      const batchId = await queueManagementService.createProcessingBatch(
        batchName,
        description,
        state.config,
        state.preview
      );

      await queueManagementService.startBatchProcessing(batchId);

      setState(prev => ({ 
        ...prev, 
        activeBatch: batchId, 
        isCreatingBatch: false 
      }));

      await loadUserBatches();

    } catch (error) {
      console.error('❌ Erro ao criar/iniciar batch:', error);
      setState(prev => ({ ...prev, isCreatingBatch: false }));
    }
  };

  const pauseBatch = async () => {
    if (!state.activeBatch) return;

    try {
      await queueManagementService.pauseBatchProcessing(state.activeBatch);
      await updateBatchProgress();
    } catch (error) {
      console.error('❌ Erro ao pausar batch:', error);
    }
  };

  const stopBatch = async () => {
    if (!state.activeBatch) return;

    try {
      await queueManagementService.stopBatchProcessing(state.activeBatch);
      setState(prev => ({ ...prev, activeBatch: null, batchProgress: null }));
      await loadUserBatches();
    } catch (error) {
      console.error('❌ Erro ao parar batch:', error);
    }
  };

  const updateConfig = (updates: Partial<QueueBuilderConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates },
      preview: null // Limpar preview quando config muda
    }));
  };

  const getBatchStatusBadge = (status: string) => {
    const statusConfig = {
      'created': { color: 'bg-ios-gray5/10 text-ios-gray border-ios-gray5/20', icon: Settings, label: t('queueBuilder.status.created') },
      'running': { color: 'bg-ios-blue/10 text-ios-blue border-ios-blue/20', icon: Play, label: t('queueBuilder.status.running') },
      'paused': { color: 'bg-ios-orange/10 text-ios-orange border-ios-orange/20', icon: Pause, label: t('queueBuilder.status.paused') },
      'completed': { color: 'bg-ios-green/10 text-ios-green border-ios-green/20', icon: CheckCircle, label: t('queueBuilder.status.completed') },
      'cancelled': { color: 'bg-ios-red/10 text-ios-red border-ios-red/20', icon: XCircle, label: t('queueBuilder.status.cancelled') },
      'failed': { color: 'bg-ios-red/10 text-ios-red border-ios-red/20', icon: AlertCircle, label: t('queueBuilder.status.failed') }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.created;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} rounded-ios-sm font-medium flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-ios-dark-text">{t('queueBuilder.title')}</h2>
        </div>
        <div className="flex items-center gap-3">
          {state.activeBatch && state.batchProgress && (
            <Badge className="bg-ios-blue/10 text-ios-blue border-ios-blue/20 rounded-ios-sm font-medium">
              <Zap className="w-3 h-3 mr-1" />
              {state.batchProgress.progressPercent.toFixed(0)}% {t('queueBuilder.completed')}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 rounded-ios-lg p-1">
          <TabsTrigger value="builder" className="rounded-ios-md data-[state=active]:bg-white dark:data-[state=active]:bg-ios-dark-bg2 data-[state=active]:shadow-ios-sm">{t('queueBuilder.tabs.builder')}</TabsTrigger>
          <TabsTrigger value="monitor" className="rounded-ios-md data-[state=active]:bg-white dark:data-[state=active]:bg-ios-dark-bg2 data-[state=active]:shadow-ios-sm">{t('queueBuilder.tabs.monitor')}</TabsTrigger>
          <TabsTrigger value="history" className="rounded-ios-md data-[state=active]:bg-white dark:data-[state=active]:bg-ios-dark-bg2 data-[state=active]:shadow-ios-sm">{t('queueBuilder.tabs.history')}</TabsTrigger>
        </TabsList>

        {/* TAB 1: QUEUE BUILDER */}
        <TabsContent value="builder" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Configuração */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-ios-dark-text">
                    <div className="w-8 h-8 rounded-ios-sm bg-ios-blue/10 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-ios-blue" />
                    </div>
                    {t('queueBuilder.config.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Seleção de Continente */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-2 block">{t('queueBuilder.config.continent')}</label>
                    <Select
                      value={state.config.continent}
                      onValueChange={(value) => updateConfig({ continent: value })}
                    >
                      <SelectTrigger className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl">
                        <SelectItem value="Americas">🌎 {t('queueBuilder.config.continents.americas')}</SelectItem>
                        <SelectItem value="Europe">🇪🇺 {t('queueBuilder.config.continents.europe')}</SelectItem>
                        <SelectItem value="Asia">🌏 {t('queueBuilder.config.continents.asia')}</SelectItem>
                        <SelectItem value="Africa">🌍 {t('queueBuilder.config.continents.africa')}</SelectItem>
                        <SelectItem value="Oceania">🏝️ {t('queueBuilder.config.continents.oceania')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tipos de Região */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-3 block">{t('queueBuilder.config.regionTypes')}</label>
                    <div className="space-y-3">
                      {[
                        { value: 'country', label: t('queueBuilder.config.types.countries'), desc: t('queueBuilder.config.types.countriesDesc') },
                        { value: 'state', label: t('queueBuilder.config.types.states'), desc: t('queueBuilder.config.types.statesDesc') },
                        { value: 'city', label: t('queueBuilder.config.types.cities'), desc: t('queueBuilder.config.types.citiesDesc') }
                      ].map(type => (
                        <div key={type.value} className="flex items-start space-x-3 p-3 bg-ios-gray6/20 dark:bg-ios-dark-bg3/20 rounded-ios-lg">
                          <Checkbox
                            id={type.value}
                            checked={state.config.regionTypes.includes(type.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateConfig({
                                  regionTypes: [...state.config.regionTypes, type.value]
                                });
                              } else {
                                updateConfig({
                                  regionTypes: state.config.regionTypes.filter(t => t !== type.value)
                                });
                              }
                            }}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <label htmlFor={type.value} className="text-sm font-medium text-gray-900 dark:text-ios-dark-text cursor-pointer">
                              {type.label}
                            </label>
                            <p className="text-xs text-ios-gray dark:text-ios-dark-text3 mt-1">{type.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filtros */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-3 block">{t('queueBuilder.config.advancedFilters')}</label>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-ios-gray6/20 dark:bg-ios-dark-bg3/20 rounded-ios-lg">
                        <Checkbox
                          id="christian-majority"
                          checked={state.config.filters.onlyChristianMajority || false}
                          onCheckedChange={(checked) =>
                            updateConfig({
                              filters: {
                                ...state.config.filters,
                                onlyChristianMajority: checked as boolean
                              }
                            })
                          }
                          className="mt-0.5"
                        />
                        <label htmlFor="christian-majority" className="text-sm text-gray-900 dark:text-ios-dark-text cursor-pointer">
                          {t('queueBuilder.config.filters.christianMajority')}
                        </label>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-ios-gray6/20 dark:bg-ios-dark-bg3/20 rounded-ios-lg">
                        <Checkbox
                          id="crisis-regions"
                          checked={state.config.filters.crisisRegions || false}
                          onCheckedChange={(checked) =>
                            updateConfig({
                              filters: {
                                ...state.config.filters,
                                crisisRegions: checked as boolean
                              }
                            })
                          }
                          className="mt-0.5"
                        />
                        <label htmlFor="crisis-regions" className="text-sm text-gray-900 dark:text-ios-dark-text cursor-pointer">
                          {t('queueBuilder.config.filters.crisisRegions')}
                        </label>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-ios-gray6/20 dark:bg-ios-dark-bg3/20 rounded-ios-lg">
                        <Checkbox
                          id="strategic"
                          checked={state.config.filters.strategicImportance || false}
                          onCheckedChange={(checked) =>
                            updateConfig({
                              filters: {
                                ...state.config.filters,
                                strategicImportance: checked as boolean
                              }
                            })
                          }
                          className="mt-0.5"
                        />
                        <label htmlFor="strategic" className="text-sm text-gray-900 dark:text-ios-dark-text cursor-pointer">
                          {t('queueBuilder.config.filters.unreachedPeoples')}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Custo por Região */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-2 block">{t('queueBuilder.config.costPerRegion')}</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="1.00"
                      value={state.config.estimatedCostPerRegion}
                      onChange={(e) =>
                        updateConfig({ estimatedCostPerRegion: parseFloat(e.target.value) || 0.03 })
                      }
                      className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg"
                    />
                  </div>

                  {/* Prompt Customizado */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-2 block">{t('queueBuilder.config.customPrompt')}</label>
                    <Textarea
                      placeholder={t('queueBuilder.config.customPromptPlaceholder')}
                      value={state.config.customPrompt || ''}
                      onChange={(e) => updateConfig({ customPrompt: e.target.value || undefined })}
                      rows={3}
                      className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg"
                    />
                  </div>

                  {/* Botão Gerar Preview */}
                  <Button
                    onClick={generatePreview}
                    disabled={state.isGeneratingPreview || state.config.regionTypes.length === 0}
                    className="w-full"
                  >
                    {state.isGeneratingPreview ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {t('queueBuilder.preview.generating')}
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        {t('queueBuilder.preview.generate')}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Preview e Ações */}
            <div className="space-y-6">
              {/* Resumo da Configuração */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="w-5 h-5" />
                    {t('queueBuilder.summary.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t('queueBuilder.summary.continent')}</span>
                      <Badge variant="outline">{state.config.continent}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('queueBuilder.summary.types')}</span>
                      <span>{state.config.regionTypes.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('queueBuilder.summary.filters')}</span>
                      <span>{Object.keys(state.config.filters).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview da Fila */}
              {state.preview && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      {t('queueBuilder.preview.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {state.preview.summary.totalRegions}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-ios-dark-text3">{t('queueBuilder.preview.totalRegions')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          ${state.preview.totalCost.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-ios-dark-text3">{t('queueBuilder.preview.estimatedCost')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {state.preview.totalTime}min
                        </div>
                        <div className="text-xs text-gray-600 dark:text-ios-dark-text3">{t('queueBuilder.preview.estimatedTime')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {state.preview.regions.filter(r => r.priority === 1).length}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-ios-dark-text3">{t('queueBuilder.preview.highPriority')}</div>
                      </div>
                    </div>

                    {/* Breakdown por Tipo */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">{t('queueBuilder.preview.breakdown')}</h4>
                      {state.preview.summary.countries > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>{t('queueBuilder.preview.countries')}</span>
                          <span>{state.preview.summary.countries}</span>
                        </div>
                      )}
                      {state.preview.summary.states > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>{t('queueBuilder.preview.states')}</span>
                          <span>{state.preview.summary.states}</span>
                        </div>
                      )}
                      {state.preview.summary.cities > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>{t('queueBuilder.preview.cities')}</span>
                          <span>{state.preview.summary.cities}</span>
                        </div>
                      )}
                    </div>

                    {/* Lista de Regiões (Preview) */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t('queueBuilder.preview.firstRegions')}</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {state.preview.regions.slice(0, 8).map((region, index) => (
                          <div key={index} className="flex justify-between items-center text-xs p-2 bg-gray-50 dark:bg-ios-dark-bg3/30 rounded">
                            <span className="font-medium">{region.name}</span>
                            <Badge
                              variant="outline"
                              className={
                                region.priority === 1 ? 'border-red-300 text-red-700' :
                                region.priority === 2 ? 'border-yellow-300 text-yellow-700' :
                                'border-gray-300 text-gray-700'
                              }
                            >
                              P{region.priority}
                            </Badge>
                          </div>
                        ))}
                        {state.preview.regions.length > 8 && (
                          <div className="text-xs text-gray-500 dark:text-ios-dark-text3 text-center p-2">
                            {t('queueBuilder.preview.andMore', { count: state.preview.regions.length - 8 })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botão Criar e Executar */}
                    <Button
                      onClick={createAndStartBatch}
                      disabled={state.isCreatingBatch || state.activeBatch !== null}
                      className="w-full"
                    >
                      {state.isCreatingBatch ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {t('queueBuilder.actions.creating')}
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          {t('queueBuilder.actions.createAndStart')}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: MONITOR */}
        <TabsContent value="monitor" className="space-y-6">
          {state.activeBatch && state.batchProgress ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    {t('queueBuilder.monitor.title')}
                  </div>
                  {getBatchStatusBadge(state.batchProgress.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progresso Geral */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t('queueBuilder.monitor.progress')}</span>
                    <span>{state.batchProgress.progressPercent.toFixed(1)}%</span>
                  </div>
                  <Progress value={state.batchProgress.progressPercent} className="h-2" />
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {state.batchProgress.totalRegions}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-ios-dark-text3">{t('queueBuilder.monitor.total')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {state.batchProgress.completedRegions}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-ios-dark-text3">{t('queueBuilder.monitor.completed')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {state.batchProgress.failedRegions}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-ios-dark-text3">{t('queueBuilder.monitor.failed')}</div>
                  </div>
                </div>

                {/* Região Atual */}
                {state.batchProgress.currentRegion && (
                  <div className="p-3 bg-blue-50 dark:bg-ios-blue/10 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 dark:text-ios-blue">
                      {t('queueBuilder.monitor.processingNow')}
                    </div>
                    <div className="text-blue-700 dark:text-ios-blue">
                      {state.batchProgress.currentRegion}
                    </div>
                  </div>
                )}

                {/* Custo Atual */}
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-ios-dark-bg3/30 rounded-lg">
                  <span className="text-sm font-medium">{t('queueBuilder.monitor.currentCost')}</span>
                  <span className="text-lg font-bold text-green-600">
                    ${state.batchProgress.actualCost.toFixed(2)}
                  </span>
                </div>

                {/* Controles */}
                <div className="flex gap-2">
                  {state.batchProgress.status === 'running' ? (
                    <Button onClick={pauseBatch} variant="outline" className="flex-1">
                      <Pause className="w-4 h-4 mr-2" />
                      {t('queueBuilder.actions.pause')}
                    </Button>
                  ) : state.batchProgress.status === 'paused' ? (
                    <Button onClick={() => queueManagementService.startBatchProcessing(state.activeBatch!)} className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      {t('queueBuilder.actions.continue')}
                    </Button>
                  ) : null}

                  <Button onClick={stopBatch} variant="destructive" className="flex-1">
                    <Square className="w-4 h-4 mr-2" />
                    {t('queueBuilder.actions.stop')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 dark:text-ios-dark-text3 mb-4">
                  <Zap className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-ios-dark-text mb-2">
                  {t('queueBuilder.monitor.noActive')}
                </h3>
                <p className="text-gray-600 dark:text-ios-dark-text3">
                  {t('queueBuilder.monitor.noActiveDesc')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 3: HISTÓRICO */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('queueBuilder.history.title')}</h3>
            <Button onClick={loadUserBatches} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('queueBuilder.actions.refresh')}
            </Button>
          </div>

          {state.userBatches.length > 0 ? (
            <div className="space-y-3">
              {state.userBatches.map((batch) => (
                <Card key={batch.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{batch.name}</h4>
                          {getBatchStatusBadge(batch.status)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-ios-dark-text3 mb-2">
                          {batch.description}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500 dark:text-ios-dark-text3">{t('queueBuilder.history.total')}</span>
                            <span className="ml-1 font-medium">{batch.total_regions}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-ios-dark-text3">{t('queueBuilder.history.completed')}</span>
                            <span className="ml-1 font-medium text-green-600">{batch.completed_regions}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-ios-dark-text3">{t('queueBuilder.history.cost')}</span>
                            <span className="ml-1 font-medium">${batch.actual_total_cost_usd.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-ios-dark-text3">{t('queueBuilder.history.created')}</span>
                            <span className="ml-1 font-medium">
                              {new Date(batch.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {batch.status === 'running' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setState(prev => ({ ...prev, activeBatch: batch.id }))}
                          >
                            {t('queueBuilder.actions.monitor')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 dark:text-ios-dark-text3 mb-4">
                  <List className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-ios-dark-text mb-2">
                  {t('queueBuilder.history.noHistory')}
                </h3>
                <p className="text-gray-600 dark:text-ios-dark-text3">
                  {t('queueBuilder.history.noHistoryDesc')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Instruções */}
      <Card className="bg-green-50 dark:bg-ios-green/10">
        <CardContent className="p-4">
          <h3 className="font-semibold text-green-900 dark:text-ios-green mb-2">{t('queueBuilder.instructions.title')}</h3>
          <ul className="text-sm text-green-800 dark:text-ios-green space-y-1">
            <li dangerouslySetInnerHTML={{ __html: t('queueBuilder.instructions.step1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('queueBuilder.instructions.step2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('queueBuilder.instructions.step3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('queueBuilder.instructions.step4') }} />
            <li dangerouslySetInnerHTML={{ __html: t('queueBuilder.instructions.tip') }} />
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};