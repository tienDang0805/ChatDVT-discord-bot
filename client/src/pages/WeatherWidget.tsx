import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, Droplets, Wind, Thermometer, Eye, Sun, Sunrise, Sunset,
  MapPin, RefreshCw, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog,
  X, ChevronRight, ChevronLeft, Calendar, Compass, Clock
} from 'lucide-react';

// @ts-ignore
import { Solar } from 'lunar-javascript';

const CITY_NAME = 'TP. Hồ Chí Minh';

interface CurrentWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  visibility: number;
  clouds: number;
  description: string;
  icon: string;
  main: string;
  sunrise: number;
  sunset: number;
}

interface ForecastDay {
  date: string;
  dayName: string;
  temp_min: number;
  temp_max: number;
  icon: string;
  description: string;
  humidity: number;
  pop: number;
}

interface HourlyForecast {
  time: string;
  temp: number;
  icon: string;
  description: string;
  pop: number;
}

const getWeatherIconEl = (main: string, size: number = 24) => {
  const p = { size, strokeWidth: 1.5 };
  switch (main.toLowerCase()) {
    case 'thunderstorm': return <CloudLightning {...p} className="text-yellow-500 dark:text-yellow-400" />;
    case 'drizzle': return <CloudDrizzle {...p} className="text-blue-400 dark:text-blue-300" />;
    case 'rain': return <CloudRain {...p} className="text-blue-500 dark:text-blue-400" />;
    case 'snow': return <CloudSnow {...p} className="text-slate-400 dark:text-white" />;
    case 'mist': case 'fog': case 'haze': return <CloudFog {...p} className="text-slate-400" />;
    case 'clear': return <Sun {...p} className="text-amber-500 dark:text-yellow-400" />;
    case 'clouds': return <Cloud {...p} className="text-slate-400 dark:text-slate-300" />;
    default: return <Cloud {...p} className="text-slate-400" />;
  }
};

const getWeatherEmoji = (main: string) => {
  switch (main.toLowerCase()) {
    case 'thunderstorm': return '⛈️';
    case 'drizzle': return '🌦️';
    case 'rain': return '🌧️';
    case 'snow': return '❄️';
    case 'mist': case 'fog': case 'haze': return '🌫️';
    case 'clear': return '☀️';
    case 'clouds': return '☁️';
    default: return '🌤️';
  }
};

const getWindDir = (deg: number) => {
  const d = ['Bắc', 'ĐB', 'Đông', 'ĐN', 'Nam', 'TN', 'Tây', 'TB'];
  return d[Math.round(deg / 45) % 8];
};

const fmtTime = (ts: number) => new Date(ts * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const getDayOfWeek = (d: Date) => ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][d.getDay()];
const getShortDay = (s: string) => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(s).getDay()];

const GAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const ZHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const ANIMAL = ['Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê', 'Khỉ', 'Gà', 'Chó', 'Heo'];

const DIR_MAP: Record<string, string> = {
  '东': 'Đông', '南': 'Nam', '西': 'Tây', '北': 'Bắc',
  '东南': 'Đông Nam', '东北': 'Đông Bắc', '西南': 'Tây Nam', '西北': 'Tây Bắc',
  '正东': 'Chính Đông', '正南': 'Chính Nam', '正西': 'Chính Tây', '正北': 'Chính Bắc'
};

const NAYIN_MAP: Record<string, string> = {
  "海中金": "Hải Trung Kim", "炉中火": "Lư Trung Hỏa", "大林木": "Đại Lâm Mộc", "路旁土": "Lộ Bàng Thổ", "剑锋金": "Kiếm Phong Kim", "山头火": "Sơn Đầu Hỏa",
  "涧下水": "Giản Hạ Thủy", "城头土": "Thành Đầu Thổ", "白蜡金": "Bạch Lạp Kim", "杨柳木": "Dương Liễu Mộc", "泉中水": "Tuyền Trung Thủy", "屋上土": "Ốc Thượng Thổ",
  "霹雳火": "Tích Lịch Hỏa", "松柏木": "Tùng Bách Mộc", "长流水": "Trường Lưu Thủy", "沙中金": "Sa Trung Kim", "山下火": "Sơn Hạ Hỏa", "平地木": "Bình Địa Mộc",
  "壁上土": "Bích Thượng Thổ", "金箔金": "Kim Bạch Kim", "覆灯火": "Phú Đăng Hỏa", "天河水": "Thiên Hà Thủy", "大驿土": "Đại Trạch Thổ", "钗钏金": "Thoa Xuyến Kim",
  "桑柘木": "Tang Đố Mộc", "大溪水": "Đại Khê Thủy", "沙中土": "Sa Trung Thổ", "天上火": "Thiên Thượng Hỏa", "石榴木": "Thạch Lựu Mộc", "大海水": "Đại Hải Thủy"
};

