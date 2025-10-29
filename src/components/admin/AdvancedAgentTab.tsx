// =====================================================
// ADVANCED AGENT TAB
// Interface avançada para controle do agente GPT-4o
// =====================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Play,
  Pause,
  Square,
  Settings,
  Brain,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  Clock,
  TrendingUp,
  MapPin,
  Filter,
  ChevronRight,
  Download,
  RefreshCw
} from 'lucide-react';
import PersonaManager from './PersonaManager';
import advancedAgentService from '@/services/advancedAgentService';
import type {
  AgentPersona,
  AgentTask,
  AgentSession,
  AgentUserControls,
  AgentResult,
  AgentTaskType,
  AgentStatistics
} from '@/types/Agent';

export const AdvancedAgentTab: React.FC = () => {
  const { t } = useTranslation();
  // Estados principais
  const [selectedPersona, setSelectedPersona] = useState<AgentPersona | null>(null);
  const [session, setSession] = useState<AgentSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState('personas');
  const [statistics, setStatistics] = useState<AgentStatistics | null>(null);
  const [pendingTasks, setPendingTasks] = useState<AgentResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados de controle do usuário
  const [userControls, setUserControls] = useState<AgentUserControls>({
    selectedPersona: '',
    selectedRegions: [],
    selectedCountries: [],
    selectedStates: [],
    dataTypes: {
      spiritual_data: true,
      prayer_points: true,
      cultural_context: false,
      historical_context: false,
      demographic_data: false,
      economic_context: false,
      religious_mapping: false
    },
    requireApproval: true,
    showPreview: true,
    approvalLevel: 'manual',
    batchSize: 5,
    delayBetweenRequests: 200,
    maxConcurrentRequests: 3,
    model: 'gpt-4o',
    temperature: 0.7,
    max_tokens: 1500,
    top_p: 1.0
  });

  // Dados de regiões
  const [regions, setRegions] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Carregar dados de regiões
  useEffect(() => {
    const loadRegionsData = async () => {
      try {
        const response = await fetch(
          `https://cxibuehwbuobwruhzwka.supabase.co/rest/v1/spiritual_regions?select=*`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aWJ1ZWh3YnVvYndydWh6d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM1MTIsImV4cCI6MjA2NjA1OTUxMn0.ElIj9TZvwu-0cXhypRUylA0glF2V7F2WNnrdTzJZbd4'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setRegions(data);
          
          // Separar por tipo
          const countriesData = data.filter((r: any) => r.region_type === 'country');
          const statesData = data.filter((r: any) => r.region_type === 'state');
          const citiesData = data.filter((r: any) => r.region_type === 'city');
          
          setCountries(countriesData.map((c: any) => ({
            country_code: c.country_code,
            name: c.name,
            id: c.id
          })));
          setStates(statesData);
          setCities(citiesData);
        }
      } catch (error) {
        console.error('Erro ao carregar regiões:', error);
      }
    };

    loadRegionsData();
  }, []);

  // Carregar dados ao montar
  useEffect(() => {
    loadStatistics();
    loadPendingTasks();
  }, []);

  // 1. FUNÇÕES DE CARREGAMENTO
  // =====================================================
  const loadStatistics = async () => {
    try {
      const stats = await advancedAgentService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadPendingTasks = async () => {
    try {
      // Implementar busca de tarefas pendentes
      // Por enquanto, array vazio
      setPendingTasks([]);
    } catch (error) {
      console.error('Erro ao carregar tarefas pendentes:', error);
    }
  };

  // 2. FUNÇÕES DE CONTROLE DE EXECUÇÃO
  // =====================================================
  const startProcessing = async () => {
    if (!selectedPersona) {
      alert(t('advancedAgent.alerts.selectPersona'));
      return;
    }

    if (userControls.selectedRegions.length === 0) {
      alert(t('advancedAgent.alerts.selectRegion'));
      return;
    }

    try {
      setIsRunning(true);
      setIsPaused(false);
      
      // Criar sessão
      const sessionData = {
        session_name: `Processamento ${new Date().toLocaleString()}`,
        description: `Processamento com persona ${selectedPersona.name}`,
        persona_id: selectedPersona.id,
        target_regions: userControls.selectedRegions,
        task_types: getSelectedTaskTypes()
      };

      // Aqui você implementaria a criação da sessão
      // Por enquanto, simular
      console.log('Iniciando processamento:', sessionData);

    } catch (error) {
      console.error('Erro ao iniciar processamento:', error);
      setIsRunning(false);
    }
  };

  const pauseProcessing = () => {
    setIsPaused(true);
  };

  const resumeProcessing = () => {
    setIsPaused(false);
  };

  const stopProcessing = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSession(null);
  };

  // 3. FUNÇÕES AUXILIARES
  // =====================================================
  const getSelectedTaskTypes = (): AgentTaskType[] => {
    return Object.entries(userControls.dataTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type, _]) => type as AgentTaskType);
  };

  const calculateEstimatedCost = (): number => {
    const tokensPerTask = userControls.max_tokens;
    const totalTasks = userControls.selectedRegions.length * getSelectedTaskTypes().length;
    return advancedAgentService.estimateCost(totalTasks * tokensPerTask, userControls.model);
  };

  const calculateEstimatedTime = (): number => {
    const tasksCount = userControls.selectedRegions.length * getSelectedTaskTypes().length;
    const timePerTask = 5000; // 5 segundos por tarefa
    const totalTime = tasksCount * timePerTask;
    return Math.ceil(totalTime / 1000 / 60); // em minutos
  };

  // 4. HANDLERS DE EVENTOS
  // =====================================================
  const handlePersonaSelect = (persona: AgentPersona) => {
    setSelectedPersona(persona);
    setUserControls(prev => ({
      ...prev,
      selectedPersona: persona.id,
      model: persona.model,
      temperature: persona.temperature,
      max_tokens: persona.max_tokens,
      top_p: persona.top_p
    }));
  };

  const handleRegionToggle = (regionId: string) => {
    setUserControls(prev => ({
      ...prev,
      selectedRegions: prev.selectedRegions.includes(regionId)
        ? prev.selectedRegions.filter(id => id !== regionId)
        : [...prev.selectedRegions, regionId]
    }));
  };

  const handleCountrySelect = (countryCode: string) => {
    const countryStates = states.filter(s => s.country_code === countryCode);
    const stateIds = countryStates.map(s => s.id);
    
    setUserControls(prev => ({
      ...prev,
      selectedCountries: prev.selectedCountries.includes(countryCode)
        ? prev.selectedCountries.filter(cc => cc !== countryCode)
        : [...prev.selectedCountries, countryCode],
      selectedRegions: prev.selectedCountries.includes(countryCode)
        ? prev.selectedRegions.filter(id => !stateIds.includes(id))
        : [...prev.selectedRegions, ...stateIds]
    }));
  };

  const handleTaskApproval = async (taskId: string, approved: boolean) => {
    try {
      if (approved) {
        await advancedAgentService.approveTask(taskId);
      } else {
        await advancedAgentService.rejectTask(taskId, t('advancedAgent.messages.rejectedByUser'));
      }
      await loadPendingTasks();
    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
    }
  };

  // 5. COMPONENTES DE RENDERIZAÇÃO
  // =====================================================
  const renderPersonaSelector = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {t('advancedAgent.persona.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedPersona ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{selectedPersona.name}</h4>
                <p className="text-sm text-gray-600 dark:text-ios-dark-text3">{selectedPersona.description}</p>
              </div>
              <Badge variant="secondary">{selectedPersona.model}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-gray-50 dark:bg-ios-dark-bg3/30 p-2 rounded">
                <span className="font-medium">{t('advancedAgent.persona.temp')}</span> {selectedPersona.temperature}
              </div>
              <div className="bg-gray-50 dark:bg-ios-dark-bg3/30 p-2 rounded">
                <span className="font-medium">{t('advancedAgent.persona.tokens')}</span> {selectedPersona.max_tokens}
              </div>
              <div className="bg-gray-50 dark:bg-ios-dark-bg3/30 p-2 rounded">
                <span className="font-medium">{t('advancedAgent.persona.topP')}</span> {selectedPersona.top_p}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('personas')}
            >
              <Settings className="w-4 h-4 mr-1" />
              {t('advancedAgent.persona.changePersona')}
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <Brain className="w-8 h-8 text-gray-400 dark:text-ios-dark-text3 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-ios-dark-text3 mb-3">{t('advancedAgent.persona.noPersona')}</p>
            <Button onClick={() => setActiveTab('personas')}>
              {t('advancedAgent.persona.selectPersona')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderRegionSelector = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {t('advancedAgent.regions.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Seleção rápida por país */}
          <div>
            <Label className="text-sm font-medium">{t('advancedAgent.regions.quickSelect')}</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {(countries || []).slice(0, 6).map(country => (
                <Button
                  key={country.country_code}
                  variant={userControls.selectedCountries.includes(country.country_code) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCountrySelect(country.country_code)}
                  className="justify-start"
                >
                  {country.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Badge variant="secondary">{userControls.selectedRegions.length}</Badge>
              <span>{t('advancedAgent.regions.selected')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary">{getSelectedTaskTypes().length}</Badge>
              <span>{t('advancedAgent.regions.taskTypes')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDataTypeSelector = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('advancedAgent.dataTypes.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(userControls.dataTypes).map(([type, enabled]) => (
            <div key={type} className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">
                  {t(`advancedAgent.dataTypes.${type}`)}
                </Label>
                <p className="text-xs text-gray-500 dark:text-ios-dark-text3">
                  {t(`advancedAgent.dataTypes.${type}_desc`)}
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => 
                  setUserControls(prev => ({
                    ...prev,
                    dataTypes: { ...prev.dataTypes, [type]: checked }
                  }))
                }
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderProcessingControls = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('advancedAgent.processingControls.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Aprovação */}
          <div className="space-y-2">
            <Label>{t('advancedAgent.processingControls.approvalSystem')}</Label>
            <Select
              value={userControls.approvalLevel}
              onValueChange={(value: 'automatic' | 'preview' | 'manual') =>
                setUserControls(prev => ({ ...prev, approvalLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">{t('advancedAgent.processingControls.automatic')}</SelectItem>
                <SelectItem value="preview">{t('advancedAgent.processingControls.preview')}</SelectItem>
                <SelectItem value="manual">{t('advancedAgent.processingControls.manual')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tamanho do lote */}
          <div>
            <Label>{t('advancedAgent.processingControls.batchSize')}: {userControls.batchSize}</Label>
            <Slider
              value={[userControls.batchSize]}
              onValueChange={([value]) => setUserControls(prev => ({ ...prev, batchSize: value }))}
              min={1}
              max={20}
              step={1}
              className="mt-2"
            />
          </div>

          {/* Delay entre requests */}
          <div>
            <Label>{t('advancedAgent.processingControls.delayBetweenRequests')}: {userControls.delayBetweenRequests}ms</Label>
            <Slider
              value={[userControls.delayBetweenRequests]}
              onValueChange={([value]) => setUserControls(prev => ({ ...prev, delayBetweenRequests: value }))}
              min={100}
              max={2000}
              step={100}
              className="mt-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEstimates = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {t('advancedAgent.estimates.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <DollarSign className="w-4 h-4" />
              <span className="text-lg font-semibold">
                ${calculateEstimatedCost().toFixed(4)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-ios-dark-text3">{t('advancedAgent.estimates.cost')}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <Clock className="w-4 h-4" />
              <span className="text-lg font-semibold">
                {calculateEstimatedTime()}min
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-ios-dark-text3">{t('advancedAgent.estimates.time')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderExecutionControls = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('advancedAgent.progress.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Botões de controle */}
          <div className="flex gap-2">
            {!isRunning ? (
              <Button onClick={startProcessing} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                {t('advancedAgent.actions.start')}
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button onClick={resumeProcessing} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    {t('advancedAgent.actions.continue')}
                  </Button>
                ) : (
                  <Button onClick={pauseProcessing} variant="outline" className="flex-1">
                    <Pause className="w-4 h-4 mr-2" />
                    {t('advancedAgent.actions.pause')}
                  </Button>
                )}
                <Button onClick={stopProcessing} variant="destructive">
                  <Square className="w-4 h-4 mr-2" />
                  {t('advancedAgent.actions.stop')}
                </Button>
              </>
            )}
          </div>

          {/* Progresso */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('advancedAgent.progress.label')}</span>
                <span>75%</span>
              </div>
              <Progress value={75} />
              <p className="text-xs text-gray-500 dark:text-ios-dark-text3">
                {t('advancedAgent.progress.processing', { current: 15, total: 20 })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderStatistics = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('advancedAgent.statistics.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {statistics ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {statistics.completed_tasks}
              </div>
              <p className="text-xs text-gray-500 dark:text-ios-dark-text3">{t('advancedAgent.statistics.completed')}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {statistics.pending_tasks}
              </div>
              <p className="text-xs text-gray-500 dark:text-ios-dark-text3">{t('advancedAgent.statistics.pending')}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {statistics.success_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 dark:text-ios-dark-text3">{t('advancedAgent.statistics.successRate')}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${statistics.estimated_cost.toFixed(4)}
              </div>
              <p className="text-xs text-gray-500 dark:text-ios-dark-text3">{t('advancedAgent.statistics.totalCost')}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-ios-dark-text3 text-center">{t('advancedAgent.statistics.loading')}</p>
        )}
      </CardContent>
    </Card>
  );

  const renderPendingTasks = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('advancedAgent.pendingTasks.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingTasks.length === 0 ? (
          <p className="text-gray-500 dark:text-ios-dark-text3 text-center py-4">
            {t('advancedAgent.pendingTasks.noTasks')}
          </p>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div key={task.task_id} className="flex items-center justify-between p-3 border dark:border-ios-dark-border rounded">
                <div className="flex-1">
                  <p className="font-medium">{task.region_name}</p>
                  <p className="text-sm text-gray-600 dark:text-ios-dark-text3">{task.task_type}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleTaskApproval(task.task_id, true)}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTaskApproval(task.task_id, false)}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // 6. RENDER PRINCIPAL
  // =====================================================
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personas">{t('advancedAgent.tabs.personas')}</TabsTrigger>
          <TabsTrigger value="control">{t('advancedAgent.tabs.control')}</TabsTrigger>
          <TabsTrigger value="monitor">{t('advancedAgent.tabs.monitor')}</TabsTrigger>
        </TabsList>

        <TabsContent value="personas" className="space-y-6">
          <PersonaManager
            onPersonaSelect={handlePersonaSelect}
            selectedPersonaId={selectedPersona?.id}
          />
        </TabsContent>

        <TabsContent value="control" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {renderPersonaSelector()}
              {renderRegionSelector()}
              {renderDataTypeSelector()}
            </div>
            <div className="space-y-6">
              {renderProcessingControls()}
              {renderEstimates()}
              {renderExecutionControls()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {renderStatistics()}
              {renderPendingTasks()}
            </div>
            <div className="space-y-6">
              {/* Aqui poderia ter mais componentes de monitoramento */}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAgentTab; 