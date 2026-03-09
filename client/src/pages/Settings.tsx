import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Bot, Server, Key, Eye, EyeOff } from 'lucide-react';
import api from '../api';

export const Settings = () => {
    const [persona, setPersona] = useState({
        identity: '',
        purpose: '',
        hobbies: '',
        personality: '',
        writing_style: ''
    });
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    
    // Feature Toggles state
    const [disablePetImage, setDisablePetImage] = useState(false);

    const [guilds, setGuilds] = useState<any[]>([]);
    const [selectedGuild, setSelectedGuild] = useState<string>('global');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    // Load Guilds on Mount
    useEffect(() => {
        const fetchGuilds = async () => {
             try {
                 const res = await api.get('/guilds');
                 if (res.data) setGuilds(res.data);
                 
                 // Fetch Initial Global Features
                 const featureRes = await api.get('/features');
                 if (featureRes.data) {
                     setDisablePetImage(!!featureRes.data.disablePetImage);
                 }
             } catch (e) {
                 console.error("Failed to fetch guilds or features:", e);
             }
        };
        fetchGuilds();
    }, []);

    // Load Persona when Guild changes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = selectedGuild === 'global' ? '/bot-persona' : `/bot-persona?guildId=${selectedGuild}`;
                const response = await api.get(url);
                if (response.data) {
                    setPersona(response.data);
                }
                
                // Fetch API Key
                const keyUrl = selectedGuild === 'global' ? '/gemini-api-key' : `/gemini-api-key?guildId=${selectedGuild}`;
                const keyRes = await api.get(keyUrl);
                if (keyRes.data) {
                    setApiKey(keyRes.data.apiKey || '');
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
    }, [selectedGuild]);

    const handleChange = (field: keyof typeof persona, value: string) => {
        setPersona(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = { ...persona, guildId: selectedGuild };
            await api.post('/bot-persona', payload);
            
            // Save API Key
            if (apiKey !== undefined) {
                await api.post('/gemini-api-key', { apiKey, guildId: selectedGuild });
            }
            
            // Save Features (Currently Global ONLY)
            if (selectedGuild === 'global') {
                await api.post('/features', { disablePetImage });
            }
            
            showMessage('success', `Đã lưu cấu hình Tâm Trí & API Key cho ${selectedGuild === 'global' ? 'Tất cả Server' : 'Server này'}!`);
        } catch (error) {
            console.error("Failed to save data:", error);
            showMessage('error', 'Có lỗi xảy ra khi lưu cấu hình.');
        } finally {
            setLoading(false);
        }
    };

    const renderTextarea = (label: string, field: keyof typeof persona, placeholder: string, desc: string) => (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
            <textarea
                value={persona[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={placeholder}
                className="w-full h-24 bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
            <p className="text-xs text-slate-500">{desc}</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface/80 p-8 rounded-3xl border border-slate-200 dark:border-white/5 relative overflow-hidden ring-1 ring-black/5">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent" />
                
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Bot size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Bot Persona (Nhân Cách AI)</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Thiết lập tính cách, mục đích và giọng điệu chung cho Bot.</p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-accent hover:bg-accent/90 text-foreground px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                    <Save size={18} />
                    {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
            </div>

            {/* Selector */}
            <div className="bg-surface/80 p-6 rounded-3xl border border-slate-200 dark:border-white/5 flex items-center gap-4 ring-1 ring-black/5">
                 <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg">
                     <Server size={24} />
                 </div>
                 <div className="flex-1">
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Chọn Máy Chủ Để Áp Dụng (Per-Server)</label>
                     <select 
                         value={selectedGuild}
                         onChange={(e) => setSelectedGuild(e.target.value)}
                         className="w-full bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                     >
                         <option value="global">🌍 Dùng Chung (Global - Mặc định)</option>
                         {guilds.map((g: any) => (
                             <option key={g.id} value={g.id}>🏠 {g.name}</option>
                         ))}
                     </select>
                 </div>
            </div>

            {/* Messages */}
            {message && (
                <div 
                    className={`p-4 rounded-xl flex items-center gap-3 shadow-sm ${
                        message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                >
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            {/* API Key Configuration */}
            <div className="bg-surface/80 p-8 rounded-3xl border border-slate-200 dark:border-white/5 space-y-4 relative overflow-hidden ring-1 ring-black/5 hover:shadow-[0_0_40px_rgba(245,158,11,0.1)] transition-shadow duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-xl" />
                <div className="flex items-center gap-3 mb-2">
                    <Key size={24} className="text-amber-500 dark:text-amber-400" />
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Gemini API Key</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {selectedGuild === 'global' 
                                ? 'Key AI dùng chung cho toàn bộ hệ thống (Mặc định).' 
                                : 'Key AI tách biệt và độc lập cho Server này (Ưu tiên dùng thay thế Key Global).'}
                        </p>
                    </div>
                </div>
                <div className="relative z-10">
                    <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Nhập API Key API (Bắt đầu với AIza... Hoặc bỏ trống để dùng Mặc định)"
                        className="w-full bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3.5 text-foreground font-mono placeholder:font-sans focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors pr-12 text-sm"
                    />
                    <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-1"
                    >
                        {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="bg-surface/80 p-8 rounded-3xl border border-slate-200 dark:border-white/5 space-y-6 ring-1 ring-black/5 hover:shadow-[0_0_30px_rgba(var(--color-primary),0.05)] transition-shadow duration-500">
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
            
            {/* Feature Toggles */}
            {selectedGuild === 'global' && (
                <div className="bg-surface/80 p-8 rounded-3xl border border-slate-200 dark:border-white/5 space-y-6 ring-1 ring-black/5 hover:shadow-[0_0_30px_rgba(236,72,153,0.05)] transition-shadow duration-500">
                    <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/5 pb-4 mb-4">
                         <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center">
                             <CheckCircle2 size={24} />
                         </div>
                         <div>
                             <h2 className="text-xl font-bold text-foreground">Global Feature Toggles</h2>
                             <p className="text-slate-500 dark:text-slate-400 text-sm">Bật / Tắt tính năng cho toàn hệ thống.</p>
                         </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5">
                        <div className="flex-1 pr-4">
                            <h3 className="font-semibold text-foreground text-md">🚫 Tắt chức năng Sinh Ảnh Pet (Imagen)</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Khi bật công tắc này, AI sẽ tạm thời ngừng gọi API Imagen 4 (tránh hao tốn credit/tiền phí). Pet mới nở sẽ dùng ảnh mặc định. Stats và Info vẫn tạo bằng Gemini như thường.</p>
                        </div>
                        <button
                            onClick={() => setDisablePetImage(!disablePetImage)}
                            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                disablePetImage ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                        >
                            <span 
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                                    disablePetImage ? 'translate-x-9' : 'translate-x-1'
                                }`} 
                            />
                        </button>
                    </div>
                </div>
            )}
            
            <div className="bg-red-50 dark:bg-red-500/10 rounded-3xl p-8 border border-red-200 dark:border-red-500/10 ring-1 ring-black/5">
                <h3 className="text-lg font-bold mb-4 text-red-500 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle size={20} /> Dangerous Zone
                </h3>
                <button className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/50 dark:text-red-500 dark:hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors">
                    Reset Factory (Sẽ gọi lệnh xóa DB - Chưa hỗ trợ)
                </button>
            </div>
        </div>
    );
};
