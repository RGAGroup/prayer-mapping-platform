import OpenAI from 'openai';

// Interface para dados espirituais gerados pela IA
interface SpiritualData {
  strongholds: string[];
  propheticWord: string;
  prayerTargets: Array<{
    title: string;
    description: string;
    category: 'government' | 'church' | 'social' | 'economic' | 'spiritual_warfare' | 'evangelism' | 'other';
    priority: number;
    spiritualContext: string;
  }>;
  spiritualAlerts: Array<{
    type: 'persecution' | 'idolatry' | 'warfare' | 'breakthrough' | 'revival';
    description: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    prayerFocus: string;
  }>;
  geopoliticalSystem: {
    governmentType: string;
    keyPositions: string[];
    powerCenters: string[];
    dominantPhilosophy: string;
  };
  spiritualInfluences: Array<{
    name: string;
    manifestation: string;
    counterStrategy: string;
  }>;
  missionBases: Array<{
    name: string;
    organization: string;
    focus: string;
    impact: string;
  }>;
  revivalTestimonies: Array<{
    title: string;
    description: string;
    year: string;
    impact: string;
  }>;
  intercessorActions: string[];
  spiritualClimate: {
    description: string;
    challenges: string[];
    opportunities: string[];
    trends: string[];
  };
  churches: {
    estimate: number;
    denominations: string[];
    growth: string;
    spiritualTemperature: string;
  };
  culturalContext: string;
  languagesSpoken: string[];
  religiousComposition: Record<string, number>;
}

interface AIGenerationRequest {
  regionName: string;
  regionType: 'country' | 'state' | 'city' | 'neighborhood';
  countryCode?: string;
  parentRegion?: string;
  coordinates?: { lat: number; lng: number };
  context?: string;
}

class AIService {
  private openai: OpenAI | null = null;
  private isConfigured = false;
  private assistantId = 'asst_IHcyezjYgoubvHpqcJjwvt1n'; // Your registered assistant

  constructor() {
    console.log('🤖 AI Service inicializado');
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    // Use environment variable for API key (Vite only)
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ Chave API da OpenAI não configurada. Funcionalidade AI desabilitada.');
      this.isConfigured = false;
      return;
    }
    
