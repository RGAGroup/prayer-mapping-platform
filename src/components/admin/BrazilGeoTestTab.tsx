// =====================================================
// BRAZIL GEO TEST TAB - TESTE MATSUNAGA 🇧🇷
// =====================================================
// Interface para testar população de dados geográficos do Brasil

import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  Play, 
  RotateCcw,
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  MapPin,
  Database,
  Zap,
  Trash2,
  BarChart3,
  Flag,
  Bug,
  Search,
  ExternalLink
} from 'lucide-react';
import { brazilGeoTestService, type BrazilTestProgress, type BrazilTestResult } from '../../services/brazilGeoTestService';
import { toast } from '../ui/use-toast';

// =====================================================
// INTERFACES
// =====================================================

interface ExistingData {
  countries: number;
  states: number;
  cities: number;
  total: number;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export const BrazilGeoTestTab: React.FC = () => {
  const [progress, setProgress] = useState<BrazilTestProgress>({
    currentStep: 'countries',
    stepDescription: 'Aguardando início do teste...',
    totalSteps: 4,
    currentStepNumber: 0,
    percentage: 0,
    details: { countries: 0, states: 0, cities: 0 },
    errors: [],
    logs: []
  });

  const [existingData, setExistingData] = useState<ExistingData>({
    countries: 0,
    states: 0,
    cities: 0,
    total: 0
  });

  const [lastResult, setLastResult] = useState<BrazilTestResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);

  // =====================================================
  // EFEITOS E HANDLERS
  // =====================================================

  useEffect(() => {
    loadExistingData();
    
    // Setup progress callback
    brazilGeoTestService.onProgress((newProgress) => {
      setProgress(newProgress);
    });
  }, []);

  const loadExistingData = async () => {
    try {
      const data = await brazilGeoTestService.checkExistingBrazilData();
      setExistingData(data);
    } catch (error) {
      console.error('Erro ao carregar dados existentes:', error);
    }
  };

