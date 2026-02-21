import { useNavigate } from "react-router-dom";
import TopNavbar from "@/components/layout/TopNavbar";
import KPICard from "@/components/KPICard";
import { useManagerData } from "./hooks/useManagerData";
import { Navigation, Truck, TrendingUp, AlertTriangle, DollarSign, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { dashboardMetrics, analytics, isLoading, error } = useManagerData();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const {
    totalFleet = 0,
    activeFleet = 0,
    vehiclesInShop = 0,
    retiredVehicles = 0,
    utilizationRate = 0,
    averageCostPerKM = 0
  } = dashboardMetrics || {};

  const {
    globalROI = 0,
    monthlyCostTrend = []
  } = analytics || {};

  const fleetStatusData = [
    { name: 'Active', value: activeFleet, color: 'hsl(150, 70%, 40%)' },
    { name: 'In Shop', value: vehiclesInShop, color: 'hsl(0, 80%, 55%)' },
    { name: 'Retired', value: retiredVehicles, color: 'hsl(220, 13%, 50%)' }
  ].filter(d => d.value > 0);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedTrendData = monthlyCostTrend.map((m: any) => ({
    name: monthNames[m.month - 1] || m.month,
    cost: m.cost
  }));

  return (
    <>
      <TopNavbar title="Fleet Manager Overview" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
        
        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium border border-destructive/20">
            {error}
          </div>
        )}

        {/* 🟦 SECTION 1 – KPI STRIP */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Fleet" value={totalFleet} icon={Truck} trend={{ value: activeFleet, label: "Active currently" }} />
          <KPICard title="Utilization Rate" value={`${utilizationRate}%`} icon={Activity} trend={{ value: utilizationRate > 80 ? 1 : -1, label: utilizationRate > 80 ? 'Optimal' : 'Needs attention' }} />
          <KPICard title="Cost per KM" value={`$${averageCostPerKM}`} icon={DollarSign} trend={{ value: 0, label: "Operational avg" }} />
          <KPICard title="Global Fleet ROI" value={`${globalROI}%`} icon={TrendingUp} trend={{ value: globalROI > 0 ? 5 : -5, label: "Return on acquisition" }} />
        </div>

        {/* 📊 SECTION 2 & 3 – Live Charts & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Action Hub */}
          <div className="lg:col-span-1 rounded-xl border bg-card p-6 shadow-sm flex flex-col space-y-4">
             <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Management Controls</h3>
             
             <button 
               onClick={() => navigate('/vehicles')}
               className="flex items-center gap-3 w-full rounded-xl bg-indigo-600 px-4 py-4 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20"
             >
               <Truck className="h-5 w-5" />
               Vehicle Registry
             </button>

             <div className="grid grid-cols-1 gap-2 pt-2">
               <button onClick={() => navigate('/maintenance')} className="flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors text-left text-muted-foreground">
                 <AlertTriangle className="h-4 w-4" /> Log Maintenance
               </button>
               <button onClick={() => navigate('/trips')} className="flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors text-left text-muted-foreground">
                 <Navigation className="h-4 w-4" /> Trip Oversight
               </button>
             </div>
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="mb-4 text-xs font-semibold uppercase text-muted-foreground">Fleet Health Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={fleetStatusData}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}
                  >
                    {fleetStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="mb-4 text-xs font-semibold uppercase text-muted-foreground">Maintenance Cost Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={formattedTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="cost" stroke="hsl(0, 80%, 55%)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </main>
    </>
  );
}