    try {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
      this.isConfigured = true;
      console.log('✅ OpenAI Assistant configurado com sucesso');
      console.log(`🎯 Assistant ID: ${this.assistantId}`);
    } catch (error) {
      console.error('❌ Erro ao configurar OpenAI:', error);
      this.isConfigured = false;
    }
  }

  public setApiKey(apiKey: string) {
    // This method is kept for compatibility but now uses the secure key
    console.log('⚠️ Usando chave API pré-configurada para segurança');
    this.initializeOpenAI();
  }

  public isReady(): boolean {
    return this.isConfigured && !!this.openai;
  }

  public async generateSpiritualData(request: AIGenerationRequest): Promise<SpiritualData> {
    if (!this.isReady()) {
      throw new Error('AI Service não configurado.');
    }

    try {
      console.log(`🤖 Iniciando geração com Assistant personalizado para ${request.regionName}...`);
      console.log(`🎯 Assistant ID: ${this.assistantId}`);

      // 1. Criar thread
      console.log('📝 Passo 1: Criando thread...');
      const thread = await this.openai!.beta.threads.create();
      console.log(`✅ Thread criado: ${thread.id}`);

      // Create the prompt message
      const prompt = this.buildPrompt(request);

      // 2. Adicionar mensagem do usuário ao thread
      console.log('📤 Passo 2: Adicionando mensagem ao thread...');
      await this.openai!.beta.threads.messages.create(thread.id, {
        role: "user",
        content: prompt,
      });
      console.log('✅ Mensagem adicionada ao thread');

      // 3. Executar o assistente
      console.log('🚀 Passo 3: Executando assistant...');
      const run = await this.openai!.beta.threads.runs.create(thread.id, {
        assistant_id: this.assistantId
      });
      console.log(`✅ Run criado: ${run.id}`);

      // 4. Aguardar conclusão (polling)
      console.log('⏳ Passo 4: Aguardando resposta do assistant...');
      let runStatus = run;
      let attempts = 0;
      const maxAttempts = 60; // 60 segundos timeout

      while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
        if (attempts >= maxAttempts) {
          throw new Error('⏰ Timeout: Assistant demorou muito para responder');
        }

        console.log(`⏳ Status: ${runStatus.status} (tentativa ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Alternative approach: use the runs object with correct parameters
        try {
          runStatus = await this.openai!.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
        } catch (retrieveError) {
          console.warn('⚠️ Retrieve error, trying alternative approach:', retrieveError);
          // Try fetching all runs and find the one we want
          const runs = await this.openai!.beta.threads.runs.list(thread.id);
          const currentRun = runs.data.find(r => r.id === run.id);
          if (currentRun) {
            runStatus = currentRun;
          } else {
            throw new Error('❌ Could not find run status');
          }
        }
        attempts++;
      }

      console.log(`🏁 Status final: ${runStatus.status}`);

      // 5. Verificar se completou com sucesso
      if (runStatus.status === 'completed') {
        console.log('📥 Passo 5: Obtendo resposta do assistant...');
        
        // Buscar as mensagens do thread
        const messages = await this.openai!.beta.threads.messages.list(thread.id);
        
        // Pegar a última mensagem (resposta do assistant)
        const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
        
        if (assistantMessage && assistantMessage.content[0] && assistantMessage.content[0].type === 'text') {
          const content = assistantMessage.content[0].text.value;
          console.log('✅ Resposta do assistant recebida');
          console.log(`📝 Tamanho da resposta: ${content.length} caracteres`);

          // Clean and parse JSON
          let cleanContent = content.trim();
          
          // Remove markdown formatting if present
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          // Try to find JSON content between { and }
          const jsonStart = cleanContent.indexOf('{');
          const jsonEnd = cleanContent.lastIndexOf('}');
          
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
          }

          console.log('🔄 Parseando JSON...');
          const spiritualData = JSON.parse(cleanContent) as SpiritualData;
          
          console.log(`🎉 Dados gerados com sucesso para ${request.regionName}!`);
          return spiritualData;
        } else {
          throw new Error('❌ Resposta do assistant não encontrada ou em formato inválido');
        }
      } else if (runStatus.status === 'failed') {
        console.error('❌ Run falhou:', runStatus.last_error);
        throw new Error(`Assistant falhou: ${runStatus.last_error?.message || 'Erro desconhecido'}`);
      } else if (runStatus.status === 'expired') {
        throw new Error('⏰ Assistant expirou - tempo limite excedido');
      } else {
        throw new Error(`❌ Run terminou com status inesperado: ${runStatus.status}`);
      }

    } catch (error) {
      console.error('💥 Erro na geração AI:', error);
      throw new Error(`Falha na geração AI: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private buildPrompt(request: AIGenerationRequest): string {
    const { regionName, regionType, countryCode, parentRegion, context } = request;
    
    return `
⚠️ ATENÇÃO: Use APENAS informações factuais e padrões gerais. NÃO INVENTE dados específicos.

REGIÃO: ${regionName}
TIPO: ${regionType}
${countryCode ? `PAÍS: ${countryCode}` : ''}
${parentRegion ? `REGIÃO PAI: ${parentRegion}` : ''}
${context ? `CONTEXTO: ${context}` : ''}

Retorne um JSON com a seguinte estrutura, usando APENAS informações gerais e conservadoras:

{
  "strongholds": ["Use termos gerais como 'corrupção', 'idolatria', 'secularismo'"],
  "propheticWord": "Palavra profética geral baseada em princípios bíblicos universais",
  "prayerTargets": [
    {
      "title": "Alvos genéricos de oração",
      "description": "Descrições baseadas em padrões conhecidos",
      "category": "government|church|social|economic|spiritual_warfare|evangelism|other",
      "priority": 1-5,
      "spiritualContext": "Contexto espiritual geral"
    }
  ],
  "spiritualAlerts": [
    {
      "type": "persecution|idolatry|warfare|breakthrough|revival",
      "description": "Alertas baseados em padrões regionais conhecidos",
      "urgency": "low|medium|high|critical",
      "prayerFocus": "Foco genérico de oração"
    }
  ],
  "geopoliticalSystem": {
    "governmentType": "Tipo de governo conhecido (república, monarquia, etc.)",
    "keyPositions": ["Cargos genéricos como 'Presidente', 'Primeiro-ministro'"],
    "powerCenters": ["Locais genéricos como 'Capital', 'Centro político'"],
    "dominantPhilosophy": "Filosofias amplas conhecidas"
  },
  "spiritualInfluences": [
    {
      "name": "Influências espirituais gerais (sem nomes específicos inventados)",
      "manifestation": "Manifestações gerais observáveis",
      "counterStrategy": "Estratégias bíblicas gerais"
    }
  ],
  "missionBases": [
    {
      "name": "Use termos genéricos como 'Organizações missionárias locais'",
      "organization": "Denominações conhecidas geralmente presentes",
      "focus": "Focos ministeriais comuns",
      "impact": "Impactos típicos gerais"
    }
  ],
  "revivalTestimonies": [
    {
      "title": "Movimentos gerais conhecidos da região (se existirem)",
      "description": "Descrições baseadas em padrões históricos conhecidos",
      "year": "Use apenas períodos amplos se não souber exato",
      "impact": "Impactos gerais documentados"
    }
  ],
  "intercessorActions": [
    "Ações genéricas de intercessão baseadas em princípios bíblicos",
    "Orientações gerais de oração territorial",
    "Diretrizes espirituais universais"
  ],
  "spiritualClimate": {
    "description": "Análise geral baseada em padrões regionais conhecidos",
    "challenges": ["Desafios comuns a regiões similares"],
    "opportunities": ["Oportunidades baseadas em tendências conhecidas"],
    "trends": ["Tendências observáveis ou documentadas"]
  },
  "churches": {
    "estimate": "Use estimativas gerais conservadoras ou 'não disponível'",
    "denominations": ["Denominações tipicamente presentes na região"],
    "growth": "crescendo|estável|declinando (baseado em tendências conhecidas)",
    "spiritualTemperature": "Avaliação geral conservadora"
  },
  "culturalContext": "Contexto cultural geral conhecido da região",
  "languagesSpoken": ["Idiomas oficiais e principais conhecidos"],
  "religiousComposition": {
    "cristianismo": "Use apenas percentuais conhecidos ou estimativas muito gerais",
    "islamismo": "percentual",
    "outras_religioes": "percentual",
    "ocultismo": "percentual"
  }
}

🚨 INSTRUÇÕES CRÍTICAS:
1. NÃO invente nomes específicos de pessoas, organizações ou eventos
2. Use APENAS informações factuais conhecidas ou termos genéricos
3. Se não souber dados específicos, use frases como "Tipicamente", "Em geral", "Comumente"
4. Para estatísticas, use apenas dados conhecidos ou indique "Estimativa geral"
5. Mantenha tom respeitoso e baseado em princípios bíblicos
6. JSON deve ser válido e parseável
7. Seja conservador e factual em todas as informações
`;
  }

  public async generateBatchData(regions: AIGenerationRequest[]): Promise<Array<{
    request: AIGenerationRequest;
    data?: SpiritualData;
    error?: string;
  }>> {
    const results = [];
    
    for (const request of regions) {
      try {
        const data = await this.generateSpiritualData(request);
        results.push({ request, data });
        
        // Pequeno delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          request,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
    
    return results;
  }
}

// Instância singleton
export const aiService = new AIService();

export type { SpiritualData, AIGenerationRequest }; 