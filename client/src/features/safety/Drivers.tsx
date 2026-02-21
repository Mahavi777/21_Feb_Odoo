import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import TopNavbar from '@/components/layout/TopNavbar';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import DriverProfileDrawer from './DriverProfileDrawer';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, UserSearch } from 'lucide-react';

async function fetchDrivers() {
  const res = await fetch('http://localhost:5000/api/safety/drivers');
  if (!res.ok) throw new Error('Failed to load drivers');
  return res.json();
}

export default function Drivers() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['safety-drivers'], queryFn: fetchDrivers });
  const drivers = data?.data || [];
  const [selected, setSelected] = useState<any | null>(null);

  if (user?.role !== 'safety' && user?.role !== 'manager' && user?.role !== 'finance') {
    return <div className="text-muted-foreground p-10 text-center">Access denied</div>;
  }

  const columns = [
    { key: 'name', label: 'Driver Name', render: (d: any) => (
       <div className="flex items-center gap-3">
         <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex flex-shrink-0 items-center justify-center text-indigo-600 font-bold text-xs ring-1 ring-indigo-500/30">
           {d.name.charAt(0)}
         </div>
         <span className="font-medium text-foreground">{d.name}</span>
       </div>
    )},
    { key: 'licenseExpiry', label: 'License Expiry', render: (d: any) => {
        const isExpiring = new Date(d.licenseExpiry) < new Date(Date.now() + 30*24*60*60*1000);
        return (
          <span className={`font-medium ${isExpiring ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {new Date(d.licenseExpiry).toLocaleDateString()}
          </span>
        );
    }},
    { key: 'safetyScore', label: 'Safety Score', render: (d: any) => (
        <div className="flex items-center gap-2">
          <span className={`font-bold ${d.safetyScore >= 90 ? 'text-emerald-500' : d.safetyScore >= 70 ? 'text-amber-500' : 'text-destructive'}`}>
            {d.safetyScore}
          </span>
          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
            <div className={`h-full rounded-full ${d.safetyScore >= 90 ? 'bg-emerald-500' : d.safetyScore >= 70 ? 'bg-amber-500' : 'bg-destructive'}`} style={{ width: `${d.safetyScore}%` }} />
          </div>
        </div>
    )},
    { key: 'complianceStatus', label: 'Status', render: (d: any) => (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
        ${d.complianceStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
        : d.complianceStatus === 'Warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
        : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
        {d.complianceStatus === 'Active' ? <ShieldCheck className="w-3 h-3" /> : d.complianceStatus === 'Warning' ? <ShieldAlert className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
        {d.complianceStatus}
      </span>
    ) },
    { key: 'totalIncidents', label: 'Incidents', render: (d: any) => (
       <span className={`font-medium ${d.totalIncidents > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
         {d.totalIncidents}
       </span>
    )},
    { key: 'actions', label: '', render: (d: any) => (
      <div className="flex justify-end pr-4">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setSelected(d)}
          className="hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-500/10 dark:hover:border-indigo-500/30 transition-all font-medium flex items-center gap-2"
        >
          <UserSearch className="w-4 h-4" /> Inspect
        </Button>
      </div>
    ) },
  ];

  return (
    <>
      <TopNavbar title="Driver Compliance" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background relative">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6 max-w-7xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Driver Roster</h1>
              <p className="text-sm text-muted-foreground mt-1">Review active, warned, and suspended operator statuses.</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden ring-1 ring-border/50">
            <DataTable columns={columns} data={drivers} isLoading={isLoading} emptyMessage="No drivers matched criteria." />
          </div>
        </motion.div>
      </main>
      
      {/* Drawer mounted outside main flow */}
      <DriverProfileDrawer driver={selected} onClose={() => setSelected(null)} />
    </>
  );
}
