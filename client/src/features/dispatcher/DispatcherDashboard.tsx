import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNavbar from "@/components/layout/TopNavbar";
import KPICard from "@/components/KPICard";
import { useDispatcher } from "./hooks/useDispatcher";
import { ActiveTripsTable } from "./components/ActiveTripsTable";
import { CreateTripModal } from "./components/CreateTripModal";
import { TripDrawer } from "./components/TripDrawer";
import { Trip } from "./services/dispatcherApi";
import { Navigation, Clock, Truck, Users, PlusCircle, LayoutList } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

export default function DispatcherDashboard() {
  const navigate = useNavigate();
  const { trips, vehicles, drivers, stats, isLoading, error, createTrip, dispatchTrip, completeTrip, cancelTrip } = useDispatcher();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate Operational KPIs (Actionable Metrics only) from Real Backend Aggregation
  const activeTripsCount = stats?.activeTrips || 0;
  const pendingDraftsCount = stats?.draftTrips || 0;
  const availableVehiclesCount = stats?.availableVehicles || 0;
  const availableDriversCount = stats?.availableDrivers || 0;

  const TRIP_COLORS = {
    draft: "hsl(220, 13%, 50%)", 
    dispatched: "hsl(230, 80%, 65%)", 
    completed: "hsl(150, 70%, 40%)", 
    cancelled: "hsl(0, 80%, 55%)"
  };

  const VEHICLE_COLORS = {
    available: "hsl(150, 70%, 40%)", 
    onTrip: "hsl(230, 80%, 65%)", 
    maintenance: "hsl(0, 80%, 55%)"
  };

  return (
    <>
      <TopNavbar title="Dispatcher Command Center" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
        
        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium border border-destructive/20">
            {error}
          </div>
        )}

        {/* 🟦 SECTION 1 – KPI STRIP (Operational Focus Only) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Active Trips" value={activeTripsCount} icon={Navigation} trend={{ value: 2, label: "Started today" }} />
          <KPICard title="Pending Drafts" value={pendingDraftsCount} icon={Clock} trend={{ value: 0, label: "Awaiting dispatch" }} />
          <KPICard title="Available Vehicles" value={availableVehiclesCount} icon={Truck} trend={{ value: vehicles.length, label: "Total Fleet" }} />
          <KPICard title="Available Drivers" value={availableDriversCount} icon={Users} trend={{ value: drivers.length, label: "Total Roster" }} />
        </div>

        {/* 📊 SECTION 2 & 3 – Live Charts & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Quick Actions Panel */}
          <div className="lg:col-span-1 rounded-xl border bg-card p-6 shadow-sm flex flex-col space-y-4">
             <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Quick Actions</h3>
             
             <button 
               onClick={() => setIsCreateModalOpen(true)}
               className="flex items-center gap-3 w-full rounded-xl bg-indigo-600 px-4 py-4 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20"
             >
               <PlusCircle className="h-5 w-5" />
               Create New Trip
             </button>

             <div className="grid grid-cols-1 gap-2 pt-2">
               <button onClick={() => navigate('/trips')} className="flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors text-left text-muted-foreground">
                 <LayoutList className="h-4 w-4" /> View All Trips
               </button>
               <button onClick={() => navigate('/vehicles')} className="flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors text-left text-muted-foreground">
                 <Truck className="h-4 w-4" /> Browse Vehicles Library
               </button>
               <button onClick={() => navigate('/drivers')} className="flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors text-left text-muted-foreground">
                 <Users className="h-4 w-4" /> Manage Driver Duty
               </button>
             </div>
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="mb-4 text-xs font-semibold uppercase text-muted-foreground">Trip Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats?.tripStatusBreakdown || []}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}
                  >
                    <Cell fill={TRIP_COLORS.draft} />
                    <Cell fill={TRIP_COLORS.dispatched} />
                    <Cell fill={TRIP_COLORS.completed} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="mb-4 text-xs font-semibold uppercase text-muted-foreground">Vehicle Availability</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats?.vehicleAvailabilityBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* 📋 SECTION 4 – Active Trips Table */}
        <div className="rounded-xl shadow-sm border border-border">
          <div className="p-5 border-b border-border bg-card rounded-t-xl">
             <h3 className="font-semibold text-lg flex items-center gap-2">
               <Navigation className="h-5 w-5 text-indigo-500" /> Live Dispatch Queue
             </h3>
             <p className="text-sm text-muted-foreground mt-1">Manage active route progress and pending drafts.</p>
          </div>
          <ActiveTripsTable 
            trips={trips} 
            onTripClick={(trip) => setSelectedTrip(trip)} 
          />
        </div>

      </main>

      <CreateTripModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        vehicles={vehicles}
        drivers={drivers}
        onSubmit={createTrip}
      />

      <TripDrawer 
        trip={selectedTrip}
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        vehicles={vehicles}
        drivers={drivers}
        onDispatch={dispatchTrip}
        onComplete={completeTrip}
        onCancel={cancelTrip}
      />
    </>
  );
}
