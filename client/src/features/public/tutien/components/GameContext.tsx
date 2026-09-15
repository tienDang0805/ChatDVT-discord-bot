import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { GameScreen, CharacterProfile, CharacterStats, StoryLog, ActionChoice, Equipment, Quest, NPC, WorldConfig, GameState, GameContextType, SaveSlot, EquipSlot } from './types';
import { REALM_LIFESPAN } from './types';

const SAVE_PREFIX = 'tutien_save_';
const CURRENT_SLOT_KEY = 'tutien_current_slot';

const initialStats: CharacterStats = {
  qi: 10, maxQi: 100, health: 100, maxHealth: 100,
  daoHeart: 50, maxDaoHeart: 100, realm: 'Phàm Nhân',
  wealth: 0, lifespan: 80, maxLifespan: 80, age: 16,
  attack: 5, defense: 3, luck: 5, speed: 5, comprehension: 5,
};

const initialState: GameState = {
  screen: 'MENU',
  worldConfig: null,
  profile: null,
  stats: initialStats,
  logs: [],
  currentChoices: [],
  equipment: [],
  equippedItems: {},
  quests: [],
  npcs: [],
  turnCount: 0,
  summaries: [],
  locations: [],
  currentLocation: '',
};

const getSlotKey = (id: string) => `${SAVE_PREFIX}${id}`;

