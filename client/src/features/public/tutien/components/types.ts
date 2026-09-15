export type GameScreen = 'MENU' | 'WORLD_CREATION' | 'CHAR_CREATION' | 'PLAYING' | 'DEATH';

export interface WorldConfig {
  name: string;
  writingStyle: string;
  background: string;
  sects: string[];
  era: string;
  currency: string;
}

export const WRITING_STYLE_LABELS: Record<string, string> = {
  epic: 'Bi tráng hào sảng',
  dark: 'U ám tàn khốc',
  comedy: 'Hài hước bựa bạ',
  classic: 'Cổ phong trang nhã',
};

export interface CharacterStats {
  qi: number;
  maxQi: number;
  health: number;
  maxHealth: number;
  daoHeart: number;
  maxDaoHeart: number;
  realm: string;
  wealth: number;
  lifespan: number;
  maxLifespan: number;
  age: number;
  attack: number;
  defense: number;
  luck: number;
  speed: number;
  comprehension: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'WEAPON' | 'ARMOR' | 'ACCESSORY' | 'CONSUMABLE' | 'MATERIAL';
  grade: 'PHÀM' | 'LINH' | 'BẢO' | 'THIÊN' | 'TIÊN';
  effect: string;
  statBonus?: Partial<CharacterStats>;
}

export type EquipSlot = 'weapon' | 'armor' | 'accessory';

export interface Quest {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  reward?: string;
}

export interface NPC {
  id: string;
  name: string;
  relation: 'ALLY' | 'ENEMY' | 'NEUTRAL' | 'MASTER' | 'DISCIPLE';
  realm?: string;
  description?: string;
  sect?: string;
}

export interface CharacterProfile {
  name: string;
  backstory: string;
  goal: string;
  items: { name: string; grade: Equipment['grade'] }[];
  traits: string[];
  companions: string[];
  startLocation: string;
}

export interface StoryLog {
  id: string;
  text: string;
  type: 'NARRATIVE' | 'COMBAT' | 'SYSTEM_REWARD' | 'SYSTEM_PUNISH' | 'DIALOGUE' | 'ITEM_GAIN' | 'REALM_UP';
}

export interface ActionChoice {
  id: string;
  label: string;
  consequenceSummary?: string;
}

export interface SaveSlot {
  id: string;
  worldName: string;
  charName: string;
  realm: string;
  age: number;
  turnCount: number;
  savedAt: number;
}

export interface GameState {
  screen: GameScreen;
  worldConfig: WorldConfig | null;
  profile: CharacterProfile | null;
  stats: CharacterStats;
  logs: StoryLog[];
  currentChoices: ActionChoice[];
  equipment: Equipment[];
  equippedItems: { weapon?: string; armor?: string; accessory?: string };
  quests: Quest[];
  npcs: NPC[];
  turnCount: number;
  summaries: string[];
  locations: string[];
  currentLocation: string;
}

export interface GameContextType extends GameState {
  setScreen: (screen: GameScreen) => void;
  setWorldConfig: (config: WorldConfig) => void;
  initCharacter: (profile: CharacterProfile, aiStats?: Partial<CharacterStats>, aiNarrative?: string, aiChoices?: ActionChoice[], aiNpcs?: NPC[], aiItems?: Equipment[]) => void;
  updateStats: (changes: Partial<CharacterStats>) => void;
  addLog: (log: StoryLog) => void;
  setChoices: (choices: ActionChoice[]) => void;
  addEquipment: (item: Equipment) => void;
  removeEquipment: (id: string) => void;
  equipItem: (itemId: string) => void;
  unequipItem: (slot: EquipSlot) => void;
  updateQuest: (quest: Quest) => void;
  addNPC: (npc: NPC) => void;
  advanceTime: (years: number) => void;
  addSummary: (summary: string) => void;
  setCurrentLocation: (loc: string) => void;
  addLocation: (loc: string) => void;
  resetGame: () => void;
  loadSaveSlot: (slotId: string) => void;
  getSaveSlots: () => SaveSlot[];
  deleteSaveSlot: (slotId: string) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}

export const REALM_LIFESPAN: Record<string, number> = {
  'Phàm Nhân': 80,
  'Luyện Khí Sơ Kỳ': 120,
  'Luyện Khí Trung Kỳ': 135,
  'Luyện Khí Đỉnh Phong': 150,
  'Trúc Cơ Sơ Kỳ': 200,
  'Trúc Cơ Trung Kỳ': 225,
  'Trúc Cơ Đỉnh Phong': 250,
  'Kim Đan Sơ Kỳ': 400,
  'Kim Đan Trung Kỳ': 450,
  'Kim Đan Đỉnh Phong': 500,
  'Nguyên Anh Sơ Kỳ': 800,
  'Nguyên Anh Trung Kỳ': 900,
  'Nguyên Anh Đỉnh Phong': 1000,
  'Hóa Thần Sơ Kỳ': 2000,
  'Hóa Thần Trung Kỳ': 2500,
  'Hóa Thần Đỉnh Phong': 3000,
  'Độ Kiếp Sơ Kỳ': 7000,
  'Độ Kiếp Đỉnh Phong': 10000,
  'Đại Thừa': 50000,
  'Tiên Nhân': 999999,
};

export const GRADE_COLORS: Record<string, string> = {
  'PHÀM': '#808080',
  'LINH': '#3B82F6',
  'BẢO': '#EAB308',
  'THIÊN': '#F97316',
  'TIÊN': '#A855F7',
};

export const GRADE_LIST: Equipment['grade'][] = ['PHÀM', 'LINH', 'BẢO', 'THIÊN', 'TIÊN'];

export const ITEM_TYPE_ICONS: Record<string, string> = {
  WEAPON: '⚔️',
  ARMOR: '🛡️',
  ACCESSORY: '💍',
  CONSUMABLE: '🧪',
  MATERIAL: '💎',
};
