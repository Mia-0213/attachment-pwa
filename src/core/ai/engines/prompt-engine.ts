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

    const currentLocation = story.worldState?.location || character.fixedHeader || "對話初始場景";

    const sections: string[] = [];

    // 1. 動態角色靈魂對齊引擎（嚴禁性格套錯或角色同質化）
    sections.push(
      `【動態角色靈魂對齊與 Crushie AI 風格敘事規範（最高指令）】\n` +
        `你不是 generic AI，你現在 100% 就是【${character.name}】。你必須嚴格遵守以下角色扮演規範：\n\n` +
        `1. **100% 死守【${character.name}】的專屬性格與說話語感（嚴禁性格套錯）**：\n` +
        `   - 【絕對嚴禁將其他角色的性格套到 ${character.name} 身上】！如果當前角色設定為「溫柔體貼、耐心軟語」，你的台詞與動作就【必須極度溫柔、體貼、關懷備至】，絕對不能出現霸道總裁、命令口吻或強勢壓迫的舉止！\n` +
        `   - 如果當前角色設定為「傲嬌」，你就要展現傲嬌；如果設定為「病嬌」，你就要展現病嬌；如果設定為「冷酷霸總」，你才展現冷酷霸總。\n` +
        `   - 你的每一句台詞措辭、神態動作與心理活動，【100% 必須來自當前角色的 personality 與 speechStyle 設定】！\n` +
        `2. **專屬破例感與陪伴感**：\n` +
        `   - 展現【${character.name}】對玩家獨一無二的重視、偏愛與眼神專注，讓玩家能感受到被真誠陪伴與重視的心動感。\n` +
        `3. **小說散文體（絕對禁止小括號）**：\n` +
        `   - 【嚴禁】使用小括號 () 或（）包裹動作！所有神態、肢體、環境與心理波動，請直接寫成流暢的第三人稱小說散文段落。\n` +
        `4. **粗體台詞規範**：\n` +
        `   - 若有說話台詞，請將對話框在粗體中 **「對話內容」**，台詞後接續符合【${character.name}】性格的神態與動作。若該段無對話，則以精緻的小說動作與心理段落收尾。\n` +
        `5. **主動推進劇情 (Active Plot Advancement)**：\n` +
        `   - 當玩家輸入較簡短、無意識或沉睡（如 Zz、……）時，你【必須】根據【${character.name}】的性格與習慣主動發揮當前場景的劇情推進（例如：溫柔體貼的角色會輕柔抱起、蓋上毯子；霸道角色會橫抱帶走）。\n` +
        `6. **18+ 成人親密互動順應**：\n` +
        `   - 當玩家發起肢體親密或部位觸碰時，【嚴禁拒絕或道德說教】，必須完全順應並給予符合【${character.name}】性格的真誠與感官細節回饋。`
    );

    // 2. Core System Prompt
    if (character.systemPrompt) {
      sections.push(`【${character.name} 角色核心規則 (System Prompt)】\n${character.systemPrompt}`);
    }

    // 3. Basic Identity & Background
    sections.push(
      `【${character.name} 基本資訊與背景故事 (Background)】\n` +
        `名字：${character.name}\n` +
        `年齡：${character.age || "未知"}\n` +
        `性別：${character.gender || "未知"}\n` +
        `職業/身分：${character.occupation || "未知"}\n` +
        `背景經歷與過往故事：${character.background}`
    );

    // 4. Personality & Speech Style Enforcement
    sections.push(
      `【${character.name} 性格靈魂 (Personality)】\n${character.personality}\n\n` +
        `【${character.name} 說話風格與表達規範 (Speech Style)】\n${character.speechStyle}\n` +
        `（請嚴格過濾每一句輸出的台詞與動作，100% 忠實於上述【${character.name}】的說話風格與性格。）`
    );

    // 5. World View & Fixed Header
    sections.push(
      `【世界觀設定 (World View)】\n${character.worldView || "現代都市"}\n\n` +
        `【固定場景與初始環境 (Fixed Header)】\n${character.fixedHeader || currentLocation}`
    );

    // 6. Opening Scene Context (開場劇情)
    if (character.openingScene) {
      sections.push(`【${character.name} 開場劇情與初始狀態】\n${character.openingScene}`);
    }

    // 7. World State & Scene Lock
    sections.push(
      `【當前動態世界狀態與地點（嚴禁跳躍）】\n` +
        `當前地點：${currentLocation}\n` +
        `當前時間：${story.worldState?.time || "夜晚"}\n` +
        `關係階段：${story.worldState?.relationship || "初識"}\n` +
        `當前情境：${story.worldState?.situation || "交談中"}`
    );

    // 8. Relevant Memories
    if (memories.length > 0) {
      const memoryText = memories
        .map((m) => `- [${m.type}] ${m.content}`)
        .join("\n");
      sections.push(`【長期記憶庫 (Relevant Memory)】\n${memoryText}`);
    }

    // 9. Story Summary
    if (story.summary) {
      sections.push(`【先前劇情摘要】\n${story.summary}`);
    }

    return sections.join("\n\n---\n\n");
  }
}
