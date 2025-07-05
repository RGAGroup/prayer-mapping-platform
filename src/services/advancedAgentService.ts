// =====================================================
// SERVIÇO AVANÇADO DO AGENTE
// Otimizado para OpenAI GPT-4o com Embeddings
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  AgentPersona,
  AgentTask,
  AgentSession,
  AgentUserControls,
  PersonaFormData,
  OpenAIResponse,
  EmbeddingResponse,
  AgentResult,
  AgentStatistics,
  RegionContext,
  AgentConfig,
  AgentEventCallbacks,
  AgentError,
  AgentTaskType,
  AgentTaskStatus
} from '@/types/Agent';

// 1. CONFIGURAÇÃO PADRÃO
// =====================================================
const DEFAULT_CONFIG: AgentConfig = {
  default_model: 'gpt-4o',
  default_temperature: 0.7,
  default_max_tokens: 1500,
  default_batch_size: 5,
  default_delay_ms: 200,
  
  // Custos GPT-4o (por 1K tokens - preços de 2024)
  gpt4o_cost_per_token: 0.00003,
  gpt4o_mini_cost_per_token: 0.00015,
  embedding_cost_per_token: 0.00001,
  
  // Rate Limiting
  max_requests_per_minute: 60,
  max_concurrent_requests: 3,
  
  // Retry
  max_retries: 3,
  retry_delay_ms: 1000,
  
  // Timeout
  request_timeout_ms: 30000,
  
  // API Key (será carregada do localStorage ou env)
  openai_api_key: '',
  openai_organization: undefined
};

class AdvancedAgentService {
  private config: AgentConfig;
  private callbacks: AgentEventCallbacks;
  private activeRequests: Map<string, AbortController> = new Map();
  private rateLimitTracker: { requests: number; resetTime: number } = {
    requests: 0,
    resetTime: Date.now() + 60000
  };

