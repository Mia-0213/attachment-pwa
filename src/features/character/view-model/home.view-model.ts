import { useState, useEffect, useCallback } from "react";
import { Character } from "@/features/character/types/character.type";
import { Story } from "@/features/story/types/story.type";
import { CharacterRepository } from "@/core/repository/character.repository";
import { StoryRepository } from "@/core/repository/story.repository";
import { MessageRepository } from "@/core/repository/message.repository";
import { DeleteStoryUseCase } from "@/features/story/use-cases/delete-story.use-case";
import defaultCharacterData from "@/features/character/data/xiaojingchen.json";

export function useHomeViewModel() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const characterRepo = new CharacterRepository();
  const storyRepo = new StoryRepository();

  const initData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 始終強制更新最新 13 維度「蕭景琛」官方設定至本機資料庫
      const defaultChar: Character = {
        ...(defaultCharacterData as unknown as Character),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await characterRepo.save(defaultChar);

      const charList = await characterRepo.list();
      setCharacters(charList);

      const stories = await storyRepo.list();
      stories.sort((a, b) => b.updatedAt - a.updatedAt);
      setRecentStories(stories);
    } catch (err) {
      console.error("初始化 Home 資料失敗:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createStoryForCharacter = async (character: Character): Promise<string> => {
    const openingText = typeof character.openingScene === "string" 
      ? character.openingScene 
      : (character.openingScene as any)?.firstMessage || "你來了。";

    // 優先精準採用開場地點（如：信義區奢華私人會所）
    const locationText = character.openingScene.includes("私人會所")
      ? "信義區最奢華的私人會所"
      : character.fixedHeader || "對話場所";

    const newStory: Story = {
      id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      characterId: character.id,
      title: `${character.name} 的對話`,
      summary: "",
      worldState: {
        location: locationText,
        time: "晚上",
        weather: "晴朗",
        situation: "會所初次相遇",
        relationship: "初識",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storyRepo.save(newStory);

    // 建立第一條對話（Opening Scene）
    const messageRepo = new MessageRepository();
    await messageRepo.save({
      id: `msg_${Date.now()}`,
      storyId: newStory.id,
      role: "assistant",
      content: openingText,
      status: "completed",
      createdAt: Date.now(),
    });

    return newStory.id;
  };

  const deleteStory = async (storyId: string) => {
    try {
      const deleteUseCase = new DeleteStoryUseCase();
      await deleteUseCase.execute(storyId);
      setRecentStories((prev) => prev.filter((s) => s.id !== storyId));
    } catch (err) {
      console.error("刪除故事失敗:", err);
    }
  };

  useEffect(() => {
    initData();
  }, [initData]);

  return {
    characters,
    recentStories,
    isLoading,
    createStoryForCharacter,
    deleteStory,
    refresh: initData,
  };
}
