import React, { useState } from 'react';
import { Save, UserCircle, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api';

export const Identity = () => {
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;

    setSearching(true);
    setHasSearched(false);
    
    try {
      const response = await api.get(`/identity/${userId.trim()}`);
      setNickname(response.data.nickname || '');
      setSignature(response.data.signature || '');
      setHasSearched(true);
      showMessage('success', 'Đã tải thông tin danh tính');
    } catch (error) {
      showMessage('error', 'Không tìm thấy hoặc có lỗi xảy ra');
      // If error, still allow them to type and save (in case it's a new user and getOrCreate failed somehow)
      setHasSearched(true); 
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    if (!userId.trim()) return;
    setLoading(true);

    try {
      await api.post(`/identity/${userId.trim()}`, {
        nickname: nickname.trim(),
        signature: signature.trim()
      });
      showMessage('success', 'Đã lưu danh tính thành công!');
    } catch (error) {
      console.error(error);
      showMessage('error', 'Lỗi khi lưu danh tính');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-slate-700/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <UserCircle size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Custom Identity</h1>
            <p className="text-slate-400 mt-1">Cài đặt Biệt Danh và Chữ Ký cá nhân cho người dùng</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in-up ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-surface p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4">1. Tìm Người Dùng</h2>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Nhập ID Discord của người dùng (Ví dụ: 448507913879945216)"
              className="w-full bg-background border border-slate-700 rounded-xl px-4 py-3 pl-11 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              required
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="bg-primary hover:bg-primary/90 text-white px-6 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {searching ? 'Đang tìm...' : 'Tìm Kiếm'}
          </button>
        </form>
      </div>

      {/* Editor (Only show after search) */}
      {hasSearched && (
        <div className="grid grid-cols-1 gap-6 animate-fade-in-up">
          <div className="bg-surface p-6 rounded-2xl border border-slate-700/50 shadow-lg space-y-6">
             <div className="flex justify-between items-center mb-2 border-b border-slate-700/50 pb-4">
               <div>
                  <h2 className="text-lg font-semibold text-white">2. Chỉnh Sửa Danh Tính</h2>
                  <p className="text-sm text-slate-400">Thiết lập AI Prompts cá nhân hóa cho User ID <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">{userId}</span></p>
               </div>
               
               <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Đang sao lưu...' : 'Lưu Danh Tính'}
                </button>
             </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Biệt Danh (Nickname)</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ví dụ: Đại Ca, Sếp, Chó Con..."
                  className="w-full bg-background border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors mb-2"
                />
                <p className="text-xs text-slate-500">Bot sẽ gọi người này bằng tên hiển thị ở đây thây vì tên tài khoản.</p>
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-sm font-medium text-slate-300">Tiểu Sử / Chữ Ký (Signature)</label>
                <textarea
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Ví dụ: Thằng này rất thích ăn phở, học dốt toán..."
                  className="w-full h-32 bg-background border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono text-sm resize-none"
                />
                 <p className="text-xs text-slate-500">Mô tả về người này để AI nhớ. (Ghi chú về tính cách, sở thích, tuổi...)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
