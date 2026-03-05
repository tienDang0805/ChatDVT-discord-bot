import React, { useState, useEffect } from 'react';
import { Save, UserCircle, AlertCircle, CheckCircle2, Server, Edit3, X } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

export const Identity = () => {
  const [guilds, setGuilds] = useState<any[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [nickname, setNickname] = useState('');
  const [signature, setSignature] = useState('');

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 1. Load Guilds on Mount
  useEffect(() => {
    const fetchGuilds = async () => {
         try {
             const res = await api.get('/guilds');
             if (res.data && res.data.length > 0) {
                 setGuilds(res.data);
                 setSelectedGuild(res.data[0].id); // Auto select first guild
             }
         } catch (e) {
             console.error("Failed to fetch guilds:", e);
         }
    };
    fetchGuilds();
  }, []);

  // 2. Load Users when Guild changes
  useEffect(() => {
    const fetchUsers = async () => {
        if (!selectedGuild) return;
        setFetchingUsers(true);
        try {
            const response = await api.get(`/identities/list?guildId=${selectedGuild}`);
            if (response.data) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
            showMessage('error', 'Không thể tải danh sách thành viên rừ Server này.');
        } finally {
            setFetchingUsers(false);
        }
    };
    fetchUsers();
  }, [selectedGuild]);

  const openEditor = (user: any) => {
      setEditingUser(user);
      setNickname(user.dbNickname || '');
      setSignature(user.dbSignature || '');
  };

  const closeEditor = () => {
      setEditingUser(null);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setLoading(true);

    try {
      await api.post(`/identity/${editingUser.id}`, {
        nickname: nickname.trim(),
        signature: signature.trim()
      });
      
      // Update local state to reflect changes without total reload
      setUsers(prev => prev.map(u => 
          u.id === editingUser.id 
            ? { ...u, dbNickname: nickname.trim(), dbSignature: signature.trim() } 
            : u
      ));

      showMessage('success', `Đã lưu danh tính cho ${editingUser.globalName || editingUser.username}!`);
      closeEditor();
    } catch (error) {
      console.error(error);
      showMessage('error', 'Lỗi khi lưu danh tính');
    } finally {
      setLoading(false);
    }
  };

    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="space-y-8 animate-fade-in relative pb-12"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 dark:border-white/5 shadow-2xl relative overflow-hidden ring-1 ring-black/5"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <UserCircle size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Custom Identity (Danh Tính)</h1>
            <p className="text-slate-400 mt-1">Cài đặt Biệt Danh và Chữ Ký cá nhân cho người dùng cụ thể</p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      {message && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl flex items-center gap-3 shadow-lg ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium">{message.text}</p>
        </motion.div>
      )}

      {/* Select Server Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-surface/40 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 dark:border-white/5 shadow-2xl flex items-center gap-4 ring-1 ring-black/5"
      >
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                <Server size={24} />
            </div>
            <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-2">1. Trích xuất thành viên từ máy chủ</label>
                <select 
                    value={selectedGuild}
                    onChange={(e) => setSelectedGuild(e.target.value)}
                    className="w-full bg-background border border-slate-700 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                >
                    {guilds.map((g: any) => (
                        <option key={g.id} value={g.id}>🏠 {g.name}</option>
                    ))}
                    {guilds.length === 0 && <option value="">Đang tải...</option>}
                </select>
            </div>
      </motion.div>

      {/* User Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-surface/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 dark:border-white/5 shadow-2xl min-h-[400px] ring-1 ring-black/5"
      >
         <h2 className="text-lg font-semibold text-foreground mb-6">2. Danh Sách Thành Viên ({users.length})</h2>
         
         {fetchingUsers ? (
             <div className="flex justify-center items-center h-40 text-slate-400">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                 Đang đồng bộ người dùng từ Discord...
             </div>
         ) : users.length === 0 ? (
             <div className="text-center text-slate-500 py-10 bg-background/50 rounded-xl border border-dashed border-slate-700">
                 Không tìm thấy người dùng nào hợp lệ trong máy chủ này.
             </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {users.map((user) => (
                     <div 
                        key={user.id} 
                        className={`group relative p-4 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                            (user.dbNickname || user.dbSignature) 
                              ? 'bg-primary/5 border-primary/30 hover:bg-primary/10 hover:border-primary/50' 
                              : 'bg-background border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/50'
                        }`}
                        onClick={() => openEditor(user)}
                     >
                         {/* Configured Badge */}
                         {(user.dbNickname || user.dbSignature) && (
                             <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary">
                                 <CheckCircle2 size={14} />
                             </div>
                         )}

                         <div className="flex flex-col items-center text-center space-y-3">
                             <img 
                                src={user.avatar || `https://cdn.discordapp.com/embed/avatars/${parseInt(user.id.slice(-1)) % 5}.png`} 
                                alt={user.username} 
                                className="w-16 h-16 rounded-full ring-2 ring-slate-700/50 object-cover"
                             />
                             <div>
                                 <h3 className="text-foreground font-medium truncate w-full px-2">
                                     {user.globalName || user.username}
                                 </h3>
                                 <p className="text-xs text-slate-400 font-mono mt-0.5">{user.id}</p>
                             </div>
                             
                             <div className="w-full text-left text-xs space-y-1 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                 <p className="truncate text-slate-300">
                                     <span className="text-slate-500">✍️ Gọi là:</span> {user.dbNickname || 'Mặc định'}
                                 </p>
                                 <p className="truncate text-slate-300">
                                     <span className="text-slate-500">📝 Ký:</span> {user.dbSignature ? 'Có thiết lập' : 'Không'}
                                 </p>
                             </div>
                         </div>

                         {/* Hover Edit Overlay */}
                         <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="flex items-center gap-2 text-foreground bg-primary px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                  <Edit3 size={16} /> Chỉnh Sửa
                              </span>
                         </div>
                     </div>
                 ))}
             </div>
         )}
      </motion.div>

      {/* Edit Modal / Right Panel Overlay */}
      {editingUser && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-surface/70 backdrop-blur-3xl border border-white/10 dark:border-white/5 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden ring-1 ring-black/5"
                >
                    <div className="flex justify-between items-center p-6 border-b border-slate-700/50 bg-slate-800/20">
                        <div className="flex items-center gap-3">
                            <img 
                                src={editingUser.avatar || `https://cdn.discordapp.com/embed/avatars/${parseInt(editingUser.id.slice(-1)) % 5}.png`} 
                                alt={editingUser.username} 
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <h2 className="text-lg font-bold text-foreground leading-tight">Chỉnh sửa Danh tính</h2>
                                <p className="text-sm text-slate-400">@{editingUser.username}</p>
                            </div>
                        </div>
                        <button onClick={closeEditor} className="p-2 text-slate-400 hover:text-foreground hover:bg-slate-700/50 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-5">
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Biệt Danh (Nickname)</label>
                            <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Ví dụ: Đại Ca, Sếp, Chó Con..."
                            className="w-full bg-background border border-slate-700 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                            <p className="text-xs text-slate-500">Bot sẽ gọi người này bằng tên hiển thị ở đây thây vì tên tài khoản.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Tiểu Sử / Chữ Ký (Signature)</label>
                            <textarea
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            placeholder="Ví dụ: Thằng này rất thích ăn phở, học dốt toán..."
                            className="w-full h-32 bg-background border border-slate-700 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm resize-none"
                            />
                            <p className="text-xs text-slate-500">Mô tả về người này để AI nhớ. (Ghi chú chi tiết về tính cách, sở thích, tuổi...)</p>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-700/50 bg-slate-800/20 flex justify-end gap-3">
                        <button 
                            onClick={closeEditor}
                            className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-foreground hover:bg-slate-700 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-foreground px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/25 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {loading ? 'Đang lưu...' : 'Lưu Danh Tính'}
                        </button>
                    </div>
                </motion.div>
           </div>
      )}
    </motion.div>
  );
};
