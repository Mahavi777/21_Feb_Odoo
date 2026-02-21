import { useState, useMemo } from "react";
import TopNavbar from "@/components/layout/TopNavbar";
import { useManagerData } from "./hooks/useManagerData";
import { ManagerTripDrawer } from "./components/ManagerTripDrawer";
import { Search, Navigation, AlertCircle, CheckCircle2, Package, Clock } from "lucide-react";

export function TripOversight() {
  const { trips, vehicles, drivers, isLoading, cancelTrip } = useManagerData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const vName = typeof t.vehicleId === 'object' ? t.vehicleId?.licensePlate : '';
      const matchSearch = String(t._id).includes(searchTerm) || (vName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [trips, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "dispatched": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400";
      case "completed": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "cancelled": return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
      default: return "";
    }
  };

  const statusIcons: Record<string, any> = {
    draft: Clock,
    dispatched: Navigation,
    completed: CheckCircle2,
    cancelled: AlertCircle
  };

  return (
    <>
      <TopNavbar title="Trip Oversight" />
      <main className="flex-1 overflow-y-auto p-6 animate-fade-in space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl shadow-sm border">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search trip ID or License..." 
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="dispatched">Dispatched</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Trip ID</th>
                  <th className="px-6 py-4 font-medium">Vehicle</th>
                  <th className="px-6 py-4 font-medium">Driver</th>
                  <th className="px-6 py-4 font-medium">Revenue</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Loading trips...</td></tr>
                ) : filteredTrips.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No trips found matching criteria.</td></tr>
                ) : (
                  filteredTrips.map((trip) => {
                    const Icon = statusIcons[trip.status] || Package;
                    return (
                      <tr 
                        key={trip._id} 
                        onClick={() => setSelectedTrip(trip)}
                        className="group transition-colors hover:bg-muted/30 cursor-pointer"
                      >
                        <td className="px-6 py-4 font-medium text-foreground font-mono">{String(trip._id).slice(-6)}</td>
                        <td className="px-6 py-4 font-medium text-foreground">{trip.vehicleId?.licensePlate || trip.vehicleId}</td>
                        <td className="px-6 py-4 text-muted-foreground">{trip.driverId?.name || trip.driverId}</td>
                        <td className="px-6 py-4 text-emerald-600 font-medium">${trip.revenue?.toLocaleString() || 0}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusColor(trip.status)}`}>
                            <Icon className="h-3.5 w-3.5" />
                            {trip.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(trip.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary/80">
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ManagerTripDrawer 
        trip={selectedTrip}
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        vehicles={vehicles}
        drivers={drivers}
        onCancel={cancelTrip}
      />
    </>
  );
}
