import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trophy, User, CalendarHeart } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface CoupleData {
  id: number;
  user1Id: string;
  user2Id: string;
  user1Nickname: string;
  user2Nickname: string;
  affection: number;
  level: number;
  status: 'dating' | 'married';
  marriedAt: string | null;
  poopCount: number;
}

export function CoupleLandingPage() {
  const [topCouples, setTopCouples] = useState<CoupleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/couple/top`)
      .then(res => res.json())
      .then(data => {
        setTopCouples(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch couples:', err);
        setLoading(false);
      });
  }, []);

  // Calculate percentage to marriage (assume 1000 is the threshold used in backend)
  const getProgress = (affection: number) => Math.min((affection / 1000) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-100 to-red-50 text-gray-800 font-sans relative overflow-hidden flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Floating Hearts Background Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-300 opacity-40"
            initial={{ 
              y: '100vh', 
              x: Math.random() * 100 + 'vw',
              scale: Math.random() * 0.5 + 0.5,
              rotate: 0 
            }}
            animate={{ 
              y: '-10vh',
              x: `calc(${Math.random() * 100}vw + ${Math.random() * 100 - 50}px)`,
              rotate: 360
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 5
            }}
          >
            <Heart size={40} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600 mb-4 drop-shadow-sm">
          Sảnh Đường Tình Yêu
        </h1>
        <p className="text-xl text-rose-700 font-medium">Nơi tôn vinh những tình yêu đẹp nhất server 💕</p>
      </motion.div>

      <div className="z-10 w-full max-w-4xl">
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 sm:p-10 mb-8 relative">
          
          <div className="flex items-center justify-center space-x-3 mb-8">
            <Trophy className="text-amber-500" size={32} />
            <h2 className="text-3xl font-bold text-gray-800">Bảng Vàng Uyên Ương</h2>
            <Trophy className="text-amber-500" size={32} />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
          ) : topCouples.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-lg">
              <Heart className="mx-auto mb-4 text-gray-300" size={48} />
              Chưa có cặp đôi nào lọt vào bảng vàng. Hãy là người đầu tiên!
            </div>
          ) : (
            <div className="space-y-6">
              {topCouples.map((couple, index) => (
                <motion.div 
                  key={couple.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-2xl p-5 sm:p-6 shadow-sm border flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow cursor-default group ${
                    couple.status === 'married'
                      ? 'bg-gradient-to-r from-pink-100 via-rose-200 to-amber-100 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-[1.02]'
                      : 'bg-gradient-to-r from-white to-rose-50 border-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex -space-x-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-4 border-white flex items-center justify-center text-white shadow-md z-10 transition-transform group-hover:scale-110">
                        <User size={24} />
                      </div>
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 border-4 border-white flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110">
                        <User size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="truncate max-w-[120px] sm:max-w-[150px]">{couple.user1Nickname}</span>
                        <Heart className="text-rose-500 fill-rose-500" size={16} />
                        <span className="truncate max-w-[120px] sm:max-w-[150px]">{couple.user2Nickname}</span>
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        {couple.status === 'married' ? (
                          <span className="text-amber-600 font-extrabold flex items-center gap-1 drop-shadow-sm">💍 Vợ Chồng</span>
                        ) : (
                          <span className="text-blue-500 font-semibold">💑 Đang hẹn hò</span>
                        )}
                        {couple.marriedAt && (
                          <span className="flex items-center gap-1 ml-2 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                            <CalendarHeart size={12} /> {new Date(couple.marriedAt).toLocaleDateString()}
                          </span>
                        )}
                        {couple.poopCount > 0 && (
                          <span className="flex items-center gap-1 ml-2 text-xs bg-amber-900/80 text-white px-2 py-0.5 rounded-full shadow-sm" title={`Đã rặn ra ${couple.poopCount} cục cứt`}>
                            💩 x {couple.poopCount}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-1/3 text-right">
                    <div className="flex justify-between text-xs font-semibold text-rose-600 mb-1 px-1">
                      <span>Tình cảm</span>
                      <span>{couple.affection} / 1000</span>
                    </div>
                    <div className="w-full bg-rose-100 rounded-full h-3.5 overflow-hidden border border-rose-200 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgress(couple.affection)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="bg-gradient-to-r from-pink-400 to-rose-500 h-full rounded-full relative"
                      >
                         <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)' }}></div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-rose-600/80 font-medium text-sm">Sử dụng lệnh `/couple propose` trong Discord để bắt đầu tìm kiếm nửa kia của bạn!</p>
        </div>
      </div>
    </div>
  );
}
