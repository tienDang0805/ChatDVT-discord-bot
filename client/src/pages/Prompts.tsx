import React, { useEffect, useState } from 'react';
import { getPrompts, updatePrompts, getGuilds } from '../api';
import { Save, RefreshCw, AlertCircle, CheckCircle2, Server } from 'lucide-react';
import { clsx } from 'clsx';

export const Prompts = () => {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [guilds, setGuilds] = useState<any[]>([]);
    const [selectedGuild, setSelectedGuild] = useState<string>('global');

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
            // Data might be the full object or just the prompts map depending on backend
            // Our backend returns the prompt object directly for standardized keys
            // But if it returns the full GuildConfig document, we need to extract .systemPrompts
            // The API we wrote returns `res.json(config.systemPrompts)` or `res.json(guildConfig.systemPrompts)`
            // So `data` should be the prompts object.
            
            // Normalize data if fields are missing (e.g. new keys added to code but not in DB)
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
            setSuccess(`Saved for ${selectedGuild === 'global' ? 'Global' : 'Selected Server'}!`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setConfig((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const promptKeys = [
        { key: 'global', label: 'Global / Personailty', desc: 'Main personality for chat.' },
        { key: 'quiz', label: 'Quiz Host', desc: 'Personality for Quiz Game.' },
        { key: 'catchTheWord', label: 'Catch The Word Host', desc: 'Personality for Catch The Word.' },
        { key: 'pkGame', label: 'PK Battle Referee', desc: 'Referee personality for PK Game.' },
        { key: 'pet', label: 'Pet System', desc: 'Pet interactions.' },
        { key: 'imageAnalysis', label: 'Image Analysis', desc: 'Instructions for analyzing images.' },
        { key: 'videoAnalysis', label: 'Video Analysis', desc: 'Instructions for analyzing videos.' },
    ];

    if (loading && !config) return <div className="text-white p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Prompt Engineering
                    </h1>
                    <p className="text-slate-400 mt-2">Manage the AI's personality and instructions.</p>
                </div>
                
                <div className="flex items-center gap-4 bg-surface p-2 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 px-3 text-slate-300">
                        <Server size={18} />
                        <span className="text-sm font-medium hidden md:inline">Scope:</span>
                    </div>
                    <select 
                        value={selectedGuild} 
                        onChange={handleServerChange}
                        className="bg-background border border-slate-600 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 min-w-[200px]"
                    >
                        <option value="global">🌐 Global Defaults</option>
                        {guilds.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => fetchPrompts(selectedGuild)} 
                        className="p-2 text-slate-400 hover:text-white bg-surface hover:bg-slate-700/50 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle2 size={20} />
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {promptKeys.map(({ key, label, desc }) => (
                    <div key={key} className={clsx("bg-surface rounded-xl border border-slate-700/50 p-6", key === 'global' && "lg:col-span-2 ring-1 ring-primary/20", selectedGuild !== 'global' && !config[key] && "opacity-75")}>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                {label}
                                {key === 'global' && <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">Core</span>}
                            </h3>
                            <p className="text-sm text-slate-400">{desc}</p>
                            {selectedGuild !== 'global' && !config[key] && (
                                <p className="text-xs text-amber-400 mt-1">Using Global Default</p>
                            )}
                        </div>
                        <textarea 
                            value={config ? (config[key] || '') : ''} 
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="w-full h-48 bg-background/50 border border-slate-700 rounded-lg p-4 text-slate-200 focus:outline-none focus:border-primary transition-colors font-mono text-sm resize-none"
                            placeholder={selectedGuild === 'global' ? `Enter default prompt...` : `Enter server-specific prompt (leave empty to use global)...`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
