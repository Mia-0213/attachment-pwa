"use client";

import React, { useRef, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChatViewModel } from "@/features/chat/view-model/chat.view-model";
import { ActionText } from "@/features/chat/components/action-text";
import {
  ArrowLeft,
  Send,
  Square,
  RotateCcw,
  Play,
  Edit2,
  Check,
  X,
  RefreshCw,
  Sparkles,
  Clock,
} from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;

  const {
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
  } = useChatViewModel(storyId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showRestartModal, setShowRestartModal] = useState<boolean>(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // () 行為輸入按鈕點擊處理 (將 cursor 置於括號中間)
  const handleInsertActionParenthesis = () => {
    const inputEl = inputRef.current;
    if (!inputEl) {
      setInputContent((prev) => prev + "()");
      return;
    }

    const start = inputEl.selectionStart || inputContent.length;
    const end = inputEl.selectionEnd || inputContent.length;

    const newText =
      inputContent.substring(0, start) + "()" + inputContent.substring(end);
    setInputContent(newText);

    setTimeout(() => {
      inputEl.focus();
      inputEl.setSelectionRange(start + 1, start + 1);
    }, 50);
  };

  const handleConfirmRestart = async () => {
    const newStoryId = await restartStory();
    setShowRestartModal(false);
    if (newStoryId) {
      router.push(`/chat/${newStoryId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">載入對話情境中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen max-h-screen bg-slate-950 relative overflow-hidden">
      {/* 頂部 Header */}
      <header className="glass-panel px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-slate-100 flex items-center gap-1.5 text-sm">
              {character?.name || "AI Roleplay"}
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h1>
            <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
              {story?.worldState.location || "對話中"} · {story?.worldState.relationship || "陪伴中"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/story/${storyId}/timeline`)}
            className="text-xs px-2.5 py-1.5 rounded-lg glass-panel hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition-colors"
            title="檢視故事時間線"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            時間線
          </button>
          <button
            onClick={() => setShowRestartModal(true)}
            className="text-xs px-2.5 py-1.5 rounded-lg glass-panel hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重啟劇情
          </button>
        </div>
      </header>

      {/* 訊息流 (Message List) */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const isLastAssistant =
            !isUser && index === messages.length - 1;
          const isEditingThis = editingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isUser ? "items-end" : "items-start"
              } space-y-1`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-lg shadow-indigo-600/20"
                    : "glass-panel text-slate-100 rounded-tl-none border-slate-800"
                }`}
              >
                {isEditingThis ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-slate-900 text-slate-100 p-2 rounded-lg text-sm border border-slate-700 focus:outline-none focus:border-indigo-500"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingMessageId(null)}
                        className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        取消
                      </button>
                      <button
                        onClick={confirmEditMessage}
                        className="px-3 py-1 text-xs bg-indigo-500 text-white rounded-md flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        確認並重發
                      </button>
                    </div>
                  </div>
                ) : isUser ? (
                  <div className="flex items-start justify-between gap-2">
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {!isStreaming && (
                      <button
                        onClick={() => startEditMessage(msg)}
                        className="opacity-60 hover:opacity-100 p-1 text-slate-200 transition-opacity"
                        title="編輯訊息"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <ActionText content={msg.content || "..."} />
                )}
              </div>

              {/* AI 回覆專屬操作按鈕 (Regenerate / Continue) */}
              {!isUser && isLastAssistant && !isStreaming && (
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 pl-1 pt-1">
                  <button
                    onClick={regenerate}
                    className="hover:text-indigo-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-900 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    重新生成
                  </button>
                  <button
                    onClick={continueGeneration}
                    className="hover:text-indigo-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-900 transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    繼續生成
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* 輸入區 (Input Area) */}
      <footer className="glass-panel p-3 border-t border-slate-800 shrink-0">
        <div className="flex items-center space-x-2">
          {/* () 行為快速輸入按鈕 */}
          <button
            type="button"
            onClick={handleInsertActionParenthesis}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-sm font-semibold border border-slate-700 transition-colors"
            title="插入行為標記 ()"
          >
            ()
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="輸入對話或 (心理行動)..."
            disabled={isStreaming}
            className="flex-1 glass-input px-4 py-2.5 rounded-xl text-sm"
          />

          {isStreaming ? (
            <button
              onClick={stopGeneration}
              className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-lg shadow-rose-600/30"
              title="停止生成"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              onClick={() => sendMessage()}
              disabled={!inputContent.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40 shadow-lg shadow-indigo-600/30"
              title="發送"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>

      {/* 重啟劇情對話框 */}
      {showRestartModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full space-y-4 border border-slate-800">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              開始新劇情？
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              目前的故事對話與情境進度將被重置，但【{character?.name}】的角色性格與背景設定會完全保留。
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowRestartModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                取消
              </button>
              <button
                onClick={handleConfirmRestart}
                className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30"
              >
                確定開始新劇情
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
