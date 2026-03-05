import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, ShieldAlert, Server } from 'lucide-react';
import api, { getGuilds, getTerminalChannels, executeTerminalCommand } from '../api';

interface LogLine {
    id: string;
    text: string;
    type: 'system' | 'user' | 'success' | 'error' | 'info';
}

export const TerminalConsole = () => {
    const [guilds, setGuilds] = useState<any[]>([]);
    const [selectedGuild, setSelectedGuild] = useState<string>('');
    const [channels, setChannels] = useState<any[]>([]);
    const [history, setHistory] = useState<LogLine[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    const logsEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Boot Sequence
    useEffect(() => {
        addLog('system', 'ChatDVT Secure Shell v2.4.1 (Hybrid Kernel)');
        addLog('system', 'Establishing encrypted connection to primary neural net...');
        setTimeout(() => addLog('success', 'Connection Established. Authorized personnel only.'), 800);
        setTimeout(() => addLog('info', 'Type "help" to see available commands.'), 1000);
        
        // Fetch Guilds
        getGuilds().then(data => {
            if (data && data.length > 0) {
                setGuilds(data);
                setSelectedGuild(data[0].id);
            }
        }).catch(() => addLog('error', 'Failed to retrieve server matrix.'));
    }, []);

    // Load Channels when Guild changes
    useEffect(() => {
        if (!selectedGuild) return;
        addLog('info', `Switching to server matrix: ${selectedGuild}...`);
        getTerminalChannels(selectedGuild).then(data => {
            setChannels(data);
            addLog('success', `Loaded ${data.length} communication channels.`);
        }).catch(err => {
            addLog('error', `Failed to load channels: ${err.message}`);
        });
    }, [selectedGuild]);

    // Auto-scroll
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const addLog = (type: LogLine['type'], text: string) => {
        setHistory(prev => [...prev, { id: Math.random().toString(36).substring(7), text, type }]);
    };

    const handleCommand = async (cmdString: string) => {
        const raw = cmdString.trim();
        if (!raw) return;

        // Add to history
        addLog('user', `root@chatdvt:~# ${raw}`);
        
        // Command History Navigation
        setCommandHistory(prev => [raw, ...prev]);
        setHistoryIndex(-1);
        setInputValue('');

        const args = raw.split(' ');
        const command = args[0].toLowerCase();
        const cmdArgs = args.slice(1);

        // Local built-in commands
        if (command === 'clear') {
            setHistory([]);
            return;
        }

        if (command === 'help') {
            addLog('info', 'Available Commands:');
            addLog('info', '  channels                       - List all text channels in the current server');
            addLog('info', '  say <channel_id> <message...>  - Send a message to a specific channel');
            addLog('info', '  ping                           - Check API connection latency');
            addLog('info', '  clear                          - Clear terminal output');
            return;
        }

        if (command === 'channels') {
            addLog('info', `Channels in Matrix [${selectedGuild}]:`);
            if (channels.length === 0) {
                addLog('error', 'No channels available or not loaded yet.');
                return;
            }
            channels.forEach(ch => {
                addLog('info', `  [${ch.id}] #${ch.name}`);
            });
            return;
        }

        // Remote Execution
        if (!selectedGuild) {
            addLog('error', 'No server selected. Please select a server first.');
            return;
        }

        try {
            const res = await executeTerminalCommand(selectedGuild, command, cmdArgs);
            if (res.output) {
                addLog(res.output.toLowerCase().includes('error') ? 'error' : 'success', res.output);
            }
        } catch (error: any) {
            addLog('error', `Execution failed: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCommand(inputValue);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInputValue(commandHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInputValue(commandHistory[newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInputValue('');
            }
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="h-[calc(100vh-6rem)] flex flex-col gap-6"
        >
            {/* Header / Selector */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface/40 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 dark:border-white/5 shadow-2xl relative overflow-hidden ring-1 ring-black/5 flex-shrink-0"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-cyan-500" />
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <TerminalIcon size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                            Live Console <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono uppercase">root</span>
                        </h1>
                        <p className="text-slate-400 mt-1">Direct Command Line Interface to Bot Instances</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-background/50 p-2 rounded-2xl border border-slate-700/50">
                    <Server size={18} className="text-slate-400 ml-2" />
                    <select 
                        value={selectedGuild}
                        onChange={(e) => setSelectedGuild(e.target.value)}
                        className="bg-transparent border-none text-foreground font-medium focus:ring-0 py-1 pr-8 cursor-pointer text-sm"
                    >
                        {guilds.map((g: any) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
            </motion.div>

            {/* Terminal Window */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex-1 bg-black rounded-3xl border border-slate-700/50 shadow-[0_0_50px_rgba(16,185,129,0.05)] overflow-hidden flex flex-col relative group"
                onClick={() => inputRef.current?.focus()}
            >
                {/* CRT Scanline overlay effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-20"></div>

                {/* Top Window Bar */}
                <div className="h-10 bg-slate-900 flex items-center px-4 border-b border-slate-800 gap-2 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    <div className="ml-4 text-xs font-mono text-slate-500">ssh admin@chatdvt.matrix</div>
                </div>

                {/* Output Area */}
                <div className="flex-1 overflow-y-auto p-6 font-mono text-sm md:text-base selection:bg-emerald-500/30">
                    <div className="flex flex-col gap-1.5 pb-4">
                        {history.map((log) => {
                            let colorClass = "text-slate-300";
                            if (log.type === 'system') colorClass = "text-cyan-400 font-semibold";
                            if (log.type === 'success') colorClass = "text-emerald-400";
                            if (log.type === 'error') colorClass = "text-red-400";
                            if (log.type === 'user') colorClass = "text-purple-400 font-bold";
                            if (log.type === 'info') colorClass = "text-slate-400";

                            return (
                                <div key={log.id} className={`${colorClass} break-all flex items-start`}>
                                   {log.type === 'user' ? null : <span className="text-slate-600 mr-2 select-none">{'>'}</span>}
                                   <span className="flex-1">{log.text}</span>
                                </div>
                            );
                        })}
                        <div ref={logsEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 px-6 bg-slate-950/50 border-t border-emerald-900/30 flex items-center gap-3 flex-shrink-0">
                    <span className="text-emerald-500 font-mono font-bold whitespace-nowrap">root@chatdvt:~#</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent border-none text-emerald-100 font-mono focus:outline-none placeholder-emerald-900/50"
                        spellCheck="false"
                        autoComplete="off"
                        autoFocus
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};
