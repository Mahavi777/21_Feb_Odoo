import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Truck, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required"); return; }
    if (!password.trim()) { setError("Password is required"); return; }
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Truck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">FleetFlow</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your fleet dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 card-shadow-lg space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          <div className="space-y-2">
            <p className="text-center text-xs font-medium text-muted-foreground">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loadDemoAccount("manager@fleetflow.io", "password")}
                className="rounded-lg border border-primary/20 bg-primary/5 px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => loadDemoAccount("dispatch@fleetflow.io", "password")}
                className="rounded-lg border border-primary/20 bg-primary/5 px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                Dispatcher
              </button>
              <button
                type="button"
                onClick={() => loadDemoAccount("safety@fleetflow.io", "password")}
                className="rounded-lg border border-primary/20 bg-primary/5 px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                Safety
              </button>
              <button
                type="button"
                onClick={() => loadDemoAccount("finance@fleetflow.io", "password")}
                className="rounded-lg border border-primary/20 bg-primary/5 px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                Finance
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