const JIEQI_MAP: Record<string, string> = {
  "冬至": "Đông Chí", "小寒": "Tiểu Hàn", "大寒": "Đại Hàn", "立春": "Lập Xuân", "雨水": "Vũ Thủy", "惊蛰": "Kinh Trập",
  "春分": "Xuân Phân", "清明": "Thanh Minh", "谷雨": "Cốc Vũ", "立夏": "Lập Hạ", "小满": "Tiểu Mãn", "芒种": "Mang Chủng",
  "夏至": "Hạ Chí", "小暑": "Tiểu Thử", "大暑": "Đại Thử", "立秋": "Lập Thu", "处暑": "Xử Thử", "白露": "Bạch Lộ",
  "秋分": "Thu Phân", "寒露": "Hàn Lộ", "霜降": "Sương Giáng", "立冬": "Lập Đông", "小雪": "Tiểu Tuyết", "大雪": "Đại Tuyết"
};

const ACT_MAP: Record<string, string> = {
  "嫁娶": "Cưới hỏi", "祭祀": "Tế tự", "动土": "Động thổ", "祈福": "Cầu phúc", "求嗣": "Cầu tự", "出行": "Xuất hành", 
  "移徙": "Di dời", "安床": "An sàng", "安葬": "An táng", "破土": "Phá thổ", "入宅": "Nhập trạch", "挂匾": "Treo biển", 
  "开市": "Mở hàng", "交易": "Giao dịch", "纳财": "Nạp tài", "立券": "Lập khoán", "纳畜": "Nạp súc", "解除": "Giải trừ", 
  "理发": "Cắt tóc", "扫舍": "Quét nhà", "沐浴": "Tắm gội", "修造": "Sửa chữa", "竖柱": "Dựng cột", "上梁": "Cất nóc", 
  "作灶": "Làm bếp", "除服": "Trừ phục", "成服": "Thành phục", "纳采": "Dạm ngõ", "订盟": "Đính hôn", "纳婿": "Nhận rể", 
  "冠笄": "Làm lễ trưởng", "裁衣": "Cắt may", "合帐": "May màn", "会亲友": "Hội người thân", "治病": "Trị bệnh", 
  "造庙": "Xây miếu", "盖屋": "Lợp nhà", "余事勿取": "Trừ các việc trên", "诸事不宜": "Mọi việc đều kỵ", "破屋坏垣": "Phá nhà",
  "造仓": "Làm kho", "斋醮": "Trai tiếu", "谢土": "Tạ thổ", "起基": "Làm móng", "安香": "Lập bát hương", "放水": "Tháo nước",
  "开池": "Đào ao", "造桥": "Làm cầu", "掘井": "Đào giếng"
};

