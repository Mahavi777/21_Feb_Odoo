import React from 'react';
import { useQuery } from '@tanstack/react-query';
import TopNavbar from '@/components/layout/TopNavbar';
import KPICard from '@/components/KPICard';
import { Users, Shield, AlertTriangle, Activity, ShieldAlert, BadgeCheck } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

async function fetchDashboard() {
  const res = await fetch('http://localhost:5000/api/safety/dashboard');
  if (!res.ok) throw new Error('Failed to load dashboard');
  return res.json();
}

export default function SafetyDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['safety-dashboard'], queryFn: fetchDashboard });

  const d = data?.data || {};

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <>
      <TopNavbar title="Safety Dashboard" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-background relative overflow-hidden">
        
        {/* Decorative ambient background */}
        <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[100px]" />
        </div>

        {/* Dashboard Content */}
        {isLoading ? (
          <div className="flex h-[60vh] items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8">
            
            {/* Header section with gradient score */}
            <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Primary Score Card */}
              <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border bg-card p-8 shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShieldAlert className="w-48 h-48" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-center">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-500" /> Fleet Safety Score
                  </p>
                  <div className="flex items-end gap-4 mt-2">
                    <h2 className="text-6xl sm:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">
                      {d.averageSafetyScore ?? 100}
                    </h2>
                    <span className="text-2xl font-medium text-muted-foreground mb-2">/ 100</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-400 max-w-md leading-relaxed">
                    This score reflects the overall compliance, incident rate, and active standing of your fleet. Ensure routine checks to maintain optimization.
                  </p>
                </div>
              </div>

              {/* Status Breakdown Panel */}
              <div className="lg:col-span-1 flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-xl">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-indigo-400" /> Compliance Overview
                  </h3>
                  <div className="mt-6 space-y-5">
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-foreground">Active Drivers</span>
                        <span className="text-emerald-500">{d.activeDrivers ?? 0}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div 
                          className="h-full bg-emerald-500 rounded-full" 
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.activeDrivers / (d.totalDrivers || 1)) * 100}%` }}
                          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-foreground">Suspended</span>
                        <span className="text-rose-500">{d.suspendedDrivers ?? 0}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div 
                          className="h-full bg-rose-500 rounded-full" 
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.suspendedDrivers / (d.totalDrivers || 1)) * 100}%` }}
                          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-foreground">Expiring Licenses</span>
                        <span className="text-amber-500">{d.expiringSoon ?? 0}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div 
                          className="h-full bg-amber-500 rounded-full" 
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.expiringSoon / (d.totalDrivers || 1)) * 100}%` }}
                          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>

            {/* KPI Cards Row */}
            <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard title="Total Drivers" value={d.totalDrivers ?? 0} icon={Users} trend={{ value: d.activeDrivers, label: "Currently Active" }} />
              <KPICard title="Zero-Incident Drivers" value={(d.totalDrivers || 0) - (d.suspendedDrivers || 0)} icon={Shield} trend={{ value: 0, label: "Safe records" }} />
              <KPICard title="Total Suspensions" value={d.suspendedDrivers ?? 0} icon={AlertTriangle} trend={{ value: d.suspendedDrivers > 0 ? -1 : 1, label: d.suspendedDrivers > 0 ? "Requires review" : "Perfect standing" }} />
              <KPICard title="Expiring Soon" value={d.expiringSoon ?? 0} icon={ShieldAlert} trend={{ value: d.expiringSoon > 0 ? -1 : 1, label: "In next 30 days" }} />
            </motion.div>

          </motion.div>
        )}
      </main>
    </>
  );
}
