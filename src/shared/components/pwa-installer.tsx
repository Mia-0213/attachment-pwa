"use client";

import React, { useState, useEffect } from "react";
import { Share, PlusSquare, X } from "lucide-react";

export const PWAInstaller: React.FC = () => {
  const [showIOSPrompt, setShowIOSPrompt] = useState<boolean>(false);

  useEffect(() => {
    // 註冊 Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker 註冊成功:", reg.scope);
        })
        .catch((err) => {
          console.warn("Service Worker 註冊失敗:", err);
        });
    }

    // 檢測是否為 iOS Safari 且非 Standalone 模式
    if (typeof window !== "undefined") {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;

      // 若為 iOS 且非主畫面獨立執行模式，展示引導
      if (isIOS && !isStandalone) {
        const hasDismissed = localStorage.getItem("ios_pwa_prompt_dismissed");
        if (!hasDismissed) {
          setShowIOSPrompt(true);
        }
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowIOSPrompt(false);
    localStorage.setItem("ios_pwa_prompt_dismissed", "true");
  };

  if (!showIOSPrompt) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 max-w-sm mx-auto z-50 glass-panel p-4 rounded-2xl border border-indigo-500/40 bg-slate-900/95 text-slate-100 shadow-2xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-1.5">
          iPhone Safari 體驗升級
        </h3>
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-slate-200 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        將 Attachment 加入主畫面，獲得全螢幕獨立 Companion App 使用體驗：
      </p>

      <div className="space-y-1.5 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <span>1. 點擊 Safari 底部工具列的</span>
          <Share className="w-4 h-4 text-indigo-400 inline shrink-0" />
          <span>「分享」按鈕</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>2. 向上滑動點擊</span>
          <PlusSquare className="w-4 h-4 text-purple-400 inline shrink-0" />
          <span>「加入主畫面」</span>
        </div>
      </div>
    </div>
  );
};
