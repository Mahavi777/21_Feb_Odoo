import { Trip } from "../services/dispatcherApi";
import { Clock, Navigation, AlertCircle, CheckCircle2 } from "lucide-react";

interface ActiveTripsTableProps {
  trips: Trip[];
  onTripClick: (trip: Trip) => void;
}

const statusColors = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  dispatched: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

const statusIcons = {
  draft: Clock,
  dispatched: Navigation,
  completed: CheckCircle2,
  cancelled: AlertCircle
};

export function ActiveTripsTable({ trips, onTripClick }: ActiveTripsTableProps) {
  // Only show Dispatched and Draft in Active table
  const activeTrips = trips.filter(t => t.status === "dispatched" || t.status === "draft");

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Trip ID</th>
              <th className="px-6 py-4 font-medium">Vehicle</th>
              <th className="px-6 py-4 font-medium">Driver</th>
              <th className="px-6 py-4 font-medium">Cargo</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Time (Created)</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activeTrips.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No active or draft trips. Create a new trip to get started.
                </td>
              </tr>
            ) : (
              activeTrips.map((trip) => {
                const Icon = statusIcons[trip.status];
                return (
                  <tr 
                    key={trip.id} 
                    onClick={() => onTripClick(trip)}
                    className="group transition-colors hover:bg-muted/30 cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        ...{trip.id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {trip.vehicleId?.name || trip.vehicleId?.licensePlate || "Unknown Vehicle"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {trip.driverId?.name || "Unknown Driver"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{trip.cargoWeight?.toLocaleString() || 0} lbs</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[trip.status]}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }).format(new Date(trip.createdAt))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary/80">
                        View Details
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
  );
}
