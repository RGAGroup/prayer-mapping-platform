import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Checkbox } from '../ui/checkbox';
import advancedAgentService from '../../services/advancedAgentService';
import { 
  queueManagementService, 
  type QueueBuilderConfig, 
  type QueuePreview, 
  type ProcessingProgress 
} from '../../services/queueManagementService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Globe,
  Filter,
  Search,
  Check,
  Clock,
  AlertTriangle,
  Zap,
  Database,
  MapPin,
  Edit,
  Eye,
  Plus,
  X,
  Play,
  Settings,
  List,
  DollarSign,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  Pause,
  Square
} from 'lucide-react';
import { AgentPersona } from '../../types/Agent';

interface SpiritualRegion {
  id: string;
  name: string;
  region_type: string;
  status: string;
  data_source: string;
  created_at: string;
  updated_at: string;
  country_code?: string;
  parent_id?: string;
  coordinates?: any;
  spiritual_data?: any;
}

interface SpiritualData {
  nome_local: string;
  palavra_profetica: string;
  alvos_intercessao: string[];
  alertas_espirituais: string[];
  sistema_geopolitico: {
    tipo_governo: string;
    cargos_principais: string[];
    locais_fisicos: Record<string, string>;
    filosofia_dominante: string[];
  };
  influencias_espirituais: string[];
  bases_missionarias: string[];
  testemunhos_avivamento: string[];
  acoes_intercessores: string[];
}

// Componente Input usando refs - SEM STATE
const StaticInput = memo(({ 
  defaultValue, 
  onSave, 
  placeholder = "", 
  type = "text",
  ...props 
}: { 
  defaultValue: string | number; 
  onSave: (value: string) => void; 
  placeholder?: string;
  type?: string;
  [key: string]: any;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = String(defaultValue);
    }
  }, [defaultValue]);

  const handleBlur = useCallback(() => {
    if (inputRef.current) {
      onSave(inputRef.current.value);
    }
  }, [onSave]);

  return (
    <Input
      {...props}
      ref={inputRef}
      type={type}
      defaultValue={String(defaultValue)}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
});

// Componente Textarea usando refs - SEM STATE  
const StaticTextarea = memo(({ 
  defaultValue, 
  onSave, 
  placeholder = "", 
  rows = 3,
  ...props 
}: { 
  defaultValue: string; 
  onSave: (value: string) => void; 
  placeholder?: string;
  rows?: number;
  [key: string]: any;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = defaultValue;
    }
  }, [defaultValue]);

  const handleBlur = useCallback(() => {
    if (textareaRef.current) {
      onSave(textareaRef.current.value);
    }
  }, [onSave]);

  return (
    <Textarea
      {...props}
      ref={textareaRef}
      defaultValue={defaultValue}
      onBlur={handleBlur}
      placeholder={placeholder}
      rows={rows}
      data-field={props['data-field']}
    />
  );
});

