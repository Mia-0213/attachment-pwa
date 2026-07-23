"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCharacterFormViewModel } from "@/features/character/view-model/character-form.view-model";
import { ArrowLeft, UserPlus, Sparkles, MessageSquare, BookOpen, ScrollText, Building, Key } from "lucide-react";

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
            建立 13 維度角色靈魂
          </h1>
          <p className="text-xs text-slate-400">定義角色的性格、背景、說話風格與固定場景環境</p>
        </div>
      </header>

      <form onSubmit={vm.handleSubmit} className="space-y-5">
        {/* 基本檔案 (1-6) */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            基本檔案 (Identity)
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">角色名稱 (name) *</label>
              <input
                type="text"
                value={vm.name}
                onChange={(e) => vm.setName(e.target.value)}
                placeholder="例如: 蕭景琛 / 陸沉"
                required
                className="w-full glass-input px-3 py-2 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">性別 (gender)</label>
              <input
                type="text"
                value={vm.gender}
                onChange={(e) => vm.setGender(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">年齡 (age)</label>
              <input
                type="text"
                value={vm.age}
                onChange={(e) => vm.setAge(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">職業 / 身分地位 (occupation)</label>
              <input
                type="text"
                value={vm.occupation}
                onChange={(e) => vm.setOccupation(e.target.value)}
                placeholder="例如: 盛景資本控股集團執行總裁"
                className="w-full glass-input px-3 py-2 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* 性格與說話風格 (7-8) */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <ScrollText className="w-4 h-4 text-amber-400" />
            性格與說話風格 (Personality & Speech Style)
          </h2>

          <div>
            <label className="block text-xs text-slate-400 mb-1">角色個性與價值觀 (personality)</label>
            <textarea
              value={vm.personality}
              onChange={(e) => vm.setPersonality(e.target.value)}
              placeholder="冷靜沉穩、極度理性、控制慾強、深情專一、對認定的人極度護短..."
              rows={3}
              className="w-full glass-input px-3 py-2 rounded-xl text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">說話風格與情緒表達 (speechStyle)</label>
            <textarea
              value={vm.speechStyle}
              onChange={(e) => vm.setSpeechStyle(e.target.value)}
              placeholder="語速平穩，字句簡潔。關心人時以實際行動或命令表達。生氣時語氣反而更加平靜壓迫..."
              rows={3}
              className="w-full glass-input px-3 py-2 rounded-xl text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* 背景經歷與世界觀 (9-11) */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            背景故事與場景世界觀 (Background & World)
          </h2>

          <div>
            <label className="block text-xs text-slate-400 mb-1">背景故事與過往執念 (background)</label>
            <textarea
              value={vm.background}
              onChange={(e) => vm.setBackground(e.target.value)}
              placeholder="描述角色的過往歷史、豪門出身、十年前白月光不告而別的傷痛..."
              rows={4}
              className="w-full glass-input px-3 py-2 rounded-xl text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">世界觀大環境 (worldView)</label>
            <input
              type="text"
              value={vm.worldView}
              onChange={(e) => vm.setWorldView(e.target.value)}
              placeholder="例如: 現代都市豪門商業帝國"
              className="w-full glass-input px-3 py-2 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">固定場景初始環境 (fixedHeader)</label>
            <input
              type="text"
              value={vm.fixedHeader}
              onChange={(e) => vm.setFixedHeader(e.target.value)}
              placeholder="例如: 盛景集團執行長辦公室，瀰漫冷杉香氣與都市夜景..."
              className="w-full glass-input px-3 py-2 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* AI 指令與登場第一幕 (12-13) */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-indigo-400" />
            AI 指令與登場第一幕 (System Prompt & Opening)
          </h2>

          <div>
            <label className="block text-xs text-slate-400 mb-1">角色核心規則 (systemPrompt)</label>
            <textarea
              value={vm.systemPrompt}
              onChange={(e) => vm.setSystemPrompt(e.target.value)}
              placeholder="你是蕭景琛，商業狼王...請嚴格遵守設定，禁止跳脫角色。"
              rows={3}
              className="w-full glass-input px-3 py-2 rounded-xl text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">登場台詞與開場第一幕 (openingScene)</label>
            <textarea
              value={vm.openingScene}
              onChange={(e) => vm.setOpeningScene(e.target.value)}
              placeholder="信義區私人會所內...『小孩。』『妳倒錯地方了。』"
              rows={4}
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
          <span>{vm.isSubmitting ? "建立中..." : "確認建立 13 維度角色"}</span>
        </button>
      </form>
    </div>
  );
}
