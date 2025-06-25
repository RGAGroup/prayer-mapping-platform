import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  Trash2, 
  Plus, 
  Settings, 
  Bot,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { aiService, type AIGenerationRequest } from '@/services/aiService';

interface QueueItem {
  id: string;
  region_type: string;
  region_identifier: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  generated_data?: any;
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

const AIQueueTab = () => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [newItem, setNewItem] = useState({
    region_identifier: '',
    region_type: 'country' as const,
    priority: 3
  });

  useEffect(() => {
    loadQueueItems();
    setApiKeyConfigured(aiService.isReady());
  }, []);

  const loadQueueItems = async () => {
    try {
      // Mock data for now - in production would fetch from database
      const mockItems: QueueItem[] = [
        {
          id: '1',
          region_type: 'country',
          region_identifier: 'Brasil',
          status: 'completed',
          priority: 5,
          created_at: '2025-06-23T15:00:00Z',
          processed_at: '2025-06-23T15:02:30Z'
        },
        {
          id: '2',
          region_type: 'country',
          region_identifier: 'Argentina',
          status: 'pending',
          priority: 4,
          created_at: '2025-06-23T16:00:00Z'
        },
        {
          id: '3',
          region_type: 'state',
          region_identifier: 'São Paulo',
          status: 'failed',
          priority: 3,
          error_message: 'API rate limit exceeded',
          created_at: '2025-06-23T14:00:00Z',
          processed_at: '2025-06-23T14:01:15Z'
        }
      ];
      
      setQueueItems(mockItems);
    } catch (error) {
      console.error('Erro ao carregar queue:', error);
    }
  };

  const handleConfigureApiKey = () => {
    if (apiKey.trim()) {
      aiService.setApiKey(apiKey.trim());
      setApiKeyConfigured(true);
      setShowApiKeyInput(false);
      setApiKey('');
    }
  };

  const handleAddToQueue = async () => {
    if (!newItem.region_identifier.trim()) return;

    const queueItem: QueueItem = {
      id: Date.now().toString(),
      region_type: newItem.region_type,
      region_identifier: newItem.region_identifier,
      status: 'pending',
      priority: newItem.priority,
      created_at: new Date().toISOString()
    };

    setQueueItems(prev => [queueItem, ...prev]);
    setNewItem({ region_identifier: '', region_type: 'country', priority: 3 });
  };

  const processNextItem = async () => {
    const pendingItem = queueItems
      .filter(item => item.status === 'pending')
      .sort((a, b) => b.priority - a.priority)[0];

    if (!pendingItem || !apiKeyConfigured) return;

    setIsProcessing(true);
    
    // Update status to processing
    setQueueItems(prev => prev.map(item => 
      item.id === pendingItem.id 
        ? { ...item, status: 'processing' as const }
        : item
    ));

    try {
      const request: AIGenerationRequest = {
        regionName: pendingItem.region_identifier,
        regionType: pendingItem.region_type as any,
        context: `Geração automática via admin dashboard`
      };

      const result = await aiService.generateSpiritualData(request);
      
      // Update with success
      setQueueItems(prev => prev.map(item => 
        item.id === pendingItem.id 
          ? { 
              ...item, 
              status: 'completed' as const,
              generated_data: result,
              processed_at: new Date().toISOString()
            }
          : item
      ));

    } catch (error) {
      // Update with error
      setQueueItems(prev => prev.map(item => 
        item.id === pendingItem.id 
          ? { 
              ...item, 
              status: 'failed' as const,
              error_message: error instanceof Error ? error.message : 'Erro desconhecido',
              processed_at: new Date().toISOString()
            }
          : item
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFromQueue = (id: string) => {
    setQueueItems(prev => prev.filter(item => item.id !== id));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Bot, label: 'Processando' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Concluído' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Falhou' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: number) => {
    const colors = {
      5: 'bg-red-100 text-red-800',
      4: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      2: 'bg-blue-100 text-blue-800',
      1: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge variant="outline" className={colors[priority as keyof typeof colors]}>
        P{priority}
      </Badge>
    );
  };

  const pendingCount = queueItems.filter(item => item.status === 'pending').length;
  const completedCount = queueItems.filter(item => item.status === 'completed').length;
  const failedCount = queueItems.filter(item => item.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Queue de Geração AI</h2>
          <p className="text-gray-600">Geração automática de dados espirituais usando IA</p>
        </div>
        <div className="flex space-x-2">
          {!apiKeyConfigured && (
            <Button 
              variant="outline" 
              onClick={() => setShowApiKeyInput(true)}
              className="border-orange-200 text-orange-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar API
            </Button>
          )}
          <Button 
            onClick={processNextItem}
            disabled={!apiKeyConfigured || isProcessing || pendingCount === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Processando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Processar Próximo
              </>
            )}
          </Button>
        </div>
      </div>

      {/* API Key Configuration */}
      {showApiKeyInput && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center space-x-2 mt-2">
              <Label htmlFor="api-key">OpenAI API Key:</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleConfigureApiKey} size="sm">
                Configurar
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowApiKeyInput(false)}
              >
                Cancelar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{isProcessing ? 1 : 0}</p>
                <p className="text-xs text-muted-foreground">Processando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{failedCount}</p>
                <p className="text-xs text-muted-foreground">Falharam</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Item */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar à Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor="region-name">Nome da Região</Label>
              <Input
                id="region-name"
                placeholder="Ex: França, São Paulo, Paris"
                value={newItem.region_identifier}
                onChange={(e) => setNewItem(prev => ({ ...prev, region_identifier: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="region-type">Tipo</Label>
              <Select 
                value={newItem.region_type} 
                onValueChange={(value: any) => setNewItem(prev => ({ ...prev, region_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="country">País</SelectItem>
                  <SelectItem value="state">Estado</SelectItem>
                  <SelectItem value="city">Cidade</SelectItem>
                  <SelectItem value="neighborhood">Bairro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                value={newItem.priority.toString()} 
                onValueChange={(value) => setNewItem(prev => ({ ...prev, priority: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 - Crítica</SelectItem>
                  <SelectItem value="4">4 - Alta</SelectItem>
                  <SelectItem value="3">3 - Média</SelectItem>
                  <SelectItem value="2">2 - Baixa</SelectItem>
                  <SelectItem value="1">1 - Mínima</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddToQueue} disabled={!newItem.region_identifier.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Itens na Queue</CardTitle>
          <CardDescription>
            {queueItems.length} itens total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Região</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queueItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.region_identifier}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.region_type === 'country' ? 'País' :
                       item.region_type === 'state' ? 'Estado' :
                       item.region_type === 'city' ? 'Cidade' : 'Bairro'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromQueue(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {queueItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum item na queue
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIQueueTab; 