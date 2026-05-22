import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AssistantUI from "./components/AssistantUI";
import { motion } from "motion/react";
import { TimelineProvider } from "./context/TimelineContext";

export default function App() {
  return (
    <TimelineProvider>
      <div className="relative min-h-screen selection:bg-electric-blue/30 overflow-x-hidden overflow-y-auto bg-[#050505] flex flex-col">
        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[10%] left-[-5%] w-[500px] h-[500px] bg-vibrant-purple/10 blur-[120px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-electric-blue/5 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '-4s' }} />
          
          {/* Film Grain / Noise Overlay */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-noise" />
        </div>

        <Header />
        
        <main className="relative z-10 w-full flex-1 max-w-(--breakpoint-2xl) mx-auto px-8 py-20 flex gap-12">
          <div className="flex-1 min-w-0 relative">
            <AssistantUI />
          </div>
          <Sidebar />
          <div className="w-80 shrink-0 hidden 2xl:block" /> {/* Balance spacer for ultra-wide */}
        </main>

        {/* Decorative Orbital Element */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vw] border border-white/[0.015] rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] border border-white/[0.015] rounded-full"
          />
        </div>
      </div>
    </TimelineProvider>
  );
}

