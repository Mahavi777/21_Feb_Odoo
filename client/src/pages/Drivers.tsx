import TopNavbar from "@/components/layout/TopNavbar";
import StatusPill from "@/components/StatusPill";
import { DRIVERS } from "@/data/mockData";

export default function Drivers() {
  return (
    <>
      <TopNavbar title="Driver Safety" />
      <main className="flex-1 overflow-y-auto p-6 space-y-4 animate-fade-in">
        <div className="rounded-xl border bg-card overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Driver</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">License Expiry</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Safety Score</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {DRIVERS.map((d) => (
                  <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.licenseExpiry}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${d.safetyScore}%`,
                              background: d.safetyScore >= 80 ? "hsl(var(--success))" : d.safetyScore >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))",
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{d.safetyScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={d.status} /></td>
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
