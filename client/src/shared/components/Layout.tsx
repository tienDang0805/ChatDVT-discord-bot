import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ScrollText, Settings, Bot, LogOut, Moon, Sun, Menu, X, Heart, BrainCircuit, MessageCircle, Newspaper, Facebook } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '../api';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

const NavItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={twMerge(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        isActive 
          ? "bg-primary text-white shadow-lg shadow-primary/25" 
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-surface dark:hover:text-white"
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation(['admin', 'common']);

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

  // Keep the site-wide TD favicon; only the admin page title follows bot info.
  useEffect(() => {
    if (botInfo?.globalName || botInfo?.username) {
        document.title = `${botInfo.globalName || botInfo.username} | ChatDVT`;
    }
  }, [botInfo]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden font-sans relative selection:bg-primary/30 selection:text-primary">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-50 dark:bg-surface border-b border-slate-200 dark:border-slate-700/50 z-30">
        <div className="flex items-center gap-3">
          {botInfo?.avatar ? (
             <img src={botInfo.avatar} alt="Bot Avatar" className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700/80 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs">
               <Bot size={16} />
            </div>
          )}
          <span className="font-bold text-foreground">ChatDVT</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -mr-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Back-Drop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed md:relative inset-y-0 left-0 w-64 min-h-0 overflow-hidden bg-slate-50 dark:bg-surface border-r border-slate-200 dark:border-slate-700/50 flex flex-col p-4 z-50 transition-transform duration-300 shadow-2xl md:shadow-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        
        {/* Mobile Close Button inside Sidebar */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex shrink-0 items-center gap-3 px-4 py-6 mb-6 relative z-10 group cursor-default">
          {botInfo?.avatar ? (
             <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-md animate-pulse"></div>
                <img 
                   src={botInfo.avatar} 
                   alt="Bot Avatar" 
                   className="w-12 h-12 rounded-full border-2 border-slate-300 dark:border-slate-700/80 shadow-xl object-cover relative z-10 transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-50 dark:border-surface rounded-full z-20 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
             </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">
               <Bot size={28} />
            </div>
          )}
          
          <div className="flex-1 overflow-hidden">
            <h1 className="font-bold text-lg text-slate-900 dark:text-white truncate transition-colors group-hover:text-primary">
                {botInfo?.globalName || botInfo?.username || 'EvoVerse AI'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
               {botInfo?.id ? `ID: ${botInfo.id}` : 'Hybrid Monolith Bot'}
            </p>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-2 mt-4 md:mt-0 overflow-y-auto overscroll-contain pr-1">
          <NavItem to="/admin" icon={LayoutDashboard} label={t('nav.dashboard')} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/admin/prompts" icon={ScrollText} label={t('nav.prompts')} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/admin/users" icon={Bot} label={t('nav.users')} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/admin/pets" icon={Bot} label={t('nav.pets')} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/admin/couple" icon={Heart} label={t('nav.couples')} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/quiz" icon={BrainCircuit} label={t('nav.quiz')} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/admin/identity" icon={ScrollText} label={t('nav.identity')} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/admin/control" icon={LayoutDashboard} label={t('nav.control')} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/admin/logs" icon={ScrollText} label={t('nav.logs')} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/admin/settings" icon={Settings} label={t('nav.settings')} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/admin/web-chat-prompt" icon={MessageCircle} label={t('nav.webPrompt')} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/admin/facebook-chat-prompt" icon={Facebook} label={t('nav.facebookPrompt')} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/admin/blog" icon={Newspaper} label={t('nav.blog')} onClick={() => setIsMobileMenuOpen(false)} />

          {/* Spacer */}
          <div className="flex-1" />

          <LanguageSwitcher />

          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-primary/10 hover:text-primary dark:text-slate-400 transition-all w-full text-left mt-auto mb-2 group"
          >
            {theme === 'dark' ? <Sun size={20} className="group-hover:rotate-90 transition-transform duration-500" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform duration-500" />}
            <span className="font-medium">{theme === 'dark' ? t('lightMode', { ns: 'common' }) : t('darkMode', { ns: 'common' })}</span>
          </button>

          <button 
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all w-full text-left"
          >
            <LogOut size={20} />
            <span className="font-medium">{t('logout', { ns: 'common' })}</span>
          </button>
        </nav>

        <div className="mt-4 shrink-0 px-4 py-4 border-t border-slate-200 dark:border-slate-700/50">
          <div className="text-xs text-slate-500">
            v2.0.0 (Hybrid)
            <br />
            {t('status')}: <span className="text-emerald-500 dark:text-emerald-400">{t('online')}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0 z-10 relative">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-64px)] md:min-h-full">
            {children}
        </div>
      </main>
    </div>
  );
};
