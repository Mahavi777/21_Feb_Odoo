import TopNavbar from "@/components/layout/TopNavbar";
import { FUEL_EFFICIENCY, VEHICLE_ROI, MONTHLY_COSTS } from "@/data/mockData";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

export default function Analytics() {
  const exportCSV = () => {
    const rows = MONTHLY_COSTS.map((r) => `${r.month},${r.cost}`);
    const csv = "Month,Cost\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fleetflow_costs.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const exportPDF = () => {
    toast.info("PDF export would be triggered here (requires backend)");
  };

  return (
    <>
      <TopNavbar title="Analytics" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Fleet performance insights</p>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button onClick={exportPDF} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 card-shadow">
            <h3 className="mb-4 text-sm font-semibold">Fuel Efficiency (km/L)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={FUEL_EFFICIENCY}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="vehicle" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="efficiency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-card p-6 card-shadow">
            <h3 className="mb-4 text-sm font-semibold">Vehicle ROI (%)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={VEHICLE_ROI}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="vehicle" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="roi" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 card-shadow">
          <h3 className="mb-4 text-sm font-semibold">Monthly Operational Cost ($)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={MONTHLY_COSTS}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="cost" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </>
  );
}
