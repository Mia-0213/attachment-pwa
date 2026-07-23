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

    if (!parsed.name || !parsed.prompt || !parsed.openingScene) {
      throw new Error("格式錯誤：缺少必要的角色欄位 (name, prompt, openingScene)");
    }

    const importedChar: Character = {
      id: parsed.id || `char_imported_${Date.now()}`,
      name: parsed.name,
      avatar: parsed.avatar || "",
      basic: parsed.basic || { age: 25, gender: "未知", occupation: "角色" },
      personality: parsed.personality || { traits: ["特別"], speechStyle: ["優雅"] },
      background: parsed.background || { experience: "無特別記載" },
      world: parsed.world || { era: "現代", location: "都市" },
      openingScene: parsed.openingScene,
      prompt: parsed.prompt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.characterRepo.save(importedChar);
    return importedChar;
  }
}
