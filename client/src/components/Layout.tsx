import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ScrollText, Settings, Bot, LogOut, Moon, Sun, TerminalSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useTheme } from '../contexts/ThemeContext';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={twMerge(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        isActive 
          ? "bg-primary text-white shadow-lg shadow-primary/25" 
          : "text-slate-400 hover:bg-surface hover:text-white"
      )}
    >
      <Icon size={20} className={clsx("transition-transform", isActive && "scale-110")} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [botInfo, setBotInfo] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const fetchBotInfo = async () => {
      try {
        const response = await api.get('/bot-info');
        if (response.data) setBotInfo(response.data);
      } catch (error) {
        console.error("Failed to load bot info", error);
      }
    };
    fetchBotInfo();
  }, []);

  // Update Favicon and Title dynamically based on Bot Info
  useEffect(() => {
    if (botInfo?.avatar) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = botInfo.avatar;
    }
    
    if (botInfo?.globalName || botInfo?.username) {
        document.title = `${botInfo.globalName || botInfo.username} | ChatDVT`;
    }
  }, [botInfo]);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans relative selection:bg-primary/30 selection:text-primary">
      {/* Background ambient light effects (The Orbs 2026 UI) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[130px] pointer-events-none -translate-y-1/2 translate-x-1/3 animate-blob mix-blend-screen dark:mix-blend-color-dodge" />
      <div 
         className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[150px] pointer-events-none translate-y-1/3 animate-blob mix-blend-screen dark:mix-blend-color-dodge" 
         style={{ animationDelay: '2s' }}
      />
      <div 
         className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-blob mix-blend-screen dark:mix-blend-color-dodge"
         style={{ animationDelay: '4s' }}
      />

      {/* Sidebar */}
      <aside className="w-64 bg-surface/70 backdrop-blur-2xl border-r border-slate-700/50 flex flex-col p-4 relative z-20 transition-colors duration-500">
        {/* Glow Effect Top Left */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 px-4 py-6 mb-6 relative z-10 group cursor-default">
          {botInfo?.avatar ? (
             <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-md animate-pulse"></div>
                <img 
                   src={botInfo.avatar} 
                   alt="Bot Avatar" 
                   className="w-12 h-12 rounded-full border-2 border-slate-700/80 shadow-xl object-cover relative z-10 transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-surface rounded-full z-20 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
             </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">
               <Bot size={28} />
            </div>
          )}
          
          <div className="flex-1 overflow-hidden">
            <h1 className="font-bold text-lg text-white truncate transition-colors group-hover:text-primary">
                {botInfo?.globalName || botInfo?.username || 'EvoVerse AI'}
            </h1>
            <p className="text-xs text-slate-400 truncate">
               {botInfo?.id ? `ID: ${botInfo.id}` : 'Hybrid Monolith Bot'}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/prompts" icon={Bot} label="Prompts" />
          <NavItem to="/identity" icon={ScrollText} label="User Identity" />
          <NavItem to="/control" icon={LayoutDashboard} label="Control Center" />
          <NavItem to="/logs" icon={ScrollText} label="Chat Logs" />
          <NavItem to="/settings" icon={Settings} label="Identity & Config" />
          <NavItem to="/terminal" icon={TerminalSquare} label="🔴 Live Console" />

          {/* Spacer */}
          <div className="flex-1" />

          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-primary/10 hover:text-primary transition-all w-full text-left mt-auto mb-2 group"
          >
            {theme === 'dark' ? <Sun size={20} className="group-hover:rotate-90 transition-transform duration-500" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform duration-500" />}
            <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button 
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full text-left"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </nav>

        <div className="mt-4 px-4 py-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-500">
            v2.0.0 (Hybrid)
            <br />
            Status: <span className="text-emerald-400">Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0 z-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto p-8 min-h-full"
          >
              {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
