import { motion } from "motion/react";
import { Search, Bell, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 pointer-events-none">
      <div className="flex items-center pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-display font-bold tracking-tighter"
        >
          <span className="text-white">ORBIT</span>
          <span className="text-gradient"> AI</span>
        </motion.div>
      </div>

      <div className="flex-1" /> {/* Spacer to balance logo width */}

      <div className="pointer-events-auto flex items-center gap-6">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-[0.2em] text-electric-blue/70">
            <span className="w-1.5 h-1.5 rounded-full bg-electric-blue animate-pulse" />
            SYSTEM CORE
          </div>
          <div className="text-xl font-mono font-medium text-white tracking-widest tabular-nums">
            {formatTime(time)}
          </div>
        </div>
        <div className="w-px h-8 bg-white/10 mx-2" />
        <div className="text-[10px] font-mono text-zinc-500 text-right leading-tight">
          EPOCH<br/>
          <span className="text-white">392.1-δ</span>
        </div>
      </div>
    </nav>
  );
}
