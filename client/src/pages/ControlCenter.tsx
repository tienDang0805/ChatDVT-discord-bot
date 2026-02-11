import React, { useState, useEffect } from 'react';
import { getGuilds, getGuildChannels, sendAnnouncement, leaveGuild } from '../api';
import { Megaphone, Trash2, Send, AlertTriangle } from 'lucide-react';

export const ControlCenter = () => {
    const [guilds, setGuilds] = useState<any[]>([]);
    const [selectedGuild, setSelectedGuild] = useState('');
    const [channels, setChannels] = useState<any[]>([]);
    const [selectedChannel, setSelectedChannel] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getGuilds().then(setGuilds).catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedGuild) {
            getGuildChannels(selectedGuild).then(setChannels).catch(console.error);
            setSelectedChannel('');
        }
    }, [selectedGuild]);

    const handleSend = async () => {
        if (!selectedGuild || !selectedChannel || !message) return;
        setLoading(true);
        setStatus(null);
        try {
            await sendAnnouncement(selectedGuild, { channelId: selectedChannel, title, message });
            setStatus({ type: 'success', msg: 'Announcement sent successfully!' });
            setTitle('');
            setMessage('');
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to send announcement.' });
        }
        setLoading(false);
    };

    const handleLeave = async () => {
        if (!selectedGuild || !confirm('Are you sure you want the bot to leave this server? This action cannot be undone.')) return;
        try {
            await leaveGuild(selectedGuild);
            setGuilds(prev => prev.filter(g => g.id !== selectedGuild));
            setSelectedGuild('');
            setStatus({ type: 'success', msg: 'Left server successfully.' });
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to leave server.' });
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
                    <AlertTriangle className="text-orange-400" /> Control Center
                </h2>
                <p className="text-slate-400 mt-2">Manage server interactions and broadcasts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Announcement Panel */}
                <div className="bg-surface rounded-2xl border border-slate-700/50 p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4">
                        <Megaphone className="text-blue-400" />
                        <h3 className="text-xl font-bold text-white">Broadcast Announcement</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Target Server</label>
                                <select 
                                    className="w-full bg-background border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-primary transition-colors"
                                    value={selectedGuild}
                                    onChange={(e) => setSelectedGuild(e.target.value)}
                                >
                                    <option value="">Select Server</option>
                                    {guilds.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Target Channel</label>
                                <select 
                                    className="w-full bg-background border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-primary transition-colors"
                                    value={selectedChannel}
                                    onChange={(e) => setSelectedChannel(e.target.value)}
                                    disabled={!selectedGuild}
                                >
                                    <option value="">Select Text Channel</option>
                                    {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Title (Optional)</label>
                            <input 
                                type="text"
                                className="w-full bg-background border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-primary transition-colors placeholder-slate-600"
                                placeholder="e.g. System Update v2.0"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Message Content</label>
                            <textarea 
                                className="w-full bg-background border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-primary transition-colors placeholder-slate-600 h-32 resize-none"
                                placeholder="Enter your announcement here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            ></textarea>
                        </div>
                        
                        {status && (
                            <div className={`p-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {status.msg}
                            </div>
                        )}

                        <button 
                            onClick={handleSend}
                            disabled={loading || !selectedGuild || !selectedChannel || !message}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : <><Send size={18} /> Send Announcement</>}
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-surface rounded-2xl border border-red-500/20 p-6 space-y-6 h-fit">
                    <div className="flex items-center gap-3 border-b border-red-500/20 pb-4">
                        <AlertTriangle className="text-red-500" />
                        <h3 className="text-xl font-bold text-red-500">Danger Zone</h3>
                    </div>

                    <p className="text-slate-400 text-sm">Actions here are irreversible. Proceed with caution.</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Select Server to Leave</label>
                            <select 
                                className="w-full bg-background border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-red-500 transition-colors"
                                value={selectedGuild}
                                onChange={(e) => setSelectedGuild(e.target.value)}
                            >
                                <option value="">Select Server</option>
                                {guilds.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>

                        <button 
                            onClick={handleLeave}
                            disabled={!selectedGuild}
                            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <Trash2 size={18} /> Leave Server
                        </button>
                    </div>
                </div>
            </div>

            {/* System Logs */}
            <SystemLogViewer />
        </div>
    );
};

// Sub-component for Logs
const SystemLogViewer = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await import('../api').then(m => m.getSystemLogs());
            setLogs(data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(() => {
            if (autoRefresh) fetchLogs();
        }, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh]);

    return (
        <div className="bg-surface rounded-2xl border border-slate-700/50 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">System Logs (Debug)</h3>
                        <p className="text-sm text-slate-400">View internal errors and AI responses</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${autoRefresh ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                    >
                        Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
                    </button>
                    <button 
                        onClick={fetchLogs}
                        disabled={loading}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-700/50 text-slate-400 text-sm">
                            <th className="p-3 font-medium">Time</th>
                            <th className="p-3 font-medium">Level</th>
                            <th className="p-3 font-medium">Message</th>
                            <th className="p-3 font-medium">Metadata</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {logs.map((log) => (
                            <tr key={log.id} className="text-sm hover:bg-white/5 transition-colors">
                                <td className="p-3 text-slate-400 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                        log.level === 'error' ? 'bg-red-500/10 text-red-400' :
                                        log.level === 'warn' ? 'bg-yellow-500/10 text-yellow-400' :
                                        'bg-blue-500/10 text-blue-400'
                                    }`}>
                                        {log.level}
                                    </span>
                                </td>
                                <td className="p-3 text-slate-200 font-mono text-xs md:text-sm break-all max-w-md">
                                    {log.message}
                                </td>
                                <td className="p-3 text-slate-400 font-mono text-xs max-w-xs truncate">
                                    {log.metadata}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500">
                                    No logs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
