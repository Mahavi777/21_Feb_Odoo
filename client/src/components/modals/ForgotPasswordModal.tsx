import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle, Mail } from "lucide-react";
import { AnimatedProgress } from "../ui/AnimatedProgress";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const [isError, setIsError] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setStage(0);
      setIsError(false);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stage === 0) {
        onClose();
      }
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, stage, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setIsError(true);
      return;
    }

    setIsError(false);
    setStage(1);

    // Simulate API call and flow:
    try {
      // Stage 1: Checking email existence (800ms)
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Stage 2: Generating reset token (1000ms)
      setStage(2);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Stage 3: Verification complete (500ms)
      setStage(3);
    } catch (err) {
      setIsError(true);
      setStage(0);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-background/40 backdrop-blur-sm"
          onClick={() => stage === 0 && onClose()}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={
            isError
              ? { x: [-8, 8, -4, 4, 0], opacity: 1, scale: 1, y: 0 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: isError ? 0.4 : 0.2, ease: "easeInOut" }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border bg-card/80 p-6 shadow-xl backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={stage === 1 || stage === 2}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Reset Password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email to receive a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="sr-only">Email address</label>
              <motion.input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isError) setIsError(false);
                }}
                disabled={stage > 0}
                placeholder="you@company.com"
                className={`w-full rounded-xl border bg-background/50 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:bg-background ${
                  isError
                    ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                    : "focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
                animate={{
                  boxShadow: isError ? "0 0 10px rgba(239,68,68,0.3)" : "none",
                }}
              />
              {isError && (
                <p className="mt-1.5 text-xs text-destructive">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            <div className="h-16 flex items-center justify-center pt-2">
              <AnimatePresence mode="wait">
                {stage === 0 && (
                  <motion.button
                    key="submit"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30"
                  >
                    Send Reset Link
                  </motion.button>
                )}

                {stage === 1 && (
                  <motion.div
                    key="stage1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex w-full flex-col items-center justify-center space-y-3"
                    aria-live="polite"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </motion.div>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Checking your email<motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >...</motion.span>
                    </motion.p>
                  </motion.div>
                )}

                {stage === 2 && (
                  <motion.div
                    key="stage2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex w-full flex-col items-center justify-center space-y-3 px-4"
                    aria-live="polite"
                  >
                    <AnimatedProgress value={80} />
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Generating secure reset link...
                    </motion.p>
                  </motion.div>
                )}

                {stage === 3 && (
                  <motion.div
                    key="stage3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: [0.8, 1.1, 1] }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative flex w-full flex-col items-center justify-center space-y-2"
                    aria-live="polite"
                  >
                    <div className="relative">
                      {/* Subtle Confetti / Splash */}
                      <motion.div
                        className="absolute -inset-6 z-0"
                        initial={{ opacity: 1, scale: 0.5 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      >
                        <div className="absolute top-2 left-1/4 h-1.5 w-1.5 rounded-full bg-green-400" />
                        <div className="absolute bottom-2 right-1/4 h-1.5 w-1.5 rounded-full bg-blue-400" />
                        <div className="absolute top-1/2 -left-2 h-1.5 w-1.5 rounded-full bg-yellow-400" />
                        <div className="absolute top-1/2 -right-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      </motion.div>

                      <motion.div
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(34,197,94,0)",
                            "0 0 20px 5px rgba(34,197,94,0.3)",
                            "0 0 0 0 rgba(34,197,94,0)",
                          ],
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-500"
                      >
                        <CheckCircle className="h-6 w-6" />
                        
                        {/* Shimmer effect over check icon */}
                        <motion.div 
                          className="absolute inset-0 overflow-hidden rounded-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="h-full w-1/2 bg-white/30 skew-x-12"
                            animate={{ x: ["-200%", "200%"] }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                          />
                        </motion.div>
                      </motion.div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Email verified. Reset link sent!
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Please check your inbox.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}