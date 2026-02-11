import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, ArrowRight, AlertCircle, Terminal } from 'lucide-react';
import { api } from '../api'; // Need to export api instance from index.ts or create loginApi
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Direct axios call or use a helper
      const res = await api.post('/login', { username, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        // Set default header
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Access Denied. Intruder detected.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Background Matrix-like effect (Simplified CSS) */}
      <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/U3qYN8S0j3bpK/giphy.gif')] opacity-10 bg-cover bg-center pointer-events-none"></div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.2)] relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Lock className="text-emerald-400 w-8 h-8" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-white mb-2 tracking-wider">
          SYSTEM ACCESS
        </h2>
        <p className="text-center text-emerald-500/60 text-xs mb-8 uppercase tracking-widest">
          Secured Gateway // EvoVerse Core
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                placeholder="USERNAME"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                placeholder="PASSWORD"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded border border-red-400/20"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? 'AUTHENTICATING...' : <><span className="tracking-widest">LOGIN</span> <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> </>}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] text-slate-600">
           RESTRICTED AREA. UNAUTHORIZED ACCESS WILL BE LOGGED.
        </div>
      </motion.div>
    </div>
  );
};
