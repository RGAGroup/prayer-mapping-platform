# 🎯 PLANO ESTRATÉGICO - Dashboard Administrativo
## Atalaia Global Vision - Sistema Avançado de Agente IA

### 🔒 GARANTIA DE SEGURANÇA
**⚠️ IMPORTANTE**: Esta limpeza afeta APENAS a interface (frontend)
- ✅ **Banco de dados 100% SEGURO** - Não mexemos no Supabase
- ✅ **467 regiões preservadas** - Todos os dados mantidos
- ✅ **Código arquivado** - Não deletamos, apenas movemos
- ✅ **Sem riscos** - Apenas mudanças na interface

### 📋 SITUAÇÃO ATUAL
**Tabs Existentes:**
- ✅ **Visão Geral** (overview) - MANTER
- ❌ **Mapeamento Mundial** (world-mapping) - REMOVER
- ✅ **Mapeamento Global** (regions) - MANTER (gerenciar conteúdo)
- ✅ **Oração** (prayer-stats) - MANTER
- 🔄 **IA** (queue-builder) - TRANSFORMAR EM SISTEMA AVANÇADO
- ✅ **Analytics** - MANTER

### 🎯 OBJETIVOS AVANÇADOS
1. **Remover** botão "Mapeamento Mundial" (não será usado)
2. **Manter** botão "Mapeamento Global" (para gerenciar países/estados/municípios)
3. **Criar Sistema Avançado de Agente** com:
   - 🧬 **Cadastro de Persona com Embeddings**
   - 🎛️ **Controle Total do Usuário**
   - 💬 **Preparação para Chat Futuro**
   - 🤖 **Múltiplos Modelos de Agente**

---

## 📝 PLANO DE EXECUÇÃO AVANÇADO

### FASE 1: LIMPEZA DO DASHBOARD (SEGURA)
**Objetivo**: Remover componentes desnecessários SEM afetar dados

#### Passo 1.1: Remover Tab "Mapeamento Mundial"
- **Arquivo**: `src/pages/AdminDashboard.tsx`
- **Ações SEGURAS**:
  - Remover `world-mapping` do `TabsList`
  - Remover `<TabsContent value="world-mapping">`
  - Remover import `WorldMappingTab`
  - Ajustar grid para 5 colunas (de 6 para 5)

#### Passo 1.2: Arquivar Componente WorldMappingTab
- **Arquivo**: `src/components/admin/WorldMappingTab.tsx`
- **Ações SEGURAS**:
  - Mover para pasta `src/components/admin/archive/`
  - Manter como backup (NÃO deletar)
  - Preservar todo o código

---

### FASE 2: SISTEMA AVANÇADO DE AGENTE COM EMBEDDINGS
**Objetivo**: Criar sistema completo de agente personalizado

#### 🧬 SISTEMA DE CADASTRO DE PERSONA COM EMBEDDINGS
```typescript
interface PersonaEmbedding {
  id: string;
  name: string;
  description: string;
  embedding: number[];              // Vetor de embedding
  model: string;                    // Modelo usado (OpenAI, Claude, etc.)
  temperature: number;              // Criatividade
  maxTokens: number;                // Limite de tokens
  systemPrompt: string;             // Prompt do sistema
  context: string;                  // Contexto específico
  expertise: string[];              // Áreas de expertise
  personality: {
    tone: string;                   // Tom de comunicação
    style: string;                  // Estilo de resposta
    focus: string;                  // Foco principal
    spiritualContext: string;       // Contexto espiritual
  };
  created_at: Date;
  updated_at: Date;
  user_id: string;
  is_active: boolean;
}
```

#### 🎛️ CONTROLES AVANÇADOS DO USUÁRIO
```typescript
interface AdvancedUserControls {
  // Seleção da Persona
  selectedPersona: string;          // ID da persona selecionada
  customPersona?: PersonaEmbedding; // Persona personalizada
  
  // Seleção Manual de Regiões
  selectedRegions: string[];        // Regiões escolhidas pelo usuário
  selectedCountries: string[];      // Países específicos
  selectedStates: string[];         // Estados específicos
  
  // Tipos de Dados Avançados
  dataTypes: {
    spiritualData: boolean;         // Dados espirituais
    prayerPoints: boolean;          // Pontos de oração
    culturalContext: boolean;       // Contexto cultural
    historicalContext: boolean;     // Contexto histórico
    demographicData: boolean;       // Dados demográficos
    economicContext: boolean;       // Contexto econômico
    religiousMapping: boolean;      // Mapeamento religioso
  };
  
  // Sistema de Aprovação
  requireApproval: boolean;         // Requer aprovação antes de salvar
  showPreview: boolean;             // Mostrar preview antes de salvar
  approvalLevel: 'automatic' | 'preview' | 'manual';
  
  // Controle de Execução
  batchSize: number;                // Tamanho dos lotes
  delayBetweenRequests: number;     // Delay entre requests
  maxConcurrentRequests: number;    // Requests simultâneos
  
  // Configurações de IA
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'gemini';
  temperature: number;              // Criatividade (0-1)
  maxTokens: number;                // Limite de tokens
}
```

