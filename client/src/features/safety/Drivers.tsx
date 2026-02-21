import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import DriverProfileDrawer from './DriverProfileDrawer';

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

  if (user?.role !== 'safety') return <div className="text-muted-foreground">Access denied</div>;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'licenseExpiry', label: 'License Expiry', render: (d: any) => new Date(d.licenseExpiry).toLocaleDateString() },
    { key: 'safetyScore', label: 'Safety Score', render: (d: any) => d.safetyScore },
    { key: 'complianceStatus', label: 'Status', render: (d: any) => (
      <span className={d.complianceStatus === 'Active' ? 'text-success' : d.complianceStatus === 'Warning' ? 'text-amber-400' : 'text-destructive'}>{d.complianceStatus}</span>
    ) },
    { key: 'totalIncidents', label: 'Incidents' },
    { key: 'actions', label: 'Actions', render: (d: any) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setSelected(d)}>View</Button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Driver Compliance</h1>
      <DataTable columns={columns} data={drivers} isLoading={isLoading} emptyMessage="No drivers" />
      <DriverProfileDrawer driver={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
