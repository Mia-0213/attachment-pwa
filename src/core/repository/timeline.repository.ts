import { TimelineEvent } from "@/features/story/types/timeline.type";
import { indexedDbService } from "@/core/database/indexed-db.service";

export interface ITimelineRepository {
  getById(id: string): Promise<TimelineEvent | null>;
  getByStoryId(storyId: string): Promise<TimelineEvent[]>;
  save(event: TimelineEvent): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByStoryId(storyId: string): Promise<void>;
}

export class TimelineRepository implements ITimelineRepository {
  private readonly storeName = "timeline";

  public async getById(id: string): Promise<TimelineEvent | null> {
    return indexedDbService.get<TimelineEvent>(this.storeName, id);
  }

  public async getByStoryId(storyId: string): Promise<TimelineEvent[]> {
    const list = await indexedDbService.getByIndex<TimelineEvent>(this.storeName, "storyId", storyId);
    return list.sort((a, b) => a.createdAt - b.createdAt);
  }

  public async save(event: TimelineEvent): Promise<void> {
    await indexedDbService.put<TimelineEvent>(this.storeName, event);
  }

  public async delete(id: string): Promise<void> {
    await indexedDbService.delete(this.storeName, id);
  }

  public async deleteByStoryId(storyId: string): Promise<void> {
    const list = await this.getByStoryId(storyId);
    for (const item of list) {
      await this.delete(item.id);
    }
  }
}
