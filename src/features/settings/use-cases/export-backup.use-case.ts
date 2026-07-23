import { CharacterRepository } from "@/core/repository/character.repository";
import { StoryRepository } from "@/core/repository/story.repository";
import { MessageRepository } from "@/core/repository/message.repository";
import { MemoryRepository } from "@/core/repository/memory.repository";
import { TimelineRepository } from "@/core/repository/timeline.repository";
import { SettingsRepository } from "@/core/repository/settings.repository";

export class ExportBackupUseCase {
  public async execute(): Promise<void> {
    const charRepo = new CharacterRepository();
    const storyRepo = new StoryRepository();
    const msgRepo = new MessageRepository();
    const memRepo = new MemoryRepository();
    const timelineRepo = new TimelineRepository();
    const settingsRepo = new SettingsRepository();

    const characters = await charRepo.list();
    const stories = await storyRepo.list();
    const settings = await settingsRepo.get();

    const messages = [];
    const memories = [];
    const timeline = [];

    for (const story of stories) {
      const msgList = await msgRepo.getByStoryId(story.id);
      messages.push(...msgList);

      const memList = await memRepo.getByStoryId(story.id);
      memories.push(...memList);

      const timelineList = await timelineRepo.getByStoryId(story.id);
      timeline.push(...timelineList);
    }

    const backupData = {
      version: "2.0",
      exportDate: Date.now(),
      characters,
      stories,
      messages,
      memories,
      timeline,
      settings,
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attachment_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
