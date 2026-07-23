import { Character } from "@/features/character/types/character.type";
import { CharacterRepository } from "@/core/repository/character.repository";

export class CreateCharacterUseCase {
  private characterRepo = new CharacterRepository();

  public async execute(character: Omit<Character, "id" | "createdAt" | "updatedAt">): Promise<Character> {
    const newChar: Character = {
      ...character,
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.characterRepo.save(newChar);
    return newChar;
  }
}
