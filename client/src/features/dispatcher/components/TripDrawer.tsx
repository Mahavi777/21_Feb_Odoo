import { useState } from "react";
import { X, MapPin, Package, User, Truck, Calendar, Loader2, Navigation, AlertCircle, CheckCircle2 } from "lucide-react";
import { Trip, Vehicle, Driver } from "../services/dispatcherApi";
import { motion, AnimatePresence } from "framer-motion";

interface TripDrawerProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  onDispatch: (tripId: string) => Promise<Trip>;
  onComplete: (tripId: string, endOdometer: number, fuelLiters?: number, fuelCost?: number) => Promise<Trip>;
  onCancel: (tripId: string) => Promise<Trip>;
}

export function TripDrawer({ trip, isOpen, onClose, vehicles, drivers, onDispatch, onComplete, onCancel }: TripDrawerProps) {
  const [endOdometer, setEndOdometer] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!trip || !isOpen) return null;

  // The backend population handles this objects optionally, if not populated we look up locally 
  const vehicle = trip.vehicleId?._id ? trip.vehicleId : vehicles.find(v => v.id === trip.vehicleId);
  const driver = trip.driverId?._id ? trip.driverId : drivers.find(d => d.id === trip.driverId);

  const handleAction = async (actionFn: () => Promise<Trip>) => {
    try {
      setError(null);
      setIsProcessing(true);
      await actionFn();
      setEndOdometer("");
      setFuelLiters("");
      setFuelCost("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process action");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: Trip["status"]) => {
    switch (status) {
      case "draft": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "dispatched": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400";
      case "completed": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "cancelled": return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
    }
  };

  const getStatusIcon = (status: Trip["status"]) => {
    switch (status) {
      case "draft": return <Package className="h-4 w-4" />;
      case "dispatched": return <Navigation className="h-4 w-4" />;
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
      case "cancelled": return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div 
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-card shadow-2xl border-l flex flex-col h-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Trip Details
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize flex items-center gap-1.5 ${getStatusColor(trip.status)}`}>
                  {getStatusIcon(trip.status)}
                  {trip.status}
                </span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{trip.id}</p>
            </div>
            <button 
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Stepper Logic */}
            <div className="relative">
              <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border -z-10" />
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center border-2 ${trip.status === "draft" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-indigo-600 border-indigo-600 text-white"}`}>
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Trip Created</h4>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(trip.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center border-2 ${trip.status === "dispatched" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30" : trip.status === "completed" ? "bg-indigo-600 border-indigo-600 text-white" : "bg-card border-muted-foreground text-muted-foreground"}`}>
                    <Navigation className="h-3.5 w-3.5" />
                  </div>
                  <div className={trip.status === "draft" ? "opacity-50" : ""}>
                    <h4 className="text-sm font-semibold">Dispatched</h4>
                    {trip.status !== "draft" && trip.status !== "cancelled" && (
                       <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                         Vehicle in transit
                       </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center border-2 ${trip.status === "completed" ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30" : trip.status === "cancelled" ? "bg-destructive border-destructive text-white" : "bg-card border-muted-foreground text-muted-foreground"}`}>
                    {trip.status === "cancelled" ? <AlertCircle className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  </div>
                  <div className={trip.status !== "completed" && trip.status !== "cancelled" ? "opacity-50" : ""}>
                    <h4 className="text-sm font-semibold">{trip.status === "cancelled" ? "Trip Cancelled" : "Destination Reached"}</h4>
                    {trip.status === "completed" && trip.updatedAt && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(trip.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Details */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Assignments</h3>
              
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{vehicle?.name || vehicle?.make} {vehicle?.model} <span className="text-muted-foreground font-normal ml-1">({vehicle?.licensePlate})</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">Odometer at start: <span className="font-mono text-foreground">{trip.startOdometer?.toLocaleString() || 0}</span></p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{driver?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">{driver?.id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{trip.cargoWeight.toLocaleString()} lbs Cargo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Est. Revenue: <span className="text-emerald-500 font-medium">${trip.revenue?.toLocaleString() || '0'}</span></p>
                </div>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="p-6 border-t bg-muted/10 space-y-3">
            {trip.status === "draft" && (
              <>
                <button 
                  onClick={() => handleAction(() => onDispatch(trip.id!))}
                  disabled={isProcessing}
                  className="w-full flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-60"
                >
                  {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                  Dispatch Trip Now
                </button>
                <button 
                  onClick={() => handleAction(() => onCancel(trip.id!))}
                  disabled={isProcessing}
                  className="w-full rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-60"
                >
                  Cancel Trip
                </button>
              </>
            )}

            {trip.status === "dispatched" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Final Odometer Reading</label>
                  <input 
                    type="number" 
                    value={endOdometer}
                    onChange={(e) => setEndOdometer(e.target.value)}
                    placeholder="Enter current reading..."
                    className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Fuel Added (Liters)</label>
                    <input 
                      type="number" 
                      value={fuelLiters}
                      onChange={(e) => setFuelLiters(e.target.value)}
                      placeholder="e.g. 45"
                      className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Fuel Cost ($)</label>
                    <input 
                      type="number" 
                      value={fuelCost}
                      onChange={(e) => setFuelCost(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => handleAction(() => onCancel(trip.id!))}
                    disabled={isProcessing}
                    className="w-full rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-60"
                  >
                    Abort Trip
                  </button>
                  <button 
                    onClick={() => {
                      if (!endOdometer || isNaN(Number(endOdometer))) {
                        setError("Valid end odometer reading is required");
                        return;
                      }
                      
                      const fLiters = fuelLiters;
                      const fCost = fuelCost;
                      
                      if ((fLiters && !fCost) || (!fLiters && fCost)) {
                        setError("Both Fuel Liters and Fuel Cost must be provided if logging fuel");
                        return;
                      }

                      handleAction(() => onComplete(trip.id!, Number(endOdometer), fLiters ? Number(fLiters) : undefined, fCost ? Number(fCost) : undefined));
                    }}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-60"
                  >
                    {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                    Complete
                  </button>
                </div>
              </div>
            )}

            {(trip.status === "completed" || trip.status === "cancelled") && (
              <button 
                onClick={onClose}
                className="w-full rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors"
               >
                Close Details
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
