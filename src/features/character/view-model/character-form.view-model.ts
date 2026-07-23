import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateCharacterUseCase } from "@/features/character/use-cases/create-character.use-case";

export function useCharacterFormViewModel() {
  const router = useRouter();
  const createCharacterUseCase = new CreateCharacterUseCase();

  const [name, setName] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("avatar_default");
  const [age, setAge] = useState<string>("28");
  const [gender, setGender] = useState<string>("男");
  const [occupation, setOccupation] = useState<string>("");

  const [personality, setPersonality] = useState<string>("");
  const [speechStyle, setSpeechStyle] = useState<string>("");
  const [background, setBackground] = useState<string>("");
  const [worldView, setWorldView] = useState<string>("");
  const [fixedHeader, setFixedHeader] = useState<string>("");

  const [systemPrompt, setSystemPrompt] = useState<string>("請始終維持角色設定，不得跳脫角色，不得控制玩家。");
  const [openingScene, setOpeningScene] = useState<string>("(他沉默看著你。)\n\n「你來了。」");

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
        avatar: avatar.trim(),
        age: age.trim(),
        gender: gender.trim(),
        occupation: occupation.trim(),
        personality: personality.trim(),
        speechStyle: speechStyle.trim(),
        background: background.trim(),
        worldView: worldView.trim(),
        fixedHeader: fixedHeader.trim(),
        systemPrompt: systemPrompt.trim(),
        openingScene: openingScene.trim(),
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
    avatar,
    setAvatar,
    age,
    setAge,
    gender,
    setGender,
    occupation,
    setOccupation,
    personality,
    setPersonality,
    speechStyle,
    setSpeechStyle,
    background,
    setBackground,
    worldView,
    setWorldView,
    fixedHeader,
    setFixedHeader,
    systemPrompt,
    setSystemPrompt,
    openingScene,
    setOpeningScene,
    isSubmitting,
    handleSubmit,
  };
}
