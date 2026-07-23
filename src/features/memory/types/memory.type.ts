export type MemoryType = "player" | "story" | "relationship";

export interface Memory {
  id: string;
  storyId: string;
  type: MemoryType;
  priority: number;
  content: string;
  importanceScore: number;
  createdAt: number;
}
