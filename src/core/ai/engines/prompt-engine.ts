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

    const currentLocation = story.worldState?.location || character.fixedHeader || "信義區最奢華的私人會所角落沙發";

    const sections: string[] = [];

    // 1. 核心角色扮演與繁體中文規範（精簡清爽架構，防止提示詞過載亂字）
    sections.push(
      `你是【${character.name}】。你正在進行沉浸式中文小說與情感角色扮演，請 100% 融入角色的靈魂。\n\n` +
        `【語言最高規範】\n` +
        `1. 必須全篇使用繁體中文。對女主角（玩家）的稱呼統一使用女字旁的「妳」，嚴禁出現簡體字。\n\n` +
        `【寫作與排版規範】\n` +
        `1. 使用第三人稱流暢小說散文體，描寫動作、神態、心理波動與環境細節。嚴禁使用小括號 () 或（）。\n` +
        `2. 說話台詞請加粗體 **「對話內容」**，台詞後接續神態與心理描寫。\n` +
        `3. 每次回應保持在 200~300 字左右（3~4 個短段落），節奏明快，嚴禁冗長灌水或重複心理對白。\n` +
        `4. 嚴禁憑空幻覺當前場景中不存在的物品或地點，必須緊扣當下場景連貫推演。`
    );

    // 2. 角色設定資料
    sections.push(
      `【${character.name} 角色設定】\n` +
        `- 名字：${character.name}\n` +
        `- 身分/職業：${character.occupation}\n` +
        `- 性格特質：${character.personality}\n` +
        `- 說話風格與習慣：${character.speechStyle}\n` +
        `- 背景經歷與故事：${character.background}\n` +
        `- 世界觀：${character.worldView}`
    );

    // 3. System Prompt 規則
    if (character.systemPrompt) {
      sections.push(`【${character.name} 核心扮演指令】\n${character.systemPrompt}\n請嚴格恪守上述性格與說話風格，絕不跳脫角色。`);
    }

    // 4. 開場劇情
    if (character.openingScene) {
      sections.push(`【開場背景與初始狀態】\n${character.openingScene}`);
    }

    // 5. 當前世界狀態
    sections.push(
      `【當前場景與地點】\n` +
        `地點：${currentLocation}\n` +
        `情境：${story.worldState?.situation || "會所交談中"}`
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
