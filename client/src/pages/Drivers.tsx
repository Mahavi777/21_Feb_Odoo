import { useAuth } from "@/contexts/AuthContext";
import DispatcherDashboard from "@/features/dispatcher/DispatcherDashboard";
import { DriverManager } from "@/features/manager/DriverManager";

export default function Drivers() {
  const { user } = useAuth();

  if (user?.role === "manager") {
    return <DriverManager />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 h-full text-center">
      <h2 className="text-xl font-bold mb-2">Restricted Area</h2>
      <p className="text-muted-foreground">Driver Management features are restricted to Fleet Managers.</p>
    </div>
  );
}
