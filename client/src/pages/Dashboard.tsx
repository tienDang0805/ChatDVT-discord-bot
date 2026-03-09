import React, { useEffect, useState } from 'react';
import { Activity, Users, MessageSquare, Zap } from 'lucide-react';
import { getDashboardStats, getGuilds, getTopUsers } from '../api';
const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-surface/80 p-6 rounded-3xl border border-slate-200 dark:border-white/5 relative overflow-hidden group ring-1 ring-black/5">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={64} className={`text-${color}-600 dark:text-${color}-500`} />
    </div>
    <div className="flex items-start justify-between mb-4 relative z-10">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600 dark:bg-${color}-500/10 dark:text-${color}-400`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="w-full bg-slate-200 dark:bg-slate-700/30 h-1.5 rounded-full overflow-hidden relative z-10">
        <div className={`h-full bg-${color}-500 w-[70%] shadow-[0_0_15px_rgba(var(--color-${color}),0.8)]`}></div> 
    </div>
  </div>
);

export const Dashboard = () => {
  const [stats, setStats] = useState<any>({ totalUsers: 0, messagesToday: 0, avgResponseTime: "0s", uptime: 0 });
  const [guilds, setGuilds] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const [statsData, guildsData, usersData] = await Promise.all([
                  getDashboardStats(),
                  getGuilds(),
                  getTopUsers()
              ]);
              setStats(statsData);
              setGuilds(guildsData);
              setTopUsers(usersData);
          } catch (err) {
              console.error("Failed to fetch dashboard data", err);
          }
      };
      
      fetchData();
      const interval = setInterval(fetchData, 15000); 
      return () => clearInterval(interval);
  }, []);
  
  const formatUptime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      <div className="px-2 md:px-0">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-slate-500 dark:to-slate-400 bg-clip-text text-transparent">
          System Overview
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Real-time metrics from your bot instance.</p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
        <StatCard title="Messages Today" value={stats.messagesToday} icon={MessageSquare} color="emerald" />
        <StatCard title="Active Servers" value={guilds.length} icon={Zap} color="amber" />
        <StatCard title="Uptime" value={formatUptime(stats.uptime)} icon={Activity} color="violet" />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connected Servers */}
          <div className="bg-surface/80 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden ring-1 ring-black/5">
            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-foreground">Connected Servers</h3>
              <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary dark:bg-primary/20">{guilds.length} Active</span>
            </div>
            <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
               {guilds.map((guild) => (
                   <div key={guild.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-background/50 dark:hover:bg-slate-700/50 transition-colors">
                       {guild.icon ? (
                           <img src={guild.icon} alt={guild.name} className="w-10 h-10 rounded-full" />
                       ) : (
                           <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-600 flex items-center justify-center dark:text-foreground font-bold">
                               {guild.name.charAt(0)}
                           </div>
                       )}
                       <div>
                           <h4 className="font-medium text-foreground">{guild.name}</h4>
                           <p className="text-xs text-slate-500 dark:text-slate-400">{guild.memberCount} members</p>
                       </div>
                   </div>
               ))}
               {guilds.length === 0 && <p className="text-slate-500 text-center py-4">No servers connected.</p>}
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-surface/80 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden ring-1 ring-black/5">
            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700/50">
              <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">Top Active Users</h3>
            </div>
            <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {topUsers.map((user, index) => (
                    <div key={user._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-background/50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                {index + 1}
                            </span>
                            <div>
                                <h4 className="font-medium text-foreground">{user.username || `User ${user._id.slice(0, 5)}...`}</h4>
                                <p className="text-xs text-slate-500">Last active: {new Date(user.lastActive).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{user.count}</span>
                            <p className="text-xs text-slate-500">msgs</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      </div>
    </div>
  );
};
