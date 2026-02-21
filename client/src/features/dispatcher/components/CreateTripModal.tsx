import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { Vehicle, Driver, Trip } from "../services/dispatcherApi";
import { motion, AnimatePresence } from "framer-motion";

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  onSubmit: (payload: { vehicleId: string; driverId: string; cargoWeight: number; startOdometer: number; revenue?: number }) => Promise<Trip>;
}

export function CreateTripModal({ isOpen, onClose, vehicles, drivers, onSubmit }: CreateTripModalProps) {
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [startOdometer, setStartOdometer] = useState("");
  const [revenue, setRevenue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ vehicle?: boolean; driver?: boolean; cargo?: boolean; odometer?: boolean }>({});

  // Filter lists to strictly match dispatcher rules
  const availableVehicles = vehicles.filter(v => v.status === "available");
  const availableDrivers = drivers.filter(d => d.status === "offDuty" && new Date(d.licenseExpiry) >= new Date());

  const selectedVehicle = availableVehicles.find(v => v.id === vehicleId);

  const triggerError = (msg: string, fields: any) => {
    setError(msg);
    setFieldErrors(fields);
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setFieldErrors({});
    }, 500);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!vehicleId) return triggerError("Must select an available vehicle", { vehicle: true });
    if (!driverId) return triggerError("Must select an available driver", { driver: true });
    if (!cargoWeight || isNaN(Number(cargoWeight))) return triggerError("Valid cargo weight required", { cargo: true });
    if (!startOdometer || isNaN(Number(startOdometer))) return triggerError("Valid start odometer required", { odometer: true });

    const cargoNum = Number(cargoWeight);
    if (selectedVehicle && cargoNum > selectedVehicle.maxCapacity) {
      return triggerError(`Cargo weight exceeds vehicle capacity (${selectedVehicle.maxCapacity} lbs)`, { cargo: true });
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        vehicleId,
        driverId,
        cargoWeight: cargoNum,
        startOdometer: Number(startOdometer),
        revenue: revenue ? Number(revenue) : undefined
      });
      // Reset form on success
      setVehicleId("");
      setDriverId("");
      setCargoWeight("");
      setStartOdometer("");
      setRevenue("");
      onClose();
    } catch (err: any) {
      triggerError(err.message || "Failed to create trip", {});
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: shake ? [-6, 6, -4, 4, 0] : 0 
          }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: shake ? 0.4 : 0.2 }}
          className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl"
        >
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">Create New Trip</h2>
            <p className="text-sm text-muted-foreground mt-1">Assign an available vehicle and driver to dispatch.</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium border border-destructive/20">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Vehicle</label>
                <select 
                  value={vehicleId} 
                  onChange={(e) => {
                    setVehicleId(e.target.value);
                    const v = availableVehicles.find(veh => veh.id === e.target.value);
                    if (v) setStartOdometer(v.odometer.toString());
                  }}
                  className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all ${fieldErrors.vehicle ? 'border-destructive ring-2 ring-destructive/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
                >
                  <option value="">Select Vehicle...</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.make || v.name} {v.model} (Max: {v.maxCapacity}lbs)</option>
                  ))}
                </select>
                {availableVehicles.length === 0 && <p className="text-xs text-destructive mt-1">No available vehicles.</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Driver</label>
                <select 
                  value={driverId} 
                  onChange={(e) => setDriverId(e.target.value)}
                  className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all ${fieldErrors.driver ? 'border-destructive ring-2 ring-destructive/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
                >
                  <option value="">Select Driver...</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {availableDrivers.length === 0 && <p className="text-xs text-destructive mt-1">No available/compliant drivers.</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cargo Weight (lbs)</label>
                <input 
                  type="number" 
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                  placeholder="e.g. 5000"
                  className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all ${fieldErrors.cargo ? 'border-destructive ring-2 ring-destructive/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">Start Odometer</label>
                <input 
                  type="number" 
                  value={startOdometer}
                  onChange={(e) => setStartOdometer(e.target.value)}
                  className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all ${fieldErrors.odometer ? 'border-destructive ring-2 ring-destructive/20' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-sm font-medium text-muted-foreground">Est. Revenue (Optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                <input 
                  type="number" 
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border bg-background pl-8 pr-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting || availableDrivers.length === 0 || availableVehicles.length === 0}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 disabled:opacity-60 disabled:shadow-none"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Trip
              </button>
            </div>
          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
