"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSettingsViewModel } from "@/features/settings/view-model/settings.view-model";
import { ExportBackupUseCase } from "@/features/settings/use-cases/export-backup.use-case";
import { ImportBackupUseCase } from "@/features/settings/use-cases/import-backup.use-case";
import { ArrowLeft, Save, ShieldCheck, Key, Cpu, Sparkles, Download, Upload, Database } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateField, saveSettings, isSaving, saveSuccess } =
    useSettingsViewModel();

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
          <h1 className="text-xl font-bold text-slate-100">系統設定</h1>
          <p className="text-xs text-slate-400">管理 API Key 與 AI 模型選項</p>
        </div>
      </header>

      <main className="space-y-5">
        {/* API Key 安全警示卡片 */}
        <div className="glass-panel p-4 rounded-2xl border-indigo-500/20 bg-indigo-950/20 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-200/90 leading-relaxed">
            <p className="font-semibold text-indigo-300 mb-1">Local First 隱私保護</p>
            您的 API Key 僅儲存於您裝置的 IndexedDB 本機資料庫中，絕對不會傳送或上傳至任何遠端伺服器。
          </div>
        </div>

        {/* AI Provider 選擇 */}
        <div className="glass-panel p-4 rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-purple-400" />
            AI 模型服務商
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                模型服務商 (Provider)
              </label>
              <select
                value={settings.provider}
                onChange={(e) => updateField("provider", e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-xl text-sm bg-slate-900 text-slate-100 border border-slate-700"
              >
                <option value="openai">OpenAI</option>
                <option value="openrouter">OpenRouter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                模型名稱 (Model)
              </label>
              <input
                type="text"
                value={settings.model}
                onChange={(e) => updateField("model", e.target.value)}
                placeholder="例如: gpt-4o-mini 或 anthropic/claude-3.5-sonnet"
                className="w-full glass-input px-3 py-2 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* API Key 輸入 */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-amber-400" />
            API 金鑰配置
          </h2>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">
              {settings.provider.toUpperCase()} API Key
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => updateField("apiKey", e.target.value)}
              placeholder="sk-..."
              className="w-full glass-input px-3 py-2 rounded-xl text-sm font-mono"
            />
          </div>
        </div>

        {/* 全系統資料備份與還原 */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-400" />
            全系統資料備份與還原
          </h2>
          <p className="text-xs text-slate-400">
            匯出或還原所有角色、故事、訊息對話歷史、AI 記憶庫與時間線紀錄。
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                const exportUseCase = new ExportBackupUseCase();
                exportUseCase.execute();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              匯出全系統備份
            </button>

            <label className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-purple-400" />
              還原備份檔
              <input
                type="file"
                accept=".json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const importUseCase = new ImportBackupUseCase();
                    await importUseCase.execute(text);
                    alert("全系統資料已成功還原！");
                    window.location.reload();
                  } catch (err: any) {
                    alert(`還原失敗: ${err.message}`);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 儲存按鈕 */}
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? "儲存中..." : "儲存設定"}</span>
        </button>

        {saveSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs text-center">
            設定已成功儲存至本機資料庫！
          </div>
        )}
      </main>
    </div>
  );
}
