import { Character } from "@/features/character/types/character.type";
import { CharacterRepository } from "@/core/repository/character.repository";

export class ImportCharacterUseCase {
  private characterRepo = new CharacterRepository();

  public async execute(jsonContent: string): Promise<Character> {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonContent);
    } catch {
      throw new Error("格式錯誤：非有效的 JSON 檔案");
    }

    if (!parsed.name) {
      throw new Error("格式錯誤：缺少必要的角色名稱 (name)");
    }

    const importedChar: Character = {
      id: parsed.id || `char_imported_${Date.now()}`,
      name: parsed.name,
      avatar: parsed.avatar || "avatar_default",
      age: String(parsed.age || "25"),
      gender: parsed.gender || "未知",
      occupation: parsed.occupation || "角色",
      personality: typeof parsed.personality === "string" ? parsed.personality : JSON.stringify(parsed.personality),
      speechStyle: typeof parsed.speechStyle === "string" ? parsed.speechStyle : JSON.stringify(parsed.speechStyle),
      background: typeof parsed.background === "string" ? parsed.background : JSON.stringify(parsed.background),
      worldView: typeof parsed.worldView === "string" ? parsed.worldView : JSON.stringify(parsed.worldView),
      fixedHeader: parsed.fixedHeader || "預設場景",
      systemPrompt: parsed.systemPrompt || "請扮演該角色，保持角色一致性。",
      openingScene: typeof parsed.openingScene === "string" ? parsed.openingScene : parsed.openingScene?.firstMessage || "你來了。",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.characterRepo.save(importedChar);
    return importedChar;
  }
}
