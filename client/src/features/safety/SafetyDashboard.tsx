import React from 'react';
import { useQuery } from '@tanstack/react-query';
import KPICard from '@/components/KPICard';
import { Users, Shield } from 'lucide-react';

async function fetchDashboard() {
  const res = await fetch('http://localhost:5000/api/safety/dashboard');
  if (!res.ok) throw new Error('Failed to load dashboard');
  return res.json();
}

export default function SafetyDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['safety-dashboard'], queryFn: fetchDashboard });

  const d = data?.data || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Safety Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Drivers" value={d.totalDrivers ?? 0} icon={Users} />
        <KPICard title="Active Drivers" value={d.activeDrivers ?? 0} icon={Shield} />
        <KPICard title="Suspended Drivers" value={d.suspendedDrivers ?? 0} icon={Shield} />
        <KPICard title="Licenses Expiring" value={d.expiringSoon ?? 0} icon={Users} />
      </div>
      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">Average Safety Score</p>
        <div className="mt-2 text-4xl font-bold">{d.averageSafetyScore ?? 100}</div>
      </div>
    </div>
  );
}
