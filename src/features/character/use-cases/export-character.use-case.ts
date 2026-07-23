import { Character } from "@/features/character/types/character.type";

export class ExportCharacterUseCase {
  public execute(character: Character): void {
    const exportData = {
      version: "1.0",
      ...character,
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `character_${character.name}_${character.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
