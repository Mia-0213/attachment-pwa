import { Memory } from "@/features/memory/types/memory.type";
import { Message } from "@/features/chat/types/message.type";
import { MemoryRepository } from "@/core/repository/memory.repository";
import { MemoryExtractor } from "@/core/ai/engines/memory-extractor";

export class ExtractMemoryUseCase {
  private memoryRepo = new MemoryRepository();
  private extractor = new MemoryExtractor();

  public async execute(storyId: string, messages: Message[]): Promise<Memory[]> {
    const items = await this.extractor.extract(messages);
    if (items.length === 0) return [];

    const existingMemories = await this.memoryRepo.getByStoryId(storyId);
    const existingContentSet = new Set(existingMemories.map((m) => m.content.trim()));

    const newMemories: Memory[] = [];

    for (const item of items) {
      if (existingContentSet.has(item.content.trim())) continue;

      const priority = item.type === "player" ? 1 : item.type === "story" ? 2 : 3;

      const memObj: Memory = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        storyId,
        type: item.type,
        priority,
        content: item.content.trim(),
        importanceScore: item.importance,
        createdAt: Date.now(),
      };

      await this.memoryRepo.save(memObj);
      newMemories.push(memObj);
    }

    return newMemories;
  }
}
