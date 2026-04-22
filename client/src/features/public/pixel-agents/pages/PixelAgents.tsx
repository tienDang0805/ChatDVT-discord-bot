import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../../../../shared/contexts/ThemeContext';
import { Sun, Moon, Loader2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  speaker: string;
  message: string;
}

const AGENT_NAMES = ['Tiến Đặng', 'Quang Huy', 'Ngọc Tâm', 'Thái Tài', 'Hoà Trần'];

export const PixelAgents = () => {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { speaker: 'HỆ THỐNG', message: 'Chào mừng đến với Văn phòng 8D. Nhập câu hỏi để bị chửi hội đồng nhé.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentActions, setAgentActions] = useState<Record<string, string>>({});

  // Mentions State
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const filteredMentions = AGENT_NAMES.filter((n: string) => n.toLowerCase().includes(mentionQuery.toLowerCase()));
  
  // RPG Stats State
  const [iframeUrl] = useState(`/_pixel-office/index.html?v=${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket State
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    document.title = "Cuộc Sống Hằng Ngày của 8D | devtiendang.blog";
    
    // Connect to websocket backend
    const backendUrl = import.meta.env.DEV ? `http://${window.location.hostname}:3000` : '/';
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on('init_state', ({ messages, agentActions }) => {
        setMessages(messages);
        setAgentActions(agentActions);
    });

    newSocket.on('chat_update', (msgs) => {
        setMessages(msgs);
        setLoading(false);
    });

    newSocket.on('agent_action_sync', ({ agentName, action, hardcodedMsg }) => {
        setAgentActions(prev => ({ ...prev, [agentName]: action }));
        const iframe = document.querySelector('iframe');
        if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'FORCE_ACTION', agent: agentName, action }, '*');
            
            // If there's a hardcoded message accompanying action, show a speech bubble
            if (hardcodedMsg) {
               const nameToId: Record<string, number> = {
                  'Tiến Đặng': 101, 'Quang Huy': 102, 'Ngọc Tâm': 103, 'Thái Tài': 104, 'Hoà Trần': 105
               };
               const agentId = nameToId[agentName];
               if (agentId) {
                   iframe.contentWindow.postMessage({ type: '8d_speech_bubble', agentId, text: hardcodedMsg }, '*');
               }
            }
        }
    });

    newSocket.on('agent_bubble', ({ speaker, text }) => {
        const nameToId: Record<string, number> = {
           'Tiến Đặng': 101, 'Quang Huy': 102, 'Ngọc Tâm': 103, 'Thái Tài': 104, 'Hoà Trần': 105
        };
        const iframe = document.querySelector('iframe');
        const agentId = nameToId[speaker];
        if (iframe?.contentWindow && agentId) {
            iframe.contentWindow.postMessage({ type: '8d_speech_bubble', agentId, text }, '*');
        }
    });

    return () => { newSocket.disconnect(); };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    const lastWord = val.split(' ').pop();
    if (lastWord && lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionQuery(lastWord.slice(1));
      setMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (name: string) => {
    const words = input.split(' ');
    words.pop();
    setInput([...words, `@${name} `].join(' '));
    setShowMentions(false);
    document.getElementById('chat-input')?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMentions && filteredMentions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % filteredMentions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + filteredMentions.length) % filteredMentions.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(filteredMentions[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }
    
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !socket) return;
    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    const tags = AGENT_NAMES.filter(name => userMsg.includes(`@${name}`));
    socket.emit('chat_message', { text: userMsg, tags });
  };

  const forceAction = async (agentName: string, action: string) => {
    if (!socket) return;

    const shockLines = [
       "Vãi lồn chích điện trái dé tao rồi 💥 oái oái!",
       "Đụ má cứu tao vớiii á á á 🤡⚡",
       "Má ơi giật tung cả lồn xì khói rồi sếp ơi!!! ⚡️",
       "Á đù má nó Tê quá!!! Nát mẹ người rồi!!! 💥",
       "Địt mẹ con nào chích điện tao đấy táng bỏ mẹ giờ 👹⚡",
       "Ối dồi ôi xoắn mẹ nó lưỡi rồi cứu tôi với mấy anh ơi!!! ⚡️🥵",
       "Chích lộn lỗ rồi sếp ơi á á á ⚡️😫",
       "Thằng lol nào chơi chó rút dây điện đi đcmmm 💥",
       "Á á cháy mẹ lông lồn rồi sếp ơiiii ⚡",
       "Má nó xẹt lửa ầm ầm thế này mỏi chết con mẹ tao à ⚡🤡"
    ];

    const codeLines = [
       "Địt mẹ cuộc đời đéo khác gì nô lệ... đào than gãy xương sống rồi! 😭⛏️",
       "Lại bắt làm à, mả bố thằng tư bản bóc lột 🤬",
       "Cuốc than ngu người luôn tao đéo muốn làm nữa huhu 😭",
       "Đụ má tay nhão mẹ rồi vẫn bắt cuốc à sếp ơi ⛏️🖕",
       "Cực như chó thế này con đĩ sếp tha cho tao đi 😫",
       "Vừa mở mắt ra đã bắt làm, đcm tư bản rác rưởi vcl 🗑️",
       "Fix mẹ nó 100 cái bug rồi lại bắt xuống hầm than à??? 🖕",
       "Sếp như cặc tao lạy sếp tha cho em đi 😭"
    ];



    let hardcodedMsg = "";
    if (action === 'Bị chích điện') {
       hardcodedMsg = shockLines[Math.floor(Math.random() * shockLines.length)];
    } else if (action === 'Bắt Đào Than') {
       hardcodedMsg = codeLines[Math.floor(Math.random() * codeLines.length)];
    }

    socket.emit('force_action', { agentName, action, hardcodedMsg });
  };

  const getSpeakerColor = (speaker: string) => {
    const s = speaker.toUpperCase();
    if (s.includes('TIẾN')) return 'text-orange-500';
    if (s.includes('QUANG HUY')) return 'text-blue-400';
    if (s.includes('NGỌC TÂM')) return 'text-pink-400';
    if (s.includes('THÁI TÀI')) return 'text-purple-400';
    if (s.includes('HOÀ TRẦN')) return 'text-green-400';
    if (s === 'HỆ THỐNG') return 'text-slate-400';
    if (s === 'BẠN') return 'text-white font-bold block mb-1';
    return 'text-emerald-500';
  };

  const renderMessageWithMentions = (text: string) => {
    const regex = new RegExp(`@(${AGENT_NAMES.join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => {
       const isMention = AGENT_NAMES.some(name => name.toLowerCase() === part.toLowerCase());
       if (isMention) {
         return <span key={i} className="text-orange-400 font-bold bg-orange-500/10 px-1 py-0.5 rounded border border-orange-500/30">@{part}</span>;
       }
       return part;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0d1117]">
      {/* Header */}
      <div className="h-16 flex items-center px-6 relative shrink-0 z-10">
        <h1 className="text-2xl font-black text-white tracking-widest font-mono uppercase" style={{ textShadow: '3px 3px 0px #f97316' }}>
          CUỘC SỐNG HẰNG NGÀY CỦA <span className="text-orange-500">8D</span>
        </h1>
        <button 
          onClick={toggleTheme}
          className="absolute right-6 flex items-center justify-center w-10 h-10 rounded-full bg-[#1f2937] border border-slate-700 text-slate-300 hover:text-orange-400 hover:border-orange-500/50 shadow-lg transition-all z-10 group"
          title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
        >
          {theme === 'dark' ? <Sun size={20} className="group-hover:rotate-90 transition-transform duration-500" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform duration-500" />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-5 w-full max-w-[1900px] mx-auto">
        
        {/* Left: Pixel Office Iframe */}
        <div className="w-[55%] h-full relative border-2 border-orange-500/40 rounded-lg overflow-hidden shrink-0 shadow-[0_0_20px_rgba(249,115,22,0.15)] flex flex-col bg-black">
          <div className="h-3 w-full bg-orange-900/40 relative border-b border-orange-500/50">
             <div className="absolute top-0 left-0 w-8 h-full bg-orange-500"></div>
             <div className="absolute top-0 right-0 w-8 h-full bg-orange-500"></div>
          </div>
          <iframe
            src={iframeUrl}
            title="8D Pixel Office"
            className="flex-1 w-full border-none pointer-events-auto filter brightness-[1.05] contrast-[1.05]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Middle: Chat Box */}
        <div className="w-[30%] h-full bg-[#0d1620] border-2 border-slate-800 rounded-lg flex flex-col pt-4 overflow-hidden shadow-2xl shrink-0 backdrop-blur-md">
          <div className="px-5 pb-3 border-b border-slate-800 flex justify-between items-center shrink-0">
            <h2 className="text-slate-300 font-black text-[13px] tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-none inline-block"></span> HỆ THỐNG
            </h2>
            <span className="text-blue-400 text-[10px] font-black italic tracking-widest bg-blue-500/10 px-2 py-1 border border-blue-500/20 rounded">ONLINE</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {messages.map((m, idx) => (
              <div key={idx} className={`bg-[#131b26] border ${m.speaker === 'BẠN' ? 'border-orange-500/30 ml-8' : 'border-slate-800 mr-8'} rounded-sm p-4 shadow-sm relative group`}>
                {m.speaker !== 'BẠN' && <div className={`text-[11px] font-black uppercase mb-1.5 tracking-widest ${getSpeakerColor(m.speaker)}`}>// {m.speaker}</div>}
                {m.speaker === 'BẠN' && <span className={getSpeakerColor(m.speaker)}>{m.speaker}</span>}
                <div className="text-slate-300 text-[13.5px] leading-relaxed whitespace-pre-wrap font-medium font-mono">
                  {renderMessageWithMentions(m.message)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="bg-[#131b26] border border-slate-800 mr-8 rounded p-4 flex items-center gap-3">
                 <Loader2 size={16} className="text-orange-500 animate-spin" />
                 <span className="text-slate-500 text-sm font-medium animate-pulse font-mono tracking-wider">8D đang gõ phím chửi...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-800 bg-[#0a0f18] shrink-0">
            <div className="flex gap-2 h-11 relative">
              {showMentions && filteredMentions.length > 0 && (
                <ul className="absolute bottom-[calc(100%+8px)] left-0 w-64 bg-[#131b26] border-2 border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-50 rounded-md overflow-hidden">
                  <div className="bg-slate-800 text-slate-400 text-[10px] uppercase font-black px-3 py-1.5 border-b border-slate-700">Tag AI Member</div>
                  {filteredMentions.map((name: string, i: number) => (
                    <li 
                      key={name}
                      onClick={() => insertMention(name)}
                      className={`px-3 py-2 text-sm font-mono cursor-pointer transition-colors ${i === mentionIndex ? 'bg-orange-500/20 text-orange-400 border-l-2 border-orange-500' : 'text-slate-300 hover:bg-slate-800'}`}
                    >
                      @{name}
                    </li>
                  ))}
                </ul>
              )}
              <input
                id="chat-input"
                type="text"
                className="flex-1 bg-[#131b26] border border-slate-700 text-emerald-400 font-mono rounded-none px-4 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600"
                placeholder="Nhập chat tại đây (@ để tag)..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={loading}
                autoComplete="off"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-[#241313] text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-500/50 rounded-none px-5 font-black tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real-time Status Panel */}
        <div className="w-[15%] h-full bg-[#0d1620] border-2 border-slate-800 rounded-lg flex flex-col pt-4 overflow-hidden shadow-2xl shrink-0 backdrop-blur-md">
          <div className="px-4 pb-3 border-b border-slate-800 shrink-0 text-center">
            <h2 className="text-slate-400 font-black text-[11px] tracking-widest uppercase">TRẠNG THÁI HIỆN TẠI</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {['Tiến Đặng', 'Quang Huy', 'Ngọc Tâm', 'Thái Tài', 'Hoà Trần'].map(name => {
              const currentAction = agentActions[name] || 'Đang ngủ';
              const isIdle = !['Bắt Đào Than', 'Bị chích điện'].includes(currentAction);
              return (
                <div key={name} className="relative bg-[#131b26] border border-slate-800 rounded p-3 text-center transition-all hover:border-slate-700 hover:shadow-lg group">
                  <div className={`text-[11px] font-black uppercase tracking-widest mb-1.5 ${getSpeakerColor(name)}`}>{name}</div>
                  <div className={`text-[11px] font-bold tracking-wide flex items-center justify-center gap-1.5 ${isIdle ? 'text-slate-500' : 'text-orange-400'}`}>
                    {isIdle 
                      ? <span className="inline-block w-1.5 h-1.5 bg-slate-600 rounded-full animate-pulse shrink-0"></span> 
                      : <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping shrink-0" style={{ animationDuration: '1.5s' }}></span>}
                    <span className="truncate max-w-[90%]">{currentAction}</span>
                  </div>

                  {/* Force Actions */}
                  <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity mt-3 h-0 group-hover:h-auto overflow-hidden">
                     <button onClick={() => forceAction(name, 'Bắt Đào Than')} className="w-full bg-slate-800/80 hover:bg-orange-500 hover:text-white text-slate-300 text-[9px] font-black uppercase py-1.5 rounded transition-colors border border-slate-700 hover:border-orange-500" title="Bắt Làm">⛏️ BẮT ĐÀO THAN</button>
                     <button onClick={() => forceAction(name, 'Bị chích điện')} className="w-full bg-slate-800/80 hover:bg-yellow-500 hover:text-white text-slate-300 text-[9px] font-black uppercase py-1.5 rounded transition-colors border border-slate-700 hover:border-yellow-500" title="Chích Điện">⚡️ CHÍCH ĐIỆN</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
