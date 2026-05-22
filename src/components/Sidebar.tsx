import { motion } from "motion/react";
import { Calendar, Activity, Zap, Shield, Cpu } from "lucide-react";
import { useTimeline } from "../context/TimelineContext";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const { events, tasks, toggleTask } = useTimeline();

  return (
    <aside className="w-80 flex flex-col gap-6 py-12 shrink-0 animate-in fade-in slide-in-from-right-4 duration-1000">
      {/* Schedule / Tasks Card */}
      <div className="glass-card p-5 border-white/[0.05] group hover:border-white/10 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-vibrant-purple" />
            <h3 className="text-[9px] font-mono font-bold tracking-[0.25em] text-zinc-400 uppercase">Action Queue</h3>
          </div>
          <span className="text-[9px] font-mono text-zinc-700">{tasks.filter(t => !t.completed).length} Pending</span>
        </div>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-lg opacity-40">
              <Zap className="w-4 h-4 text-zinc-600 mb-2" />
              <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Queue Clear</span>
            </div>
          ) : (
            tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all text-left group/task"
              >
                <div className={`w-3.5 h-3.5 rounded border transition-colors flex items-center justify-center shrink-0 ${
                  task.completed ? 'bg-electric-blue border-electric-blue text-black' : 'border-zinc-700'
                }`}>
                  {task.completed && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                </div>
                <span className={`text-[11px] font-medium transition-all ${
                  task.completed ? 'text-zinc-600 line-through' : 'text-zinc-300'
                }`}>
                  {task.title}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="glass-card p-5 border-white/[0.05] flex flex-col min-h-[400px] group hover:border-white/10 transition-all duration-500">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-600 group-hover:text-electric-blue transition-colors" />
            <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-zinc-600 uppercase group-hover:text-zinc-400 transition-colors">
              Timeline
            </span>
          </div>
          <div className="flex gap-1">
            <div className={`w-1 h-1 rounded-full bg-electric-blue ${events.length > 0 ? '' : 'animate-pulse'}`} />
            <div className={`w-1 h-1 rounded-full bg-vibrant-purple ${events.length > 0 ? '' : 'animate-pulse'}`} style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {events.length === 0 ? (
            <>
              <div className="relative pl-6 pb-2">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/[0.03]" />
                <div className="absolute left-[-2px] top-1 w-1 h-1 rounded-full bg-zinc-800" />
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-1">Synchronizing...</p>
                <div className="h-1.5 w-2/3 bg-white/[0.02] rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-full w-1/2 bg-linear-to-r from-transparent via-electric-blue/20 to-transparent"
                  />
                </div>
              </div>
              
              <div className="relative pl-6 opacity-40">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/[0.03]" />
                <div className="absolute left-[-2px] top-1 w-1 h-1 rounded-full bg-zinc-900" />
                <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-widest">Awaiting Command Input</p>
              </div>
            </>
          ) : (
            events.map((event, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`relative pl-6 pb-2 border-l border-white/[0.03] transition-opacity duration-500 ${event.processed ? 'opacity-40' : ''}`}
              >
                <div className={`absolute left-[-2.5px] top-1.5 w-1 h-1 rounded-full transition-colors duration-500 ${
                  event.processed ? 'bg-zinc-700 shadow-none' : 'bg-electric-blue shadow-[0_0_8px_rgba(0,209,255,0.4)]'
                }`} />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-electric-blue/50 tracking-widest uppercase block mb-0.5">{event.time}</span>
                  {event.processed && (
                    <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-tighter">In Queue</span>
                  )}
                </div>
                <p className="text-[11px] font-medium text-zinc-200 leading-tight">{event.title}</p>
                {event.subtitle && <p className="text-[9px] text-zinc-600 font-mono mt-0.5">{event.subtitle}</p>}
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-white/[0.03]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono text-zinc-700 uppercase">System Status</span>
            <span className="text-[9px] font-mono text-electric-blue/50">{events.length > 0 ? "SYNCHRONIZED" : "ACTIVE"}</span>
          </div>
          <p className="text-[10px] text-zinc-700 font-mono italic leading-relaxed tracking-tight group-hover:text-zinc-500 transition-colors">
            {events.length > 0 ? "\"Timeline is state-optimized.\"" : "\"Timeline generation will trigger upon intent detection.\""}
          </p>
        </div>
      </div>
    </aside>
  );
}
