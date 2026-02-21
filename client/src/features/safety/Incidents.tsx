import React from 'react';
import { useQuery } from '@tanstack/react-query';
import TopNavbar from '@/components/layout/TopNavbar';
import DataTable from '@/components/DataTable';
import IncidentForm from './IncidentForm';
import { motion } from 'framer-motion';

async function fetchIncidents() {
  const res = await fetch('http://localhost:5000/api/safety/incidents');
  if (!res.ok) throw new Error('Failed to load incidents');
  return res.json();
}

export default function Incidents() {
  const { data, isLoading } = useQuery({ queryKey: ['safety-incidents'], queryFn: fetchIncidents });
  const incidents = data?.data || [];

  const columns = [
    { key: 'driver', label: 'Driver', render: (i: any) => i.driverId?.name || '—' },
    { key: 'type', label: 'Incident Type', render: (i: any) => (
      <span className="font-medium text-foreground">{i.type}</span>
    )},
    { key: 'severity', label: 'Severity', render: (i: any) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${i.severity === 'Low' ? 'bg-emerald-500/10 text-emerald-500' 
        : i.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500' 
        : 'bg-rose-500/10 text-rose-500'}`}>
        {i.severity}
      </span>
    )},
    { key: 'status', label: 'Status', render: (i: any) => (
       <span className="text-sm text-muted-foreground capitalize">{i.status}</span>
    )},
    { key: 'date', label: 'Reported On', render: (i: any) => (
      <span className="text-sm whitespace-nowrap">{new Date(i.date).toLocaleDateString()}</span>
    )},
  ];

  return (
    <>
      <TopNavbar title="Incident Log" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
          >
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">File New Report</h1>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Log collisions, compliance failures, or safety violations quickly.</p>
            </div>
            <IncidentForm />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border bg-card shadow-sm ring-1 ring-border/50 overflow-hidden"
          >
            <div className="p-4 border-b bg-muted/20">
              <h2 className="text-lg font-semibold text-foreground">Incident History</h2>
            </div>
            <DataTable columns={columns} data={incidents} isLoading={isLoading} emptyMessage="No incidents recorded. Clean slate." />
          </motion.div>

        </div>
      </main>
    </>
  );
}