#### Passo 2.1: Criar Sistema de Cadastro de Persona
- **Arquivo**: `src/components/admin/PersonaManager.tsx`
- **Funcionalidades**:
  - 📝 **Cadastro de Persona**: Interface para criar personas
  - 🧬 **Editor de Embeddings**: Inserir e editar embeddings
  - 🎨 **Configuração de Personalidade**: Definir tom, estilo, foco
  - 💾 **Salvamento**: Salvar personas no banco
  - 🔍 **Visualização**: Preview da persona antes de salvar
  - 🔄 **Gerenciamento**: Editar, duplicar, deletar personas

#### Passo 2.2: Criar Interface Principal do Agente
- **Arquivo**: `src/components/admin/AdvancedAgentTab.tsx`
- **Controles do Usuário**:
  - 🤖 **Seletor de Persona**: Escolher persona ativa
  - 🎯 **Seletor de Regiões**: Escolher países/estados específicos
  - 📝 **Tipos de Dados**: Selecionar que dados gerar
  - 👁️ **Preview**: Visualizar antes de salvar
  - ✅ **Aprovação**: Aprovar/rejeitar cada resultado
  - ⏸️ **Pausar/Parar**: Controle total da execução
  - 🎛️ **Configurações**: Modelo, temperatura, tokens

#### Passo 2.3: Serviços do Agente Avançado
- **Arquivo**: `src/services/advancedAgentService.ts`
- **Funcionalidades**:
  - 🧬 **Processamento de Embeddings**: Trabalhar com vetores
  - 🧠 **Integração Multi-modelo**: OpenAI, Claude, Gemini
  - 🎯 **Geração Contextual**: Usar persona para gerar dados
  - 📊 **Sistema de Fila**: Processamento em lotes
  - 💾 **Salvamento Controlado**: Apenas com aprovação

#### Passo 2.4: Banco de Dados para Personas
- **Arquivo**: `supabase/migrations/personas_system.sql`
- **Tabelas**:
  - `agent_personas` - Armazenar personas
  - `persona_embeddings` - Vetores de embedding
  - `agent_tasks` - Tarefas do agente
  - `agent_results` - Resultados gerados

---

### FASE 3: PREPARAÇÃO PARA CHAT FUTURO
**Objetivo**: Preparar infraestrutura para chat com intercessores

#### 🎯 PLANEJAMENTO DO CHAT
```typescript
interface ChatSystem {
  // Múltiplos Modelos de Agente
  availableAgents: {
    intercessor: PersonaEmbedding;      // Agente focado em intercessão
    researcher: PersonaEmbedding;       // Agente focado em pesquisa
    cultural: PersonaEmbedding;         // Agente focado em cultura
    historical: PersonaEmbedding;       // Agente focado em história
    strategic: PersonaEmbedding;        // Agente focado em estratégia
  };
  
  // Sistema de Conversação
  chatSessions: ChatSession[];
  activeAgent: string;
  conversationHistory: Message[];
  
  // Integração com Dados
  regionContext: any;                   // Contexto da região atual
  prayerContext: any;                   // Contexto de oração
  userPreferences: any;                 // Preferências do usuário
}
```

#### Passo 3.1: Estrutura Base do Chat
- **Arquivo**: `src/components/chat/ChatInterface.tsx`
- **Preparação**:
  - 💬 **Interface de Chat**: Base para conversação
  - 🤖 **Seletor de Agente**: Escolher tipo de agente
  - 📍 **Contexto Regional**: Integrar com dados das regiões
  - 💾 **Histórico**: Salvar conversas

#### Passo 3.2: Tipos e Interfaces do Chat
- **Arquivo**: `src/types/Chat.ts`
- **Definir**:
  - `ChatSession` - Sessão de chat
  - `Message` - Mensagem individual
  - `AgentType` - Tipos de agente
  - `ChatContext` - Contexto da conversa

