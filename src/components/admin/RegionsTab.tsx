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
  Play
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {icon} {title} ({memoizedItems.length})
          <Button onClick={onAdd} size="sm">
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
            />
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onRemove(index)}
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
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Rascunho' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Aprovado' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejeitado' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      country: { color: 'bg-blue-100 text-blue-800', label: 'País' },
      state: { color: 'bg-purple-100 text-purple-800', label: 'Estado' },
      city: { color: 'bg-orange-100 text-orange-800', label: 'Cidade' },
      neighborhood: { color: 'bg-pink-100 text-pink-800', label: 'Bairro' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const sourceConfig = {
      manual: { color: 'bg-green-50 text-green-700', label: 'Manual' },
      ai_generated: { color: 'bg-blue-50 text-blue-700', label: 'IA' },
      imported: { color: 'bg-orange-50 text-orange-700', label: 'Importado' }
    };
    
    const config = sourceConfig[source as keyof typeof sourceConfig];
    return (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    );
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="text-lg">🗺️</span>
            Google Maps Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">API:</span>
            <Badge variant={status.loaded ? "secondary" : "destructive"}>
              {status.loaded ? '✅ Carregado' : '⏳ Carregando'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Geocoder:</span>
            <Badge variant={status.geocoderReady ? "secondary" : "destructive"}>
              {status.geocoderReady ? '✅ Pronto' : '⏳ Aguardando'}
            </Badge>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-center font-medium">
            <span className="text-sm">Status:</span>
            <Badge variant={isGoogleMapsReady ? "default" : "destructive"}>
              {isGoogleMapsReady ? '🎉 Operacional' : '⚠️ Aguardando'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Existing Data Card
  const ExistingDataCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="w-4 h-4" />
          Dados Existentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">🇧🇷 Países:</span>
          <Badge variant={existingData.countries > 0 ? "secondary" : "outline"}>
            {existingData.countries}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">🏛️ Estados:</span>
          <Badge variant={existingData.states > 0 ? "secondary" : "outline"}>
            {existingData.states}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">🏙️ Cidades:</span>
          <Badge variant={existingData.cities > 0 ? "secondary" : "outline"}>
            {existingData.cities}
          </Badge>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between items-center font-medium">
          <span className="text-sm">📊 Total:</span>
          <Badge variant={existingData.total > 0 ? "default" : "outline"}>
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              🌍 Dados Espirituais: {regionData.region.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            
            {/* Sistema Geopolítico */}
            <div>
              <label className="text-lg font-semibold mb-3 block">🏛️ Sistema Geopolítico</label>
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
                className="text-sm"
                data-field="sistema_geopolitico_completo"
              />
            </div>

            {/* Alvos de Intercessão */}
            <div>
              <label className="text-lg font-semibold mb-3 block">🔥 Alvos de Intercessão</label>
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
                className="text-sm"
                data-field="alvos_intercessao_completo"
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
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
              <h4 className="font-bold text-blue-600 mb-2">🏛️ Sistema Geopolítico:</h4>
              <div className="bg-blue-50 p-3 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{data.sistema_geopolitico_completo}</pre>
              </div>
            </div>
          );
        }
        
        // Alvos de Intercessão
        if (data.alvos_intercessao_completo) {
          sections.push(
            <div key="alvos" className="mb-4">
              <h4 className="font-bold text-red-600 mb-2">🔥 Alvos de Intercessão:</h4>
              <div className="bg-red-50 p-3 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{data.alvos_intercessao_completo}</pre>
              </div>
            </div>
          );
        }
        
        // Outras Informações Importantes
        if (data.outras_informacoes_importantes) {
          sections.push(
            <div key="outras" className="mb-4">
              <h4 className="font-bold text-purple-600 mb-2">📋 Outras Informações Importantes:</h4>
              <div className="bg-purple-50 p-3 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{data.outras_informacoes_importantes}</pre>
              </div>
            </div>
          );
        }
        
        // Se não encontrou os campos específicos, mostrar dados brutos
        if (sections.length === 0) {
          sections.push(
            <div key="raw" className="mb-4">
              <h4 className="font-bold text-gray-600 mb-2">📊 Dados Espirituais:</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(data, null, 2)}</pre>
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
        <pre className="whitespace-pre-wrap text-sm leading-relaxed" style={{background: 'none', padding: 0, margin: 0}}>
          {lines.map((line, idx) => {
            if (/^\s*[^:]+:\s*$/.test(line)) {
              // Título
              return <span key={idx} style={{fontWeight: 'bold', color: '#2563eb'}}>{line}\n</span>;
            }
            return <span key={idx}>{line}\n</span>;
          })}
        </pre>
      );
    }

    if (!isOpen || !viewData) return null;

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              👁️ Visualizar: {viewData.region.name}
            </DialogTitle>
            <DialogDescription>
              Dados espirituais salvos para esta região
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {spiritual && (typeof spiritual === 'string' ? spiritual.trim() : Object.keys(spiritual).length > 0) ? (
              <div className="mt-2">
                {formatSpiritualData(spiritual)}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">📝 Nenhum dado espiritual cadastrado ainda</p>
                <p className="text-sm mt-2">Clique em "Editar" para adicionar informações</p>
                <Button 
                  className="mt-4" 
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
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  });

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{regions.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{regions.filter(r => r.status === 'approved').length}</p>
                <p className="text-xs text-muted-foreground">Aprovadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{regions.filter(r => r.status === 'pending').length}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{regions.filter(r => r.data_source === 'ai_generated').length}</p>
                <p className="text-xs text-muted-foreground">Geradas por IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <StaticInput
                  placeholder="Nome da região..."
                  className="pl-9"
                  defaultValue={searchTerm}
                  onSave={setSearchTerm}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
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

      {/* Regions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regiões Mapeadas ({filteredRegions.length})</CardTitle>
          <CardDescription>
            Lista de todas as regiões geográficas e espirituais cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegions.map((region) => (
                <TableRow key={region.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{region.name}</span>
                      {region.country_code && (
                        <Badge variant="outline" className="text-xs">
                          {region.country_code}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(region.region_type)}</TableCell>
                  <TableCell>{getStatusBadge(region.status)}</TableCell>
                  <TableCell>{getSourceBadge(region.data_source)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(region.updated_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(region)}>
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(region)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Escolha a Persona IA:</label>
                        <select
                          className="w-full border rounded px-3 py-2"
                          value={selectedPersonaId || ''}
                          onChange={e => setSelectedPersonaId(e.target.value)}
                        >
                          {personas.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.is_default ? '(Padrão)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-purple-600 hover:text-purple-700"
                        onClick={() => handleGenerateWithAI(region)}
                        title="Gerar dados com IA"
                      >
                        <Zap className="w-3 h-3" />
                      </Button>
                      {region.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(region.id)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleReject(region.id)}
                          >
                            <X className="w-3 h-3" />
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

      {/* Modais */}
      <ViewModal />
      <EditModal />
    </div>
  );
};

export default RegionsTab; 