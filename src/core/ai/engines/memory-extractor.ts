import { Message } from "@/features/chat/types/message.type";
import { aiEngine } from "@/core/ai/engines/ai-engine";
import { SettingsRepository } from "@/core/repository/settings.repository";

export interface ExtractedMemoryItem {
  type: "player" | "story" | "relationship";
  content: string;
  importance: number;
}

export class MemoryExtractor {
  private settingsRepo = new SettingsRepository();

  public async extract(messages: Message[]): Promise<ExtractedMemoryItem[]> {
    if (messages.length < 2) return [];

    const settings = await this.settingsRepo.get();
    if (!settings || !settings.apiKey) return [];

    const recentChat = messages
      .slice(-4)
      .map((m) => `${m.role === "user" ? "玩家" : "角色"}: ${m.content}`)
      .join("\n");

    const systemPrompt =
      `你是一個精準的 AI 記憶提取器。分析以下對話，判斷是否有關於【玩家資訊】、【重要劇情事件】或【關係變化】值得長期保存的記憶。\n` +
      `禁止保存普通寒暄（如：「你好」、「今天天氣真好」）。\n` +
      `分類說明：\n` +
      `- "player": 玩家的名字、習慣、喜好、背景或秘密。\n` +
      `- "story": 重大事件、約定、衝突或伏筆。\n` +
      `- "relationship": 信任度或感情關係變化。\n\n` +
      `請嚴格只輸出 JSON 格式陣列，不要加入額外說明 Markdown 標籤，格式範例：\n` +
      `[\n` +
      `  {"type": "player", "content": "玩家喜歡喝無糖黑咖啡", "importance": 8},\n` +
      `  {"type": "story", "content": "雙方約定明晚在私人會所見面", "importance": 9}\n` +
      `]`;

    try {
      const response = await aiEngine.generate(settings.provider || "openai", {
        messages: [
          {
            id: "extract_prompt",
            storyId: "",
            role: "user",
            content: `【近期對話紀錄】\n${recentChat}\n\n請提取記憶並輸出 JSON 陣列：`,
            status: "completed",
            createdAt: Date.now(),
          },
        ],
        model: settings.model || "gpt-4o-mini",
        apiKey: settings.apiKey,
        systemPrompt,
      });

      const cleanJsonStr = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const items: ExtractedMemoryItem[] = JSON.parse(cleanJsonStr);
      if (Array.isArray(items)) {
        return items.filter(
          (item) => item.type && item.content && typeof item.importance === "number"
        );
      }
    } catch (err) {
      console.warn("記憶提取失敗 (自動忽略):", err);
    }

    return [];
  }
}
