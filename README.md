# Attachment (Project MIA)

> AI Roleplay Companion Progressive Web Application (PWA)

Attachment 是一款 AI 長期陪伴型角色扮演應用。本專案採用 **Local First / Offline First** 設計哲學，讓使用者能與 AI 角色建立具備**高角色一致性**、**長期記憶**、**劇情連續性**與**情緒價值回應**的沉浸式陪伴關係。

---

## 🌟 核心特色

- **沉浸式 Roleplay 體驗**：
  - **`(行為描述)` 灰色斜體解析**：自動將角色的心理活動、眼神動作與對話內容區分渲染。
  - **`()` 快捷按鈕**：輸入框旁提供一鍵插入按鈕，自動定位游標至括號中間 `(|)`，方便玩家輸入角色行動。
  - **靈活對話手動控制**：支援 Streaming 逐字串流、中斷生成、重新生成 (Regenerate)、繼續生成 (Continue) 與編輯玩家訊息並重新串流回應 (Edit User Message)。

- **長期記憶與時間線系統**：
  - **AI 記憶自動提取器 (`MemoryExtractor`)**：對話結束後背景自動分類玩家喜好 (`player`)、劇情事件 (`story`) 與關係羈絆 (`relationship`)，自動評分與去重。
  - **故事動態摘要與時間線**：背景壓縮長篇劇情摘要，自動追蹤紀錄重大事件與約定里程碑於時間軸上。

- **Local First 隱私與全資料存取**：
  - 資料庫完全運作於瀏覽器本機 **IndexedDB** (`AttachmentDB` v1)，API Key 與對話隱私絕不上傳任何伺服器。
  - 支援單一角色 `.json` 匯入與匯出，以及全系統備份檔一鍵打包導出與還原復原。

- **Progressive Web App (PWA)**：
  - 支援 iOS Safari **「加入主畫面」** (Standalone Mode) 沉浸式無邊框全螢幕體驗。
  - 內建 Service Worker (`sw.js`)，支援全站離線開啟與瀏覽本機對話歷史、角色庫、記憶與時間線。

---

## 🛠 技術棧

- **Core**: Next.js 14 (App Router), React 18, TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS 3 (Dark Mode & Glassmorphism Aesthetics)
- **Storage**: IndexedDB (Local First, 7 Object Stores)
- **AI Core**: OpenAI API, OpenRouter API (Adapter Pattern)
- **PWA**: Service Worker, Web App Manifest

---

## 🏗 架構設計 (Clean Architecture & MVVM)

專案遵循嚴格的單向依賴架構：

```text
UI (View)
  ↓
ViewModel (UI State & User Action)
  ↓
Use Case (Application Business Flow)
  ↓
Engine / Repository (Domain Logic & Data Layer)
  ↓
IndexedDB / AI Provider API
```

詳細架構與 Engine 分層說明請參閱 [ARCHITECTURE.md](./ARCHITECTURE.md)。

---

## 🚀 本機開發指南

### 環境要求
- **OS**: Windows Only
- **Node.js**: 18.x 或 20.x

### 安裝與啟動

```bash
# 1. 安裝依賴套件
cmd /c "npm install"

# 2. 啟動開發伺服器
cmd /c "npm run dev"

# 3. 生產環境打包編譯
cmd /c "npm run build"
```

開啟瀏覽器存取 `http://localhost:3000` 即可開始體驗。

---

## 📱 iPhone Safari 安裝與使用指南

1. 使用 iPhone Safari 開啟發布網址。
2. 點擊瀏覽器下方工具列的 **「分享 (Share)」** 圖示。
3. 向上滑動選擇 **「加入主畫面 (Add to Home Screen)」**。
4. 點擊右上角「新增」，即可於 iOS 主畫面獲得媲美 Native App 的全螢幕 Companion PWA 體驗！

---

## 📄 授權條款

MIT License
