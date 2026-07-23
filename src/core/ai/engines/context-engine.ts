import { Memory } from "@/features/memory/types/memory.type";
import { Message } from "@/features/chat/types/message.type";

export class ContextEngine {
  private readonly maxMemoryCount = 10;
  private readonly maxRecentMessagesCount = 20;

  // 根據重要度分數過濾與排序記憶
  public filterMemories(memories: Memory[]): Memory[] {
    return [...memories]
      .sort((a, b) => b.importanceScore - a.importanceScore)
      .slice(0, this.maxMemoryCount);
  }

  // 截取近期訊息以控制 Token 消耗
  public filterRecentMessages(messages: Message[]): Message[] {
    if (messages.length <= this.maxRecentMessagesCount) {
      return messages;
    }
    return messages.slice(messages.length - this.maxRecentMessagesCount);
  }
}
