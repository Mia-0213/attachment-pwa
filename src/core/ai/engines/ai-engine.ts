import { AIProvider, AIRequest } from "@/core/ai/types/ai-provider.interface";
import { OpenAIAdapter } from "@/core/ai/adapters/openai.adapter";
import { OpenRouterAdapter } from "@/core/ai/adapters/openrouter.adapter";

export class AIEngine {
  private getAdapter(providerName: string): AIProvider {
    switch (providerName.toLowerCase()) {
      case "openrouter":
        return new OpenRouterAdapter();
      case "openai":
      default:
        return new OpenAIAdapter();
    }
  }

  public async generate(providerName: string, request: AIRequest): Promise<string> {
    const adapter = this.getAdapter(providerName);
    return adapter.generate(request);
  }

  public async *stream(providerName: string, request: AIRequest): AsyncIterable<string> {
    const adapter = this.getAdapter(providerName);
    yield* adapter.stream(request);
  }
}

export const aiEngine = new AIEngine();