  constructor(config?: Partial<AgentConfig>, callbacks?: AgentEventCallbacks) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.callbacks = callbacks || {};
    this.loadApiKey();
  }

  // 2. GERENCIAMENTO DE API KEY
  // =====================================================
  private loadApiKey(): void {
    // Tentar carregar de diferentes fontes
    const sources = [
      () => localStorage.getItem('openai-api-key'),
      () => import.meta.env.VITE_OPENAI_API_KEY,
      () => import.meta.env.OPENAI_API_KEY
    ];

    for (const source of sources) {
      try {
        const apiKey = source();
        if (apiKey && apiKey.trim() && apiKey.startsWith('sk-')) {
          this.config.openai_api_key = apiKey.trim();
          console.log('✅ API Key OpenAI carregada com sucesso');
          break;
        }
      } catch (error) {
        // Continuar tentando outras fontes
      }
    }

    if (!this.config.openai_api_key) {
      console.warn('⚠️ API Key OpenAI não encontrada. Configure via interface ou arquivo .env');
    }
  }

  public setApiKey(apiKey: string): void {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('API Key não pode estar vazia');
    }

    if (!apiKey.startsWith('sk-')) {
      throw new Error('API Key deve começar com "sk-"');
    }

    this.config.openai_api_key = apiKey.trim();
    localStorage.setItem('openai-api-key', apiKey.trim());
    console.log('✅ API Key OpenAI configurada com sucesso');
  }

  public getApiKey(): string {
    return this.config.openai_api_key || '';
  }

  // 3. UTILITÁRIOS DE USUÁRIO
  // =====================================================
  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    return user.id;
  }

  // 4. GERENCIAMENTO DE PERSONAS
  // =====================================================
  public async createPersona(personaData: PersonaFormData): Promise<AgentPersona> {
    try {
      const userId = await this.getCurrentUserId();
      
      // Gerar embedding se fornecido texto
      let embedding: number[] | undefined;
      if (personaData.embedding_text) {
        embedding = await this.generateEmbedding(personaData.embedding_text);
      } else if (personaData.embedding_vector) {
        embedding = personaData.embedding_vector;
      }

      // Preparar dados para inserção
      const insertData = {
        name: personaData.name,
        description: personaData.description,
        system_prompt: personaData.system_prompt,
        context: personaData.context,
        embedding: embedding,
        model: personaData.model,
        temperature: personaData.temperature,
        max_tokens: personaData.max_tokens,
        top_p: personaData.top_p,
        personality: {
          tone: personaData.personality_tone,
          style: personaData.personality_style,
          approach: personaData.personality_approach
        },
        expertise: personaData.expertise,
        spiritual_focus: personaData.spiritual_focus,
        tone: personaData.tone,
        style: personaData.style,
        is_active: personaData.is_active,
        is_default: personaData.is_default,
        created_by: userId // ✅ CAMPO OBRIGATÓRIO PARA RLS
      };

      console.log('📝 Criando persona para usuário:', userId);
      
      const { data, error } = await supabase
        .from('agent_personas')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }
      
      console.log('✅ Persona criada com sucesso:', data.id);
      return data as AgentPersona;
    } catch (error) {
      console.error('❌ Erro ao criar persona:', error);
      throw this.createError('PERSONA_CREATE_FAILED', `Erro ao criar persona: ${error}`, { personaData });
    }
  }

  public async getPersonas(): Promise<AgentPersona[]> {
    try {
      const userId = await this.getCurrentUserId();
      console.log('🔍 Buscando personas para usuário:', userId);
      
      const { data, error } = await supabase
        .from('agent_personas')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }
      
      console.log('✅ Personas carregadas:', data?.length || 0);
      return data as AgentPersona[];
    } catch (error) {
      console.error('❌ Erro ao buscar personas:', error);
      throw this.createError('PERSONAS_FETCH_FAILED', `Erro ao buscar personas: ${error}`);
    }
  }

  public async getPersonaById(personaId: string): Promise<AgentPersona | null> {
    try {
      const { data, error } = await supabase
        .from('agent_personas')
        .select('*')
        .eq('id', personaId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as AgentPersona | null;
    } catch (error) {
      throw this.createError('PERSONA_FETCH_FAILED', `Erro ao buscar persona: ${error}`, { personaId });
    }
  }

  public async updatePersona(personaId: string, updates: Partial<PersonaFormData>): Promise<AgentPersona> {
    try {
      const userId = await this.getCurrentUserId();
      
      // Gerar novo embedding se necessário
      let embedding: number[] | undefined;
      if (updates.embedding_text) {
        embedding = await this.generateEmbedding(updates.embedding_text);
      } else if (updates.embedding_vector) {
        embedding = updates.embedding_vector;
      }

      const updateData: any = { ...updates };
      if (embedding) {
        updateData.embedding = embedding;
      }

      // Garantir que o created_by não seja alterado
      if ('created_by' in updateData) {
        delete updateData.created_by;
      }

      const { data, error } = await supabase
        .from('agent_personas')
        .update(updateData)
        .eq('id', personaId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase erro updatePersona:', error);
        throw new Error(error.message || 'Erro desconhecido do Supabase');
      }
      return data as AgentPersona;
    } catch (error) {
      throw this.createError('PERSONA_UPDATE_FAILED', `Erro ao atualizar persona: ${error}`, { personaId, updates });
    }
  }

  public async deletePersona(personaId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('agent_personas')
        .delete()
        .eq('id', personaId);

      if (error) throw error;
    } catch (error) {
      throw this.createError('PERSONA_DELETE_FAILED', `Erro ao deletar persona: ${error}`, { personaId });
    }
  }

  // 5. GERAÇÃO DE EMBEDDINGS
  // =====================================================
  public async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (!this.config.openai_api_key) {
        throw new Error('API Key OpenAI não configurada');
      }

      await this.checkRateLimit();

      console.log('🔄 Gerando embedding para texto...');
      
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openai_api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-large'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro OpenAI:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data: EmbeddingResponse = await response.json();
      console.log('✅ Embedding gerado com sucesso');
      return data.data[0].embedding;
    } catch (error) {
      console.error('❌ Erro ao gerar embedding:', error);
      throw this.createError('EMBEDDING_GENERATION_FAILED', `Erro ao gerar embedding: ${error}`, { text });
    }
  }

  public async findSimilarPersonas(embedding: number[], threshold: number = 0.8): Promise<AgentPersona[]> {
    try {
      const { data, error } = await supabase.rpc('find_similar_personas', {
        query_embedding: embedding,
        similarity_threshold: threshold,
        result_limit: 10
      });

      if (error) throw error;
      
      // A função RPC retorna apenas IDs, precisamos buscar as personas completas
      if (!data || data.length === 0) return [];
      
      const personaIds = data.map((item: any) => item.persona_id);
      
      const { data: personas, error: personasError } = await supabase
        .from('agent_personas')
        .select('*')
        .in('id', personaIds)
        .eq('is_active', true);
        
      if (personasError) throw personasError;
      return personas as AgentPersona[];
    } catch (error) {
      throw this.createError('SIMILAR_PERSONAS_SEARCH_FAILED', `Erro ao buscar personas similares: ${error}`, { threshold });
    }
  }

  // 6. EXECUÇÃO DE TAREFAS COM GPT-4o
  // =====================================================
  public async executeTask(
    persona: AgentPersona,
    region: RegionContext,
    taskType: AgentTaskType,
    customPrompt?: string
  ): Promise<AgentResult> {
    const startTime = Date.now();
    let task: AgentTask | null = null;

    try {
      // Criar tarefa no banco
      task = await this.createTask(persona.id, region.region_id, taskType);
      this.callbacks.onTaskStart?.(task);

      // Construir prompt
      const prompt = customPrompt || this.buildPrompt(persona, region, taskType);
      
      // Executar com GPT-4o
      const response = await this.callGPT4o(persona, prompt);
      
      // Processar resultado
      const result = await this.processTaskResult(task, response, startTime);
      
      this.callbacks.onTaskComplete?.(task, result);
      return result;

    } catch (error) {
      if (task) {
        await this.updateTaskStatus(task.id, 'failed', error instanceof Error ? error.message : String(error));
        this.callbacks.onTaskFail?.(task, error instanceof Error ? error.message : String(error));
      }
      throw error;
    }
  }

  private async callGPT4o(persona: AgentPersona, prompt: string): Promise<OpenAIResponse> {
    try {
      if (!this.config.openai_api_key) {
        throw new Error('API Key OpenAI não configurada');
      }

      await this.checkRateLimit();

      const controller = new AbortController();
      const taskId = `task_${Date.now()}`;
      this.activeRequests.set(taskId, controller);

      // LOG DETALHADO DO PROMPT E CONFIGS
      console.log('================ GPT-4o REQUEST ================');
      console.log('🟢 Persona:', persona.name, '| ID:', persona.id);
      console.log('📝 [system_prompt]:', persona.system_prompt);
      console.log('📝 [user prompt]:', prompt);
      console.log('⚙️ Modelo:', persona.model, '| Temp:', persona.temperature, '| Max tokens:', persona.max_tokens, '| Top_p:', persona.top_p);
      console.log('================================================');

      console.log('🤖 Executando tarefa com GPT-4o...');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openai_api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: persona.model,
          messages: [
            { role: 'system', content: persona.system_prompt },
            { role: 'user', content: prompt }
          ],
          temperature: persona.temperature,
          max_tokens: persona.max_tokens,
          top_p: persona.top_p
        }),
        signal: controller.signal
      });

      this.activeRequests.delete(taskId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro GPT-4o:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      console.log('✅ Resposta GPT-4o recebida');
      return data;

    } catch (error) {
      console.error('❌ Erro na chamada GPT-4o:', error);
      throw this.createError('GPT4O_CALL_FAILED', `Erro na chamada GPT-4o: ${error}`, { persona: persona.id, prompt });
    }
  }

  private buildPrompt(persona: AgentPersona, region: RegionContext, taskType: AgentTaskType): string {
    let basePrompt = '';
    let jsonTemplate = '';
    
    switch (taskType) {
      case 'spiritual_data':
        basePrompt = `Como especialista em intercessão e mapeamento espiritual, analise profundamente a região ${region.region_name} (${region.region_type}) e forneça dados espirituais estratégicos para intercessores.

CONTEXTO DA REGIÃO:
- Nome: ${region.region_name}
- Tipo: ${region.region_type}
- Código do país: ${region.country_code || 'N/A'}`;

        jsonTemplate = `{
  "geopoliticalSystem": {
    "governmentType": "Descreva o sistema de governo atual (ex: República Federal, Estado Unitário etc.)",
    "keyPositions": [
      "Cargo 1: Nome do ocupante atual (se conhecido)",
      "Cargo 2: Nome do ocupante atual (se conhecido)",
      "Cargo 3: Nome do ocupante atual (se conhecido)"
    ],
    "powerCenters": [
      "Local físico onde decisões são tomadas (ex: sede do governo estadual)",
      "Edifício ou instituição de poder (ex: Assembleia, Tribunal)",
      "Outros centros de influência espiritual (ex: universidades, monumentos, mídia estatal)"
    ]
  },
  "intercessionTargets": [
    "Desafio espiritual urgente (ex: idolatria, feitiçaria, perseguição religiosa)",
    "Oportunidade ministerial para avanço do Reino (ex: jovens sedentos, campus abertos)",
    "Portais espirituais a serem ocupados (ex: mídia local, universidades, centros culturais)",
    "Corrupção ou estruturas de iniquidade a serem quebradas (ex: sistema judicial corrompido)",
    "Alerta de influência demoníaca territorial (se houver discernimento profético para isso)"
  ],
  "outrasInformacoesImportantes": [
    "Qualquer detalhe adicional relevante espiritualmente ou profeticamente sobre a região",
    "Revelações específicas recebidas ou discernidas por líderes confiáveis",
    "Conexões históricas, pactos antigos, ou presença de altares/ritos passados",
    "Informações fora dos campos acima que podem ajudar na intercessão estratégica"
  ]
}`;
        break;
      case 'prayer_points':
        basePrompt = `Gere pontos específicos de oração para ${region.region_name} baseados no contexto espiritual, cultural e histórico da região.`;
        jsonTemplate = `{
  "prayerPoints": [
    {
      "title": "Título do ponto de oração",
      "description": "Descrição detalhada do ponto de oração",
      "priority": "high/medium/low",
      "scriptureReference": "Referência bíblica relacionada"
    }
  ]
}`;
        break;
      case 'cultural_context':
        basePrompt = `Forneça uma análise cultural detalhada de ${region.region_name}, incluindo tradições, valores, estrutura social, e como estes fatores impactam a espiritualidade local.`;
        jsonTemplate = `{
  "culturalAnalysis": {
    "traditions": ["Tradição 1", "Tradição 2"],
    "values": ["Valor 1", "Valor 2"],
    "socialStructure": "Descrição da estrutura social",
    "spiritualImpact": "Como a cultura impacta a espiritualidade"
  }
}`;
        break;
      case 'historical_context':
        basePrompt = `Analise o contexto histórico espiritual de ${region.region_name}, incluindo eventos significativos, movimento de Deus, desafios históricos e como moldaram a situação espiritual atual.`;
        jsonTemplate = `{
  "historicalAnalysis": {
    "significantEvents": ["Evento 1", "Evento 2"],
    "spiritualMovements": ["Movimento 1", "Movimento 2"],
    "challenges": ["Desafio 1", "Desafio 2"],
    "currentImpact": "Como a história moldou a situação atual"
  }
}`;
        break;
      case 'demographic_data':
        basePrompt = `Forneça dados demográficos relevantes para intercessão em ${region.region_name}, incluindo população, distribuição religiosa, grupos étnicos, e questões sociais que requerem oração.`;
        jsonTemplate = `{
  "demographics": {
    "population": "Número aproximado da população",
    "religiousDistribution": {"Religião 1": "Percentual", "Religião 2": "Percentual"},
    "ethnicGroups": ["Grupo 1", "Grupo 2"],
    "socialIssues": ["Questão 1", "Questão 2"]
  }
}`;
        break;
      case 'economic_context':
        basePrompt = `Analise a situação econômica de ${region.region_name} do ponto de vista espiritual, identificando desafios econômicos, oportunidades para o reino de Deus, e necessidades específicas de oração.`;
        jsonTemplate = `{
  "economicAnalysis": {
    "challenges": ["Desafio 1", "Desafio 2"],
    "opportunities": ["Oportunidade 1", "Oportunidade 2"],
    "prayerNeeds": ["Necessidade 1", "Necessidade 2"]
  }
}`;
        break;
      case 'religious_mapping':
        basePrompt = `Mapeie o cenário religioso de ${region.region_name}, incluindo denominações cristãs presentes, outras religiões, movimentos espirituais, e oportunidades estratégicas para oração e evangelização.`;
        jsonTemplate = `{
  "religiousMapping": {
    "christianDenominations": ["Denominação 1", "Denominação 2"],
    "otherReligions": ["Religião 1", "Religião 2"],
    "spiritualMovements": ["Movimento 1", "Movimento 2"],
    "strategicOpportunities": ["Oportunidade 1", "Oportunidade 2"]
  }
}`;
        break;
      default:
        basePrompt = `Analise a região ${region.region_name} (${region.region_type}) e forneça dados espirituais relevantes para intercessores.`;
        jsonTemplate = `{
  "geopoliticalSystem": {
    "governmentType": "Descrição do tipo de governo e estrutura política",
    "keyPositions": ["Lista de cargos principais e líderes"],
    "powerCenters": ["Locais físicos de poder"]
  },
  "intercessionTargets": [
    "Alvo específico de intercessão 1",
    "Alvo específico de intercessão 2"
  ]
}`;
    }
    
    // Adicionar contexto adicional
    let contextualInfo = '\n\nINFORMAÇÕES ADICIONAIS:';
    
    if (region.coordinates && region.coordinates.latitude && region.coordinates.longitude) {
      contextualInfo += `\n- Coordenadas: ${region.coordinates.latitude}, ${region.coordinates.longitude}`;
    }
    
    if (persona.spiritual_focus) {
      contextualInfo += `\n- Foco espiritual da análise: ${persona.spiritual_focus}`;
    }
    
    if (region.existing_spiritual_data) {
      contextualInfo += `\n- Dados espirituais existentes: Esta região já possui algumas informações espirituais. Complemente ou atualize conforme necessário.`;
    }
    
    // Adicionar contexto se houver informações relevantes
    if (contextualInfo !== '\n\nINFORMAÇÕES ADICIONAIS:') {
      basePrompt += contextualInfo;
    }
    
    // Adicionar template JSON com instruções claras
    basePrompt += `\n\nIMPORTANTE: Responda APENAS com o JSON válido, sem texto adicional antes ou depois. Use informações reais e específicas da região.

FORMATO DE RESPOSTA OBRIGATÓRIO:
${jsonTemplate}`;
    
    return basePrompt;
  }

  // 7. GERENCIAMENTO DE TAREFAS
  // =====================================================
  private async createTask(personaId: string, regionId: string, taskType: AgentTaskType): Promise<AgentTask> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { data, error } = await supabase
        .from('agent_tasks')
        .insert({
          persona_id: personaId,
          region_id: regionId,
          task_type: taskType,
          status: 'processing',
          started_at: new Date().toISOString(),
          created_by: userId // ✅ CAMPO OBRIGATÓRIO PARA RLS
        })
        .select()
        .single();

      if (error) throw error;
      return data as AgentTask;
    } catch (error) {
      throw this.createError('TASK_CREATE_FAILED', `Erro ao criar tarefa: ${error}`, { personaId, regionId, taskType });
    }
  }

  private async updateTaskStatus(taskId: string, status: AgentTaskStatus, errorMessage?: string): Promise<void> {
    try {
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'failed' && errorMessage) {
        updateData.error_message = errorMessage;
      }

      const { error } = await supabase
        .from('agent_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
    }
  }

  private async processTaskResult(task: AgentTask, response: OpenAIResponse, startTime: number): Promise<AgentResult> {
    const processingTime = Date.now() - startTime;
    const tokensUsed = response.usage.total_tokens;
    const content = response.choices[0].message.content;

    try {
      // Processar resposta do GPT-4o
      let resultData: any = content.trim();
      let confidenceScore = 85; // Score padrão
      
      // Tentar fazer parsing JSON robusto
      try {
        // Limpar markdown se presente
        let jsonContent = resultData;
        if (jsonContent.includes('```json')) {
          jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```/g, '');
        }
        
        // Tentar fazer parsing do JSON
        const parsed = JSON.parse(jsonContent);
        
        // Se for 'spiritual_data', converter para formato esperado pelo frontend
        if (task.task_type === 'spiritual_data' && parsed.geopoliticalSystem && parsed.intercessionTargets) {
          const converted = {
            sistema_geopolitico_completo: this.formatGeopoliticalSystem(parsed.geopoliticalSystem),
            alvos_intercessao_completo: this.formatIntercessionTargets(parsed.intercessionTargets),
            outras_informacoes_importantes: this.formatOtherInformation(parsed.outrasInformacoesImportantes)
          };
          resultData = converted;
          confidenceScore = 90; // JSON válido e convertido
          console.log('✅ JSON válido convertido para formato frontend:', converted);
        } else {
          // Para outros tipos de tarefa, manter a estrutura JSON original
          resultData = parsed;
          confidenceScore = 88; // JSON válido
          console.log('✅ JSON válido mantido na estrutura original:', parsed);
        }
        
      } catch (jsonError) {
        console.warn('⚠️ Resposta não é JSON válido, salvando como texto:', jsonError);
        // Manter como texto se não conseguir fazer parsing
        resultData = content.trim();
        confidenceScore = 75; // Texto válido mas não JSON
      }

      // Atualizar tarefa no banco
      await supabase
        .from('agent_tasks')
        .update({
          status: 'awaiting_approval',
          result_data: resultData,
          raw_response: content,
          tokens_used: tokensUsed,
          processing_time_ms: processingTime,
          confidence_score: confidenceScore,
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id);

      // Retornar resultado
      const result: AgentResult = {
        task_id: task.id,
        region_name: '', // Será preenchido pelo chamador
        task_type: task.task_type,
        status: 'awaiting_approval',
        result_data: resultData,
        confidence_score: confidenceScore,
        tokens_used: tokensUsed,
        processing_time_ms: processingTime,
        user_approved: false,
        created_at: task.created_at,
        completed_at: new Date().toISOString()
      };

      // 🚀 APROVAÇÃO AUTOMÁTICA - Salvar diretamente no banco
      console.log('🚀 Aplicando aprovação automática...');
      await this.approveTask(task.id);
      result.user_approved = true;
      result.status = 'completed';
      
      console.log('✅ Conteúdo aprovado e salvo automaticamente!');
      
      return result;

    } catch (error) {
      throw this.createError('TASK_RESULT_PROCESSING_FAILED', `Erro ao processar resultado da tarefa: ${error}`, { task: task.id });
    }
  }

  // Métodos auxiliares para conversão de formato
  private formatGeopoliticalSystem(geoSystem: any): string {
    const sections = [];
    
    if (geoSystem.governmentType) {
      sections.push(`Tipo de governo:\n${geoSystem.governmentType}`);
    }
    
    if (geoSystem.keyPositions && Array.isArray(geoSystem.keyPositions)) {
      sections.push(`Cargos principais:\n${geoSystem.keyPositions.join('\n')}`);
    }
    
    if (geoSystem.powerCenters && Array.isArray(geoSystem.powerCenters)) {
      sections.push(`Locais físicos de poder:\n${geoSystem.powerCenters.join('\n')}`);
    }
    
    return sections.join('\n\n');
  }

  private formatIntercessionTargets(targets: any[]): string {
    if (!Array.isArray(targets)) {
      return String(targets);
    }
    
    return `Alvos de Intercessão:\n${targets.map((target, index) => `${index + 1}. ${target}`).join('\n\n')}`;
  }

  private formatOtherInformation(otherInfo: any[]): string {
    if (!Array.isArray(otherInfo)) {
      return String(otherInfo || '');
    }
    
    return `Outras Informações Importantes:\n${otherInfo.map((info, index) => `${index + 1}. ${info}`).join('\n\n')}`;
  }

  public async approveTask(taskId: string): Promise<void> {
    try {
      // 1. Buscar dados da tarefa
      const { data: task, error: taskError } = await supabase
        .from('agent_tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError || !task) {
        throw new Error(`Tarefa não encontrada: ${taskError?.message}`);
      }

      // 2. Salvar conteúdo gerado na tabela spiritual_regions
      if (task.result_data && task.region_id) {
        console.log('💾 Salvando conteúdo gerado na tabela spiritual_regions...');
        
        // Usar dados já processados e convertidos no processTaskResult()
        const processedData = task.result_data;
        
        const updateData: any = {};
        
        // Dependendo do tipo de tarefa, salvar no campo apropriado
        switch (task.task_type) {
          case 'spiritual_data':
            updateData.spiritual_data = processedData;
            break;
          case 'prayer_points':
            updateData.prayer_points = processedData;
            break;
          case 'cultural_context':
            updateData.cultural_context = processedData;
            break;
          case 'historical_context':
            updateData.historical_context = processedData;
            break;
          case 'demographic_data':
            updateData.demographic_data = processedData;
            break;
          case 'economic_context':
            updateData.economic_context = processedData;
            break;
          case 'religious_mapping':
            updateData.religious_mapping = processedData;
            break;
        }

        // Atualizar região com dados gerados
        const { error: regionError } = await supabase
          .from('spiritual_regions')
          .update(updateData)
          .eq('id', task.region_id);

        if (regionError) {
          console.error('❌ Erro ao salvar na spiritual_regions:', regionError);
          throw regionError;
        }

        console.log('✅ Conteúdo salvo na spiritual_regions com sucesso!');
      }

      // 3. Atualizar status da tarefa para completed
      await supabase
        .from('agent_tasks')
        .update({
          user_approved: true,
          approved_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', taskId);

      console.log('✅ Tarefa aprovada e conteúdo salvo com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao aprovar tarefa:', error);
      throw this.createError('TASK_APPROVAL_FAILED', `Erro ao aprovar tarefa: ${error}`, { taskId });
    }
  }

  public async rejectTask(taskId: string, reason: string): Promise<void> {
    try {
      await supabase
        .from('agent_tasks')
        .update({
          user_approved: false,
          rejection_reason: reason,
          status: 'cancelled'
        })
        .eq('id', taskId);
    } catch (error) {
      throw this.createError('TASK_REJECTION_FAILED', `Erro ao rejeitar tarefa: ${error}`, { taskId, reason });
    }
  }

  // 8. ESTATÍSTICAS E MONITORAMENTO
  // =====================================================
  public async getStatistics(): Promise<AgentStatistics> {
    try {
      const { data, error } = await supabase
        .from('agent_tasks')
        .select('status, tokens_used, processing_time_ms, confidence_score, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Últimos 30 dias

      if (error) throw error;

      const tasks = data || [];
      const completed = tasks.filter(t => t.status === 'completed');
      const failed = tasks.filter(t => t.status === 'failed');
      const pending = tasks.filter(t => ['pending', 'processing', 'awaiting_approval'].includes(t.status));

      const totalTokens = tasks.reduce((sum, t) => sum + (t.tokens_used || 0), 0);
      const totalProcessingTime = tasks.reduce((sum, t) => sum + (t.processing_time_ms || 0), 0);
      const avgConfidence = completed.length > 0 ? 
        completed.reduce((sum, t) => sum + (t.confidence_score || 0), 0) / completed.length : 0;

      return {
        total_tasks: tasks.length,
        completed_tasks: completed.length,
        failed_tasks: failed.length,
        pending_tasks: pending.length,
        success_rate: tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0,
        total_tokens: totalTokens,
        estimated_cost: totalTokens * this.config.gpt4o_cost_per_token,
        average_confidence: Math.round(avgConfidence),
        total_processing_time: totalProcessingTime
      };
    } catch (error) {
      throw this.createError('STATISTICS_FETCH_FAILED', `Erro ao buscar estatísticas: ${error}`);
    }
  }

  // 9. UTILITÁRIOS INTERNOS
  // =====================================================
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    if (now > this.rateLimitTracker.resetTime) {
      this.rateLimitTracker.requests = 0;
      this.rateLimitTracker.resetTime = now + 60000;
    }

    if (this.rateLimitTracker.requests >= this.config.max_requests_per_minute) {
      const waitTime = this.rateLimitTracker.resetTime - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.rateLimitTracker.requests = 0;
      this.rateLimitTracker.resetTime = Date.now() + 60000;
    }

    this.rateLimitTracker.requests++;
  }

  private createError(code: string, message: string, details?: any): AgentError {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      task_id: details?.taskId,
      session_id: details?.sessionId
    };
  }

  public cancelAllRequests(): void {
    for (const [taskId, controller] of this.activeRequests) {
      controller.abort();
      this.activeRequests.delete(taskId);
    }
  }

  // 10. MÉTODOS DE APROVAÇÃO EM LOTE
  // =====================================================
  public async approvePendingTasks(): Promise<{ approved: number; failed: number }> {
    try {
      console.log('🔄 Buscando tarefas pendentes de aprovação...');
      
      const { data: pendingTasks, error } = await supabase
        .from('agent_tasks')
        .select('id, region_id, task_type')
        .eq('status', 'awaiting_approval')
        .eq('user_approved', false);

      if (error) throw error;

      if (!pendingTasks || pendingTasks.length === 0) {
        console.log('ℹ️ Nenhuma tarefa pendente encontrada');
        return { approved: 0, failed: 0 };
      }

      console.log(`📋 Encontradas ${pendingTasks.length} tarefas pendentes`);
      
      let approved = 0;
      let failed = 0;

      for (const task of pendingTasks) {
        try {
          await this.approveTask(task.id);
          approved++;
          console.log(`✅ Tarefa ${task.id} aprovada (${task.task_type})`);
        } catch (error) {
          failed++;
          console.error(`❌ Falha ao aprovar tarefa ${task.id}:`, error);
        }
      }

      console.log(`🎉 Processamento concluído: ${approved} aprovadas, ${failed} falharam`);
      return { approved, failed };
    } catch (error) {
      console.error('❌ Erro ao aprovar tarefas pendentes:', error);
      throw this.createError('BULK_APPROVAL_FAILED', `Erro ao aprovar tarefas pendentes: ${error}`);
    }
  }

  // 11. MÉTODOS PÚBLICOS ADICIONAIS
  // =====================================================
  public async testConnection(): Promise<boolean> {
    try {
      if (!this.config.openai_api_key) {
        console.warn('⚠️ API Key não configurada');
        return false;
      }

      console.log('🔄 Testando conexão OpenAI...');
      
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.config.openai_api_key}`,
          'Content-Type': 'application/json'
        }
      });
      
      const success = response.ok;
      console.log(success ? '✅ Conexão OpenAI OK' : '❌ Falha na conexão OpenAI');
      return success;
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      return false;
    }
  }

  public estimateCost(tokens: number, model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o'): number {
    const costPerToken = model === 'gpt-4o' ? this.config.gpt4o_cost_per_token : this.config.gpt4o_mini_cost_per_token;
    return tokens * costPerToken;
  }

  public updateConfig(newConfig: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): AgentConfig {
    return { ...this.config };
  }
}

// 11. INSTÂNCIA SINGLETON E EXPORTAÇÃO
// =====================================================
const advancedAgentService = new AdvancedAgentService();

export default advancedAgentService;
export { AdvancedAgentService };
export type { AgentConfig, AgentEventCallbacks }; 