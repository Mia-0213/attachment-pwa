import { Settings } from "@/features/settings/types/settings.type";
import { indexedDbService } from "@/core/database/indexed-db.service";

export interface ISettingsRepository {
  get(): Promise<Settings | null>;
  save(settings: Settings): Promise<void>;
}

export class SettingsRepository implements ISettingsRepository {
  private readonly storeName = "settings";
  private readonly defaultId = "user_settings";

  public async get(): Promise<Settings | null> {
    return indexedDbService.get<Settings>(this.storeName, this.defaultId);
  }

  public async save(settings: Settings): Promise<void> {
    await indexedDbService.put<Settings>(this.storeName, {
      ...settings,
      id: this.defaultId,
    });
  }
}
