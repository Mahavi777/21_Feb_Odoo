import { useState } from "react";
import TopNavbar from "@/components/layout/TopNavbar";
import KPICard from "@/components/KPICard";
import StatusPill from "@/components/StatusPill";
import { VEHICLES, DRIVERS, MONTHLY_COSTS } from "@/data/mockData";
import { Truck, AlertTriangle, Gauge, Package } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";

const STATUS_COLORS = ["hsl(142,71%,45%)", "hsl(217,91%,60%)", "hsl(38,92%,50%)", "hsl(220,9%,46%)"];

export default function Dashboard() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  const filtered = VEHICLES.filter((v) => {
    if (typeFilter !== "all" && v.type !== typeFilter) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    if (regionFilter !== "all" && v.region !== regionFilter) return false;
    return true;
  });

  const activeFleet = filtered.filter((v) => v.status !== "retired").length;
  const maintenanceAlerts = filtered.filter((v) => v.status === "in_shop").length;
  const utilization = filtered.length > 0
    ? Math.round((filtered.filter((v) => v.status === "on_trip").length / filtered.filter((v) => v.status !== "retired").length) * 100)
    : 0;
  const pendingCargo = 3;

  const pieData = [
    { name: "Available", value: filtered.filter((v) => v.status === "available").length },
    { name: "On Trip", value: filtered.filter((v) => v.status === "on_trip").length },
    { name: "In Shop", value: filtered.filter((v) => v.status === "in_shop").length },
    { name: "Retired", value: filtered.filter((v) => v.status === "retired").length },
  ].filter((d) => d.value > 0);

  return (
    <>
      <TopNavbar title="Command Center" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border bg-card px-3 py-1.5 text-sm">
            <option value="all">All Types</option>
            <option value="truck">Truck</option>
            <option value="van">Van</option>
            <option value="bike">Bike</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border bg-card px-3 py-1.5 text-sm">
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="in_shop">In Shop</option>
            <option value="retired">Retired</option>
          </select>
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="rounded-lg border bg-card px-3 py-1.5 text-sm">
            <option value="all">All Regions</option>
            <option value="North">North</option>
            <option value="East">East</option>
            <option value="South">South</option>
            <option value="West">West</option>
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Active Fleet" value={activeFleet} icon={Truck} trend={{ value: 4.2, label: "vs last month" }} />
          <KPICard title="Maintenance Alerts" value={maintenanceAlerts} icon={AlertTriangle} trend={{ value: -12, label: "vs last month" }} />
          <KPICard title="Utilization Rate" value={`${utilization}%`} icon={Gauge} trend={{ value: 6.8, label: "vs last month" }} />
          <KPICard title="Pending Cargo" value={pendingCargo} icon={Package} trend={{ value: -3, label: "vs last week" }} />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 card-shadow">
            <h3 className="mb-4 text-sm font-semibold">Fleet Status</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-4">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[i] }} />
                  <span className="text-muted-foreground">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 card-shadow">
            <h3 className="mb-4 text-sm font-semibold">Monthly Operational Cost</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={MONTHLY_COSTS}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="cost" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drivers Safety Section */}
        <div className="rounded-xl border bg-card p-6 card-shadow">
          <h3 className="mb-4 text-sm font-semibold">Driver Safety Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Driver</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">License Expiry</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Safety Score</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {DRIVERS.map((d) => (
                  <tr key={d.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.licenseExpiry}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${d.safetyScore}%`,
                              background: d.safetyScore >= 80 ? "hsl(var(--success))" : d.safetyScore >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))",
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{d.safetyScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
