# Attachment (Project MIA) 架構規格文件

## 1. 架構原則 (Architecture Principles)

Attachment 遵循以下六大架構原則：

1. **Clean Architecture**: 隔離 UI、商業邏輯與基礎設施層。
2. **MVVM (Model-View-ViewModel)**: UI 僅負責顯示與事件觸發；ViewModel 負責狀態與 Use Case 呼叫。
3. **Feature-Based Architecture**: 按功能模組劃分 (`chat`, `character`, `story`, `memory`, `settings`)。
4. **Repository Pattern**: 所有資料存取透過抽象介面與 Repository，隔離底層資料庫實作。
5. **Adapter Pattern**: AI 服務商採用 Adapter 封裝，切換服務商只需新增 Adapter，不得修改核心 Engine。
6. **Local First / Offline First**: 預設資料存儲於瀏覽器 IndexedDB，支援無網路離線瀏覽。

---

## 2. 依賴流向 (Dependency Direction)

```text
Presentation Layer (View)
       ↓
ViewModel Layer
       ↓
Use Case Layer (Application)
       ↓
Engine Layer (AI Core & Domain)
       ↓
Repository Layer (Data Mapping & Access)
       ↓
Infrastructure Layer (IndexedDB / OpenAI / OpenRouter API)
```

> **核心禁令**：禁止任何反向依賴！UI 禁止包含 IndexedDB 操作、AI 呼叫或 Prompt 組裝邏輯。

---

## 3. 核心 Engine 模組

- **`CharacterEngine`**: 管理角色一致性、背景、人格特質與預設 Prompt 模板。
- **`PromptEngine`**: 8 層結構化 System Prompt 組裝器（System Rules -> Character -> Emotion Value -> Roleplay Format -> World State -> Memory -> Summary -> Messages -> Input）。
- **`ContextEngine`**: 記憶重要度過濾 (Importance Ranking) 與 Token 上下文流量控制。
- **`MemoryExtractor`**: 分析對話非同步提取 `player` / `story` / `relationship` 記憶與分數評定。
- **`StorySummaryEngine`**: 長篇對話背景壓縮故事摘要與 World State 狀態更新。
- **`AIEngine`**: 調用 AI Provider Adapters 的統一核心介面。

---

## 4. IndexedDB Schema Specification (`AttachmentDB` v1)

- **`characters`** (keyPath: `id`)
- **`stories`** (keyPath: `id`, index: `characterId`)
- **`messages`** (keyPath: `id`, index: `storyId`)
- **`memories`** (keyPath: `id`, index: `storyId`, index: `type`)
- **`timeline`** (keyPath: `id`, index: `storyId`)
- **`settings`** (keyPath: `id`)
- **`assets`** (keyPath: `id`)
