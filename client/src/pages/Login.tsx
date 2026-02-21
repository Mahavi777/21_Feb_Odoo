import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Truck, Loader2, Moon, Sun, CheckCircle2 } from "lucide-react";
import { ForgotPasswordModal } from "@/components/modals/ForgotPasswordModal";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("manager@fleetflow.io");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: boolean; password?: boolean }>({});
  
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // Enforce dark mode on load and handle toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleLoginError = (msg: string, fields: { email?: boolean; password?: boolean }) => {
    setError(msg);
    setFieldErrors(fields);
    // Remove shake trigger after animation duration
    setTimeout(() => setFieldErrors({}), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!email.trim()) {
      handleLoginError("Email is required", { email: true });
      return;
    }
    if (!password.trim()) {
      handleLoginError("Password is required", { password: true });
      return;
    }

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      handleLoginError(err.message, { email: true, password: true });
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground transition-colors duration-500 overflow-hidden">
      
      {/* 🟦 LEFT PANEL (60%) - Hidden on Mobile */}
      <motion.div 
        className="hidden lg:flex flex-col relative w-[60%] bg-slate-950 overflow-hidden"
        initial={{ x: "-50%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Subtle Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-950 to-slate-950 animate-pulse" style={{ animationDuration: '10s' }} />
        
        {/* Subtle Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 flex flex-col h-full justify-between p-12 lg:p-16 xl:p-24">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <Truck className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">FleetFlow</span>
          </div>

          {/* Main Content */}
          <div className="mt-auto mb-auto max-w-2xl">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Command Your Fleet <br />
              <span className="text-indigo-400">With Precision.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-xl">
              Real-time fleet lifecycle management, driver compliance tracking, and operational analytics — all in one intelligent control center.
            </p>

            {/* Feature Bullets */}
            <div className="mt-10 space-y-4">
              {[
                "Real-time Tracking",
                "Automated Dispatch Logic",
                "Operational Analytics"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>

      {/* 🟩 RIGHT PANEL (40%) - Login Card */}
      <div className="relative flex w-full lg:w-[40%] flex-col items-center justify-center p-4 sm:p-8 bg-background transition-colors duration-500">
        
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute right-6 top-6 rounded-full p-2.5 bg-secondary text-secondary-foreground shadow-sm transition-all hover:bg-secondary/80 hover:scale-105 active:scale-95"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <motion.div 
          className="w-full max-w-[420px]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          {/* Mobile Logo Fallback */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <Truck className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">FleetFlow</h1>
          </div>

          <div className="rounded-2xl border bg-card p-10 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-card-foreground">Secure Access</h2>
              <p className="mt-2 text-sm text-muted-foreground">Sign in to your FleetFlow control panel.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
                >
                  {error}
                </motion.div>
              )}

              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
                
                {/* Email Field */}
                <motion.div variants={staggerItem}>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground transition-colors focus-within:text-indigo-500">
                    Email
                  </label>
                  <motion.div
                    animate={fieldErrors.email ? { x: [-6, 6, -4, 4, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="relative"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50
                        ${fieldErrors.email 
                          ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10" 
                          : "border-border hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        }`}
                      placeholder="you@company.com"
                    />
                  </motion.div>
                </motion.div>

                {/* Password Field */}
                <motion.div variants={staggerItem}>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground transition-colors focus-within:text-indigo-500">
                    Password
                  </label>
                  <motion.div
                    animate={fieldErrors.password ? { x: [-6, 6, -4, 4, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="relative"
                  >
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/50
                        ${fieldErrors.password 
                          ? "border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10" 
                          : "border-border hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        }`}
                      placeholder="••••••••"
                    />
                  </motion.div>
                </motion.div>

                {/* Options */}
                <motion.div variants={staggerItem} className="flex items-center justify-between mt-6">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="rounded border-border text-indigo-600 focus:ring-indigo-500/20 transition-all cursor-pointer group-hover:border-indigo-500" 
                    /> 
                    <span className="group-hover:text-foreground transition-colors">Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                  >
                    Forgot password?
                  </button>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={staggerItem} className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                    {isLoading ? "Authenticating..." : "Sign In"}
                  </motion.button>
                </motion.div>

              </motion.div>

            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-muted-foreground tracking-wide">
              Enterprise-grade security • Role-based access control
            </p>
          </div>
        </motion.div>

      </div>

      <ForgotPasswordModal 
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
      />
    </div>
  );
}
