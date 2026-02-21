import { useState, useMemo } from "react";
import TopNavbar from "@/components/layout/TopNavbar";
import { useManagerData } from "./hooks/useManagerData";
import { Search, Edit, Users, Plus, X, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DriverManager() {
  const { drivers, isLoading, createDriver, updateDriver, updateDriverStatus } = useManagerData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Create / Edit Driver form state
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    licenseNumber: "", 
    licenseExpiry: "", 
    licenseCategory: "Standard", 
    baseSalary: "",
    status: "offDuty",
    safetyScore: 100
  });

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => 
      (statusFilter === "all" || d.status === statusFilter) &&
      (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       (d.licenseNumber && d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [drivers, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'onDuty': return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
      case 'offDuty': return 'bg-slate-500/15 text-slate-500 border-slate-500/30';
      case 'suspended': return 'bg-destructive/15 text-destructive border-destructive/30';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const isLicenseExpired = (expiryStr: string) => {
    if (!expiryStr) return true;
    const expiry = new Date(expiryStr);
    return expiry < new Date();
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDriver) {
      await updateDriver(selectedDriver._id, form);
    } else {
      await createDriver(form);
    }
    setIsEditModalOpen(false);
    setSelectedDriver(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({ 
      name: "", 
      email: "", 
      licenseNumber: "", 
      licenseExpiry: "", 
      licenseCategory: "Standard", 
      baseSalary: "",
      status: "offDuty",
      safetyScore: 100
    });
  }

  const openAddModal = () => {
    setSelectedDriver(null);
    resetForm();
    setIsEditModalOpen(true);
  };

  const openEditModal = (driver: any) => {
    setSelectedDriver(driver);
    setForm({ 
      name: driver.name, 
      email: driver.email || "", 
      licenseNumber: driver.licenseNumber || "", 
      licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.substring(0, 10) : "", 
      licenseCategory: driver.licenseCategory || "Standard", 
      baseSalary: driver.baseSalary || "",
      status: driver.status || "offDuty",
      safetyScore: driver.safetyScore || 100
    });
    setIsEditModalOpen(true);
  };

  return (
    <>
      <TopNavbar title="Driver Roster" />
      <main className="flex-1 overflow-y-auto p-6 animate-fade-in space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search drivers or licenses..." 
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
              <option value="onDuty">On Duty</option>
              <option value="offDuty">Off Duty</option>
              <option value="suspended">Suspended</option>
            </select>
            <button 
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              onClick={openAddModal}
            >
              <Plus className="h-4 w-4" /> Add Driver
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Driver Details</th>
                  <th className="px-6 py-4 font-semibold">License Info</th>
                  <th className="px-6 py-4 font-semibold">Financials & Score</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading driver roster...</td></tr>
                ) : filteredDrivers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No drivers found matching criteria.</td></tr>
                ) : (
                  filteredDrivers.map((d) => {
                    const expired = isLicenseExpired(d.licenseExpiry);
                    return (
                    <tr key={d._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{d.name}</p>
                            <p className="text-xs text-muted-foreground">{d.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-mono text-sm">{d.licenseNumber || 'UNASSIGNED'}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-xs text-muted-foreground">{d.licenseCategory}</span>
                             {expired && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive/20 text-destructive">EXPIRED</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-foreground font-medium">${d.baseSalary?.toLocaleString() || 0} <span className="text-xs text-muted-foreground font-normal">Base</span></p>
                          <div className="flex items-center gap-1.5 text-xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                            <span className={d.safetyScore < 70 ? 'text-destructive font-medium' : 'text-muted-foreground'}>{d.safetyScore} Score</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(d.status)}`}>
                          {d.status === 'onDuty' ? 'On Duty' : d.status === 'offDuty' ? 'Off Duty' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-md"
                            title="Edit Driver"
                            onClick={() => openEditModal(d)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-lg rounded-xl shadow-lg border p-6 max-h-[90vh] overflow-y-auto"
            >
               <div className="flex justify-between items-center mb-5 border-b pb-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <Users className="h-5 w-5 text-primary" /> {selectedDriver ? 'Edit Driver' : 'Add New Driver'}
                </h2>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:bg-muted p-1 rounded-full"><X className="h-5 w-5" /></button>
              </div>
              
              <form onSubmit={handleSaveDriver} className="space-y-4">
                {/* Personal Information */}
                <div>
                   <h3 className="text-sm font-semibold text-primary mb-3">Personal Information</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                          <input 
                            required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                            placeholder="e.g., John Doe"
                            className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                          <input 
                            required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                            placeholder="driver@fleetflow.io"
                            className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                   </div>
                </div>

                {/* License Information */}
                <div className="pt-2 border-t">
                    <h3 className="text-sm font-semibold text-primary mb-3 mt-2">Licensing</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">License Number</label>
                          <input 
                            required type="text" value={form.licenseNumber} onChange={e => setForm({...form, licenseNumber: e.target.value})}
                            placeholder="e.g., DLX-9000-AB"
                            className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Expiry Date</label>
                          <input 
                            required type="date" value={form.licenseExpiry} onChange={e => setForm({...form, licenseExpiry: e.target.value})}
                            className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">License Category</label>
                      <select 
                        required value={form.licenseCategory} onChange={e => setForm({...form, licenseCategory: e.target.value})}
                        className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Standard">Standard (Class C)</option>
                        <option value="Commercial">Commercial (CDL)</option>
                        <option value="Heavy">Heavy Goods Vehicle (HGV)</option>
                        <option value="Motorcycle">Motorcycle (Class M)</option>
                      </select>
                    </div>
                </div>

                {/* Operational Details */}
                <div className="pt-2 border-t">
                   <h3 className="text-sm font-semibold text-primary mb-3 mt-2">Operational Data</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Base Salary ($)</label>
                          <input 
                            required type="number" value={form.baseSalary} onChange={e => setForm({...form, baseSalary: e.target.value})}
                            placeholder="e.g., 55000"
                            className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Safety Score (0-100)</label>
                          <input 
                            required type="number" min="0" max="100" value={form.safetyScore} onChange={e => setForm({...form, safetyScore: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        {selectedDriver && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                          <select 
                            required value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                            className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="offDuty">Off Duty</option>
                            <option value="onDuty">On Duty</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                        )}
                   </div>
                </div>
                
                <div className="flex justify-end pt-5 gap-3 border-t">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-muted transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                     {selectedDriver ? 'Save Changes' : 'Create Context'}
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
