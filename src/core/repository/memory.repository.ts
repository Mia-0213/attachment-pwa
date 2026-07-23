import { Memory } from "@/features/memory/types/memory.type";
import { indexedDbService } from "@/core/database/indexed-db.service";

export interface IMemoryRepository {
  getById(id: string): Promise<Memory | null>;
  getByStoryId(storyId: string): Promise<Memory[]>;
  save(memory: Memory): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByStoryId(storyId: string): Promise<void>;
}

export class MemoryRepository implements IMemoryRepository {
  private readonly storeName = "memories";

  public async getById(id: string): Promise<Memory | null> {
    return indexedDbService.get<Memory>(this.storeName, id);
  }

  public async getByStoryId(storyId: string): Promise<Memory[]> {
    const list = await indexedDbService.getByIndex<Memory>(this.storeName, "storyId", storyId);
    return list.sort((a, b) => b.importanceScore - a.importanceScore);
  }

  public async save(memory: Memory): Promise<void> {
    await indexedDbService.put<Memory>(this.storeName, memory);
  }

  public async delete(id: string): Promise<void> {
    await indexedDbService.delete(this.storeName, id);
  }

  public async deleteByStoryId(storyId: string): Promise<void> {
    const memories = await this.getByStoryId(storyId);
    for (const mem of memories) {
      await this.delete(mem.id);
    }
  }
}
