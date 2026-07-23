export interface Settings {
  id?: string;
  provider: "openai" | "openrouter" | "gemini";
  model: string;
  apiKey: string; // 支援單組或多組以換行/逗號分隔的 API Key
  theme?: string;
  language?: string;
  updatedAt?: number;
}
