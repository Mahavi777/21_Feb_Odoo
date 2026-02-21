import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth, ROLE_PERMISSIONS } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Truck,
  Route,
  Wrench,
  BarChart3,
  Users,
  Shield,
  Fuel,
  ChevronLeft,
  ChevronRight,
  LogOut,
  DollarSign
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { key: "vehicles", label: "Vehicles", icon: Truck, path: "/vehicles" },
  { key: "trips", label: "Trips", icon: Route, path: "/trips" },
  { key: "fuel", label: "Fuel Expenses", icon: Fuel, path: "/fuel" },
  { key: "maintenance", label: "Maintenance", icon: Wrench, path: "/maintenance" },
  { key: "drivers", label: "Drivers", icon: Users, path: "/drivers" },
  { key: "safety", label: "Safety", icon: Shield, path: "/safety" },
  { key: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const allowedKeys = user && ROLE_PERMISSIONS[user.role] ? ROLE_PERMISSIONS[user.role] : [];
  const visibleItems = NAV_ITEMS.filter((item) => allowedKeys.includes(item.key));

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            FF
          </div>
          {!collapsed && <span className="font-semibold text-sm whitespace-nowrap">FleetFlow</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-2 space-y-1">
        {user && !collapsed && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role.replace("_", " ")}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
