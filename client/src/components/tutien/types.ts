export type GameScreen = 'CREATION' | 'PLAYING' | 'DEATH';

export interface CharacterStats {
  qi: number; // Linh lực (0-100+)
  maxQi: number;
  health: number; // Khí huyết
  maxHealth: number;
  daoHeart: number; // Đạo tâm
  maxDaoHeart: number;
  realm: string; // Luyện Khí Sơ Kỳ, Trúc Cơ...
  wealth: number; // Linh thạch / Bạc
}

export interface CharacterProfile {
  name: string;
  backstory: string;
  goal: string;
  items: string[];
  traits: string[];
  companions: string[];
  startLocation: string;
}

export interface StoryLog {
  id: string;
  text: string;
  type: 'NARRATIVE' | 'COMBAT' | 'SYSTEM_REWARD' | 'SYSTEM_PUNISH';
}

export interface ActionChoice {
  id: string;
  label: string;
  consequenceSummary?: string;
}

export interface GameState {
  screen: GameScreen;
  profile: CharacterProfile | null;
  stats: CharacterStats;
  logs: StoryLog[];
  currentChoices: ActionChoice[];
}

export interface GameContextType extends GameState {
  setScreen: (screen: GameScreen) => void;
  initCharacter: (profile: CharacterProfile) => void;
  updateStats: (changes: Partial<CharacterStats>) => void;
  addLog: (log: StoryLog) => void;
  setChoices: (choices: ActionChoice[]) => void;
  resetGame: () => void;
}
