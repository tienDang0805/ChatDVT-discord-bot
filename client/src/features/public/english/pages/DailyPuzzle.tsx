import { useState, useEffect, useCallback } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';
import { Share2, RotateCcw, Volume2, HelpCircle } from 'lucide-react';
import { getDailyPuzzleWord, addXP, getStats, XP_VALUES } from '../utils/gamification';
import toast from 'react-hot-toast';
import { playTTS } from '../utils/tts';

type CellStatus = 'correct' | 'present' | 'absent' | 'empty' | 'active';

interface GuessRow {
  letters: string[];
  statuses: CellStatus[];
}

const MAX_GUESSES = 6;
const PUZZLE_STORAGE = 'eng_daily_puzzle';

const getPuzzleState = () => {
  try {
    const raw = localStorage.getItem(PUZZLE_STORAGE);
    if (raw) {
      const data = JSON.parse(raw);
      const today = Math.floor(Date.now() / 86400000);
      if (data.day === today) return data;
    }
  } catch {}
  return null;
};

const savePuzzleState = (state: any) => {
  localStorage.setItem(PUZZLE_STORAGE, JSON.stringify(state));
};

export const DailyPuzzle = () => {
  const puzzle = getDailyPuzzleWord();
  const wordLength = puzzle.word.length;
  const today = Math.floor(Date.now() / 86400000);

  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [shake, setShake] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [usedLetters, setUsedLetters] = useState<Record<string, CellStatus>>({});

  useEffect(() => {
    document.title = 'Daily Word Puzzle | English Hub';
    const saved = getPuzzleState();
    if (saved && saved.day === today) {
      setGuesses(saved.guesses || []);
      setGameOver(saved.gameOver || false);
      setWon(saved.won || false);
      setXpGained(saved.xpGained || 0);
      rebuildUsedLetters(saved.guesses || []);
    }
  }, [today]);

  const rebuildUsedLetters = (rows: GuessRow[]) => {
    const map: Record<string, CellStatus> = {};
    rows.forEach(row => {
      row.letters.forEach((letter, i) => {
        const status = row.statuses[i];
        if (status === 'correct') map[letter] = 'correct';
        else if (status === 'present' && map[letter] !== 'correct') map[letter] = 'present';
        else if (!map[letter]) map[letter] = 'absent';
      });
    });
    setUsedLetters(map);
  };

  const evaluateGuess = useCallback((guess: string): GuessRow => {
    const target = puzzle.word.toLowerCase();
    const letters = guess.split('');
    const statuses: CellStatus[] = new Array(wordLength).fill('absent');
    const targetChars = target.split('');
    const used = new Array(wordLength).fill(false);

    letters.forEach((l, i) => {
      if (l === targetChars[i]) {
        statuses[i] = 'correct';
        used[i] = true;
      }
    });

    letters.forEach((l, i) => {
      if (statuses[i] === 'correct') return;
      const idx = targetChars.findIndex((c, j) => c === l && !used[j]);
      if (idx >= 0) {
        statuses[i] = 'present';
        used[idx] = true;
      }
    });

    return { letters, statuses };
  }, [puzzle.word, wordLength]);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== wordLength || gameOver) return;
    const guess = currentGuess.toLowerCase();
    const row = evaluateGuess(guess);
    const newGuesses = [...guesses, row];
    const isWin = guess === puzzle.word.toLowerCase();
    const isLoss = newGuesses.length >= MAX_GUESSES && !isWin;
    const over = isWin || isLoss;

    setGuesses(newGuesses);
    setCurrentGuess('');
    rebuildUsedLetters(newGuesses);

    let earnedXP = 0;
    if (isWin) {
      setWon(true);
      earnedXP = newGuesses.length === 1 ? XP_VALUES.DAILY_PUZZLE_1_TRY : XP_VALUES.DAILY_PUZZLE_SOLVED;
      const result = addXP(earnedXP);
      const stats = result.stats;
      stats.puzzlesSolved = (stats.puzzlesSolved || 0) + 1;
      stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
      localStorage.setItem('eng_progress', JSON.stringify(stats));
      setXpGained(earnedXP);
    }
    if (over) setGameOver(true);

    savePuzzleState({ day: today, guesses: newGuesses, gameOver: over, won: isWin, xpGained: earnedXP });
  }, [currentGuess, wordLength, gameOver, guesses, puzzle.word, evaluateGuess, today]);

  const handleKey = useCallback((key: string) => {
    if (gameOver) return;
    if (key === 'ENTER') { submitGuess(); return; }
    if (key === 'BACKSPACE') { setCurrentGuess(prev => prev.slice(0, -1)); return; }
    if (/^[a-zA-Z]$/.test(key) && currentGuess.length < wordLength) {
      setCurrentGuess(prev => prev + key.toLowerCase());
    }
  }, [gameOver, submitGuess, currentGuess.length, wordLength]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleKey('ENTER');
      else if (e.key === 'Backspace') handleKey('BACKSPACE');
      else if (e.key.length === 1) handleKey(e.key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  const shareResult = () => {
    const dayNum = today % 365;
    const grid = guesses.map(row =>
      row.statuses.map(s => s === 'correct' ? '🟩' : s === 'present' ? '🟨' : '⬜').join('')
    ).join('\n');
    const text = `English Hub Daily #${dayNum} — ${won ? guesses.length : 'X'}/${MAX_GUESSES}\n\n${grid}`;
    navigator.clipboard.writeText(text).then(() => toast.success('Đã copy kết quả!'));
  };

  const speak = (text: string) => {
    playTTS(text, 0.8);
  };

  const KEYBOARD_ROWS = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['ENTER','z','x','c','v','b','n','m','BACKSPACE'],
  ];

  const allRows: (GuessRow | null)[] = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    if (i < guesses.length) allRows.push(guesses[i]);
    else if (i === guesses.length && !gameOver) allRows.push(null);
    else allRows.push(null);
  }

  return (
    <PageShell title="Daily Word Puzzle" subtitle={`Đoán từ trong ${MAX_GUESSES} lần`} icon="🧩" backTo="/english">
      <style>{`
        @keyframes flipIn{0%{transform:rotateX(90deg)}100%{transform:rotateX(0)}}
        @keyframes popIn{0%{transform:scale(0.8);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes bounceIn{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
        @keyframes shakeRow{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
        .cell-flip{animation:flipIn .3s ease-out both}
        .cell-pop{animation:popIn .15s ease-out both}
        .cell-bounce{animation:bounceIn .3s ease-out both}
        .row-shake{animation:shakeRow .3s ease-out}
      `}</style>

      <div className="space-y-5 fade-up max-w-sm mx-auto">
        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Gợi ý</p>
            <button onClick={() => setShowHelp(!showHelp)} className="text-slate-400 hover:text-orange-500 transition-colors">
              <HelpCircle size={16} />
            </button>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">"{puzzle.definition}"</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">{wordLength} letters</p>
        </div>

        {showHelp && (
          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">A</span> Đúng vị trí</div>
            <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">A</span> Có trong từ, sai vị trí</div>
            <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-slate-400 dark:bg-slate-600 text-white flex items-center justify-center text-[10px] font-black">A</span> Không có trong từ</div>
          </div>
        )}

        <div className="space-y-1.5">
          {allRows.map((row, ri) => {
            const isCurrentRow = ri === guesses.length && !gameOver;
            return (
              <div key={ri} className={`flex gap-1.5 justify-center ${shake && isCurrentRow ? 'row-shake' : ''}`}>
                {Array.from({ length: wordLength }).map((_, ci) => {
                  let letter = '';
                  let status: CellStatus = 'empty';

                  if (row) {
                    letter = row.letters[ci] || '';
                    status = row.statuses[ci] || 'empty';
                  } else if (isCurrentRow && ci < currentGuess.length) {
                    letter = currentGuess[ci];
                    status = 'active';
                  }

                  const bgMap: Record<CellStatus, string> = {
                    correct: 'bg-emerald-500 border-emerald-500 text-white',
                    present: 'bg-amber-500 border-amber-500 text-white',
                    absent: 'bg-slate-400 dark:bg-slate-600 border-slate-400 dark:border-slate-600 text-white',
                    active: 'bg-white dark:bg-[#1f2937] border-slate-300 dark:border-slate-500 text-slate-800 dark:text-white',
                    empty: 'bg-white dark:bg-[#131923] border-slate-200 dark:border-slate-800',
                  };

                  return (
                    <div
                      key={ci}
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-lg border-2 flex items-center justify-center text-lg md:text-xl font-black uppercase transition-all ${bgMap[status]} ${row ? 'cell-flip' : status === 'active' ? 'cell-pop' : ''}`}
                      style={row ? { animationDelay: `${ci * 100}ms` } : undefined}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {gameOver && (
          <div className={`p-5 rounded-xl border shadow-sm text-center ${won ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'}`}>
            <p className="text-lg font-black mb-1">{won ? '🎉 Tuyệt vời!' : '😢 Chưa đoán được!'}</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-2xl font-black text-slate-800 dark:text-white uppercase">{puzzle.word}</p>
              <button onClick={() => speak(puzzle.word)} className="text-orange-500 hover:text-orange-400 active:scale-90">
                <Volume2 size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{puzzle.vi}</p>
            {won && xpGained > 0 && (
              <p className="text-sm font-bold text-orange-500 mt-2 cell-bounce">+{xpGained} XP</p>
            )}
            <button onClick={shareResult} className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2">
              <Share2 size={16} /> Share Result
            </button>
          </div>
        )}

        {!gameOver && (
          <div className="space-y-1.5">
            {KEYBOARD_ROWS.map((row, ri) => (
              <div key={ri} className="flex gap-1 justify-center">
                {row.map(key => {
                  const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
                  const status = usedLetters[key];
                  let bg = 'bg-slate-200 dark:bg-[#1f2937] text-slate-700 dark:text-slate-300';
                  if (status === 'correct') bg = 'bg-emerald-500 text-white';
                  else if (status === 'present') bg = 'bg-amber-500 text-white';
                  else if (status === 'absent') bg = 'bg-slate-400 dark:bg-slate-700 text-slate-200 dark:text-slate-500';

                  return (
                    <button
                      key={key}
                      onClick={() => handleKey(key)}
                      className={`${isSpecial ? 'px-3 text-[10px]' : 'w-8 md:w-9'} h-11 md:h-12 rounded-lg font-bold text-sm transition-all active:scale-90 ${isSpecial ? 'bg-orange-500 hover:bg-orange-600 text-white' : bg}`}
                    >
                      {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? 'ENTER' : key.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default DailyPuzzle;
