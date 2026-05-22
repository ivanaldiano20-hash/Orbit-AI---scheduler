import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TimelineEvent {
  time: string;
  title: string;
  subtitle?: string;
  processed?: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface TimelineContextType {
  events: TimelineEvent[];
  tasks: Task[];
  addEvent: (event: TimelineEvent) => void;
  addTask: (task: string) => void;
  toggleTask: (id: string) => void;
  clearAll: () => void;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = React.useCallback((title: string) => {
    setTasks(prev => {
      if (prev.some(t => t.title === title)) return prev;
      return [...prev, { id: Math.random().toString(36).substr(2, 9), title, completed: false }];
    });
  }, []);

  const toggleTask = React.useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  // Monitor time to move events to action queue
  React.useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

      setEvents(prevEvents => {
        const toProcess = prevEvents.filter(e => !e.processed && currentTime >= e.time);
        if (toProcess.length === 0) return prevEvents;

        // Add to tasks
        toProcess.forEach(e => addTask(e.title));

        // Mark as processed
        return prevEvents.map(event => {
          if (!event.processed && currentTime >= event.time) {
            return { ...event, processed: true };
          }
          return event;
        });
      });
    };

    const interval = setInterval(checkTime, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [addTask]); // Include addTask in dependencies

  const addEvent = (event: TimelineEvent) => {
    setEvents(prev => {
      if (prev.some(e => e.title === event.title && e.time === event.time)) return prev;
      return [...prev, { ...event, processed: false }].sort((a, b) => a.time.localeCompare(b.time));
    });
  };

  const clearAll = () => {
    setEvents([]);
    setTasks([]);
  };

  return (
    <TimelineContext.Provider value={{ events, tasks, addEvent, addTask, toggleTask, clearAll }}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
}
