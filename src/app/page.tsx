"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useHomeViewModel } from "@/features/character/view-model/home.view-model";
import { ExportCharacterUseCase } from "@/features/character/use-cases/export-character.use-case";
import { ImportCharacterUseCase } from "@/features/character/use-cases/import-character.use-case";
import { Sparkles, MessageSquare, Plus, Settings, User, Brain, Download, Upload, UserPlus, Trash2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { characters, recentStories, isLoading, createStoryForCharacter, deleteStory } =
    useHomeViewModel();

  const handleStartChat = async (characterId: string) => {
    const char = characters.find((c) => c.id === characterId);
    if (!char) return;

    // 搜尋是否已有現成故事，若無則建立新故事
    const existing = recentStories.find((s) => s.characterId === characterId);
    if (existing) {
      router.push(`/chat/${existing.id}`);
    } else {
      const newStoryId = await createStoryForCharacter(char);
      router.push(`/chat/${newStoryId}`);
    }
  };

  const handleExportCharacter = (char: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const exportUseCase = new ExportCharacterUseCase();
    exportUseCase.execute(char);
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importUseCase = new ImportCharacterUseCase();
      const newChar = await importUseCase.execute(text);
      alert(`已成功匯入角色【${newChar.name}】！`);
      window.location.reload();
    } catch (err: any) {
      alert(`匯入失敗: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 space-y-6 pb-20">
      {/* 頂部 Header */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Attachment
          </h1>
          <p className="text-xs text-slate-400">AI Roleplay Companion PWA</p>
        </div>
        <button
          onClick={() => router.push("/settings")}
          className="p-2 rounded-full glass-panel hover:bg-slate-800 text-slate-300 transition-colors"
          title="設定"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* 載入中狀態 */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">載入角色庫中...</p>
          </div>
        </div>
      ) : (
        <>
          {/* 最近陪伴 / 故事清單 */}
          {recentStories.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  最近對話
                </h2>
              </div>
              <div className="space-y-2">
                {recentStories.map((story) => {
                  const char = characters.find((c) => c.id === story.characterId);
                  return (
                    <div
                      key={story.id}
                      onClick={() => router.push(`/chat/${story.id}`)}
                      className="glass-panel p-4 rounded-xl cursor-pointer hover:border-indigo-500/50 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                          {char?.name.substring(0, 1) || "AI"}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                            {char?.name || "未知角色"}
                          </h3>
                          <p className="text-xs text-slate-400 truncate max-w-[170px]">
                            {story.worldState.situation || "點擊繼續故事"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/memory/${story.id}`);
                          }}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-950 text-indigo-300 text-xs flex items-center gap-1 border border-slate-700"
                          title="檢視 AI 記憶庫"
                        >
                          <Brain className="w-3.5 h-3.5" />
                          記憶
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`確定要刪除與【${char?.name || "此角色"}】的這筆對話紀錄嗎？`)) {
                              deleteStory(story.id);
                            }
                          }}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                          title="刪除此對話紀錄"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 我的角色清單 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                我的陪伴角色
              </h2>
              <div className="flex items-center space-x-2">
                <label className="p-1.5 rounded-lg glass-panel hover:bg-slate-800 text-slate-300 cursor-pointer flex items-center gap-1 text-xs">
                  <Upload className="w-3.5 h-3.5" />
                  匯入 JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => router.push("/character/new")}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-1 shadow-md shadow-indigo-600/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  新增角色
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="glass-panel p-4 rounded-2xl space-y-3 border border-slate-800 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 via-indigo-900 to-slate-900 border border-slate-700 flex items-center justify-center text-xl font-bold text-indigo-200 shadow-inner">
                        {char.name.substring(0, 1)}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-100">
                          {char.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {char.occupation || "AI Roleplay Character"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleExportCharacter(char, e)}
                      className="p-1.5 rounded-lg glass-panel hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
                      title="匯出角色 JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                    {char.background || char.openingScene}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-wrap gap-1">
                      {typeof char.personality === "string"
                        ? char.personality.split("、").slice(0, 3).map((trait: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400"
                            >
                              {trait}
                            </span>
                          ))
                        : null}
                    </div>
                    <button
                      onClick={() => handleStartChat(char.id)}
                      className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      開啟故事
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* 底部導覽列 (Mobile Nav) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-3 px-6 z-50">
        <button
          onClick={() => router.push("/")}
          className="flex flex-col items-center space-y-1 text-indigo-400"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">首頁</span>
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="flex flex-col items-center space-y-1 text-slate-400 hover:text-slate-200"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">設定</span>
        </button>
      </nav>
    </div>
  );
}
