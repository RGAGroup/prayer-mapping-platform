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
      'created': { color: 'bg-ios-gray5/10 text-ios-gray border-ios-gray5/20', icon: Settings },
      'running': { color: 'bg-ios-blue/10 text-ios-blue border-ios-blue/20', icon: Play },
      'paused': { color: 'bg-ios-orange/10 text-ios-orange border-ios-orange/20', icon: Pause },
      'completed': { color: 'bg-ios-green/10 text-ios-green border-ios-green/20', icon: CheckCircle },
      'cancelled': { color: 'bg-ios-red/10 text-ios-red border-ios-red/20', icon: XCircle },
      'failed': { color: 'bg-ios-red/10 text-ios-red border-ios-red/20', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.created;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} rounded-ios-sm font-medium flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-ios-dark-text">🤖 Queue Builder - Geração IA</h2>
          <p className="text-ios-gray dark:text-ios-dark-text3">Construa e gerencie filas de processamento para dados espirituais</p>
        </div>
        <div className="flex items-center gap-3">
          {state.activeBatch && state.batchProgress && (
            <Badge className="bg-ios-blue/10 text-ios-blue border-ios-blue/20 rounded-ios-sm font-medium">
              <Zap className="w-3 h-3 mr-1" />
              {state.batchProgress.progressPercent.toFixed(0)}% concluído
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 rounded-ios-lg p-1">
          <TabsTrigger value="builder" className="rounded-ios-md data-[state=active]:bg-white dark:data-[state=active]:bg-ios-dark-bg2 data-[state=active]:shadow-ios-sm">🔧 Queue Builder</TabsTrigger>
          <TabsTrigger value="monitor" className="rounded-ios-md data-[state=active]:bg-white dark:data-[state=active]:bg-ios-dark-bg2 data-[state=active]:shadow-ios-sm">📊 Monitor</TabsTrigger>
          <TabsTrigger value="history" className="rounded-ios-md data-[state=active]:bg-white dark:data-[state=active]:bg-ios-dark-bg2 data-[state=active]:shadow-ios-sm">📜 Histórico</TabsTrigger>
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
                    Configuração da Fila
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Seleção de Continente */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-2 block">Continente</label>
                    <Select 
                      value={state.config.continent} 
                      onValueChange={(value) => updateConfig({ continent: value })}
                    >
                      <SelectTrigger className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl">
                        <SelectItem value="Americas">🌎 Américas</SelectItem>
                        <SelectItem value="Europe">🇪🇺 Europa</SelectItem>
                        <SelectItem value="Asia">🌏 Ásia</SelectItem>
                        <SelectItem value="Africa">🌍 África</SelectItem>
                        <SelectItem value="Oceania">🏝️ Oceania</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tipos de Região */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-3 block">Tipos de Região</label>
                    <div className="space-y-3">
                      {[
                        { value: 'country', label: '🏛️ Países', desc: 'Nações e territórios' },
                        { value: 'state', label: '🗺️ Estados/Províncias', desc: 'Divisões administrativas' },
                        { value: 'city', label: '🏙️ Cidades', desc: 'Centros urbanos principais' }
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
                    <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-3 block">Filtros Avançados</label>
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
                          ✝️ Apenas regiões com maioria cristã
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
                          🆘 Regiões em crise (perseguição, conflito, crise humanitária)
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
                          🎯 Importância estratégica missionária
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* População Mínima */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-2 block">População Mínima</label>
                    <Input
                      type="number"
                      placeholder="Ex: 1000000 (1 milhão)"
                      value={state.config.filters.populationMin || ''}
                      onChange={(e) => 
                        updateConfig({ 
                          filters: { 
                            ...state.config.filters, 
                            populationMin: e.target.value ? parseInt(e.target.value) : undefined 
                          } 
                        })
                      }
                      className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg"
                    />
                  </div>

                  {/* Custo por Região */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-2 block">Custo Estimado por Região (USD)</label>
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
                    <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-2 block">Prompt Customizado (Opcional)</label>
                    <Textarea
                      placeholder="Deixe vazio para usar o template padrão..."
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
                        Gerando Preview...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Gerar Preview da Fila
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
                    Resumo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Continente:</span>
                      <Badge variant="outline">{state.config.continent}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipos:</span>
                      <span>{state.config.regionTypes.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Filtros:</span>
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
                      Preview da Fila
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {state.preview.summary.totalRegions}
                        </div>
                        <div className="text-xs text-gray-600">Total de Regiões</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          ${state.preview.totalCost.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">Custo Estimado</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {state.preview.totalTime}min
                        </div>
                        <div className="text-xs text-gray-600">Tempo Estimado</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {state.preview.regions.filter(r => r.priority === 1).length}
                        </div>
                        <div className="text-xs text-gray-600">Alta Prioridade</div>
                      </div>
                    </div>

                    {/* Breakdown por Tipo */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Breakdown:</h4>
                      {state.preview.summary.countries > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>🏛️ Países:</span>
                          <span>{state.preview.summary.countries}</span>
                        </div>
                      )}
                      {state.preview.summary.states > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>🗺️ Estados:</span>
                          <span>{state.preview.summary.states}</span>
                        </div>
                      )}
                      {state.preview.summary.cities > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>🏙️ Cidades:</span>
                          <span>{state.preview.summary.cities}</span>
                        </div>
                      )}
                    </div>

                    {/* Lista de Regiões (Preview) */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Primeiras Regiões:</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {state.preview.regions.slice(0, 8).map((region, index) => (
                          <div key={index} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded">
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
                          <div className="text-xs text-gray-500 text-center p-2">
                            ... e mais {state.preview.regions.length - 8} regiões
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
                          Criando Fila...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Criar e Executar Fila
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
                    Processamento em Andamento
                  </div>
                  {getBatchStatusBadge(state.batchProgress.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progresso Geral */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span>{state.batchProgress.progressPercent.toFixed(1)}%</span>
                  </div>
                  <Progress value={state.batchProgress.progressPercent} className="h-2" />
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {state.batchProgress.totalRegions}
                    </div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {state.batchProgress.completedRegions}
                    </div>
                    <div className="text-xs text-gray-600">Concluídas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {state.batchProgress.failedRegions}
                    </div>
                    <div className="text-xs text-gray-600">Falharam</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {state.batchProgress.skippedRegions}
                    </div>
                    <div className="text-xs text-gray-600">Puladas</div>
                  </div>
                </div>

                {/* Região Atual */}
                {state.batchProgress.currentRegion && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">
                      🔄 Processando agora:
                    </div>
                    <div className="text-blue-700">
                      {state.batchProgress.currentRegion}
                    </div>
                  </div>
                )}

                {/* Custo Atual */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">💰 Custo Atual:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${state.batchProgress.actualCost.toFixed(2)}
                  </span>
                </div>

                {/* Controles */}
                <div className="flex gap-2">
                  {state.batchProgress.status === 'running' ? (
                    <Button onClick={pauseBatch} variant="outline" className="flex-1">
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </Button>
                  ) : state.batchProgress.status === 'paused' ? (
                    <Button onClick={() => queueManagementService.startBatchProcessing(state.activeBatch!)} className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Continuar
                    </Button>
                  ) : null}
                  
                  <Button onClick={stopBatch} variant="destructive" className="flex-1">
                    <Square className="w-4 h-4 mr-2" />
                    Parar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Zap className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum Processamento Ativo
                </h3>
                <p className="text-gray-600">
                  Vá para o Queue Builder para criar uma nova fila de processamento.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 3: HISTÓRICO */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Histórico de Processamentos</h3>
            <Button onClick={loadUserBatches} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
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
                        <p className="text-sm text-gray-600 mb-2">
                          {batch.description}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <span className="ml-1 font-medium">{batch.total_regions}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Concluídas:</span>
                            <span className="ml-1 font-medium text-green-600">{batch.completed_regions}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Custo:</span>
                            <span className="ml-1 font-medium">${batch.actual_total_cost_usd.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Criado:</span>
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
                            Monitorar
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
                <div className="text-gray-400 mb-4">
                  <List className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum Histórico
                </h3>
                <p className="text-gray-600">
                  Você ainda não executou nenhum processamento em lote.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Instruções */}
      <Card className="bg-green-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-green-900 mb-2">🎯 Como Usar o Queue Builder</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• <strong>1. Configure:</strong> Escolha continente, tipos de região e filtros</li>
            <li>• <strong>2. Preview:</strong> Veja quantas regiões serão processadas e o custo</li>
            <li>• <strong>3. Execute:</strong> Crie a fila e acompanhe o progresso em tempo real</li>
            <li>• <strong>4. Monitor:</strong> Pause, retome ou pare o processamento conforme necessário</li>
            <li>• <strong>💡 Dica:</strong> Comece com poucos países para testar a qualidade dos prompts</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}; 