---

### FASE 4: MELHORIAS NO MAPEAMENTO GLOBAL
**Objetivo**: Integrar com sistema de agente

#### Passo 4.1: Integração com Agente
- **Arquivo**: `src/components/admin/RegionsTab.tsx`
- **Melhorias**:
  - 🤖 **Botão "Gerar com IA"**: Para cada região
  - 🎯 **Seleção Rápida**: Enviar região para agente
  - 📊 **Status de IA**: Mostrar dados gerados por IA
  - 🔄 **Atualização**: Regenerar dados com agente

---

### FASE 5: INTEGRAÇÃO E TESTES
**Objetivo**: Garantir funcionamento perfeito

#### Passo 5.1: Integrar Componentes
- **Arquivo**: `src/pages/AdminDashboard.tsx`
- **Ações**:
  - Substituir `QueueBuilderTab` por `AdvancedAgentTab`
  - Adicionar `PersonaManager` como sub-tab
  - Preparar estrutura para chat futuro
  - Atualizar imports e navegação

#### Passo 5.2: Testes Completos
- **Verificar**:
  - Cadastro de personas
  - Processamento de embeddings
  - Controles do agente
  - Sistema de aprovação
  - Integração com regiões

---

## 🔧 ESPECIFICAÇÕES TÉCNICAS AVANÇADAS

### SISTEMA DE EMBEDDINGS
```typescript
interface EmbeddingService {
  // Geração de Embeddings
  generateEmbedding: (text: string, model: string) => Promise<number[]>;
  
  // Busca por Similaridade
  findSimilarPersonas: (embedding: number[], threshold: number) => Promise<PersonaEmbedding[]>;
  
  // Processamento de Contexto
  processContextualData: (persona: PersonaEmbedding, context: any) => Promise<string>;
  
  // Integração com Modelos
  callModel: (persona: PersonaEmbedding, prompt: string) => Promise<string>;
}
```

### BANCO DE DADOS AVANÇADO
```sql
-- Tabela de Personas
CREATE TABLE agent_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  model TEXT DEFAULT 'gpt-4',
  temperature FLOAT DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  personality JSONB,
  expertise TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Resultados do Agente
CREATE TABLE agent_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES agent_personas(id),
  region_id UUID REFERENCES spiritual_regions(id),
  data_type TEXT NOT NULL,
  generated_data JSONB,
  user_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 CRONOGRAMA ESTIMADO AVANÇADO

### Fase 1: Limpeza SEGURA (30 min)
- ✅ Remover componentes da interface
- ✅ Arquivar código (não deletar)
- ✅ Preservar 100% dos dados

### Fase 2: Sistema de Embeddings (4-5 horas)
- 🧬 Criar sistema de cadastro de persona
- 🎛️ Interface avançada do agente
- 💾 Banco de dados para personas
- 🧠 Integração multi-modelo

### Fase 3: Preparação Chat (2 horas)
- 💬 Estrutura base do chat
- 🤖 Tipos de agente
- 📍 Contexto regional

### Fase 4: Integração (1 hora)
- 🔗 Conectar com mapeamento global
- 🎯 Seleção rápida de regiões

### Fase 5: Testes (1 hora)
- 🧪 Testes completos
- 🔄 Ajustes finais

**TOTAL ESTIMADO: 8-10 horas**

---

## 🎯 RESULTADO ESPERADO AVANÇADO

### DASHBOARD FINAL
1. **📊 Visão Geral** - Estatísticas e overview
2. **🗺️ Mapeamento Global** - Gerenciar conteúdo + integração com IA
3. **🙏 Oração** - Estatísticas de oração
4. **🤖 Agente Avançado** - Sistema completo com embeddings
   - 🧬 **Cadastro de Persona**
   - 🎛️ **Controles Avançados**
   - 💬 **Preparação para Chat**
5. **📈 Analytics** - Relatórios e métricas

### FUNCIONALIDADES AVANÇADAS
- ✅ **Persona Personalizada**: Embeddings customizados
- ✅ **Múltiplos Modelos**: OpenAI, Claude, Gemini
- ✅ **Controle Total**: Aprovação obrigatória
- ✅ **Chat Preparado**: Estrutura para conversação
- ✅ **Integração Completa**: Agente + Regiões + Chat

---

**PLANO AVANÇADO PRONTO PARA EXECUÇÃO** 🚀
**SISTEMA DE EMBEDDINGS INCLUSO** 🧬
**PREPARADO PARA CHAT FUTURO** 💬 