function getLunarInfo(date?: Date) {
  const solar = Solar.fromDate(date || new Date());
  const lunar = solar.getLunar();

  const lunarDay = lunar.getDay();
  const lunarMonth = lunar.getMonth();
  const lunarYear = lunar.getYear();

  const yearGZ = `${GAN[lunar.getYearGanIndex()]} ${ZHI[lunar.getYearZhiIndex()]}`;
  const monthGZ = `${GAN[lunar.getMonthGanIndex()]} ${ZHI[lunar.getMonthZhiIndex()]}`;
  const dayGZ = `${GAN[lunar.getDayGanIndex()]} ${ZHI[lunar.getDayZhiIndex()]}`;

  const currentJQ = lunar.getCurrentJieQi();
  const prevJQ = lunar.getPrevJieQi();
  const rawJieQi = lunar.getJieQi() || (currentJQ ? currentJQ._p?.name : '') || (prevJQ ? prevJQ._p?.name : '') || '';
  const jieQi = JIEQI_MAP[rawJieQi] || rawJieQi;

  const naYin = NAYIN_MAP[lunar.getDayNaYin()] || lunar.getDayNaYin();

  const xiShen = DIR_MAP[lunar.getDayPositionXiDesc()] || lunar.getDayPositionXiDesc();
  const caiShen = DIR_MAP[lunar.getDayPositionCaiDesc()] || lunar.getDayPositionCaiDesc();
  const fuShen = DIR_MAP[lunar.getDayPositionFuDesc()] || lunar.getDayPositionFuDesc();

  // Chong = opposing zhi. Zhi difference is 6.
  const chongZhiIdx = (lunar.getDayZhiIndex() + 6) % 12;
  const chongGanIdx = lunar.getDayChongGanIndex !== undefined 
    ? lunar.getDayChongGanIndex() 
    : (lunar.getDayGanIndex() + 6) % 10;
  
  const chong = `(${GAN[chongGanIdx]} ${ZHI[chongZhiIdx]}) ${ANIMAL[chongZhiIdx]}`;
  const sha = DIR_MAP[lunar.getDaySha()] || lunar.getDaySha();

  const yiOrigin: string[] = lunar.getDayYi();
  const jiOrigin: string[] = lunar.getDayJi();
  
  // Translate and filter out unmapped to keep UI clean, unless it's empty then we show "Tùy ý"
  let yi = yiOrigin.map(x => ACT_MAP[x]).filter(Boolean);
  let ji = jiOrigin.map(x => ACT_MAP[x]).filter(Boolean);
  
  if (yi.length === 0) yi = ["Bình thường"];
  if (ji.length === 0) ji = ["Không có hạn"];

  const times = lunar.getTimes();
  const goodHours: string[] = [];
  const badHours: string[] = [];
  
  const chiNames = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const timeRanges = ['23-01', '01-03', '03-05', '05-07', '07-09', '09-11', '11-13', '13-15', '15-17', '17-19', '19-21', '21-23'];

  times.forEach((t: any, i: number) => {
    if (i >= 12) return;
    const isGood = t.getTianShenLuck() === '吉';
    const entry = `${chiNames[i]} (${timeRanges[i]})`;
    if (isGood) goodHours.push(entry);
    else badHours.push(entry);
  });

  return {
    lunarDate: `${lunarDay <= 10 ? 'mùng ' + (lunarDay === 10 ? 'mười' : lunarDay) : 'ngày ' + lunarDay} tháng ${lunarMonth} năm ${lunarYear}`,
    yearGZ: `${yearGZ} (${ANIMAL[lunar.getYearZhiIndex()]})`,
    monthGZ: `${monthGZ} (${ANIMAL[lunar.getMonthZhiIndex()]})`,
    dayGZ: `${dayGZ} (${ANIMAL[lunar.getDayZhiIndex()]})`,
    jieQi,
    naYin,
    xiShen,
    caiShen,
    fuShen,
    chong,
    sha,
    yi,
    ji,
    goodHours,
    badHours,
  };
}

type TabId = 'weather' | 'lunar' | 'fengshui';

