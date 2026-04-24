import { useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music2, X, Volume2, VolumeX, Shuffle, Repeat } from 'lucide-react';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { useNavigate } from 'react-router-dom';

const formatTime = (s: number): string => {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function GlobalMusicPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, queue, setQueue, volume, setVolume, isShuffling, toggleShuffle, isLooping, toggleLoop, currentTime, duration, seekTo } = useMusicPlayer();
  const navigate = useNavigate();

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) togglePlay();
    setQueue([]);
  };

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(ratio * duration);
  }, [duration, seekTo]);

  if (!currentSong && queue.length === 0) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto">
        <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="flex items-center justify-between p-2 pr-4">
            <div
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
              onClick={() => navigate('/music')}
            >
              <div className="relative w-12 h-12 flex-shrink-0">
                {currentSong ? (
                  <div
                    className={`w-full h-full rounded-full border-2 border-slate-800 overflow-hidden shadow-lg ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}
                    style={{ background: `url(${currentSong.coverUrl}) center/cover no-repeat` }}
                  >
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-black/20" />
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-black/20" />
                    <div className="absolute inset-0 m-auto w-3 h-3 bg-slate-900 rounded-full border border-slate-700" />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                    <Music2 className="text-slate-500" size={20} />
                  </div>
                )}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Mở Trạm
                </div>
              </div>

              <div className="flex-1 min-w-0 select-none">
                <p className="text-white text-sm font-bold truncate">
                  {currentSong ? currentSong.title : 'Chưa chọn bài hát'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-slate-400 text-xs truncate">
                    {currentSong ? `📂 ${currentSong.category || 'Tất cả'}` : 'Sẵn sàng phát nhạc'}
                  </p>
                  {currentSong && duration > 0 && (
                    <span className="text-[10px] text-slate-500 font-mono tabular-nums shrink-0">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={toggleShuffle}
                title={isShuffling ? "Tắt Trộn Bài" : "Bật Trộn Bài"}
                className={`hidden sm:flex w-8 h-8 rounded-full items-center justify-center transition-colors ${isShuffling ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
              >
                <Shuffle size={16} />
              </button>

              <button
                onClick={prevSong}
                disabled={!currentSong}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <SkipBack size={18} />
              </button>

              <button
                onClick={togglePlay}
                disabled={!currentSong}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-slate-900 bg-white hover:bg-slate-200 hover:scale-105 transition-all disabled:opacity-50"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
              </button>

              <button
                onClick={nextSong}
                disabled={!currentSong}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 mr-2"
              >
                <SkipForward size={18} />
              </button>

              <button
                onClick={toggleLoop}
                title={isLooping ? "Tắt Lặp Lại" : "Bật Lặp Lại 1 Bài"}
                className={`hidden sm:flex w-8 h-8 rounded-full items-center justify-center transition-colors ${
                  isLooping ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Repeat size={16} />
              </button>

              <div className="hidden sm:flex items-center gap-2 mx-2 group/vol">
                <button onClick={() => setVolume(volume === 0 ? 100 : 0)} className="text-slate-400 hover:text-white transition-colors">
                  {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min="0" max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-16 h-1 appearance-none bg-slate-700/50 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-slate-300 group-hover/vol:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer transition-all"
                  title={`Âm lượng: ${volume}%`}
                />
              </div>

              <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block"></div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Tắt nhạc & Đóng Trạm"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {currentSong && (
            <div
              className="h-1 cursor-pointer group/progress mx-2 mb-1.5 rounded-full overflow-hidden bg-slate-800"
              onClick={handleProgressClick}
              title={`${formatTime(currentTime)} / ${formatTime(duration)}`}
            >
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-[width] duration-700 ease-linear relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
