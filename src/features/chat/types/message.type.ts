export type MessageRole = "user" | "assistant";

export type MessageStatus =
  | "idle"
  | "loading"
  | "streaming"
  | "completed"
  | "cancelled"
  | "error";

export interface Message {
  id: string;
  storyId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: number;
}