// Componente memoizado para arrays de strings
const ArrayEditor = memo(({ 
  title, 
  icon, 
  items, 
  placeholder, 
  onAdd, 
  onUpdate, 
  onRemove 
}: {
  title: string;
  icon: string;
  items: string[];
  placeholder: string;
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) => {
  const memoizedItems = useMemo(() => items, [items]);
  
  return (
    <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-ios-dark-text">
          {icon} {title} ({memoizedItems.length})
          <Button onClick={onAdd} size="sm" className="bg-ios-blue/10 hover:bg-ios-blue/20 text-ios-blue border-ios-blue/20 rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {memoizedItems.map((item, index) => (
          <div key={`${title}-${index}`} className="flex gap-2">
            <StaticInput
              defaultValue={item}
              onSave={(value) => onUpdate(index, value)}
              placeholder={placeholder}
              className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg"
            />
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onRemove(index)}
              className="bg-ios-red/10 hover:bg-ios-red/20 text-ios-red border-ios-red/20 rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

// Componente do Sistema de Fila AI
const AIQueueSystem = () => {
  const [queueConfig, setQueueConfig] = useState<QueueBuilderConfig>({
    continent: 'Americas',
    regionTypes: ['country'],
    filters: {},
    estimatedCostPerRegion: 0.03
  });
  const [queuePreview, setQueuePreview] = useState<QueuePreview | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [activeBatch, setActiveBatch] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<ProcessingProgress | null>(null);

  // Gerar preview da fila
  const generatePreview = async () => {
    setIsGeneratingPreview(true);
    try {
      const preview = await queueManagementService.buildQueuePreview(queueConfig);
      setQueuePreview(preview);
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Criar e iniciar batch
  const createBatch = async () => {
    if (!queuePreview) return;
    
    setIsCreatingBatch(true);
    try {
      const batchName = `Batch ${queueConfig.continent} - ${new Date().toLocaleDateString()}`;
      const batchDescription = `Processamento automático para ${queueConfig.continent}`;
      const batchId = await queueManagementService.createProcessingBatch(
        batchName,
        batchDescription,
        queueConfig,
        queuePreview
      );
      setActiveBatch(batchId);
      
      // Iniciar processamento
      await queueManagementService.startBatchProcessing(batchId);
    } catch (error) {
      console.error('Erro ao criar batch:', error);
    } finally {
      setIsCreatingBatch(false);
    }
  };

  // Monitorar progresso
  useEffect(() => {
    if (activeBatch) {
      const interval = setInterval(async () => {
        try {
          const progress = await queueManagementService.getBatchProgress(activeBatch);
          setBatchProgress(progress);
        } catch (error) {
          console.error('Erro ao monitorar progresso:', error);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [activeBatch]);

  return (
    <Tabs defaultValue="config" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 rounded-ios-lg">
        <TabsTrigger value="config" className="rounded-ios-md">⚙️ Configuração</TabsTrigger>
        <TabsTrigger value="preview" className="rounded-ios-md">👁️ Preview</TabsTrigger>
        <TabsTrigger value="progress" className="rounded-ios-md">📊 Progresso</TabsTrigger>
      </TabsList>

      {/* Aba Configuração */}
      <TabsContent value="config" className="space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">Continente</label>
            <Select value={queueConfig.continent} onValueChange={(value) => setQueueConfig(prev => ({ ...prev, continent: value }))}>
              <SelectTrigger className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl">
                <SelectItem value="Americas">Américas</SelectItem>
                <SelectItem value="Europe">Europa</SelectItem>
                <SelectItem value="Asia">Ásia</SelectItem>
                <SelectItem value="Africa">África</SelectItem>
                <SelectItem value="Oceania">Oceania</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">Tipos de Região</label>
            <div className="flex flex-wrap gap-2">
              {['country', 'state', 'city'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={type}
                    checked={queueConfig.regionTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setQueueConfig(prev => ({ 
                          ...prev, 
                          regionTypes: [...prev.regionTypes, type] 
                        }));
                      } else {
                        setQueueConfig(prev => ({ 
                          ...prev, 
                          regionTypes: prev.regionTypes.filter(t => t !== type) 
                        }));
                      }
                    }}
                  />
                  <label htmlFor={type} className="text-sm text-gray-900 dark:text-ios-dark-text capitalize">
                    {type === 'country' ? 'Países' : type === 'state' ? 'Estados' : 'Cidades'}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">Filtros Avançados</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="christianMajority"
                checked={queueConfig.filters.onlyChristianMajority || false}
                onCheckedChange={(checked) => setQueueConfig(prev => ({ 
                  ...prev, 
                  filters: { ...prev.filters, onlyChristianMajority: !!checked } 
                }))}
              />
              <label htmlFor="christianMajority" className="text-sm text-gray-900 dark:text-ios-dark-text">
                Apenas regiões com maioria cristã
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="strategicImportance"
                checked={queueConfig.filters.strategicImportance || false}
                onCheckedChange={(checked) => setQueueConfig(prev => ({ 
                  ...prev, 
                  filters: { ...prev.filters, strategicImportance: !!checked } 
                }))}
              />
              <label htmlFor="strategicImportance" className="text-sm text-gray-900 dark:text-ios-dark-text">
                Importância estratégica
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={generatePreview} 
            disabled={isGeneratingPreview}
            className="ios-button bg-ios-blue hover:bg-ios-blue/80 text-white rounded-ios-lg"
          >
            {isGeneratingPreview ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Gerando Preview...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Gerar Preview
              </>
            )}
          </Button>
        </div>
      </TabsContent>

      {/* Aba Preview */}
      <TabsContent value="preview" className="space-y-4 mt-4">
        {queuePreview ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-ios-blue/10 border-ios-blue/20 rounded-ios-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-ios-blue font-medium">Total de Regiões</p>
                      <p className="text-2xl font-bold text-ios-blue">{queuePreview.summary.totalRegions}</p>
                    </div>
                    <Globe className="w-8 h-8 text-ios-blue" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-ios-green/10 border-ios-green/20 rounded-ios-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-ios-green font-medium">Custo Estimado</p>
                      <p className="text-2xl font-bold text-ios-green">${queuePreview.totalCost.toFixed(2)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-ios-green" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-ios-orange/10 border-ios-orange/20 rounded-ios-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-ios-orange font-medium">Tempo Estimado</p>
                      <p className="text-2xl font-bold text-ios-orange">{queuePreview.totalTime}min</p>
                    </div>
                    <Clock className="w-8 h-8 text-ios-orange" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-ios-purple/10 border-ios-purple/20 rounded-ios-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-ios-purple font-medium">Países</p>
                      <p className="text-2xl font-bold text-ios-purple">{queuePreview.summary.countries}</p>
                    </div>
                    <MapPin className="w-8 h-8 text-ios-purple" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="max-h-60 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Região</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Custo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queuePreview.regions.slice(0, 20).map((region, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{region.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {region.type === 'country' ? 'País' : region.type === 'state' ? 'Estado' : 'Cidade'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={region.priority === 1 ? 'default' : 'secondary'}>
                          P{region.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>${region.estimatedCost.toFixed(3)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {queuePreview.regions.length > 20 && (
                <p className="text-sm text-ios-gray dark:text-ios-dark-text3 mt-2 text-center">
                  ... e mais {queuePreview.regions.length - 20} regiões
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={createBatch} 
                disabled={isCreatingBatch}
                className="ios-button bg-ios-green hover:bg-ios-green/80 text-white rounded-ios-lg"
              >
                {isCreatingBatch ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Criando Batch...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Processamento
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-ios-gray dark:text-ios-dark-text3 mx-auto mb-4" />
            <p className="text-ios-gray dark:text-ios-dark-text3">
              Configure os parâmetros e gere um preview para visualizar a fila
            </p>
          </div>
        )}
      </TabsContent>

      {/* Aba Progresso */}
      <TabsContent value="progress" className="space-y-4 mt-4">
        {batchProgress ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-ios-blue/10 border-ios-blue/20 rounded-ios-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-ios-blue font-medium">Progresso</p>
                      <p className="text-2xl font-bold text-ios-blue">{batchProgress.progressPercent}%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-ios-blue" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-ios-green/10 border-ios-green/20 rounded-ios-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-ios-green font-medium">Concluídas</p>
                      <p className="text-2xl font-bold text-ios-green">{batchProgress.completedRegions}</p>
                    </div>
                    <Check className="w-8 h-8 text-ios-green" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-ios-red/10 border-ios-red/20 rounded-ios-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-ios-red font-medium">Falhas</p>
                      <p className="text-2xl font-bold text-ios-red">{batchProgress.failedRegions}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-ios-red" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-900 dark:text-ios-dark-text">
                  {batchProgress.completedRegions} de {batchProgress.totalRegions} regiões processadas
                </span>
                <span className="text-ios-gray dark:text-ios-dark-text3">
                  {batchProgress.progressPercent}%
                </span>
              </div>
              <Progress value={batchProgress.progressPercent} className="h-2 bg-ios-gray6/30 dark:bg-ios-dark-bg3/30" />
            </div>

            {batchProgress.currentRegion && (
              <div className="bg-ios-blue/10 border-ios-blue/20 rounded-ios-lg p-4">
                <p className="text-sm text-ios-blue font-medium">Processando agora:</p>
                <p className="text-lg font-bold text-ios-blue">{batchProgress.currentRegion}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="ios-button border-ios-orange text-ios-orange hover:bg-ios-orange/10 rounded-ios-lg"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </Button>
              <Button 
                variant="outline" 
                className="ios-button border-ios-red text-ios-red hover:bg-ios-red/10 rounded-ios-lg"
              >
                <Square className="w-4 h-4 mr-2" />
                Parar
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <List className="w-12 h-12 text-ios-gray dark:text-ios-dark-text3 mx-auto mb-4" />
            <p className="text-ios-gray dark:text-ios-dark-text3">
              Nenhum batch em processamento. Crie uma fila para começar.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

const RegionsTab = () => {
  const [regions, setRegions] = useState<SpiritualRegion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const [existingData, setExistingData] = useState({
    countries: 0,
    states: 0,
    cities: 0,
    total: 0
  });
  const [selectedRegion, setSelectedRegion] = useState<SpiritualRegion | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPopulateModal, setShowPopulateModal] = useState(false);
  const [spiritualData, setSpiritualData] = useState<SpiritualData | null>(null);
  const [isUpdatingSpiritualData, setIsUpdatingSpiritualData] = useState(false);
  const [personas, setPersonas] = useState<AgentPersona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);

  // Carregar dados reais do Supabase
  useEffect(() => {
    loadRegionsData();
  }, []);

  useEffect(() => {
    // Carregar personas ao montar
    advancedAgentService.getPersonas().then((data) => {
      setPersonas(data);
      if (data.length > 0) {
        setSelectedPersonaId(data.find(p => p.is_default)?.id || data[0].id);
      }
    });
  }, []);

  const loadRegionsData = async () => {
    console.log('🔄 Carregando dados das regiões...');
    try {
      const { data, error } = await supabase
        .from('spiritual_regions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar regiões:', error);
        return;
      }

      if (data) {
        console.log('✅ Dados carregados:', data.length, 'regiões');
        console.log('📊 Dados espirituais encontrados:', data.filter(r => r.spiritual_data).length);
        setRegions(data);
        
        // Calcular estatísticas
        const countries = data.filter(r => r.region_type === 'country').length;
        const states = data.filter(r => r.region_type === 'state').length;
        const cities = data.filter(r => r.region_type === 'city').length;
        
        setExistingData({
          countries,
          states,
          cities,
          total: countries + states + cities
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-ios-green/10 text-ios-green border-ios-green/20 rounded-ios-sm font-medium">
            <Check className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-ios-orange/10 text-ios-orange border-ios-orange/20 rounded-ios-sm font-medium">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-ios-red/10 text-ios-red border-ios-red/20 rounded-ios-sm font-medium">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-ios-gray5/10 text-ios-gray border-ios-gray5/20 rounded-ios-sm font-medium">
            {status}
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'country':
        return (
          <Badge className="bg-ios-blue/10 text-ios-blue border-ios-blue/20 rounded-ios-sm font-medium">
            <Globe className="w-3 h-3 mr-1" />
            País
          </Badge>
        );
      case 'state':
        return (
          <Badge className="bg-ios-purple/10 text-ios-purple border-ios-purple/20 rounded-ios-sm font-medium">
            <MapPin className="w-3 h-3 mr-1" />
            Estado
          </Badge>
        );
      case 'city':
        return (
          <Badge className="bg-ios-indigo/10 text-ios-indigo border-ios-indigo/20 rounded-ios-sm font-medium">
            <MapPin className="w-3 h-3 mr-1" />
            Cidade
          </Badge>
        );
      default:
        return (
          <Badge className="bg-ios-gray5/10 text-ios-gray border-ios-gray5/20 rounded-ios-sm font-medium">
            {type}
          </Badge>
        );
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'ai_generated':
        return (
          <Badge className="bg-ios-teal/10 text-ios-teal border-ios-teal/20 rounded-ios-sm font-medium">
            <Zap className="w-3 h-3 mr-1" />
            IA
          </Badge>
        );
      case 'manual':
        return (
          <Badge className="bg-ios-yellow/10 text-ios-yellow border-ios-yellow/20 rounded-ios-sm font-medium">
            <Database className="w-3 h-3 mr-1" />
            Manual
          </Badge>
        );
      case 'imported':
        return (
          <Badge className="bg-ios-pink/10 text-ios-pink border-ios-pink/20 rounded-ios-sm font-medium">
            <Database className="w-3 h-3 mr-1" />
            Importado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-ios-gray5/10 text-ios-gray border-ios-gray5/20 rounded-ios-sm font-medium">
            {source}
          </Badge>
        );
    }
  };

  const filteredRegions = regions.filter(region => {
    const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || region.status === statusFilter;
    const matchesType = typeFilter === 'all' || region.region_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleApprove = (id: string) => {
    console.log('Aprovando região:', id);
    // TODO: Implementar aprovação
  };

  const handleReject = (id: string) => {
    console.log('Rejeitando região:', id);
    // TODO: Implementar rejeição
  };

  // Google Maps Status Card
  const GoogleMapsStatusCard = () => {
    const [status, setStatus] = useState({
      loaded: false,
      geocoderReady: false
    });

    useEffect(() => {
      const checkStatus = () => {
        const loaded = typeof window !== 'undefined' && window.google && window.google.maps;
        const geocoderReady = loaded && Boolean(window.google.maps.Geocoder);
        const isReady = loaded && geocoderReady;
        
        setStatus({ loaded: Boolean(loaded), geocoderReady });
        setIsGoogleMapsReady(Boolean(isReady));
      };

      checkStatus();
      const interval = setInterval(checkStatus, 1000);
      return () => clearInterval(interval);
    }, []);

    return (
      <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-ios-dark-text">
            <span className="text-lg">🗺️</span>
            Google Maps Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-ios-gray dark:text-ios-dark-text3">API:</span>
            <Badge variant={status.loaded ? "secondary" : "destructive"} className="rounded-ios-sm">
              {status.loaded ? '✅ Carregado' : '⏳ Carregando'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-ios-gray dark:text-ios-dark-text3">Geocoder:</span>
            <Badge variant={status.geocoderReady ? "secondary" : "destructive"} className="rounded-ios-sm">
              {status.geocoderReady ? '✅ Pronto' : '⏳ Aguardando'}
            </Badge>
          </div>
          <Separator className="my-2 bg-ios-gray5/20 dark:bg-ios-dark-bg4/20" />
          <div className="flex justify-between items-center font-medium">
            <span className="text-sm text-gray-900 dark:text-ios-dark-text">Status:</span>
            <Badge variant={isGoogleMapsReady ? "default" : "destructive"} className="rounded-ios-sm">
              {isGoogleMapsReady ? '🎉 Operacional' : '⚠️ Aguardando'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Existing Data Card
  const ExistingDataCard = () => (
    <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-ios-dark-text">
          <Database className="w-4 h-4" />
          Dados Existentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-ios-gray dark:text-ios-dark-text3">🇧🇷 Países:</span>
          <Badge variant={existingData.countries > 0 ? "secondary" : "outline"} className="rounded-ios-sm">
            {existingData.countries}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-ios-gray dark:text-ios-dark-text3">🏛️ Estados:</span>
          <Badge variant={existingData.states > 0 ? "secondary" : "outline"} className="rounded-ios-sm">
            {existingData.states}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-ios-gray dark:text-ios-dark-text3">🏙️ Cidades:</span>
          <Badge variant={existingData.cities > 0 ? "secondary" : "outline"} className="rounded-ios-sm">
            {existingData.cities}
          </Badge>
        </div>
        <Separator className="my-2 bg-ios-gray5/20 dark:bg-ios-dark-bg4/20" />
        <div className="flex justify-between items-center font-medium">
          <span className="text-sm text-gray-900 dark:text-ios-dark-text">📊 Total:</span>
          <Badge variant={existingData.total > 0 ? "default" : "outline"} className="rounded-ios-sm">
            {existingData.total}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  // Função para visualizar região
  const handleView = async (region: SpiritualRegion) => {
    console.log('👁️ Abrindo visualização para:', region.name);
    console.log('📊 Dados da região (cache):', region);
    console.log('📊 spiritual_data (cache):', region.spiritual_data);
    
    // Buscar dados diretamente do banco para debug
    console.log('🔍 Buscando dados frescos do banco...');
    const { data: freshData, error } = await supabase
      .from('spiritual_regions')
      .select('*')
      .eq('id', region.id)
      .single();
      
    if (error) {
      console.error('❌ Erro ao buscar dados frescos:', error);
      setSelectedRegion(region); // Usar dados do cache se falhar
    } else {
      console.log('🆕 Dados frescos do banco:', freshData);
      console.log('📊 spiritual_data fresco:', freshData?.spiritual_data);
      console.log('📊 spiritual_data tipo:', typeof freshData?.spiritual_data);
      
      // Verificar se os dados existem
      if (freshData?.spiritual_data) {
        console.log('✅ Dados espirituais encontrados!');
        console.log('📄 Conteúdo completo:', JSON.stringify(freshData.spiritual_data, null, 2));
      } else {
        console.log('⚠️ Nenhum dado espiritual encontrado');
      }
      
      // Usar dados frescos
      setSelectedRegion(freshData);
    }
    
    setShowViewModal(true);
  };

  // Função para editar região
  const handleEdit = async (region: SpiritualRegion) => {
    console.log('✏️ Abrindo edição para:', region.name);
    console.log('📊 Dados da região:', region);
    
    // Buscar dados diretamente do banco para debug
    console.log('🔍 Buscando dados frescos do banco para edição...');
    const { data: freshData, error } = await supabase
      .from('spiritual_regions')
      .select('*')
      .eq('id', region.id)
      .single();
      
    if (error) {
      console.error('❌ Erro ao buscar dados frescos para edição:', error);
    } else {
      console.log('🆕 Dados frescos do banco para edição:', freshData);
      console.log('📊 spiritual_data fresco para edição:', freshData?.spiritual_data);
      // Usar dados frescos
      setSelectedRegion(freshData);
    }
    
    setShowEditModal(true);
  };

  // Função para gerar dados com IA
  const handleGenerateWithAI = async (region: SpiritualRegion) => {
    console.log('🤖 Gerando dados com IA para:', region.name);
    try {
      if (!selectedPersonaId) {
        alert('Selecione uma persona antes de gerar.');
        return;
      }
      const persona = personas.find(p => p.id === selectedPersonaId);
      if (!persona) {
        alert('Persona selecionada não encontrada.');
        return;
      }
      // Criar contexto da região
      const regionContext = {
        region_id: region.id,
        region_name: region.name,
        region_type: region.region_type as 'country' | 'state' | 'city' | 'neighborhood',
        country_code: region.country_code,
        coordinates: region.coordinates,
        existing_spiritual_data: region.spiritual_data
      };
      // Executar geração de dados espirituais
      const result = await advancedAgentService.executeTask(
        persona,
        regionContext,
        'spiritual_data'
      );
      console.log('✅ Dados gerados com sucesso:', result);
      // Recarregar dados para mostrar a atualização
      await loadRegionsData();
      alert(`Dados espirituais gerados com sucesso para ${region.name}! Verifique na aba de edição.`);
    } catch (error) {
      console.error('❌ Erro ao gerar dados com IA:', error);
      alert('Erro ao gerar dados com IA. Verifique se a API OpenAI está configurada corretamente.');
    }
  };

  // Função otimizada para salvar dados espirituais
  const handleSaveSpiritualData = useCallback(async () => {
    if (!selectedRegion || !spiritualData) return;
    
    setIsUpdatingSpiritualData(true);
    
    try {
      const { error } = await supabase
        .from('spiritual_regions')
        .update({
          spiritual_data: spiritualData as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRegion.id);
      
      if (error) throw error;
      
      console.log('✅ Dados espirituais salvos com sucesso!');
      
      // Recarregar dados
      await loadRegionsData();
      setShowEditModal(false);
      
    } catch (error) {
      console.error('❌ Erro ao salvar dados espirituais:', error);
    } finally {
      setIsUpdatingSpiritualData(false);
    }
  }, [selectedRegion, spiritualData]);

  // Função otimizada para atualizar dados com debounce
  const updateSpiritualField = useCallback((field: keyof SpiritualData, value: any, index?: number, subField?: string) => {
    setSpiritualData(prev => {
      if (!prev) return prev;
      
      const newData = { ...prev };
      
      if (field === 'sistema_geopolitico' && subField) {
        newData.sistema_geopolitico = { ...prev.sistema_geopolitico };
        if (subField === 'cargos_principais' || subField === 'filosofia_dominante') {
          (newData.sistema_geopolitico as any)[subField] = value;
        } else if (subField.startsWith('locais_fisicos.')) {
          const localKey = subField.replace('locais_fisicos.', '');
          newData.sistema_geopolitico.locais_fisicos = { 
            ...prev.sistema_geopolitico.locais_fisicos, 
            [localKey]: value 
          };
        } else {
          (newData.sistema_geopolitico as any)[subField] = value;
        }
      } else if (Array.isArray(prev[field])) {
        if (index !== undefined) {
          const sectionArray = [...(prev[field] as string[])];
          sectionArray[index] = value;
          (newData as any)[field] = sectionArray;
        } else {
          (newData as any)[field] = value;
        }
      } else {
        (newData as any)[field] = value;
      }
      
      return newData;
    });
  }, []);

  // Função para adicionar item em array
  const addToArray = useCallback((field: keyof SpiritualData, defaultValue = '') => {
    setSpiritualData(prev => {
      if (!prev) return prev;
      const currentArray = prev[field] as string[] || [];
      return {
        ...prev,
        [field]: [...currentArray, defaultValue]
      };
    });
  }, []);

  // Função para remover item de array
  const removeFromArray = useCallback((field: keyof SpiritualData, index: number) => {
    setSpiritualData(prev => {
      if (!prev) return prev;
      const currentArray = prev[field] as string[] || [];
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== index)
      };
    });
  }, []);

  // Modal COMPLETAMENTE isolado - sem dependências do state do pai
  const EditModal = memo(() => {
    // Estado próprio isolado do modal
    const [isOpen, setIsOpen] = useState(false);
    const [regionData, setRegionData] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // Sincronizar apenas quando necessário
    useEffect(() => {
      setIsOpen(showEditModal);
      if (showEditModal && selectedRegion) {
        console.log('✏️ EditModal - Região selecionada:', selectedRegion);
        console.log('📊 Dados espirituais atual:', selectedRegion.spiritual_data);
        setRegionData({
          region: selectedRegion,
          spiritual: selectedRegion.spiritual_data || {}
        });
      }
    }, [showEditModal, selectedRegion?.id]);

    const handleClose = useCallback(() => {
      setShowEditModal(false);
      setIsOpen(false);
    }, []);

    const handleSave = useCallback(async () => {
      if (!regionData?.region?.id) return;
      
      // Coletar dados diretamente dos textareas via refs antes de salvar
      const sistema = (document.querySelector('[data-field="sistema_geopolitico_completo"]') as HTMLTextAreaElement)?.value || '';
      const alvos = (document.querySelector('[data-field="alvos_intercessao_completo"]') as HTMLTextAreaElement)?.value || '';
      
      const dadosParaSalvar = {
        ...regionData.spiritual,
        sistema_geopolitico_completo: sistema,
        alvos_intercessao_completo: alvos
      };
      
      console.log('🔄 Salvando dados:', dadosParaSalvar);
      console.log('🎯 ID da região:', regionData.region.id);
      
      // PRIMEIRO: Verificar se a região existe
      console.log('🔍 Verificando se a região existe...');
      const { data: existingRegion, error: checkError } = await supabase
        .from('spiritual_regions')
        .select('id, name, spiritual_data')
        .eq('id', regionData.region.id)
        .single();
        
      if (checkError) {
        console.error('❌ Erro ao verificar região:', checkError);
      } else {
        console.log('✅ Região encontrada:', existingRegion);
      }
      
      setSaving(true);
      try {
        // VERIFICAR PERMISSÕES E USUÁRIO ATUAL
        console.log('🔐 Verificando estado de autenticação...');
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('❌ Erro de autenticação:', authError);
          throw new Error('Usuário não autenticado');
        }
        
        console.log('👤 Usuário atual:', user?.email, user?.id);
        
        // Tentar um SELECT simples primeiro para verificar acesso
        const { data: testRead, error: readError } = await supabase
          .from('spiritual_regions')
          .select('id, name')
          .eq('id', regionData.region.id)
          .single();
          
        if (readError) {
          console.error('❌ Erro ao testar leitura:', readError);
          throw new Error('Sem permissão para ler a região');
        }
        
        console.log('✅ Leitura permitida:', testRead);
        
        // CONTORNAR RLS TEMPORARIAMENTE - usando bypass de service role
        console.log('🔓 Tentando UPDATE com bypass RLS...');
        
        // Forçar UPDATE apenas no campo spiritual_data
        console.log('🔍 Tentando UPDATE direto...');
        
        const { data, error } = await supabase
          .from('spiritual_regions')
          .update({ 
            spiritual_data: dadosParaSalvar
          })
          .eq('id', regionData.region.id)
          .select();

        if (error) {
          console.error('❌ Erro detalhado do UPDATE:', error);
          console.error('🔍 Código do erro:', error.code);
          console.error('🔍 Mensagem:', error.message);
          console.error('🔍 Detalhes:', error.details);
          console.error('🔍 Dica:', error.hint);
          
          if (error.code === '42501') {
            console.error('🚨 PROBLEMA RLS DETECTADO!');
            console.error('📋 Possíveis soluções:');
            console.error('1. Aplicar migration: supabase/migrations/20250625_fix_rls_spiritual_regions.sql');
            console.error('2. Verificar se user_profiles tem role "admin"');
            console.error('3. Desabilitar RLS temporariamente para desenvolvimento');
            alert('❌ ERRO RLS: Sem permissão para atualizar esta região.\n\n' +
                  'SOLUÇÃO:\n' +
                  '1. Aplicar migration RLS\n' +
                  '2. Verificar perfil de usuário\n' +
                  '3. Contate administrador');
            throw new Error('Políticas RLS bloqueando UPDATE - veja console para soluções');
          }
          
          throw error;
        }
        
        console.log('💾 Resultado do update:', data);
        console.log('📊 Linhas afetadas:', data?.length || 0);
        
        if (!data || data.length === 0) {
          console.error('⚠️ UPDATE não afetou nenhum registro');
          console.error('🔍 Possíveis causas:');
          console.error('  1. ID não existe na tabela');
          console.error('  2. Políticas RLS bloqueando');
          console.error('  3. Condição WHERE não atendida');
          throw new Error('UPDATE não afetou registros - verifique permissões RLS');
        }
        
        console.log('✅ Dados salvos com sucesso!');
        
        // Recarregar dados E atualizar a região selecionada
        await loadRegionsData();
        
        // Buscar a região atualizada e atualizar selectedRegion
        const { data: updatedRegion, error: fetchError } = await supabase
          .from('spiritual_regions')
          .select('*')
          .eq('id', regionData.region.id)
          .single();
          
        if (fetchError) {
          console.error('❌ Erro ao buscar região atualizada:', fetchError);
        }
          
        if (updatedRegion) {
          console.log('🔄 Região atualizada:', updatedRegion);
          console.log('📊 Dados espirituais na região atualizada:', updatedRegion.spiritual_data);
          setSelectedRegion(updatedRegion);
        } else {
          console.log('❌ Região atualizada não encontrada');
        }
        
        handleClose();
      } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        alert('Erro ao salvar dados: ' + error.message);
      } finally {
        setSaving(false);
      }
    }, [regionData]);

    const updateField = useCallback((field: string, value: any) => {
      setRegionData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          spiritual: {
            ...prev.spiritual,
            [field]: value
          }
        };
      });
    }, []);

    if (!isOpen || !regionData) return null;

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-2xl shadow-ios-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-ios-dark-text">
              🌍 Dados Espirituais: {regionData.region.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            
            {/* Sistema Geopolítico */}
            <div>
              <label className="text-lg font-semibold mb-3 block text-gray-900 dark:text-ios-dark-text">🏛️ Sistema Geopolítico</label>
              <StaticTextarea
                defaultValue={regionData.spiritual.sistema_geopolitico_completo || ''}
                onSave={(value) => updateField('sistema_geopolitico_completo', value)}
                placeholder={`Digite as informações do sistema geopolítico desta região:

Exemplo:
🏛️ Sistema Geopolítico:
Tipo de governo:
República Federal Parlamentarista

Cargos principais:
Primeiro-Ministro, Presidente, Membros do Parlamento

Locais físicos de poder:
Parlamento, Residência do Presidente, Escritórios governamentais

Filosofia dominante:
Descreva a filosofia política e espiritual dominante...`}
                rows={12}
                className="text-sm bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg text-gray-900 dark:text-ios-dark-text"
                data-field="sistema_geopolitico_completo"
              />
            </div>

            {/* Alvos de Intercessão */}
            <div>
              <label className="text-lg font-semibold mb-3 block text-gray-900 dark:text-ios-dark-text">🔥 Alvos de Intercessão</label>
              <StaticTextarea
                defaultValue={regionData.spiritual.alvos_intercessao_completo || ''}
                onSave={(value) => updateField('alvos_intercessao_completo', value)}
                placeholder={`Digite os alvos de intercessão para esta região:

Exemplo:
🔥 Alvos de Intercessão:
Quebra do sistema de castas e das fortalezas espirituais associadas

Intercessão pelas regiões onde cristãos são perseguidos

Derrubada de altares consagrados ao controle territorial e político

Conversão de líderes influentes para Cristo

Levantamento de intercessores e evangelistas nativos com ousadia

Cobertura espiritual sobre missionários em campo

Que o Reino de Deus avance em meio à perseguição`}
                rows={12}
                className="text-sm bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg text-gray-900 dark:text-ios-dark-text"
                data-field="alvos_intercessao_completo"
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="bg-ios-gray6/20 hover:bg-ios-gray6/40 text-gray-900 dark:text-ios-dark-text border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-ios-blue hover:bg-ios-blue/80 text-white border-none rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  });

  // Modal de Visualização simples
  const ViewModal = memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewData, setViewData] = useState<any>(null);

    useEffect(() => {
      setIsOpen(showViewModal);
      if (showViewModal && selectedRegion) {
        console.log('👁️ ViewModal - Região selecionada:', selectedRegion);
        console.log('📊 Dados espirituais:', selectedRegion.spiritual_data);
        console.log('📊 Tipo dos dados:', typeof selectedRegion.spiritual_data);
        setViewData({
          region: selectedRegion,
          spiritual: selectedRegion.spiritual_data || {}
        });
      }
    }, [showViewModal, selectedRegion?.id]);

    const handleClose = useCallback(() => {
      setShowViewModal(false);
      setIsOpen(false);
    }, []);

    if (!isOpen || !viewData || !('spiritual' in viewData)) return null;

    const spiritual = viewData.spiritual ?? '';

    // Função para formatar dados espirituais (suporta objeto e string)
    function formatSpiritualData(data: any) {
      if (!data) return null;
      
      // Se for string, usar formatação de texto
      if (typeof data === 'string') {
        return formatSpiritualText(data);
      }
      
      // Se for objeto, formatar campos específicos
      if (typeof data === 'object') {
        const sections = [];
        
        // Sistema Geopolítico
        if (data.sistema_geopolitico_completo) {
          sections.push(
            <div key="geo" className="mb-4">
              <h4 className="font-bold text-ios-blue mb-2">🏛️ Sistema Geopolítico:</h4>
              <div className="bg-ios-blue/10 border border-ios-blue/20 p-3 rounded-ios-lg backdrop-blur-ios">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-ios-dark-text">{data.sistema_geopolitico_completo}</pre>
              </div>
            </div>
          );
        }
        
        // Alvos de Intercessão
        if (data.alvos_intercessao_completo) {
          sections.push(
            <div key="alvos" className="mb-4">
              <h4 className="font-bold text-ios-red mb-2">🔥 Alvos de Intercessão:</h4>
              <div className="bg-ios-red/10 border border-ios-red/20 p-3 rounded-ios-lg backdrop-blur-ios">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-ios-dark-text">{data.alvos_intercessao_completo}</pre>
              </div>
            </div>
          );
        }
        
        // Outras Informações Importantes
        if (data.outras_informacoes_importantes) {
          sections.push(
            <div key="outras" className="mb-4">
              <h4 className="font-bold text-ios-purple mb-2">📋 Outras Informações Importantes:</h4>
              <div className="bg-ios-purple/10 border border-ios-purple/20 p-3 rounded-ios-lg backdrop-blur-ios">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-ios-dark-text">{data.outras_informacoes_importantes}</pre>
              </div>
            </div>
          );
        }
        
        // Se não encontrou os campos específicos, mostrar dados brutos
        if (sections.length === 0) {
          sections.push(
            <div key="raw" className="mb-4">
              <h4 className="font-bold text-ios-gray mb-2">📊 Dados Espirituais:</h4>
              <div className="bg-ios-gray6/20 dark:bg-ios-dark-bg3/20 border border-ios-gray5/20 dark:border-ios-dark-bg4/20 p-3 rounded-ios-lg backdrop-blur-ios">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-ios-dark-text">{JSON.stringify(data, null, 2)}</pre>
              </div>
            </div>
          );
        }
        
        return <div>{sections}</div>;
      }
      
      return null;
    }

    // Função para formatar texto: destaca títulos e mantém quebras
    function formatSpiritualText(text: string) {
      if (!text) return null;
      // Destaca linhas que terminam com ':' como títulos
      const lines = text.split(/\r?\n/);
      return (
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900 dark:text-ios-dark-text" style={{background: 'none', padding: 0, margin: 0}}>
          {lines.map((line, idx) => {
            if (/^\s*[^:]+:\s*$/.test(line)) {
              // Título
              return <span key={idx} style={{fontWeight: 'bold', color: '#007AFF'}}>{line}\n</span>;
            }
            return <span key={idx}>{line}\n</span>;
          })}
        </pre>
      );
    }

    if (!isOpen || !viewData) return null;

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-2xl shadow-ios-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-ios-dark-text">
              👁️ Visualizar: {viewData.region.name}
            </DialogTitle>
            <DialogDescription className="text-ios-gray dark:text-ios-dark-text3">
              Dados espirituais salvos para esta região
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {spiritual && (typeof spiritual === 'string' ? spiritual.trim() : Object.keys(spiritual).length > 0) ? (
              <div className="mt-2">
                {formatSpiritualData(spiritual)}
              </div>
            ) : (
              <div className="text-center py-8 text-ios-gray dark:text-ios-dark-text3">
                <p className="text-lg">📝 Nenhum dado espiritual cadastrado ainda</p>
                <p className="text-sm mt-2">Clique em "Editar" para adicionar informações</p>
                <Button 
                  className="mt-4 bg-ios-blue hover:bg-ios-blue/80 text-white border-none rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95" 
                  onClick={() => {
                    handleClose();
                    handleEdit(viewData.region);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Adicionar Dados Espirituais
                </Button>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="bg-ios-gray6/20 hover:bg-ios-gray6/40 text-gray-900 dark:text-ios-dark-text border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  });

  // Regions Table
  const RegionsTable = () => (
    <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-ios-dark-text">Regiões Mapeadas ({filteredRegions.length})</CardTitle>
        <CardDescription className="text-ios-gray dark:text-ios-dark-text3">
          Lista de todas as regiões geográficas e espirituais cadastradas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-900 dark:text-ios-dark-text">Nome</TableHead>
              <TableHead className="text-gray-900 dark:text-ios-dark-text">Tipo</TableHead>
              <TableHead className="text-gray-900 dark:text-ios-dark-text">Status</TableHead>
              <TableHead className="text-gray-900 dark:text-ios-dark-text">Origem</TableHead>
              <TableHead className="text-gray-900 dark:text-ios-dark-text">Atualizado</TableHead>
              <TableHead className="text-gray-900 dark:text-ios-dark-text">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegions.map((region) => (
              <TableRow key={region.id} className="hover:bg-ios-gray6/20 dark:hover:bg-ios-dark-bg3/20 transition-colors duration-200">
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-ios-gray dark:text-ios-dark-text3" />
                    <span className="text-gray-900 dark:text-ios-dark-text">{region.name}</span>
                    {region.country_code && (
                      <Badge variant="outline" className="text-xs rounded-ios-sm bg-ios-blue/10 text-ios-blue border-ios-blue/20">
                        {region.country_code}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(region.region_type)}</TableCell>
                <TableCell>{getStatusBadge(region.status)}</TableCell>
                <TableCell>{getSourceBadge(region.data_source)}</TableCell>
                <TableCell className="text-sm text-ios-gray dark:text-ios-dark-text3">
                  {new Date(region.updated_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleView(region)}
                      className="w-8 h-8 rounded-ios-sm bg-ios-blue/10 hover:bg-ios-blue/20 text-ios-blue border-none transition-all duration-200 hover:scale-105 active:scale-95"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(region)}
                      className="w-8 h-8 rounded-ios-sm bg-ios-orange/10 hover:bg-ios-orange/20 text-ios-orange border-none transition-all duration-200 hover:scale-105 active:scale-95"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-8 h-8 rounded-ios-sm bg-ios-purple/10 hover:bg-ios-purple/20 text-ios-purple border-none transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={() => handleGenerateWithAI(region)}
                      title="Gerar dados com IA"
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                    {region.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="w-8 h-8 rounded-ios-sm bg-ios-green/10 hover:bg-ios-green/20 text-ios-green border-none transition-all duration-200 hover:scale-105 active:scale-95"
                          onClick={() => handleApprove(region.id)}
                          title="Aprovar"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="w-8 h-8 rounded-ios-sm bg-ios-red/10 hover:bg-ios-red/20 text-ios-red border-none transition-all duration-200 hover:scale-105 active:scale-95"
                          onClick={() => handleReject(region.id)}
                          title="Rejeitar"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🗺️ Mapeamento Global</h2>
          <p className="text-gray-600">Visualize e gerencie regiões espirituais, dados geográficos e informações ministeriais</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowPopulateModal(true)}
          >
            <Zap className="w-4 h-4 mr-2" />
            Expansão Global
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Região
          </Button>
        </div>
      </div>

      {/* Google Maps Status e Dados Existentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GoogleMapsStatusCard />
        <ExistingDataCard />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ios-gray dark:text-ios-dark-text3">Total de Regiões</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-ios-dark-text">{regions.length}</p>
              </div>
              <div className="w-12 h-12 rounded-ios-xl bg-ios-blue/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-ios-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ios-gray dark:text-ios-dark-text3">Aprovadas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-ios-dark-text">{regions.filter(r => r.status === 'approved').length}</p>
              </div>
              <div className="w-12 h-12 rounded-ios-xl bg-ios-green/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-ios-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ios-gray dark:text-ios-dark-text3">Pendentes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-ios-dark-text">{regions.filter(r => r.status === 'pending').length}</p>
              </div>
              <div className="w-12 h-12 rounded-ios-xl bg-ios-orange/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-ios-orange" />
              </div>
            </div>
            <div className="mt-4">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-ios-dark-text">{regions.filter(r => r.data_source === 'ai_generated').length}</p>
                <p className="text-sm text-ios-gray dark:text-ios-dark-text3">Geradas por IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-ios-dark-text">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-ios-gray dark:text-ios-dark-text3" />
                <StaticInput
                  placeholder="Nome da região..."
                  className="pl-9 bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg"
                  defaultValue={searchTerm}
                  onSave={setSearchTerm}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="country">País</SelectItem>
                  <SelectItem value="state">Estado</SelectItem>
                  <SelectItem value="city">Cidade</SelectItem>
                  <SelectItem value="neighborhood">Bairro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sistema de Fila AI */}
      <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-ios-dark-text">
            <Zap className="w-5 h-5 mr-2 text-ios-blue" />
            Sistema de Fila AI
          </CardTitle>
          <CardDescription className="text-ios-gray dark:text-ios-dark-text3">
            Crie filas de processamento para gerar dados espirituais automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">Continente</label>
                <Select defaultValue="Americas">
                  <SelectTrigger className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl">
                    <SelectItem value="Americas">Américas</SelectItem>
                    <SelectItem value="Europe">Europa</SelectItem>
                    <SelectItem value="Asia">Ásia</SelectItem>
                    <SelectItem value="Africa">África</SelectItem>
                    <SelectItem value="Oceania">Oceania</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">Tipos de Região</label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-ios-blue/10 text-ios-blue border-ios-blue/20">
                    Países
                  </Badge>
                  <Badge variant="outline" className="bg-ios-green/10 text-ios-green border-ios-green/20">
                    Estados
                  </Badge>
                  <Badge variant="outline" className="bg-ios-orange/10 text-ios-orange border-ios-orange/20">
                    Cidades
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-ios-blue/10 border-ios-blue/20 rounded-ios-lg">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-ios-blue">~150</p>
                    <p className="text-sm text-ios-blue">Regiões estimadas</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-ios-green/10 border-ios-green/20 rounded-ios-lg">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-ios-green">$4.50</p>
                    <p className="text-sm text-ios-green">Custo estimado</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-ios-orange/10 border-ios-orange/20 rounded-ios-lg">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-ios-orange">~2h</p>
                    <p className="text-sm text-ios-orange">Tempo estimado</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2">
              <Button 
                className="ios-button bg-ios-blue hover:bg-ios-blue/80 text-white rounded-ios-lg"
                disabled
              >
                <Eye className="w-4 h-4 mr-2" />
                Gerar Preview
              </Button>
              <Button 
                className="ios-button bg-ios-green hover:bg-ios-green/80 text-white rounded-ios-lg"
                disabled
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar Processamento
              </Button>
            </div>

            <div className="text-center py-4 bg-ios-gray6/20 dark:bg-ios-dark-bg3/20 rounded-ios-lg">
              <p className="text-sm text-ios-gray dark:text-ios-dark-text3">
                🚧 Sistema em desenvolvimento - Funcionalidade completa em breve
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regions Table */}
      <RegionsTable />

      {/* Modais */}
      <ViewModal />
      <EditModal />
    </div>
  );
};

export default RegionsTab; 