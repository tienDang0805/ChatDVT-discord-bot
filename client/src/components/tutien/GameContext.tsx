import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { GameScreen, CharacterProfile, CharacterStats, StoryLog, ActionChoice, GameState, GameContextType } from './types';

const initialState: GameState = {
  screen: 'CREATION',
  profile: null,
  stats: {
    qi: 10,
    maxQi: 100,
    health: 100,
    maxHealth: 100,
    daoHeart: 50,
    maxDaoHeart: 100,
    realm: 'Phàm Nhân',
    wealth: 0,
  },
  logs: [],
  currentChoices: []
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useTuTienGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useTuTienGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(initialState);

  const setScreen = (screen: GameScreen) => setState((prev) => ({ ...prev, screen }));

  const initCharacter = (profile: CharacterProfile) => {
    // Tạm thời mock random stat cơ bản dựa vào profile sau này AI sẽ làm
    setState((prev) => ({
      ...prev,
      profile,
      screen: 'PLAYING',
      stats: {
        ...prev.stats,
        realm: 'Luyện Khí Sơ Kỳ',
        wealth: Math.floor(Math.random() * 50) + 10,
      },
      logs: [
        {
          id: Date.now().toString(),
          text: `Thiên địa biến ảo, một cỗ ý niệm giáng xuống. Ngươi mang tên ${profile.name}. Ôm trong lòng mục tiêu "${profile.goal}", cầm theo ${profile.items[0] || 'hai bàn tay trắng'}, ngươi chính thức bước lên con đường nghịch thiên cải mệnh!`,
          type: 'SYSTEM_REWARD'
        }
      ],
      currentChoices: [
        { id: 'c1', label: 'Quan sát xung quanh' },
        { id: 'c2', label: 'Ngồi thiền tụng khí' }
      ] // Gợi ý bước đầu
    }));
  };

  const updateStats = (changes: Partial<CharacterStats>) => {
    setState((prev) => ({
      ...prev,
      stats: { ...prev.stats, ...changes }
    }));
  };

  const addLog = (log: StoryLog) => {
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs, log]
    }));
  };

  const setChoices = (choices: ActionChoice[]) => {
    setState((prev) => ({
      ...prev,
      currentChoices: choices
    }));
  };

  const resetGame = () => setState(initialState);

  return (
    <GameContext.Provider value={{
      ...state,
      setScreen,
      initCharacter,
      updateStats,
      addLog,
      setChoices,
      resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
};