export const WeatherFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('weather');
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lunarData, setLunarData] = useState<ReturnType<typeof getLunarInfo> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try { setLunarData(getLunarInfo(selectedDate)); } catch(e) { console.error('Lunar error:', e); }
  }, [selectedDate]);

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      const [cRes, fRes] = await Promise.all([
        fetch('/api/weather/current'), fetch('/api/weather/forecast')
      ]);
      if (!cRes.ok || !fRes.ok) return;
      const cData = await cRes.json();
      const fData = await fRes.json();

      setCurrent({
        temp: Math.round(cData.main.temp), feels_like: Math.round(cData.main.feels_like),
        humidity: cData.main.humidity, pressure: cData.main.pressure,
        wind_speed: cData.wind.speed, wind_deg: cData.wind.deg || 0,
        visibility: cData.visibility / 1000, clouds: cData.clouds.all,
        description: cData.weather[0].description, icon: cData.weather[0].icon,
        main: cData.weather[0].main,
        sunrise: cData.sys.sunrise, sunset: cData.sys.sunset,
      });

      setHourly(fData.list.slice(0, 8).map((it: any) => ({
        time: new Date(it.dt * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(it.main.temp), icon: it.weather[0].icon,
        description: it.weather[0].description, pop: Math.round(it.pop * 100),
      })));

      const dm: Record<string, any> = {};
      fData.list.forEach((it: any) => {
        const d = it.dt_txt.split(' ')[0];
        if (!dm[d]) dm[d] = { date: d, dayName: getShortDay(d), temp_min: it.main.temp_min, temp_max: it.main.temp_max, icon: it.weather[0].icon, description: it.weather[0].description, humidity: it.main.humidity, pop: it.pop };
        else { dm[d].temp_min = Math.min(dm[d].temp_min, it.main.temp_min); dm[d].temp_max = Math.max(dm[d].temp_max, it.main.temp_max); dm[d].pop = Math.max(dm[d].pop, it.pop); }
      });
      const today = new Date().toISOString().split('T')[0];
      setForecast(Object.values(dm).filter((x: any) => x.date !== today).slice(0, 5));
    } catch(e) { console.error('Weather fetch error:', e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWeather(); const t = setInterval(fetchWeather, 10 * 60 * 1000); return () => clearInterval(t); }, [fetchWeather]);

  const tabs: { id: TabId; label: string; icon: any; emoji: string }[] = [
    { id: 'weather', label: 'Thời Tiết', icon: Cloud, emoji: '☁️' },
    { id: 'lunar', label: 'Âm Lịch', icon: Calendar, emoji: '📅' },
    { id: 'fengshui', label: 'Phong Thuỷ', icon: Compass, emoji: '🧧' },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[998] bg-black/20 dark:bg-black/40 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 left-4 z-[999] w-[calc(100vw-2rem)] sm:w-[420px] max-h-[75vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/95 dark:bg-[#0f1419]/95 backdrop-blur-xl shadow-2xl shadow-black/20 dark:shadow-black/60 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔮</span>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{getDayOfWeek(now)}</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPin size={10} />
                  <span className="text-[10px] font-medium">{CITY_NAME}</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Digital Clock */}
            <div className="px-4 pb-3 shrink-0">
              <p className="text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tighter">
                {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 pb-3 shrink-0">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === t.id
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="mr-1">{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
              {activeTab === 'weather' && <WeatherTab current={current} hourly={hourly} forecast={forecast} loading={loading} onRefresh={fetchWeather} />}
              {activeTab === 'lunar' && lunarData && <LunarTab data={lunarData} selectedDate={selectedDate} onSelectDate={setSelectedDate} />}
              {activeTab === 'fengshui' && lunarData && <FengShuiTab data={lunarData} selectedDate={selectedDate} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(v => !v)}
        className="fixed bottom-6 left-4 z-[1000] flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {current ? (
          <>
            <span className="text-lg">{getWeatherEmoji(current.main)}</span>
            <span className="font-bold text-sm">{current.temp}°C</span>
          </>
        ) : (
          <>
            <Sun size={18} className="animate-spin-slow" />
            <span className="font-bold text-sm">...</span>
          </>
        )}
        <div className="w-px h-4 bg-white/30" />
        <Calendar size={14} />
      </motion.button>
    </>
  );
};

