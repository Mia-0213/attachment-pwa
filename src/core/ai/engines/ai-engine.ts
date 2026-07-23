import { AIProvider, AIRequest } from "@/core/ai/types/ai-provider.interface";
import { OpenAIAdapter } from "@/core/ai/adapters/openai.adapter";
import { OpenRouterAdapter } from "@/core/ai/adapters/openrouter.adapter";
import { GeminiAdapter } from "@/core/ai/adapters/gemini.adapter";

export class AIEngine {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.providers.set("openai", new OpenAIAdapter());
    this.providers.set("openrouter", new OpenRouterAdapter());
    this.providers.set("gemini", new GeminiAdapter());
  }

  public registerProvider(name: string, provider: AIProvider): void {
    this.providers.set(name, provider);
  }

  public getProvider(name: string): AIProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`未支援的 AI Provider: ${name}`);
    }
    return provider;
  }

  public async generate(providerName: string, request: AIRequest): Promise<string> {
    const provider = this.getProvider(providerName);
    return provider.generate(request);
  }

  public async *stream(providerName: string, request: AIRequest): AsyncIterable<string> {
    const provider = this.getProvider(providerName);
    yield* provider.stream(request);
  }
}

export const aiEngine = new AIEngine();
