"use client";

import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { 
  Users, PenTool, LayoutGrid, History, TrendingUp, TrendingDown, Calendar, ChevronRight, MoreHorizontal, User
} from 'lucide-react';
import Link from 'next/link';
import { SectionLoader } from "@/components/ui/Loader";

// Custom Tooltip for Recharts to match the dark theme perfectly
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#18181b] border border-white/10 p-3 rounded-lg shadow-xl font-sans">
        <p className="text-zinc-300 font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-zinc-400 capitalize">{entry.name}:</span>
            <span className="text-white font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "APPROVED": return "#10b981"; // Emerald
    case "PUBLISHED": return "#10b981"; // Emerald
    case "PENDING": return "#8b5cf6"; // Purple
    case "REJECTED": return "#ef4444"; // Red
    case "UNDER_OFFER": return "#3b82f6"; // Blue
    case "SOLD": return "#f59e0b"; // Amber
    default: return "#6b7280"; // Gray
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

const calcDelta = (curr: number, prev: number) => {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return Math.round(((curr - prev) / prev) * 100);
};

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [latestUsers, setLatestUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth-token") || sessionStorage.getItem("auth-token");
        
        const [statsRes, usersRes] = await Promise.all([
          fetch("/api/admin/dashboard-stats", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("/api/admin/latest-users", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        const statsData = await statsRes.json();
        const usersData = await usersRes.json();
        
        if (statsData.success) {
          setStats(statsData.data);
        }
        if (Array.isArray(usersData)) {
          setLatestUsers(usersData);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#09090b] min-h-screen">
        <SectionLoader height="h-full" message="Loading dashboard..." />
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const pieData = stats.listingStatusBreakdown.map((item: any) => ({
    name: item.name,
    value: item.value,
    color: getStatusColor(item.name)
  }));
  const totalPieValue = pieData.reduce((acc: number, curr: any) => acc + curr.value, 0);

  const todaySignupsDelta = calcDelta(stats.today.signups, stats.today.yesterdaySignups);
  const todayListingsDelta = calcDelta(stats.today.listings, stats.today.yesterdayListings);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-[#09090b] text-zinc-100 font-sans min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1">Welcome back — here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#18181b] border border-white/5 px-4 py-2 rounded-xl shadow-lg">
            <Calendar size={16} className="text-emerald-400" />
            <span className="text-sm font-medium text-zinc-200">{currentDate}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1 */}
          <Link href="/users" className="bg-[#18181b] border border-white/5 p-5 rounded-2xl shadow-xl shadow-black/20 flex flex-col relative overflow-hidden group hover:border-emerald-500/20 transition-colors cursor-pointer block">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <Users size={20} />
              </div>
              <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${stats.deltas.users >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                {stats.deltas.users >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(stats.deltas.users)}%
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{stats.totals.users}</h3>
              <p className="text-sm text-zinc-400 font-medium">Total Users</p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          </Link>

          {/* Card 2 */}
          <Link href="/listings" className="bg-[#18181b] border border-white/5 p-5 rounded-2xl shadow-xl shadow-black/20 flex flex-col relative overflow-hidden group hover:border-blue-500/20 transition-colors cursor-pointer block">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                <LayoutGrid size={20} />
              </div>
              <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${stats.deltas.listings >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                {stats.deltas.listings >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(stats.deltas.listings)}%
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{stats.totals.listings}</h3>
              <p className="text-sm text-zinc-400 font-medium">Total Listings</p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
          </Link>

          {/* Card 3 */}
          <Link href="/blog" className="bg-[#18181b] border border-white/5 p-5 rounded-2xl shadow-xl shadow-black/20 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors cursor-pointer block">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-zinc-800 rounded-xl text-zinc-300">
                <PenTool size={20} />
              </div>
              <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${stats.deltas.blogs >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                {stats.deltas.blogs >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(stats.deltas.blogs)}%
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{stats.totals.blogs}</h3>
              <p className="text-sm text-zinc-400 font-medium">Blog Posts</p>
            </div>
          </Link>

          {/* Card 4 */}
          <Link href="/moderator-assignments" className="bg-[#18181b] border border-white/5 p-5 rounded-2xl shadow-xl shadow-black/20 flex flex-col relative overflow-hidden group hover:border-purple-500/20 transition-colors cursor-pointer block">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
                <History size={20} />
              </div>
              <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${stats.deltas.pendingApprovals >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                {stats.deltas.pendingApprovals >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(stats.deltas.pendingApprovals)}%
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{stats.totals.pendingApprovals}</h3>
              <p className="text-sm text-zinc-400 font-medium">Pending Approvals</p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Line/Area Chart */}
          <div className="lg:col-span-2 bg-[#18181b] border border-white/5 p-5 sm:p-6 rounded-2xl shadow-xl shadow-black/20">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Overview</h2>
                <p className="text-sm text-zinc-400 mt-1">Users & listings over the last 6 months</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-1.5 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs text-zinc-400 font-medium">Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-xs text-zinc-400 font-medium">Listings</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-white tracking-tight">{stats.monthlyTrend.reduce((acc: number, curr: any) => acc + curr.users + curr.listings, 0)}</span>
              <span className="text-xs text-zinc-500 ml-2">Total actions (6 mo)</span>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    dx={-10}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="listings" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorListings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-[#18181b] border border-white/5 p-5 sm:p-6 rounded-2xl shadow-xl shadow-black/20 flex flex-col">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Listings by Status</h2>
              <p className="text-sm text-zinc-400 mt-1">Current distribution</p>
            </div>
            
            <div className="flex-1 relative min-h-[250px] flex flex-col justify-center items-center mt-4">
              {pieData.length > 0 ? (
                <>
                  <div className="absolute inset-0 z-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={70}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Center Text inside Donut */}
                  <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold text-white">{totalPieValue}</span>
                    <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Total</span>
                  </div>
                </>
              ) : (
                <div className="text-zinc-500 text-sm">No listings found</div>
              )}
            </div>

            {/* Custom Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-6 border-t border-white/5">
              {pieData.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}80` }}></div>
                  <span className="text-sm text-zinc-300 capitalize">{entry.name.toLowerCase()}</span>
                  <span className="text-sm font-semibold text-white ml-1">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Today's Activity Mini-cards */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#18181b] border border-white/5 p-5 rounded-2xl shadow-xl flex-1 flex flex-col justify-center relative overflow-hidden group">
              <p className="text-sm text-zinc-400 font-medium mb-1">New Signups (Today)</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-white">{stats.today.signups}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${todaySignupsDelta >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                  {todaySignupsDelta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {Math.abs(todaySignupsDelta)}%
                </span>
              </div>
              <div className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            <div className="bg-[#18181b] border border-white/5 p-5 rounded-2xl shadow-xl flex-1 flex flex-col justify-center relative overflow-hidden group">
              <p className="text-sm text-zinc-400 font-medium mb-1">New Listings (Today)</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-white">{stats.today.listings}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${todayListingsDelta >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                  {todayListingsDelta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {Math.abs(todayListingsDelta)}%
                </span>
              </div>
              <div className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          {/* Weekly Activity Bar Chart */}
          <div className="lg:col-span-2 bg-[#18181b] border border-white/5 p-5 sm:p-6 rounded-2xl shadow-xl">
             <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Weekly Activity</h2>
                <p className="text-sm text-zinc-400 mt-1">Signups & Listings this week</p>
              </div>
              <div className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-1.5 flex items-center gap-4 text-xs">
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-emerald-500"></div>Users</div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-blue-500"></div>Listings</div>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyActivity} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dx={-10} tickCount={5} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#27272a', opacity: 0.4}}/>
                  <Bar dataKey="users" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="listings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        <div className="bg-[#18181b] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Latest Users</h2>
              <p className="text-sm text-zinc-400 mt-1">Recently joined platform members</p>
            </div>
            <Link href="/users">
              <button className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                View all <ChevronRight size={16} />
              </button>
            </Link>
          </div>
          
          <div className="divide-y divide-white/5">
            {latestUsers.map((user) => (
              <div key={user.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  {user.image && user.image !== "/images/default-user-icon.png" ? (
                    <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 bg-zinc-800 shadow-inner`}>
                      <User size={18} />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{user.name}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  <span className="text-xs text-zinc-500 font-medium">{formatTimeAgo(user.createdAt)}</span>
                  <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 sm:block hidden">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            ))}
            {latestUsers.length === 0 && (
              <div className="p-6 text-center text-zinc-500 text-sm">
                No recent users found.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
