import { useState } from "react";
import TopNavbar from "@/components/layout/TopNavbar";
import { useManagerData } from "./hooks/useManagerData";
import { AlertTriangle, CheckCircle, Search, Wrench, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MaintenanceManager() {
  const { maintenance, vehicles, isLoading, createMaintenance, completeMaintenance } = useManagerData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  
  // Form State
  const [vehicleId, setVehicleId] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");

  const filteredLogs = maintenance.filter(m => {
    const vName = typeof m.vehicleId === 'object' ? m.vehicleId?.name : '';
    return (vName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
           m.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const availableVehiclesForMaintenance = vehicles.filter(v => ['available'].includes(v.status));

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !description || !cost) return;
    
    await createMaintenance({ 
      vehicleId, 
      description, 
      cost: Number(cost) 
    });
    
    setIsLogModalOpen(false);
    setVehicleId("");
    setDescription("");
    setCost("");
  };

  return (
    <>
      <TopNavbar title="Maintenance Logs" />
      <main className="flex-1 overflow-y-auto p-6 animate-fade-in space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl shadow-sm border">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            onClick={() => setIsLogModalOpen(true)}
          >
            <Plus className="h-4 w-4" /> Log Service
          </button>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Service Log</th>
                  <th className="px-6 py-4 font-semibold">Vehicle</th>
                  <th className="px-6 py-4 font-semibold">Cost</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading logs...</td></tr>
                ) : filteredLogs.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No maintenance records found.</td></tr>
                ) : (
                  filteredLogs.map((log) => {
                    const vehicleIdValue = log.vehicleId && typeof log.vehicleId === 'object' ? log.vehicleId._id : log.vehicleId;
                    const vehicleRef = vehicles.find(v => v._id === vehicleIdValue);
                    const isCurrentlyInShop = vehicleRef && vehicleRef.status === 'inShop';
                    
                    return (
                      <tr key={log._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
                              <Wrench className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-foreground">{log.description}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-medium">
                           {vehicleRef ? vehicleRef.name : (log.vehicleId && typeof log.vehicleId === 'object' ? log.vehicleId.name : log.vehicleId)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-foreground">
                          ${log.cost}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(log.date || log.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                           {isCurrentlyInShop ? (
                             <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-orange-500/15 text-orange-600 border-orange-500/30">
                               Ongoing
                             </span>
                           ) : (
                             <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-green-500/15 text-green-600 border-green-500/30">
                               Completed
                             </span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isCurrentlyInShop && (
                            <button 
                              className="text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center justify-end gap-1 ml-auto shadow-sm"
                              onClick={() => completeMaintenance(log._id)}
                            >
                              <CheckCircle className="h-3 w-3" /> Mark Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <AnimatePresence>
        {isLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-xl shadow-lg border p-6"
            >
              <div className="flex justify-between items-center mb-5 border-b pb-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <Wrench className="h-5 w-5 text-orange-500" /> Log Service
                </h2>
                <button onClick={() => setIsLogModalOpen(false)} className="text-muted-foreground hover:bg-muted p-1 rounded-full"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleLogSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Select Vehicle</label>
                  <select 
                    required
                    value={vehicleId} 
                    onChange={e => setVehicleId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>Choose an available vehicle</option>
                    {availableVehiclesForMaintenance.map(v => (
                      <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Maintenance Description</label>
                  <input 
                    required type="text" 
                    value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="e.g., Oil Change & Tire Rotation"
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Total Cost ($)</label>
                  <input 
                    required type="number" min="1" step="0.01"
                    value={cost} onChange={e => setCost(e.target.value)}
                    placeholder="e.g., 250.00"
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end pt-4 gap-3">
                  <button type="button" onClick={() => setIsLogModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-muted transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Save Record</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
