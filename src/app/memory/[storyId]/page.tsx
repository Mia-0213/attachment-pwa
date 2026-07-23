"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useMemoryViewerViewModel } from "@/features/memory/view-model/memory-viewer.view-model";
import { ArrowLeft, Search, Trash2, Brain, UserCheck, BookOpen, Heart } from "lucide-react";

export default function MemoryViewerPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;

  const {
    memories,
    totalCount,
    filterType,
    setFilterType,
    searchKeyword,
    setSearchKeyword,
    isLoading,
    deleteMemory,
  } = useMemoryViewerViewModel(storyId);

  return (
    <div className="flex-1 flex flex-col px-4 py-6 space-y-6 pb-20">
      {/* Header */}
      <header className="flex items-center space-x-3 pb-3 border-b border-slate-800">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full glass-panel hover:bg-slate-800 text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            AI 記憶庫 ({totalCount})
          </h1>
          <p className="text-xs text-slate-400">檢視與管理 AI 對您的長期記憶記錄</p>
        </div>
      </header>

      {/* 搜尋與篩選 */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜尋記憶關鍵字..."
            className="w-full glass-input pl-9 pr-4 py-2 rounded-xl text-sm"
          />
        </div>

        {/* 類別標籤按鈕 */}
        <div className="flex space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === "all"
                ? "bg-indigo-600 text-white"
                : "glass-panel text-slate-400 hover:text-slate-200"
            }`}
          >
            全部 ({totalCount})
          </button>
          <button
            onClick={() => setFilterType("player")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              filterType === "player"
                ? "bg-purple-600 text-white"
                : "glass-panel text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            玩家資訊
          </button>
          <button
            onClick={() => setFilterType("story")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              filterType === "story"
                ? "bg-amber-600 text-white"
                : "glass-panel text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            劇情事件
          </button>
          <button
            onClick={() => setFilterType("relationship")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              filterType === "relationship"
                ? "bg-rose-600 text-white"
                : "glass-panel text-slate-400 hover:text-slate-200"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            關係羈絆
          </button>
        </div>
      </div>

      {/* 記憶清單內容 */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : memories.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center glass-panel rounded-2xl border-slate-800">
          <Brain className="w-10 h-10 text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-400">目前尚無相關記憶記錄</p>
          <p className="text-xs text-slate-500 mt-1">隨著對話推進，AI 將會自動分析並記錄重要記憶</p>
        </div>
      ) : (
        <div className="space-y-3">
          {memories.map((mem) => {
            const isPlayer = mem.type === "player";
            const isStory = mem.type === "story";

            return (
              <div
                key={mem.id}
                className="glass-panel p-4 rounded-xl space-y-2 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        isPlayer
                          ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                          : isStory
                          ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      }`}
                    >
                      {isPlayer ? "玩家記憶" : isStory ? "劇情記憶" : "關係記憶"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      重要度: {mem.importanceScore}/10
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-normal">
                    {mem.content}
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    {new Date(mem.createdAt).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => deleteMemory(mem.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                  title="刪除此記憶"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
