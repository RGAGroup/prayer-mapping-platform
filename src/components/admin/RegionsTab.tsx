import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../ui/button';
import { useTranslation } from '@/hooks/useTranslation';
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
  Square,
  Eye as EyeIcon,
  PlayCircle,
  Users,
  Trash2,
  AlertCircle,
  ChevronDown,
  Folder,
  FolderOpen
} from 'lucide-react';
import { AgentPersona } from '../../types/Agent';
import { queueManagementService, type QueueBuilderConfig, type QueuePreview } from '../../services/queueManagementService';
import { toast } from '@/hooks/use-toast';

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

interface HierarchicalRegion {
  region: SpiritualRegion;
  children: HierarchicalRegion[];
  level: number;
}

interface ExpandedState {
  [key: string]: boolean;
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
  const { t } = useTranslation();
  const memoizedItems = useMemo(() => items, [items]);
  
  return (
    <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-ios-dark-text">
          {icon} {title} ({memoizedItems.length})
          <Button onClick={onAdd} size="sm" className="bg-ios-blue/10 hover:bg-ios-blue/20 text-ios-blue border-ios-blue/20 rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            {t('regionsTab.add')}
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

const RegionsTab = () => {
  const { t } = useTranslation();
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
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queuePreview, setQueuePreview] = useState<QueuePreview | null>(null);
  const [autoReloadInterval, setAutoReloadInterval] = useState<NodeJS.Timeout | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<ExpandedState>({});
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy'>('list');

  // Carregar dados reais do Supabase
  useEffect(() => {
    loadRegionsData();
  }, []);

  // Limpar intervalo quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (autoReloadInterval) {
        clearInterval(autoReloadInterval);
      }
    };
  }, [autoReloadInterval]);

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

      if (error) throw error;

      console.log('✅ Dados carregados:', data.length, 'regiões');
      console.log('📊 Dados espirituais encontrados:', data.filter(r => r.spiritual_data).length);

      setRegions(data || []);
      
      // Calcular dados existentes
      const countries = data?.filter(r => r.region_type === 'country').length || 0;
      const states = data?.filter(r => r.region_type === 'state').length || 0;
      const cities = data?.filter(r => r.region_type === 'city').length || 0;
      
      setExistingData({
        countries,
        states,
        cities,
        total: data?.length || 0
      });
    } catch (error) {
      console.error('❌ Erro ao carregar dados das regiões:', error);
    }
  };

  // Função para iniciar recarregamento automático
  const startAutoReload = useCallback(() => {
    if (autoReloadInterval) {
      clearInterval(autoReloadInterval);
    }
    
    const interval = setInterval(() => {
      console.log('🔄 Recarregamento automático dos dados...');
      loadRegionsData();
    }, 10000); // Recarregar a cada 10 segundos
    
    setAutoReloadInterval(interval);
  }, [autoReloadInterval]);

  // Função para parar recarregamento automático
  const stopAutoReload = useCallback(() => {
    if (autoReloadInterval) {
      clearInterval(autoReloadInterval);
      setAutoReloadInterval(null);
    }
  }, [autoReloadInterval]);

  // Filtrar regiões
  const filteredRegions = useMemo(() => {
    return regions.filter(region => {
      const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || region.status === statusFilter;
      const matchesType = typeFilter === 'all' || region.region_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [regions, searchTerm, statusFilter, typeFilter]);

  // Funções de manipulação
  const handleView = useCallback(async (region: SpiritualRegion) => {
    console.log('👁️ Abrindo visualização para:', region.name);
    console.log('📊 Dados da região (cache):', region);
    console.log('📊 spiritual_data (cache):', region.spiritual_data);
    
    console.log('🔍 Buscando dados frescos do banco...');
    try {
      const { data: freshData, error } = await supabase
        .from('spiritual_regions')
        .select('*')
        .eq('id', region.id)
        .single();

      console.log('🆕 Dados frescos do banco:', freshData);
      console.log('📊 spiritual_data fresco:', freshData?.spiritual_data);
      console.log('📊 spiritual_data tipo:', typeof freshData?.spiritual_data);

      if (freshData?.spiritual_data) {
        console.log('✅ Dados espirituais encontrados!');
        console.log('📄 Conteúdo completo:', freshData.spiritual_data);
      } else {
        console.log('⚠️ Nenhum dado espiritual encontrado');
      }

      setSelectedRegion(freshData || region);
      setShowViewModal(true);
    } catch (error) {
      console.error('❌ Erro ao buscar dados frescos:', error);
      setSelectedRegion(region);
      setShowViewModal(true);
    }
  }, []);

  const handleEdit = useCallback(async (region: SpiritualRegion) => {
    console.log('✏️ Abrindo edição para:', region.name);
    console.log('📊 Dados da região:', region);
    
    console.log('🔍 Buscando dados frescos do banco para edição...');
    try {
      const { data: freshData, error } = await supabase
        .from('spiritual_regions')
        .select('*')
        .eq('id', region.id)
        .single();

      console.log('🆕 Dados frescos do banco para edição:', freshData);
      console.log('📊 spiritual_data fresco para edição:', freshData?.spiritual_data);

      setSelectedRegion(freshData || region);
      if (freshData?.spiritual_data) {
        setSpiritualData(freshData.spiritual_data as SpiritualData);
      }
      setShowEditModal(true);
    } catch (error) {
      console.error('❌ Erro ao buscar dados frescos para edição:', error);
      setSelectedRegion(region);
      setShowEditModal(true);
    }
  }, []);

  const handleGenerateWithAI = useCallback(async (region: SpiritualRegion) => {
    console.log('🤖 Gerando dados com IA para:', region.name);
    
    try {
      if (!selectedPersonaId) {
        alert(t('regionsTab.errors.noPersona'));
        const personas = await advancedAgentService.getPersonas();
        if (personas.length === 0) {
          alert(t('regionsTab.errors.noPersonaFound'));
          return;
        }
        const defaultPersona = personas.find(p => p.is_default) || personas[0];
        setSelectedPersonaId(defaultPersona.id);
        return;
      }
      const persona = personas.find(p => p.id === selectedPersonaId);
      if (!persona) {
        alert(t('regionsTab.errors.personaNotFound'));
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
      alert(t('regionsTab.errors.aiGenerationError'));
    }
  }, [selectedPersonaId, personas, loadRegionsData]);

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
      
      // Atualizar o estado local
      setRegions(prev => prev.map(region => 
        region.id === selectedRegion.id 
          ? { ...region, spiritual_data: spiritualData, updated_at: new Date().toISOString() }
          : region
      ));
      
      setShowEditModal(false);
      
    } catch (error) {
      console.error('❌ Erro ao salvar dados espirituais:', error);
      alert(t('regionsTab.errors.saveError'));
    } finally {
      setIsUpdatingSpiritualData(false);
    }
  }, [selectedRegion, spiritualData]);

  const handleApprove = useCallback(async (regionId: string) => {
    try {
      const { error } = await supabase
        .from('spiritual_regions')
        .update({ status: 'approved' })
        .eq('id', regionId);
      
      if (error) throw error;
      
      // Atualizar estado local
      setRegions(prev => prev.map(region => 
        region.id === regionId ? { ...region, status: 'approved' } : region
      ));
      
      console.log('✅ Região aprovada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao aprovar região:', error);
    }
  }, []);

  const handleReject = useCallback(async (regionId: string) => {
    try {
      const { error } = await supabase
        .from('spiritual_regions')
        .update({ status: 'rejected' })
        .eq('id', regionId);
      
      if (error) throw error;
      
      // Atualizar estado local
      setRegions(prev => prev.map(region => 
        region.id === regionId ? { ...region, status: 'rejected' } : region
      ));
      
      console.log('✅ Região rejeitada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao rejeitar região:', error);
    }
  }, []);

  // Funções de fila AI
  const handlePreviewQueue = useCallback(async () => {
    if (!selectedPersonaId) {
      toast({
        title: t('regionsTab.toast.error'),
        description: t('regionsTab.toast.noPersonaSelected'),
        variant: "destructive"
      });
      return;
    }
    setIsPreviewing(true);
    try {
      const config: QueueBuilderConfig = {
        continent: 'Americas',
        regionTypes: ['country', 'state', 'city'],
        filters: {
          onlyChristianMajority: false,
          populationMin: 100000,
          crisisRegions: false,
          strategicImportance: true
        },
        estimatedCostPerRegion: 0.03,
        customPrompt: `Use persona: ${selectedPersonaId}`
      };
      const preview = await queueManagementService.buildQueuePreview(config);
      setQueuePreview(preview);
      toast({
        title: t('regionsTab.toast.success'),
        description: `${t('regionsTab.toast.previewSuccess')} ${preview.summary.totalRegions}`
      });
    } catch (error) {
      console.error('❌ Erro ao gerar preview da fila:', error);
      toast({
        title: t('regionsTab.toast.error'),
        description: t('regionsTab.toast.previewError'),
        variant: "destructive"
      });
    } finally {
      setIsPreviewing(false);
    }
  }, [selectedPersonaId]);

  const handleStartProcessing = useCallback(async () => {
    if (!selectedPersonaId) {
      toast({
        title: t('regionsTab.toast.error'),
        description: t('regionsTab.toast.noPersonaSelected'),
        variant: "destructive"
      });
      return;
    }
    if (!queuePreview) {
      toast({
        title: t('regionsTab.toast.error'),
        description: t('regionsTab.toast.noPreview'),
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    startAutoReload(); // Iniciar recarregamento automático
    try {
      const config: QueueBuilderConfig = {
        continent: 'Americas',
        regionTypes: ['country', 'state', 'city'],
        filters: {
          onlyChristianMajority: false,
          populationMin: 100000,
          crisisRegions: false,
          strategicImportance: true
        },
        estimatedCostPerRegion: 0.03,
        customPrompt: `Use persona: ${selectedPersonaId}`
      };
      const batchId = await queueManagementService.createProcessingBatch(
        'Processamento AI - Regiões',
        'Geração automática de dados espirituais',
        config,
        queuePreview
      );
      await queueManagementService.startBatchProcessing(batchId);
      toast({
        title: t('regionsTab.toast.success'),
        description: t('regionsTab.toast.processingStarted')
      });

      // Aguardar um pouco e depois parar o recarregamento automático
      setTimeout(() => {
        stopAutoReload();
        loadRegionsData(); // Recarregar uma última vez
      }, 180000); // 3 minutos

    } catch (error) {
      console.error('❌ Erro ao iniciar processamento da fila:', error);
      stopAutoReload(); // Parar recarregamento em caso de erro
      toast({
        title: t('regionsTab.toast.error'),
        description: t('regionsTab.toast.processingError'),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPersonaId, queuePreview, startAutoReload, stopAutoReload, loadRegionsData]);

  // Componentes auxiliares
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'draft': { color: 'bg-ios-gray/10 text-ios-gray border-ios-gray/20', label: t('regionsTab.status.draft') },
      'pending': { color: 'bg-ios-orange/10 text-ios-orange border-ios-orange/20', label: t('regionsTab.status.pending') },
      'approved': { color: 'bg-ios-green/10 text-ios-green border-ios-green/20', label: t('regionsTab.status.approved') },
      'rejected': { color: 'bg-ios-red/10 text-ios-red border-ios-red/20', label: t('regionsTab.status.rejected') }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.draft;

    return (
      <Badge className={`${statusInfo.color} rounded-ios-sm`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      'country': { color: 'bg-ios-blue/10 text-ios-blue border-ios-blue/20', label: t('regionsTab.type.country') },
      'state': { color: 'bg-ios-green/10 text-ios-green border-ios-green/20', label: t('regionsTab.type.state') },
      'city': { color: 'bg-ios-purple/10 text-ios-purple border-ios-purple/20', label: t('regionsTab.type.city') },
      'neighborhood': { color: 'bg-ios-orange/10 text-ios-orange border-ios-orange/20', label: t('regionsTab.type.neighborhood') }
    };

    const typeInfo = typeMap[type as keyof typeof typeMap] || typeMap.country;

    return (
      <Badge className={`${typeInfo.color} rounded-ios-sm`}>
        {typeInfo.label}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const sourceMap = {
      'manual': { color: 'bg-ios-blue/10 text-ios-blue border-ios-blue/20', label: t('regionsTab.source.manual') },
      'imported': { color: 'bg-ios-green/10 text-ios-green border-ios-green/20', label: t('regionsTab.source.imported') },
      'ai_generated': { color: 'bg-ios-purple/10 text-ios-purple border-ios-purple/20', label: t('regionsTab.source.ai_generated') }
    };

    const sourceInfo = sourceMap[source as keyof typeof sourceMap] || sourceMap.manual;

    return (
      <Badge className={`${sourceInfo.color} rounded-ios-sm`}>
        {sourceInfo.label}
      </Badge>
    );
  };

  // Componentes de Cards
  const GoogleMapsStatusCard = () => (
    <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-ios-dark-text">
          <MapPin className="w-4 h-4 mr-2" />
          {t('regionsTab.googleMaps.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-ios-gray dark:text-ios-dark-text3">{t('regionsTab.googleMaps.api')}</span>
            <Badge className="bg-ios-green/10 text-ios-green border-ios-green/20 rounded-ios-sm">
              {t('regionsTab.googleMaps.loaded')}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-ios-gray dark:text-ios-dark-text3">{t('regionsTab.googleMaps.geocoder')}</span>
            <Badge className="bg-ios-green/10 text-ios-green border-ios-green/20 rounded-ios-sm">
              {t('regionsTab.googleMaps.ready')}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-ios-gray dark:text-ios-dark-text3">{t('regionsTab.googleMaps.status')}</span>
            <Badge className="bg-ios-blue/10 text-ios-blue border-ios-blue/20 rounded-ios-sm">
              {t('regionsTab.googleMaps.operational')}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ExistingDataCard = () => (
    <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-ios-dark-text">
          <Database className="w-4 h-4 mr-2" />
          {t('regionsTab.existingData.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-ios-gray dark:text-ios-dark-text3">{t('regionsTab.existingData.countries')}</span>
            <Badge className="bg-ios-blue/10 text-ios-blue border-ios-blue/20 rounded-ios-sm">
              {existingData.countries}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-ios-gray dark:text-ios-dark-text3">{t('regionsTab.existingData.states')}</span>
            <Badge className="bg-ios-green/10 text-ios-green border-ios-green/20 rounded-ios-sm">
              {existingData.states}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-ios-gray dark:text-ios-dark-text3">{t('regionsTab.existingData.cities')}</span>
            <Badge className="bg-ios-purple/10 text-ios-purple border-ios-purple/20 rounded-ios-sm">
              {existingData.cities}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-ios-gray dark:text-ios-dark-text3">{t('regionsTab.existingData.total')}</span>
            <Badge className="bg-ios-orange/10 text-ios-orange border-ios-orange/20 rounded-ios-sm">
              {existingData.total}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Função para organizar regiões hierarquicamente (versão robusta)
  const organizeRegionsHierarchically = useMemo(() => {
    console.log('🔍 Organizando regiões hierarquicamente...', filteredRegions.length, 'regiões');
    
    // Primeiro, vamos ver que tipos de regiões temos
    const regionTypes = [...new Set(filteredRegions.map(r => r.region_type))];
    console.log('📊 Tipos de regiões encontrados:', regionTypes);
    
    // Agrupar por tipo para debug
    const byType = regionTypes.reduce((acc, type) => {
      acc[type] = filteredRegions.filter(r => r.region_type === type).length;
      return acc;
    }, {} as Record<string, number>);
    console.log('📈 Contagem por tipo:', byType);

    const buildHierarchy = (): HierarchicalRegion[] => {
      // Se não temos continentes, vamos começar pelos países
      const hasContinents = filteredRegions.some(r => r.region_type === 'continent');
      
      if (!hasContinents) {
        console.log('⚠️ Sem continentes, começando pelos países...');
        
        // Agrupar países
        const countries = filteredRegions.filter(r => r.region_type === 'country');
        console.log('🌍 Países encontrados:', countries.length);
        
        return countries.map(country => ({
          region: country,
          level: 0,
          children: buildCountryChildren(country)
        }));
      }
      
      // Com continentes
      const continents = filteredRegions.filter(r => r.region_type === 'continent');
      console.log('🌍 Continentes encontrados:', continents.length);
      
      return continents.map(continent => ({
        region: continent,
        level: 0,
        children: buildContinentChildren(continent)
      }));
    };

    const buildContinentChildren = (continent: SpiritualRegion): HierarchicalRegion[] => {
      // Por enquanto, vamos relacionar países por proximidade ou todos
      const countries = filteredRegions.filter(r => r.region_type === 'country');
      return countries.map(country => ({
        region: country,
        level: 1,
        children: buildCountryChildren(country)
      }));
    };

    const buildCountryChildren = (country: SpiritualRegion): HierarchicalRegion[] => {
      const states = filteredRegions.filter(r => 
        r.region_type === 'state' && 
        (r.country_code === country.country_code || r.parent_id === country.id)
      );
      
      return states.map(state => ({
        region: state,
        level: 2,
        children: buildStateChildren(state)
      }));
    };

    const buildStateChildren = (state: SpiritualRegion): HierarchicalRegion[] => {
      const cities = filteredRegions.filter(r => 
        r.region_type === 'city' && r.parent_id === state.id
      );
      
      return cities.map(city => ({
        region: city,
        level: 3,
        children: []
      }));
    };

    const result = buildHierarchy();
    console.log('✅ Hierarquia construída:', result.length, 'itens no nível raiz');
    return result;
  }, [filteredRegions]);

  // Função para alternar expansão de nós
  const toggleNode = (regionId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [regionId]: !prev[regionId]
    }));
  };

  // Componente para renderizar item hierárquico
  const HierarchicalItem: React.FC<{ 
    item: HierarchicalRegion; 
    isLast?: boolean;
  }> = ({ item, isLast = false }) => {
    const { region, children, level } = item;
    const isExpanded = expandedNodes[region.id];
    const hasChildren = children.length > 0;
    const indent = level * 24;

    const getIcon = () => {
      switch (region.region_type) {
        case 'continent': return '🌍';
        case 'country': return '🇧🇷';
        case 'state': return '📍';
        case 'city': return '🏙️';
        default: return '📌';
      }
    };

    return (
      <div>
        <div 
          className="flex items-center py-2 px-3 hover:bg-ios-gray6/20 dark:hover:bg-ios-dark-bg3/20 transition-colors duration-200 rounded-ios-sm cursor-pointer"
          style={{ paddingLeft: `${indent + 12}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleNode(region.id)}
              className="w-6 h-6 p-0 mr-2 hover:bg-ios-blue/10"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-ios-blue" />
              ) : (
                <ChevronRight className="w-4 h-4 text-ios-blue" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-6 h-6 mr-2" />}
          
          <span className="mr-2 text-lg">{getIcon()}</span>
          
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-ios-dark-text">
                {region.name}
              </span>
              {region.country_code && (
                <Badge variant="outline" className="text-xs rounded-ios-sm bg-ios-blue/10 text-ios-blue border-ios-blue/20">
                  {region.country_code}
                </Badge>
              )}
              {getTypeBadge(region.region_type)}
              {getStatusBadge(region.status)}
            </div>
            
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(region);
                }}
                className="w-7 h-7 rounded-ios-sm bg-ios-blue/10 hover:bg-ios-blue/20 text-ios-blue border-none"
                title="Visualizar"
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(region);
                }}
                className="w-7 h-7 rounded-ios-sm bg-ios-orange/10 hover:bg-ios-orange/20 text-ios-orange border-none"
                title="Editar"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="w-7 h-7 rounded-ios-sm bg-ios-purple/10 hover:bg-ios-purple/20 text-ios-purple border-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateWithAI(region);
                }}
                title="Gerar dados com IA"
              >
                <Zap className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {children.map((child, index) => (
              <HierarchicalItem 
                key={child.region.id} 
                item={child} 
                isLast={index === children.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Componente de visualização hierárquica
  const HierarchicalView = () => (
    <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900 dark:text-ios-dark-text">
              {t('regionsTab.table.title')} ({filteredRegions.length})
            </CardTitle>
            <CardDescription className="text-ios-gray dark:text-ios-dark-text3">
              {t('regionsTab.table.hierarchyDescription')}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`rounded-ios-sm transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-ios-blue text-white border-ios-blue'
                  : 'text-ios-blue border-ios-blue/20 hover:bg-ios-blue/10'
              }`}
            >
              <List className="w-4 h-4 mr-1" />
              {t('regionsTab.table.viewList')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('hierarchy')}
              className={`rounded-ios-sm transition-all duration-200 ${
                viewMode === 'hierarchy'
                  ? 'bg-ios-blue text-white border-ios-blue'
                  : 'text-ios-blue border-ios-blue/20 hover:bg-ios-blue/10'
              }`}
            >
              <Folder className="w-4 h-4 mr-1" />
              {t('regionsTab.table.viewHierarchy')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          {organizeRegionsHierarchically.length > 0 ? (
            organizeRegionsHierarchically.map((item) => (
              <HierarchicalItem key={item.region.id} item={item} />
            ))
          ) : (
            <div className="text-center py-8 text-ios-gray dark:text-ios-dark-text3">
              <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t('regionsTab.table.noRegions')}</p>
              <p className="text-xs mt-1">
                {t('regionsTab.table.totalRegions')} {filteredRegions.length}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => console.log('Dados filtrados:', filteredRegions.slice(0, 5))}
              >
                {t('regionsTab.table.debugConsole')}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Regions Table
  const RegionsTable = () => (
    <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900 dark:text-ios-dark-text">
              {t('regionsTab.table.title')} ({filteredRegions.length})
            </CardTitle>
            <CardDescription className="text-ios-gray dark:text-ios-dark-text3">
              {t('regionsTab.table.description')}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`rounded-ios-sm transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-ios-blue text-white border-ios-blue'
                  : 'text-ios-blue border-ios-blue/20 hover:bg-ios-blue/10'
              }`}
            >
              <List className="w-4 h-4 mr-1" />
              {t('regionsTab.table.viewList')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('hierarchy')}
              className={`rounded-ios-sm transition-all duration-200 ${
                viewMode === 'hierarchy'
                  ? 'bg-ios-blue text-white border-ios-blue'
                  : 'text-ios-blue border-ios-blue/20 hover:bg-ios-blue/10'
              }`}
            >
              <Folder className="w-4 h-4 mr-1" />
              {t('regionsTab.table.viewHierarchy')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-900 dark:text-ios-dark-text">{t('regionsTab.table.name')}</TableHead>
              <TableHead className="text-gray-900 dark:text-ios-dark-text">{t('regionsTab.table.type')}</TableHead>
              <TableHead className="text-gray-900 dark:text-ios-dark-text">{t('regionsTab.table.status')}</TableHead>
              <TableHead className="text-gray-900 dark:text-ios-dark-text">{t('regionsTab.table.source')}</TableHead>
              <TableHead className="text-gray-900 dark:text-ios-dark-text">{t('regionsTab.table.updated')}</TableHead>
              <TableHead className="text-gray-900 dark:text-ios-dark-text">{t('regionsTab.table.actions')}</TableHead>
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
                      title={t('regionsTab.view')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(region)}
                      className="w-8 h-8 rounded-ios-sm bg-ios-orange/10 hover:bg-ios-orange/20 text-ios-orange border-none transition-all duration-200 hover:scale-105 active:scale-95"
                      title={t('regionsTab.edit')}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 rounded-ios-sm bg-ios-purple/10 hover:bg-ios-purple/20 text-ios-purple border-none transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={() => handleGenerateWithAI(region)}
                      title={t('regionsTab.generateAI')}
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

  // Modal de Visualização
  const ViewModal = () => {
    console.log('👁️ ViewModal - Região selecionada:', selectedRegion);
    console.log('📊 Dados espirituais:', selectedRegion?.spiritual_data);
    console.log('📊 Tipo dos dados:', typeof selectedRegion?.spiritual_data);

    const handleClose = () => {
      setShowViewModal(false);
      setSelectedRegion(null);
    };

    const handleEditFromView = (region: SpiritualRegion) => {
      setSelectedRegion(region);
      if (region.spiritual_data) {
        setSpiritualData(region.spiritual_data as SpiritualData);
      }
      setShowViewModal(false);
      setShowEditModal(true);
    };

    const formatSpiritualData = (data: any) => {
      if (!data) return null;
      
      console.log('🔍 Formatando dados espirituais:', data);
      console.log('📊 Tipo dos dados:', typeof data);
      
      const sections = [];
      
      // Sistema Geopolítico
      if (data.sistema_geopolitico_completo) {
        sections.push(
          <div key="sistema" className="mb-4">
            <h4 className="font-bold text-ios-blue mb-2">{t('regionsTab.spiritualData.geopoliticalSystem')}</h4>
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
            <h4 className="font-bold text-ios-red mb-2">{t('regionsTab.spiritualData.intercessionTargets')}</h4>
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
            <h4 className="font-bold text-ios-purple mb-2">{t('regionsTab.spiritualData.otherInfo')}</h4>
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
            <h4 className="font-bold text-ios-gray mb-2">{t('regionsTab.spiritualData.title')}</h4>
            <div className="bg-ios-gray6/20 dark:bg-ios-dark-bg3/20 border border-ios-gray5/20 dark:border-ios-dark-bg4/20 p-3 rounded-ios-lg backdrop-blur-ios">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-ios-dark-text">{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        );
      }
      
      return <div>{sections}</div>;
    };

    if (!showViewModal || !selectedRegion) return null;

    return (
      <Dialog open={showViewModal} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-2xl shadow-ios-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-ios-dark-text">
              {t('regionsTab.viewModal.title')} {selectedRegion.name}
            </DialogTitle>
            <DialogDescription className="text-ios-gray dark:text-ios-dark-text3">
              {t('regionsTab.viewModal.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {selectedRegion.spiritual_data && (typeof selectedRegion.spiritual_data === 'string' ? selectedRegion.spiritual_data.trim() : Object.keys(selectedRegion.spiritual_data).length > 0) ? (
              <div className="mt-2">
                {formatSpiritualData(selectedRegion.spiritual_data)}
              </div>
            ) : (
              <div className="text-center py-8 text-ios-gray dark:text-ios-dark-text3">
                <p className="text-lg">{t('regionsTab.viewModal.noData')}</p>
                <p className="text-sm mt-2">{t('regionsTab.viewModal.noDataHint')}</p>
                <Button
                  className="mt-4 bg-ios-blue hover:bg-ios-blue/80 text-white border-none rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  onClick={() => {
                    handleClose();
                    handleEditFromView(selectedRegion);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t('regionsTab.viewModal.addData')}
                </Button>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleClose}
                className="bg-ios-gray6/50 hover:bg-ios-gray6 text-ios-gray dark:bg-ios-dark-bg3/50 dark:hover:bg-ios-dark-bg3 dark:text-ios-dark-text2 border border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {t('regionsTab.close')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Modal de Edição
  const EditModal = () => {
    console.log('✏️ EditModal - Região selecionada:', selectedRegion);
    console.log('📊 Dados espirituais atual:', spiritualData);

    const handleClose = () => {
      setShowEditModal(false);
      setSelectedRegion(null);
      setSpiritualData(null);
    };

    if (!showEditModal || !selectedRegion) return null;

    return (
      <Dialog open={showEditModal} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-2xl shadow-ios-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-ios-dark-text">
              {t('regionsTab.editModal.title')} {selectedRegion.name}
            </DialogTitle>
            <DialogDescription className="text-ios-gray dark:text-ios-dark-text3">
              {t('regionsTab.editModal.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {spiritualData ? (
              <Tabs defaultValue="spiritual" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="spiritual">{t('regionsTab.editModal.tabSpiritual')}</TabsTrigger>
                  <TabsTrigger value="basic">{t('regionsTab.editModal.tabBasic')}</TabsTrigger>
                </TabsList>

                <TabsContent value="spiritual" className="space-y-4">
                  {/* Sistema Geopolítico Completo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-2">
                      {t('regionsTab.editModal.geopoliticalSystem')}
                    </label>
                    <Textarea
                      value={spiritualData.sistema_geopolitico_completo || ''}
                      onChange={(e) => setSpiritualData(prev => prev ? {...prev, sistema_geopolitico_completo: e.target.value} : null)}
                      className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg min-h-32"
                      placeholder={t('regionsTab.editModal.geopoliticalPlaceholder')}
                    />
                  </div>

                  {/* Alvos de Intercessão Completo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-2">
                      {t('regionsTab.editModal.intercessionTargets')}
                    </label>
                    <Textarea
                      value={spiritualData.alvos_intercessao_completo || ''}
                      onChange={(e) => setSpiritualData(prev => prev ? {...prev, alvos_intercessao_completo: e.target.value} : null)}
                      className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg min-h-32"
                      placeholder={t('regionsTab.editModal.intercessionPlaceholder')}
                    />
                  </div>

                  {/* Outras Informações Importantes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-2">
                      {t('regionsTab.editModal.otherInfo')}
                    </label>
                    <Textarea
                      value={spiritualData.outras_informacoes_importantes || ''}
                      onChange={(e) => setSpiritualData(prev => prev ? {...prev, outras_informacoes_importantes: e.target.value} : null)}
                      className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg min-h-32"
                      placeholder={t('regionsTab.editModal.otherInfoPlaceholder')}
                    />
                  </div>

                  {/* Estrutura Antiga (se existir) */}
                  {(spiritualData.nome_local || spiritualData.palavra_profetica || spiritualData.alvos_intercessao || spiritualData.alertas_espirituais) && (
                    <div className="border-t pt-4 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-ios-dark-text mb-4">
                        {t('regionsTab.editModal.legacyData')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {spiritualData.nome_local && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-ios-dark-text mb-1">
                              {t('regionsTab.editModal.localName')}
                            </label>
                            <Input
                              value={spiritualData.nome_local}
                              onChange={(e) => setSpiritualData(prev => prev ? {...prev, nome_local: e.target.value} : null)}
                              className="bg-ios-gray6/20 dark:bg-ios-dark-bg3/20 border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-md text-sm"
                            />
                          </div>
                        )}
                        {spiritualData.palavra_profetica && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-ios-dark-text mb-1">
                              {t('regionsTab.editModal.propheticWord')}
                            </label>
                            <Textarea
                              value={spiritualData.palavra_profetica}
                              onChange={(e) => setSpiritualData(prev => prev ? {...prev, palavra_profetica: e.target.value} : null)}
                              className="bg-ios-gray6/20 dark:bg-ios-dark-bg3/20 border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-md text-sm min-h-20"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-2">
                        {t('regionsTab.editModal.regionName')}
                      </label>
                      <Input
                        value={selectedRegion.name}
                        readOnly
                        className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-ios-dark-text mb-2">
                        {t('regionsTab.editModal.regionType')}
                      </label>
                      <Input
                        value={selectedRegion.region_type}
                        readOnly
                        className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-ios-gray dark:text-ios-dark-text3">
                <p className="text-lg">{t('regionsTab.editModal.noData')}</p>
                <p className="text-sm mt-2">{t('regionsTab.editModal.noDataHint')}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={handleClose}
                className="bg-ios-gray6/50 hover:bg-ios-gray6 text-ios-gray dark:bg-ios-dark-bg3/50 dark:hover:bg-ios-dark-bg3 dark:text-ios-dark-text2 border border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {t('regionsTab.cancel')}
              </Button>
              <Button
                onClick={handleSaveSpiritualData}
                disabled={isUpdatingSpiritualData}
                className="bg-ios-blue hover:bg-ios-blue/80 text-white border-none rounded-ios-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {isUpdatingSpiritualData ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {t('regionsTab.saving')}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t('regionsTab.save')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/70 dark:bg-ios-dark-bg2/70 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl shadow-ios-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ios-gray dark:text-ios-dark-text3">{t('regionsTab.stats.totalRegions')}</p>
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
                <p className="text-sm font-medium text-ios-gray dark:text-ios-dark-text3">{t('regionsTab.stats.approved')}</p>
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
                <p className="text-sm font-medium text-ios-gray dark:text-ios-dark-text3">{t('regionsTab.stats.pending')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-ios-dark-text">{regions.filter(r => r.status === 'pending').length}</p>
              </div>
              <div className="w-12 h-12 rounded-ios-xl bg-ios-orange/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-ios-orange" />
              </div>
            </div>
            <div className="mt-4">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-ios-dark-text">{regions.filter(r => r.data_source === 'ai_generated').length}</p>
                <p className="text-sm text-ios-gray dark:text-ios-dark-text3">{t('regionsTab.stats.aiGenerated')}</p>
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
            {t('regionsTab.filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">{t('regionsTab.filters.search')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-ios-gray dark:text-ios-dark-text3" />
                <StaticInput
                  placeholder={t('regionsTab.filters.searchPlaceholder')}
                  className="pl-9 bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg"
                  defaultValue={searchTerm}
                  onSave={setSearchTerm}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">{t('regionsTab.filters.status')}</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg">
                  <SelectValue placeholder={t('regionsTab.filters.allStatus')} />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl">
                  <SelectItem value="all">{t('regionsTab.filters.all')}</SelectItem>
                  <SelectItem value="draft">{t('regionsTab.status.draft')}</SelectItem>
                  <SelectItem value="pending">{t('regionsTab.status.pending')}</SelectItem>
                  <SelectItem value="approved">{t('regionsTab.status.approved')}</SelectItem>
                  <SelectItem value="rejected">{t('regionsTab.status.rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">{t('regionsTab.filters.type')}</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg">
                  <SelectValue placeholder={t('regionsTab.filters.allTypes')} />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl">
                  <SelectItem value="all">{t('regionsTab.filters.all')}</SelectItem>
                  <SelectItem value="country">{t('regionsTab.type.country')}</SelectItem>
                  <SelectItem value="state">{t('regionsTab.type.state')}</SelectItem>
                  <SelectItem value="city">{t('regionsTab.type.city')}</SelectItem>
                  <SelectItem value="neighborhood">{t('regionsTab.type.neighborhood')}</SelectItem>
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
            {t('regionsTab.queueSystem.title')}
          </CardTitle>
          <CardDescription className="text-ios-gray dark:text-ios-dark-text3">
            {t('regionsTab.queueSystem.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">{t('regionsTab.queueSystem.continent')}</label>
                <Select defaultValue="Americas">
                  <SelectTrigger className="bg-ios-gray6/30 dark:bg-ios-dark-bg3/30 border-ios-gray5/30 dark:border-ios-dark-bg4/30 rounded-ios-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-ios-dark-bg2/95 backdrop-blur-ios border-ios-gray5/20 dark:border-ios-dark-bg4/20 rounded-ios-xl">
                    <SelectItem value="Americas">{t('regionsTab.queueSystem.continents.americas')}</SelectItem>
                    <SelectItem value="Europe">{t('regionsTab.queueSystem.continents.europe')}</SelectItem>
                    <SelectItem value="Asia">{t('regionsTab.queueSystem.continents.asia')}</SelectItem>
                    <SelectItem value="Africa">{t('regionsTab.queueSystem.continents.africa')}</SelectItem>
                    <SelectItem value="Oceania">{t('regionsTab.queueSystem.continents.oceania')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-ios-dark-text">{t('regionsTab.queueSystem.regionTypes')}</label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-ios-blue/10 text-ios-blue border-ios-blue/20">
                    {t('regionsTab.queueSystem.types.countries')}
                  </Badge>
                  <Badge variant="outline" className="bg-ios-green/10 text-ios-green border-ios-green/20">
                    {t('regionsTab.queueSystem.types.states')}
                  </Badge>
                  <Badge variant="outline" className="bg-ios-orange/10 text-ios-orange border-ios-orange/20">
                    {t('regionsTab.queueSystem.types.cities')}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-ios-blue/10 border-ios-blue/20 rounded-ios-lg">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-ios-blue">~150</p>
                    <p className="text-sm text-ios-blue">{t('regionsTab.queueSystem.estimates.regions')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-ios-green/10 border-ios-green/20 rounded-ios-lg">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-ios-green">$4.50</p>
                    <p className="text-sm text-ios-green">{t('regionsTab.queueSystem.estimates.cost')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-ios-orange/10 border-ios-orange/20 rounded-ios-lg">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-ios-orange">~2h</p>
                    <p className="text-sm text-ios-orange">{t('regionsTab.queueSystem.estimates.time')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2">
              <Button
                className="ios-button bg-ios-blue hover:bg-ios-blue/80 text-white rounded-ios-lg"
                disabled={isPreviewing}
                onClick={handlePreviewQueue}
              >
                {isPreviewing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {t('regionsTab.queueSystem.previewing')}
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    {t('regionsTab.queueSystem.preview')}
                  </>
                )}
              </Button>
              <Button
                className="ios-button bg-ios-green hover:bg-ios-green/80 text-white rounded-ios-lg"
                disabled={isProcessing}
                onClick={handleStartProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {t('regionsTab.queueSystem.processing')}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    {t('regionsTab.queueSystem.startProcessing')}
                  </>
                )}
              </Button>
              <Button
                className="ios-button bg-ios-gray hover:bg-ios-gray/80 text-white rounded-ios-lg"
                onClick={loadRegionsData}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('regionsTab.queueSystem.reload')}
              </Button>
            </div>

            <div className="text-center py-4 bg-ios-gray6/20 dark:bg-ios-dark-bg3/20 rounded-ios-lg">
              <p className="text-sm text-ios-gray dark:text-ios-dark-text3">
                {t('regionsTab.queueSystem.inDevelopment')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regions View - Lista ou Hierárquica */}
      {viewMode === 'hierarchy' ? <HierarchicalView /> : <RegionsTable />}

      {/* Modais */}
      <ViewModal />
      <EditModal />
    </div>
  );
};

export default RegionsTab;
