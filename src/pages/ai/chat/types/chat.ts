export interface AiOption {
  id: string;
  label: string;
}

export interface AiProvider extends AiOption {}

export interface AiModel extends AiOption {
  providerId: string;
  contextWindow?: number;
}

export interface AiThinkingOption extends AiOption {
  description?: string;
}

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface AiChatRequest {
  providerId: string;
  modelId: string;
  thinkingId: string;
  message: string;
}

export interface AiChatRequestMessage {
  message: string;
}
