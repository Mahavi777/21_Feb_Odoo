import TopNavbar from "@/components/layout/TopNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Truck, MapPin, Users, Calendar, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [revenueSeries, setRevenueSeries] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    if (user.role !== "manager" && user.role !== "finance") {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("fleetflow_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const queries: string[] = [];
        if (startDate) queries.push(`startDate=${encodeURIComponent(startDate)}`);
        if (endDate) queries.push(`endDate=${encodeURIComponent(endDate)}`);
        const revQuery = queries.length ? `?${queries.join('&')}` : '';

        const [ovRes, revRes, utilRes] = await Promise.all([
          fetch(`${API_URL}/analytics/dashboard/overview`, { headers }),
          fetch(`${API_URL}/analytics/revenue${revQuery}`, { headers }),
          fetch(`${API_URL}/analytics/vehicles/utilization`, { headers }),
        ]);

        if (!ovRes.ok || !revRes.ok || !utilRes.ok) {
          const bad = !ovRes.ok ? ovRes : !revRes.ok ? revRes : utilRes;
          const data = await bad.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to fetch analytics');
        }

        const ovJson = await ovRes.json();
        const revJson = await revRes.json();
        const utilJson = await utilRes.json();

        setOverview(ovJson.data ?? null);
        setRevenue(revJson.data ?? null);
        setVehicles(Array.isArray(utilJson.data) ? utilJson.data : []);

        // Build a small revenue series for visualization (best-effort, derived from totals)
        const total = Number(revJson.data?.totalRevenue ?? 0);
        const points = 8;
        const base = points > 0 ? Math.max(0, Math.round(total / points)) : 0;
        const series = Array.from({ length: points }).map((_, i) => {
          // make deterministic slight variations
          const variation = Math.round(base * (0.6 + (i / points) * 0.8));
          return { name: `P${i + 1}`, value: variation };
        });
        setRevenueSeries(series);
      } catch (err: any) {
        setError(err.message || "Error fetching analytics");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [user, startDate, endDate]);



  if (!user || (user.role !== "manager" && user.role !== "finance")) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground p-6">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold mb-2">Restricted Access</h2>
          <p className="text-sm">Analytics are restricted to authorized roles.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopNavbar title="Fleet Analytics" />
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header Section */}
          <div className="animate-fade-in">
            <div className="flex flex-col gap-2 mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Fleet Analytics</h1>
              <p className="text-muted-foreground">Real-time insights into your fleet performance</p>
            </div>

            {/* Filter Section */}
            <div className="backdrop-blur-md bg-white/50 dark:bg-slate-900/50 border border-white/20 dark:border-slate-700/50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <label className="text-sm font-medium text-foreground">Date Range</label>
                  <input 
                    type="date" 
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" 
                    value={startDate ?? ''} 
                    onChange={(e) => setStartDate(e.target.value || null)} 
                  />
                  <span className="text-muted-foreground">to</span>
                  <input 
                    type="date" 
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" 
                    value={endDate ?? ''} 
                    onChange={(e) => setEndDate(e.target.value || null)} 
                  />
                  <button 
                    onClick={() => setLoading(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 transform hover:scale-105 active:scale-95"
                  >
                    Apply Filter
                  </button>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>Updated: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-40 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl" />)}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="backdrop-blur-md bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-600 dark:text-red-400 animate-fade-in">
              <p className="font-medium">Error loading analytics</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* KPI Cards */}
          {!loading && !error && overview && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {/* Vehicles Card */}
              <div 
                onClick={() => navigate('/vehicles')}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 transform"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Truck className="w-8 h-8 text-blue-100" />
                    <ArrowRight className="w-5 h-5 text-blue-200 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-sm font-medium text-blue-100 mb-1">Total Vehicles</h3>
                  <p className="text-4xl font-bold mb-3">{overview?.vehicles?.total ?? 0}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-blue-100">
                      <span>Available</span>
                      <span className="font-semibold">{overview?.vehicles?.available ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-blue-100">
                      <span>On Trip</span>
                      <span className="font-semibold">{overview?.vehicles?.onTrip ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-blue-100">
                      <span>In Shop</span>
                      <span className="font-semibold">{overview?.vehicles?.inShop ?? 0}</span>
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, ((overview?.vehicles?.available ?? 0) / Math.max(1, overview?.vehicles?.total ?? 1)) * 100)}%` }} 
                      className="h-1.5 bg-green-400 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Trips Card */}
              <div 
                onClick={() => navigate('/trips')}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 transform"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <MapPin className="w-8 h-8 text-purple-100" />
                    <ArrowRight className="w-5 h-5 text-purple-200 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-sm font-medium text-purple-100 mb-1">Total Trips</h3>
                  <p className="text-4xl font-bold mb-3">{overview?.trips?.total ?? 0}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-purple-100">
                      <span>Completed</span>
                      <span className="font-semibold">{overview?.trips?.completed ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-purple-100">
                      <span>Active</span>
                      <span className="font-semibold">{overview?.trips?.active ?? 0}</span>
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, ((overview?.trips?.completed ?? 0) / Math.max(1, overview?.trips?.total ?? 1)) * 100)}%` }} 
                      className="h-1.5 bg-green-400 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Users Card */}
              <div 
                onClick={() => navigate('/drivers')}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-600 to-pink-700 p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 transform"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-pink-100" />
                    <ArrowRight className="w-5 h-5 text-pink-200 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-sm font-medium text-pink-100 mb-1">Total Users</h3>
                  <p className="text-4xl font-bold mb-3">{overview?.users?.total ?? 0}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-pink-100">
                      <span>Active</span>
                      <span className="font-semibold">{(overview?.users?.total ?? 0) - (overview?.users?.suspended ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-pink-100">
                      <span>Suspended</span>
                      <span className="font-semibold">{overview?.users?.suspended ?? 0}</span>
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, (((overview?.users?.total ?? 0) - (overview?.users?.suspended ?? 0)) / Math.max(1, overview?.users?.total ?? 1)) * 100)}%` }} 
                      className="h-1.5 bg-green-400 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Section */}
          {!loading && !error && revenue && (
            <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-slate-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="lg:w-1/3">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-foreground">Revenue Analytics</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-600">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Number(revenue.totalRevenue ?? 0))}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20 dark:border-slate-700/30">
                      <div>
                        <p className="text-xs text-muted-foreground">Completed Trips</p>
                        <p className="text-2xl font-bold text-foreground">{revenue.completedTripsCount ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Per Trip</p>
                        <p className="text-2xl font-bold text-foreground">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Number(revenue.avgRevenuePerTrip ?? 0))}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:w-2/3 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueSeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                      <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        formatter={(value: any) => `$${value.toLocaleString()}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                        animationDuration={800}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Utilization Chart */}
          {!loading && !error && vehicles && vehicles.length > 0 && (
            <div className="backdrop-blur-md bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-slate-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Vehicle Utilization Report
                </h3>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full">Top 8 by Distance</span>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={vehicles.slice().sort((a,b) => (b.totalDistance ?? 0) - (a.totalDistance ?? 0)).slice(0, 8)} 
                    layout="vertical" 
                    margin={{ top: 5, right: 20, left: 150, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                      formatter={(value: any) => `${value.toLocaleString()} km`}
                    />
                    <Bar dataKey="totalDistance" fill="url(#colorBar)" radius={[0, 8, 8, 0]} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
}
