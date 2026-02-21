import { useState } from "react";
import { X, MapPin, Package, User, Truck, Calendar, AlertCircle, CheckCircle2, Navigation, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ManagerTripDrawer({ trip, isOpen, onClose, vehicles, drivers, onCancel }: any) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!trip || !isOpen) return null;

  const vehicle = typeof trip.vehicleId === 'object' ? trip.vehicleId : vehicles.find((v: any) => v._id === trip.vehicleId);
  const driver = typeof trip.driverId === 'object' ? trip.driverId : drivers.find((d: any) => d._id === trip.driverId);

  const handleCancel = async () => {
    try {
      setIsProcessing(true);
      await onCancel(trip._id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "dispatched": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400";
      case "completed": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "cancelled": return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
      default: return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <Package className="h-4 w-4" />;
      case "dispatched": return <Navigation className="h-4 w-4" />;
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
      case "cancelled": return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-card shadow-2xl border-l flex flex-col h-full"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Trip Overview
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize flex items-center gap-1.5 ${getStatusColor(trip.status)}`}>
                  {getStatusIcon(trip.status)}
                  {trip.status}
                </span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{trip._id}</p>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
                      <Calendar className="h-3 w-3" /> {new Date(trip.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center border-2 ${trip.status === "dispatched" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30" : trip.status === "completed" ? "bg-indigo-600 border-indigo-600 text-white" : "bg-card border-muted-foreground text-muted-foreground"}`}>
                    <Navigation className="h-3.5 w-3.5" />
                  </div>
                  <div className={trip.status === "draft" ? "opacity-50" : ""}>
                    <h4 className="text-sm font-semibold">Dispatched</h4>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center border-2 ${trip.status === "completed" ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30" : trip.status === "cancelled" ? "bg-destructive border-destructive text-white" : "bg-card border-muted-foreground text-muted-foreground"}`}>
                    {trip.status === "cancelled" ? <AlertCircle className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  </div>
                  <div className={trip.status !== "completed" && trip.status !== "cancelled" ? "opacity-50" : ""}>
                    <h4 className="text-sm font-semibold">{trip.status === "cancelled" ? "Trip Cancelled" : "Destination Reached"}</h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Assignments</h3>
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{vehicle?.name} {vehicle?.model} <span className="text-muted-foreground font-normal ml-1">({vehicle?.licensePlate})</span></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{driver?.name} ({driver?.email})</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-muted/10 space-y-3">
            {(trip.status === "draft" || trip.status === "dispatched") && (
                <button 
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="w-full rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                  Cancel Trip
                </button>
            )}
            <button onClick={onClose} className="w-full rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors">
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
