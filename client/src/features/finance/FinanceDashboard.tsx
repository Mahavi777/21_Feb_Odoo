import TopNavbar from "@/components/layout/TopNavbar";

export default function FinanceDashboard() {
  return (
    <>
      <TopNavbar title="Finance Dashboard" />
      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-muted-foreground space-y-4">
         <p className="text-lg font-medium text-foreground">Finance Module</p>
         <p>Finance dashboard content coming soon...</p>
      </main>
    </>
  );
}
