import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type UserRole = "manager" | "dispatcher" | "safety" | "finance";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const API_BASE_URL = "http://localhost:5000/api";

/** Role-based menu access */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  manager: ["dashboard", "vehicles", "trips", "maintenance", "analytics", "drivers"],
  dispatcher: ["dashboard", "vehicles", "trips"],
  safety: ["dashboard", "drivers", "maintenance"],
  finance: ["dashboard", "analytics", "finance"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("fleetflow_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("fleetflow_token");
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      const data = await response.json();
      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      };

      localStorage.setItem("fleetflow_token", data.token);
      localStorage.setItem("fleetflow_user", JSON.stringify(userData));
      setToken(data.token);
      setUser(userData);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || "Login failed");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("fleetflow_user");
    localStorage.removeItem("fleetflow_token");
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
