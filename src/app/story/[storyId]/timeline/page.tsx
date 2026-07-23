"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTimelineViewModel } from "@/features/story/view-model/timeline.view-model";
import { ArrowLeft, Clock, BookOpen, Trash2, Calendar, Sparkles } from "lucide-react";

export default function TimelinePage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;

  const { story, events, isLoading, deleteEvent } = useTimelineViewModel(storyId);

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
            <Clock className="w-5 h-5 text-indigo-400" />
            故事時間線 (Timeline)
          </h1>
          <p className="text-xs text-slate-400">記錄劇情的重大時間節點與發展里程碑</p>
        </div>
      </header>

      {/* 故事動態摘要 */}
      {story?.summary && (
        <div className="glass-panel p-4 rounded-2xl border-indigo-500/20 bg-indigo-950/20 space-y-2">
          <h2 className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            當前故事動態摘要
          </h2>
          <p className="text-xs text-indigo-100/90 leading-relaxed font-normal">
            {story.summary}
          </p>
        </div>
      )}

      {/* 時間線軸清單 */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center glass-panel rounded-2xl border-slate-800">
          <BookOpen className="w-10 h-10 text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-400">目前尚無重要時間線記錄</p>
          <p className="text-xs text-slate-500 mt-1">隨著關鍵約定或重大劇情發生，系統會自動標記於時間軸上</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {events.map((evt) => (
            <div key={evt.id} className="relative group">
              {/* 時間軸節點指示圈 */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-950 shadow-md shadow-indigo-500/50"></div>

              <div className="glass-panel p-4 rounded-xl space-y-2 border border-slate-800 hover:border-indigo-500/40 transition-all flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{new Date(evt.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {evt.event}
                  </p>
                </div>

                <button
                  onClick={() => deleteEvent(evt.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors opacity-60 group-hover:opacity-100"
                  title="刪除時間線記錄"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
