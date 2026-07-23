import { Message } from "@/features/chat/types/message.type";
import { Story, WorldState } from "@/features/story/types/story.type";
import { aiEngine } from "@/core/ai/engines/ai-engine";
import { SettingsRepository } from "@/core/repository/settings.repository";

export interface StorySummaryResult {
  summary: string;
  worldState?: Partial<WorldState>;
  timelineEvent?: string;
}

export class StorySummaryEngine {
  private settingsRepo = new SettingsRepository();

  public async updateSummary(story: Story, messages: Message[]): Promise<StorySummaryResult | null> {
    if (messages.length < 4) return null;

    const settings = await this.settingsRepo.get();
    if (!settings || !settings.apiKey) return null;

    const recentChat = messages
      .slice(-6)
      .map((m) => `${m.role === "user" ? "玩家" : "角色"}: ${m.content}`)
      .join("\n");

    const systemPrompt =
      `你是一個長篇劇情整理大師。請分析以下對話，歸納出截至目前的最新【故事發展摘要】與【是否有重大里程碑事件】。\n` +
      `請只輸出 JSON 格式，格式如下：\n` +
      `{\n` +
      `  "summary": "濃縮最新劇情進展與核心關鍵變化的短文 (100字內)",\n` +
      `  "timelineEvent": "如果對話中包含重要約定、新地點抵達或重大關係突破，請寫出一句話事件描述，否則填 null",\n` +
      `  "situation": "更新當前兩人的具態情境描述"\n` +
      `}`;

    try {
      const response = await aiEngine.generate(settings.provider || "openai", {
        messages: [
          {
            id: "summary_prompt",
            storyId: story.id,
            role: "user",
            content: `【先前摘要】\n${story.summary || "故事剛開始"}\n\n【近期對話】\n${recentChat}\n\n請分析並輸出 JSON：`,
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

      const parsed = JSON.parse(cleanJsonStr);
      return {
        summary: parsed.summary || story.summary,
        timelineEvent: parsed.timelineEvent || undefined,
        worldState: parsed.situation ? { situation: parsed.situation } : undefined,
      };
    } catch (err) {
      console.warn("故事摘要更新失敗 (自動忽略):", err);
      return null;
    }
  }
}