  const handleStartTest = async () => {
    if (isProcessing) {
      toast({
        title: "Aviso",
        description: "Teste já está em andamento",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setLastResult(null);
    
    try {
      const result = await brazilGeoTestService.testBrazilComplete();
      setLastResult(result);
      
      toast({
        title: "🎉 Teste Concluído!",
        description: `${result.summary.total_regions} regiões populadas em ${Math.round(result.summary.duration_ms / 1000)}s`,
      });
      
      // Atualizar dados existentes
      await loadExistingData();
      
    } catch (error) {
      console.error('Erro no teste:', error);
      toast({
        title: "❌ Erro no Teste",
        description: error instanceof Error ? error.message : "Falha no processamento",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearData = async () => {
    if (isClearing) return;

    setIsClearing(true);
    
    try {
      const result = await brazilGeoTestService.clearBrazilTestData();
      
      if (result.success) {
        toast({
          title: "🧹 Dados Limpos",
          description: `${result.deleted} registros removidos`,
        });
        
        await loadExistingData();
        setLastResult(null);
      } else {
        toast({
          title: "❌ Erro ao Limpar",
          description: result.error || "Falha ao limpar dados",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      toast({
        title: "❌ Erro",
        description: error instanceof Error ? error.message : "Falha ao limpar dados",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleTestSupabase = async () => {
    toast({
      title: "🧪 Executando Diagnóstico",
      description: "Verifique o console para detalhes...",
    });
    
    try {
      // Teste básico de conexão com Supabase
      const { data, error } = await supabase
        .from('spiritual_regions')
        .select('count')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      console.log('✅ Supabase conectado com sucesso');
      toast({
        title: "✅ Diagnóstico Concluído",
        description: "Supabase conectado com sucesso",
      });
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      toast({
        title: "❌ Erro no Diagnóstico",
        description: error instanceof Error ? error.message : "Falha no teste",
        variant: "destructive"
      });
    }
  };

  // Função para testar busca de dados espirituais
  const testSpiritualDataSearch = async () => {
    console.log('🔍 Testando busca de dados espirituais...');
    
    try {
      // Buscar Brasil no banco
      const { data: regions, error } = await supabase
        .from('spiritual_regions')
        .select('*')
        .or('name.eq.Brasil,name.eq.Brazil')
        .eq('region_type', 'country');

      if (error) {
        console.error('❌ Erro na busca:', error);
        return;
      }

      console.log('🔍 Regiões encontradas:', regions);
      
      if (regions && regions.length > 0) {
        console.log('✅ Brasil encontrado no banco:', regions[0]);
        console.log('📄 Dados espirituais:', regions[0].spiritual_data);
      } else {
        console.log('⚠️ Brasil não encontrado no banco');
      }

      // Testar busca exata como no RegionalMapComponent
      const { data: exactMatch, error: exactError } = await supabase
        .from('spiritual_regions')
        .select('spiritual_data')
        .eq('name', 'Brasil')
        .eq('region_type', 'country')
        .maybeSingle();

      if (exactError) {
        console.error('❌ Erro na busca exata:', exactError);
      } else if (exactMatch) {
        console.log('✅ Busca exata encontrou dados:', exactMatch);
      } else {
        console.log('⚠️ Busca exata não encontrou dados');
      }

    } catch (error) {
      console.error('❌ Erro no teste:', error);
    }
  };

  // =====================================================
  // COMPONENTES AUXILIARES
  // =====================================================

  const StepBadge = ({ step, currentStep }: { step: string; currentStep: string }) => {
    const isActive = step === currentStep;
    const isCompleted = ['countries', 'states', 'cities', 'completed'].indexOf(step) < 
                       ['countries', 'states', 'cities', 'completed'].indexOf(currentStep);
    
    const variant = isActive ? 'default' : isCompleted ? 'secondary' : 'outline';
    const icon = isCompleted ? <CheckCircle className="w-3 h-3" /> : 
                 isActive ? <Clock className="w-3 h-3" /> : 
                 <MapPin className="w-3 h-3" />;
    
    const stepNames = {
      countries: 'País',
      states: 'Estados', 
      cities: 'Cidades',
      completed: 'Completo'
    };
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {stepNames[step as keyof typeof stepNames]}
      </Badge>
    );
  };

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
              {isGoogleMapsReady ? '🎉 Pronto para Teste' : '⚠️ Não Pronto'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

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

  const ProgressCard = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Progresso do Teste
        </CardTitle>
        <CardDescription>{progress.stepDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de progresso principal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso Geral</span>
            <span>{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>

        {/* Steps */}
        <div className="flex flex-wrap gap-2">
          {['countries', 'states', 'cities', 'completed'].map(step => (
            <StepBadge key={step} step={step} currentStep={progress.currentStep} />
          ))}
        </div>

        {/* Detalhes */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{progress.details.countries}</div>
            <div className="text-xs text-muted-foreground">Países</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{progress.details.states}</div>
            <div className="text-xs text-muted-foreground">Estados</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{progress.details.cities}</div>
            <div className="text-xs text-muted-foreground">Cidades</div>
          </div>
        </div>

        {/* Logs em tempo real */}
        {progress.logs.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">📋 Logs:</div>
            <ScrollArea className="h-20 p-2 border rounded text-xs">
              {progress.logs.map((log, index) => (
                <div key={index} className="text-muted-foreground">
                  {log}
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const LastResultCard = () => {
    if (!lastResult) return null;

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Último Resultado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {lastResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${lastResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {lastResult.success ? 'Sucesso' : 'Falha'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Países:</div>
              <div className="font-medium">{lastResult.summary.countries_inserted}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Estados:</div>
              <div className="font-medium">{lastResult.summary.states_inserted}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Cidades:</div>
              <div className="font-medium">{lastResult.summary.cities_inserted}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total:</div>
              <div className="font-medium">{lastResult.summary.total_regions}</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Duração: {Math.round(lastResult.summary.duration_ms / 1000)}s
          </div>

          {lastResult.errors.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {lastResult.errors.length} erro(s) encontrado(s)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Flag className="w-6 h-6 text-green-600" />
            Teste Brasil 🇧🇷
          </h2>
          <p className="text-muted-foreground">
            Teste Matsunaga: Popular dados geográficos do Brasil via Google Maps API
          </p>
        </div>
      </div>

      {/* Cards de controle */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GoogleMapsStatusCard />
        <ExistingDataCard />
        <ProgressCard />
        <LastResultCard />
      </div>

      {/* Botões de ação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações de Teste</CardTitle>
          <CardDescription>
            Execute o teste completo ou limpe os dados para um novo teste
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button 
            onClick={handleStartTest}
            disabled={isProcessing || isClearing || !isGoogleMapsReady}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : !isGoogleMapsReady ? (
              <Clock className="w-4 h-4 animate-pulse" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isProcessing ? 'Testando...' : !isGoogleMapsReady ? 'Aguardando Google Maps...' : 'Iniciar Teste Completo'}
          </Button>

          <Button 
            onClick={handleClearData}
            disabled={isProcessing || isClearing || existingData.total === 0}
            variant="destructive"
            className="flex items-center gap-2"
          >
            {isClearing ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isClearing ? 'Limpando...' : 'Limpar Dados'}
          </Button>

          <Button 
            onClick={loadExistingData}
            disabled={isProcessing || isClearing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Atualizar
          </Button>

          <Button 
            onClick={handleTestSupabase}
            disabled={isProcessing || isClearing}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Bug className="w-4 h-4" />
            Diagnosticar Supabase
          </Button>

          <Button
            onClick={testSpiritualDataSearch}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Testar Busca de Dados
          </Button>
        </CardContent>
      </Card>

      {/* Erros */}
      {progress.errors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">{progress.errors.length} erro(s) encontrado(s):</div>
              <ScrollArea className="h-20">
                {progress.errors.map((error, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    • {error}
                  </div>
                ))}
              </ScrollArea>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BrazilGeoTestTab; 