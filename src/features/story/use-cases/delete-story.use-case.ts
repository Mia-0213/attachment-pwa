import { StoryRepository } from "@/core/repository/story.repository";
import { MessageRepository } from "@/core/repository/message.repository";
import { MemoryRepository } from "@/core/repository/memory.repository";
import { TimelineRepository } from "@/core/repository/timeline.repository";

export class DeleteStoryUseCase {
  private storyRepo = new StoryRepository();
  private messageRepo = new MessageRepository();
  private memoryRepo = new MemoryRepository();
  private timelineRepo = new TimelineRepository();

  public async execute(storyId: string): Promise<void> {
    // 刪除故事實體
    await this.storyRepo.delete(storyId);

    // 完全清理該故事關聯的所有對話訊息、記憶與時間線記錄
    await this.messageRepo.deleteByStoryId(storyId);
    await this.memoryRepo.deleteByStoryId(storyId);
    await this.timelineRepo.deleteByStoryId(storyId);
  }
}
