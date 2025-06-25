// =====================================================
// SIMPLE BATCH PROCESSOR - AMÉRICA DO SUL
// =====================================================
// Interface simplificada para processamento dos países da América do Sul

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Play, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  MapPin,
  Bot,
  Zap,
  BarChart3
} from 'lucide-react';
import { southAmericaBatchService, type ProcessingProgress, type CountryResult } from '../../services/southAmericaBatchService';
import { toast } from '../ui/use-toast';

// =====================================================
// INTERFACES
// =====================================================

interface CountryStats {
  total: number;
  withData: number;
  approved: number;
  pending: number;
}

interface CountryStatus {
  name: string;
  hasData: boolean;
  status: string;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export const SimpleBatchProcessor: React.FC = () => {
  const [progress, setProgress] = useState<ProcessingProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    processing: 0,
    percentage: 0,
    errors: []
  });

  const [stats, setStats] = useState<CountryStats>({
    total: 12,
    withData: 0,
    approved: 0,
    pending: 0
  });

  const [countryStatuses, setCountryStatuses] = useState<CountryStatus[]>([]);
  const [results, setResults] = useState<CountryResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // =====================================================
  // EFEITOS E HANDLERS
  // =====================================================

  useEffect(() => {
    loadStats();
    loadCountryStatuses();
    
    // Setup progress callback
    southAmericaBatchService.onProgress((newProgress) => {
      setProgress(newProgress);
    });
  }, []);

  const loadStats = async () => {
    try {
      const newStats = await southAmericaBatchService.getStats();
      setStats(newStats);
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  const loadCountryStatuses = async () => {
    try {
      const statuses = await southAmericaBatchService.getExistingData();
      setCountryStatuses(statuses);
    } catch (error) {
      console.error('Erro ao carregar status dos países:', error);
    }
  };

  const handleStartProcessing = async () => {
    if (isProcessing) {
      toast({
        title: "Aviso",
        description: "Processamento já está em andamento",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setResults([]);
    
    try {
      const batchResults = await southAmericaBatchService.processAllCountries();
      setResults(batchResults);
      
      const successful = batchResults.filter(r => r.success).length;
      const failed = batchResults.filter(r => !r.success).length;
      
      toast({
        title: "Processamento Concluído",
        description: `${successful} países processados com sucesso, ${failed} falhas`,
      });
      
      // Atualizar stats
      await loadStats();
      await loadCountryStatuses();
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha no processamento",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessCountry = async (countryName: string) => {
    setIsLoading(true);
    try {
      const result = await southAmericaBatchService.processCountry(countryName);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: `${countryName} processado com sucesso`,
        });
      } else {
        toast({
          title: "Erro",
          description: `Falha ao processar ${countryName}: ${result.error}`,
          variant: "destructive"
        });
      }
      
      await loadStats();
      await loadCountryStatuses();
      
    } catch (error) {
      console.error('Erro ao processar país:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha no processamento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportResults = async () => {
    try {
      const exportData = await southAmericaBatchService.exportResults();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `south_america_spiritual_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso",
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar dados",
        variant: "destructive"
      });
    }
  };

  // =====================================================
  // COMPONENTES DE RENDERIZAÇÃO
  // =====================================================

  const StatusBadge = ({ status }: { status: string }) => {
    const configs = {
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600', label: 'Aprovado' },
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600', label: 'Pendente' },
      not_found: { variant: 'outline' as const, icon: XCircle, color: 'text-gray-400', label: 'Sem dados' }
    };
    
    const config = configs[status as keyof typeof configs] || configs.not_found;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const CountryList = () => {
    const countries = southAmericaBatchService.getCountries();
    
    return (
      <div className="space-y-2">
        {countries.map((country) => {
          const status = countryStatuses.find(s => s.name === country.name);
          return (
            <div key={country.code} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium">{country.name}</div>
                  <div className="text-xs text-gray-500">{country.code}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={status?.status || 'not_found'} />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleProcessCountry(country.name)}
                  disabled={isLoading || isProcessing}
                >
                  <Bot className="w-3 h-3 mr-1" />
                  Processar
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const ResultsList = () => {
    if (results.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Bot className="w-12 h-12 mx-auto mb-4" />
          <p>Nenhum resultado ainda</p>
          <p className="text-sm">Execute o processamento para ver os resultados</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className={`p-3 border rounded-lg ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium">{result.country}</span>
                </div>
                {result.duration && (
                  <span className="text-xs text-gray-500">{Math.round(result.duration / 1000)}s</span>
                )}
              </div>
              {result.error && (
                <p className="text-sm text-red-600 mt-1">{result.error}</p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  return (
    <div className="space-y-6">
      {/* Header com Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Com Dados</p>
                <p className="text-2xl font-bold">{stats.withData}</p>
              </div>
              <Bot className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovados</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Processamento Rápido - América do Sul
          </CardTitle>
          <CardDescription>
            Sistema otimizado para gerar dados espirituais dos 12 países sul-americanos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de Progresso */}
          {progress.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso: {progress.completed + progress.failed} de {progress.total}</span>
                <span>{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="w-full" />
              {progress.currentCountry && (
                <div className="text-sm text-blue-600">
                  🎯 Processando: <strong>{progress.currentCountry}</strong>
                </div>
              )}
            </div>
          )}

          {/* Botões de Controle */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleStartProcessing}
              disabled={isLoading || isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processando...' : 'Processar Todos'}
            </Button>
            
            <Button 
              onClick={handleExportResults}
              disabled={isLoading || stats.withData === 0}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>

            <Button 
              onClick={() => { loadStats(); loadCountryStatuses(); }}
              disabled={isLoading}
              variant="outline"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Alertas de Erro */}
          {progress.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{progress.errors.length} erro(s) encontrado(s):</strong>
                <ul className="mt-1 ml-4 list-disc">
                  {progress.errors.slice(0, 3).map((error, index) => (
                    <li key={index}>{error.country}: {error.error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabs com Detalhes */}
      <Tabs defaultValue="countries" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="countries">Países ({stats.total})</TabsTrigger>
          <TabsTrigger value="results">Resultados ({results.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="countries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Países</CardTitle>
              <CardDescription>
                Status atual e ações individuais para cada país
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CountryList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resultados do Processamento</CardTitle>
              <CardDescription>
                Histórico da última execução em lote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResultsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 