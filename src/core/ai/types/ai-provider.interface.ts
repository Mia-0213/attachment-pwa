import { Message } from "@/features/chat/types/message.type";

export interface AIRequest {
  messages: Message[];
  model: string;
  temperature?: number;
  apiKey: string;
  systemPrompt?: string;
}

export interface AIProvider {
  generate(request: AIRequest): Promise<string>;
  stream(request: AIRequest): AsyncIterable<string>;
}
