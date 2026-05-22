import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Paperclip, Mic, Sparkles, User, Bot } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { sendMessageStream } from "../services/geminiService";
import { useTimeline } from "../context/TimelineContext";

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AssistantUI() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addEvent, addTask } = useTimeline();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    try {
      let fullResponse = "";
      const stream = sendMessageStream(currentInput, history);
      
      setMessages(prev => [...prev, { role: 'model', content: "" }]);

      for await (const chunk of stream) {
        fullResponse += chunk;
        
        // Extract multiple Events
        const eventMatches = Array.from(fullResponse.matchAll(/\[EVENT: (.*?) \| (.*?)\]/g));
        eventMatches.forEach(match => {
          addEvent({ title: match[1].trim(), time: match[2].trim() });
        });

        // Extract multiple Tasks
        const taskMatches = Array.from(fullResponse.matchAll(/\[TASK: (.*?)\]/g));
        taskMatches.forEach(match => {
          addTask(match[1].trim());
        });

        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'model') {
            return [...prev.slice(0, -1), { role: 'model', content: fullResponse }];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const isInitialState = messages.length === 0;

  return (
    <div className={`flex flex-col items-center h-full max-w-4xl mx-auto py-12 transition-all duration-700 ${isInitialState ? 'justify-center' : 'justify-start'}`}>
      <AnimatePresence mode="wait">
        {isInitialState ? (
          <motion.div
            key="initial"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -40 }}
            className="flex flex-col items-center px-8"
          >
            <motion.div className="relative mb-10">
              <div className="absolute inset-0 bg-linear-to-br from-vibrant-purple/30 to-electric-blue/30 blur-3xl rounded-full" />
              <div className="relative glass w-20 h-20 rounded-2xl flex items-center justify-center border-white/20 shadow-2xl">
                <Sparkles className="w-10 h-10 text-electric-blue" />
              </div>
            </motion.div>

            <motion.h1 className="text-6xl font-display font-bold text-white mb-6 tracking-tight text-center leading-none">
              How can I assist you?
            </motion.h1>

            <motion.p className="text-zinc-500 text-xl mb-16 text-center max-w-lg leading-relaxed font-medium">
              Streamline your workflow with deep intelligence.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-10 mb-48 px-4"
          >
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                className={`flex gap-6 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'model' && (
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center shrink-0 border-white/10 mt-1">
                    <Bot className="w-5 h-5 text-vibrant-purple shadow-[0_0_10px_rgba(188,19,254,0.3)]" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-6 py-4 flex flex-col gap-2 overflow-hidden ${
                  message.role === 'user' 
                    ? 'glass bg-white/[0.04] border-white/10 text-white rounded-tr-sm shadow-xl' 
                    : 'text-zinc-200 leading-relaxed bg-transparent border-none'
                }`}>
                  <div className="text-[16px] max-w-full overflow-hidden break-words prose prose-invert prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-code:text-electric-blue">
                    <ReactMarkdown>
                      {message.content
                        .replace(/\[EVENT: (.*?) \| (.*?)\]/g, '')
                        .replace(/\[TASK: (.*?)\]/g, '')}
                    </ReactMarkdown>
                  </div>
                  {message.role === 'model' && message.content === "" && (
                    <div className="flex gap-2 mt-3">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-vibrant-purple" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-electric-blue" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-vibrant-purple" />
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center shrink-0 border-white/10 mt-1">
                    <User className="w-5 h-5 text-electric-blue shadow-[0_0_10px_rgba(0,209,255,0.3)]" />
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-8 z-50"
      >
        <div className="relative group w-full">
          <div className="absolute -inset-[1px] bg-linear-to-r from-vibrant-purple to-electric-blue rounded-2xl opacity-10 blur-[2px] pointer-events-none group-focus-within:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative glass rounded-2xl p-4 flex items-center gap-4 border-white/10 shadow-2xl bg-[#0a0a0a]/80">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Deploy a command or query..."
              className="flex-1 bg-transparent border-none outline-hidden text-[17px] text-white placeholder:text-zinc-800 px-4 font-medium"
              disabled={isTyping}
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || !inputValue.trim()}
              className="p-3 bg-electric-blue text-black rounded-xl hover:scale-[1.03] active:scale-95 transition-all shadow-[0_0_25px_rgba(0,209,255,0.3)] disabled:opacity-20 disabled:scale-100 disabled:grayscale cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="w-6 h-6 border-black" />
            </button>
          </div>

          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-12">
            <button className="flex items-center gap-2 text-[9px] font-mono font-bold tracking-[0.3em] text-zinc-700 uppercase hover:text-zinc-400 transition-colors group/btn">
              <Paperclip className="w-3 h-3 group-hover/btn:text-electric-blue" />
              Attach
            </button>
            <button className="flex items-center gap-2 text-[9px] font-mono font-bold tracking-[0.3em] text-zinc-700 uppercase hover:text-zinc-400 transition-colors group/btn">
              <Mic className="w-3 h-3 group-hover/btn:text-vibrant-purple" />
              Voice
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
