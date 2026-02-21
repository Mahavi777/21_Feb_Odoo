import TopNavbar from "@/components/layout/TopNavbar";
import { useAuth } from "@/contexts/AuthContext";

export default function Analytics() {
  const { user } = useAuth();
  
  if (user?.role !== "manager") {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground p-6">
         <div className="text-center max-w-sm">
           <h2 className="text-xl font-bold mb-2">Restricted Access</h2>
           <p className="text-sm">Analytics are restricted to fleet managers.</p>
         </div>
      </div>
    );
  }

  return (
    <>
      <TopNavbar title="Fleet Analytics" />
      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-muted-foreground space-y-4">
         <p className="text-lg font-medium text-foreground">Analytics Module</p>
         <p>Dynamic Analytics Dashboard coming soon...</p>
      </main>
    </>
  );
}
