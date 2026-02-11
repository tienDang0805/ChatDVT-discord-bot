import React, { useState } from 'react';

export const Settings = () => {
    const [prompt, setPrompt] = useState("Bạn là trợ lý ảo thông minh...");
    
    return (
        <div className="max-w-3xl space-y-8">
            <div>
                 <h2 className="text-2xl font-bold">Global Settings</h2>
                 <p className="text-slate-400">Configure bot personality and core behaviors.</p>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-slate-700/50 space-y-6">
                 <div>
                     <label className="block text-sm font-medium text-slate-300 mb-2">System Prompt (Global)</label>
                     <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-40 bg-background rounded-lg border border-slate-600 p-4 text-slate-200 focus:outline-none focus:border-primary transition-colors resize-none"
                     />
                     <p className="text-xs text-slate-500 mt-2">This prompt defines the base personality for all guilds unless overridden.</p>
                 </div>

                 <div className="flex justify-end">
                     <button className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                         Save Changes
                     </button>
                 </div>
            </div>
            
            <div className="bg-surface rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold mb-4">Dangerous Zone</h3>
                <button className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors">
                    Clear All Cache
                </button>
            </div>
        </div>
    );
};
