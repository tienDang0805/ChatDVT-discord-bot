import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageShell } from '../../../../shared/components/PageShell';

interface Slip {
  platform: string;
  minutes: number;
  reason: string;
  note: string;
  time: string;
  ts: number;
}

interface DayLog {
  morningTs?: number;
  slips: Slip[];
  evening?: {
    mood: string;
    note: string;
    selfScore: number;
    ts: number;
  };
}

interface DetoxData {
  startDate: string;
  logs: Record<number, DayLog>;
  code?: string;
}

const STORAGE_KEY = 'digital_detox_30d';
const CODE_KEY = 'digital_detox_code';
const AVG_HOURS_PER_DAY = 2.5;
const HOURLY_VALUE_VND = 50000;

const PLATFORMS = [
  { id: 'tiktok', icon: '🎵', name: 'TikTok', color: 'bg-black/10 dark:bg-white/10 border-slate-300 dark:border-slate-600' },
  { id: 'facebook', icon: '📘', name: 'Facebook', color: 'bg-blue-500/10 border-blue-400/30' },
  { id: 'instagram', icon: '📸', name: 'Instagram', color: 'bg-pink-500/10 border-pink-400/30' },
  { id: 'youtube', icon: '▶️', name: 'YouTube', color: 'bg-red-500/10 border-red-400/30' },
  { id: 'twitter', icon: '🐦', name: 'X/Twitter', color: 'bg-sky-500/10 border-sky-400/30' },
  { id: 'other', icon: '📱', name: 'Khác', color: 'bg-slate-500/10 border-slate-400/30' },
];

const SLIP_REASONS = [
  'Buồn chán', 'Thói quen vô thức', 'FOMO', 'Check tin nhắn rồi lướt luôn',
  'Áp lực / Stress', 'Trước khi ngủ', 'Vừa thức dậy', 'Không kiềm được',
];

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
  { day: 3, badge: '🌱', title: 'Nảy mầm' },
  { day: 7, badge: '🌿', title: '1 tuần' },
  { day: 14, badge: '🌳', title: 'Nửa đường' },
  { day: 21, badge: '⚡', title: 'Phá thói quen' },
  { day: 30, badge: '🏆', title: 'Chiến thắng' },
];

const TREE_STAGES = [
  { min: 0, art: '🌰', label: 'Hạt giống' },
  { min: 3, art: '🌱', label: 'Nảy mầm' },
  { min: 7, art: '🌿', label: 'Cây non' },
  { min: 14, art: '🪴', label: 'Lớn dần' },
  { min: 21, art: '🌳', label: 'Trưởng thành' },
  { min: 30, art: '🌸', label: 'Nở hoa' },
];

const QUOTES = [
  'Mỗi lần không mở MXH, não bạn đang tự chữa lành.',
  'Bạn không bỏ lỡ gì. MXH vẫn ở đó, thời gian thì không.',
  'Tập trung là siêu năng lực quý nhất thế kỷ 21.',
  '2h scroll = 1 chương sách hoặc 1 buổi gym.',
  'Dopamine từ thành tựu thật luôn sướng hơn like ảo.',
  'Bạn đang sống cho mình, không phải cho algorithm.',
  'Mỗi ngày không scroll là 1 ngày thực sự SỐNG.',
  'Não không được thiết kế để tiêu thụ 500 video/ngày.',
  'Cách ly MXH là quay về với chính mình.',
  'Ngừng so sánh, bắt đầu sống.',
  'Điện thoại là công cụ, không phải chủ nhân.',
  'Buồn chán là tín hiệu não muốn bạn sáng tạo.',
  'Bạn mạnh hơn bạn nghĩ. Cơn thèm qua trong 10 phút.',
  'Mỗi streak day là bằng chứng bạn kiểm soát bản thân.',
  'Đặt điện thoại xuống. Thế giới thật đẹp hơn feed.',
  'Tự do bắt đầu khi không bị notification điều khiển.',
  'MXH cho bạn like, nhưng lấy đi sự bình yên.',
  'Thói quen nhỏ, kết quả lớn. Kiên trì từng ngày.',
  'Hãy đầu tư thời gian vào người thật.',
  'Algorithm biết bạn thích gì. Bạn có biết mình muốn gì?',
  'Ngày mai bạn sẽ cảm ơn hôm nay đã kiên trì.',
  'Cai MXH khó hơn cai cafe. Mà bạn đang làm được.',
  'Scrolling vô thức là cách nhanh nhất lãng phí 1 đời.',
  'Sự im lặng số là liều thuốc tốt nhất cho tâm trí.',
  'Mỗi giờ không scroll = 1 giờ sống cho giấc mơ.',
  'Không ai trên giường bệnh nói: Ước gì scroll nhiều hơn.',
  'Bạn đang xây dựng phiên bản tốt hơn của chính mình.',
  'Hôm nay là ngày chứng minh mình không phải con nghiện.',
  'Kiên trì là khi không ai nhìn mà bạn vẫn giữ lời.',
  'CHIẾN THẮNG. Bạn là HUYỀN THOẠI. 🏆',
];

