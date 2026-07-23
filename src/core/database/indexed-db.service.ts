// IndexedDB 基礎服務 (AttachmentDB)
const DB_NAME = "AttachmentDB";
const DB_VERSION = 1;

export class IndexedDbService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  public getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        reject(new Error("IndexedDB 不支援此環境"));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // characters store
        if (!db.objectStoreNames.contains("characters")) {
          db.createObjectStore("characters", { keyPath: "id" });
        }

        // stories store
        if (!db.objectStoreNames.contains("stories")) {
          const storiesStore = db.createObjectStore("stories", { keyPath: "id" });
          storiesStore.createIndex("characterId", "characterId", { unique: false });
        }

        // messages store
        if (!db.objectStoreNames.contains("messages")) {
          const messagesStore = db.createObjectStore("messages", { keyPath: "id" });
          messagesStore.createIndex("storyId", "storyId", { unique: false });
        }

        // memories store
        if (!db.objectStoreNames.contains("memories")) {
          const memoriesStore = db.createObjectStore("memories", { keyPath: "id" });
          memoriesStore.createIndex("storyId", "storyId", { unique: false });
          memoriesStore.createIndex("type", "type", { unique: false });
        }

        // timeline store
        if (!db.objectStoreNames.contains("timeline")) {
          const timelineStore = db.createObjectStore("timeline", { keyPath: "id" });
          timelineStore.createIndex("storyId", "storyId", { unique: false });
        }

        // settings store
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
        }

        // assets store
        if (!db.objectStoreNames.contains("assets")) {
          db.createObjectStore("assets", { keyPath: "id" });
        }
      };

      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  // 通用 CRUD 方法
  public async get<T>(storeName: string, id: string): Promise<T | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve((request.result as T) || null);
      request.onerror = () => reject(request.error);
    });
  }

  public async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve((request.result as T[]) || []);
      request.onerror = () => reject(request.error);
    });
  }

  public async getByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve((request.result as T[]) || []);
      request.onerror = () => reject(request.error);
    });
  }

  public async put<T>(storeName: string, item: T): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async delete(storeName: string, id: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDbService = new IndexedDbService();
