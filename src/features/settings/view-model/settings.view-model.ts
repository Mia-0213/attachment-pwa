import { useState, useEffect, useCallback } from "react";
import { Settings } from "@/features/settings/types/settings.type";
import { SettingsRepository } from "@/core/repository/settings.repository";

export function useSettingsViewModel() {
  const [settings, setSettings] = useState<Settings>({
    id: "user_settings",
    provider: "openai",
    model: "gpt-4o-mini",
    apiKey: "",
    theme: "dark",
    language: "zh-TW",
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const settingsRepo = new SettingsRepository();

  const loadSettings = useCallback(async () => {
    try {
      const saved = await settingsRepo.get();
      if (saved) {
        setSettings(saved);
      }
    } catch (err) {
      console.error("載入設定失敗:", err);
    }
  }, []);

  const updateField = (field: keyof Settings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await settingsRepo.save(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("儲存設定失敗:", err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    updateField,
    saveSettings,
    isSaving,
    saveSuccess,
  };
}
