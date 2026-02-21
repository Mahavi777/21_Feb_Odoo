import { useState } from "react";
import TopNavbar from "@/components/layout/TopNavbar";
import DataTable, { Column } from "@/components/DataTable";
import StatusPill from "@/components/StatusPill";
import Modal from "@/components/Modal";
import { TRIPS, VEHICLES, DRIVERS, Trip } from "@/data/mockData";
import { Plus, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function Trips() {
  const [trips, setTrips] = useState(TRIPS);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: "", driverName: "", cargoWeight: "", origin: "", destination: "" });
  const [capacityWarning, setCapacityWarning] = useState("");

  const availableVehicles = VEHICLES.filter((v) => v.status === "available");

  const handleCargoChange = (val: string) => {
    setForm({ ...form, cargoWeight: val });
    if (form.vehicleId) {
      const veh = VEHICLES.find((v) => v.id === form.vehicleId);
      if (veh && Number(val) > veh.maxCapacity) {
        setCapacityWarning(`Exceeds max capacity of ${veh.maxCapacity.toLocaleString()} kg!`);
      } else {
        setCapacityWarning("");
      }
    }
  };

  const handleVehicleChange = (id: string) => {
    setForm({ ...form, vehicleId: id });
    setCapacityWarning("");
  };

  const handleAdd = () => {
    if (!form.vehicleId || !form.driverName || !form.origin || !form.destination) {
      toast.error("Please fill all required fields");
      return;
    }
    if (capacityWarning) {
      toast.error("Cargo exceeds vehicle capacity");
      return;
    }
    const veh = VEHICLES.find((v) => v.id === form.vehicleId);
    const newTrip: Trip = {
      id: `t${Date.now()}`,
      vehicleId: form.vehicleId,
      vehicleName: veh?.name || "",
      driverName: form.driverName,
      cargoWeight: Number(form.cargoWeight) || 0,
      origin: form.origin,
      destination: form.destination,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTrips([newTrip, ...trips]);
    setAddOpen(false);
    setForm({ vehicleId: "", driverName: "", cargoWeight: "", origin: "", destination: "" });
    toast.success("Trip created");
  };

  const updateStatus = (id: string, status: Trip["status"]) => {
    setTrips(trips.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(`Trip marked as ${status}`);
  };

  const columns: Column<Trip>[] = [
    { key: "vehicleName", label: "Vehicle", render: (t) => <span className="font-medium">{t.vehicleName}</span> },
    { key: "driverName", label: "Driver" },
    { key: "origin", label: "Origin" },
    { key: "destination", label: "Destination" },
    { key: "cargoWeight", label: "Cargo", render: (t) => `${t.cargoWeight.toLocaleString()} kg` },
    { key: "status", label: "Status", render: (t) => <StatusPill status={t.status} /> },
    { key: "createdAt", label: "Date" },
    {
      key: "actions", label: "Actions", render: (t) => (
        <div className="flex gap-1">
          {(t.status === "draft" || t.status === "dispatched") && (
            <button onClick={() => updateStatus(t.id, "completed")} className="rounded-md p-1.5 text-muted-foreground hover:bg-success/10 hover:text-success transition-colors" title="Complete">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          )}
          {t.status !== "cancelled" && t.status !== "completed" && (
            <button onClick={() => updateStatus(t.id, "cancelled")} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" title="Cancel">
              <XCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <TopNavbar title="Trip Dispatcher" />
      <main className="flex-1 overflow-y-auto p-6 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{trips.length} total trips</p>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Create Trip
          </button>
        </div>

        <DataTable columns={columns} data={trips} />

        <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create Trip">
          <div className="space-y-3">
            <select value={form.vehicleId} onChange={(e) => handleVehicleChange(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="">Select Vehicle *</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.maxCapacity.toLocaleString()} kg)</option>
              ))}
            </select>
            <select value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="">Select Driver *</option>
              {DRIVERS.filter((d) => d.status === "on_duty").map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
            <div>
              <input type="number" placeholder="Cargo Weight (kg)" value={form.cargoWeight} onChange={(e) => handleCargoChange(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              {capacityWarning && (
                <p className="mt-1 text-xs text-destructive">{capacityWarning}</p>
              )}
            </div>
            <input placeholder="Origin *" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <input placeholder="Destination *" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <button onClick={handleAdd} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Create Trip
            </button>
          </div>
        </Modal>
      </main>
    </>
  );
}
