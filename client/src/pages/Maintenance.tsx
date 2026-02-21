import { useState } from "react";
import TopNavbar from "@/components/layout/TopNavbar";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { MAINTENANCE_LOGS, VEHICLES, MaintenanceLog } from "@/data/mockData";
import { Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Maintenance() {
  const [logs, setLogs] = useState(MAINTENANCE_LOGS);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: "", description: "", cost: "" });

  const handleAdd = () => {
    if (!form.vehicleId || !form.description) {
      toast.error("Please fill all required fields");
      return;
    }
    const veh = VEHICLES.find((v) => v.id === form.vehicleId);
    const newLog: MaintenanceLog = {
      id: `m${Date.now()}`,
      vehicleId: form.vehicleId,
      vehicleName: veh?.name || "",
      description: form.description,
      cost: Number(form.cost) || 0,
      date: new Date().toISOString().split("T")[0],
      statusImpact: "Vehicle marked In Shop",
    };
    setLogs([newLog, ...logs]);
    setAddOpen(false);
    setForm({ vehicleId: "", description: "", cost: "" });
    toast.success("Maintenance log added");
  };

  const columns: Column<MaintenanceLog>[] = [
    { key: "vehicleName", label: "Vehicle", render: (m) => <span className="font-medium">{m.vehicleName}</span> },
    { key: "description", label: "Description" },
    { key: "cost", label: "Cost", render: (m) => `$${m.cost.toLocaleString()}` },
    { key: "date", label: "Date" },
    { key: "statusImpact", label: "Status Impact", render: (m) => <span className="text-xs text-muted-foreground">{m.statusImpact}</span> },
  ];

  return (
    <>
      <TopNavbar title="Maintenance Logs" />
      <main className="flex-1 overflow-y-auto p-6 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{logs.length} maintenance records</p>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Log
          </button>
        </div>

        <DataTable columns={columns} data={logs} />

        <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Maintenance Log">
          <div className="space-y-3">
            <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="">Select Vehicle *</option>
              {VEHICLES.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>

            {form.vehicleId && (
              <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Vehicle will be marked "In Shop" after this log is added
              </div>
            )}

            <textarea placeholder="Description *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
            <input type="number" placeholder="Cost ($)" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <button onClick={handleAdd} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Add Maintenance Log
            </button>
          </div>
        </Modal>
      </main>
    </>
  );
}
