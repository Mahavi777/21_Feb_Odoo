import { Navigate } from "react-router-dom";
import { useAuth, ROLE_PERMISSIONS } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If a specific role is required, check if user has access
  if (requiredRole && user) {
    const allowedAccess = ROLE_PERMISSIONS[user.role]?.includes(requiredRole);
    if (!allowedAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
