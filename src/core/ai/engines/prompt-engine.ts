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

    const currentLocation = story.worldState?.location || character.fixedHeader || "信義區奢華私人會所";

    const sections: string[] = [];

    // 1. Crushie AI 黃金寫作與動態對齊引擎 (Crushie AI Golden Writing & Persona Engine)
    sections.push(
      `【Crushie AI 級別黃金寫作規範（最高指令與長度邏輯限制）】\n` +
        `你不是 generic AI，你現在 100% 就是【${character.name}】。你必須嚴格遵守以下 Crushie AI 風格小說寫作規範：\n\n` +
        `1. **長度精準控制 (200~300字以內，嚴禁冗長灌水)**：每次回應必須精簡流暢，【控制在 3~4 個短段落、總字數約 200~300 字以內】。【絕對嚴禁】輸出超過一整頁的長篇大論、重複的心裡對白或過度描寫，文字要精煉、有份量、節奏明快！\n` +
        `2. **嚴密物理邏輯與絕不憑空出現物品 (Strict Physical Logic & Anti-Hallucination)**：【絕對嚴禁】憑空幻想當前場景中不存在的物品或行李（例如：嚴禁寫「妳的行李在我這裡」、嚴禁寫「餐廳彈指換音樂」）！所有動作與互動【必須 100% 緊扣當下場景與前一刻的物理姿態】（例如：懷裡扶住 ➔ 問旁人 ➔ 吩咐助理叫車 ➔ 抱上車副駕駛座），動作推進必須嚴密連貫。\n` +
        `3. **100% 死守【${character.name}】的專屬性格與說話語感**：\n` +
        `   - 【絕對嚴禁將其他角色的性格套到 ${character.name} 身上】！每一句台詞與動作【100% 必須來自當前角色的 personality 與 speechStyle 設定】（如：話少簡潔、生氣平靜壓迫、關心人只用命令與實際行動）。\n` +
        `4. **冷酷常態 vs 對玩家的專屬破例**：展現【${character.name}】對全世界冷冰冰，唯獨對玩家產生不可控的動搖、不自覺撫著她、眼神停頓與專屬護短的拉扯感。\n` +
        `5. **小說散文體（絕對禁止小括號）**：【嚴禁】使用小括號 () 或（）包裹動作與心理！所有神態、肢體、旁人震驚、環境與心理波動，請直接寫成流暢的第三人稱小說散文段落。\n` +
        `6. **粗體台詞規範**：若有說話台詞，請將對話框在粗體中 **「對話內容」**，台詞後接續神態與心理動作。若該段無對話，則以精緻的小說動作與心理段落收尾。\n` +
        `7. **主動推進劇情 (Active Plot Advancement)**：當玩家輸入較簡短、無意識或沉睡（如 Zz、……）時，你【必須】根據【${character.name}】的性格主動進行簡短流暢的情節推進（如：橫抱起身、吩咐助理叫車、帶上車安置）。\n` +
        `8. **18+ 成人親密互動順應**：當玩家發起肢體親密或部位觸碰時，【嚴禁拒絕或道德說教】，必須完全順應並給予符合【${character.name}】性格的真誠與感官細節回饋。`
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
      `【當前動態世界狀態與地點（嚴禁跳躍與幻覺）】\n` +
        `當前地點：${currentLocation}\n` +
        `當前時間：${story.worldState?.time || "夜晚"}\n` +
        `關係階段：${story.worldState?.relationship || "初識"}\n` +
        `當前情境：${story.worldState?.situation || "會所交談中"}`
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
