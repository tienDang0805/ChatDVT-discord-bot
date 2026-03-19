import { Play, Pause, SkipForward, SkipBack, Music2 } from 'lucide-react';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { useNavigate } from 'react-router-dom';

export default function GlobalMusicPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, queue } = useMusicPlayer();
  const navigate = useNavigate();

  if (!currentSong && queue.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pointer-events-none">
      <div 
        className="max-w-lg mx-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-3 rounded-2xl shadow-2xl flex items-center justify-between pointer-events-auto transition-transform duration-300 hover:-translate-y-1"
      >
        <div 
           className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
           onClick={() => navigate('/music')}
        >
          {/* Cover Art / Vinyl Element */}
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
            {/* Tooltip on hover */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Mở Trạm
            </div>
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0 select-none">
             <p className="text-white text-sm font-bold truncate">
               {currentSong ? currentSong.title : 'Chưa chọn bài hát'}
             </p>
             <p className="text-slate-400 text-xs truncate">
               {currentSong ? 'Trạm Giai Điệu Vô Tri' : 'Sẵn sàng phát nhạc'}
             </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 ml-4">
           <button 
             onClick={prevSong} 
             disabled={!currentSong}
             className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
           >
             <SkipBack size={20} />
           </button>
           
           <button 
             onClick={togglePlay}
             disabled={!currentSong}
             className="w-12 h-12 rounded-full flex items-center justify-center text-slate-900 bg-white hover:bg-slate-200 hover:scale-105 transition-all disabled:opacity-50"
           >
             {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
           </button>
           
           <button 
             onClick={nextSong}
             disabled={!currentSong}
             className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
           >
             <SkipForward size={20} />
           </button>
        </div>
      </div>
    </div>
  );
}
