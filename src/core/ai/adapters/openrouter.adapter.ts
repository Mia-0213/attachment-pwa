import { AIProvider, AIRequest } from "@/core/ai/types/ai-provider.interface";

export class OpenRouterAdapter implements AIProvider {
  public async generate(request: AIRequest): Promise<string> {
    if (!request.apiKey) {
      throw new Error("請輸入 OpenRouter API Key");
    }

    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }
    messages.push(...request.messages.map((m) => ({ role: m.role, content: m.content })));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.apiKey}`,
        "HTTP-Referer": "https://attachment-pwa.local",
        "X-Title": "Attachment PWA",
      },
      body: JSON.stringify({
        model: request.model || "openai/gpt-4o-mini",
        messages,
        temperature: request.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenRouter API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }

  public async *stream(request: AIRequest): AsyncIterable<string> {
    if (!request.apiKey) {
      throw new Error("請輸入 OpenRouter API Key");
    }

    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }
    messages.push(...request.messages.map((m) => ({ role: m.role, content: m.content })));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.apiKey}`,
        "HTTP-Referer": "https://attachment-pwa.local",
        "X-Title": "Attachment PWA",
      },
      body: JSON.stringify({
        model: request.model || "openai/gpt-4o-mini",
        messages,
        temperature: request.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenRouter Stream 錯誤: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const dataStr = trimmed.substring(6);
          if (dataStr === "[DONE]") return;
          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              yield delta;
            }
          } catch {
            // 忽略 JSON 解析異常行
          }
        }
      }
    }
  }
}
