export interface PlayerStats {
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: string;
  wordsLearned: number;
  totalChats: number;
  challengesDone: number;
  correctAnswers: number;
  totalAnswers: number;
  gamesPlayed: number;
  bestWordSprint: number;
  bestSpellingBee: number;
  longestChain: number;
  puzzlesSolved: number;
  puzzleStreak: number;
  sentencesBuilt: number;
  badges: string[];
  learnedWords: string[];
  dailyActions: number;
  lastDailyReset: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  emoji: string;
  xpRequired: number;
  xpNext: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  condition: (stats: PlayerStats) => boolean;
}

const STORAGE_KEY = 'eng_progress';

const LEVELS: { title: string; emoji: string; xp: number }[] = [
  { title: 'Newbie', emoji: '🌱', xp: 0 },
  { title: 'Starter', emoji: '🌿', xp: 100 },
  { title: 'Learner', emoji: '🌳', xp: 300 },
  { title: 'Speaker', emoji: '⭐', xp: 600 },
  { title: 'Communicator', emoji: '🔥', xp: 1000 },
  { title: 'Fluent', emoji: '💎', xp: 1500 },
  { title: 'Expert', emoji: '👑', xp: 2200 },
  { title: 'Master', emoji: '🏆', xp: 3000 },
  { title: 'Legend', emoji: '🐉', xp: 4000 },
  { title: 'Native', emoji: '🦅', xp: 5500 },
];

export const BADGES: Badge[] = [
  { id: 'first_steps', name: 'First Steps', emoji: '👣', description: 'Hoàn thành hoạt động đầu tiên', condition: s => s.gamesPlayed >= 1 || s.totalChats >= 1 },
  { id: 'chatterbox', name: 'Chatterbox', emoji: '🗣️', description: '10 cuộc chat với AI', condition: s => s.totalChats >= 10 },
  { id: 'word_collector', name: 'Word Collector', emoji: '📚', description: 'Học 50 từ vựng', condition: s => s.wordsLearned >= 50 },
  { id: 'word_hoarder', name: 'Word Hoarder', emoji: '🏛️', description: 'Học 200 từ vựng', condition: s => s.wordsLearned >= 200 },
  { id: 'speed_demon', name: 'Speed Demon', emoji: '⚡', description: 'Score 15+ trong Word Sprint', condition: s => s.bestWordSprint >= 15 },
  { id: 'spelling_champ', name: 'Spelling Champ', emoji: '🐝', description: '10 từ khó đúng trong Spelling Bee', condition: s => s.bestSpellingBee >= 10 },
  { id: 'puzzle_solver', name: 'Puzzle Solver', emoji: '🧩', description: 'Giải Daily Puzzle 7 ngày', condition: s => s.puzzlesSolved >= 7 },
  { id: 'streak_warrior', name: 'Streak Warrior', emoji: '🔥', description: 'Streak 7 ngày liên tục', condition: s => s.streak >= 7 },
  { id: 'streak_legend', name: 'Streak Legend', emoji: '💫', description: 'Streak 30 ngày liên tục', condition: s => s.streak >= 30 },
  { id: 'challenger', name: 'Challenger', emoji: '🎯', description: 'Hoàn thành 20 Daily Challenge', condition: s => s.challengesDone >= 20 },
  { id: 'builder_pro', name: 'Builder Pro', emoji: '🧱', description: 'Xếp đúng 20 câu', condition: s => s.sentencesBuilt >= 20 },
  { id: 'sharp_shooter', name: 'Sharp Shooter', emoji: '🎯', description: 'Accuracy > 80% với 50+ câu', condition: s => s.totalAnswers >= 50 && (s.correctAnswers / s.totalAnswers) > 0.8 },
  { id: 'night_owl', name: 'Night Owl', emoji: '🦉', description: 'Học sau 23h', condition: s => { const h = new Date().getHours(); return h >= 23 && s.gamesPlayed > 0; } },
  { id: 'early_bird', name: 'Early Bird', emoji: '🐦', description: 'Học trước 7h sáng', condition: s => { const h = new Date().getHours(); return h < 7 && s.gamesPlayed > 0; } },
  { id: 'centurion', name: 'Centurion', emoji: '💯', description: 'Đạt 100 games played', condition: s => s.gamesPlayed >= 100 },
];

const DEFAULT_STATS: PlayerStats = {
  xp: 0, level: 1, streak: 0, lastStudyDate: '', wordsLearned: 0,
  totalChats: 0, challengesDone: 0, correctAnswers: 0, totalAnswers: 0,
  gamesPlayed: 0, bestWordSprint: 0, bestSpellingBee: 0, longestChain: 0,
  puzzlesSolved: 0, puzzleStreak: 0, sentencesBuilt: 0,
  badges: [], learnedWords: [], dailyActions: 0, lastDailyReset: '',
};

export const getStats = (): PlayerStats => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_STATS };
};

export const saveStats = (stats: PlayerStats): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

export const getLevelInfo = (xp: number): LevelInfo => {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }
  return {
    level: LEVELS.indexOf(currentLevel) + 1,
    title: currentLevel.title,
    emoji: currentLevel.emoji,
    xpRequired: currentLevel.xp,
    xpNext: nextLevel.xp,
  };
};

