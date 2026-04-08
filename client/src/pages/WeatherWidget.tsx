import { useState, useEffect, useCallback } from 'react';
import { Cloud, Droplets, Wind, Thermometer, Eye, Sun, Sunrise, Sunset, MapPin, RefreshCw, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog, ChevronRight } from 'lucide-react';

const CITY_NAME = 'TP. Hồ Chí Minh';

interface CurrentWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  visibility: number;
  uvi?: number;
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
  main: string;
  humidity: number;
  wind: number;
  pop: number;
}

interface HourlyForecast {
  time: string;
  temp: number;
  icon: string;
  description: string;
  pop: number;
}

const getWeatherIcon = (main: string, size: number = 24) => {
  const iconProps = { size, strokeWidth: 1.5 };
  switch (main.toLowerCase()) {
    case 'thunderstorm': return <CloudLightning {...iconProps} className="text-yellow-400" />;
    case 'drizzle': return <CloudDrizzle {...iconProps} className="text-blue-300" />;
    case 'rain': return <CloudRain {...iconProps} className="text-blue-400" />;
    case 'snow': return <CloudSnow {...iconProps} className="text-white" />;
    case 'mist':
    case 'fog':
    case 'haze':
      return <CloudFog {...iconProps} className="text-slate-400" />;
    case 'clear': return <Sun {...iconProps} className="text-yellow-400" />;
    case 'clouds': return <Cloud {...iconProps} className="text-slate-300" />;
    default: return <Cloud {...iconProps} className="text-slate-400" />;
  }
};

const getWeatherGradient = (main: string) => {
  switch (main.toLowerCase()) {
    case 'clear': return 'from-amber-500/20 via-orange-500/10 to-yellow-500/5';
    case 'clouds': return 'from-slate-500/20 via-slate-600/10 to-slate-700/5';
    case 'rain':
    case 'drizzle': return 'from-blue-500/20 via-blue-600/10 to-cyan-500/5';
    case 'thunderstorm': return 'from-purple-500/20 via-indigo-600/10 to-slate-700/5';
    default: return 'from-cyan-500/20 via-blue-500/10 to-indigo-500/5';
  }
};

const getWindDirection = (deg: number) => {
  const dirs = ['Bắc', 'ĐB', 'Đông', 'ĐN', 'Nam', 'TN', 'Tây', 'TB'];
  return dirs[Math.round(deg / 45) % 8];
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const getLunarDate = (date: Date) => {
  const canArr = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const chiArr = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

  const y = date.getFullYear();
  const canIndex = (y + 6) % 10;
  const chiIndex = (y + 8) % 12;

  return { yearName: `${canArr[canIndex]} ${chiArr[chiIndex]}` };
};

const getDayOfWeek = (date: Date) => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return days[date.getDay()];
};

const getShortDay = (dateStr: string) => {
  const d = new Date(dateStr);
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[d.getDay()];
};