function WeatherTab({ current, hourly, forecast, loading, onRefresh }: {
  current: CurrentWeather | null; hourly: HourlyForecast[]; forecast: ForecastDay[];
  loading: boolean; onRefresh: () => void;
}) {
  if (!current) return <div className="text-center py-8 text-slate-400"><RefreshCw size={20} className="animate-spin mx-auto mb-2" /> Đang tải...</div>;

  return (
    <div className="space-y-3">
      {/* Current */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getWeatherIconEl(current.main, 36)}
          <div>
            <span className="text-4xl font-black text-slate-900 dark:text-white">{current.temp}°</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{current.description}</p>
          </div>
        </div>
        <button onClick={onRefresh} disabled={loading} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 transition-colors" title="Cập nhật">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: <Thermometer size={12} />, label: 'Cảm giác', val: `${current.feels_like}°` },
          { icon: <Droplets size={12} />, label: 'Độ ẩm', val: `${current.humidity}%` },
          { icon: <Wind size={12} />, label: 'Gió', val: `${current.wind_speed}m/s` },
          { icon: <Eye size={12} />, label: 'Tầm nhìn', val: `${current.visibility}km` },
        ].map((s, i) => (
          <div key={i} className="bg-slate-50 dark:bg-white/5 rounded-xl p-2 text-center">
            <div className="flex justify-center text-slate-400 mb-1">{s.icon}</div>
            <p className="text-xs font-bold text-slate-700 dark:text-white">{s.val}</p>
            <p className="text-[10px] text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sun */}
      <div className="flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1"><Sunrise size={12} className="text-amber-400" /> {fmtTime(current.sunrise)}</span>
        <span className="flex items-center gap-1"><Sunset size={12} className="text-orange-500" /> {fmtTime(current.sunset)}</span>
        <span className="flex items-center gap-1"><Cloud size={12} /> {current.clouds}%</span>
      </div>

      {/* Hourly */}
      {hourly.length > 0 && (
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><Clock size={10} /> Theo giờ</p>
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {hourly.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[52px] p-2 rounded-xl bg-slate-50 dark:bg-white/5 shrink-0 text-center">
                <span className="text-[10px] text-slate-400 font-medium">{h.time}</span>
                <img src={`https://openweathermap.org/img/wn/${h.icon}.png`} alt="" className="w-6 h-6" />
                <span className="text-xs font-bold text-slate-700 dark:text-white">{h.temp}°</span>
                {h.pop > 0 && <span className="text-[9px] text-blue-400 flex items-center gap-0.5"><Droplets size={8} />{h.pop}%</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast */}
      {forecast.length > 0 && (
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><ChevronRight size={10} /> Các ngày tới</p>
          <div className="space-y-1">
            {forecast.map((d, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-xs">
                <span className="text-slate-500 font-bold w-6">{d.dayName}</span>
                <img src={`https://openweathermap.org/img/wn/${d.icon}.png`} alt="" className="w-6 h-6" />
                <span className="text-blue-500 dark:text-blue-400 font-medium w-8 text-right">{Math.round(d.temp_min)}°</span>
                <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400" style={{ width: `${Math.min(100, ((d.temp_max - d.temp_min) / 15) * 100)}%` }} />
                </div>
                <span className="text-orange-500 font-medium w-8">{Math.round(d.temp_max)}°</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LunarTab({ data, selectedDate, onSelectDate }: { data: ReturnType<typeof getLunarInfo>; selectedDate: Date; onSelectDate: (d: Date) => void }) {
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const selectedStr = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;

  const firstDay = new Date(viewYear, viewMonth, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays: { day: number; month: number; year: number; isCurrentMonth: boolean; lunarDay: number; lunarMonth: number }[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = viewMonth - 1;
    const y = m < 0 ? viewYear - 1 : viewYear;
    const actualM = m < 0 ? 11 : m;
    try {
      const s = Solar.fromDate(new Date(y, actualM, d));
      const l = s.getLunar();
      calendarDays.push({ day: d, month: actualM, year: y, isCurrentMonth: false, lunarDay: l.getDay(), lunarMonth: l.getMonth() });
    } catch { calendarDays.push({ day: d, month: actualM, year: y, isCurrentMonth: false, lunarDay: 0, lunarMonth: 0 }); }
  }

  for (let d = 1; d <= daysInMonth; d++) {
    try {
      const s = Solar.fromDate(new Date(viewYear, viewMonth, d));
      const l = s.getLunar();
      calendarDays.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true, lunarDay: l.getDay(), lunarMonth: l.getMonth() });
    } catch { calendarDays.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true, lunarDay: 0, lunarMonth: 0 }); }
  }

  const remaining = 7 - (calendarDays.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth + 1;
      const y = m > 11 ? viewYear + 1 : viewYear;
      const actualM = m > 11 ? 0 : m;
      try {
        const s = Solar.fromDate(new Date(y, actualM, d));
        const l = s.getLunar();
        calendarDays.push({ day: d, month: actualM, year: y, isCurrentMonth: false, lunarDay: l.getDay(), lunarMonth: l.getMonth() });
      } catch { calendarDays.push({ day: d, month: actualM, year: y, isCurrentMonth: false, lunarDay: 0, lunarMonth: 0 }); }
    }
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };
  const goToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear()); setViewMonth(t.getMonth()); onSelectDate(t);
  };

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const formatLunarDay = (ld: number, lm: number) => {
    if (ld === 1) return `${ld}/${lm}`;
    return `${ld}`;
  };

  return (
    <div className="space-y-3">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div className="text-center">
          <p className="text-sm font-black text-slate-800 dark:text-white">{monthNames[viewMonth]} {viewYear}</p>
        </div>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Today button */}
      {(viewYear !== today.getFullYear() || viewMonth !== today.getMonth()) && (
        <button onClick={goToday} className="w-full text-[10px] text-orange-500 dark:text-orange-400 font-bold py-1 hover:underline transition-colors">
          ← Về hôm nay
        </button>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {weekDays.map(wd => (
          <div key={wd} className={`text-center text-[10px] font-bold py-1.5 ${
            wd === 'CN' ? 'text-red-400 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'
          }`}>{wd}</div>
        ))}
        {calendarDays.map((cd, i) => {
          const dayStr = `${cd.year}-${cd.month}-${cd.day}`;
          const isToday = dayStr === todayStr;
          const isSelected = dayStr === selectedStr;
          const isSunday = i % 7 === 6;

          return (
            <button
              key={i}
              onClick={() => { onSelectDate(new Date(cd.year, cd.month, cd.day)); }}
              className={`relative flex flex-col items-center justify-center py-1 rounded-lg transition-all text-center min-h-[40px] ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : isToday
                    ? 'bg-orange-100 dark:bg-orange-900/30 ring-1 ring-orange-400/50'
                    : cd.isCurrentMonth
                      ? 'hover:bg-slate-100 dark:hover:bg-white/5'
                      : 'opacity-30 hover:opacity-60'
              }`}
            >
              <span className={`text-xs font-bold leading-none ${
                isSelected ? 'text-white'
                  : isToday ? 'text-orange-600 dark:text-orange-400'
                    : isSunday && cd.isCurrentMonth ? 'text-red-400 dark:text-red-400'
                      : cd.isCurrentMonth ? 'text-slate-700 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-600'
              }`}>{cd.day}</span>
              <span className={`text-[8px] leading-none mt-0.5 ${
                isSelected ? 'text-white/70'
                  : cd.lunarDay === 1 ? 'text-red-400 dark:text-red-400 font-bold'
                    : 'text-slate-400 dark:text-slate-500'
              }`}>{cd.lunarDay ? formatLunarDay(cd.lunarDay, cd.lunarMonth) : ''}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Info */}
      <div className="text-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-red-200/50 dark:border-red-800/30">
        <p className="text-[10px] text-red-400 dark:text-red-300 font-bold uppercase tracking-widest mb-1">Âm Lịch</p>
        <p className="text-lg font-black text-red-700 dark:text-red-400">{data.lunarDate}</p>
      </div>

      {/* Can Chi */}
      <div className="space-y-2">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">🐉 Can Chi</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Năm', value: data.yearGZ },
            { label: 'Tháng', value: data.monthGZ },
            { label: 'Ngày', value: data.dayGZ },
          ].map((item, i) => (
            <div key={i} className="bg-amber-50 dark:bg-amber-900/15 rounded-xl p-2.5 text-center border border-amber-200/50 dark:border-amber-800/30">
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase mb-0.5">{item.label}</p>
              <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nap Am & Tiet Khi */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-purple-50 dark:bg-purple-900/15 rounded-xl p-2.5 border border-purple-200/50 dark:border-purple-800/30">
          <p className="text-[10px] text-purple-500 dark:text-purple-400 font-bold uppercase mb-0.5">🎵 Nạp Âm</p>
          <p className="text-[11px] font-bold text-purple-700 dark:text-purple-300">{data.naYin}</p>
        </div>
        {data.jieQi && (
          <div className="bg-green-50 dark:bg-green-900/15 rounded-xl p-2.5 border border-green-200/50 dark:border-green-800/30">
            <p className="text-[10px] text-green-500 dark:text-green-400 font-bold uppercase mb-0.5">🌿 Tiết Khí</p>
            <p className="text-[11px] font-bold text-green-700 dark:text-green-300">{data.jieQi}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FengShuiTab({ data, selectedDate }: { data: ReturnType<typeof getLunarInfo>; selectedDate: Date }) {
  const isToday = (() => { const t = new Date(); return selectedDate.getDate() === t.getDate() && selectedDate.getMonth() === t.getMonth() && selectedDate.getFullYear() === t.getFullYear(); })();
  return (
    <div className="space-y-4">
      {/* Selected date indicator */}
      {!isToday && (
        <div className="text-center bg-orange-50 dark:bg-orange-900/15 rounded-xl p-2 border border-orange-200/50 dark:border-orange-800/30">
          <p className="text-[11px] font-bold text-orange-600 dark:text-orange-400">📅 {getDayOfWeek(selectedDate)}, {selectedDate.toLocaleDateString('vi-VN')}</p>
        </div>
      )}
      {/* Deity Directions */}
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">🧭 Hướng Xuất Hành</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-yellow-50 dark:bg-yellow-900/15 rounded-xl p-3 text-center border border-yellow-200/50 dark:border-yellow-800/30">
            <p className="text-sm mb-1">💛</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Hỷ Thần</p>
            <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">{data.xiShen}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/15 rounded-xl p-3 text-center border border-emerald-200/50 dark:border-emerald-800/30">
            <p className="text-sm mb-1">💰</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Tài Thần</p>
            <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">{data.caiShen}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/15 rounded-xl p-3 text-center border border-blue-200/50 dark:border-blue-800/30">
            <p className="text-sm mb-1">🙏</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Phúc Thần</p>
            <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">{data.fuShen}</p>
          </div>
        </div>
      </div>

      {/* Chong Sha */}
      <div className="bg-red-50 dark:bg-red-900/15 rounded-xl p-3 border border-red-200/50 dark:border-red-800/30 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-red-500 dark:text-red-400 font-bold uppercase">⚔️ Xung</p>
          <p className="text-xs font-bold text-red-700 dark:text-red-300">{data.chong}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-red-500 dark:text-red-400 font-bold uppercase">🔪 Sát</p>
          <p className="text-xs font-bold text-red-700 dark:text-red-300">{data.sha}</p>
        </div>
      </div>

      {/* Good Hours */}
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">⏰ Giờ Hoàng Đạo</p>
        <div className="flex flex-wrap gap-1.5">
          {data.goodHours.map((h, i) => (
            <span key={i} className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200/50 dark:border-emerald-800/30">
              ✅ {h}
            </span>
          ))}
        </div>
      </div>

      {/* Bad Hours */}
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">⏰ Giờ Hắc Đạo</p>
        <div className="flex flex-wrap gap-1.5">
          {data.badHours.map((h, i) => (
            <span key={i} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[11px] font-medium border border-slate-200/50 dark:border-white/5">
              ❌ {h}
            </span>
          ))}
        </div>
      </div>

      {/* Yi (Do) */}
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">📋 Nghi (Nên Làm)</p>
        <div className="flex flex-wrap gap-1.5">
          {data.yi.slice(0, 12).map((item: string, i: number) => (
            <span key={i} className="px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/15 text-green-700 dark:text-green-400 text-[11px] font-medium border border-green-200/50 dark:border-green-800/30">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Ji (Don't) */}
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">🚫 Kỵ (Không Nên)</p>
        <div className="flex flex-wrap gap-1.5">
          {data.ji.slice(0, 12).map((item: string, i: number) => (
            <span key={i} className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/15 text-red-600 dark:text-red-400 text-[11px] font-medium border border-red-200/50 dark:border-red-800/30">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeatherFAB;
