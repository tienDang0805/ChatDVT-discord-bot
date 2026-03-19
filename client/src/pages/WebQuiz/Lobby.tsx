import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Users, BrainCircuit, Zap, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function WebQuizLobby() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [playerName, setPlayerName] = useState(localStorage.getItem('webQuizName') || '');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create form
  const [topic, setTopic] = useState('Đố vui dân gian');
  const [difficulty, setDifficulty] = useState('Dễ');
  const [numQuestions, setNumQuestions] = useState(5);
  const [timeLimitSecs, setTimeLimitSecs] = useState(15);
  const [tone, setTone] = useState('Hài hước, mở mang kiến thức');
  const [apiKey, setApiKey] = useState(localStorage.getItem('webQuizApiKey') || '');

  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/web-quiz/rooms`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 3000);
    
    if (window.history.length <= 2) {
      window.history.replaceState(null, '', '/chatDVT');
      window.history.pushState(null, '', window.location.pathname);
    }
    
    return () => clearInterval(interval);
  }, []);

  const handleJoin = async (roomId: string) => {
    if (!playerName.trim()) {
      alert("Vui lòng nhập tên trước khi chơi chơi!");
      return;
    }
    localStorage.setItem('webQuizName', playerName);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/web-quiz/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerName })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem(`quiz_${roomId}_playerId`, data.playerId);
        navigate(`/quiz/room/${roomId}`);
      } else {
        alert(data.message || "Lỗi khi vào phòng.");
      }
    } catch (e) {
      alert("Lỗi mạng.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !topic.trim()) return;
    if (!apiKey.trim()) {
       alert("Vui lòng cung cấp Gemini API Key để đẻ câu hỏi!");
       return;
    }

    localStorage.setItem('webQuizName', playerName);
    localStorage.setItem('webQuizApiKey', apiKey);
    setLoading(true);

    try {
      // 1. Create Room
      const resCreate = await fetch(`${API_BASE}/api/web-quiz/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorName: playerName, topic, difficulty, numQuestions, apiKey, timeLimitSecs, tone })
      });
      const dataCreate = await resCreate.json();
      
      if (dataCreate.roomId) {
        // 2. Join as creator
        localStorage.setItem(`quiz_${dataCreate.roomId}_playerId`, dataCreate.playerId);
        navigate(`/quiz/room/${dataCreate.roomId}`);
      }
    } catch (e) {
      alert("Lỗi mạng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold flex items-center gap-3">
              <BrainCircuit size={40} className="text-yellow-300" /> Web Quiz AI
            </h1>
            <p className="mt-2 text-blue-100 text-lg">Tranh tài trí tuệ, câu hỏi do AI bốc phốt</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 w-full md:w-auto">
             <label className="block text-sm font-medium text-blue-100 mb-1">Tên Hiển Thị (Nickname)</label>
             <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ví dụ: Cậu Vàng"
                className="w-full px-4 py-2 rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold"
             />
          </div>
        </div>
      </div>

      {!showCreate ? (
        <div className="bg-white dark:bg-surface rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                 <Zap className="text-yellow-500" /> Sảnh Chờ (Lobby)
              </h2>
              <button 
                onClick={() => setShowCreate(true)}
                className="bg-primary hover:bg-primary-600 text-white px-5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-sm"
              >
                 <Plus size={18} /> Mở Phòng Mới
              </button>
           </div>

           {rooms.length === 0 ? (
             <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <p>Chưa có phòng nào đang mở.</p>
                <p className="text-sm mt-1">Hãy tạo phòng và mời bạn bè vào chơi!</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {rooms.map(room => (
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={room.id}
                    className="border-2 border-slate-100 dark:border-slate-700/50 p-5 rounded-2xl hover:border-primary/50 transition-colors bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden group"
                 >
                    <div className="flex justify-between items-start mb-3">
                       <span className="text-xs font-bold px-2 py-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                         {room.difficulty}
                       </span>
                       <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Users size={14} /> {room.playerCount}
                       </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 truncate">{room.topic}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Host: {room.creator}</p>
                    
                    <button 
                      onClick={() => handleJoin(room.id)}
                      disabled={loading}
                      className="w-full bg-slate-200 hover:bg-primary hover:text-white dark:bg-slate-700 dark:hover:bg-primary text-slate-700 dark:text-gray-200 font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                       <Play size={16} /> Vào Phòng
                    </button>
                 </motion.div>
               ))}
             </div>
           )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800"
        >
           <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Tạo Phòng Mới</h2>
           <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Chủ đề (Nổi lẩu thập cẩm, Toán học, Khịa nhau...)</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mức độ</label>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                    <option value="Hành não">Hành não</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Số câu hỏi</label>
                  <input 
                    type="number" min={2} max={20}
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Thời gian (giây)</label>
                  <input 
                    type="number" min={5} max={60}
                    value={timeLimitSecs}
                    onChange={(e) => setTimeLimitSecs(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    placeholder="VD: 15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Giọng văn Chủ đề</label>
                  <input 
                    type="text"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="VD: Hài hước, cà khịa, Gen Z..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none flex-1 truncate"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gemini API Key (Bắt buộc để Tạo đề)</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none placeholder:text-slate-400"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Lưu ý: API Key của bạn không được lưu qua Database, chỉ dùng để gọi trực tiếp đẻ đề 1 lần.</p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                 <button 
                   type="submit"
                   disabled={loading}
                   className="flex-1 bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                 >
                    {loading ? <Loader2 className="animate-spin" /> : "Tạo & Vào Phòng"}
                 </button>
                 <button 
                   type="button"
                   onClick={() => setShowCreate(false)}
                   className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                 >
                    Huỷ
                 </button>
              </div>
           </form>
        </motion.div>
      )}
    </div>
  );
}
