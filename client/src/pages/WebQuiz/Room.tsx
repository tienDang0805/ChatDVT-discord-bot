import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Loader2, BrainCircuit, CheckCircle2, XCircle, Trophy, Timer, Play } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface IPlayer {
  id: string;
  name: string;
  score: number;
}

export function WebQuizRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const playerId = localStorage.getItem(`quiz_${roomId}_playerId`);
  const playerName = localStorage.getItem('webQuizName');

  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId || !playerName) {
      navigate('/quiz');
      return;
    }

    const eventSource = new EventSource(`${API_BASE}/api/web-quiz/${roomId}/stream`);

    eventSource.onopen = () => setConnected(true);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'sync') {
         setGameState(data.state);
         if (data.state.status === 'showing_question') {
            setSelectedAnswer(null); // Reset choice on new question
         }
      } else if (data.type === 'timer') {
         setGameState((prev: any) => prev ? { ...prev, timer: data.timer } : prev);
      } else if (data.type === 'player_answered') {
         setGameState((prev: any) => prev ? { ...prev, answersSubmittedCount: data.answersSubmittedCount } : prev);
      } else if (data.type === 'players_update') {
         setGameState((prev: any) => prev ? { ...prev, players: data.players } : prev);
      } else if (data.type === 'error') {
         alert(data.message);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [roomId, playerId, navigate, playerName]);

  const handleStart = async () => {
    await fetch(`${API_BASE}/api/web-quiz/${roomId}/start`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ playerId })
    });
  };

  const handleAnswer = async (ans: string) => {
    if (selectedAnswer || gameState?.status !== 'showing_question') return;
    setSelectedAnswer(ans);
    await fetch(`${API_BASE}/api/web-quiz/${roomId}/answer`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ playerId, answer: ans })
    });
  };

  if (!connected || !gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 size={48} className="animate-spin mb-4 text-primary" />
        <p className="font-medium animate-pulse">Đang kết nối tới phòng thi đấu...</p>
      </div>
    );
  }

  // Waiting Room
  if (gameState.status === 'waiting') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-surface rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 text-center">
          <BrainCircuit size={48} className="mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Chủ đề: {gameState.topic}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Rủ bạn bè Web Quiz cùng nhau tỉ thí trí tuệ!</p>
          
          <button 
             onClick={handleStart}
             className="bg-primary hover:bg-primary-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 mx-auto w-full md:w-auto"
          >
             <Play size={20} fill="currentColor" /> Bắt đầu game ngay
          </button>
        </div>

        <div className="bg-white dark:bg-surface rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
          <h2 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
             <Users className="text-blue-500" /> Người chơi đang chờ ({gameState.players.length})
          </h2>
          <div className="flex flex-wrap gap-3">
             {gameState.players.map((p: IPlayer) => (
                <div key={p.id} className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl font-medium text-slate-700 dark:text-slate-300">
                  {p.name} {p.id === playerId ? '(Bạn)' : ''}
                </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  // Generation
  if (gameState.status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}>
           <BrainCircuit size={64} className="text-purple-500 mb-6" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">AI đang nặn câu hỏi...</h2>
        <p className="text-slate-500 dark:text-slate-400">Kiến thức sắp ngấm vào đầu rồi, chờ chút nhé!</p>
      </div>
    );
  }

  // Finish Leaderboard
  if (gameState.status === 'finished') {
    return (
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <Trophy size={64} className="mx-auto text-yellow-500 drop-shadow-lg mb-2" />
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase mb-8">Bảng Vinh Danh</h1>
        
        <div className="bg-white dark:bg-surface rounded-3xl p-4 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
           {gameState.players.map((p: IPlayer, idx: number) => (
              <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 key={p.id} 
                 className={`flex items-center justify-between p-4 mb-3 rounded-2xl ${idx === 0 ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300' : idx === 1 ? 'bg-slate-100 dark:bg-slate-800/80' : 'bg-slate-50 dark:bg-slate-800/40'}`}
              >
                  <div className="flex items-center gap-4">
                     <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${idx === 0 ? 'bg-yellow-400 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {idx + 1}
                     </span>
                     <span className={`font-bold text-lg ${idx === 0 ? 'text-amber-800' : 'text-slate-800 dark:text-gray-200'}`}>
                       {p.name} {p.id === playerId ? '(Bạn)' : ''}
                     </span>
                  </div>
                  <span className={`font-black text-xl ${idx === 0 ? 'text-amber-600' : 'text-primary'}`}>{p.score} pt</span>
              </motion.div>
           ))}
        </div>
        
        <button onClick={() => navigate('/quiz')} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-8 py-3 rounded-2xl font-bold transition-all">
           Về sảnh chờ
        </button>
      </div>
    );
  }

  const q = gameState.currentQuestion;
  if (!q) return null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      
      {/* Header Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="bg-white dark:bg-surface px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
           Câu {gameState.currentQuestionIndex + 1} / {gameState.totalQuestions}
        </div>
        <div className="bg-white dark:bg-surface px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-2 font-black text-rose-500">
           <Timer size={18} className={gameState.timer <= 5 ? 'animate-pulse' : ''} />
           {gameState.timer}s
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-surface rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex-1 flex flex-col justify-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
            <motion.div 
               className="h-full bg-primary"
               initial={{ width: '100%' }}
               animate={{ width: `${(gameState.timer / (gameState.status === 'showing_question' ? 15 : 7)) * 100}%` }}
               transition={{ ease: "linear", duration: 1 }}
            />
         </div>
         
         <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center leading-relaxed">
            {q.question}
         </h2>
      </div>

      {/* Answer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
         {['A', 'B', 'C', 'D'].map((opt) => {
            const isSelectable = gameState.status === 'showing_question' && !selectedAnswer;
            const isSelected = selectedAnswer === opt;
            const isCorrect = gameState.status === 'showing_answer' && opt === q.correct_answer;
            const isWrong = gameState.status === 'showing_answer' && selectedAnswer === opt && opt !== q.correct_answer;

            let btnClass = "p-5 rounded-2xl text-left transition-all border-2 flex items-center gap-4 group relative overflow-hidden ";
            
            if (gameState.status === 'showing_question') {
               if (isSelected) btnClass += "bg-primary border-primary text-white shadow-lg scale-[1.02]";
               else btnClass += "bg-white dark:bg-surface border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary/50 cursor-pointer";
            } else { // showing answer
               if (isCorrect) btnClass += "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02] z-10";
               else if (isWrong) btnClass += "bg-rose-500 border-rose-500 text-white";
               else btnClass += "bg-white/50 dark:bg-surface/50 border-slate-200 dark:border-slate-800 text-slate-400 opacity-50";
            }

            return (
              <button 
                 key={opt}
                 disabled={!isSelectable}
                 onClick={() => handleAnswer(opt)}
                 className={btnClass}
              >
                 {isSelectable && !isSelected && (
                    <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                 )}
                 <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-xl font-bold ${
                   isSelected || isCorrect || isWrong ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                 }`}>
                    {opt}
                 </div>
                 <span className="font-medium text-base sm:text-lg z-10">{q.options[opt as keyof typeof q.options]}</span>
                 
                 {isCorrect && <CheckCircle2 className="ml-auto shrink-0 z-10" size={24} />}
                 {isWrong && <XCircle className="ml-auto shrink-0 z-10" size={24} />}
              </button>
            )
         })}
      </div>

      {/* Explanation Banner */}
      <AnimatePresence>
         {gameState.status === 'showing_answer' && q.explanation && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 10 }}
               className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5"
            >
               <p className="text-blue-800 dark:text-blue-300 font-medium">💡 Thông não: {q.explanation}</p>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-4">
         <span>Đã trả lời: <span className="font-bold text-primary">{gameState.answersSubmittedCount} / {gameState.players.length}</span></span>
         <span>Điểm của bạn: <span className="font-bold text-amber-500">{gameState.players.find((p:any) => p.id === playerId)?.score} pt</span></span>
      </div>

    </div>
  );
}
