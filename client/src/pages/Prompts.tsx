import React, { useEffect, useState } from 'react';
import { getPrompts, updatePrompts, getGuilds } from '../api';
import api from '../api';
import toast from 'react-hot-toast';
import { Save, RefreshCw, AlertCircle, CheckCircle2, Server, Terminal, MessageSquare, Gamepad2, BrainCircuit, FileJson, Copy, ClipboardPaste, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { TreeEditor } from './TreeEditor';

export const Prompts = () => {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [guilds, setGuilds] = useState<any[]>([]);
    const [selectedGuild, setSelectedGuild] = useState<string>('global');
    const [activeTab, setActiveTab] = useState<string>('global');

    // Live Preview States
    const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'raw'>('edit');
    const [previewText, setPreviewText] = useState<string>('');
    const [loadingPreview, setLoadingPreview] = useState<boolean>(false);

    // Fetch Preview when tab or mode changes
    useEffect(() => {
        if (viewMode !== 'edit') {
            fetchPreviewText(activeTab, selectedGuild, viewMode === 'raw');
        }
    }, [activeTab, viewMode, selectedGuild, config]);

    const fetchPreviewText = async (feature: string, guildId: string, isRaw: boolean) => {
        try {
            setLoadingPreview(true);
            const res = await api.get(`/prompts/preview?feature=${feature}&guildId=${guildId}${isRaw ? '&raw=true' : ''}`);
            setPreviewText(res.data.text || '');
        } catch (err) {
            console.error("Failed to load preview");
            setPreviewText("Error loading preview...");
        } finally {
            setLoadingPreview(false);
        }
    };

    useEffect(() => {
        fetchGuilds();
        fetchPrompts('global');
    }, []);

    const fetchGuilds = async () => {
        try {
            const data = await getGuilds();
            setGuilds(data);
        } catch (err) {
            console.error("Failed to fetch guilds");
        }
    };

    const fetchPrompts = async (guildId: string) => {
        try {
            setLoading(true);
            const data = await getPrompts(guildId);
            
            const normalizedDefaults = {
                global: "", quiz: "", catchTheWord: "", pet: "", pkGame: "", videoAnalysis: "", imageAnalysis: ""
            };
            
            setConfig(data ? { ...normalizedDefaults, ...data } : normalizedDefaults);
            setError('');
        } catch (err) {
            setError('Failed to load prompts.');
        } finally {
            setLoading(false);
        }
    };

    const handleServerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const guildId = e.target.value;
        setSelectedGuild(guildId);
        fetchPrompts(guildId);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updatePrompts({ systemPrompts: config }, selectedGuild);
            setSuccess(`Đã lưu cấu hình Prompts cho ${selectedGuild === 'global' ? 'Global Default' : 'Máy chủ hiện tại'}!`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Thất bại khi lưu cấu hình.');
            setTimeout(() => setError(''), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleCopyPrompt = async () => {
        try {
            const currentData = config?.[activeTab];
            const jsonStr = JSON.stringify(currentData || {}, null, 2);
            await navigator.clipboard.writeText(jsonStr);
            toast.success('Đã copy Prompt hiện tại vào Clipboard!');
        } catch (err) {
             toast.error('Lỗi khi copy!');
        }
    };

    const handlePastePrompt = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const pastedJson = JSON.parse(text);
            handleUpdateFlow(pastedJson);
            toast.success('Đã dán (Paste) thành công vào Tree Editor!');
        } catch (err) {
            toast.error('Dữ liệu Clipboard không phải là JSON hợp lệ!');
        }
    };

    const handleSyncToGlobal = async () => {
        if (!window.confirm("Bê cấu hình của Tab này đè lên Global Default? Tương lai mọi Máy chủ sẽ xài format mới này!")) return;
        try {
            const currentData = config?.[activeTab];
            const globalPayload = { [activeTab]: currentData };
            await updatePrompts({ systemPrompts: globalPayload }, 'global');
            toast.success(`Đã đồng bộ [${activeTab}] lên Global!`);
        } catch (err) {
            toast.error("Lỗi khi đồng bộ Global.");
        }
    };

    // Structured Node Builder Handlers
    const currentData = config?.[activeTab];
    const parsedData = typeof currentData === 'string'
        ? (currentData.trim() ? { "Core": currentData } : {})
        : (currentData || {});

    // Khi Node Canvas thay đổi thì cập nhật DB Object
    const handleUpdateFlow = (newJson: any) => {
        setConfig((prev: any) => ({
             ...prev,
             [activeTab]: newJson
        }));
    };

    const promptCategories = [
        { 
            id: 'core', 
            label: 'Hệ Thống Lõi', 
            icon: BrainCircuit,
            items: [
                { key: 'global', label: 'Tương Tác Chính (Global)', desc: 'Tính cách gốc và quy tắc giao tiếp của Bot.' }
            ]
        },
        { 
            id: 'minigames', 
            label: 'Trò Chơi (Minigames)', 
            icon: Gamepad2,
            items: [
                { key: 'quiz', label: 'Trắc Nghiệm (Quiz)', desc: 'Nhân cách MC dẫn chương trình Quiz.' },
                { key: 'catchTheWord', label: 'Đuổi Hình Bắt Chữ', desc: 'Nhân cách MC Đuổi Hình Bắt Chữ.' },
                { key: 'pkGame', label: 'PK Đại Chiến', desc: 'Nhân cách Trọng tài thi đấu PK.' },
            ]
        },
        { 
            id: 'features', 
            label: 'Tính Năng Bổ Trợ', 
            icon: MessageSquare,
            items: [
                { key: 'pet', label: 'Hệ thống Thú Cưng', desc: 'Bản sắc giao tiếp khi tương tác Pet.' },
                { key: 'imageAnalysis', label: 'Phân tích Ảnh (Vision)', desc: 'Cách bot mô tả khi thấy ảnh.' },
                { key: 'videoAnalysis', label: 'Phân tích Video', desc: 'Cách bot tóm tắt khi xem video.' },
            ]
        }
    ];

    if (loading && !config) return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                 <div className="text-slate-400 font-mono text-sm">LOADING_PROMPTS_CORE...</div>
            </div>
        </div>
    );

    // Tìm thông tin của Tab đang active
    const activeItem = promptCategories.flatMap(c => c.items).find(i => i.key === activeTab);

    return (
        <div className="space-y-6 animate-fade-in relative max-h-full flex flex-col h-[calc(100vh-6rem)]">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-primary/5 rounded-[100%] blur-3xl pointer-events-none" />

            {/* Header section (Sticky) */}
            <header className="flex-shrink-0 flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2 border-b border-slate-700/30">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <Terminal className="text-primary" size={28} />
                        Prompt Studio
                    </h1>
                    <p className="text-slate-400 mt-2">IDE Controller điều chỉnh hệ thống tư duy của Gemini.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 w-full xl:w-auto">
                    {/* Server Select */}
                    <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/50 shadow-inner flex-1 xl:flex-none">
                        <div className="pl-3 text-slate-400">
                            <Server size={18} />
                        </div>
                        <select 
                            value={selectedGuild} 
                            onChange={handleServerChange}
                            className="bg-transparent border-none text-white text-sm font-medium focus:ring-0 w-full min-w-[200px] cursor-pointer"
                        >
                            <option value="global" className="bg-slate-800">🌐 Global Core (Mặc định)</option>
                            {guilds.map(g => (
                                <option key={g.id} value={g.id} className="bg-slate-800">🏠 {g.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <div className="flex bg-[#1a1d27] rounded-xl border border-slate-700/50 p-1">
                            <button
                                onClick={() => setViewMode('edit')}
                                className={clsx(
                                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                    viewMode === 'edit' ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                <Terminal size={14} /> Builder
                            </button>
                            <button
                                onClick={() => setViewMode('preview')}
                                className={clsx(
                                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                    viewMode === 'preview' ? "bg-emerald-500/20 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                <BrainCircuit size={14} /> Preview
                            </button>
                            <button
                                onClick={() => setViewMode('raw')}
                                className={clsx(
                                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                    viewMode === 'raw' ? "bg-amber-500/20 text-amber-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                <FileJson size={14} /> Raw
                            </button>
                        </div>
                        <button 
                            onClick={() => fetchPrompts(selectedGuild)} 
                            className="p-2.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 rounded-xl transition-colors"
                            title="Tải Lại Data"
                        >
                            <RefreshCw size={18} className={clsx(loading && "animate-spin")} />
                        </button>
                        <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] active:scale-95 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving ? 'Đang Compile...' : 'Lưu Thay Đổi'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Notification Toasts */}
            <AnimatePresence>
                {(error || success) && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`absolute top-24 left-1/2 -translate-x-1/2 z-50 p-3 rounded-xl flex items-center gap-3 shadow-2xl ${
                            success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                    >
                        {success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span className="font-semibold text-sm">{success || error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main IDE Layout */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 relative z-10">
                
                {/* File Explorer (Sidebar L) */}
                <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-4 pr-1">
                    {promptCategories.map((category) => (
                        <div key={category.id} className="space-y-1">
                            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <category.icon size={14} />
                                {category.label}
                            </div>
                            <div className="space-y-1 pl-2 border-l border-slate-700/30 ml-3">
                                {category.items.map((item) => {
                                    const isActive = activeTab === item.key;
                                    const hasCustomData = selectedGuild !== 'global' && !!config?.[item.key];
                                    
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => setActiveTab(item.key)}
                                            className={clsx(
                                                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between group",
                                                isActive 
                                                    ? "bg-primary/10 text-primary" 
                                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                            )}
                                        >
                                            <span className="truncate">{item.label}</span>
                                            {/* Indicator for configured override on Server */}
                                            {hasCustomData && !isActive && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Chứa cấu hình ghi đè" />
                                            )}
                                            {isActive && (
                                                <div className="w-1.5 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),1)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Editor Surface (Main Right) */}
                <div className="flex-1 flex flex-col bg-[#0f111a] border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden group focus-within:ring-1 focus-within:ring-primary/50 transition-shadow transition-colors">
                    
                    {/* Editor Tab Bar */}
                    <div className="flex items-center bg-[#1a1d27] border-b border-slate-700/50 px-2 py-1 gap-2">
                        <div className="flex items-center gap-2 bg-[#0f111a] px-4 py-1.5 border-t-2 border-primary rounded-t-lg">
                            <Terminal size={14} className="text-primary" />
                            <span className="text-sm font-mono text-slate-200">{activeTab}.prompt</span>
                        </div>
                        <div className="flex-1"></div>
                        
                        {/* Utilities Toolbar */}
                        <div className="flex items-center gap-1.5 px-2">
                            {selectedGuild !== 'global' && (
                                <button
                                    onClick={handleSyncToGlobal}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-colors rounded-lg text-xs font-medium border border-indigo-500/20 mr-2"
                                    title="Lưu cấu hình Tab này vào hệ thống Global (Mặc định cho mọi bot mới)"
                                >
                                    <Globe size={14} /> Use as Global
                                </button>
                            )}
                            <div className="flex items-center bg-slate-800/50 rounded-lg p-0.5 border border-slate-700/50">
                                <button
                                    onClick={handleCopyPrompt}
                                    className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-md hover:bg-slate-700/50 transition-colors"
                                    title="Copy khối Prompt này"
                                >
                                    <Copy size={14} />
                                </button>
                                <div className="w-px h-4 bg-slate-700"></div>
                                <button
                                    onClick={handlePastePrompt}
                                    className="p-1.5 text-slate-400 hover:text-amber-400 rounded-md hover:bg-slate-700/50 transition-colors"
                                    title="Paste (Dán) khối Prompt"
                                >
                                    <ClipboardPaste size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Editor Status Meta */}
                    <div className="bg-[#151822] px-6 py-3 border-b border-slate-800/80 flex items-center justify-between">
                         <div>
                             <h3 className="text-white font-medium">{activeItem?.label}</h3>
                             <p className="text-xs text-slate-400 mt-0.5">{activeItem?.desc}</p>
                         </div>
                         {selectedGuild !== 'global' && !config?.[activeTab] && (
                             <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs rounded-md border border-amber-500/20 font-medium">
                                 Đang dùng Global Mặc Định
                             </span>
                         )}
                    </div>

                    {/* The Code Area */}
                    <div className="flex-1 relative cursor-text overflow-hidden bg-[#0d0f16]">
                        {/* Line Numbers Fake (Decorative) */}
                        {viewMode !== 'edit' && (
                            <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1a1d27]/40 border-r border-slate-800 flex flex-col items-end py-6 pr-3 font-mono text-xs text-slate-600 select-none pointer-events-none z-10">
                                {[...Array(50)].map((_, i) => (
                                    <div key={i} className="leading-7 opacity-50">{i + 1}</div>
                                ))}
                            </div>
                        )}
                        
                        {viewMode === 'edit' ? (
                            <div className="absolute inset-0 z-0 bg-[#0d0f16]">
                                <TreeEditor 
                                    key={activeTab}
                                    initialJson={parsedData} 
                                    onChange={handleUpdateFlow} 
                                />
                            </div>
                        ) : (
                            <div className="absolute inset-0 p-6 pl-16 overflow-y-auto custom-scrollbar bg-[#0f111a]">
                                {loadingPreview ? (
                                    <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm animate-pulse">
                                        <RefreshCw size={16} className="animate-spin" /> Fetching latest configs...
                                    </div>
                                ) : (
                                    <pre className="font-mono text-[14px] leading-7 whitespace-pre-wrap">
                                        <span className={viewMode === 'raw' ? "text-amber-300/90" : "text-emerald-300/90"}>
                                            {previewText}
                                        </span>
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Editor Footer */}
                    <div className="px-4 py-1.5 bg-[#1a1d27] border-t border-slate-700/50 flex items-center justify-between text-[11px] font-mono text-slate-500">
                         <div className="flex items-center gap-4">
                             {viewMode !== 'edit' ? (
                                 <span className="flex items-center gap-1.5 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Compiled View</span>
                             ) : (
                                 <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Schema Valid</span>
                             )}
                             <span>UTF-8</span>
                             <span>Markdown</span>
                         </div>
                         <span>EvoVerse IDE.</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
