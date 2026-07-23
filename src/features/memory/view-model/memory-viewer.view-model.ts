import { useState, useEffect, useCallback, useMemo } from "react";
import { Memory, MemoryType } from "@/features/memory/types/memory.type";
import { MemoryRepository } from "@/core/repository/memory.repository";

export function useMemoryViewerViewModel(storyId: string) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filterType, setFilterType] = useState<MemoryType | "all">("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const memoryRepo = new MemoryRepository();

  const loadMemories = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await memoryRepo.getByStoryId(storyId);
      setMemories(list);
    } catch (err) {
      console.error("載入記憶清單失敗:", err);
    } finally {
      setIsLoading(false);
    }
  }, [storyId]);

  const deleteMemory = async (id: string) => {
    try {
      await memoryRepo.delete(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("刪除記憶失敗:", err);
    }
  };

  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const matchesType = filterType === "all" || m.type === filterType;
      const matchesKeyword =
        !searchKeyword.trim() ||
        m.content.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchesType && matchesKeyword;
    });
  }, [memories, filterType, searchKeyword]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  return {
    memories: filteredMemories,
    totalCount: memories.length,
    filterType,
    setFilterType,
    searchKeyword,
    setSearchKeyword,
    isLoading,
    deleteMemory,
    refresh: loadMemories,
  };
}
