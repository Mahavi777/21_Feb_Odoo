import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Award, FileWarning, Clock, AlertCircle } from 'lucide-react';

export default function DriverProfileDrawer({ driver, onClose }: { driver: any; onClose: () => void }) {
  return (
    <AnimatePresence>
      {driver && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[500px] z-50 bg-card border-l shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                   {driver.name.charAt(0)}
                 </div>
                 <div>
                   <h2 className="text-lg font-bold leading-none">{driver.name}</h2>
                   <p className="text-xs text-muted-foreground mt-1">{driver.email || 'Personnel Record'}</p>
                 </div>
              </div>
              <button 
                onClick={onClose} 
                className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              
              {/* Score Card */}
              <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Award className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-2">Aggregate Safety Score</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <h3 className="text-5xl font-extrabold">{driver.safetyScore}</h3>
                    <span className="text-xl text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${driver.safetyScore >= 90 ? 'bg-emerald-400' : driver.safetyScore >= 70 ? 'bg-amber-400' : 'bg-rose-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${driver.safetyScore}%` }}
                      transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <p className="text-sm font-semibold text-foreground">License Expiry</p>
                  </div>
                  <p className="text-lg font-bold">{new Date(driver.licenseExpiry).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">ID: {driver.licenseNumber}</p>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <p className="text-sm font-semibold text-foreground">Compliance</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border
                    ${driver.complianceStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : driver.complianceStatus === 'Warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                    : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                    {driver.complianceStatus}
                  </span>
                </div>
              </div>

              {/* Incidents Section */}
              <div className="rounded-xl border p-5">
                <h3 className="flex items-center gap-2 font-semibold text-foreground mb-4 border-b pb-3">
                  <FileWarning className="w-5 h-5 text-rose-500" /> Recorded Incidents
                </h3>
                
                {driver.totalIncidents > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                        <div>
                          <p className="font-medium text-foreground">Total Violations/Accidents</p>
                          <p className="text-xs text-muted-foreground">Historical record count</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-rose-600">{driver.totalIncidents}</span>
                    </div>
                    {/* Placeholder for future incident breakdown mapping */}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
                      <Award className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Perfect Record</p>
                    <p className="text-xs text-muted-foreground">No incidents filed for this driver.</p>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
