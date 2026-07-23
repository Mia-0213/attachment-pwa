export interface WorldState {
  location: string;
  time: string;
  weather: string;
  situation: string;
  relationship: string;
}

export interface Story {
  id: string;
  characterId: string;
  title: string;
  summary: string;
  worldState: WorldState;
  createdAt: number;
  updatedAt: number;
}
