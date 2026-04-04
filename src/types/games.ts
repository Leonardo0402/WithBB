export type ArcadeGameId = '2048' | 'bird' | 'snake' | 'memory' | 'turtleSoup';

export type TurtleSoupPhase = 'idle' | 'playing' | 'revealed' | 'error';

export type TurtleSoupRole = 'system' | 'assistant' | 'user';

export interface TurtleSoupMessage {
  id: string;
  role: TurtleSoupRole;
  content: string;
  tag?: 'host' | 'question' | 'answer' | 'hint' | 'reveal' | 'status';
}

export interface TurtleSoupPuzzle {
  story: string;
  solution: string;
  hints: string[];
}

export interface TurtleSoupSessionState {
  phase: TurtleSoupPhase;
  isLoading: boolean;
  error: string | null;
  messages: TurtleSoupMessage[];
  puzzle: TurtleSoupPuzzle | null;
  usedHints: number;
}

export interface GlmChatMessage {
  role: TurtleSoupRole;
  content: string;
}

export interface GlmChatRequest {
  model: 'glm-4.6v';
  messages: GlmChatMessage[];
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface GlmChatContentPart {
  type?: string;
  text?: string;
}

export interface GlmChatResponse {
  id?: string;
  choices?: Array<{
    message?: {
      role?: string;
      content?: string | GlmChatContentPart[];
    };
  }>;
  error?: {
    message?: string;
  };
}
