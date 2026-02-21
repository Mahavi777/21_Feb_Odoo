import { useState } from "react";
import TopNavbar from "@/components/layout/TopNavbar";
import DataTable, { Column } from "@/components/DataTable";
import StatusPill from "@/components/StatusPill";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { VEHICLES, Vehicle } from "@/data/mockData";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState(VEHICLES);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", model: "", licensePlate: "", maxCapacity: "", region: "North", type: "truck" as Vehicle["type"] });

  const filtered = vehicles.filter((v) => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.licensePlate.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && v.type !== typeFilter) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  const pageSize = 6;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleAdd = () => {
    if (!form.name || !form.model || !form.licensePlate) {
      toast.error("Please fill all required fields");
      return;
    }
    const newV: Vehicle = {
      id: `v${Date.now()}`,
      name: form.name,
      model: form.model,
      licensePlate: form.licensePlate,
      maxCapacity: Number(form.maxCapacity) || 0,
      odometer: 0,
      status: "available",
      region: form.region,
      type: form.type,
    };
    setVehicles([newV, ...vehicles]);
    setAddOpen(false);
    setForm({ name: "", model: "", licensePlate: "", maxCapacity: "", region: "North", type: "truck" });
    toast.success("Vehicle added successfully");
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setVehicles(vehicles.filter((v) => v.id !== deleteId));
    setDeleteId(null);
    toast.success("Vehicle removed");
  };

  const columns: Column<Vehicle>[] = [
    { key: "name", label: "Name", render: (v) => <span className="font-medium">{v.name}</span> },
    { key: "model", label: "Model" },
    { key: "licensePlate", label: "License Plate", render: (v) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{v.licensePlate}</code> },
    { key: "maxCapacity", label: "Capacity", render: (v) => `${v.maxCapacity.toLocaleString()} kg` },
    { key: "odometer", label: "Odometer", render: (v) => `${v.odometer.toLocaleString()} km` },
    { key: "status", label: "Status", render: (v) => <StatusPill status={v.status} /> },
    { key: "region", label: "Region" },
    {
      key: "actions", label: "Actions", render: (v) => (
        <div className="flex gap-1">
          <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={() => setDeleteId(v.id)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <TopNavbar title="Vehicle Registry" />
      <main className="flex-1 overflow-y-auto p-6 space-y-4 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search vehicles..."
                className="rounded-lg border bg-card pl-9 pr-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="rounded-lg border bg-card px-3 py-1.5 text-sm">
              <option value="all">All Types</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="bike">Bike</option>
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border bg-card px-3 py-1.5 text-sm">
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="in_shop">In Shop</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Vehicle
          </button>
        </div>

        <DataTable columns={columns} data={paged} page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} />

        {/* Add Vehicle Modal */}
        <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Vehicle">
          <div className="space-y-3">
            <input placeholder="Vehicle Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <input placeholder="Model *" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <input placeholder="License Plate *" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <input type="number" placeholder="Max Capacity (kg)" value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Vehicle["type"] })} className="rounded-lg border bg-background px-3 py-2 text-sm">
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="bike">Bike</option>
              </select>
              <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm">
                <option value="North">North</option>
                <option value="East">East</option>
                <option value="South">South</option>
                <option value="West">West</option>
              </select>
            </div>
            <button onClick={handleAdd} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Add Vehicle
            </button>
          </div>
        </Modal>

        <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Vehicle" message="Are you sure you want to remove this vehicle? This action cannot be undone." confirmLabel="Delete" variant="danger" />
      </main>
    </>
  );
}