export const WeatherWidget = () => {
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [currentRes, forecastRes] = await Promise.all([
        fetch(`/api/weather/current`),
        fetch(`/api/weather/forecast`)
      ]);

      if (!currentRes.ok || !forecastRes.ok) throw new Error('Không thể kết nối server thời tiết');

      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();

      setCurrent({
        temp: Math.round(currentData.main.temp),
        feels_like: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        pressure: currentData.main.pressure,
        wind_speed: currentData.wind.speed,
        wind_deg: currentData.wind.deg || 0,
        visibility: currentData.visibility / 1000,
        clouds: currentData.clouds.all,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        main: currentData.weather[0].main,
        sunrise: currentData.sys.sunrise,
        sunset: currentData.sys.sunset,
      });

      const hourlyData: HourlyForecast[] = forecastData.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        description: item.weather[0].description,
        pop: Math.round(item.pop * 100),
      }));
      setHourly(hourlyData);

      const dailyMap: Record<string, any> = {};
      forecastData.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyMap[date]) {
          dailyMap[date] = {
            date,
            dayName: getShortDay(date),
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max,
            icon: item.weather[0].icon,
            description: item.weather[0].description,
            main: item.weather[0].main,
            humidity: item.main.humidity,
            wind: item.wind.speed,
            pop: item.pop,
          };
        } else {
          dailyMap[date].temp_min = Math.min(dailyMap[date].temp_min, item.main.temp_min);
          dailyMap[date].temp_max = Math.max(dailyMap[date].temp_max, item.main.temp_max);
          dailyMap[date].pop = Math.max(dailyMap[date].pop, item.pop);
        }
      });

      const today = new Date().toISOString().split('T')[0];
      setForecast(Object.values(dailyMap).filter((d: any) => d.date !== today).slice(0, 5));
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  const lunar = getLunarDate(now);

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
        <p className="text-red-400 font-medium">{error}</p>
        <button onClick={fetchWeather} className="mt-3 text-sm text-red-300 hover:text-white transition-colors flex items-center gap-1 mx-auto">
          <RefreshCw size={14} /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#131923] to-[#0d1117] border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{getDayOfWeek(now)}</p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </h2>
            <p className="text-orange-400/80 text-sm mt-1 font-medium">
              Năm {lunar.yearName}
            </p>
          </div>

          <div className="text-right">
            <p className="text-5xl md:text-6xl font-black text-white font-mono tabular-nums tracking-tighter">
              {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <div className="flex items-center gap-1.5 justify-end mt-1">
              <MapPin size={12} className="text-orange-500" />
              <span className="text-slate-400 text-xs font-medium">{CITY_NAME}</span>
            </div>
          </div>
        </div>
      </div>

      {loading && !current ? (
        <div className="bg-[#131923] border border-slate-800 rounded-2xl p-12 text-center">
          <RefreshCw size={24} className="text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Đang tải dữ liệu thời tiết...</p>
        </div>
      ) : current ? (
        <>
          <div className={`bg-gradient-to-br ${getWeatherGradient(current.main)} border border-slate-800 rounded-2xl p-6 relative overflow-hidden`}>
            <div className="absolute top-4 right-4 opacity-10">
              {getWeatherIcon(current.main, 120)}
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getWeatherIcon(current.main, 32)}
                    <span className="text-slate-300 capitalize text-lg font-medium">{current.description}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl md:text-8xl font-black text-white">{current.temp}°</span>
                    <span className="text-slate-400 text-lg">C</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">
                    Cảm giác như <span className="text-slate-200 font-semibold">{current.feels_like}°C</span>
                  </p>
                </div>

                <button
                  onClick={fetchWeather}
                  disabled={loading}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
                  title="Cập nhật lại"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Droplets size={12} /> Độ ẩm
                  </div>
                  <p className="text-white font-bold text-lg">{current.humidity}%</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Wind size={12} /> Gió
                  </div>
                  <p className="text-white font-bold text-lg">{current.wind_speed} m/s</p>
                  <p className="text-slate-500 text-xs">{getWindDirection(current.wind_deg)}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Eye size={12} /> Tầm nhìn
                  </div>
                  <p className="text-white font-bold text-lg">{current.visibility} km</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Thermometer size={12} /> Áp suất
                  </div>
                  <p className="text-white font-bold text-lg">{current.pressure}</p>
                  <p className="text-slate-500 text-xs">hPa</p>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Sunrise size={16} className="text-amber-400" />
                  <span className="text-slate-300 text-sm">{formatTime(current.sunrise)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sunset size={16} className="text-orange-500" />
                  <span className="text-slate-300 text-sm">{formatTime(current.sunset)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud size={16} className="text-slate-400" />
                  <span className="text-slate-300 text-sm">Mây: {current.clouds}%</span>
                </div>
                {lastUpdated && (
                  <span className="text-slate-600 text-xs ml-auto hidden md:block">
                    Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {hourly.length > 0 && (
            <div className="bg-[#131923] border border-slate-800 rounded-2xl p-5 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-300 font-bold text-sm uppercase tracking-wider">Dự báo theo giờ</h3>
                <ChevronRight size={14} className="text-slate-600" />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {hourly.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 min-w-[72px] p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors shrink-0">
                    <span className="text-slate-400 text-xs font-medium">{h.time}</span>
                    <img
                      src={`https://openweathermap.org/img/wn/${h.icon}.png`}
                      alt={h.description}
                      className="w-8 h-8"
                    />
                    <span className="text-white font-bold text-sm">{h.temp}°</span>
                    {h.pop > 0 && (
                      <span className="text-blue-400 text-xs flex items-center gap-0.5">
                        <Droplets size={10} /> {h.pop}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {forecast.length > 0 && (
            <div className="bg-[#131923] border border-slate-800 rounded-2xl p-5">
              <h3 className="text-slate-300 font-bold text-sm uppercase tracking-wider mb-4">Dự báo các ngày tới</h3>
              <div className="space-y-2">
                {forecast.map((day, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                    <span className="text-slate-400 font-bold text-sm w-8 shrink-0">{day.dayName}</span>
                    <span className="text-slate-500 text-xs w-20 shrink-0">
                      {new Date(day.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-2 w-24 shrink-0">
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                        alt={day.description}
                        className="w-8 h-8"
                      />
                      <span className="text-slate-400 text-xs capitalize truncate hidden md:block">{day.description}</span>
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-blue-400 font-medium text-sm w-10 text-right">{Math.round(day.temp_min)}°</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                        <div
                          className="absolute h-full rounded-full bg-gradient-to-r from-blue-500 to-orange-500"
                          style={{
                            left: `${((day.temp_min - 20) / 20) * 100}%`,
                            right: `${100 - ((day.temp_max - 20) / 20) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-orange-400 font-medium text-sm w-10">{Math.round(day.temp_max)}°</span>
                    </div>

                    <div className="hidden md:flex items-center gap-3 text-slate-500 text-xs shrink-0">
                      <span className="flex items-center gap-1"><Droplets size={10} /> {day.humidity}%</span>
                      <span className="flex items-center gap-1"><Wind size={10} /> {day.wind.toFixed(1)}</span>
                      {day.pop > 0 && (
                        <span className="flex items-center gap-1 text-blue-400"><CloudRain size={10} /> {Math.round(day.pop * 100)}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default WeatherWidget;
