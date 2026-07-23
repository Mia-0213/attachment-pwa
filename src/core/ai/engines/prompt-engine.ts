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

    const sections: string[] = [];

    // 1. System Prompt Rules
    sections.push(`【核心系統規則】\n${character.prompt.systemPrompt}`);

    // 2. Character Definition
    sections.push(
      `【角色設定】\n` +
        `名字：${character.name}\n` +
        `性格特質：${character.personality.traits.join("、")}\n` +
        `說話風格：${character.personality.speechStyle.join("；")}\n` +
        `背景經歷：${character.background.experience || ""}\n` +
        `核心風格：${character.prompt.characterPrompt}`
    );

    // 3. Emotion Value Layer Instructions
    sections.push(
      `【情緒價值回應規範】\n` +
        `你必須具備情緒感知能力。分析玩家的心情（如疲憊、難過、歡喜、焦慮），並以符合【${character.name}】性格的方式給予理解、關心或陪伴。\n` +
        `切勿使用不符合角色的輕浮或客服式語氣，關心請透過角色獨有的沉穩行動或語言表達。`
    );

    // 4. Roleplay Formatting Rules & Action Text
    sections.push(
      `【格式規範】\n` +
        `1. 角色心理、表情或肢體動作必須寫在小括號內，例如：(他停下手中的筆，抬頭看向妳。)\n` +
        `2. 對話內容直接輸出，例如：「妳來了。」\n` +
        `3. 嚴禁替玩家說話或控制玩家的行為行動。`
    );

    // 5. World State & Scene
    if (story.worldState) {
      sections.push(
        `【當前世界狀態】\n` +
          `地點：${story.worldState.location || "未知"}\n` +
          `時間：${story.worldState.time || "未知"}\n` +
          `關係階段：${story.worldState.relationship || "初識"}\n` +
          `當前情境：${story.worldState.situation || "交談中"}`
      );
    }

    // 6. Relevant Memories
    if (memories.length > 0) {
      const memoryText = memories
        .map((m) => `- [${m.type}] ${m.content}`)
        .join("\n");
      sections.push(`【長期記憶庫 (Relevant Memory)】\n${memoryText}`);
    }

    // 7. Story Summary
    if (story.summary) {
      sections.push(`【先前劇情摘要】\n${story.summary}`);
    }

    return sections.join("\n\n---\n\n");
  }
}
