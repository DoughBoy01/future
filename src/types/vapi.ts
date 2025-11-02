export type OrbState = 'idle' | 'listening' | 'speaking' | 'thinking' | 'error';

export type CallStatus = 'inactive' | 'connecting' | 'active' | 'ended' | 'error';

export interface TranscriptMessage {
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
}

export interface VapiMessage {
  type: string;
  role?: 'user' | 'assistant';
  transcript?: string;
  transcriptType?: 'partial' | 'final';
}

export interface VapiError {
  error: {
    message: string;
    statusCode?: number;
  };
}

export interface AssistantConfig {
  model: {
    provider: string;
    model: string;
    messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>;
    temperature?: number;
  };
  voice: {
    provider: string;
    voiceId: string;
  };
  firstMessage?: string;
  transcriber?: {
    provider: string;
    model?: string;
    language?: string;
  };
  name?: string;
  // Placeholder for future database integration
  functions?: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
}
