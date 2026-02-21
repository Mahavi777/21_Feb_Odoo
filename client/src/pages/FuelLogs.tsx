import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import TopNavbar from '@/components/layout/TopNavbar';
import { Search, MapPin, Package, Calendar, Fuel, DollarSign, Activity, Settings, TrendingUp } from 'lucide-react';

interface FuelLogParams {
  startDate?: string;
  endDate?: string;
  vehicleId?: string;
}

export default function FuelLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FuelLogParams>({});
  
  // Fuel Logs Query
  const { data: fuelLogsResponse, isLoading: logsLoading } = useQuery({
    queryKey: ['fuel-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);
      
      const qs = params.toString();
      const res = await fetch(`http://localhost:5000/api/fuel${qs ? `?${qs}` : ''}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('fleetflow_token') || localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to load fuel records');
      return res.json();
    },
  });

  // Maintenance query (to show alongside fuel expenses)
  const { data: maintenanceResponse, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['maintenance-logs'],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/api/maintenance`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('fleetflow_token') || localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to load maintenance records');
      return res.json();
    },
  });

  const fuelLogs = fuelLogsResponse?.data || [];
  const maintenanceLogs = maintenanceResponse?.data || [];

  const searchedLogs = useMemo(() => {
    return fuelLogs.filter((log: any) => 
      (log.vehicleId?.licensePlate && log.vehicleId.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.tripId && String(log.tripId).includes(searchTerm))
    );
  }, [fuelLogs, searchTerm]);

  return (
    <>
      <TopNavbar title="Fleet Expenses & Logs" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-background relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 -z-10 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        </div>

        {/* Dashboard Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Fuel className="h-6 w-6" /></div>
            <div>
               <p className="text-sm text-muted-foreground font-medium">Logged Fuel (30d)</p>
               <h3 className="text-2xl font-bold">{fuelLogs.reduce((acc: number, log: any) => acc + (log.liters || 0), 0).toLocaleString()} L</h3>
            </div>
          </div>
          <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><DollarSign className="h-6 w-6" /></div>
            <div>
               <p className="text-sm text-muted-foreground font-medium">Total Fuel Expense</p>
               <h3 className="text-2xl font-bold">${fuelLogs.reduce((acc: number, log: any) => acc + (log.cost || 0), 0).toLocaleString()}</h3>
            </div>
          </div>
          <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Settings className="h-6 w-6" /></div>
            <div>
               <p className="text-sm text-muted-foreground font-medium">Maintenance Costs</p>
               <h3 className="text-2xl font-bold">${maintenanceLogs.reduce((acc: number, log: any) => acc + (log.cost || 0), 0).toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Fuel Logs Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl shadow-sm border">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2"><Fuel className="h-5 w-5 text-primary" /> Fuel Activity Log</h2>
              <p className="text-sm text-muted-foreground">Detailed records of all vehicle refueling instances tied to trips.</p>
            </div>
            <div className="relative w-full sm:w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <input 
                 type="text" 
                 placeholder="Search by license plate or trip ID..." 
                 className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
          </div>

           <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                 <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                   <tr>
                     <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Date</th>
                     <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Vehicle</th>
                     <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Trip Link</th>
                     <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Volume</th>
                     <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Total Cost</th>
                     <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider text-right">Cost / Liter</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                   {logsLoading ? (
                     <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Loading fuel ledgers...</td></tr>
                   ) : searchedLogs.length === 0 ? (
                     <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No fuel records logged in the system.</td></tr>
                   ) : (
                     searchedLogs.map((log: any) => {
                       const costPerLiter = log.liters > 0 ? (log.cost / log.liters).toFixed(2) : 0;
                       return (
                         <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-2 text-foreground font-medium">
                               <Calendar className="h-4 w-4 text-muted-foreground" />
                               {new Date(log.date || log.createdAt).toLocaleDateString()}
                             </div>
                           </td>
                           <td className="px-6 py-4">
                             <span className="font-semibold text-foreground">{log.vehicleId?.licensePlate || 'Unknown Vehicle'}</span>
                             {log.vehicleId?.name && <p className="text-xs text-muted-foreground">{log.vehicleId.name}</p>}
                           </td>
                           <td className="px-6 py-4">
                             <span className="font-mono text-xs bg-muted px-2 py-1 rounded w-fit inline-block">
                               ...{String(log.tripId).slice(-6).toUpperCase()}
                             </span>
                           </td>
                           <td className="px-6 py-4 font-medium text-foreground">{log.liters?.toLocaleString()} L</td>
                           <td className="px-6 py-4 font-semibold text-emerald-600">${log.cost?.toLocaleString()}</td>
                           <td className="px-6 py-4 text-right font-medium text-muted-foreground">${costPerLiter} / L</td>
                         </tr>
                       );
                     })
                   )}
                 </tbody>
               </table>
             </div>
           </div>
        </div>

        {/* Recent Maintenance Section */}
        <div className="pt-8">
           <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><Settings className="h-5 w-5 text-amber-500" /> Recent Maintenance Logs</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {maintenanceLoading ? (
                 <div className="col-span-full py-8 text-center text-muted-foreground animate-pulse border bg-card rounded-xl">Loading maintenance logs...</div>
              ) : maintenanceLogs.slice(0, 6).map((log: any) => (
                 <div key={log._id} className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="font-semibold">{log.vehicleId?.licensePlate || 'Vehicle'}</p>
                          <p className="text-xs text-muted-foreground">{log.type}</p>
                       </div>
                       <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${log.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                         {log.status}
                       </span>
                    </div>
                    <p className="text-sm text-foreground">{log.description}</p>
                    <div className="flex justify-between items-center pt-2 border-t text-sm">
                       <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(log.date || log.createdAt).toLocaleDateString()}</span>
                       <span className="font-bold text-foreground">${log.cost?.toLocaleString() || 0}</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </main>
    </>
  );
}
