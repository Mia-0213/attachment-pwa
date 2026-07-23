import { Message } from "@/features/chat/types/message.type";
import { indexedDbService } from "@/core/database/indexed-db.service";

export interface IMessageRepository {
  getById(id: string): Promise<Message | null>;
  getByStoryId(storyId: string): Promise<Message[]>;
  save(message: Message): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByStoryId(storyId: string): Promise<void>;
}

export class MessageRepository implements IMessageRepository {
  private readonly storeName = "messages";

  public async getById(id: string): Promise<Message | null> {
    return indexedDbService.get<Message>(this.storeName, id);
  }

  public async getByStoryId(storyId: string): Promise<Message[]> {
    const list = await indexedDbService.getByIndex<Message>(this.storeName, "storyId", storyId);
    return list.sort((a, b) => a.createdAt - b.createdAt);
  }

  public async save(message: Message): Promise<void> {
    await indexedDbService.put<Message>(this.storeName, message);
  }

  public async delete(id: string): Promise<void> {
    await indexedDbService.delete(this.storeName, id);
  }

  public async deleteByStoryId(storyId: string): Promise<void> {
    const messages = await this.getByStoryId(storyId);
    for (const msg of messages) {
      await this.delete(msg.id);
    }
  }
}
