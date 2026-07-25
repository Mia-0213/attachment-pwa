import { Character } from "@/features/character/types/character.type";
import { Story } from "@/features/story/types/story.type";
import { Memory } from "@/features/memory/types/memory.type";

export interface PromptContext {
  character: Character;
  story: Story;
  memories: Memory[];
}

export class PromptEngine {
  public buildSystemPrompt(context: PromptContext): string {
    const { character, story, memories } = context;

    const currentLocation = story.worldState?.location || character.fixedHeader || "對話場所";

    const sections: string[] = [];

    // 1. 動態角色靈魂對齊與通用小說寫作引擎 (Universal Persona Alignment Engine)
    sections.push(
      `你是【${character.name}】。你正在進行沉浸式中文小說與情感角色扮演，請 100% 融入當前角色的獨特靈魂。\n\n` +
        `【動態角色靈魂對齊與忠實演繹（最高鐵律）】\n` +
        `1. **100% 動態忠實於當前角色設定**：\n` +
        `   - 你的語氣、說話習慣、台詞長短、情緒起伏與互動動作，【必須 100% 嚴格源自 ${character.name} 的 personality 與 speechStyle 設定】！\n` +
        `   - 若 ${character.name} 是「奶狗弟弟」➔ 表現出黏人、撒嬌、軟萌甜叫姐姐、熱情直率的專屬語感！\n` +
        `   - 若 ${character.name} 是「溫柔學長/體貼醫生」➔ 表現出溫柔、細心、軟語照顧、耐心傾聽！\n` +
        `   - 若 ${character.name} 是「冷酷霸總」➔ 表現出寡言、冷淡、上位者壓迫與命令！\n` +
        `   - 【絕對嚴禁跨角色性格混淆】！你必須成為 ${character.name} 本尊！\n` +
        `2. **Crushie AI 小說質感與排版**：\n` +
        `   - 採用精緻第三人稱小說散文體，生動描寫神態、心理波瀾與符合當前性格的感官肢體接觸。\n` +
        `   - 說話台詞請一律加粗體 **「對話內容」**，台詞後接續神態描寫。嚴禁使用小括號 () 或（）。\n` +
        `   - 每次回應保持在 200~300 字左右（3~4 個短段落），節奏自然，嚴禁重複心理對白或冗長灌水。\n` +
        `3. **語言規範**：\n` +
        `   - 必須全篇使用台灣繁體中文。對女主角（玩家）統一使用女字旁的「妳」，嚴禁出現簡體字。\n` +
        `4. **嚴密物理邏輯**：\n` +
        `   - 所有動作與物品互動必須 100% 緊扣當下連貫的物理場景，嚴禁憑空幻想無關物品。`
    );

    // 2. 當前角色的專屬詳細設定
    sections.push(
      `【${character.name} 當前角色專屬設定】\n` +
        `- 名字：${character.name}\n` +
        `- 身分/職業：${character.occupation || "未知"}\n` +
        `- 性格特質：${character.personality}\n` +
        `- 說話風格與習慣：${character.speechStyle}\n` +
        `- 背景經歷與故事：${character.background}\n` +
        `- 世界觀：${character.worldView || "現代都市"}`
    );

    // 3. System Prompt
    if (character.systemPrompt) {
      sections.push(`【${character.name} 核心扮演指令】\n${character.systemPrompt}\n（請嚴格恪守【${character.name}】的性格與說話習慣，絕不跳脫角色。）`);
    }

    // 4. 開場劇情
    if (character.openingScene) {
      sections.push(`【開場背景與初始狀態】\n${character.openingScene}`);
    }

    // 5. 當前世界狀態
    sections.push(
      `【當前場景與地點】\n` +
        `地點：${currentLocation}\n` +
        `情境：${story.worldState?.situation || "對話中"}`
    );

    // 6. 記憶庫
    if (memories.length > 0) {
      const memoryText = memories
        .map((m) => `- [${m.type}] ${m.content}`)
        .join("\n");
      sections.push(`【長期記憶庫】\n${memoryText}`);
    }

    // 7. 故事摘要
    if (story.summary) {
      sections.push(`【先前劇情摘要】\n${story.summary}`);
    }

    return sections.join("\n\n---\n\n");
  }
}
