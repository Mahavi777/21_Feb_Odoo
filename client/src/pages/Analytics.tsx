import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import TopNavbar from "@/components/layout/TopNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Truck, Fuel, ShieldAlert, FileText, FileSpreadsheet } from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  
  if (user?.role !== "manager" && user?.role !== "finance") {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground p-6">
         <div className="text-center max-w-sm space-y-3">
           <ShieldAlert className="w-12 h-12 mx-auto text-destructive opacity-50" />
           <h2 className="text-xl font-bold mb-2">Restricted Access</h2>
           <p className="text-sm">Financial Analytics are restricted to Manager and Finance roles.</p>
         </div>
      </div>
    );
  }

  // Generate binary blobs securely mapping to token auth
  const handleExport = async (type: 'csv' | 'pdf') => {
    try {
      const token = localStorage.getItem('fleetflow_token');
      const response = await fetch(`http://localhost:5000/api/export/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error(`Failed to export ${type.toUpperCase()}`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fleetflow-report.${type}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Error exporting document');
    }
  };

  /**
   * DATA FETCHING - Uses Tanstack Query to manage caching, refetches, and realtime syncs
   * API endpoints target the new Analytics pipelines built on Mongoose aggregate natively.
   */
  const fetchAuth = async (path: string) => {
    const res = await fetch(`http://localhost:5000${path}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('fleetflow_token')}` }
    });
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    const payload = await res.json();
    return payload.data;
  };

  const { data: fleet, isLoading: loadingFleet } = useQuery({ queryKey: ['analytics', 'fleet'], queryFn: () => fetchAuth('/api/analytics/fleet') });
  const { data: vehicles, isLoading: loadingVehs } = useQuery({ queryKey: ['analytics', 'vehicles'], queryFn: () => fetchAuth('/api/analytics/vehicles') });
  const { data: monthly, isLoading: loadingMonthly } = useQuery({ queryKey: ['analytics', 'monthly'], queryFn: () => fetchAuth('/api/analytics/monthly') });

  const isLoading = loadingFleet || loadingVehs || loadingMonthly;

  // Render Skeleton while loading
  if (isLoading || !fleet) {
    return (
      <>
        <TopNavbar title="Operational Analytics" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-background animate-pulse">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted/40 rounded-xl" />)}
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-muted/30 rounded-xl" />
              <div className="h-80 bg-muted/30 rounded-xl" />
           </div>
        </main>
      </>
    );
  }

  // Common Formatting Functions for the UI Grid
  const formatCurrency = (val: number) => `$${(val || 0).toLocaleString()}`;
  
  // Format MM numeric string back into shorthand Month word (e.g., 2026-02 -> Feb)
  const formatMonthGraph = (val: string) => {
     if(!val) return "";
     const m = val.split('-')[1];
     if(!m) return val;
     const date = new Date();
     date.setMonth(parseInt(m) - 1);
     return date.toLocaleString('default', { month: 'short' });
  };

  // Safe global checks to avoid Div-By-0 in dynamic frontend environment tracking ROI array
  const totalFleetRoi = fleet.totalOperationalCost > 0 ? ((fleet.totalRevenue - fleet.totalOperationalCost) / fleet.totalOperationalCost) * 100 : 0;

  return (
    <>
      <TopNavbar title="Operational Analytics & Financial KPI" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-background relative">
        
        {/* Actions Bar */}
        <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
           <div>
             <h2 className="text-lg font-bold text-foreground">Performance Overview</h2>
             <p className="text-sm text-muted-foreground">Fleet-wide financial and operational metrics computed from live aggregations</p>
           </div>
           <div className="flex items-center gap-3">
             <button 
               onClick={() => handleExport('csv')}
               className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground"
             >
               <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
               Export CSV
             </button>
             <button 
               onClick={() => handleExport('pdf')}
               className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
             >
               <FileText className="w-4 h-4" />
               Generate PDF
             </button>
           </div>
        </div>

        {/* Dynamic Empty States for New Clusters */}
        {fleet.totalTrips === 0 && (
          <div className="p-8 my-8 text-center bg-card rounded-2xl border shadow-sm">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-muted-foreground" />
             </div>
             <h3 className="text-lg font-bold text-foreground">No Analytics Data Yet</h3>
             <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">Complete trips, record fuel logs, and file maintenance tickets to begin tracking financial trends.</p>
          </div>
        )}

        {/* KPI Header Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
           
           <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
             <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity"><TrendingUp className="w-32 h-32" /></div>
             <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
             </div>
             <h3 className="text-3xl font-bold">{formatCurrency(fleet.totalRevenue)}</h3>
             <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-emerald-500 font-medium">Lifetime Returns</span>
             </p>
           </div>
           
           <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
             <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Activity className="w-32 h-32" /></div>
             <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Est. Global ROI</p>
                <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg"><Activity className="w-5 h-5" /></div>
             </div>
             <h3 className="text-3xl font-bold">{totalFleetRoi.toFixed(2)}%</h3>
             <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={totalFleetRoi > 10 ? "text-emerald-500 font-medium" : totalFleetRoi > 0 ? "text-amber-500 font-medium" : "text-destructive font-medium"}>
                  {totalFleetRoi > 10 ? 'Positive' : totalFleetRoi > 0 ? 'Watching' : 'Negative'}
                </span> return on operating costs
             </p>
           </div>
           
           <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
             <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Fuel className="w-32 h-32" /></div>
             <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Fleet Efficiency</p>
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg"><Fuel className="w-5 h-5" /></div>
             </div>
             <h3 className="text-3xl font-bold">{fleet.fleetFuelEfficiency || 0} <span className="text-lg text-muted-foreground">km/L</span></h3>
             <p className="text-xs text-muted-foreground flex items-center gap-1">
                 Avg cost: <span className="font-semibold">{formatCurrency(fleet.averageCostPerKM)}/km</span>
             </p>
           </div>
           
           <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-rose-500/50 transition-colors">
             <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity"><ShieldAlert className="w-32 h-32" /></div>
             <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Operational Cost</p>
                <div className="p-2 bg-rose-500/10 text-rose-600 rounded-lg"><TrendingDown className="w-5 h-5" /></div>
             </div>
             <h3 className="text-3xl font-bold">{formatCurrency(fleet.totalOperationalCost)}</h3>
             <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-rose-500 font-medium">Fuel + Maint</span> merged
             </p>
           </div>
           
        </div>

        {/* Charts Row */}
        {fleet.totalTrips > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
             
             {/* Revenue vs Cost Area Chart (MONTHLY AGGREGATES) */}
             <div className="bg-card border rounded-2xl p-6 shadow-sm">
               <h3 className="text-base font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" /> Revenue vs Cost Tracking
               </h3>
               {(!monthly || monthly.length === 0) ? (
                 <div className="h-72 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-xl">Insufficient Data Points over Time</div>
               ) : (
                 <div className="h-72">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                       <defs>
                         <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                         </linearGradient>
                         <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                       <XAxis dataKey="month" tickFormatter={formatMonthGraph} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                       <YAxis tickFormatter={(val) => `$${val/1000}k`} width={50} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                       <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [formatCurrency(value), '']}
                          labelFormatter={(label) => `Period: ${label}`}
                       />
                       <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} name="Total Revenue" />
                       <Area type="monotone" dataKey="totalCost" stroke="#ef4444" fillOpacity={1} fill="url(#colorCost)" strokeWidth={2} name="Total Cost" />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
               )}
             </div>
  
             {/* Vehicle ROI Bar Chart (VEHICLE AGGREGATES) */}
             <div className="bg-card border rounded-2xl p-6 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-base font-bold flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-500" /> Vehicle ROI Performance
                 </h3>
                 <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">Top 10 Vehicles</span>
               </div>
               
               {(!vehicles || vehicles.length === 0) ? (
                 <div className="h-72 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-xl">No Vehicle ROI Data Available</div>
               ) : (
                 <div className="h-72">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={vehicles.slice(0, 10)} margin={{ top: 10, right: 30, left: -20, bottom: 0 }} layout="vertical">
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                       <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                       <YAxis dataKey="vehicleName" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} width={140} />
                       <RechartsTooltip 
                          cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          formatter={(value: number, name: string, props: any) => [`${value}% ROI (${formatCurrency(props.payload.totalRevenue)} Rev)`, '']}
                          labelFormatter={(l) => String(l).substring(0, 25)}
                       />
                       <Bar dataKey="ROI" radius={[0, 4, 4, 0]} barSize={20}>
                          {
                            vehicles.slice(0, 10).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.ROI > 0 ? '#10b981' : '#ef4444'} />
                            ))
                          }
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               )}
             </div>
  
          </div>
        )}

      </main>
    </>
  );
}
