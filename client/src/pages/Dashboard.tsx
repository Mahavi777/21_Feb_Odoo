import { useAuth } from "@/contexts/AuthContext";
import DispatcherDashboard from "@/features/dispatcher/DispatcherDashboard";
import ManagerDashboard from "@/features/manager/ManagerDashboard";
import SafetyDashboard from "@/features/safety/SafetyDashboard";
import FinanceDashboard from "@/features/finance/FinanceDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "dispatcher") {
    return <DispatcherDashboard />;
  }

  if (user?.role === "manager") {
    return <ManagerDashboard />;
  }

  if (user?.role === "safety") {
    return <SafetyDashboard />;
  }

  if (user?.role === "finance") {
    return <FinanceDashboard />;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background text-muted-foreground p-6">
       <div className="text-center max-w-sm">
         <h2 className="text-xl font-bold mb-2">Restricted Access</h2>
         <p className="text-sm">You do not have a role configured for dashboard access.</p>
       </div>
    </div>
  );
}
