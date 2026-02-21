import { useAuth } from "@/contexts/AuthContext";
import { MaintenanceManager } from "@/features/manager/MaintenanceManager";

export default function Maintenance() {
  const { user } = useAuth();

  if (user?.role === "manager") {
    return <MaintenanceManager />;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background text-muted-foreground p-6">
       <div className="text-center max-w-sm">
         <h2 className="text-xl font-bold mb-2">Restricted Access</h2>
         <p className="text-sm">Maintenance operations are restricted to fleet managers.</p>
       </div>
    </div>
  );
}
