import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, MessageSquare, Zap, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { getDashboardStats, getGuilds, getTopUsers, getActivityHistory, getUsageDistribution } from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-surface p-6 rounded-2xl border border-slate-700/50 shadow-sm relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={64} className={`text-${color}-500`} />
    </div>
    <div className="flex items-start justify-between mb-4 relative z-10">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="w-full bg-slate-700/30 h-1.5 rounded-full overflow-hidden relative z-10">
        <div className={`h-full bg-${color}-500 w-[70%] shadow-[0_0_10px_rgba(var(--${color}-500),0.5)]`}></div> 
    </div>
  </motion.div>
);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const Dashboard = () => {
  const [stats, setStats] = useState<any>({ totalUsers: 0, messagesToday: 0, avgResponseTime: "0s", uptime: 0 });
  const [guilds, setGuilds] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [usageDistribution, setUsageDistribution] = useState<any[]>([]);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const [statsData, guildsData, usersData, activityData, usageData] = await Promise.all([
                  getDashboardStats(),
                  getGuilds(),
                  getTopUsers(),
                  getActivityHistory(),
                  getUsageDistribution()
              ]);
              setStats(statsData);
              setGuilds(guildsData);
              setTopUsers(usersData);
              setActivityHistory(activityData);
              setUsageDistribution(usageData);
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
    <div className="space-y-8 pb-8">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          System Overview
        </h2>
        <p className="text-slate-400 mt-2">Real-time metrics from your bot instance.</p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" delay={0.1} />
        <StatCard title="Messages Today" value={stats.messagesToday} icon={MessageSquare} color="emerald" delay={0.2} />
        <StatCard title="Active Servers" value={guilds.length} icon={Zap} color="amber" delay={0.3} />
        <StatCard title="Uptime" value={formatUptime(stats.uptime)} icon={Activity} color="violet" delay={0.4} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Activity Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-surface rounded-2xl border border-slate-700/50 p-6 shadow-lg shadow-black/20"
          >
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><TrendingUp size={20} /></div>
                  <h3 className="text-lg font-bold text-white">Activity Trends (7 Days)</h3>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityHistory}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </motion.div>

          {/* Distribution Pie Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-surface rounded-2xl border border-slate-700/50 p-6 shadow-lg shadow-black/20"
          >
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><PieIcon size={20} /></div>
                  <h3 className="text-lg font-bold text-white">Usage Distribution</h3>
              </div>
              <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={usageDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {usageDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Legend Overlay or Center Text could go here */}
                <div className="absolute bottom-0 left-0 w-full flex justify-center gap-4 text-xs text-slate-400">
                    {usageDistribution.slice(0, 3).map((entry, index) => (
                        <div key={index} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            {entry.name}
                        </div>
                    ))}
                </div>
              </div>
          </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connected Servers */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-surface rounded-2xl border border-slate-700/50 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Connected Servers</h3>
              <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">{guilds.length} Active</span>
            </div>
            <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
               {guilds.map((guild) => (
                   <div key={guild.id} className="flex items-center gap-4 p-3 rounded-xl bg-background/50 hover:bg-slate-700/50 transition-colors">
                       {guild.icon ? (
                           <img src={guild.icon} alt={guild.name} className="w-10 h-10 rounded-full" />
                       ) : (
                           <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold">
                               {guild.name.charAt(0)}
                           </div>
                       )}
                       <div>
                           <h4 className="font-medium text-white">{guild.name}</h4>
                           <p className="text-xs text-slate-400">{guild.memberCount} members</p>
                       </div>
                   </div>
               ))}
               {guilds.length === 0 && <p className="text-slate-500 text-center py-4">No servers connected.</p>}
            </div>
          </motion.div>

          {/* Top Users */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-surface rounded-2xl border border-slate-700/50 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="font-bold text-lg text-white text-emerald-400">Top Active Users</h3>
            </div>
            <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {topUsers.map((user, index) => (
                    <div key={user._id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>
                                {index + 1}
                            </span>
                            <div>
                                <h4 className="font-medium text-white">{user.username || `User ${user._id.slice(0, 5)}...`}</h4>
                                <p className="text-xs text-slate-500">Last active: {new Date(user.lastActive).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-emerald-400 font-bold">{user.count}</span>
                            <p className="text-xs text-slate-500">msgs</p>
                        </div>
                    </div>
                ))}
            </div>
          </motion.div>
      </div>
    </div>
  );
};
