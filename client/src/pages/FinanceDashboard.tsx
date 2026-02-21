import React, { useState } from 'react';
import { useFinance } from '../features/finance/hooks/useFinance';
import TopNavbar from "@/components/layout/TopNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Truck, Fuel, ShieldAlert, FileText, FileSpreadsheet, Calendar } from 'lucide-react';

export default function FinanceDashboard() {
  const { user } = useAuth();

  // 1️⃣ Global Date Control Setup (Step 8)
  // Maps strictly to URL Params via `useFinance` which re-triggers all dependent variables automatically.
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Extrapolate all dependent arrays securely
  const { dashboard, trends, fuelLogs, maintenanceLogs, roiData, isLoading } = useFinance(fromDate, toDate);

  if (user?.role !== "manager" && user?.role !== "finance") {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground p-6">
         <div className="text-center max-w-sm space-y-3">
           <ShieldAlert className="w-12 h-12 mx-auto text-destructive opacity-50" />
           <h2 className="text-xl font-bold mb-2">Restricted Access</h2>
           <p className="text-sm">Enterprise Ledgers are restricted to authorized financial roles only.</p>
         </div>
      </div>
    );
  }

  // Common Formatting Functions for the UI Grid
  const formatCurrency = (val: number) => `$${(val || 0).toLocaleString()}`;
  const formatMonthGraph = (val: string) => {
     if(!val) return "";
     const m = val.split('-')[1];
     if(!m) return val;
     const date = new Date();
     date.setMonth(parseInt(m) - 1);
     return date.toLocaleString('default', { month: 'short' });
  };

  const handleExport = async (type: 'csv' | 'pdf') => {
    try {
      const token = localStorage.getItem('fleetflow_token');
      const params = new URLSearchParams();
      if(fromDate) params.append('fromDate', fromDate);
      if(toDate) params.append('toDate', toDate);
      
      const response = await fetch(`http://localhost:5000/api/export/${type}?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`Failed to export ${type.toUpperCase()}`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fleetflow-finance.${type}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Error exporting document');
    }
  };

  // Render Skeleton while logic engine evaluates mathematical boundaries
  if (isLoading || !dashboard) {
    return (
      <>
        <TopNavbar title="Enterprise Ledger" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-background animate-pulse">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted/40 rounded-xl" />)}
           </div>
           <div className="h-80 bg-muted/30 rounded-xl" />
        </main>
      </>
    );
  }

  return (
    <>
      <TopNavbar title="Financial Intelligence" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-background relative selection:bg-indigo-500/30">
        
        {/* Actions Bar & Global Filtering 📅 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
           <div>
             <h2 className="text-lg font-bold text-foreground">Global Ledger</h2>
             <p className="text-sm text-muted-foreground">Monetary metrics mapping operational viability</p>
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
             
             {/* Date Bounds Inputs */}
             <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-muted/30 shrinks-0">
               <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
               <input 
                 type="date" 
                 className="bg-transparent text-sm p-1 outline-none text-muted-foreground focus:text-foreground"
                 value={fromDate} onChange={(e) => setFromDate(e.target.value)}
               />
               <span className="text-muted-foreground">-</span>
               <input 
                 type="date" 
                 className="bg-transparent text-sm p-1 outline-none text-muted-foreground focus:text-foreground"
                 value={toDate} onChange={(e) => setToDate(e.target.value)}
               />
               {(fromDate || toDate) && (
                 <button onClick={() => { setFromDate(''); setToDate(''); }} className="text-xs text-rose-500 hover:text-rose-600 px-2 font-medium">Reset</button>
               )}
             </div>

             {/* Export Actions (CSV / PDF) */}
             <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground whitespace-nowrap">
               <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export CSV
             </button>
             <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap">
               <FileText className="w-4 h-4" /> Generate PDF
             </button>
           </div>
        </div>

        {/* 1️⃣ KPI HEADER GRID (Financials Only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
           
           <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
             <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity"><TrendingUp className="w-32 h-32" /></div>
             <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
             </div>
             <h3 className="text-3xl font-bold">{formatCurrency(dashboard.totalRevenue)}</h3>
             <p className="text-xs text-muted-foreground flex items-center gap-1">Generated strictly via trip logic</p>
           </div>
           
           <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
             <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Activity className="w-32 h-32" /></div>
             <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Net Profit</p>
                <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg"><Activity className="w-5 h-5" /></div>
             </div>
             <h3 className="text-3xl font-bold text-indigo-500">{formatCurrency(dashboard.netProfit)}</h3>
             <p className="text-xs text-muted-foreground flex items-center gap-1">Rev - (Fuel + Maintenance)</p>
           </div>

           <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-rose-500/50 transition-colors">
             <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity"><ShieldAlert className="w-32 h-32" /></div>
             <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Operational Cost</p>
                <div className="p-2 bg-rose-500/10 text-rose-600 rounded-lg"><TrendingDown className="w-5 h-5" /></div>
             </div>
             <h3 className="text-3xl font-bold">{formatCurrency(dashboard.totalOperationalCost)}</h3>
             <p className="text-xs text-muted-foreground flex items-center gap-1 text-rose-500">Fuel: {formatCurrency(dashboard.totalFuelCost)} | Maint: {formatCurrency(dashboard.totalMaintenanceCost)}</p>
           </div>
           
           <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
             <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Fuel className="w-32 h-32" /></div>
             <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Average Cost/KM</p>
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg"><Truck className="w-5 h-5" /></div>
             </div>
             <h3 className="text-3xl font-bold">{formatCurrency(dashboard.costPerKM)} <span className="text-lg text-muted-foreground">/km</span></h3>
             <p className="text-xs text-muted-foreground flex items-center gap-1">Total operating capital by mapped distance</p>
           </div>
           
        </div>

        {/* 6️⃣ PROFITABILITY INSIGHTS */}
        {roiData?.insights && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/20 border rounded-xl p-4">
            <div className="space-y-1 border-r border-border/50 pr-4">
              <span className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">Most Profitable</span>
              <p className="text-sm font-medium truncate" title={roiData.insights.mostProfitable?.name || 'N/A'}>{roiData.insights.mostProfitable?.name || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(roiData.insights.mostProfitable?.val || 0)} Net</p>
            </div>
            <div className="space-y-1 border-r border-border/50 px-4">
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-widest">Highest Fuel Ops</span>
              <p className="text-sm font-medium truncate" title={roiData.insights.highestFuelConsumer?.name || 'N/A'}>{roiData.insights.highestFuelConsumer?.name || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(roiData.insights.highestFuelConsumer?.val || 0)} Total</p>
            </div>
            <div className="space-y-1 border-r md:border-border/50 border-transparent px-4">
              <span className="text-xs font-semibold text-rose-500 uppercase tracking-widest">Highest Repair Ops</span>
              <p className="text-sm font-medium truncate" title={roiData.insights.highestMaintenance?.name || 'N/A'}>{roiData.insights.highestMaintenance?.name || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(roiData.insights.highestMaintenance?.val || 0)} Total</p>
            </div>
            <div className="space-y-1 pl-4">
              <span className="text-xs font-semibold text-destructive uppercase tracking-widest">Lowest ROI</span>
              <p className="text-sm font-medium truncate" title={roiData.insights.lowestROI?.name || 'N/A'}>{roiData.insights.lowestROI?.name || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">{roiData.insights.lowestROI?.val || 0}% Relative</p>
            </div>
          </div>
        )}

        {/* 2️⃣ REVENUE VS COST TREND LINE CHART */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> Fiscal Timeline Mapping
          </h3>
          {(!trends || trends.length === 0) ? (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-xl opacity-60">Insufficient date ranges applied to build history module</div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tickFormatter={formatMonthGraph} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tickFormatter={(val) => `$${val/1000}k`} width={50} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [formatCurrency(value), '']}
                      labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Total Revenue" dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="fuelCost" stroke="#f59e0b" strokeWidth={2} name="Fuel Costs" dot={false} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="maintenanceCost" stroke="#ef4444" strokeWidth={2} name="Maintenance Costs" dot={false} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="netProfit" stroke="#6366f1" strokeWidth={3} name="Net Profit" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* DATA GRID TABLES LAYER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
           
           {/* 5️⃣ VEHICLE FINANCIAL PERFORMANCE TABLE */}
           <div className="bg-card border rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col h-[500px]">
             <h3 className="text-base font-bold mb-4 flex items-center gap-2 shrinks-0">
               <Truck className="w-5 h-5 text-indigo-500" /> Asset ROI Performance List
             </h3>
             <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
               {roiData?.vehicles.length === 0 ? <p className="text-sm text-muted-foreground p-4 text-center">No active vehicles found.</p> : (
                 <table className="w-full text-sm text-left">
                   <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0">
                     <tr>
                       <th className="px-4 py-3 font-medium rounded-tl-lg">Vehicle Context</th>
                       <th className="px-4 py-3 font-medium">CapEx</th>
                       <th className="px-4 py-3 font-medium">Rev vs Cost</th>
                       <th className="px-4 py-3 font-medium text-right rounded-tr-lg">ROI</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                     {roiData?.vehicles.map((v: any) => (
                       <tr key={v._id} className="hover:bg-muted/10 transition-colors">
                         <td className="px-4 py-3 font-medium text-foreground">{v.vehicleName}</td>
                         <td className="px-4 py-3 text-muted-foreground">{formatCurrency(v.acquisitionCost)}</td>
                         <td className="px-4 py-3">
                            <span className="text-emerald-500">{formatCurrency(v.totalRevenue)}</span><br/>
                            <span className="text-rose-500 text-xs text-muted-foreground">{formatCurrency(v.totalCost)}</span>
                         </td>
                         <td className="px-4 py-3 text-right font-medium">
                            <span className={v.ROI > 5 ? "text-emerald-500" : (v.ROI > 0 ? "text-amber-500" : "text-rose-500")}>{v.ROI}%</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
             </div>
           </div>

           {/* 3️⃣ FUEL LOGS & DISTANCE TABLE */}
           <div className="bg-card border rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col h-[500px]">
             <h3 className="text-base font-bold mb-4 flex items-center gap-2 shrinks-0">
               <Fuel className="w-5 h-5 text-blue-500" /> Distance Operating Ledgers
             </h3>
             <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
               {fuelLogs?.length === 0 ? <p className="text-sm text-muted-foreground p-4 text-center">No fuel logs matching timeframe.</p> : (
                 <table className="w-full text-sm text-left">
                   <thead className="text-xs text-muted-foreground bg-muted/50 sticky top-0">
                     <tr>
                       <th className="px-4 py-3 font-medium rounded-tl-lg">Date</th>
                       <th className="px-4 py-3 font-medium">Vehicle</th>
                       <th className="px-4 py-3 font-medium">Vol / Cost</th>
                       <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Cost per KM</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                     {fuelLogs?.map((l: any) => (
                       <tr key={l._id} className="hover:bg-muted/10 transition-colors">
                         <td className="px-4 py-3 text-muted-foreground">{new Date(l.date).toLocaleDateString()}</td>
                         <td className="px-4 py-3 font-medium max-w-[120px] truncate" title={l.vehicleName}>{l.vehicleName}</td>
                         <td className="px-4 py-3">
                            {l.liters}L <br/>
                            <span className="text-xs text-muted-foreground">{formatCurrency(l.cost)}</span>
                         </td>
                         <td className="px-4 py-3 text-right font-bold text-indigo-500">
                            {l.costPerKM > 0 ? formatCurrency(l.costPerKM) : 'N/A'}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
             </div>
           </div>

        </div>
      </main>
    </>
  );
}
