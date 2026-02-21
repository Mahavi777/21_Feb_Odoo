import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Vehicles from "@/pages/Vehicles";
import Trips from "@/pages/Trips";
import Maintenance from "@/pages/Maintenance";
import Drivers from "@/pages/Drivers";
import SafetyDashboard from "@/features/safety/SafetyDashboard";
import SafetyDrivers from "@/features/safety/Drivers";
import Incidents from "@/features/safety/Incidents";
import Analytics from "@/pages/Analytics";
import FinanceDashboard from "@/pages/FinanceDashboard";
import FuelLogs from "@/pages/FuelLogs";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/drivers" element={<Drivers />} />
                <Route path="/fuel" element={<FuelLogs />} />
                <Route path="/safety" element={<SafetyDashboard />} />
                <Route path="/safety/drivers" element={<SafetyDrivers />} />
                <Route path="/safety/incidents" element={<Incidents />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/finance" element={<FinanceDashboard />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
