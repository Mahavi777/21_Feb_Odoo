import { motion } from "framer-motion";

interface AnimatedProgressProps {
  value: number;
}

export function AnimatedProgress({ value }: AnimatedProgressProps) {
  return (
    <div className="h-1.5 w-full bg-primary/20 rounded-full overflow-hidden relative">
      <motion.div
        className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        initial={{ width: "30%" }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 bg-white/20"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
}