import { Story } from "@/features/story/types/story.type";
import { indexedDbService } from "@/core/database/indexed-db.service";

export interface IStoryRepository {
  getById(id: string): Promise<Story | null>;
  getByCharacterId(characterId: string): Promise<Story[]>;
  list(): Promise<Story[]>;
  save(story: Story): Promise<void>;
  delete(id: string): Promise<void>;
}

export class StoryRepository implements IStoryRepository {
  private readonly storeName = "stories";

  public async getById(id: string): Promise<Story | null> {
    return indexedDbService.get<Story>(this.storeName, id);
  }

  public async getByCharacterId(characterId: string): Promise<Story[]> {
    return indexedDbService.getByIndex<Story>(this.storeName, "characterId", characterId);
  }

  public async list(): Promise<Story[]> {
    return indexedDbService.getAll<Story>(this.storeName);
  }

  public async save(story: Story): Promise<void> {
    await indexedDbService.put<Story>(this.storeName, story);
  }

  public async delete(id: string): Promise<void> {
    await indexedDbService.delete(this.storeName, id);
  }
}
