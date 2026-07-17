import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';
import { Plus, Trash2, Check, Flame, ListTodo, CalendarDays, ChevronLeft, ChevronRight, GripVertical, Star, Clock, Filter, CheckCircle2, Circle, X, Pencil } from 'lucide-react';

type Priority = 'high' | 'medium' | 'low';
type FilterType = 'all' | 'active' | 'completed' | 'today';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
}

type TodosData = Record<string, TodoItem[]>;

const STORAGE_KEY = 'note_daily_todos';
const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string; ring: string }> = {
  high: { label: 'Cao', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', ring: 'ring-rose-500/30' },
  medium: { label: 'TB', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', ring: 'ring-amber-500/30' },
  low: { label: 'Thấp', color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/30', ring: 'ring-sky-500/30' },
};

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_NAMES = ['Th.1','Th.2','Th.3','Th.4','Th.5','Th.6','Th.7','Th.8','Th.9','Th.10','Th.11','Th.12'];

const formatDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const loadTodos = (): TodosData => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
};

const saveTodos = (data: TodosData) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const calcStreak = (data: TodosData): number => {
  let streak = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (true) {
    const key = formatDateKey(d);
    const tasks = data[key];
    if (tasks && tasks.length > 0 && tasks.some(t => t.completed)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (formatDateKey(d) === formatDateKey(new Date())) {
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
  const prevDays = new Date(year, month, 0).getDate();
  const days: { day: number; current: boolean; dateKey: string }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    days.push({ day: d, current: false, dateKey: formatDateKey(new Date(y, m, d)) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, current: true, dateKey: formatDateKey(new Date(year, month, d)) });
  }
  const rem = 42 - days.length;
  for (let d = 1; d <= rem; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    days.push({ day: d, current: false, dateKey: formatDateKey(new Date(y, m, d)) });
  }
  return days;
};

const TodoItemRow = ({ item, onToggle, onDelete, onEdit }: {
  item: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (text: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);
  const p = PRIORITY_CONFIG[item.priority];

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== item.text) onEdit(trimmed);
    else setEditText(item.text);
    setEditing(false);
  };

  return (
    <div className={`group flex items-start gap-3 px-4 py-3 rounded-xl border transition-all duration-300
      ${item.completed
        ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
        : `bg-white dark:bg-[#131923] ${p.border} hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-black/20`
      }`}
    >
      <button
        onClick={onToggle}
        className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300
          ${item.completed
            ? 'bg-green-500 border-green-500 scale-110'
            : `border-slate-300 dark:border-slate-600 hover:border-green-400 hover:scale-110`
          }`}
      >
        {item.completed && <Check size={12} className="text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') { setEditText(item.text); setEditing(false); } }}
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 outline-none border-b-2 border-orange-500 pb-0.5"
          />
        ) : (
          <p
            onDoubleClick={() => { if (!item.completed) setEditing(true); }}
            className={`text-sm leading-relaxed cursor-default select-none transition-all duration-300
              ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}
          >
            {item.text}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${p.bg} ${p.color}`}>
            {p.label}
          </span>
          {item.completedAt && (
            <span className="text-[10px] text-green-500 flex items-center gap-0.5">
              <CheckCircle2 size={10} /> {new Date(item.completedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!item.completed && (
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">
            <Pencil size={13} />
          </button>
        )}
        <button onClick={onDelete} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export const NoteDaily = () => {
  const [allTodos, setAllTodos] = useState<TodosData>(loadTodos);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [filter, setFilter] = useState<FilterType>('all');
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [showCal, setShowCal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const currentTodos = useMemo(() => allTodos[selectedDate] || [], [allTodos, selectedDate]);
  const streak = useMemo(() => calcStreak(allTodos), [allTodos]);

  const totalAll = currentTodos.length;
  const totalDone = currentTodos.filter(t => t.completed).length;
  const totalActive = totalAll - totalDone;
  const progress = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  const globalStats = useMemo(() => {
    let total = 0, done = 0;
    Object.values(allTodos).forEach(list => {
      total += list.length;
      done += list.filter(t => t.completed).length;
    });
    return { total, done };
  }, [allTodos]);

  const persist = useCallback((updated: TodosData) => {
    setAllTodos(updated);
    saveTodos(updated);
  }, []);

  const addTodo = useCallback(() => {
    const text = newText.trim();
    if (!text) return;
    const todo: TodoItem = {
      id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text,
      completed: false,
      priority: newPriority,
      createdAt: new Date().toISOString(),
    };
    const updated = { ...allTodos, [selectedDate]: [...currentTodos, todo] };
    persist(updated);
    setNewText('');
    inputRef.current?.focus();
  }, [newText, newPriority, allTodos, selectedDate, currentTodos, persist]);

  const toggleTodo = useCallback((id: string) => {
    const updated = {
      ...allTodos,
      [selectedDate]: currentTodos.map(t =>
        t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined } : t
      ),
    };
    persist(updated);
  }, [allTodos, selectedDate, currentTodos, persist]);

  const deleteTodo = useCallback((id: string) => {
    const updated = { ...allTodos, [selectedDate]: currentTodos.filter(t => t.id !== id) };
    if (updated[selectedDate].length === 0) delete updated[selectedDate];
    persist(updated);
  }, [allTodos, selectedDate, currentTodos, persist]);

  const editTodo = useCallback((id: string, text: string) => {
    const updated = {
      ...allTodos,
      [selectedDate]: currentTodos.map(t => t.id === id ? { ...t, text } : t),
    };
    persist(updated);
  }, [allTodos, selectedDate, currentTodos, persist]);

  const clearCompleted = useCallback(() => {
    if (!confirm('Xoá tất cả task đã hoàn thành?')) return;
    const updated = { ...allTodos, [selectedDate]: currentTodos.filter(t => !t.completed) };
    if (updated[selectedDate].length === 0) delete updated[selectedDate];
    persist(updated);
  }, [allTodos, selectedDate, currentTodos, persist]);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active': return currentTodos.filter(t => !t.completed);
      case 'completed': return currentTodos.filter(t => t.completed);
      default: return currentTodos;
    }
  }, [currentTodos, filter]);

  const sortedTodos = useMemo(() => {
    const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    return [...filteredTodos].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [filteredTodos]);

  const calendarDays = useMemo(() => getCalendarDays(calYear, calMonth), [calYear, calMonth]);

  const selectedLabel = useMemo(() => {
    const p = selectedDate.split('-');
    const d = parseInt(p[2]);
    const m = MONTH_NAMES[parseInt(p[1]) - 1];
    return selectedDate === todayKey ? `Hôm nay — ${d} ${m}` : `${d} ${m}, ${p[0]}`;
  }, [selectedDate, todayKey]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTodo();
    }
  }, [addTodo]);

  return (
    <PageShell title="Note Daily" subtitle="Todo List · Xây dựng thói quen mỗi ngày" icon="✅" backTo="/" maxWidth="5xl">
      <style>{`
        @keyframes todoSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .todo-enter { animation: todoSlideIn 0.25s ease-out; }
        @keyframes progressPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
      `}</style>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Flame, value: streak, label: 'Streak', color: 'text-orange-500' },
          { icon: ListTodo, value: globalStats.total, label: 'Tổng task', color: 'text-cyan-500' },
          { icon: CheckCircle2, value: globalStats.done, label: 'Hoàn thành', color: 'text-green-500' },
          { icon: Star, value: `${progress}%`, label: 'Hôm nay', color: 'text-amber-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center shadow-sm">
            <s.icon size={18} className={`mx-auto ${s.color} mb-1`} />
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Date Selector + Calendar Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(formatDateKey(d)); }}
            className="p-2 rounded-xl bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-orange-500 transition-colors shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{selectedLabel}</h2>
          <button
            onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(formatDateKey(d)); }}
            className="p-2 rounded-xl bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-orange-500 transition-colors shadow-sm"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {selectedDate !== todayKey && (
            <button onClick={() => setSelectedDate(todayKey)} className="text-xs font-bold text-orange-500 hover:underline">
              Hôm nay
            </button>
          )}
          <button
            onClick={() => setShowCal(!showCal)}
            className={`p-2 rounded-xl border transition-colors shadow-sm ${showCal ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white dark:bg-[#131923] border-slate-200 dark:border-slate-800 text-slate-500 hover:text-orange-500'}`}
          >
            <CalendarDays size={16} />
          </button>
        </div>
      </div>

      {/* Mini Calendar (collapsible) */}
      {showCal && (
        <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm mb-6 overflow-hidden todo-enter">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><ChevronLeft size={16} /></button>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{MONTH_NAMES[calMonth]} {calYear}</span>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1.5 px-2">
            {WEEKDAYS.map(w => <div key={w}>{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-px px-2 pb-2">
            {calendarDays.map((day, i) => {
              const hasTasks = (allTodos[day.dateKey] || []).length > 0;
              const allDone = hasTasks && (allTodos[day.dateKey] || []).every(t => t.completed);
              const isSelected = day.dateKey === selectedDate;
              const isToday = day.dateKey === todayKey;
              return (
                <button
                  key={i}
                  onClick={() => { setSelectedDate(day.dateKey); setShowCal(false); }}
                  className={`relative h-8 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center
                    ${!day.current ? 'text-slate-300 dark:text-slate-700' : 'text-slate-600 dark:text-slate-300'}
                    ${isSelected ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : isToday ? 'ring-2 ring-orange-500/40' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
                  `}
                >
                  {day.day}
                  {hasTasks && !isSelected && (
                    <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${allDone ? 'bg-green-500' : 'bg-orange-500'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {totalAll > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
            <span className="text-slate-400 dark:text-slate-500">{totalDone}/{totalAll} task hoàn thành</span>
            <span className={`${progress === 100 ? 'text-green-500' : 'text-orange-500'}`}>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${progress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-orange-500 to-amber-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Task */}
      <div className="bg-white dark:bg-[#131923] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <Plus size={18} className="text-slate-300 dark:text-slate-600 shrink-0" />
            <input
              ref={inputRef}
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Thêm task mới... (Enter để thêm)"
              className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {(['high', 'medium', 'low'] as Priority[]).map(p => (
              <button
                key={p}
                onClick={() => setNewPriority(p)}
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border transition-all
                  ${newPriority === p
                    ? `${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].color} ${PRIORITY_CONFIG[p].border} ring-2 ${PRIORITY_CONFIG[p].ring}`
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300'
                  }`}
              >
                {PRIORITY_CONFIG[p].label}
              </button>
            ))}
          </div>
          <button
            onClick={addTodo}
            disabled={!newText.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-all active:scale-90 shadow-sm shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          {([
            { key: 'all' as FilterType, label: 'Tất cả', count: totalAll },
            { key: 'active' as FilterType, label: 'Đang làm', count: totalActive },
            { key: 'completed' as FilterType, label: 'Xong', count: totalDone },
          ]).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors
                ${filter === f.key
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {f.label} {f.count > 0 && <span className="ml-0.5 opacity-70">({f.count})</span>}
            </button>
          ))}
        </div>
        {totalDone > 0 && (
          <button onClick={clearCompleted} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1">
            <Trash2 size={11} /> Xoá đã xong
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-2 min-h-[200px]">
        {sortedTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {totalAll === 0 ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                  <ListTodo size={28} className="text-orange-500/50" />
                </div>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">Chưa có task nào</p>
                <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Thêm task đầu tiên cho ngày {selectedDate === todayKey ? 'hôm nay' : 'này'}</p>
              </>
            ) : (
              <>
                <Filter size={28} className="text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm text-slate-400">Không có task nào ở filter này</p>
              </>
            )}
          </div>
        ) : (
          sortedTodos.map(item => (
            <div key={item.id} className="todo-enter">
              <TodoItemRow
                item={item}
                onToggle={() => toggleTodo(item.id)}
                onDelete={() => deleteTodo(item.id)}
                onEdit={(text) => editTodo(item.id, text)}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="mt-8 text-center">
        <p className="text-[10px] text-slate-300 dark:text-slate-600">
          Dữ liệu lưu trên thiết bị · Double-click để sửa task · Enter để thêm nhanh
        </p>
      </div>
    </PageShell>
  );
};

export default NoteDaily;
