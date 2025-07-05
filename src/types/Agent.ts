// =====================================================
// TIPOS PARA SISTEMA DE AGENTE COM PERSONAS
// Otimizado para OpenAI GPT-4o
// =====================================================

// 1. TIPOS BÁSICOS DA PERSONA
// =====================================================
export interface AgentPersona {
  id: string;
  name: string;
  description: string;
  
  // Configurações da Persona
  system_prompt: string;
  context: string;
  
  // Embeddings OpenAI
  embedding?: number[]; // 3072 dimensões (text-embedding-3-large)
  
  // Configurações GPT-4o
  model: 'gpt-4o' | 'gpt-4o-mini';
  temperature: number; // 0-2
  max_tokens: number; // 1-4096
  top_p: number; // 0-1
  
  // Personalidade
  personality: {
    tone: string;
    style: string;
    approach: string;
    [key: string]: any;
  };
  
  expertise: string[];
  spiritual_focus: string;
  tone: string;
  style: string;
  
  // Metadados
  is_active: boolean;
  is_default: boolean;
  version: number;
  
  // Auditoria
  created_at: string;
  updated_at: string;
  created_by: string;
}

// 2. TIPOS DE TAREFAS DO AGENTE
// =====================================================
export type AgentTaskType = 
  | 'spiritual_data'
  | 'prayer_points'
  | 'cultural_context'
  | 'historical_context'
  | 'demographic_data'
  | 'economic_context'
  | 'religious_mapping';

export type AgentTaskStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'awaiting_approval';

export interface AgentTask {
  id: string;
  
  // Relacionamentos
  persona_id: string;
  region_id: string;
  created_by: string;
  
  // Configurações
  task_type: AgentTaskType;
  status: AgentTaskStatus;
  priority: number; // 1-100
  
  // Dados
  input_data?: any;
  prompt_used?: string;
  result_data?: any;
  raw_response?: string;
  
  // Métricas
  tokens_used: number;
  processing_time_ms: number;
  confidence_score: number; // 0-100
  
  // Aprovação
  user_approved: boolean;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  
  // Erros
  error_message?: string;
  error_code?: string;
  retry_count: number;
  
  // Timing
  created_at: string;
  started_at?: string;
  completed_at?: string;
  updated_at: string;
}

// 3. TIPOS DE SESSÃO DE PROCESSAMENTO
// =====================================================
export type AgentSessionStatus = 
  | 'created'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface AgentSession {
  id: string;
  session_name: string;
  description: string;
  persona_id: string;
  
  // Filtros
  target_regions: string[];
  task_types: AgentTaskType[];
  
  // Status
  status: AgentSessionStatus;
  
  // Progresso
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  
  // Métricas
  total_tokens_used: number;
  total_processing_time_ms: number;
  estimated_cost_usd: number;
  
  // Timing
  created_at: string;
  started_at?: string;
  completed_at?: string;
  updated_at: string;
  
  // Auditoria
  created_by: string;
}

// 4. TIPOS DE CONTROLE DO USUÁRIO
// =====================================================
export interface AgentUserControls {
  // Seleção da Persona
  selectedPersona: string;
  
  // Seleção de Regiões
  selectedRegions: string[];
  selectedCountries: string[];
  selectedStates: string[];
  
  // Tipos de Dados
  dataTypes: {
    spiritual_data: boolean;
    prayer_points: boolean;
    cultural_context: boolean;
    historical_context: boolean;
    demographic_data: boolean;
    economic_context: boolean;
    religious_mapping: boolean;
  };
  
  // Sistema de Aprovação
  requireApproval: boolean;
  showPreview: boolean;
  approvalLevel: 'automatic' | 'preview' | 'manual';
  
  // Controle de Execução
  batchSize: number;
  delayBetweenRequests: number; // ms
  maxConcurrentRequests: number;
  
  // Configurações GPT-4o
  model: 'gpt-4o' | 'gpt-4o-mini';
  temperature: number;
  max_tokens: number;
  top_p: number;
}

// 5. TIPOS DE FORMULÁRIO DE PERSONA
// =====================================================
export interface PersonaFormData {
  name: string;
  description: string;
  system_prompt: string;
  context: string;
  