export const addXP = (amount: number, actionType?: string): { stats: PlayerStats; leveledUp: boolean; newBadges: string[] } => {
  const stats = getStats();
  const oldLevel = getLevelInfo(stats.xp).level;

  stats.xp += amount;

  const today = new Date().toISOString().split('T')[0];
  if (stats.lastDailyReset !== today) {
    stats.dailyActions = 0;
    stats.lastDailyReset = today;
  }
  stats.dailyActions += 1;

  if (stats.lastStudyDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    stats.streak = stats.lastStudyDate === yesterday ? stats.streak + 1 : 1;
    stats.lastStudyDate = today;
    stats.xp += stats.streak * 2;
  }

  const newLevel = getLevelInfo(stats.xp).level;
  const leveledUp = newLevel > oldLevel;
  stats.level = newLevel;

  const newBadges: string[] = [];
  BADGES.forEach(badge => {
    if (!stats.badges.includes(badge.id) && badge.condition(stats)) {
      stats.badges.push(badge.id);
      newBadges.push(badge.id);
    }
  });

  saveStats(stats);
  return { stats, leveledUp, newBadges };
};

export const XP_VALUES = {
  CHAT_MESSAGE: 5,
  FLASHCARD_CORRECT: 3,
  FLASHCARD_WRONG: 1,
  CHALLENGE_CORRECT: 15,
  CHALLENGE_WRONG: 3,
  WORD_SPRINT_CORRECT: 10,
  WORD_SPRINT_COMBO: 5,
  SPELLING_BEE_EASY: 8,
  SPELLING_BEE_HARD: 15,
  SENTENCE_BUILDER: 12,
  DAILY_PUZZLE_SOLVED: 25,
  DAILY_PUZZLE_1_TRY: 50,
  WORD_CHAIN: 5,
  FIRST_ACTION_BONUS: 10,
};

export const getDailyPuzzleWord = (): { word: string; definition: string; vi: string } => {
  const PUZZLE_WORDS = [
    { word: 'deploy', definition: 'to make a system or software available for use', vi: 'triển khai' },
    { word: 'schedule', definition: 'a plan of activities or events and when they will happen', vi: 'lịch trình' },
    { word: 'negotiate', definition: 'to discuss something to reach an agreement', vi: 'đàm phán' },
    { word: 'genuine', definition: 'truly what it is said to be; authentic and real', vi: 'chân thật' },
    { word: 'elaborate', definition: 'to add more details or information about something', vi: 'giải thích chi tiết' },
    { word: 'awkward', definition: 'causing difficulty or embarrassment; uncomfortable', vi: 'lúng túng' },
    { word: 'prioritize', definition: 'to decide which tasks are the most important', vi: 'ưu tiên' },
    { word: 'compromise', definition: 'an agreement where both sides give up something', vi: 'thỏa hiệp' },
    { word: 'milestone', definition: 'an important event or achievement in a project', vi: 'cột mốc' },
    { word: 'feasible', definition: 'possible and practical to do or achieve easily', vi: 'khả thi' },
    { word: 'delegate', definition: 'to give tasks or responsibilities to someone else', vi: 'phân công' },
    { word: 'optimize', definition: 'to make something as effective as possible', vi: 'tối ưu hóa' },
    { word: 'collaborate', definition: 'to work together with others on a project', vi: 'cộng tác' },
    { word: 'implement', definition: 'to put a plan or decision into action', vi: 'triển khai' },
    { word: 'initiative', definition: 'a new plan or action to improve something', vi: 'sáng kiến' },
    { word: 'feedback', definition: 'information about how good or useful something is', vi: 'phản hồi' },
    { word: 'deadline', definition: 'the latest time by which something must be done', vi: 'hạn chót' },
    { word: 'leverage', definition: 'to use something to maximum advantage', vi: 'tận dụng' },
    { word: 'expertise', definition: 'a high level of knowledge or skill in something', vi: 'chuyên môn' },
    { word: 'insight', definition: 'a deep and clear understanding of something', vi: 'hiểu biết sâu sắc' },
    { word: 'streamline', definition: 'to make a process simpler and more efficient', vi: 'tinh gọn' },
    { word: 'scalable', definition: 'able to grow or be made larger easily', vi: 'có thể mở rộng' },
    { word: 'productive', definition: 'achieving a lot; working effectively and efficiently', vi: 'năng suất' },
    { word: 'consensus', definition: 'general agreement among a group of people', vi: 'sự đồng thuận' },
    { word: 'benchmark', definition: 'a standard point of reference for comparing things', vi: 'tiêu chuẩn' },
    { word: 'resilient', definition: 'able to recover quickly from difficult situations', vi: 'kiên cường' },
    { word: 'ambitious', definition: 'having a strong desire to succeed or achieve', vi: 'tham vọng' },
    { word: 'versatile', definition: 'able to adapt to many different functions', vi: 'đa năng' },
    { word: 'authentic', definition: 'genuine and true; not fake or copied', vi: 'xác thực' },
    { word: 'efficient', definition: 'working well with no waste of time or money', vi: 'hiệu quả' },
  ];

  const dayIndex = Math.floor(Date.now() / 86400000) % PUZZLE_WORDS.length;
  return PUZZLE_WORDS[dayIndex];
};
