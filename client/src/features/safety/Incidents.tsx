import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DataTable from '@/components/DataTable';
import IncidentForm from './IncidentForm';

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
    { key: 'type', label: 'Type' },
    { key: 'severity', label: 'Severity' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Date', render: (i: any) => new Date(i.date).toLocaleString() },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Incidents</h1>
      <IncidentForm />
      <DataTable columns={columns} data={incidents} isLoading={isLoading} emptyMessage="No incidents" />
    </div>
  );
}
