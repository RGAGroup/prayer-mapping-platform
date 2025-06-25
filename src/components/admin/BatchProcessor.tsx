// =====================================================
// BATCH PROCESSOR COMPONENT
// =====================================================
// Interface para gerenciar processamento em lote de dados espirituais

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  MapPin,
  Database,
  Bot,
  Settings
} from 'lucide-react';
import { batchService, type BatchProgress } from '../../services/batchService';
import { toast } from '../ui/use-toast';

// =====================================================
// INTERFACES
// =====================================================

interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export const BatchProcessor: React.FC = () => {
  const [progress, setProgress] = useState<BatchProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    processing: 0,
    pending: 0,
    percentage: 0,
    estimatedTimeRemaining: 'N/A',
    errors: []
  });
  
  const [queueStats, setQueueStats] = useState<QueueStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // =====================================================
  // EFEITOS E HANDLERS
  // =====================================================

  useEffect(() => {
    loadQueueStats();
    
    // Setup progress callback
    batchService.onProgress((newProgress) => {
      setProgress(newProgress);
      setIsProcessing(batchService.isRunning());
    });

    // Check if processing is already running
    setIsProcessing(batchService.isRunning());
  }, []);

  const loadQueueStats = async () => {
    try {
      const stats = await batchService.getQueueStatus();
      setQueueStats(stats);
    } catch (error) {
      console.error('Erro ao carregar stats da queue:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar estatísticas da queue",
        variant: "destructive"
      });
    }
  };

  const handleSetupBatch = async () => {
    setIsLoading(true);
    try {
      await batchService.setupSouthAmericaBatch();
      await loadQueueStats();
      
      toast({
        title: "Sucesso",
        description: "Batch da América do Sul configurado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao configurar batch:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao configurar batch",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
    try {
      const finalProgress = await batchService.processBatch();
      setProgress(finalProgress);
      
      toast({
        title: "Processamento Concluído",
        description: `${finalProgress.completed} regiões processadas com sucesso, ${finalProgress.failed} falhas`,
      });
      
      await loadQueueStats();
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

  const handleClearQueue = async () => {
    if (isProcessing) {
      toast({
        title: "Erro",
        description: "Não é possível limpar a queue durante o processamento",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await batchService.clearQueue();
      await loadQueueStats();
      setProgress(prev => ({ ...prev, total: 0, completed: 0, failed: 0, pending: 0, percentage: 0 }));
      
      toast({
        title: "Sucesso",
        description: "Queue limpa com sucesso",
      });
    } catch (error) {
      console.error('Erro ao limpar queue:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao limpar queue",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportResults = async () => {
    try {
      const results = await batchService.exportResults();
      const blob = new Blob([results], { type: 'application/json' });
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

  const StatusBadge = ({ status, count }: { status: string; count: number }) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      processing: { variant: 'default' as const, icon: Bot, color: 'text-blue-600' },
      completed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      failed: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    };
    
    const config = variants[status as keyof typeof variants];
    if (!config) return null;
    
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${config.color}`} />
        {count}
      </Badge>
    );
  };

  const CountryList = () => {
    const countries = batchService.getSouthAmericaCountries();
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {countries.map((country) => (
          <div key={country.country_code} className="flex items-center gap-2 p-2 border rounded">
            <MapPin className="w-4 h-4 text-blue-600" />
            <div>
              <div className="font-medium text-sm">{country.region_name}</div>
              <div className="text-xs text-gray-500">{country.country_code}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ErrorList = () => {
    if (progress.errors.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p>Nenhum erro registrado</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-48">
        <div className="space-y-2">
          {progress.errors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{error.region}:</strong> {error.error}
              </AlertDescription>
            </Alert>
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
                <p className="text-2xl font-bold">{queueStats.total}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendente</p>
                <p className="text-2xl font-bold">{queueStats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completos</p>
                <p className="text-2xl font-bold">{queueStats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Falhas</p>
                <p className="text-2xl font-bold">{queueStats.failed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Processamento AI - América do Sul
          </CardTitle>
          <CardDescription>
            Gere dados espirituais para os 12 países da América do Sul usando IA
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
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tempo restante: {progress.estimatedTimeRemaining}</span>
                <div className="flex gap-2">
                  <StatusBadge status="completed" count={progress.completed} />
                  <StatusBadge status="failed" count={progress.failed} />
                  <StatusBadge status="processing" count={progress.processing} />
                  <StatusBadge status="pending" count={progress.pending} />
                </div>
              </div>
            </div>
          )}

          {/* Botões de Controle */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleSetupBatch}
              disabled={isLoading || isProcessing}
              variant="outline"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar Batch
            </Button>
            
            <Button 
              onClick={handleStartProcessing}
              disabled={isLoading || isProcessing || queueStats.pending === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processando...' : 'Iniciar Processamento'}
            </Button>
            
            <Button 
              onClick={handleClearQueue}
              disabled={isLoading || isProcessing}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Queue
            </Button>
            
            <Button 
              onClick={handleExportResults}
              disabled={isLoading || queueStats.completed === 0}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs com Detalhes */}
      <Tabs defaultValue="countries" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="countries">Países (12)</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="errors">Erros ({progress.errors.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="countries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Países da América do Sul</CardTitle>
              <CardDescription>
                Lista completa dos países que serão processados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CountryList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              {progress.total === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-4" />
                  <p>Nenhum processamento iniciado ainda</p>
                  <p className="text-sm">Configure o batch e inicie o processamento para ver o progresso</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{progress.completed}</div>
                      <div className="text-sm text-gray-600">Concluídos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{progress.failed}</div>
                      <div className="text-sm text-gray-600">Falhas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{progress.processing}</div>
                      <div className="text-sm text-gray-600">Processando</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{progress.pending}</div>
                      <div className="text-sm text-gray-600">Pendentes</div>
                    </div>
                  </div>
                  
                  {progress.currentRegion && (
                    <Alert>
                      <Bot className="h-4 w-4" />
                      <AlertDescription>
                        Processando atualmente: <strong>{progress.currentRegion}</strong>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log de Erros</CardTitle>
              <CardDescription>
                Erros encontrados durante o processamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 