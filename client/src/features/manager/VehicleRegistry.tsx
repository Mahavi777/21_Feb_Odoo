import { useState, useMemo } from "react";
import TopNavbar from "@/components/layout/TopNavbar";
import { useManagerData } from "./hooks/useManagerData";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Truck,
  Plus,
  X,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function VehicleRegistry() {
  const { vehicles, isLoading, updateVehicle, retireVehicle, createVehicle } =
    useManagerData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Create / Edit Vehicle form state
  const [form, setForm] = useState({
    name: "",
    model: "",
    licensePlate: "",
    maxCapacity: "",
    region: "North",
    vehicleType: "truck",
    acquisitionCost: "",
    odometer: "",
  });
  const regions = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.region))),
    [vehicles],
  );

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(
      (v) =>
        (statusFilter === "all" || v.status === statusFilter) &&
        (regionFilter === "all" || v.region === regionFilter) &&
        (v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [vehicles, searchTerm, statusFilter, regionFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
      case "onTrip":
        return "bg-blue-500/15 text-blue-600 border-blue-500/30";
      case "inShop":
        return "bg-orange-500/15 text-orange-600 border-orange-500/30";
      case "retired":
        return "bg-slate-500/15 text-slate-500 border-slate-500/30";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleRetire = async () => {
    if (selectedVehicle) {
      await retireVehicle(selectedVehicle._id);
      setIsRetireModalOpen(false);
      setSelectedVehicle(null);
    }
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVehicle) {
      await updateVehicle(selectedVehicle._id, form);
    } else {
      await createVehicle(form);
    }
    setIsEditModalOpen(false);
    setSelectedVehicle(null);
    setForm({
      name: "",
      model: "",
      licensePlate: "",
      maxCapacity: "",
      region: "North",
      vehicleType: "truck",
      acquisitionCost: "",
      odometer: "",
    });
  };

  const openAddModal = () => {
    setSelectedVehicle(null);
    setForm({
      name: "",
      model: "",
      licensePlate: "",
      maxCapacity: "",
      region: "North",
      vehicleType: "truck",
      acquisitionCost: "",
      odometer: "",
    });
    setIsEditModalOpen(true);
  };

  const openEditModal = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setForm({
      name: vehicle.name,
      model: vehicle.model,
      licensePlate: vehicle.licensePlate,
      maxCapacity: vehicle.maxCapacity,
      region: vehicle.region,
      vehicleType: vehicle.vehicleType,
      acquisitionCost: vehicle.acquisitionCost,
      odometer: vehicle.odometer,
    });
    setIsEditModalOpen(true);
  };

  return (
    <>
      <TopNavbar title="Vehicle Registry" />
      <main className="flex-1 overflow-y-auto p-6 animate-fade-in space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vehicles..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              className="px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="onTrip">On Trip</option>
              <option value="inShop">In Shop</option>
              <option value="retired">Retired</option>
            </select>
            <select
              className="px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <option value="all">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              onClick={openAddModal}
            >
              <Plus className="h-4 w-4" /> Add Vehicle
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Vehicle</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Odometer</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-muted-foreground animate-pulse"
                    >
                      Loading registry...
                    </td>
                  </tr>
                ) : filteredVehicles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No vehicles found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((v) => (
                    <tr
                      key={v._id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Truck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {v.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {v.licensePlate}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">{v.model}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.vehicleType} • {v.region}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(v.status)}`}
                        >
                          {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {v.odometer.toLocaleString()} km
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"
                            title="Edit Vehicle"
                            onClick={() => openEditModal(v)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {v.status !== "retired" && (
                            <button
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10 rounded-md"
                              title="Retire Vehicle"
                              onClick={() => {
                                setSelectedVehicle(v);
                                setIsRetireModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Retire Confirmation Modal */}
      <AnimatePresence>
        {isRetireModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-xl shadow-lg border p-6"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-6 w-6" /> Confirm Retirement
                </h2>
                <button
                  onClick={() => setIsRetireModalOpen(false)}
                  className="text-muted-foreground hover:bg-muted p-1 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-foreground mb-6">
                Are you sure you want to retire{" "}
                <span className="font-bold">{selectedVehicle?.name}</span> (
                {selectedVehicle?.licensePlate})? This action will permanently
                remove it from active dispatch and re-calculate fleet metrics.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsRetireModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRetire}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-white hover:bg-destructive/90 transition-colors shadow-sm shadow-destructive/20"
                >
                  Yes, Retire Vehicle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-xl shadow-lg border p-6"
            >
              <div className="flex justify-between items-center mb-5 border-b pb-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <Truck className="h-5 w-5 text-primary" />{" "}
                  {selectedVehicle ? "Edit Vehicle" : "Add Vehicle"}
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-muted-foreground hover:bg-muted p-1 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSaveVehicle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Vehicle Name
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Freight Runner 01"
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Model / Make
                  </label>
                  <input
                    required
                    type="text"
                    value={form.model}
                    onChange={(e) =>
                      setForm({ ...form, model: e.target.value })
                    }
                    placeholder="e.g., Volvo VNL 860"
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    License Plate
                  </label>
                  <input
                    required
                    type="text"
                    value={form.licensePlate}
                    onChange={(e) =>
                      setForm({ ...form, licensePlate: e.target.value })
                    }
                    placeholder="e.g., KCA 420F"
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Max Capacity (kg)
                  </label>
                  <input
                    required
                    type="number"
                    value={form.maxCapacity}
                    onChange={(e) =>
                      setForm({ ...form, maxCapacity: e.target.value })
                    }
                    placeholder="e.g., 18000"
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Acquisition Cost $
                    </label>
                    <input
                      required
                      type="number"
                      value={form.acquisitionCost}
                      onChange={(e) =>
                        setForm({ ...form, acquisitionCost: e.target.value })
                      }
                      placeholder="e.g., 50000"
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Current Odometer
                    </label>
                    <input
                      required
                      type="number"
                      value={form.odometer}
                      onChange={(e) =>
                        setForm({ ...form, odometer: e.target.value })
                      }
                      placeholder="e.g., 100"
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Vehicle Type
                    </label>
                    <select
                      required
                      value={form.vehicleType}
                      onChange={(e) =>
                        setForm({ ...form, vehicleType: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="bike">Bike</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Region
                    </label>
                    <select
                      required
                      value={form.region}
                      onChange={(e) =>
                        setForm({ ...form, region: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Save Vehicle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
