import { useState, useEffect, useCallback } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';

interface DayLog {
  checked: boolean;
  mood: string;
  note: string;
  timestamp?: number;
}

interface DetoxData {
  startDate: string;
  logs: Record<number, DayLog>;
  platforms: {
    tiktok: boolean;
    facebook: boolean;
    instagram: boolean;
  };
}

const STORAGE_KEY = 'digital_detox_30d';

const MOODS = [
  { emoji: '😤', label: 'Khó chịu' },
  { emoji: '😰', label: 'Bồn chồn' },
  { emoji: '😐', label: 'Bình thường' },
  { emoji: '😊', label: 'Thoải mái' },
  { emoji: '🤩', label: 'Tuyệt vời' },
  { emoji: '💪', label: 'Tự tin' },
  { emoji: '🧘', label: 'Bình yên' },
  { emoji: '🔥', label: 'Motivated' },
];

const MILESTONES = [
  { day: 3, title: '🌱 Bắt đầu nảy mầm', desc: 'Não bạn bắt đầu thích ứng. Cơn thèm scroll sẽ giảm dần.' },
  { day: 7, title: '🌿 1 tuần chiến binh', desc: 'Dopamine reset. Bạn bắt đầu tập trung tốt hơn.' },
  { day: 14, title: '🌳 Nửa chặng đường', desc: 'Thói quen mới đang hình thành. Bạn ít nghĩ đến MXH hơn.' },
  { day: 21, title: '⚡ Thay đổi thói quen', desc: 'Nghiên cứu cho thấy 21 ngày đủ để phá bỏ 1 thói quen cũ.' },
  { day: 30, title: '🏆 Chiến thắng vĩ đại', desc: 'Bạn đã hoàn thành 30 ngày! Một phiên bản mới, tỉnh táo hơn.' },
];

const getDefaultData = (): DetoxData => ({
  startDate: new Date().toISOString().slice(0, 10),
  logs: {},
  platforms: { tiktok: true, facebook: true, instagram: true },
});

const loadData = (): DetoxData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return JSON.parse(raw);
  } catch {
    return getDefaultData();
  }
};

