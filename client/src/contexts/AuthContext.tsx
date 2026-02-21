import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type UserRole = "manager" | "dispatcher" | "safety_officer" | "financial_analyst";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<string, User> = {
  "manager@fleetflow.io": { id: "1", name: "Alex Morgan", email: "manager@fleetflow.io", role: "manager" },
  "dispatch@fleetflow.io": { id: "2", name: "Sam Rivera", email: "dispatch@fleetflow.io", role: "dispatcher" },
  "safety@fleetflow.io": { id: "3", name: "Jordan Lee", email: "safety@fleetflow.io", role: "safety_officer" },
  "finance@fleetflow.io": { id: "4", name: "Casey Kim", email: "finance@fleetflow.io", role: "financial_analyst" },
};

/** Role-based menu access */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  manager: ["dashboard", "vehicles", "trips", "maintenance", "analytics", "drivers"],
  dispatcher: ["dashboard", "vehicles", "trips"],
  safety_officer: ["dashboard", "drivers", "maintenance"],
  financial_analyst: ["dashboard", "analytics", "maintenance"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("fleetflow_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));
    const found = MOCK_USERS[email.toLowerCase()];
    if (!found) {
      setIsLoading(false);
      throw new Error("Invalid credentials. Try manager@fleetflow.io");
    }
    localStorage.setItem("fleetflow_user", JSON.stringify(found));
    setUser(found);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("fleetflow_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
