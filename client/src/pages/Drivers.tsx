import { useAuth } from "@/contexts/AuthContext";
import { DriverManager } from "@/features/manager/DriverManager";
import SafetyDrivers from "@/features/safety/Drivers";
import DispatcherDrivers from "@/features/dispatcher/DispatcherDrivers";

export default function Drivers() {
  const { user } = useAuth();

  if (user?.role === "manager") {
    return <DriverManager />;
  }

  if (user?.role === "safety") {
    return <SafetyDrivers />;
  }

  if (user?.role === "dispatcher") {
    return <DispatcherDrivers />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 h-full text-center">
      <h2 className="text-xl font-bold mb-2">Restricted Area</h2>
      <p className="text-muted-foreground">Driver Management features are restricted to authorized personnel.</p>
    </div>
  );
}
