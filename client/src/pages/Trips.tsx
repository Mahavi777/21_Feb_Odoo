import { useState } from "react";
import TopNavbar from "@/components/layout/TopNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { TripOversight } from "@/features/manager/TripOversight";
import { useDispatcher } from "@/features/dispatcher/hooks/useDispatcher";
import { ActiveTripsTable } from "@/features/dispatcher/components/ActiveTripsTable";
import { CreateTripModal } from "@/features/dispatcher/components/CreateTripModal";
import { TripDrawer } from "@/features/dispatcher/components/TripDrawer";
import { Trip } from "@/features/dispatcher/services/dispatcherApi";
import { Plus } from "lucide-react";

export default function Trips() {
  const { user } = useAuth();
  
  if (user?.role === "manager") {
    return <TripOversight />;
  }

  // Dispatcher live data hook
  const { trips, vehicles, drivers, isLoading, error, createTrip, dispatchTrip, completeTrip, cancelTrip } = useDispatcher();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center p-4 bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <TopNavbar title="Trip Dispatcher" />
      <main className="flex-1 overflow-y-auto p-6 space-y-4 animate-fade-in">
        
        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium border border-destructive/20">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{trips.length} total trips</p>
          <button 
            onClick={() => setIsAddOpen(true)} 
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Create Trip
          </button>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
           <ActiveTripsTable 
             trips={trips} 
             onTripClick={(trip) => setSelectedTrip(trip)} 
           />
        </div>

        <CreateTripModal 
          isOpen={isAddOpen} 
          onClose={() => setIsAddOpen(false)} 
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
      </main>
    </>
  );
}
