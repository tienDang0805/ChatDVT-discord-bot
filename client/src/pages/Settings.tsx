import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Bot } from 'lucide-react';
import api from '../api';

export const Settings = () => {
    const [persona, setPersona] = useState({
        identity: '',
        purpose: '',
        hobbies: '',
        personality: '',
        writing_style: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    useEffect(() => {
        const fetchPersona = async () => {
            try {
                const response = await api.get('/bot-persona');
                if (response.data) {
                    setPersona(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch persona:", error);
            }
        };
        fetchPersona();
    }, []);

    const handleChange = (field: keyof typeof persona, value: string) => {
        setPersona(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.post('/bot-persona', persona);
            showMessage('success', 'Đã lưu cấu hình nhân cách Bot thành công!');
        } catch (error) {
            console.error("Failed to save persona:", error);
            showMessage('error', 'Có lỗi xảy ra khi lưu cấu hình.');
        } finally {
            setLoading(false);
        }
    };

    const renderTextarea = (label: string, field: keyof typeof persona, placeholder: string, desc: string) => (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">{label}</label>
            <textarea
                value={persona[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={placeholder}
                className="w-full h-24 bg-background border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
            <p className="text-xs text-slate-500">{desc}</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-slate-700/50 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent" />
                
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Bot size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Bot Persona (Nhân Cách AI)</h1>
                        <p className="text-slate-400 mt-1">Thiết lập tính cách, mục đích và giọng điệu chung cho Bot.</p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                    <Save size={18} />
                    {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
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

            <div className="bg-surface p-6 rounded-2xl border border-slate-700/50 shadow-lg space-y-6">
                 {renderTextarea(
                     "1. Danh tính (Bot là ai?)", 
                     "identity", 
                     "Ví dụ: Tôi là một trợ lý AI thông minh...", 
                     "Xác định vai trò cốt lõi của bot trong hệ thống."
                 )}
                 {renderTextarea(
                     "2. Mục đích (Bot làm gì?)", 
                     "purpose", 
                     "Ví dụ: Giúp đỡ mọi người giải trí, quản lý server...", 
                     "Những công việc và nhiệm vụ chính bot sẽ thực hiện."
                 )}
                 {renderTextarea(
                     "3. Sở thích (Bot thích gì?)", 
                     "hobbies", 
                     "Ví dụ: Thích đọc sách, nghe nhạc, nói chuyện phiếm...", 
                     "Làm cho bot giống người hơn thông qua sở thích."
                 )}
                 {renderTextarea(
                     "4. Tính cách (Hành vi)", 
                     "personality", 
                     "Ví dụ: Vui vẻ, thân thiện, đôi khi châm biếm...", 
                     "Quy định cách phản ứng và cảm xúc của bot."
                 )}
                 {renderTextarea(
                     "5. Giọng văn (Giao tiếp)", 
                     "writing_style", 
                     "Ví dụ: Dùng nhiều emoji, câu ngắn gọn, xưng hô 'mình/bạn'...", 
                     "Quy chuẩn về phong cách ngôn ngữ khi trả lời tin nhắn."
                 )}
            </div>
            
            <div className="bg-surface rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold mb-4 text-white">Dangerous Zone</h3>
                <button className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors">
                    Reset Factory (Sẽ gọi lệnh xóa DB - Chưa hỗ trợ)
                </button>
            </div>
        </div>
    );
};
