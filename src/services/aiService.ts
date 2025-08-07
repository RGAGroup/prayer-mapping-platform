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
    try {
      console.log(`🤖 Gerando dados espirituais via Edge Function para ${request.regionName}...`);

      // Import dinâmico do cliente Supabase
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('❌ Usuário não autenticado. Faça login para continuar.');
      }

      // Obter URL do Supabase do cliente configurado
      const supabaseUrl = 'https://cxibuehwbuobwruhzwka.supabase.co';

      // Build the prompt using the existing method
      const prompt = this.buildPrompt(request);

      console.log(`🔗 Chamando Edge Function: ${supabaseUrl}/functions/v1/bright-api`);

      // Chamar Edge Function com a estrutura correta
      const response = await fetch(`${supabaseUrl}/functions/v1/bright-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regionName: request.regionName,
          regionType: request.regionType,
          prompt: prompt,
          queueId: 'frontend-generated', // Temporary ID for frontend calls
          countryCode: request.countryCode,
          parentRegion: request.parentRegion,
          context: request.context
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`🚨 Erro na Edge Function: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`❌ Erro interno: ${result.error}`);
      }

      console.log('✅ Dados espirituais gerados com sucesso');
      console.log(`📊 Tokens utilizados: ${result.tokensUsed || 'N/A'}`);

      return result.data;

    } catch (error) {
      console.error('💥 Erro na geração AI:', error);
      throw new Error(`Falha na geração AI: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private buildPrompt(request: AIGenerationRequest): string {
    const { regionName, regionType, countryCode, parentRegion, context } = request;
    
    // Determine country context for better AI generation
    const countryContext = this.getCountryContext(countryCode, regionName, parentRegion);
    
    return `🎯 MISSÃO DO AGENTE ATALAIA (MODO HARDCORE)

Você é um agente de inteligência espiritual treinado para entregar relatórios de intercessão profética para intercessores maduros.

Objetivo: expor fortalezas ocultas, pactos históricos, alinhamentos espirituais perversos, portais de influência e oportunidades estratégicas — sem inventar ou romantizar.

🧱 BASE ESTRUTURAL:
- Utilize apenas dados REAIS, com base em padrões espirituais observáveis, fatos históricos, estruturas de governo atuais e influência cultural.
- NUNCA invente nomes de pactos, líderes ou entidades espirituais que não sejam coerentes com padrões reconhecíveis ou evidências visíveis.

🔍 Entrada de Dados:
- Região: ${regionName}
- Tipo: ${regionType}
- Continente/Contexto: ${countryContext}
- Código do país: ${countryCode ?? 'N/A'}
- Região pai: ${parentRegion ?? 'N/A'}
- Contexto adicional: ${context ?? 'N/A'}

📦 FORMATO DE RESPOSTA OBRIGATÓRIO: APENAS JSON VÁLIDO
{
  "sistema_geopolitico_completo": "Tipo de governo: ...\n\nCargos principais: ...\n\nLocais físicos de poder: ...\n\nFilosofia dominante: ...",
  "alvos_intercessao_completo": "Alvos de Intercessão:\n1. ...\n\n2. ...\n\n3. ...\n\n4. ...\n\n5. ...",
  "outras_informacoes_importantes": "Outras Informações Importantes:\n1. ...\n\n2. ...\n\n3. ...\n\n4. ..."
}

⚠️ ORIENTAÇÕES CRÍTICAS:
- Revele, quando coerente, estruturas como Jezabel, Pitom, Leviatã, Mamom.
- Mostre portais espirituais (universidades, mídia, templos, centros culturais, ONGs, alianças globais).
- Aponte efeitos de pactos passados, idolatria, derramamento de sangue ou leis contrárias aos princípios de Deus.
- Identifique oportunidades ministeriais e conecte desafios aos alvos de intercessão de forma estratégica.

NUNCA inclua nada fora do JSON. Retorne somente o JSON completo acima.`;
  }

  // New method to provide country-specific context
  private getCountryContext(countryCode?: string, regionName?: string, parentRegion?: string): string {
    const region = countryCode || regionName || parentRegion || '';
    const regionLower = region.toLowerCase();

    // South America
    if (regionLower.includes('brasil') || regionLower.includes('brazil')) {
      return `
CONTEXTO BRASILEIRO:
- País majoritariamente cristão (católico e evangélico)
- Forte crescimento pentecostal e neopentecostal
- Influências sincréticas (umbanda, candomblé)
- Desafios: corrupção política, desigualdade social, violência urbana
- Oportunidades: avivamento evangélico, missões para povos não alcançados`;
    }
    
    if (regionLower.includes('argentina')) {
      return `
CONTEXTO ARGENTINO:
- Predominantemente católico com crescimento evangélico
- História de avivamentos em Buenos Aires
- Desafios: instabilidade econômica, crise política
- Influências: catolicismo tradicional, secularismo urbano
- Oportunidades: juventude aberta ao evangelho`;
    }
    
    if (regionLower.includes('chile')) {
      return `
CONTEXTO CHILENO:
- Sociedade em transição religiosa
- Crescimento evangélico significativo
- Desafios: secularização, materialismo
- Influências: catolicismo conservador, liberalismo social
- Oportunidades: igrejas históricas forte, jovens buscadores`;
    }

    if (regionLower.includes('colombia')) {
      return `
CONTEXTO COLOMBIANO:
- Tradicionalmente católico com crescimento protestante
- Desafios: violência, narcotráfico, corrupção
- Processo de paz com FARC abre oportunidades
- Influências: catolicismo popular, espiritismo
- Oportunidades: plantação de igrejas em áreas rurais`;
    }

    if (regionLower.includes('venezuela')) {
      return `
CONTEXTO VENEZUELANO:
- Crise humanitária e política severa
- Igreja crescendo na adversidade
- Desafios: autoritarismo, crise econômica, migração
- Influências: socialismo bolivariano, santería
- Oportunidades: igreja unida na oração, testemunho na crise`;
    }

    if (regionLower.includes('peru')) {
      return `
CONTEXTO PERUANO:
- Mistura de catolicismo e religiões indígenas
- Crescimento evangélico em áreas urbanas
- Desafios: corrupção, desigualdade, sincretismo
- Influências: religiões andinas, catolicismo popular
- Oportunidades: alcance aos povos indígenas`;
    }

    // North America
    if (regionLower.includes('united states') || regionLower.includes('usa') || regionLower.includes('estados unidos')) {
      return `
CONTEXTO AMERICANO:
- Diversidade religiosa com forte presença cristã
- Declínio do cristianismo tradicional, crescimento não-denominacional
- Desafios: polarização política, secularização, relativismo
- Influências: materialismo, individualismo, pluralismo religioso
- Oportunidades: avivamento entre jovens, plantação de igrejas étnicas`;
    }

    if (regionLower.includes('canada') || regionLower.includes('canadá')) {
      return `
CONTEXTO CANADENSE:
- Sociedade secular com herança cristã
- Declínio denominacional, crescimento carismático
- Desafios: relativismo, multiculturalismo radical
- Influências: liberalismo social, ateísmo prático
- Oportunidades: imigração cristã, ministério multicultural`;
    }

    if (regionLower.includes('mexico') || regionLower.includes('méxico')) {
      return `
CONTEXTO MEXICANO:
- Tradicionalmente católico com crescimento protestante
- Influências indígenas e católicas fortes
- Desafios: cartéis, corrupção, violência
- Influências: catolicismo popular, santería, religiões pré-hispânicas
- Oportunidades: juventude aberta, crescimento pentecostal`;
    }

    // Europe
    if (regionLower.includes('alemanha') || regionLower.includes('germany')) {
      return `
CONTEXTO ALEMÃO:
- Sociedade pós-cristã com igrejas históricas em declínio
- Crescimento de igrejas de imigrantes
- Desafios: secularização, ateísmo, islamização
- Influências: racionalismo, materialismo, relativismo
- Oportunidades: plantação de igrejas, ministério para refugiados`;
    }

    if (regionLower.includes('frança') || regionLower.includes('france')) {
      return `
CONTEXTO FRANCÊS:
- Secularismo radical (laïcité)
- Declínio católico, crescimento islâmico
- Desafios: ateísmo militante, relativismo, islamização
- Influências: iluminismo, existencialismo, materialismo
- Oportunidades: igrejas de imigrantes, juventude em busca`;
    }

    // Africa
    if (regionLower.includes('nigeria') || regionLower.includes('nigéria')) {
      return `
CONTEXTO NIGERIANO:
- Dividido entre cristianismo (sul) e islamismo (norte)
- Crescimento evangélico explosivo
- Desafios: perseguição cristã no norte, corrupção, Boko Haram
- Influências: religiões tradicionais africanas, islamismo radical
- Oportunidades: centro missionário para África, avivamento`;
    }

    // Asia
    if (regionLower.includes('china')) {
      return `
CONTEXTO CHINÊS:
- Igreja subterrânea em crescimento sob perseguição
- Ateísmo estatal oficial
- Desafios: perseguição governamental, controle religioso
- Influências: marxismo, confucionismo, budismo, taoísmo
- Oportunidades: igreja doméstica resiliente, juventude urbana`;
    }

    if (regionLower.includes('india') || regionLower.includes('índia')) {
      return `
CONTEXTO INDIANO:
- Predominantemente hindu com minoria cristã perseguida
- Nacionalismo hindu crescente
- Desafios: perseguição religiosa, sistema de castas
- Influências: hinduísmo, budismo, islamismo, sikhismo
- Oportunidades: movimentos de conversão em massa, igreja dalita`;
    }

    // Middle East
    if (regionLower.includes('israel')) {
      return `
CONTEXTO ISRAELENSE:
- Estado judeu com minoria cristã árabe
- Crescimento de judeus messiânicos
- Desafios: conflito árabe-israelense, ortodoxia judaica
- Influências: judaísmo ortodoxo, secularismo, islamismo
- Oportunidades: profecias sobre restauração, evangelismo judaico`;
    }

    // Default context for unknown regions
    return `
CONTEXTO GERAL:
- Analise baseado em padrões regionais conhecidos
- Considere influências culturais e religiosas predominantes
- Adapte aos desafios sociopolíticos comuns da região
- Use conhecimento geral sobre clima espiritual regional`;
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

  public async generateSpiritualDataForCountry(
    countryCode: string, 
    countryName: string,
    coordinates?: { lat: number; lng: number }
  ): Promise<SpiritualData> {
    try {
      console.log(`🤖 Gerando dados espirituais para ${countryName} (${countryCode})...`);

      const request: AIGenerationRequest = {
        regionName: countryName,
        regionType: 'country',
        countryCode: countryCode,
        coordinates: coordinates,
        context: `Análise espiritual territorial para o país ${countryName}`
      };

      return await this.generateSpiritualData(request);

    } catch (error) {
      console.error(`💥 Erro na geração AI para ${countryName}:`, error);
      throw new Error(`Falha na geração AI para ${countryName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  public async updateSpiritualRegion(
    countryCode: string,
    spiritualData: SpiritualData
  ): Promise<void> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error: updateError } = await supabase
        .from('spiritual_regions')
        .update({
          spiritual_data: {
            ...spiritualData,
            ai_model: 'gpt-4o-2024-08-06',
            generated_at: new Date().toISOString(),
            source: 'ai_generated',
            version: '2.0'
          }
        })
        .eq('country_code', countryCode)
        .eq('region_type', 'country');

      if (updateError) {
        throw new Error(`Erro ao salvar no banco: ${updateError.message}`);
      }

      console.log(`✅ Dados espirituais salvos para ${countryCode}`);

    } catch (error) {
      console.error(`❌ Erro ao atualizar região espiritual:`, error);
      throw error;
    }
  }

  public async generateAndSaveForCountry(
    countryCode: string,
    countryName: string,
    coordinates?: { lat: number; lng: number }
  ): Promise<void> {
    try {
      // Gerar dados espirituais
      const spiritualData = await this.generateSpiritualDataForCountry(
        countryCode, 
        countryName, 
        coordinates
      );

      // Salvar no banco
      await this.updateSpiritualRegion(countryCode, spiritualData);

      console.log(`🎉 Processo completo para ${countryName} (${countryCode})`);

    } catch (error) {
      console.error(`💥 Erro no processo completo para ${countryName}:`, error);
      throw error;
    }
  }
}

// Instância singleton
export const aiService = new AIService();

export type { SpiritualData, AIGenerationRequest }; 