const loadSlot = (slotId: string): GameState | null => {
  try {
    const raw = localStorage.getItem(getSlotKey(slotId));
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch { return null; }
};

const saveSlot = (slotId: string, state: GameState) => {
  localStorage.setItem(getSlotKey(slotId), JSON.stringify(state));
  localStorage.setItem(CURRENT_SLOT_KEY, slotId);
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useTuTienGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useTuTienGame must be used within a GameProvider');
  return context;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [slotId, setSlotId] = useState<string>(() => {
    return localStorage.getItem(CURRENT_SLOT_KEY) || '';
  });
  const [state, setState] = useState<GameState>(() => {
    if (slotId) {
      const saved = loadSlot(slotId);
      if (saved && saved.profile) return { ...saved, screen: 'PLAYING' };
    }
    return initialState;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (slotId && state.screen === 'PLAYING' && state.profile) {
      saveSlot(slotId, state);
    }
  }, [state, slotId]);

  const getSaveSlots = useCallback((): SaveSlot[] => {
    const slots: SaveSlot[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(SAVE_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key)!) as GameState;
          if (data.profile) {
            slots.push({
              id: key.replace(SAVE_PREFIX, ''),
              worldName: data.worldConfig?.name || 'Vô Danh',
              charName: data.profile.name,
              realm: data.stats.realm,
              age: data.stats.age,
              turnCount: data.turnCount,
              savedAt: Date.now(),
            });
          }
        } catch { /* skip corrupted */ }
      }
    }
    return slots.sort((a, b) => b.savedAt - a.savedAt);
  }, []);

  const loadSaveSlot = useCallback((id: string) => {
    const saved = loadSlot(id);
    if (saved && saved.profile) {
      setSlotId(id);
      setState({ ...saved, screen: 'PLAYING' });
    }
  }, []);

  const deleteSaveSlot = useCallback((id: string) => {
    localStorage.removeItem(getSlotKey(id));
    if (slotId === id) {
      setSlotId('');
      setState(initialState);
    }
  }, [slotId]);

  const setScreen = (screen: GameScreen) => setState(prev => ({ ...prev, screen }));

  const setWorldConfig = (config: WorldConfig) => {
    const newSlotId = `slot_${Date.now()}`;
    setSlotId(newSlotId);
    setState(prev => ({ ...prev, worldConfig: config, screen: 'CHAR_CREATION' }));
  };

  const initCharacter = (
    profile: CharacterProfile,
    aiStats?: Partial<CharacterStats>,
    aiNarrative?: string,
    aiChoices?: ActionChoice[],
    aiNpcs?: NPC[],
    aiItems?: Equipment[],
  ) => {
    const startRealm = aiStats?.realm || 'Luyện Khí Sơ Kỳ';
    const maxLife = REALM_LIFESPAN[startRealm] || 120;

    const mergedStats: CharacterStats = {
      ...initialStats,
      ...aiStats,
      realm: startRealm,
      lifespan: aiStats?.lifespan || maxLife,
      maxLifespan: aiStats?.maxLifespan || maxLife,
      age: aiStats?.age || 16,
    };

    const startEquipment: Equipment[] = aiItems && aiItems.length > 0
      ? aiItems.map((item, i) => ({
          id: `start_${i}`,
          name: item.name,
          type: item.type || 'MATERIAL',
          grade: item.grade || 'PHÀM',
          effect: item.effect || '',
          statBonus: item.statBonus,
        }))
      : profile.items.map((item, i) => ({
          id: `start_${i}`,
          name: item.name,
          type: 'MATERIAL' as const,
          grade: item.grade,
          effect: 'Vật phẩm khởi đầu',
        }));

    const openingText = aiNarrative || `Thiên địa biến ảo. ${profile.name} — ${profile.backstory}. Chấp niệm "${profile.goal}", bước lên con đường tu tiên!`;

    setState(prev => ({
      ...prev,
      profile,
      screen: 'PLAYING',
      stats: mergedStats,
      logs: [{ id: Date.now().toString(), text: openingText, type: 'SYSTEM_REWARD' }],
      currentChoices: aiChoices || [
        { id: 'c_init_1', label: 'Quan sát xung quanh' },
        { id: 'c_init_2', label: 'Ngồi thiền vận khí' },
        { id: 'c_init_3', label: 'Tìm kiếm cơ duyên' },
      ],
      equipment: startEquipment,
      equippedItems: {},
      npcs: aiNpcs || [],
      quests: [{ id: 'q_main', name: profile.goal, description: `Chấp niệm: ${profile.goal}`, status: 'ACTIVE' }],
      turnCount: 0,
      summaries: [],
      locations: [profile.startLocation],
      currentLocation: profile.startLocation,
    }));
  };

  const updateStats = useCallback((changes: Partial<CharacterStats>) => {
    setState(prev => {
      const newStats = { ...prev.stats, ...changes };
      if (changes.realm && REALM_LIFESPAN[changes.realm]) {
        const newMax = REALM_LIFESPAN[changes.realm];
        const gain = newMax - prev.stats.maxLifespan;
        newStats.maxLifespan = newMax;
        newStats.lifespan = prev.stats.lifespan + gain;
      }
      newStats.health = Math.max(0, Math.min(newStats.health, newStats.maxHealth));
      newStats.qi = Math.max(0, Math.min(newStats.qi, newStats.maxQi));
      newStats.daoHeart = Math.max(0, Math.min(newStats.daoHeart, newStats.maxDaoHeart));
      return { ...prev, stats: newStats };
    });
  }, []);

  const addLog = useCallback((log: StoryLog) => {
    setState(prev => ({ ...prev, logs: [...prev.logs.slice(-150), log] }));
  }, []);

  const setChoices = useCallback((choices: ActionChoice[]) => {
    setState(prev => ({ ...prev, currentChoices: choices }));
  }, []);

  const addEquipment = useCallback((item: Equipment) => {
    setState(prev => ({ ...prev, equipment: [...prev.equipment, item] }));
  }, []);

  const removeEquipment = useCallback((id: string) => {
    setState(prev => ({ ...prev, equipment: prev.equipment.filter(e => e.id !== id) }));
  }, []);

  const EQUIP_SLOT_MAP: Record<string, EquipSlot> = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    ACCESSORY: 'accessory',
  };

  const equipItem = useCallback((itemId: string) => {
    setState(prev => {
      const item = prev.equipment.find(e => e.id === itemId);
      if (!item) return prev;
      const slot = EQUIP_SLOT_MAP[item.type];
      if (!slot) return prev;

      let newStats = { ...prev.stats };
      const prevEquippedId = prev.equippedItems[slot];
      if (prevEquippedId) {
        const prevItem = prev.equipment.find(e => e.id === prevEquippedId);
        if (prevItem?.statBonus) {
          for (const [k, v] of Object.entries(prevItem.statBonus)) {
            (newStats as any)[k] = Math.max(0, ((newStats as any)[k] || 0) - (v as number));
          }
        }
      }

      if (item.statBonus) {
        for (const [k, v] of Object.entries(item.statBonus)) {
          (newStats as any)[k] = ((newStats as any)[k] || 0) + (v as number);
        }
      }

      return {
        ...prev,
        stats: newStats,
        equippedItems: { ...prev.equippedItems, [slot]: itemId },
      };
    });
  }, []);

  const unequipItem = useCallback((slot: EquipSlot) => {
    setState(prev => {
      const equippedId = prev.equippedItems[slot];
      if (!equippedId) return prev;

      const item = prev.equipment.find(e => e.id === equippedId);
      let newStats = { ...prev.stats };
      if (item?.statBonus) {
        for (const [k, v] of Object.entries(item.statBonus)) {
          (newStats as any)[k] = Math.max(0, ((newStats as any)[k] || 0) - (v as number));
        }
      }

      const newEquipped = { ...prev.equippedItems };
      delete newEquipped[slot];

      return { ...prev, stats: newStats, equippedItems: newEquipped };
    });
  }, []);

  const updateQuest = useCallback((quest: Quest) => {
    setState(prev => {
      const exists = prev.quests.find(q => q.id === quest.id);
      if (exists) return { ...prev, quests: prev.quests.map(q => q.id === quest.id ? quest : q) };
      return { ...prev, quests: [...prev.quests, quest] };
    });
  }, []);

  const addNPC = useCallback((npc: NPC) => {
    setState(prev => {
      const exists = prev.npcs.find(n => n.name === npc.name);
      if (exists) return { ...prev, npcs: prev.npcs.map(n => n.name === npc.name ? { ...n, ...npc } : n) };
      return { ...prev, npcs: [...prev.npcs, npc] };
    });
  }, []);

  const advanceTime = useCallback((years: number) => {
    setState(prev => {
      const newAge = prev.stats.age + years;
      const newLifespan = prev.stats.lifespan - years;
      const newTurn = prev.turnCount + 1;
      if (newLifespan <= 0) {
        return { ...prev, stats: { ...prev.stats, age: newAge, lifespan: 0 }, turnCount: newTurn, screen: 'DEATH' as GameScreen };
      }
      return { ...prev, stats: { ...prev.stats, age: newAge, lifespan: newLifespan }, turnCount: newTurn };
    });
  }, []);

  const addSummary = useCallback((summary: string) => {
    setState(prev => ({ ...prev, summaries: [...prev.summaries.slice(-10), summary] }));
  }, []);

  const setCurrentLocation = useCallback((loc: string) => {
    setState(prev => ({ ...prev, currentLocation: loc }));
  }, []);

  const addLocation = useCallback((loc: string) => {
    setState(prev => prev.locations.includes(loc) ? prev : { ...prev, locations: [...prev.locations, loc] });
  }, []);

  const resetGame = () => {
    if (slotId) localStorage.removeItem(getSlotKey(slotId));
    localStorage.removeItem(CURRENT_SLOT_KEY);
    setSlotId('');
    setState(initialState);
  };

  return (
    <GameContext.Provider value={{
      ...state, setScreen, setWorldConfig, initCharacter, updateStats,
      addLog, setChoices, addEquipment, removeEquipment, equipItem, unequipItem,
      updateQuest, addNPC, advanceTime, addSummary, setCurrentLocation, addLocation,
      resetGame, loadSaveSlot, getSaveSlots, deleteSaveSlot,
      isLoading, setIsLoading,
    }}>
      {children}
    </GameContext.Provider>
  );
};
