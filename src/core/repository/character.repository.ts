import { Character } from "@/features/character/types/character.type";
import { indexedDbService } from "@/core/database/indexed-db.service";

export interface ICharacterRepository {
  getById(id: string): Promise<Character | null>;
  list(): Promise<Character[]>;
  save(character: Character): Promise<void>;
  delete(id: string): Promise<void>;
}

export class CharacterRepository implements ICharacterRepository {
  private readonly storeName = "characters";

  public async getById(id: string): Promise<Character | null> {
    return indexedDbService.get<Character>(this.storeName, id);
  }

  public async list(): Promise<Character[]> {
    return indexedDbService.getAll<Character>(this.storeName);
  }

  public async save(character: Character): Promise<void> {
    await indexedDbService.put<Character>(this.storeName, character);
  }

  public async delete(id: string): Promise<void> {
    await indexedDbService.delete(this.storeName, id);
  }
}
