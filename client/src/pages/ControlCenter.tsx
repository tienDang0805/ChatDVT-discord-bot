import React, { useState, useEffect, useRef } from 'react';
import { getGuilds, getGuildChannels, sendControlMessage, leaveGuild } from '../api';
import { Megaphone, Trash2, Send, AlertTriangle, MessageSquare, Image as ImageIcon, CheckCircle, Clock, Bot, Paperclip, X, File as FileIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export const ControlCenter = () => {
    const [guilds, setGuilds] = useState<any[]>([]);
    const [selectedGuild, setSelectedGuild] = useState('');
    const [channels, setChannels] = useState<any[]>([]);
    const [selectedChannel, setSelectedChannel] = useState('');
    
    // Compose State
    const [content, setContent] = useState('');
    const [isEmbed, setIsEmbed] = useState(false);
    const [embedTitle, setEmbedTitle] = useState('');
    const [embedDesc, setEmbedDesc] = useState('');
    const [embedColor, setEmbedColor] = useState('#10B981'); // Emerald
    const [embedImage, setEmbedImage] = useState('');
    
    // File Attachments State
    const [attachments, setAttachments] = useState<{ file: File; id: string; preview?: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        getGuilds().then(setGuilds).catch(console.error);
    }, []);

    useEffect(() => {   
        if (selectedGuild) {
            getGuildChannels(selectedGuild).then(setChannels).catch(console.error);
            setSelectedChannel('');
        } else {
            setChannels([]);
        }
    }, [selectedGuild]);

    // Group channels by parentCategory
    const groupedChannels = channels.reduce((acc, channel) => {
        const cat = channel.parentName || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(channel);
        return acc;
    }, {} as Record<string, any[]>);

    const handleSend = async () => {
        if (!selectedGuild || !selectedChannel) return;
        if (!content && !isEmbed && attachments.length === 0) return;
        if (isEmbed && !embedTitle && !embedDesc && !embedImage) return;

        setLoading(true);
        setStatus(null);
        try {
            let embedData = undefined;
            if (isEmbed) {
                embedData = {
                    title: embedTitle,
                    description: embedDesc,
                    color: parseInt(embedColor.replace('#', ''), 16),
                    image: embedImage ? { url: embedImage } : undefined,
                };
            }

            const filesToSend = attachments.map(a => a.file);
            await sendControlMessage(selectedGuild, selectedChannel, content, embedData, filesToSend);
            
            setStatus({ type: 'success', msg: 'Message dispatched successfully!' });
            
            // Add to local history
            const channelName = channels.find(c => c.id === selectedChannel)?.name || selectedChannel;
            setHistory(prev => [{
                id: Date.now(),
                channel: channelName,
                preview: isEmbed ? `[Embed] ${embedTitle}` : content.substring(0, 30) + '...',
                time: new Date().toLocaleTimeString()
            }, ...prev].slice(0, 5));

            setContent('');
            if(isEmbed) {
               setEmbedTitle('');
               setEmbedDesc('');
               setEmbedImage('');
            }
            
            // Cleanup object URLs to avoid memory leak
            attachments.forEach(a => { if (a.preview) URL.revokeObjectURL(a.preview); });
            setAttachments([]);
        } catch (error: any) {
            setStatus({ type: 'error', msg: error.response?.data?.error || 'Failed to send message.' });
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        
        const files = Array.from(e.target.files);
        const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
        let newAttachments: { file: File, id: string; preview?: string }[] = [];

        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                alert(`File ${file.name} is too large. The limit is 25MB per file.`);
                continue;
            }

            const id = Math.random().toString(36).substring(2, 9);
            let processedFile = file;
            let preview: string | undefined = undefined;

            if (file.type.startsWith('image/')) {
                try {
                    // Compress and convert to JPEG
                    const options = {
                        maxSizeMB: 5,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true,
                        fileType: 'image/jpeg'
                    };
                    processedFile = await imageCompression(file, options);
                    
                    // The compressed file might lose its name/type, so let's enforce .jpg mapping
                    const originalName = file.name;
                    const nameParts = originalName.split('.');
                    nameParts.pop(); // remove original ext
                    const newName = nameParts.join('.') + '.jpg';
                    
                    processedFile = new File([processedFile], newName, { type: 'image/jpeg' });
                    preview = URL.createObjectURL(processedFile);
                } catch (error) {
                    console.error('Error compressing image:', error);
                    preview = URL.createObjectURL(file); // fallback
                }
            } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
               // Optional: Can't easily compress video in client, just accept it
            }

            newAttachments.push({ file: processedFile, id, preview });
        }

        setAttachments(prev => [...prev, ...newAttachments].slice(0, 10)); // Max 10 limit by Discord
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (idToRemove: string) => {
         setAttachments(prev => {
             const toRemove = prev.find(a => a.id === idToRemove);
             if (toRemove?.preview) URL.revokeObjectURL(toRemove.preview);
             return prev.filter(a => a.id !== idToRemove);
         });
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-12 w-full max-w-[100vw] overflow-x-hidden">
            <div className="px-2 md:px-0">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                    <Megaphone className="text-emerald-400" /> Server Control Panel
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Direct interaction, announcements and control over your servers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                
                {/* LEFT COLUMN: Server & Channel Selection */}
                <div className="lg:col-span-4 space-y-6 md:space-y-8">
                    <div className="bg-surface/80 rounded-3xl border border-slate-200 dark:border-white/5 p-4 md:p-6 ring-1 ring-black/5 flex flex-col h-full max-h-[70vh]">
                        <h3 className="text-lg font-bold text-foreground mb-4">1. Select Target</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Discord Server</label>
                            <select 
                                className="w-full bg-background border border-slate-300 dark:bg-slate-900/50 dark:border-slate-700 rounded-xl p-3 text-foreground outline-none focus:border-emerald-500 transition-colors"
                                value={selectedGuild}
                                onChange={(e) => setSelectedGuild(e.target.value)}
                            >
                                <option value="">-- Choose a Server --</option>
                                {guilds.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Text Channels</label>
                            {!selectedGuild ? (
                                <div className="text-center p-6 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-sm">
                                    Select a server to view channels
                                </div>
                            ) : Object.keys(groupedChannels).length === 0 ? (
                                <div className="text-center p-6 text-slate-500 text-sm">No text channels found.</div>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(groupedChannels).map(([category, chans]: [string, any]) => (
                                        <div key={category}>
                                            <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                                {category}
                                                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                            </div>
                                            <div className="space-y-1">
                                                {chans.map((c: any) => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => setSelectedChannel(c.id)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${selectedChannel === c.id ? 'bg-emerald-100 text-emerald-700 font-medium dark:bg-emerald-500/20 dark:text-emerald-400' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:hover:bg-white/5 dark:text-slate-400 dark:hover:text-slate-200'}`}
                                                    >
                                                        <span className="text-slate-400 dark:text-slate-600 font-mono">#</span> {c.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Composer & Preview */}
                <div className="lg:col-span-8 space-y-6 md:space-y-8">
                    <div className="bg-surface/80 rounded-3xl border border-slate-200 dark:border-white/5 p-4 md:p-6 ring-1 ring-black/5 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-foreground">2. Compose Message</h3>
                            
                            {/* Message Type Toggle */}
                            <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                <button
                                    onClick={() => setIsEmbed(false)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${!isEmbed ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                                >
                                    Normal Text
                                </button>
                                <button
                                    onClick={() => setIsEmbed(true)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isEmbed ? 'bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                                >
                                    Rich Embed
                                </button>
                            </div>
                        </div>

                        {/* Composer Form */}
                        <div className="space-y-4">
                            {!isEmbed && (
                                <div>
                                    <textarea 
                                        className="w-full bg-background border border-slate-300 dark:bg-slate-900/50 dark:border-slate-700 rounded-xl p-4 text-foreground outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-400 dark:placeholder-slate-600 min-h-[150px] resize-y"
                                        placeholder="Type your message here... You can use standard Discord markdown (*italics*, **bold**, `code`)"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    ></textarea>
                                    
                                    {/* Direct File Upload Zone */}
                                    <div className="mt-4 p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                                         onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input 
                                            type="file" 
                                            multiple 
                                            className="hidden" 
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                        />
                                        <Paperclip className="text-slate-400" size={24} />
                                        <p className="text-sm font-medium text-slate-500 text-center">
                                            Lick or Drag & Drop files here <br/>
                                            <span className="text-xs font-normal opacity-70">(Max 10 files. Images, Videos, Audio)</span>
                                        </p>
                                    </div>

                                    {/* Uploaded Files Preview Chips */}
                                    {attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-3 mt-4">
                                            {attachments.map((att) => (
                                                 <div key={att.id} className="relative group rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 overflow-hidden min-w-[120px] max-w-[200px] flex gap-2 p-2 items-center">
                                                      {att.preview ? (
                                                          <img src={att.preview} alt={att.file.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                                                      ) : (
                                                          <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                                              <FileIcon size={20} className="text-slate-400" />
                                                          </div>
                                                      )}
                                                      <div className="flex flex-col flex-1 truncate pr-6">
                                                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate" title={att.file.name}>{att.file.name}</span>
                                                          <span className="text-[10px] text-slate-500">{(att.file.size / (1024*1024)).toFixed(2)} MB</span>
                                                      </div>
                                                      <button onClick={(e) => { e.stopPropagation(); removeAttachment(att.id); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 dark:bg-black/50 text-slate-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                                          <X size={14} />
                                                      </button>
                                                 </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {isEmbed && (
                                <div className="space-y-4 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Embed Title</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-background border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-foreground outline-none focus:border-emerald-500 text-sm"
                                                placeholder="e.g., Server Update Announcement"
                                                value={embedTitle}
                                                onChange={(e) => setEmbedTitle(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Color (Hex)</label>
                                            <input 
                                                type="color"
                                                className="w-full h-[42px] bg-background border border-slate-300 dark:border-slate-700 rounded-lg p-1 cursor-pointer"
                                                value={embedColor}
                                                onChange={(e) => setEmbedColor(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
                                        <textarea 
                                            className="w-full bg-background border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-foreground outline-none focus:border-emerald-500 min-h-[100px] text-sm"
                                            placeholder="Detailed announcement text..."
                                            value={embedDesc}
                                            onChange={(e) => setEmbedDesc(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Image URL (Optional)</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <input 
                                                    type="text"
                                                    className="w-full bg-background border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-foreground outline-none focus:border-emerald-500 text-sm"
                                                    placeholder="https://example.com/image.png"
                                                    value={embedImage}
                                                    onChange={(e) => setEmbedImage(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Optional Content for Embed (can be sent above the embed) */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Normal Text Above Embed (Optional)</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-background border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-foreground outline-none focus:border-emerald-500 text-sm"
                                            placeholder="Hey @everyone, check this out!"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Discord Preview Simulator */}
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700/50">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Live Preview Simulator</h4>
                            <div className="bg-[#313338] rounded-xl p-4 flex gap-4 min-h-[100px]">
                                {/* Avatar Mock */}
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <Bot size={20} className="text-emerald-500" />
                                </div>
                                <div className="flex-1 space-y-1 overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium text-[15px]">ChatDVT</span>
                                        <span className="bg-[#5865F2] text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <CheckCircle size={10} /> BOT
                                        </span>
                                        <span className="text-[#949BA4] text-xs">Today at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    
                                    {/* Normal Content Preview */}
                                    {content && <p className="text-[#DBDEE1] whitespace-pre-wrap text-[15px] leading-relaxed">{content}</p>}
                                    
                                    {/* Embed Preview */}
                                    {isEmbed && (embedTitle || embedDesc || embedImage) && (
                                        <div className="mt-2 pl-3 border-l-4 rounded-r-lg bg-[#2B2D31] p-3 max-w-xl" style={{ borderLeftColor: embedColor }}>
                                            {embedTitle && <div className="text-white font-bold mb-1">{embedTitle}</div>}
                                            {embedDesc && <div className="text-[#DBDEE1] text-sm whitespace-pre-wrap mb-2">{embedDesc}</div>}
                                            {embedImage && <img src={embedImage} alt="Preview" className="max-w-full rounded-lg max-h-64 object-cover" />}
                                        </div>
                                    )}

                                    {!content && !isEmbed && <p className="text-slate-500 italic text-sm">Start typing to see preview...</p>}
                                    {isEmbed && !content && !embedTitle && !embedDesc && !embedImage && <p className="text-slate-500 italic text-sm">Fill embed details to see preview...</p>}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                             {status && (
                                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm w-full sm:w-auto ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {status.type === 'success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
                                    {status.msg}
                                </div>
                            )}
                            <div className="flex-1"></div>
                            <button 
                                onClick={handleSend}
                                disabled={loading || !selectedGuild || !selectedChannel || (!content && !isEmbed && attachments.length === 0) || (isEmbed && !embedTitle && !embedDesc && !embedImage)}
                                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-foreground font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {loading ? 'Transmitting...' : <><Send size={18} /> Send to Server</>}
                            </button>
                        </div>
                    </div>

                    {/* Quick History */}
                    {history.length > 0 && (
                        <div className="bg-surface/80 rounded-2xl border border-slate-200 dark:border-white/5 p-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <Clock size={14} /> Recent Transmissions
                            </h4>
                            <div className="space-y-2">
                                {history.map(h => (
                                    <div key={h.id} className="flex items-center justify-between bg-slate-100 dark:bg-white/5 p-2 px-3 rounded-lg text-sm">
                                        <div className="flex items-center gap-3 truncate">
                                            <span className="text-emerald-500 dark:text-emerald-400 font-mono text-xs">#{h.channel}</span>
                                            <span className="text-slate-700 dark:text-slate-300 truncate">{h.preview}</span>
                                        </div>
                                        <span className="text-slate-500 text-xs shrink-0 pl-2">{h.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-500/10 rounded-3xl border border-red-200 dark:border-red-500/10 p-4 md:p-6 ring-1 ring-black/5 max-w-xl">
                <div className="flex items-center gap-3 border-b border-red-500/20 pb-4 mb-4">
                    <AlertTriangle className="text-red-500" />
                    <h3 className="text-xl font-bold text-red-500">Danger Zone</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Make the bot leave a server permanently. Proceed with caution.</p>
                <div className="flex gap-4">
                    <select 
                        className="flex-1 bg-background border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-foreground outline-none focus:border-red-500 transition-colors"
                        value={selectedGuild}
                        onChange={(e) => setSelectedGuild(e.target.value)}
                    >
                        <option value="">Select Server</option>
                        {guilds.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <button 
                        onClick={handleLeave}
                        disabled={!selectedGuild}
                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 font-bold px-6 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 size={18} /> Leave
                    </button>
                </div>
            </div>

        </div>
    );
};
