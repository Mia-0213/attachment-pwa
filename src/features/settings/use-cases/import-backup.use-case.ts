import { CharacterRepository } from "@/core/repository/character.repository";
import { StoryRepository } from "@/core/repository/story.repository";
import { MessageRepository } from "@/core/repository/message.repository";
import { MemoryRepository } from "@/core/repository/memory.repository";
import { TimelineRepository } from "@/core/repository/timeline.repository";
import { SettingsRepository } from "@/core/repository/settings.repository";

export class ImportBackupUseCase {
  public async execute(jsonContent: string): Promise<void> {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonContent);
    } catch {
      throw new Error("備份檔案格式錯誤：非有效的 JSON");
    }

    if (!parsed.characters || !parsed.stories) {
      throw new Error("備份檔案格式錯誤：缺少必要的 characters 或 stories 數據");
    }

    const charRepo = new CharacterRepository();
    const storyRepo = new StoryRepository();
    const msgRepo = new MessageRepository();
    const memRepo = new MemoryRepository();
    const timelineRepo = new TimelineRepository();
    const settingsRepo = new SettingsRepository();

    if (Array.isArray(parsed.characters)) {
      for (const item of parsed.characters) {
        await charRepo.save(item);
      }
    }

    if (Array.isArray(parsed.stories)) {
      for (const item of parsed.stories) {
        await storyRepo.save(item);
      }
    }

    if (Array.isArray(parsed.messages)) {
      for (const item of parsed.messages) {
        await msgRepo.save(item);
      }
    }

    if (Array.isArray(parsed.memories)) {
      for (const item of parsed.memories) {
        await memRepo.save(item);
      }
    }

    if (Array.isArray(parsed.timeline)) {
      for (const item of parsed.timeline) {
        await timelineRepo.save(item);
      }
    }

    if (parsed.settings) {
      await settingsRepo.save(parsed.settings);
    }
  }
}