const getDefault = (): DetoxData => ({ startDate: new Date().toISOString().slice(0, 10), logs: {} });
const load = (): DetoxData => { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : getDefault(); } catch { return getDefault(); } };
const save = (d: DetoxData) => localStorage.setItem(STORAGE_KEY, JSON.stringify(d));

const getDayNum = (start: string): number => {
  const s = new Date(start); const t = new Date(); s.setHours(0,0,0,0); t.setHours(0,0,0,0);
  return Math.floor((t.getTime() - s.getTime()) / 86400000) + 1;
};

const fmtDate = (start: string, day: number): string => {
  const d = new Date(start); d.setDate(d.getDate() + day - 1);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const fmtNum = (n: number) => n.toLocaleString('vi-VN');

type Modal = 'none' | 'morning' | 'slip' | 'evening' | 'reset' | 'dayDetail';

const API_BASE = import.meta.env.VITE_API_URL || '';

const syncToServer = async (code: string, data: DetoxData) => {
  try {
    await fetch(`${API_BASE}/api/detox/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, data }),
    });
  } catch {}
};

const loadFromServer = async (code: string): Promise<DetoxData | null> => {
  try {
    const res = await fetch(`${API_BASE}/api/detox/load/${encodeURIComponent(code)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch { return null; }
};

export const DigitalDetox = () => {
  const [data, setData] = useState<DetoxData>(load);
  const [isStarted, setIsStarted] = useState(!!localStorage.getItem(CODE_KEY));
  const [modal, setModal] = useState<Modal>('none');
  const [elapsed, setElapsed] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [showStats, setShowStats] = useState(false);
  const [detailDay, setDetailDay] = useState<number>(1);
  const [detoxCode, setDetoxCode] = useState(localStorage.getItem(CODE_KEY) || '');
  const [codeInput, setCodeInput] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');

  const [slipPlatform, setSlipPlatform] = useState('');
  const [slipMinutes, setSlipMinutes] = useState('5');
  const [slipReason, setSlipReason] = useState('');
  const [slipNote, setSlipNote] = useState('');
  const [sendingReport, setSendingReport] = useState(false);

  const [evMood, setEvMood] = useState('');
  const [evNote, setEvNote] = useState('');
  const [evScore, setEvScore] = useState(7);

  useEffect(() => {
    if (!isStarted) return;
    const tick = () => {
      const diff = Math.max(0, Date.now() - new Date(data.startDate).getTime());
      setElapsed({ d: Math.floor(diff/86400000), h: Math.floor((diff%86400000)/3600000), m: Math.floor((diff%3600000)/60000), s: Math.floor((diff%60000)/1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [isStarted, data.startDate]);

  const currentDay = getDayNum(data.startDate);
  const todayLog = data.logs[Math.min(currentDay, 30)];

  const upd = useCallback((d: DetoxData) => {
    setData(d); save(d);
    if (detoxCode) syncToServer(detoxCode, d);
  }, [detoxCode]);

  const doMorning = useCallback(() => {
    const day = Math.min(currentDay, 30);
    const nd = { ...data, logs: { ...data.logs } };
    nd.logs[day] = { ...(nd.logs[day] || { slips: [] }), morningTs: Date.now() };
    upd(nd);
    setModal('none');
  }, [data, currentDay, upd]);

  const doSlip = useCallback(() => {
    if (!slipPlatform) return;
    const day = Math.min(currentDay, 30);
    const nd = { ...data, logs: { ...data.logs } };
    const existing = nd.logs[day] || { slips: [] };
    const newSlip: Slip = {
      platform: slipPlatform,
      minutes: parseInt(slipMinutes) || 5,
      reason: slipReason || 'Không rõ',
      note: slipNote,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ts: Date.now(),
    };
    nd.logs[day] = { ...existing, slips: [...(existing.slips || []), newSlip] };
    upd(nd);
    setSlipPlatform(''); setSlipMinutes('5'); setSlipReason(''); setSlipNote('');
    setModal('none');
  }, [data, currentDay, slipPlatform, slipMinutes, slipReason, slipNote, upd]);

  const sendDetoxReport = useCallback(async (dayNum: number, dayLog: DayLog, mood: string, note: string, score: number) => {
    try {
      await fetch(`${API_BASE}/api/detox-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day: dayNum, log: dayLog, mood, note, score, startDate: data.startDate, code: detoxCode }),
      });
    } catch {}
  }, [data.startDate, detoxCode]);

  const doEvening = useCallback(async () => {
    if (!evMood) return;
    setSendingReport(true);
    const day = Math.min(currentDay, 30);
    const nd = { ...data, logs: { ...data.logs } };
    const updatedLog: DayLog = { ...(nd.logs[day] || { slips: [] }), evening: { mood: evMood, note: evNote, selfScore: evScore, ts: Date.now() } };
    nd.logs[day] = updatedLog;
    upd(nd);
    await sendDetoxReport(day, updatedLog, evMood, evNote, evScore);
    setSendingReport(false);
    setEvMood(''); setEvNote(''); setEvScore(7);
    setModal('none');
  }, [data, currentDay, evMood, evNote, evScore, upd, sendDetoxReport]);

  const enterCode = useCallback(async (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized || normalized.length < 2) { setCodeError('Mã phải từ 2 ký tự'); return; }
    setCodeLoading(true); setCodeError('');
    const serverData = await loadFromServer(normalized);
    setCodeLoading(false);
    if (serverData) {
      setData(serverData); save(serverData);
    } else {
      const nd = getDefault();
      nd.code = normalized;
      upd(nd);
    }
    setDetoxCode(normalized);
    localStorage.setItem(CODE_KEY, normalized);
    setIsStarted(true);
  }, [upd]);

  const resetChallenge = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CODE_KEY);
    setData(getDefault());
    setDetoxCode('');
    setIsStarted(false);
    setModal('none');
  }, []);

  const completedDays = useMemo(() => Object.values(data.logs).filter(l => l.evening).length, [data.logs]);
  const progress = Math.round((completedDays / 30) * 100);

  const totalSlips = useMemo(() => Object.values(data.logs).reduce((s, l) => s + (l.slips?.length || 0), 0), [data.logs]);
  const totalSlipMins = useMemo(() => Object.values(data.logs).reduce((s, l) => s + (l.slips || []).reduce((a, sl) => a + sl.minutes, 0), 0), [data.logs]);
  const avgScore = useMemo(() => {
    const scores = Object.values(data.logs).filter(l => l.evening).map(l => l.evening!.selfScore);
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-';
  }, [data.logs]);

  const streak = useMemo(() => {
    let c = 0;
    for (let i = Math.min(currentDay, 30); i >= 1; i--) {
      if (data.logs[i]?.evening) c++; else break;
    }
    return c;
  }, [data.logs, currentDay]);

  const treeStage = useMemo(() => {
    let s = TREE_STAGES[0];
    for (const t of TREE_STAGES) { if (completedDays >= t.min) s = t; }
    return s;
  }, [completedDays]);

  const hoursSaved = Math.max(0, completedDays * AVG_HOURS_PER_DAY - totalSlipMins / 60);
  const moneySaved = hoursSaved * HOURLY_VALUE_VND;
  const todayQuote = QUOTES[Math.min(currentDay - 1, QUOTES.length - 1)] || QUOTES[0];
  const unlockedBadges = MILESTONES.filter(m => completedDays >= m.day);
  const nextMilestone = MILESTONES.find(m => completedDays < m.day);

  const platformStats = useMemo(() => {
    const counts: Record<string, { count: number; mins: number }> = {};
    Object.values(data.logs).forEach(l => (l.slips || []).forEach(s => {
      if (!counts[s.platform]) counts[s.platform] = { count: 0, mins: 0 };
      counts[s.platform].count++;
      counts[s.platform].mins += s.minutes;
    }));
    return Object.entries(counts).sort((a, b) => b[1].count - a[1].count);
  }, [data.logs]);

  const reasonStats = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(data.logs).forEach(l => (l.slips || []).forEach(s => { counts[s.reason] = (counts[s.reason] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [data.logs]);

  const moodStats = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(data.logs).forEach(l => { if (l.evening) counts[l.evening.mood] = (counts[l.evening.mood] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [data.logs]);

  const hasMorning = !!todayLog?.morningTs;
  const hasEvening = !!todayLog?.evening;
  const todaySlipCount = todayLog?.slips?.length || 0;

  if (!isStarted) {
    return (
      <PageShell title="Digital Detox" subtitle="30 ngày cách ly MXH" icon="📵" maxWidth="3xl">
        <div className="fade-up space-y-6">
          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-6 md:p-10 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'2\'/%3E%3C/g%3E%3C/svg%3E")'}} />
            <div className="relative z-10">
              <div className="text-7xl md:text-9xl mb-4">🌱</div>
              <h2 className="text-2xl md:text-4xl font-black mb-3">30 Ngày Cách Ly MXH</h2>
              <p className="text-white/75 max-w-lg mx-auto text-sm leading-relaxed mb-4">
                Tạm biệt TikTok, Facebook, Instagram.<br/>
                <span className="font-bold text-white/90">Check-in sáng · Log slip · Review tối.</span><br/>
                Trồng cây bằng sự kiên trì. Thống kê chi tiết từng ngày.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {['🎵 TikTok ❌', '📘 Facebook ❌', '📸 Instagram ❌'].map(p => (
                  <div key={p} className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold">{p}</div>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-xl px-4 py-2 text-sm mb-6">
                💬 <span className="font-bold">Messenger</span> <span className="text-green-300">✅</span>
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                {[
                  { icon: '☀️', label: 'Check-in sáng', desc: 'Cam kết đầu ngày' },
                  { icon: '🚨', label: 'Log slip', desc: 'Ghi lần lỡ vào' },
                  { icon: '🌙', label: 'Review tối', desc: 'Tổng kết cuối ngày' },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-3">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-[10px] font-bold">{s.label}</div>
                    <div className="text-[9px] text-white/50">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">Nhập mã của bạn (mã mới = tạo challenge, mã cũ = tiếp tục)</label>
              <input
                value={codeInput}
                onChange={e => { setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '')); setCodeError(''); }}
                placeholder="VD: TIENDANG"
                maxLength={30}
                className="w-full bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 outline-none uppercase tracking-widest text-center"
              />
              {codeError && <div className="text-xs text-red-500 font-bold mt-1 text-center">{codeError}</div>}
            </div>
            <button
              onClick={() => enterCode(codeInput)}
              disabled={codeInput.length < 2 || codeLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-lg py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {codeLoading ? '⏳ Đang kiểm tra...' : '🌱 Bắt Đầu'}
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Digital Detox" subtitle={`Ngày ${Math.min(currentDay,30)}/30 · ${progress}%`} icon="📵" maxWidth="4xl">
      <div className="fade-up space-y-3 md:space-y-4">

        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-3 md:p-4">
          <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Đã cách ly</div>
          <div className="flex items-center justify-center gap-3">
            {[{v:elapsed.d,u:'ngày'},{v:elapsed.h,u:'giờ'},{v:elapsed.m,u:'phút'},{v:elapsed.s,u:'giây'}].map(t => (
              <div key={t.u} className="text-center">
                <div className="text-xl md:text-3xl font-black text-violet-600 dark:text-violet-400 tabular-nums leading-none">{String(t.v).padStart(2,'0')}</div>
                <div className="text-[8px] font-bold text-slate-400 uppercase mt-1">{t.u}</div>
              </div>
            ))}
          </div>
        </div>

        {currentDay <= 30 && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl p-3 md:p-4">
            <div className="text-xs font-bold text-slate-500 mb-2 md:mb-3 uppercase tracking-wider">📋 Hôm nay — Ngày {Math.min(currentDay, 30)}</div>
            <div className="grid grid-cols-3 gap-1.5 md:gap-2">
              <button
                onClick={() => !hasMorning && setModal('morning')}
                className={`rounded-xl p-3 text-center transition-all border-2 ${hasMorning ? 'bg-green-50 dark:bg-green-900/20 border-green-400/50 cursor-default' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-400/50 hover:border-amber-500 active:scale-95 cursor-pointer animate-pulse'}`}
              >
                <div className="text-xl mb-1">{hasMorning ? '✅' : '☀️'}</div>
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Check-in sáng</div>
                {hasMorning && <div className="text-[9px] text-green-600 dark:text-green-400 mt-0.5">
                  {new Date(todayLog.morningTs!).toLocaleTimeString('vi-VN', {hour:'2-digit',minute:'2-digit'})}
                </div>}
              </button>

              <button
                onClick={() => setModal('slip')}
                className={`rounded-xl p-3 text-center transition-all border-2 active:scale-95 ${todaySlipCount === 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-400/50' : 'bg-red-50 dark:bg-red-900/20 border-red-400/50'} hover:border-slate-400`}
              >
                <div className="text-xl mb-1">{todaySlipCount === 0 ? '💚' : '🚨'}</div>
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {todaySlipCount === 0 ? 'Chưa slip' : `${todaySlipCount} lần slip`}
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">Bấm để log</div>
              </button>

              <button
                onClick={() => { if (!hasEvening) { setEvMood(''); setEvNote(''); setEvScore(7); setModal('evening'); } }}
                className={`rounded-xl p-3 text-center transition-all border-2 ${hasEvening ? 'bg-green-50 dark:bg-green-900/20 border-green-400/50 cursor-default' : 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-400/50 hover:border-indigo-500 active:scale-95 cursor-pointer'}`}
              >
                <div className="text-xl mb-1">{hasEvening ? '✅' : '🌙'}</div>
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Review tối</div>
                {hasEvening && <div className="text-[9px] text-green-600 dark:text-green-400 mt-0.5">{todayLog.evening!.mood} {todayLog.evening!.selfScore}/10</div>}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-1.5 md:gap-3">
          <StatCard icon="🔥" label="Streak" value={`${streak}`} sub="ngày liên tiếp" accent="text-orange-500" />
          <StatCard icon="⏰" label="Tiết kiệm" value={`${Math.round(hoursSaved)}h`} sub={`≈ ${fmtNum(Math.round(moneySaved))}đ`} accent="text-emerald-500" />
          <StatCard icon="🚨" label="Tổng slip" value={`${totalSlips}`} sub={`${totalSlipMins}m`} accent="text-red-500" />
          <StatCard icon="⭐" label="TB" value={`${avgScore}`} sub="/10" accent="text-amber-500" />
        </div>

        <div className="flex items-center gap-3 md:gap-4 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-3 md:p-4">
          <div className="text-3xl md:text-4xl shrink-0" style={{filter: completedDays === 0 ? 'grayscale(1) opacity(0.3)' : 'none'}}>{treeStage.art}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs md:text-sm text-slate-700 dark:text-slate-200">{treeStage.label}</span>
              <span className="text-[10px] md:text-xs text-slate-400">{completedDays}/30</span>
            </div>
            <div className="h-2 md:h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700" style={{width:`${progress}%`}} />
            </div>
            {nextMilestone && <div className="text-[9px] md:text-[10px] text-slate-400 mt-1">Tiếp: {nextMilestone.badge} {nextMilestone.title} ({nextMilestone.day - completedDays} ngày)</div>}
          </div>
          {unlockedBadges.length > 0 && (
            <div className="flex gap-0.5 md:gap-1 shrink-0">{unlockedBadges.map(b => <span key={b.day} className="text-base md:text-lg" title={b.title}>{b.badge}</span>)}</div>
          )}
        </div>

        <div className="bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 flex items-start gap-3">
          <span className="text-xl shrink-0">💬</span>
          <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">"{todayQuote}"</p>
        </div>

        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200">📅 30 Ngày</span>
            <button onClick={() => setShowStats(!showStats)} className="text-xs font-bold text-violet-500 hover:text-violet-400">
              {showStats ? 'Ẩn' : '📊 Thống kê'}
            </button>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5 md:gap-2">
            {Array.from({length:30},(_,i)=>i+1).map(d => {
              const log = data.logs[d];
              const isToday = d === Math.min(currentDay,30) && currentDay <= 30;
              const isFuture = d > currentDay;
              const hasEv = !!log?.evening;
              const hasMn = !!log?.morningTs;
              const slipC = log?.slips?.length || 0;

              let bg = 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600';
              if (isFuture) bg += ' opacity-40 cursor-not-allowed';
              else if (hasEv && slipC === 0) bg = 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md shadow-green-500/20';
              else if (hasEv && slipC > 0) bg = 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md shadow-amber-500/20';
              else if (hasMn) bg = 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-300/50';
              else if (!isFuture) bg = 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 cursor-pointer';

              return (
                <button
                  key={d}
                  onClick={() => { if (!isFuture && log) { setDetailDay(d); setModal('dayDetail'); } }}
                  disabled={isFuture}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all hover:scale-110 active:scale-95 ${bg} ${isToday ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-white dark:ring-offset-[#161b22]' : ''}`}
                >
                  {hasEv ? <span className="text-sm leading-none">{log.evening!.mood}</span> : <span>{d}</span>}
                  {slipC > 0 && hasEv && <span className="text-[7px] leading-none mt-0.5">{slipC}🚨</span>}
                  <span className="text-[7px] opacity-50 leading-none mt-0.5">{fmtDate(data.startDate, d)}</span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-[9px] font-bold text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-500 inline-block" /> Hoàn thành</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Có slip</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-400 inline-block" /> Check-in sáng</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-600 inline-block" /> Chưa làm</span>
          </div>
        </div>

        {showStats && (
          <div className="space-y-4 fade-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="font-bold text-sm mb-3 text-slate-700 dark:text-slate-200">🚨 Slip theo nền tảng</div>
                {platformStats.length === 0 ? <div className="text-slate-400 text-xs text-center py-3">Chưa có slip nào 🎉</div> : (
                  <div className="space-y-2">
                    {platformStats.map(([pid, s]) => {
                      const p = PLATFORMS.find(x => x.id === pid);
                      return (
                        <div key={pid} className="flex items-center gap-2">
                          <span className="text-lg w-7 shrink-0 text-center">{p?.icon || '📱'}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                              <span>{p?.name || pid}</span><span>{s.count}x · {s.mins} phút</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 rounded-full" style={{width:`${Math.min(100, (s.count/Math.max(1,totalSlips))*100)}%`}} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="font-bold text-sm mb-3 text-slate-700 dark:text-slate-200">🧠 Lý do slip</div>
                {reasonStats.length === 0 ? <div className="text-slate-400 text-xs text-center py-3">Chưa có</div> : (
                  <div className="space-y-1.5">
                    {reasonStats.map(([r, c]) => (
                      <div key={r} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                        <span className="text-xs text-slate-600 dark:text-slate-300">{r}</span>
                        <span className="text-xs font-bold text-red-500">{c}x</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="font-bold text-sm mb-3 text-slate-700 dark:text-slate-200">😊 Tâm trạng</div>
                {moodStats.length === 0 ? <div className="text-slate-400 text-xs text-center py-3">Chưa có</div> : (
                  <div className="space-y-2">
                    {moodStats.map(([mood, count]) => {
                      const info = MOODS.find(m => m.emoji === mood);
                      const pct = Math.round((count / completedDays) * 100);
                      return (
                        <div key={mood} className="flex items-center gap-2">
                          <span className="text-lg w-7 text-center shrink-0">{mood}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                              <span>{info?.label || mood}</span><span>{count}x ({pct}%)</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full" style={{width:`${pct}%`}} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="font-bold text-sm mb-3 text-slate-700 dark:text-slate-200">📈 Điểm tự chấm theo tuần</div>
                <div className="space-y-2">
                  {[1,2,3,4].map(week => {
                    const start = (week-1)*7+1; const end = Math.min(week*7, 30);
                    const scores = [];
                    for (let d=start; d<=end; d++) { if (data.logs[d]?.evening) scores.push(data.logs[d].evening!.selfScore); }
                    const avg = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
                    const slipW = (() => { let c=0; for (let d=start;d<=end;d++) c+=(data.logs[d]?.slips?.length||0); return c; })();
                    return (
                      <div key={week} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 w-12 shrink-0">Tuần {week}</span>
                        <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all" style={{width:`${avg*10}%`}} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 w-20 text-right">{avg ? avg.toFixed(1) : '-'}/10 · {slipW}🚨</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <button onClick={() => setModal('reset')} className="text-xs font-bold text-red-400/60 hover:text-red-500 transition-colors py-2 px-3">🔄 Reset</button>
          <div className="text-[10px] text-slate-400 text-right">
            {detoxCode && <span className="inline-block bg-violet-500/10 border border-violet-500/20 rounded px-1.5 py-0.5 font-bold text-violet-500 mr-2">🔑 {detoxCode}</span>}
            Bắt đầu: {new Date(data.startDate).toLocaleDateString('vi-VN')}
          </div>
        </div>

        {modal === 'morning' && (
          <Overlay onClose={() => setModal('none')}>
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">☀️</div>
              <h3 className="font-black text-lg text-slate-800 dark:text-white">Check-in Sáng</h3>
              <p className="text-slate-500 text-xs mt-1">Cam kết: Hôm nay tôi sẽ KHÔNG lướt MXH vô nghĩa.</p>
            </div>
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-3 mb-4 text-center">
              <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{todayQuote}"</p>
            </div>
            <button onClick={doMorning} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-xl text-sm active:scale-[0.97]">
              ☀️ Tôi cam kết!
            </button>
          </Overlay>
        )}

        {modal === 'slip' && (
          <Overlay onClose={() => setModal('none')}>
            <h3 className="font-black text-lg text-slate-800 dark:text-white mb-1">🚨 Log Slip</h3>
            <p className="text-slate-500 text-xs mb-4">Thành thật ghi lại. Nhận diện pattern để cải thiện.</p>

            <div className="mb-3">
              <label className="text-xs font-bold text-slate-500 mb-2 block">Vào app nào?</label>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => setSlipPlatform(p.id)}
                    className={`${p.color} border rounded-xl p-2 text-center transition-all ${slipPlatform === p.id ? 'ring-2 ring-violet-500 scale-105' : ''}`}>
                    <div className="text-lg">{p.icon}</div>
                    <div className="text-[9px] font-bold text-slate-600 dark:text-slate-300">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs font-bold text-slate-500 mb-1 block">Bao lâu? (phút)</label>
              <div className="flex gap-2">
                {['1','5','15','30','60'].map(m => (
                  <button key={m} onClick={() => setSlipMinutes(m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${slipMinutes === m ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs font-bold text-slate-500 mb-1 block">Lý do?</label>
              <div className="flex flex-wrap gap-1.5">
                {SLIP_REASONS.map(r => (
                  <button key={r} onClick={() => setSlipReason(r)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${slipReason === r ? 'bg-violet-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-500 mb-1 block">Ghi chú tại sao vào? (chi tiết)</label>
              <textarea value={slipNote} onChange={e => setSlipNote(e.target.value)}
                placeholder="Đang làm gì? Cảm xúc thế nào? Tại sao không cưỡng lại được?..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none h-16 focus:ring-2 focus:ring-red-500 outline-none" />
            </div>

            <button onClick={doSlip} disabled={!slipPlatform}
              className="w-full bg-red-500 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]">
              🚨 Ghi nhận
            </button>
          </Overlay>
        )}

        {modal === 'evening' && (() => {
          const day = Math.min(currentDay, 30);
          const log = todayLog || { slips: [] };
          const slips = log.slips || [];
          const slipMins = slips.reduce((a, s) => a + s.minutes, 0);
          const prevLog = data.logs[day - 1];
          const prevSlips = prevLog?.slips?.length || 0;
          const prevMins = (prevLog?.slips || []).reduce((a: number, s: Slip) => a + s.minutes, 0);
          const slipDiff = todaySlipCount - prevSlips;
          const minsDiff = slipMins - prevMins;
          const platBreakdown: Record<string, { count: number; mins: number }> = {};
          slips.forEach(s => {
            if (!platBreakdown[s.platform]) platBreakdown[s.platform] = { count: 0, mins: 0 };
            platBreakdown[s.platform].count++;
            platBreakdown[s.platform].mins += s.minutes;
          });
          const isPerfect = todaySlipCount === 0;
          const isImproved = day > 1 && prevLog && slipDiff < 0;

          return (
            <Overlay onClose={() => setModal('none')}>
              <h3 className="font-black text-lg text-slate-800 dark:text-white mb-3">🌙 Tổng Kết Ngày {day}</h3>

              <div className={`rounded-xl p-4 mb-4 text-center ${isPerfect ? 'bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'}`}>
                <div className="text-3xl mb-1">{isPerfect ? '🎉' : todaySlipCount <= 2 ? '👍' : '😬'}</div>
                <div className={`font-black text-sm ${isPerfect ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {isPerfect ? 'PERFECT — 0 slip!' : `${todaySlipCount} lần slip · ${slipMins} phút`}
                </div>
                {!isPerfect && (
                  <div className="text-[10px] text-slate-500 mt-1">
                    ≈ {slipMins < 60 ? `${slipMins} phút` : `${(slipMins/60).toFixed(1)} giờ`} lãng phí
                  </div>
                )}
              </div>

              {!isPerfect && Object.keys(platBreakdown).length > 0 && (
                <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/50 rounded-xl p-3 mb-3">
                  <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2">Chi tiết slip hôm nay</div>
                  <div className="space-y-1">
                    {Object.entries(platBreakdown).map(([pid, s]) => {
                      const p = PLATFORMS.find(x => x.id === pid);
                      return (
                        <div key={pid} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5">
                            <span>{p?.icon || '📱'}</span>
                            <span className="font-bold text-slate-600 dark:text-slate-300">{p?.name || pid}</span>
                          </span>
                          <span className="text-red-500 font-bold">{s.count}x · {s.mins}m</span>
                        </div>
                      );
                    })}
                  </div>
                  {slips.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-red-200/50 dark:border-red-800/50">
                      <div className="text-[10px] font-bold text-slate-500 mb-1">Timeline</div>
                      <div className="flex flex-wrap gap-1">
                        {slips.map((s, i) => {
                          const p = PLATFORMS.find(x => x.id === s.platform);
                          return <span key={i} className="bg-white dark:bg-slate-800 rounded px-1.5 py-0.5 text-[9px] font-bold text-slate-500">{s.time} {p?.icon} {s.minutes}m</span>;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {day > 1 && prevLog && (
                <div className={`rounded-xl p-3 mb-4 flex items-center gap-3 ${isImproved ? 'bg-green-50 dark:bg-green-900/10 border border-green-300/50' : slipDiff > 0 ? 'bg-red-50 dark:bg-red-900/10 border border-red-300/50' : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'}`}>
                  <span className="text-2xl">{isImproved ? '📈' : slipDiff > 0 ? '📉' : '➡️'}</span>
                  <div className="text-xs">
                    <div className="font-bold text-slate-700 dark:text-slate-200">
                      So với hôm qua: {slipDiff === 0 ? 'Giữ nguyên' : slipDiff < 0 ? `Giảm ${Math.abs(slipDiff)} lần slip` : `Tăng ${slipDiff} lần slip`}
                    </div>
                    {minsDiff !== 0 && (
                      <div className={`text-[10px] ${minsDiff < 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {minsDiff < 0 ? `Ít hơn ${Math.abs(minsDiff)} phút` : `Nhiều hơn ${minsDiff} phút`}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Đánh giá cuối ngày</div>
              </div>

              <div className="mb-3">
                <label className="text-xs font-bold text-slate-500 mb-2 block">Tâm trạng</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(m => (
                    <button key={m.emoji} onClick={() => setEvMood(m.emoji)}
                      className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-[44px] ${evMood === m.emoji ? 'bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-500 scale-110' : 'bg-slate-100 dark:bg-slate-800 border-2 border-transparent'}`}>
                      <span className="text-lg">{m.emoji}</span>
                      <span className="text-[8px] font-bold text-slate-400">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Tự chấm điểm kỷ luật: <span className="text-violet-500 text-sm">{evScore}/10</span></label>
                <input type="range" min="1" max="10" value={evScore} onChange={e => setEvScore(Number(e.target.value))}
                  className="w-full accent-violet-500" />
                <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                  <span>1 😵</span><span>5 😐</span><span>10 🏆</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Ghi chú</label>
                <textarea value={evNote} onChange={e => setEvNote(e.target.value)}
                  placeholder="Hôm nay thế nào? Có gì khác biệt?..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none h-16 focus:ring-2 focus:ring-violet-500 outline-none" />
              </div>

              <button onClick={doEvening} disabled={!evMood || sendingReport}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-40 active:scale-[0.97]">
                {sendingReport ? '⏳ Đang gửi báo cáo...' : `🌙 Hoàn thành ngày ${day}`}
              </button>
            </Overlay>
          );
        })()}

        {modal === 'dayDetail' && data.logs[detailDay] && (
          <Overlay onClose={() => setModal('none')}>
            <h3 className="font-black text-lg text-slate-800 dark:text-white mb-1">📋 Ngày {detailDay} — {fmtDate(data.startDate, detailDay)}</h3>
            {(() => {
              const log = data.logs[detailDay];
              return (
                <div className="space-y-3 mt-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span>{log.morningTs ? '✅' : '❌'}</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">Check-in sáng</span>
                    {log.morningTs && <span className="text-slate-400">{new Date(log.morningTs).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</span>}
                  </div>
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300">🚨 Slip: {log.slips?.length || 0} lần</div>
                  {(log.slips || []).map((s, i) => {
                    const p = PLATFORMS.find(x => x.id === s.platform);
                    return (
                      <div key={i} className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span>{p?.icon || '📱'}</span>
                          <span className="font-bold">{p?.name || s.platform}</span>
                          <span className="text-slate-400">·</span>
                          <span>{s.minutes}m</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500">{s.reason}</span>
                          <span className="ml-auto text-slate-400">{s.time}</span>
                        </div>
                        {s.note && <div className="text-[10px] text-slate-500 mt-1 pl-6 italic">"{s.note}"</div>}
                      </div>
                    );
                  })}
                  {log.evening ? (
                    <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 rounded-lg p-3 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <span className="text-lg">{log.evening.mood}</span>
                        <span>Điểm kỷ luật: {log.evening.selfScore}/10</span>
                      </div>
                      {log.evening.note && <div className="text-xs text-slate-500">{log.evening.note}</div>}
                    </div>
                  ) : <div className="text-xs text-slate-400">Chưa review tối</div>}
                </div>
              );
            })()}
          </Overlay>
        )}

        {modal === 'reset' && (
          <Overlay onClose={() => setModal('none')}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">💀</div>
              <h3 className="font-black text-lg text-slate-800 dark:text-white">Bỏ cuộc?</h3>
              <p className="text-slate-500 text-xs mt-1">Cây {treeStage.art} sẽ héo. Toàn bộ dữ liệu xoá sạch.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModal('none')} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl text-sm">Tiếp tục chiến!</button>
              <button onClick={resetChallenge} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl text-sm">Xoá hết</button>
            </div>
          </Overlay>
        )}
      </div>
    </PageShell>
  );
};

const Overlay = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
    <div className="bg-white dark:bg-[#1c2333] rounded-t-2xl md:rounded-2xl p-4 md:p-5 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const StatCard = ({ icon, label, value, sub, accent }: { icon: string; label: string; value: string; sub: string; accent: string }) => (
  <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-2 md:p-3 text-center">
    <div className="text-sm md:text-lg mb-0.5">{icon}</div>
    <div className={`font-black text-base md:text-xl leading-none ${accent}`}>{value}</div>
    <div className="text-[8px] md:text-[9px] font-bold text-slate-400 mt-0.5 md:mt-1 truncate">{sub}</div>
    <div className="text-[7px] md:text-[8px] text-slate-300 dark:text-slate-600 uppercase tracking-wider mt-0.5 truncate">{label}</div>
  </div>
);

export default DigitalDetox;
