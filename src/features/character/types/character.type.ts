export interface CharacterBasic {
  age?: number;
  gender?: string;
  occupation?: string;
}

export interface CharacterPersonality {
  traits: string[];
  speechStyle: string[];
  habits?: string[];
  likes?: string[];
  dislikes?: string[];
}

export interface CharacterBackground {
  birth?: string;
  family?: string;
  experience?: string;
  secret?: string;
  dream?: string;
}

export interface CharacterWorld {
  era?: string;
  location?: string;
  rules?: string[];
}

export interface CharacterOpeningScene {
  location: string;
  description: string;
  firstMessage: string;
}

export interface CharacterPrompt {
  systemPrompt: string;
  characterPrompt: string;
  rules: string[];
}

export interface Character {
  id: string;
  name: string;
  avatar?: string;
  basic: CharacterBasic;
  personality: CharacterPersonality;
  background: CharacterBackground;
  world: CharacterWorld;
  openingScene: CharacterOpeningScene;
  prompt: CharacterPrompt;
  createdAt: number;
  updatedAt: number;
}
