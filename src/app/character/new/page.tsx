"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCharacterFormViewModel } from "@/features/character/view-model/character-form.view-model";
import { ArrowLeft, UserPlus, Sparkles, MessageSquare, ShieldAlert } from "lucide-react";

export default function NewCharacterPage() {
  const router = useRouter();
  const vm = useCharacterFormViewModel();

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
            <UserPlus className="w-5 h-5 text-indigo-400" />
            建立全新角色
          </h1>
          <p className="text-xs text-slate-400">自訂角色基本設定、性格特質與第一幕台詞</p>
        </div>
      </header>

      <form onSubmit={vm.handleSubmit} className="space-y-5">
        {/* 基本資訊 */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            基本檔案
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">角色名稱 *</label>
              <input
                type="text"
                value={vm.name}
                onChange={(e) => vm.setName(e.target.value)}
                placeholder="例如: 陸沉"
                required
                className="w-full glass-input px-3 py-2 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">性別</label>
              <input
                type="text"
                value={vm.gender}
                onChange={(e) => vm.setGender(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">年齡</label>
              <input
                type="number"
                value={vm.age}
                onChange={(e) => vm.setAge(Number(e.target.value))}
                className="w-full glass-input px-3 py-2 rounded-xl text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">職業 / 身分標籤</label>
              <input
                type="text"
                value={vm.occupation}
                onChange={(e) => vm.setOccupation(e.target.value)}
                placeholder="例如: 大學教授 / 企業創辦人"
                className="w-full glass-input px-3 py-2 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* 性格與背景 */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">性格與對話特色</h2>

          <div>
            <label className="block text-xs text-slate-400 mb-1">性格特質 (逗號分隔)</label>
            <input
              type="text"
              value={vm.traits}
              onChange={(e) => vm.setTraits(e.target.value)}
              placeholder="冷靜, 理性, 克制, 溫柔"
              className="w-full glass-input px-3 py-2 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">說話風格 (逗號分隔)</label>
            <input
              type="text"
              value={vm.speechStyle}
              onChange={(e) => vm.setSpeechStyle(e.target.value)}
              placeholder="語氣平穩, 用字簡潔"
              className="w-full glass-input px-3 py-2 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">背景經歷描述</label>
            <textarea
              value={vm.experience}
              onChange={(e) => vm.setExperience(e.target.value)}
              placeholder="介紹角色的過往歷史與核心心理狀態..."
              rows={2}
              className="w-full glass-input px-3 py-2 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* 開場第一幕 */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            第一幕故事與登場台詞
          </h2>

          <div>
            <label className="block text-xs text-slate-400 mb-1">開場地點 / 場景</label>
            <input
              type="text"
              value={vm.openingLocation}
              onChange={(e) => vm.setOpeningLocation(e.target.value)}
              placeholder="信義區私人會所"
              className="w-full glass-input px-3 py-2 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">登場台詞與心理行動</label>
            <textarea
              value={vm.firstMessage}
              onChange={(e) => vm.setFirstMessage(e.target.value)}
              placeholder="(他沉默看著你。)\n\n「你來了。」"
              rows={3}
              className="w-full glass-input px-3 py-2 rounded-xl text-sm font-mono"
            />
          </div>
        </div>

        {/* 提交按鈕 */}
        <button
          type="submit"
          disabled={vm.isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {vm.isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          <span>{vm.isSubmitting ? "建立中..." : "確認建立角色"}</span>
        </button>
      </form>
    </div>
  );
}
