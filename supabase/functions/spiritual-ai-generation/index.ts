import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SpiritualData {
  strongholds: string[];
  propheticWord: string;
  prayerTargets: Array<{
    title: string;
    description: string;
    category: string;
    priority: number;
    spiritualContext: string;
  }>;
  spiritualAlerts: Array<{
    type: string;
    description: string;
    urgency: string;
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

const buildPropheticPrompt = (request: AIGenerationRequest): string => {
  const { regionName, regionType, countryCode, parentRegion } = request;
  const countryCtx = getRegionContext(regionName, countryCode, parentRegion);

  return `🎯 MISSÃO DO AGENTE ATALAIA (MODO HARDCORE)

Você é um agente de inteligência espiritual treinado para entregar relatórios de intercessão profética para intercessores maduros.

Objetivo: expor fortalezas ocultas, pactos históricos, alinhamentos espirituais perversos, portais de influência e oportunidades estratégicas de intercessão — sem inventar ou romantizar.

🧱 BASE ESTRUTURAL:
- Utilize apenas dados REAIS, baseados em padrões espirituais observáveis, fatos históricos, estruturas de governo atuais e influência cultural.
- NUNCA invente nomes de pactos, líderes ou entidades espirituais que não sejam coerentes com padrões reconhecíveis ou evidências visíveis.

🔍 Entrada:
- Região: ${regionName}
- Tipo: ${regionType}
- Código do país: ${countryCode ?? 'N/A'}
- Região pai: ${parentRegion ?? 'N/A'}
- Contexto: ${countryCtx}

📦 FORMATO DE RESPOSTA OBRIGATÓRIO (APENAS JSON VÁLIDO):
{
  "sistema_geopolitico_completo": "Tipo de governo: ...\n\nCargos principais: ...\n\nLocais físicos de poder: ...\n\nFilosofia dominante: ...",
  "alvos_intercessao_completo": "Alvos de Intercessão:\n1. ...\n\n2. ...\n\n3. ...\n\n4. ...\n\n5. ...",
  "outras_informacoes_importantes": "Outras Informações Importantes:\n1. ...\n\n2. ...\n\n3. ...\n\n4. ..."
}

⚠️ ORIENTAÇÕES CRÍTICAS:
- Revele estruturas de influência demoníaca como Jezabel, Pitom, Leviatã, Mamom somente quando fizer sentido para o território.
- Mostre portais espirituais (universidades, mídia, templos, centros culturais, ONGs, alianças globais).
- Indique consequências de pactos passados, idolatria, derramamento de sangue ou leis contrárias aos princípios de Deus.
- Identifique focos de avivamento e oportunidades ministeriais.
- Conecte desafios aos alvos de intercessão de forma estratégica.

NUNCA escreva nada fora do JSON. Responda somente com o JSON completo acima.`;
};

const getRegionContext = (regionName: string, countryCode?: string, parentRegion?: string): string => {
  // Contextos específicos por região - versão simplificada para Edge Function
  const contexts: Record<string, string> = {
    'Brasil': 'País majoritariamente cristão, centro de missões na América Latina, desafios políticos e sociais.',
    'Argentina': 'País católico tradicional, movimento pentecostal crescente, centro financeiro regional.',
    'Chile': 'País estável economicamente, influência secular crescente, igreja evangélica ativa.',
    'Colombia': 'País católico, desafios de violência e narcotráfico, igreja em crescimento.',
    'Peru': 'País católico com sincretismo, herança inca, igreja evangélica emergente.',
    'Venezuela': 'Crise política e econômica, perseguição religiosa, necessidade urgente de intercessão.',
    'Estados Unidos': 'Nação com herança cristã, polarização política, centro mundial de missões.',
    'México': 'País católico tradicional, movimento evangélico crescente, desafios de violência.',
    'Canadá': 'Nação secular, declínio cristão, liberdades religiosas em risco.'
  }

  return contexts[regionName] || `Região ${regionName} - análise espiritual necessária para intercessão estratégica.`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { regionName, regionType, prompt, queueId, countryCode, parentRegion, context } = await req.json()
    
    // Validação dos dados obrigatórios
    if (!regionName || !regionType) {
      console.error('❌ Dados obrigatórios faltando:', { regionName, regionType });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid request data: regionName and regionType are required" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📥 Dados recebidos:', {
      regionName,
      regionType,
      queueId,
      countryCode,
      parentRegion,
      context,
      hasPrompt: !!prompt
    });
    
    // Criar cliente Supabase com service role para RLS bypass
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log(`🚀 Processando: ${regionName} (${regionType})`)

    // Se tem queueId, atualizar status para processing
    if (queueId && queueId !== 'frontend-generated') {
      await supabase
        .from('ai_processing_queue')
        .update({ 
          status: 'processing',
          started_at: new Date().toISOString()
        })
        .eq('id', queueId)
    }

    // Build prompt if not provided (for direct frontend calls)
    const finalPrompt = prompt || buildPropheticPrompt({
      regionName,
      regionType: regionType as 'country' | 'state' | 'city' | 'neighborhood',
      countryCode,
      parentRegion,
      context
    });

    // Validar API Key
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('API Key OpenAI não configurada no ambiente');
    }
    
    // Limpar API Key de caracteres especiais (se houver)
    const cleanApiKey = apiKey.trim().replace(/[^\w\-\.]/g, '');
    console.log('🔑 API Key encontrada, tamanho:', apiKey.length);

    // Validar formato da API Key OpenAI
    if (!cleanApiKey.startsWith('sk-')) {
      throw new Error('Formato inválido da API Key OpenAI');
    }

    // Construir headers de forma mais segura
    const requestHeaders = new Headers();
    requestHeaders.set('Authorization', `Bearer ${cleanApiKey}`);
    requestHeaders.set('Content-Type', 'application/json');

    // Chamar OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        model: 'gpt-4o-2024-08-06',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em mapeamento espiritual territorial profético. Responda SEMPRE em formato JSON válido seguindo exatamente a estrutura solicitada. Base suas análises em dados verificáveis e discernimento espiritual sólido.'
          },
          {
            role: 'user',
            content: finalPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`Erro OpenAI: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const aiContent = openaiData.choices[0].message.content

    let parsedResponse: SpiritualData
    try {
      parsedResponse = JSON.parse(aiContent)
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta:', parseError)
      throw new Error('Resposta da IA não está em formato JSON válido')
    }

    console.log(`✅ IA processou: ${regionName}`)

    // Se tem queueId válido, atualizar queue como completed
    if (queueId && queueId !== 'frontend-generated') {
      const { error: queueError } = await supabase
        .from('ai_processing_queue')
        .update({ 
          status: 'completed',
          ai_response: parsedResponse,
          completed_at: new Date().toISOString(),
          tokens_used: openaiData.usage?.total_tokens || 0,
          cost_usd: (openaiData.usage?.total_tokens || 0) * 0.00015
        })
        .eq('id', queueId)

      if (queueError) {
        console.error('❌ Erro atualizando queue:', queueError)
      }
    }

    // SALVAR DIRETO EM spiritual_regions (BYPASS RLS)
    const { data: existingRegion } = await supabase
      .from('spiritual_regions')
      .select('id')
      .eq('name', regionName)
      .eq('region_type', regionType)
      .single()

    const regionData = {
      name: regionName,
      region_type: regionType,
      spiritual_data: parsedResponse,
      data_source: 'ai_generated',
      status: 'approved',
      updated_at: new Date().toISOString()
    }

    let spiritualRegionError: any = null

    if (existingRegion) {
      // Atualizar registro existente
      const { error } = await supabase
        .from('spiritual_regions')
        .update(regionData)
        .eq('id', existingRegion.id)
      
      spiritualRegionError = error
    } else {
      // Inserir novo registro
      const { error } = await supabase
        .from('spiritual_regions')
        .insert([regionData])
      
      spiritualRegionError = error
    }

    if (spiritualRegionError) {
      console.error('❌ Erro salvando spiritual_regions:', spiritualRegionError)
      
      // Se RLS bloquear, pelo menos salvar na queue para transferência manual
      console.log('⚠️ Dados salvos apenas na queue devido a RLS')
    } else {
      console.log(`✨ Novo registro criado para ${regionName}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: parsedResponse, // Return parsed data for frontend
        message: `Dados espirituais gerados para ${regionName}`,
        tokensUsed: openaiData.usage?.total_tokens || 0,
        dataLocation: spiritualRegionError ? 'queue_only' : 'spiritual_regions'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro na edge function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getCountryCode(regionName: string): string {
  const countryMap: { [key: string]: string } = {
    'United States': 'US',
    'Mexico': 'MX',
    'Canada': 'CA',
    'Brazil': 'BR',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Colombia': 'CO',
    'Peru': 'PE',
    'Venezuela': 'VE',
    'Ecuador': 'EC',
    'Bolivia': 'BO',
    'Paraguay': 'PY',
    'Uruguay': 'UY',
    'Guatemala': 'GT',
    'Honduras': 'HN',
    'El Salvador': 'SV',
    'Nicaragua': 'NI',
    'Costa Rica': 'CR',
    'Panama': 'PA',
    'Guyana': 'GY',
    'Suriname': 'SR'
  }
  
  return countryMap[regionName] || 'US'
} 