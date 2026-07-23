import { AIProvider, AIRequest } from "@/core/ai/types/ai-provider.interface";

export class GeminiAdapter implements AIProvider {
  public async generate(request: AIRequest): Promise<string> {
    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "gemini",
        messages: request.messages,
        model: request.model || "gemini-2.0-flash",
        apiKey: request.apiKey,
        systemPrompt: request.systemPrompt,
        temperature: request.temperature ?? 0.9,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Google Gemini API 失敗 (${response.status})`);
    }

    const text = await response.text();
    return text;
  }

  public async *stream(request: AIRequest): AsyncIterable<string> {
    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "gemini",
        messages: request.messages,
        model: request.model || "gemini-2.0-flash",
        apiKey: request.apiKey,
        systemPrompt: request.systemPrompt,
        temperature: request.temperature ?? 0.9,
      }),
    });

    if (!response.ok || !response.body) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Google Gemini 連線失敗 (${response.status})`);
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
            // 忽略非 JSON 行
          }
        }
      }
    }
  }
}
