import { useState } from "react";
import TopNavbar from "@/components/layout/TopNavbar";
import KPICard from "@/components/KPICard";
import StatusPill from "@/components/StatusPill";
import { DRIVERS } from "@/data/mockData";
import { Users, AlertTriangle, TrendingUp, Award, Calendar } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

const DRIVER_STATUS_COLORS = {
  on_duty: "hsl(142,71%,45%)",
  off_duty: "hsl(220,9%,46%)",
  suspended: "hsl(0,84%,60%)",
};

export default function Dashboard() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [driverDetails, setDriverDetails] = useState<Record<string, boolean>>({});

  const today = new Date("2026-02-21");
  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredDrivers = DRIVERS.filter((d) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "compliance") return getDaysUntilExpiry(d.licenseExpiry) <= 30;
    return d.status === statusFilter;
  });

  const activeDrivers = DRIVERS.filter((d) => d.status === "on_duty").length;
  const complianceAlerts = DRIVERS.filter((d) => getDaysUntilExpiry(d.licenseExpiry) <= 30).length;
  const avgSafetyScore = Math.round(DRIVERS.reduce((sum, d) => sum + d.safetyScore, 0) / DRIVERS.length);
  const suspendedCount = DRIVERS.filter((d) => d.status === "suspended").length;

  const safetyDistribution = [
    { range: "Excellent (80+)", count: DRIVERS.filter((d) => d.safetyScore >= 80).length },
    { range: "Good (60-79)", count: DRIVERS.filter((d) => d.safetyScore >= 60 && d.safetyScore < 80).length },
    { range: "Poor (<60)", count: DRIVERS.filter((d) => d.safetyScore < 60).length },
  ];

  const toggleDriverDetails = (driverId: string) => {
    setDriverDetails((prev) => ({
      ...prev,
      [driverId]: !prev[driverId],
    }));
  };

  return (
    <>
      <TopNavbar title="Driver Performance & Safety Profiles" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border bg-card px-3 py-1.5 text-sm"
          >
            <option value="all">All Drivers</option>
            <option value="on_duty">On Duty</option>
            <option value="off_duty">Off Duty</option>
            <option value="suspended">Suspended</option>
            <option value="compliance">Compliance Alerts</option>
          </select>
        </div>

        {/* KPI Cards - Driver Performance Focused */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Active Drivers" value={activeDrivers} icon={Users} trend={{ value: 2.5, label: "vs last month" }} />
          <KPICard
            title="Compliance Alerts"
            value={complianceAlerts}
            icon={AlertTriangle}
            trend={{ value: complianceAlerts > 0 ? -15 : 0, label: "License expiry soon" }}
          />
          <KPICard title="Avg Safety Score" value={`${avgSafetyScore}%`} icon={Award} trend={{ value: 4.2, label: "vs last month" }} />
          <KPICard
            title="Drivers Needing Review"
            value={suspendedCount}
            icon={AlertTriangle}
            trend={{ value: -1, label: "Suspended status" }}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 card-shadow">
            <h3 className="mb-4 text-sm font-semibold">Safety Score Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={safetyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-card p-6 card-shadow">
            <h3 className="mb-4 text-sm font-semibold">Driver Status Overview</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={[
                    { name: "On Duty", value: DRIVERS.filter((d) => d.status === "on_duty").length },
                    { name: "Off Duty", value: DRIVERS.filter((d) => d.status === "off_duty").length },
                    { name: "Suspended", value: DRIVERS.filter((d) => d.status === "suspended").length },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={4}
                >
                  <Cell fill={DRIVER_STATUS_COLORS.on_duty} />
                  <Cell fill={DRIVER_STATUS_COLORS.off_duty} />
                  <Cell fill={DRIVER_STATUS_COLORS.suspended} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: DRIVER_STATUS_COLORS.on_duty }} />
                <span className="text-muted-foreground">On Duty: {DRIVERS.filter((d) => d.status === "on_duty").length}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: DRIVER_STATUS_COLORS.off_duty }} />
                <span className="text-muted-foreground">Off Duty: {DRIVERS.filter((d) => d.status === "off_duty").length}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: DRIVER_STATUS_COLORS.suspended }} />
                <span className="text-muted-foreground">Suspended: {DRIVERS.filter((d) => d.status === "suspended").length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Performance & Compliance Section */}
        <div className="rounded-xl border bg-card p-6 card-shadow">
          <h3 className="mb-4 text-sm font-semibold">Driver Performance & Compliance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Driver</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">License Expiry</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Safety Score</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Trip Completion</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((d) => {
                  const daysUntilExpiry = getDaysUntilExpiry(d.licenseExpiry);
                  const isExpired = daysUntilExpiry < 0;
                  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                  return (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{d.name}</td>
                      <td className={`px-4 py-3 ${
                        isExpired
                          ? "text-destructive font-semibold"
                          : isExpiringSoon
                            ? "text-warning font-semibold"
                            : "text-muted-foreground"
                      }`}>
                        <div className="flex items-center gap-2">
                          {d.licenseExpiry}
                          {isExpired && (
                            <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">EXPIRED</span>
                          )}
                          {isExpiringSoon && (
                            <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {daysUntilExpiry}d
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${d.safetyScore}%`,
                                background:
                                  d.safetyScore >= 80
                                    ? "hsl(var(--success))"
                                    : d.safetyScore >= 60
                                      ? "hsl(var(--warning))"
                                      : "hsl(var(--destructive))",
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{d.safetyScore}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-success" />
                          <span className="text-xs font-medium">{d.tripCompletionRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={d.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance & Assignments Alert */}
        {complianceAlerts > 0 && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 card-shadow">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-warning">License Compliance Alert</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {complianceAlerts} driver(s) have licenses expiring within 30 days. These drivers are blocked from new trip assignments until their licenses are renewed.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
