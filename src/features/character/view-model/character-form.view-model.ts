import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateCharacterUseCase } from "@/features/character/use-cases/create-character.use-case";

export function useCharacterFormViewModel() {
  const router = useRouter();
  const createCharacterUseCase = new CreateCharacterUseCase();

  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState<string>("男");
  const [age, setAge] = useState<number>(28);
  const [occupation, setOccupation] = useState<string>("");
  const [traits, setTraits] = useState<string>("冷靜, 理性, 溫柔");
  const [speechStyle, setSpeechStyle] = useState<string>("語氣平穩, 用字簡潔");
  const [experience, setExperience] = useState<string>("");
  const [openingLocation, setOpeningLocation] = useState<string>("咖啡廳");
  const [openingDesc, setOpeningDesc] = useState<string>("午後的陽光灑在窗前，對方靜靜地看著你。");
  const [firstMessage, setFirstMessage] = useState<string>("(他放下手中的杯子，抬頭看向你。)\n\n「你來了，請坐。」");
  const [systemPrompt, setSystemPrompt] = useState<string>("請始終維持角色設定，不得跳脫角色，不得控制玩家。");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("請輸入角色名稱！");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCharacterUseCase.execute({
        name: name.trim(),
        basic: {
          age: Number(age),
          gender: gender.trim(),
          occupation: occupation.trim(),
        },
        personality: {
          traits: traits.split(",").map((s) => s.trim()).filter(Boolean),
          speechStyle: speechStyle.split(",").map((s) => s.trim()).filter(Boolean),
        },
        background: {
          experience: experience.trim(),
        },
        world: {
          era: "現代",
          location: openingLocation.trim(),
        },
        openingScene: {
          location: openingLocation.trim(),
          description: openingDesc.trim(),
          firstMessage: firstMessage.trim(),
        },
        prompt: {
          systemPrompt: systemPrompt.trim(),
          characterPrompt: `${traits}，${speechStyle}`,
          rules: ["不得跳脫角色", "不得控制玩家"],
        },
      });

      router.push("/");
    } catch (err) {
      console.error("建立角色失敗:", err);
      alert("建立角色失敗，請檢查資料");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    gender,
    setGender,
    age,
    setAge,
    occupation,
    setOccupation,
    traits,
    setTraits,
    speechStyle,
    setSpeechStyle,
    experience,
    setExperience,
    openingLocation,
    setOpeningLocation,
    openingDesc,
    setOpeningDesc,
    firstMessage,
    setFirstMessage,
    systemPrompt,
    setSystemPrompt,
    isSubmitting,
    handleSubmit,
  };
}
