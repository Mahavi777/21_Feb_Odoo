import { useState, useEffect } from "react";
import TopNavbar from "@/components/layout/TopNavbar";
import DataTable, { Column } from "@/components/DataTable";
import StatusPill from "@/components/StatusPill";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { VehicleRegistry } from "@/features/manager/VehicleRegistry";
import axios from "axios";

export default function Vehicles() {
  const { user } = useAuth();

  if (user?.role === "manager") {
    return <VehicleRegistry />;
  }

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem("fleetflow_token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/vehicles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVehicles(res.data.data);
      } catch (err) {
        console.error("Failed to fetch vehicles", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.role === "dispatcher") {
      fetchVehicles();
    }
  }, [user]);

  const filtered = vehicles.filter((v) => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.licensePlate.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  const pageSize = 6;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<any>[] = [
    { key: "name", label: "Name", render: (v) => <span className="font-medium">{v.name}</span> },
    { key: "model", label: "Model" },
    { key: "licensePlate", label: "License Plate", render: (v) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{v.licensePlate}</code> },
    { key: "maxCapacity", label: "Capacity", render: (v) => `${v.maxCapacity.toLocaleString()} kg` },
    { key: "odometer", label: "Odometer", render: (v) => `${(v.odometer || 0).toLocaleString()} km` },
    { key: "status", label: "Status", render: (v) => <StatusPill status={v.status} /> },
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
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border bg-card px-3 py-1.5 text-sm">
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="onTrip">On Trip</option>
              <option value="inShop">In Shop</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <DataTable columns={columns} data={paged} page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} />
        )}
      </main>
    </>
  );
}
