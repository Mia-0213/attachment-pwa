"use client";

import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50 p-2 bg-amber-600/90 backdrop-blur-md text-white text-xs flex items-center justify-center space-x-2 border-b border-amber-500/40 shadow-lg animate-pulse">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>目前處於離線狀態。可瀏覽本機角色與對話，AI 即時回應需連線。</span>
    </div>
  );
};
