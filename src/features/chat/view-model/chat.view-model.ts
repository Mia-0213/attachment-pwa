import { useState, useEffect, useCallback, useRef } from "react";
import { Story } from "@/features/story/types/story.type";
import { Character } from "@/features/character/types/character.type";
import { Message } from "@/features/chat/types/message.type";
import { Memory } from "@/features/memory/types/memory.type";
import { CharacterRepository } from "@/core/repository/character.repository";
import { StoryRepository } from "@/core/repository/story.repository";
import { MessageRepository } from "@/core/repository/message.repository";
import { MemoryRepository } from "@/core/repository/memory.repository";
import { SettingsRepository } from "@/core/repository/settings.repository";
import { PromptEngine } from "@/core/ai/engines/prompt-engine";
import { ContextEngine } from "@/core/ai/engines/context-engine";
import { aiEngine } from "@/core/ai/engines/ai-engine";
import { ExtractMemoryUseCase } from "@/features/memory/use-cases/extract-memory.use-case";
import { StorySummaryEngine } from "@/core/ai/engines/story-summary.engine";
import { AddTimelineEventUseCase } from "@/features/story/use-cases/add-timeline-event.use-case";

export function useChatViewModel(storyId: string) {
  const [story, setStory] = useState<Story | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [inputContent, setInputContent] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  const abortControllerRef = useRef<boolean>(false);

  const characterRepo = new CharacterRepository();
  const storyRepo = new StoryRepository();
  const messageRepo = new MessageRepository();
  const memoryRepo = new MemoryRepository();
  const settingsRepo = new SettingsRepository();

  const promptEngine = new PromptEngine();
  const contextEngine = new ContextEngine();

  const loadChatData = useCallback(async () => {
    setIsLoading(true);
    try {
      const storyData = await storyRepo.getById(storyId);
      if (!storyData) return;
      setStory(storyData);

      const charData = await characterRepo.getById(storyData.characterId);
      if (charData) setCharacter(charData);

      const msgList = await messageRepo.getByStoryId(storyId);
      setMessages(msgList);

      const memList = await memoryRepo.getByStoryId(storyId);
      setMemories(memList);
    } catch (err) {
      console.error("載入對話資料失敗:", err);
    } finally {
      setIsLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    loadChatData();
  }, [loadChatData]);

  // 發送訊息並觸發 AI Streaming 串流
  const sendMessage = async (overrideText?: string) => {
    const textToSend = overrideText !== undefined ? overrideText : inputContent;
    if (!textToSend.trim() || !story || !character || isStreaming) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}_user`,
      storyId: story.id,
      role: "user",
      content: textToSend.trim(),
      status: "completed",
      createdAt: Date.now(),
    };

    await messageRepo.save(userMsg);
    setMessages((prev) => [...prev, userMsg]);
    if (overrideText === undefined) setInputContent("");

    await triggerAIResponse([...messages, userMsg]);
  };

  // 觸發 AI 回覆
  const triggerAIResponse = async (currentMessages: Message[]) => {
    if (!story || !character) return;

    const settings = await settingsRepo.get();
    if (!settings || !settings.apiKey) {
      alert("請先至【設定】頁面配置您的 API Key！");
      return;
    }

    setIsStreaming(true);
    abortControllerRef.current = false;

    const assistantMsgId = `msg_${Date.now()}_ai`;
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      storyId: story.id,
      role: "assistant",
      content: "",
      status: "streaming",
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);

    try {
      const filteredMemories = contextEngine.filterMemories(memories);
      const systemPrompt = promptEngine.buildSystemPrompt({
        character,
        story,
        memories: filteredMemories,
      });

      const recentMessages = contextEngine.filterRecentMessages(currentMessages);

      const stream = aiEngine.stream(settings.provider || "openai", {
        messages: recentMessages,
        model: settings.model || "gpt-4o-mini",
        apiKey: settings.apiKey,
        systemPrompt,
      });

      let accumulatedContent = "";

      for await (const chunk of stream) {
        if (abortControllerRef.current) break;
        accumulatedContent += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );
      }

      const finalMsg: Message = {
        id: assistantMsgId,
        storyId: story.id,
        role: "assistant",
        content: accumulatedContent,
        status: abortControllerRef.current ? "cancelled" : "completed",
        createdAt: Date.now(),
      };

      await messageRepo.save(finalMsg);

      // 非同步自動觸發記憶提取 (Memory Extractor)
      const extractUseCase = new ExtractMemoryUseCase();
      extractUseCase.execute(story.id, [...currentMessages, finalMsg]).then((newMems) => {
        if (newMems.length > 0) {
          setMemories((prev) => [...prev, ...newMems]);
        }
      });

      // 非同步自動更新故事動態摘要與時間線事件 (Story Summary & Timeline Engine)
      const summaryEngine = new StorySummaryEngine();
      summaryEngine.updateSummary(story, [...currentMessages, finalMsg]).then(async (result) => {
        if (result) {
          const updatedStory = {
            ...story,
            summary: result.summary,
            worldState: result.worldState
              ? { ...story.worldState, ...result.worldState }
              : story.worldState,
            updatedAt: Date.now(),
          };
          await storyRepo.save(updatedStory);
          setStory(updatedStory);

          if (result.timelineEvent) {
            const addTimelineUseCase = new AddTimelineEventUseCase();
            await addTimelineUseCase.execute(story.id, result.timelineEvent);
          }
        }
      });
    } catch (err: any) {
      console.error("AI 串流生成失敗:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: msg.content + `\n[系統錯誤: ${err?.message || "無法連線"}]`, status: "error" }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  // 停止生成
  const stopGeneration = () => {
    abortControllerRef.current = true;
    setIsStreaming(false);
  };

  // 重新生成 (Regenerate)
  const regenerate = async () => {
    if (isStreaming || messages.length === 0) return;

    // 取得最後一條助手的訊息
    const lastMsg = messages[messages.length - 1];
    let targetHistory = [...messages];

    if (lastMsg.role === "assistant") {
      await messageRepo.delete(lastMsg.id);
      targetHistory = messages.slice(0, -1);
      setMessages(targetHistory);
    }

    await triggerAIResponse(targetHistory);
  };

  // 繼續生成 (Continue)
  const continueGeneration = async () => {
    if (isStreaming || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "assistant") return;

    // 透過附加上續寫 Request 繼續生成
    const continuePromptMsg: Message = {
      id: `msg_continue_${Date.now()}`,
      storyId: story!.id,
      role: "user",
      content: "(請繼續接續上一段回應未完的對話與行動)",
      status: "completed",
      createdAt: Date.now(),
    };

    setIsStreaming(true);
    try {
      const settings = await settingsRepo.get();
      if (!settings || !settings.apiKey) return;

      const filteredMemories = contextEngine.filterMemories(memories);
      const systemPrompt = promptEngine.buildSystemPrompt({
        character: character!,
        story: story!,
        memories: filteredMemories,
      });

      const recentMessages = contextEngine.filterRecentMessages([...messages, continuePromptMsg]);

      const stream = aiEngine.stream(settings.provider || "openai", {
        messages: recentMessages,
        model: settings.model || "gpt-4o-mini",
        apiKey: settings.apiKey,
        systemPrompt,
      });

      let addedContent = "";
      for await (const chunk of stream) {
        if (abortControllerRef.current) break;
        addedContent += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === lastMsg.id
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      }

      const updatedMsg: Message = {
        ...lastMsg,
        content: lastMsg.content + addedContent,
        status: "completed",
      };
      await messageRepo.save(updatedMsg);
    } catch (err) {
      console.error("繼續生成失敗:", err);
    } finally {
      setIsStreaming(false);
    }
  };

  // 編輯玩家訊息 (Edit User Message)
  const startEditMessage = (msg: Message) => {
    if (msg.role !== "user") return;
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const confirmEditMessage = async () => {
    if (!editingMessageId || !story) return;

    const msgIndex = messages.findIndex((m) => m.id === editingMessageId);
    if (msgIndex === -1) return;

    // 刪除此訊息之後的所有訊息（包含對應的舊 AI 回應）
    const messagesToDelete = messages.slice(msgIndex);
    for (const m of messagesToDelete) {
      await messageRepo.delete(m.id);
    }

    const updatedUserMsg: Message = {
      id: editingMessageId,
      storyId: story.id,
      role: "user",
      content: editContent.trim(),
      status: "completed",
      createdAt: Date.now(),
    };

    await messageRepo.save(updatedUserMsg);

    const newHistory = [...messages.slice(0, msgIndex), updatedUserMsg];
    setMessages(newHistory);
    setEditingMessageId(null);
    setEditContent("");

    await triggerAIResponse(newHistory);
  };

  // 重啟新劇情 (Restart Story)
  const restartStory = async (): Promise<string | null> => {
    if (!character || !story) return null;

    // 建立新的獨立 Story 實體
    const newStory: Story = {
      id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      characterId: character.id,
      title: `${character.name} 的新故事`,
      summary: "",
      worldState: {
        location: character.openingScene.location,
        time: "晚上",
        weather: "晴朗",
        situation: character.openingScene.description,
        relationship: "初識",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storyRepo.save(newStory);

    // 建立第一條對話
    await messageRepo.save({
      id: `msg_${Date.now()}`,
      storyId: newStory.id,
      role: "assistant",
      content: character.openingScene.firstMessage,
      status: "completed",
      createdAt: Date.now(),
    });

    return newStory.id;
  };

  return {
    story,
    character,
    messages,
    memories,
    inputContent,
    setInputContent,
    isStreaming,
    isLoading,
    editingMessageId,
    editContent,
    setEditContent,
    setEditingMessageId,
    sendMessage,
    stopGeneration,
    regenerate,
    continueGeneration,
    startEditMessage,
    confirmEditMessage,
    restartStory,
  };
}
