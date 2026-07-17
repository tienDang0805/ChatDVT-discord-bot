import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';
import { ChevronLeft, ChevronRight, Flame, Save, Trash2, Calendar, FileText } from 'lucide-react';

interface NoteEntry {
  content: string;
  updatedAt: string;
}

type NotesData = Record<string, NoteEntry>;

const STORAGE_KEY = 'note_daily_data';

const loadNotes = (): NotesData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveNotes = (data: NotesData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const formatDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const calculateStreak = (notes: NotesData): number => {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(today);

  while (true) {
    const key = formatDateKey(d);
    if (notes[key] && notes[key].content.trim().length > 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

const getCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days: { day: number; isCurrentMonth: boolean; dateKey: string }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    days.push({
      day: d,
      isCurrentMonth: false,
      dateKey: formatDateKey(new Date(y, m, d)),
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      isCurrentMonth: true,
      dateKey: formatDateKey(new Date(year, month, d)),
    });
  }

  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    days.push({
      day: d,
      isCurrentMonth: false,
      dateKey: formatDateKey(new Date(y, m, d)),
    });
  }

  return days;
};

export const NoteDaily = () => {
  const [notes, setNotes] = useState<NotesData>(loadNotes);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const streak = useMemo(() => calculateStreak(notes), [notes]);
  const totalNotes = useMemo(() => Object.values(notes).filter(n => n.content.trim().length > 0).length, [notes]);

  useEffect(() => {
    const existing = notes[selectedDate];
    setContent(existing?.content || '');
    setSaved(false);
  }, [selectedDate]);

  const handleSave = useCallback(() => {
    const updated = { ...notes };
    if (content.trim().length === 0) {
      delete updated[selectedDate];
    } else {
      updated[selectedDate] = {
        content: content.trim(),
        updatedAt: new Date().toISOString(),
      };
    }
    setNotes(updated);
    saveNotes(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [notes, selectedDate, content]);

  const handleDelete = useCallback(() => {
    if (!notes[selectedDate]) return;
    if (!confirm('Xoá note ngày này?')) return;
    const updated = { ...notes };
    delete updated[selectedDate];
    setNotes(updated);
    saveNotes(updated);
    setContent('');
  }, [notes, selectedDate]);

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
    setSelectedDate(formatDateKey(now));
  };

  const calendarDays = useMemo(() => getCalendarDays(calYear, calMonth), [calYear, calMonth]);

  const selectedDateLabel = useMemo(() => {
    const parts = selectedDate.split('-');
    return `${parseInt(parts[2])} ${MONTH_NAMES[parseInt(parts[1]) - 1]}, ${parts[0]}`;
  }, [selectedDate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  return (
    <PageShell
      title="Note Daily"
      subtitle="Ghi chú mỗi ngày · Xây dựng thói quen"
      icon="📝"
      backTo="/"
      maxWidth="5xl"
    >
      <style>{`
        @keyframes checkPop { 0% { transform: scale(0); } 60% { transform: scale(1.3); } 100% { transform: scale(1); } }
        .check-pop { animation: checkPop 0.3s ease-out; }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        {/* Left: Calendar + Stats */}
        <div className="space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-sm">
              <Flame size={20} className="mx-auto text-orange-500 mb-1" />
              <p className="text-2xl font-black text-orange-500">{streak}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Streak</p>
            </div>
            <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center shadow-sm">
              <FileText size={20} className="mx-auto text-cyan-500 mb-1" />
              <p className="text-2xl font-black text-cyan-500">{totalNotes}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tổng note</p>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleToday}
                className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-orange-500 transition-colors"
              >
                {MONTH_NAMES[calMonth]} {calYear}
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-2 px-2">
              {WEEKDAYS.map(w => (
                <div key={w}>{w}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px px-2 pb-3">
              {calendarDays.map((day, i) => {
                const hasNote = notes[day.dateKey] && notes[day.dateKey].content.trim().length > 0;
                const isSelected = day.dateKey === selectedDate;
                const isToday = day.dateKey === todayKey;

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day.dateKey)}
                    className={`
                      relative h-9 rounded-lg text-xs font-semibold transition-all flex items-center justify-center
                      ${!day.isCurrentMonth ? 'text-slate-300 dark:text-slate-700' : 'text-slate-700 dark:text-slate-300'}
                      ${isSelected
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                        : isToday
                          ? 'ring-2 ring-orange-500/50 bg-orange-50 dark:bg-orange-500/10'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    {day.day}
                    {hasNote && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Jump */}
          <button
            onClick={handleToday}
            className="w-full bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl py-3 text-sm font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Calendar size={16} /> Hôm nay
          </button>
        </div>

        {/* Right: Note Editor */}
        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col min-h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{selectedDateLabel}</h3>
              {notes[selectedDate]?.updatedAt && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Cập nhật: {new Date(notes[selectedDate].updatedAt).toLocaleTimeString('vi-VN')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notes[selectedDate] && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Xoá note"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {saved ? (
                  <span className="check-pop">✓ Đã lưu</span>
                ) : (
                  <>
                    <Save size={14} /> Lưu
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Hôm nay bạn muốn ghi gì?\n\nMẹo: Ctrl+S / ⌘+S để lưu nhanh.`}
            className="flex-1 w-full resize-none bg-transparent text-slate-800 dark:text-slate-200 px-5 py-4 outline-none text-sm leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-600"
          />

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>{content.length} ký tự</span>
            <span className="hidden sm:inline">Ctrl+S để lưu · Dữ liệu lưu trên thiết bị</span>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default NoteDaily;
