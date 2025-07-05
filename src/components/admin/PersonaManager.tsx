// =====================================================
// GERENCIADOR DE PERSONAS
// Interface para cadastro de personas com embeddings
// =====================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye,
  Copy,
  Download,
  Upload,
  Brain,
  Zap,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import advancedAgentService from '@/services/advancedAgentService';
import type { AgentPersona, PersonaFormData } from '@/types/Agent';

interface PersonaManagerProps {
  onPersonaSelect?: (persona: AgentPersona) => void;
  selectedPersonaId?: string;
}

interface FormErrors {
  [key: string]: string;
}

export const PersonaManager: React.FC<PersonaManagerProps> = ({ 
  onPersonaSelect, 
  selectedPersonaId 
}) => {
  // Estados principais
  const [personas, setPersonas] = useState<AgentPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [editingPersona, setEditingPersona] = useState<AgentPersona | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  // Estados do formulário
  const [formData, setFormData] = useState<PersonaFormData>({
    name: '',
    description: '',
    system_prompt: '',
    context: '',
    embedding_text: '',
    model: 'gpt-4o',
    temperature: 0.7,
    max_tokens: 1500,
    top_p: 1.0,
    personality_tone: '',
    personality_style: '',
    personality_approach: '',
    expertise: [],
    spiritual_focus: '',
    tone: '',
    style: '',
    is_active: true,
    is_default: false
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [newExpertise, setNewExpertise] = useState('');

  // Carregar personas ao montar
  useEffect(() => {
    loadPersonas();
    testOpenAIConnection();
  }, []);

  // 1. FUNÇÕES DE CARREGAMENTO
  // =====================================================
  const loadPersonas = async () => {
    try {
      setLoading(true);
      const data = await advancedAgentService.getPersonas();
      setPersonas(data);
    } catch (error) {
      console.error('Erro ao carregar personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const testOpenAIConnection = async () => {
    try {
      setTestingConnection(true);
      const isConnected = await advancedAgentService.testConnection();
      setConnectionStatus(isConnected);
    } catch (error) {
      setConnectionStatus(false);
    } finally {
      setTestingConnection(false);
    }
  };

  // 2. FUNÇÕES DO FORMULÁRIO
  // =====================================================
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.description.trim()) {
      errors.description = 'Descrição é obrigatória';
    }

    if (!formData.system_prompt.trim()) {
      errors.system_prompt = 'Prompt do sistema é obrigatório';
    } else if (formData.system_prompt.length < 10) {
      errors.system_prompt = 'Prompt deve ter pelo menos 10 caracteres';
    }

    if (!formData.spiritual_focus.trim()) {
      errors.spiritual_focus = 'Foco espiritual é obrigatório';
    }

    if (!formData.tone.trim()) {
      errors.tone = 'Tom é obrigatório';
    }

    if (!formData.style.trim()) {
      errors.style = 'Estilo é obrigatório';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      system_prompt: '',
      context: '',
      embedding_text: '',
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 1.0,
      personality_tone: '',
      personality_style: '',
      personality_approach: '',
      expertise: [],
      spiritual_focus: '',
      tone: '',
      style: '',
      is_active: true,
      is_default: false
    });
    setFormErrors({});
    setEditingPersona(null);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Verificar se API key está configurada
    if (!advancedAgentService.getApiKey()) {
      setFormErrors({ general: 'Configure a API Key OpenAI antes de salvar a persona.' });
      return;
    }

    try {
      setSaving(true);
      
      if (editingPersona) {
        // Atualizar persona existente
        await advancedAgentService.updatePersona(editingPersona.id, formData);
      } else {
        // Criar nova persona
        await advancedAgentService.createPersona(formData);
      }

      await loadPersonas();
      resetForm();
      setActiveTab('list');
    } catch (error) {
      console.error('Erro ao salvar persona:', error);
      
      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao salvar persona. Tente novamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          errorMessage = 'Erro de permissão. Verifique se você está logado corretamente.';
        } else if (error.message.includes('401')) {
          errorMessage = 'API Key inválida. Verifique sua configuração OpenAI.';
        } else if (error.message.includes('created_by')) {
          errorMessage = 'Erro de autenticação. Faça login novamente.';
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      setFormErrors({ general: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (persona: AgentPersona) => {
    setFormData({
      name: persona.name,
      description: persona.description,
      system_prompt: persona.system_prompt,
      context: persona.context || '',
      embedding_text: '',
      model: persona.model,
      temperature: persona.temperature,
      max_tokens: persona.max_tokens,
      top_p: persona.top_p,
      personality_tone: persona.personality.tone || '',
      personality_style: persona.personality.style || '',
      personality_approach: persona.personality.approach || '',
      expertise: persona.expertise || [],
      spiritual_focus: persona.spiritual_focus || '',
      tone: persona.tone || '',
      style: persona.style || '',
      is_active: persona.is_active,
      is_default: persona.is_default
    });
    setEditingPersona(persona);
    setActiveTab('form');
  };

  const handleDelete = async (personaId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta persona?')) return;

    try {
      await advancedAgentService.deletePersona(personaId);
      await loadPersonas();
    } catch (error) {
      console.error('Erro ao deletar persona:', error);
    }
  };

  // 3. FUNÇÕES DE EXPERTISE
  // =====================================================
  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }));
      setNewExpertise('');
    }
  };

  const removeExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(e => e !== expertise)
    }));
  };

  // 4. COMPONENTES DE RENDERIZAÇÃO
  // =====================================================
  // Estado para API key
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai-api-key') || '');

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    try {
      if (value.trim()) {
        advancedAgentService.setApiKey(value.trim());
        // A API key será salva automaticamente no localStorage pelo service
      } else {
        localStorage.removeItem('openai-api-key');
      }
    } catch (error) {
      console.error('Erro ao configurar API key:', error);
      setFormErrors({ general: `Erro na API key: ${error}` });
    }
  };

  const renderConnectionStatus = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Configuração OpenAI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo API Key */}
        <div>
          <Label htmlFor="openai-api-key">API Key OpenAI *</Label>
          <div className="flex gap-2">
            <Input
              id="openai-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="sk-proj-... (sua API key do OpenAI)"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={testOpenAIConnection}
              disabled={testingConnection || !apiKey.trim()}
            >
              {testingConnection ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Testar'
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Obtenha sua API key em: https://platform.openai.com/api-keys
          </p>
        </div>

        {/* Status da Conexão */}
        <div className="flex items-center gap-2">
          {testingConnection ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-600">Testando conexão OpenAI...</span>
            </div>
          ) : connectionStatus === true ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">OpenAI conectado com sucesso!</span>
            </div>
          ) : connectionStatus === false ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Falha na conexão OpenAI. Verifique sua API key.</span>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  const renderPersonaCard = (persona: AgentPersona) => (
    <Card key={persona.id} className={`cursor-pointer transition-all ${
      selectedPersonaId === persona.id ? 'ring-2 ring-blue-500' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{persona.name}</CardTitle>
            <CardDescription className="mt-1">{persona.description}</CardDescription>
          </div>
          <div className="flex gap-1 ml-2">
            {persona.is_default && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Padrão
              </Badge>
            )}
            {!persona.is_active && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                Inativo
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Configurações GPT-4o */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            <span className="bg-gray-100 px-2 py-1 rounded">{persona.model}</span>
            <span className="bg-gray-100 px-2 py-1 rounded">T: {persona.temperature}</span>
            <span className="bg-gray-100 px-2 py-1 rounded">{persona.max_tokens} tokens</span>
          </div>

          {/* Expertise */}
          {persona.expertise && persona.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {persona.expertise.slice(0, 3).map((exp, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {exp}
                </Badge>
              ))}
              {persona.expertise.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{persona.expertise.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Foco Espiritual */}
          {persona.spiritual_focus && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {persona.spiritual_focus}
            </p>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPersonaSelect?.(persona)}
              className="flex-1"
            >
              <Zap className="w-3 h-3 mr-1" />
              Usar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(persona)}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(persona.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderForm = () => (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome */}
          <div>
            <Label htmlFor="name">Nome da Persona *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Atalaia - Intercessor Espiritual"
              className={formErrors.name ? 'border-red-500' : ''}
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Breve descrição da função e expertise da persona"
              rows={3}
              className={formErrors.description ? 'border-red-500' : ''}
            />
            {formErrors.description && (
              <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
            )}
          </div>

          {/* Configurações */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Ativa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
              />
              <Label htmlFor="is_default">Padrão</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt do Sistema *</CardTitle>
          <CardDescription>
            Define a personalidade e comportamento da persona
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.system_prompt}
            onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
            placeholder="Você é um especialista em..."
            rows={6}
            className={formErrors.system_prompt ? 'border-red-500' : ''}
          />
          {formErrors.system_prompt && (
            <p className="text-red-500 text-sm mt-1">{formErrors.system_prompt}</p>
          )}
        </CardContent>
      </Card>

      {/* Configurações GPT-4o */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações GPT-4o
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Modelo */}
          <div>
            <Label>Modelo</Label>
            <Select 
              value={formData.model} 
              onValueChange={(value: 'gpt-4o' | 'gpt-4o-mini') => 
                setFormData(prev => ({ ...prev, model: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div>
            <Label>Criatividade (Temperature): {formData.temperature}</Label>
            <Slider
              value={[formData.temperature]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, temperature: value }))}
              min={0}
              max={2}
              step={0.1}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              0 = Mais determinístico, 2 = Mais criativo
            </p>
          </div>

          {/* Max Tokens */}
          <div>
            <Label>Máximo de Tokens: {formData.max_tokens}</Label>
            <Slider
              value={[formData.max_tokens]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, max_tokens: value }))}
              min={100}
              max={4096}
              step={100}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Personalidade e Expertise */}
      <Card>
        <CardHeader>
          <CardTitle>Personalidade e Expertise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Foco Espiritual */}
          <div>
            <Label htmlFor="spiritual_focus">Foco Espiritual *</Label>
            <Input
              id="spiritual_focus"
              value={formData.spiritual_focus}
              onChange={(e) => setFormData(prev => ({ ...prev, spiritual_focus: e.target.value }))}
              placeholder="Ex: Identificar necessidades de intercessão"
              className={formErrors.spiritual_focus ? 'border-red-500' : ''}
            />
            {formErrors.spiritual_focus && (
              <p className="text-red-500 text-sm mt-1">{formErrors.spiritual_focus}</p>
            )}
          </div>

          {/* Tom e Estilo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tone">Tom *</Label>
              <Input
                id="tone"
                value={formData.tone}
                onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                placeholder="Ex: Respeitoso, informativo"
                className={formErrors.tone ? 'border-red-500' : ''}
              />
              {formErrors.tone && (
                <p className="text-red-500 text-sm mt-1">{formErrors.tone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="style">Estilo *</Label>
              <Input
                id="style"
                value={formData.style}
                onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
                placeholder="Ex: Focado em oração"
                className={formErrors.style ? 'border-red-500' : ''}
              />
              {formErrors.style && (
                <p className="text-red-500 text-sm mt-1">{formErrors.style}</p>
              )}
            </div>
          </div>

          {/* Expertise */}
          <div>
            <Label>Áreas de Expertise</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newExpertise}
                onChange={(e) => setNewExpertise(e.target.value)}
                placeholder="Ex: Intercessão"
                onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
              />
              <Button onClick={addExpertise} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.expertise.map((exp, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    {exp}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeExpertise(exp)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Embeddings */}
      <Card>
        <CardHeader>
          <CardTitle>Embeddings (Opcional)</CardTitle>
          <CardDescription>
            Forneça texto para gerar embedding automaticamente ou cole um vetor manual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="embedding_text">Texto para Embedding</Label>
            <Textarea
              id="embedding_text"
              value={formData.embedding_text}
              onChange={(e) => setFormData(prev => ({ ...prev, embedding_text: e.target.value }))}
              placeholder="Texto que representa o conhecimento da persona..."
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Este texto será usado para gerar um embedding que permitirá buscar personas similares
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Erro Geral */}
      {formErrors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{formErrors.general}</p>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {editingPersona ? 'Atualizar' : 'Criar'} Persona
            </>
          )}
        </Button>
        <Button variant="outline" onClick={resetForm}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  );

  // 5. RENDER PRINCIPAL
  // =====================================================
  return (
    <div className="space-y-6">
      {renderConnectionStatus()}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">📋 Personas</TabsTrigger>
          <TabsTrigger value="form">
            {editingPersona ? '✏️ Editar' : '➕ Nova Persona'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Personas Cadastradas ({personas.length})
            </h3>
            <Button onClick={() => {
              resetForm();
              setActiveTab('form');
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Persona
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Carregando personas...</p>
            </div>
          ) : personas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Nenhuma persona cadastrada</p>
                <Button onClick={() => setActiveTab('form')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Persona
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personas.map(renderPersonaCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="form">
          {renderForm()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonaManager; 