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
      // 自動清理歷史對話中的錯誤提示文字卡條，保護故事對話紀錄乾淨
      const cleanList = msgList.filter(
        (m) => !m.content.includes("[系統錯誤:") && !m.content.includes("429")
      );
      setMessages(cleanList);

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

  // 觸發 AI 回覆（包含用戶端自動重試與氣泡保護機制）
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

    const filteredMemories = contextEngine.filterMemories(memories);
    const systemPrompt = promptEngine.buildSystemPrompt({
      character,
      story,
      memories: filteredMemories,
    });
    const recentMessages = contextEngine.filterRecentMessages(currentMessages);

    let success = false;
    let accumulatedContent = "";

    // 🔄 用戶端最多自動重試 2 次 (靜默處理 429 情況)
    for (let attempt = 0; attempt < 2; attempt++) {
      if (abortControllerRef.current) break;

      try {
        const stream = aiEngine.stream(settings.provider || "openai", {
          messages: recentMessages,
          model: settings.model || "gpt-4o-mini",
          apiKey: settings.apiKey,
          systemPrompt,
        });

        accumulatedContent = "";

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

        if (accumulatedContent.trim()) {
          success = true;
          break; // 生成成功！
        }
      } catch (err: any) {
        console.warn(`[ClientRetry] 第 ${attempt + 1} 次連線嘗試失敗: ${err.message}`);
        if (attempt === 0) {
          // 等待 2.5 秒靜默重試
          await new Promise((res) => setTimeout(res, 2500));
        }
      }
    }

    if (success && accumulatedContent.trim()) {
      const finalMsg: Message = {
        id: assistantMsgId,
        storyId: story.id,
        role: "assistant",
        content: accumulatedContent,
        status: abortControllerRef.current ? "cancelled" : "completed",
        createdAt: Date.now(),
      };

      await messageRepo.save(finalMsg);

      // 非同步記憶與摘要更新
      const extractUseCase = new ExtractMemoryUseCase();
      extractUseCase.execute(story.id, [...currentMessages, finalMsg]).then((newMems) => {
        if (newMems.length > 0) {
          setMemories((prev) => [...prev, ...newMems]);
        }
      });

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
    } else {
      // 失敗時刪除空訊息氣泡，保護對話記錄乾淨不污染
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMsgId));
    }

    setIsStreaming(false);
  };

  // 停止生成
  const stopGeneration = () => {
    abortControllerRef.current = true;
    setIsStreaming(false);
  };

  // 重新生成 (Regenerate)
  const regenerate = async () => {
    if (isStreaming || messages.length === 0) return;

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

    const promptForContinue: Message = {
      id: `msg_${Date.now()}_user`,
      storyId: story!.id,
      role: "user",
      content: "(請繼續生成劇情內容...)",
      status: "completed",
      createdAt: Date.now(),
    };

    await triggerAIResponse([...messages, promptForContinue]);
  };

  // 編輯訊息 (Start Edit)
  const startEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditContent(currentContent);
  };

  // 確認編輯 (Confirm Edit)
  const confirmEditMessage = async (messageId: string) => {
    if (!editContent.trim()) return;

    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg) return;

    const updatedMsg: Message = {
      ...targetMsg,
      content: editContent.trim(),
    };

    await messageRepo.save(updatedMsg);

    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? updatedMsg : msg))
    );

    setEditingMessageId(null);
    setEditContent("");

    // 若編輯的是 user 訊息，自動重新生成後續回覆
    if (targetMsg.role === "user") {
      const msgIndex = messages.findIndex((m) => m.id === messageId);
      if (msgIndex !== -1) {
        const slicedHistory = messages.slice(0, msgIndex);
        const newHistory = [...slicedHistory, updatedMsg];

        // 刪除該訊息之後的所有訊息
        const futureMsgs = messages.slice(msgIndex + 1);
        for (const fMsg of futureMsgs) {
          await messageRepo.delete(fMsg.id);
        }

        setMessages(newHistory);
        await triggerAIResponse(newHistory);
      }
    }
  };

  // 重啟劇情 (Restart Story)
  const restartStory = async (): Promise<string | null> => {
    if (!story || !character) return null;

    // 刪除當前故事的所有訊息
    await messageRepo.deleteByStoryId(story.id);

    // 重新載入角色最新 13 維度設定
    const charData = await characterRepo.getById(story.characterId);
    const activeChar = charData || character;

    const openingText =
      typeof activeChar.openingScene === "string"
        ? activeChar.openingScene
        : (activeChar.openingScene as any)?.firstMessage || "你來了。";

    // 更新故事地點與關係
    const updatedStory: Story = {
      ...story,
      summary: "",
      worldState: {
        location: activeChar.openingScene.includes("私人會所")
          ? "信義區最奢華的私人會所"
          : activeChar.fixedHeader || "對話場所",
        time: "夜晚",
        weather: "晴朗",
        situation: "會所初次相遇",
        relationship: "初識",
      },
      updatedAt: Date.now(),
    };

    await storyRepo.save(updatedStory);

    // 寫入首條開場訊息
    const firstMsg: Message = {
      id: `msg_${Date.now()}_opening`,
      storyId: story.id,
      role: "assistant",
      content: openingText,
      status: "completed",
      createdAt: Date.now(),
    };

    await messageRepo.save(firstMsg);
    setMessages([firstMsg]);
    setStory(updatedStory);

    return story.id;
  };

  return {
    story,
    character,
    messages,
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
