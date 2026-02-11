import React, { useEffect, useState } from 'react';
import { getLogs, getGuilds } from '../api';
import { Search, Filter, ChevronLeft, ChevronRight, Server } from 'lucide-react';
import { clsx } from 'clsx';

export const Logs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [guilds, setGuilds] = useState<any[]>([]);
    const [selectedGuild, setSelectedGuild] = useState('global');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // Fetch Guilds
    useEffect(() => {
        getGuilds().then(setGuilds).catch(console.error);
    }, []);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch Logs
    useEffect(() => {
        setLoading(true);
        getLogs(selectedGuild, page, debouncedSearch)
            .then((res: any) => {
                if (res.data) setLogs(res.data);
                if (res.pagination) {
                    setTotalPages(res.pagination.total);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [selectedGuild, page, debouncedSearch]);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [selectedGuild, debouncedSearch]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Filter className="text-primary" size={24} />
                        History Logs
                    </h2>
                    <p className="text-slate-400 text-sm">View interaction history between users and the bot.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Guild Selector */}
                    <div className="relative">
                        <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                            className="bg-surface border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 outline-none hover:bg-slate-700/50 transition-colors cursor-pointer appearance-none min-w-[180px]"
                            value={selectedGuild}
                            onChange={(e) => setSelectedGuild(e.target.value)}
                        >
                            <option value="global">🌐 All Servers</option>
                            {guilds.map((g: any) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-4 h-4 text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            className="bg-surface border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 outline-none placeholder-slate-500 min-w-[240px]" 
                            placeholder="Search content or user..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            
            <div className="bg-surface rounded-xl border border-slate-700/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700/50">
                            <tr>
                                <th className="p-4 font-medium">Type</th>
                                <th className="p-4 font-medium">User</th>
                                <th className="p-4 font-medium">Prompt</th>
                                <th className="p-4 font-medium">Response</th>
                                <th className="p-4 font-medium">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-400">Loading history...</td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log._id || log.id} className="hover:bg-slate-700/20 transition-colors group">
                                        <td className="p-4 whitespace-nowrap">
                                            <span className={clsx("px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide", {
                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20': log.type === 'chat',
                                                'bg-amber-500/10 text-amber-400 border border-amber-500/20': log.type === 'image',
                                                'bg-purple-500/10 text-purple-400 border border-purple-500/20': log.type === 'voice',
                                                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': !['chat', 'image', 'voice'].includes(log.type)
                                            })}>
                                                {log.type || 'CHAT'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-white whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span>{log.username}</span>
                                                <span className="text-xs text-slate-500">{log.userId}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-300 max-w-[200px] md:max-w-xs">
                                            <div className="truncate group-hover:whitespace-normal group-hover:break-words transition-all duration-300">
                                                {log.content}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-300 max-w-[200px] md:max-w-xs">
                                            <div className="truncate text-slate-400 group-hover:text-slate-300 group-hover:whitespace-normal group-hover:break-words transition-all duration-300">
                                                {log.response}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-500 whitespace-nowrap text-xs">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-500">No logs found matching your filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && logs.length > 0 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-700/50 bg-slate-900/20">
                        <div className="text-sm text-slate-400">
                            Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
