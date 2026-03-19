import { useState, useEffect } from 'react';
import { useMusicPlayer, Song } from '../contexts/MusicPlayerContext';
import { KeyRound, Plus, Trash2, Play, Shuffle, Music2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function MusicStation() {
  const { secretCode, setSecretCode, queue, setQueue, playSong, currentSong } = useMusicPlayer();
  const [library, setLibrary] = useState<Song[]>([]);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [inputCode, setInputCode] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract unique categories from library
  const categories = ['Tất cả', ...Array.from(new Set(library.map(s => s.category || 'Tất cả'))).filter(c => c !== 'Tất cả')];

  // The songs currently visible in the selected Tab
  const displayedSongs = library.filter(s => activeTab === 'Tất cả' || (s.category || 'Tất cả') === activeTab);

  useEffect(() => {
    document.title = 'Trạm Giai Điệu | devtiendang.blog';
    if (secretCode && queue.length === 0) {
      loadPlaylist(secretCode);
    }
  }, []);

  const loadPlaylist = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/music/playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretCode: code })
      });
      if (!res.ok) throw new Error('Không thể tải Playlist');
      const data = await res.json();
      setLibrary(data.songs || []);
      if (queue.length === 0) setQueue(data.songs || []);
      setSecretCode(code.trim().toUpperCase());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    loadPlaylist(inputCode);
  };

  const addSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim() || !secretCode) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/music/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretCode, youtubeUrl, category: categoryInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi thêm bài hát');
      setLibrary([...library, data]);
      // Also add to current queue if looking at "Tất cả" or the matching tab
      if (activeTab === 'Tất cả' || (data.category || 'Tất cả') === activeTab) {
         setQueue([...queue, data]);
      }
      setYoutubeUrl('');
      setCategoryInput('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeSong = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Xoá bài này hả?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/music/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretCode, songId })
      });
      if (!res.ok) throw new Error('Lỗi xoá bài hát');
      const data = await res.json();
      setLibrary(data.songs);
      
      // Update queue to sync without interrupting current song perfectly (complex, but doing simple for now)
      // Just re-set queue if we want. For simplicity, we filter the current queue
      setQueue(queue.filter(s => s.id !== songId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const shufflePlay = () => {
    if (displayedSongs.length === 0) return;
    const shuffled = [...displayedSongs].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    playSong(0);
  };
  
  const handlePlaySongFromList = (song: Song) => {
    // If playing a song, we make the current displayed list the active queue
    const targetQueue = [...displayedSongs];
    setQueue(targetQueue);
    const index = targetQueue.findIndex(s => s.id === song.id);
    playSong(index >= 0 ? index : 0);
  };

  if (!secretCode) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center">
          <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-6 border-4 border-slate-700">
            <KeyRound size={32} className="text-slate-400" />
          </div>
          <h1 className="text-3xl font-black mb-2">Trạm Giai Điệu</h1>
          <p className="text-slate-400 mb-8 text-sm">Nhập Mã Bí Mật để gọi hồn Playlist nghe ngầm qua các trang.</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Ví dụ: TIENDANG99"
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-center font-mono font-bold text-xl uppercase tracking-widest outline-none transition-colors"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={!inputCode.trim() || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Đang mở cửa...' : 'Mở Cửa Trạm'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              📻 Trạm Giai Điệu 
              <span className="text-sm font-mono bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30">
                #{secretCode}
              </span>
            </h1>
            <p className="text-slate-400 mt-2">Nhạc Youtube xịn được lưu nặc danh, kéo xuống dán thêm bài mới.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={shufflePlay}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              <Shuffle size={16} /> Shuffle Play
            </button>
            <button
              onClick={() => { setSecretCode(null); setQueue([]); }}
              className="px-4 py-2 text-slate-500 hover:text-white transition-colors text-sm font-medium"
            >
              Thoát mã
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <form onSubmit={addSong} className="bg-slate-900 border border-slate-800 p-2 pl-4 rounded-2xl flex flex-1 gap-2 items-center">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Dán link Youtube..."
              className="flex-[2] bg-transparent border-none text-white outline-none text-sm min-w-0"
              required
            />
            <div className="w-px h-6 bg-slate-800 mx-2 hidden sm:block"></div>
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="Tên Folder (Mặc định: Tất cả)"
              className="flex-1 bg-transparent border-none text-slate-300 outline-none text-sm min-w-0 hidden sm:block"
            />
            <button
              type="submit"
              disabled={loading || !youtubeUrl}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold flex flex-shrink-0 items-center gap-2 transition-colors"
            >
              <Plus size={18} /> <span className="hidden sm:inline">{loading ? 'Thêm...' : 'Add'}</span>
            </button>
          </form>
        </div>

        {/* Category Tabs */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
             {categories.map(cat => (
               <button
                 key={cat}
                 onClick={() => setActiveTab(cat)}
                 className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium text-sm transition-all border ${
                   activeTab === cat 
                     ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                     : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                 }`}
               >
                 {cat}
               </button>
             ))}
          </div>
        )}

        {/* Playlist */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedSongs.map((song) => {
            const isPlaying = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                onClick={() => handlePlaySongFromList(song)}
                className={`group relative flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                  isPlaying 
                    ? 'bg-indigo-900/40 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Cover */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={song.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play fill="white" size={24} />
                  </div>
                  {isPlaying && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-8">
                  <p className={`font-bold text-sm truncate ${isPlaying ? 'text-indigo-300' : 'text-slate-200 group-hover:text-white'}`}>
                    {song.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-1">Từ YouTube</p>
                </div>

                 {/* Delete */}
                 <button
                    onClick={(e) => removeSong(song.id, e)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                 >
                    <Trash2 size={16} />
                 </button>
              </div>
            );
          })}
        </div>

        {library.length === 0 && (
          <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
            <Music2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>Kho nhạc đang trống trơn.</p>
            <p className="text-sm">Hãy copy 1 link Youtube dán vào ô bên trên để khai trương trạm phát!</p>
          </div>
        )}
        
        {library.length > 0 && displayedSongs.length === 0 && (
          <div className="text-center py-10 text-slate-500 bg-slate-900/50 rounded-3xl border border-slate-800">
             Folder này chưa có bài nào.
          </div>
        )}
      </div>
    </div>
  );
}
