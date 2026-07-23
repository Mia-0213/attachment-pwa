import { useState, useEffect, useCallback } from "react";
import { TimelineEvent } from "@/features/story/types/timeline.type";
import { Story } from "@/features/story/types/story.type";
import { TimelineRepository } from "@/core/repository/timeline.repository";
import { StoryRepository } from "@/core/repository/story.repository";

export function useTimelineViewModel(storyId: string) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const timelineRepo = new TimelineRepository();
  const storyRepo = new StoryRepository();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const storyData = await storyRepo.getById(storyId);
      setStory(storyData);

      const list = await timelineRepo.getByStoryId(storyId);
      setEvents(list);
    } catch (err) {
      console.error("載入時間線失敗:", err);
    } finally {
      setIsLoading(false);
    }
  }, [storyId]);

  const deleteEvent = async (id: string) => {
    try {
      await timelineRepo.delete(id);
      setEvents((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("刪除時間線事件失敗:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    story,
    events,
    isLoading,
    deleteEvent,
    refresh: loadData,
  };
}