  // Embeddings (opcional, será inserido manualmente)
  embedding_text?: string; // Texto para gerar embedding
  embedding_vector?: number[]; // Vetor de embedding manual
  
  // Configurações GPT-4o
  model: 'gpt-4o' | 'gpt-4o-mini';
  temperature: number;
  max_tokens: number;
  top_p: number;
  
  // Personalidade
  personality_tone: string;
  personality_style: string;
  personality_approach: string;
  
  expertise: string[];
  spiritual_focus: string;
  tone: string;
  style: string;
  
  is_active: boolean;
  is_default: boolean;
}

// 6. TIPOS DE RESPOSTA DA API
// =====================================================
export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingResponse {
  object: string;
  data: {
    object: string;
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// 7. TIPOS DE RESULTADO E ESTATÍSTICAS
// =====================================================
export interface AgentResult {
  task_id: string;
  region_name: string;
  task_type: AgentTaskType;
  status: AgentTaskStatus;
  result_data?: any;
  confidence_score: number;
  tokens_used: number;
  processing_time_ms: number;
  user_approved: boolean;
  created_at: string;
  completed_at?: string;
}

export interface AgentStatistics {
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  pending_tasks: number;
  success_rate: number;
  total_tokens: number;
  estimated_cost: number;
  average_confidence: number;
  total_processing_time: number;
}

export interface PersonaStatistics {
  persona_id: string;
  persona_name: string;
  total_tasks: number;
  success_rate: number;
  average_confidence: number;
  total_tokens: number;
  estimated_cost: number;
  last_used: string;
}

// 8. TIPOS DE SIMILARIDADE E BUSCA
// =====================================================
export interface SimilarPersona {
  persona_id: string;
  name: string;
  similarity_score: number;
}

export interface PersonaSearchResult {
  personas: SimilarPersona[];
  total_found: number;
  search_time_ms: number;
}

// 9. TIPOS DE CONFIGURAÇÃO E CONTEXTO
// =====================================================
export interface AgentConfig {
  // Configurações Globais
  default_model: 'gpt-4o' | 'gpt-4o-mini';
  default_temperature: number;
  default_max_tokens: number;
  default_batch_size: number;
  default_delay_ms: number;
  
  // Configurações de Custos
  gpt4o_cost_per_token: number;
  gpt4o_mini_cost_per_token: number;
  embedding_cost_per_token: number;
  
  // Configurações de Rate Limiting
  max_requests_per_minute: number;
  max_concurrent_requests: number;
  
  // Configurações de Retry
  max_retries: number;
  retry_delay_ms: number;
  
  // Configurações de Timeout
  request_timeout_ms: number;
  
  // OpenAI API
  openai_api_key: string;
  openai_organization?: string;
}

export interface RegionContext {
  region_id: string;
  region_name: string;
  region_type: 'country' | 'state' | 'city' | 'neighborhood';
  country_code?: string;
  parent_region?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  existing_spiritual_data?: any;
  population?: number;
  area_km2?: number;
  languages?: string[];
  religions?: string[];
  cultural_context?: string;
  historical_context?: string;
}

// 10. TIPOS DE EVENTOS E CALLBACKS
// =====================================================
export interface AgentEventCallbacks {
  onTaskStart?: (task: AgentTask) => void;
  onTaskComplete?: (task: AgentTask, result: any) => void;
  onTaskFail?: (task: AgentTask, error: string) => void;
  onSessionStart?: (session: AgentSession) => void;
  onSessionProgress?: (session: AgentSession, progress: number) => void;
  onSessionComplete?: (session: AgentSession) => void;
  onApprovalRequired?: (task: AgentTask, result: any) => Promise<boolean>;
  onCostAlert?: (estimated_cost: number) => void;
}

// 11. TIPOS DE VALIDAÇÃO E ERRO
// =====================================================
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface AgentError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  task_id?: string;
  session_id?: string;
}

// 12. TIPOS DE EXPORT/IMPORT
// =====================================================
export interface PersonaExport {
  persona: Omit<AgentPersona, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
  tasks_count: number;
  success_rate: number;
  export_date: string;
}

export interface PersonaImport {
  persona: PersonaFormData;
  replace_existing: boolean;
  import_embedding: boolean;
}

// =====================================================
// TODOS OS TIPOS ESTÃO EXPORTADOS ACIMA
// ===================================================== 