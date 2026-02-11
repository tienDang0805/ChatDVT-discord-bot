import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ScrollText, Settings, Bot, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-slate-700/50 flex flex-col p-4">
        <div className="flex items-center gap-3 px-4 py-6 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">EvoVerse AI</h1>
            <p className="text-xs text-slate-400">Hybrid Monolith Bot</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/prompts" icon={Bot} label="Prompts" />
          <NavItem to="/control" icon={LayoutDashboard} label="Control Center" />
          <NavItem to="/logs" icon={ScrollText} label="Chat Logs" />
          <NavItem to="/settings" icon={Settings} label="Identity & Config" />
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full text-left mt-auto"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </nav>

        <div className="mt-auto px-4 py-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-500">
            v2.0.0 (Hybrid)
            <br />
            Status: <span className="text-emerald-400">Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="max-w-7xl mx-auto p-8">
            {children}
        </div>
      </main>
    </div>
  );
};