const saveData = (data: DetoxData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const getDayNumber = (startDate: string): number => {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
};

const formatDate = (startDate: string, dayNum: number): string => {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayNum - 1);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export const DigitalDetox = () => {
  const [data, setData] = useState<DetoxData>(loadData);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    setIsStarted(!!raw);
  }, []);

  const currentDay = getDayNumber(data.startDate);

  const updateData = useCallback((newData: DetoxData) => {
    setData(newData);
    saveData(newData);
  }, []);

  const toggleDay = useCallback((dayNum: number) => {
    if (dayNum > currentDay || dayNum > 30) return;
    const newData = { ...data, logs: { ...data.logs } };
    const existing = newData.logs[dayNum];
    if (existing?.checked) {
      newData.logs[dayNum] = { ...existing, checked: false };
    } else {
      setSelectedDay(dayNum);
      setNoteText(existing?.note || '');
      setSelectedMood(existing?.mood || '');
      return;
    }
    updateData(newData);
  }, [data, currentDay, updateData]);

  const saveDayLog = useCallback(() => {
    if (selectedDay === null) return;
    const newData = { ...data, logs: { ...data.logs } };
    newData.logs[selectedDay] = {
      checked: true,
      mood: selectedMood || '😊',
      note: noteText,
      timestamp: Date.now(),
    };
    updateData(newData);
    setSelectedDay(null);
    setNoteText('');
    setSelectedMood('');
  }, [data, selectedDay, noteText, selectedMood, updateData]);

  const startChallenge = useCallback(() => {
    const newData = getDefaultData();
    updateData(newData);
    setIsStarted(true);
  }, [updateData]);

  const resetChallenge = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(getDefaultData());
    setIsStarted(false);
    setShowReset(false);
  }, []);

  const streak = (() => {
    let count = 0;
    for (let i = Math.min(currentDay, 30); i >= 1; i--) {
      if (data.logs[i]?.checked) count++;
      else break;
    }
    return count;
  })();

  const totalChecked = Object.values(data.logs).filter(l => l.checked).length;
  const progress = Math.round((totalChecked / 30) * 100);

  const currentMilestone = MILESTONES.filter(m => currentDay >= m.day).pop();
  const nextMilestone = MILESTONES.find(m => currentDay < m.day);

  const moodStats = (() => {
    const counts: Record<string, number> = {};
    Object.values(data.logs).forEach(l => {
      if (l.checked && l.mood) {
        counts[l.mood] = (counts[l.mood] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  })();

  if (!isStarted) {
    return (
      <PageShell title="Digital Detox" subtitle="30 ngày cách ly MXH" icon="📵" maxWidth="3xl">
        <div className="fade-up space-y-6">
          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-6 md:p-10 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
            <div className="relative z-10">
              <div className="text-6xl md:text-8xl mb-4">📵</div>
              <h2 className="text-2xl md:text-4xl font-black mb-3">30 Ngày Cách Ly MXH</h2>
              <p className="text-white/80 max-w-lg mx-auto mb-2 text-sm md:text-base">
                Tạm biệt TikTok, Facebook, Instagram. Chỉ giữ lại Messenger để liên lạc.
                Lấy lại sự tập trung, thời gian và năng lượng.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-6 mb-6">
                {[
                  { icon: '🎵', name: 'TikTok', color: 'bg-black/30' },
                  { icon: '📘', name: 'Facebook', color: 'bg-blue-600/30' },
                  { icon: '📸', name: 'Instagram', color: 'bg-pink-600/30' },
                ].map(p => (
                  <div key={p.name} className={`${p.color} backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-bold`}>
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                    <span className="text-red-300 text-xs">❌ BLOCK</span>
                  </div>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-xl px-4 py-2 text-sm">
                <span>💬</span> <span className="font-bold">Messenger</span> <span className="text-green-300">✅ OK</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🧠', title: 'Tập trung hơn', desc: 'Não ngừng bị kích thích liên tục, tư duy sâu trở lại' },
              { icon: '⏰', title: 'Nhiều thời gian', desc: 'Mỗi ngày tiết kiệm 2-4 giờ scroll vô nghĩa' },
              { icon: '😌', title: 'Tinh thần ổn', desc: 'Ngừng so sánh bản thân, giảm FOMO và anxiety' },
            ].map(b => (
              <div key={b.title} className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center">
                <div className="text-3xl mb-2">{b.icon}</div>
                <div className="font-bold text-slate-800 dark:text-white text-sm">{b.title}</div>
                <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">{b.desc}</div>
              </div>
            ))}
          </div>

          <button
            onClick={startChallenge}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-lg py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-violet-500/25"
          >
            🚀 Bắt Đầu 30 Ngày Ngay
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Digital Detox" subtitle={`Ngày ${Math.min(currentDay, 30)}/30 · ${progress}%`} icon="📵" maxWidth="4xl">
      <div className="fade-up space-y-5">

        {currentMilestone && currentDay <= 30 && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">{currentMilestone.title.split(' ')[0]}</span>
            <div>
              <div className="font-bold text-amber-700 dark:text-amber-400 text-sm">{currentMilestone.title}</div>
              <div className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">{currentMilestone.desc}</div>
            </div>
          </div>
        )}

        {currentDay > 30 && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-5 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="font-black text-green-600 dark:text-green-400 text-lg">Challenge Hoàn Thành!</div>
            <div className="text-slate-500 text-sm mt-1">Bạn đã vượt qua 30 ngày. {totalChecked}/30 ngày được tick.</div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon="🔥" label="Streak" value={`${streak} ngày`} color="text-orange-500" />
          <StatCard icon="✅" label="Đã tick" value={`${totalChecked}/30`} color="text-green-500" />
          <StatCard icon="📊" label="Tiến độ" value={`${progress}%`} color="text-blue-500" />
          <StatCard icon="📅" label="Ngày hiện tại" value={`${Math.min(currentDay, 30)}/30`} color="text-purple-500" />
        </div>

        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Tiến độ</span>
            {nextMilestone && (
              <span className="text-xs text-slate-500">Tiếp theo: {nextMilestone.title} (ngày {nextMilestone.day})</span>
            )}
          </div>
          <div className="relative h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="absolute h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {MILESTONES.map(m => (
              <div
                key={m.day}
                className={`text-[10px] font-bold ${totalChecked >= m.day ? 'text-violet-500' : 'text-slate-400'}`}
                title={m.title}
              >
                {m.title.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200">📅 30 Ngày</span>
            <button
              onClick={() => setShowStats(!showStats)}
              className="text-xs font-bold text-violet-500 hover:text-violet-400 transition-colors"
            >
              {showStats ? 'Ẩn thống kê' : '📊 Xem thống kê'}
            </button>
          </div>

          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(dayNum => {
              const log = data.logs[dayNum];
              const isToday = dayNum === Math.min(currentDay, 30);
              const isFuture = dayNum > currentDay;
              const isChecked = log?.checked;

              return (
                <button
                  key={dayNum}
                  onClick={() => !isFuture && toggleDay(dayNum)}
                  disabled={isFuture}
                  title={isChecked ? `${log.mood} ${log.note || ''}` : `Ngày ${dayNum} — ${formatDate(data.startDate, dayNum)}`}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all relative
                    ${isFuture ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 cursor-not-allowed' : ''}
                    ${isChecked ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md shadow-green-500/20 hover:scale-105' : ''}
                    ${!isFuture && !isChecked ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:scale-105 cursor-pointer border border-transparent hover:border-violet-400/50' : ''}
                    ${isToday && !isChecked ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-white dark:ring-offset-[#161b22] animate-pulse' : ''}
                  `}
                >
                  {isChecked ? (
                    <span className="text-lg leading-none">{log.mood || '✅'}</span>
                  ) : (
                    <span>{dayNum}</span>
                  )}
                  <span className="text-[8px] opacity-70 mt-0.5">{formatDate(data.startDate, dayNum)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 fade-up">
            <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="font-bold text-sm mb-3 text-slate-700 dark:text-slate-200">😊 Phân bố tâm trạng</div>
              {moodStats.length === 0 ? (
                <div className="text-slate-400 text-xs text-center py-4">Chưa có dữ liệu</div>
              ) : (
                <div className="space-y-2">
                  {moodStats.map(([mood, count]) => {
                    const moodInfo = MOODS.find(m => m.emoji === mood);
                    const pct = Math.round((count / totalChecked) * 100);
                    return (
                      <div key={mood} className="flex items-center gap-2">
                        <span className="text-lg w-8 text-center shrink-0">{mood}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                            <span>{moodInfo?.label || mood}</span>
                            <span>{count} ngày ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="font-bold text-sm mb-3 text-slate-700 dark:text-slate-200">📝 Nhật ký gần nhất</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(data.logs)
                  .filter(([, l]) => l.checked && l.note)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .slice(0, 5)
                  .map(([day, log]) => (
                    <div key={day} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{log.mood}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Ngày {day}</span>
                        <span className="text-slate-400">{formatDate(data.startDate, Number(day))}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">{log.note}</div>
                    </div>
                  ))}
                {Object.values(data.logs).filter(l => l.checked && l.note).length === 0 && (
                  <div className="text-slate-400 text-xs text-center py-4">Chưa có ghi chú nào</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setShowReset(true)}
            className="text-xs font-bold text-red-500/60 hover:text-red-500 transition-colors py-2 px-4"
          >
            🔄 Reset Challenge
          </button>
        </div>

        {selectedDay !== null && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDay(null)}>
            <div
              className="bg-white dark:bg-[#1c2333] rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-black text-lg text-slate-800 dark:text-white mb-1">
                ✅ Ngày {selectedDay} — {formatDate(data.startDate, selectedDay)}
              </h3>
              <p className="text-slate-500 text-xs mb-4">Đánh dấu ngày này đã cách ly MXH thành công</p>

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 block">Tâm trạng hôm nay</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m.emoji}
                      onClick={() => setSelectedMood(m.emoji)}
                      className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all text-center min-w-[52px] ${
                        selectedMood === m.emoji
                          ? 'bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-500 scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 block">Ghi chú (tuỳ chọn)</label>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Hôm nay cảm thấy thế nào? Có thèm scroll không?..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none h-24 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDay(null)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={saveDayLog}
                  disabled={!selectedMood}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  ✅ Tick ngày {selectedDay}
                </button>
              </div>
            </div>
          </div>
        )}

        {showReset && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReset(false)}>
            <div className="bg-white dark:bg-[#1c2333] rounded-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">⚠️</div>
                <h3 className="font-black text-lg text-slate-800 dark:text-white">Reset Challenge?</h3>
                <p className="text-slate-500 text-xs mt-1">Toàn bộ dữ liệu 30 ngày sẽ bị xoá. Không thể hoàn tác.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReset(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl text-sm"
                >
                  Giữ lại
                </button>
                <button
                  onClick={resetChallenge}
                  className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors text-sm"
                >
                  Xoá hết
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) => (
  <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
    <div className="text-xl mb-1">{icon}</div>
    <div className={`font-black text-lg ${color}`}>{value}</div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
  </div>
);

export default DigitalDetox;
