import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  Sparkles, 
  X, 
  User, 
  Compass, 
  Calendar,
  BookOpen,
  Search,
  Trophy,
  Activity,
  HelpCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome to Vignan Universe! I am **VYOMA**, your campus AI companion.\n\nHow can I help you today?"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    // Add user message
    const updatedMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(updatedMessages);
    if (!textToSend) {
      setInputText('');
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: updatedMessages.slice(1, -1), // Exclude greeting and last prompt for API history
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned an error');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I apologize, but I'm having trouble connecting to Vyoma's NLP engine at the moment. Please try again soon!" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseBoldText = (text: string) => {
    // Splits by **bold** tags
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-black text-rose-300 drop-shadow-[0_1px_4px_rgba(244,63,94,0.15)] bg-slate-900/40 px-1 py-0.5 rounded border border-slate-800/50">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      
      // Support standard bullets
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const text = trimmed.substring(2);
        return (
          <li key={i} className="ml-4 list-disc text-slate-300 text-xs mb-1.5 leading-relaxed">
            {parseBoldText(text)}
          </li>
        );
      }
      
      if (trimmed === '') return <div key={i} className="h-2.5" />;
      
      return (
        <p key={i} className="text-xs text-slate-300 mb-1.5 leading-relaxed">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const quickPrompts = [
    { label: 'SAC Clubs', text: 'Which Student Activity Council (SAC) clubs are registered, and who are their presidents?', icon: Trophy },
    { label: 'Library Access', text: 'Search the library directory and let me know which programming books have copies available.', icon: BookOpen },
    { label: 'Active Notices', text: 'What are the latest notice announcements active on the board?', icon: Search },
    { label: 'Fest Events', text: 'What fests, technical coding hackathons, or workshops are upcoming?', icon: Calendar }
  ];

  return (
    <div id="vignanverse-chatbot" className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 35, scale: 0.85 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="w-85 sm:w-100 h-[530px] bg-slate-950/95 border border-indigo-900/40 rounded-[30px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85),_0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-2xl flex flex-col mb-4"
          >
            {/* Header with dynamic glass effect */}
            <div className="p-4 bg-gradient-to-r from-violet-950/80 via-slate-900/90 to-indigo-950/80 border-b border-indigo-950/80 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white relative shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                  <Sparkles size={18} className="animate-pulse" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-ping" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-indigo-100 to-cyan-100 flex items-center gap-1.5 uppercase italic">
                    VYOMA CORE AI <Activity size={12} className="text-cyan-400" />
                  </h4>
                  <p className="text-[9px] text-cyan-400 font-black uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
                    CAMPUS AI ENGINE ACTIVE
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-inner"
              >
                <X size={15} />
              </button>
            </div>

            {/* Content & History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth no-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950/40 to-slate-950">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex gap-2.5 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs shadow-md border-b",
                    msg.role === 'user' 
                      ? "bg-slate-850 hover:bg-slate-800 text-slate-350 border-slate-800" 
                      : "bg-indigo-950/90 border border-violet-500/20 text-violet-400"
                  )}>
                    {msg.role === 'user' ? <User size={13} /> : <Sparkles size={13} className="text-indigo-400" />}
                  </div>
                  <div className={cn(
                    "p-3.5 rounded-2xl relative shadow-md",
                    msg.role === 'user'
                      ? "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-tr-none shadow-[0_4px_16px_rgba(99,102,241,0.25)] border border-indigo-500/30"
                      : "bg-slate-900/90 border border-indigo-950 text-slate-200 rounded-tl-none shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                  )}>
                    {msg.role === 'user' ? (
                      <p className="text-xs font-semibold leading-relaxed text-indigo-50">{msg.content}</p>
                    ) : (
                      <div className="space-y-1.5">
                        {renderMessageContent(msg.content)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 max-w-[85%] mr-auto">
                  <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-violet-500/20 text-indigo-400 flex items-center justify-center shadow-md">
                    <Sparkles size={13} className="animate-spin text-cyan-400" />
                  </div>
                  <div className="p-4 bg-slate-900 border border-indigo-950 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Chips when chat is near empty or as guides */}
            <div className="px-4 py-2.5 border-t border-indigo-950/60 bg-slate-950/80">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                <Compass size={11} className="text-cyan-400 animate-spin [animation-duration:15s]" /> Vyoma Campus Quick-Tabs:
              </p>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {quickPrompts.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(p.text)}
                      className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-indigo-950 hover:border-violet-850 rounded-xl text-[9.5px] font-bold text-slate-400 hover:text-white transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-sm"
                    >
                      <Icon size={11} className="text-cyan-400" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-slate-950 border-t border-indigo-950/60 flex gap-2">
              <input
                type="text"
                placeholder="Ask Vyoma about campus clubs, library, events..."
                className="flex-1 bg-slate-900/90 border border-indigo-950/80 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-violet-500/50 focus:bg-slate-900 transition-all shadow-inner"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  inputText.trim() && !isLoading 
                    ? "bg-gradient-to-tr from-violet-600 to-indigo-600 text-white hover:brightness-115 shadow-md shadow-violet-500/20 cursor-pointer active:scale-95" 
                    : "bg-slate-900 border border-indigo-950 text-slate-600 cursor-not-allowed"
                )}
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-15 h-15 rounded-full flex items-center justify-center text-white relative transition-all outline-none border cursor-pointer",
          isOpen 
            ? "bg-slate-950 border-slate-850 hover:bg-slate-900 text-violet-400 shadow-[0_4px_25px_rgba(0,0,0,0.5)]" 
            : "bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 border-violet-500/20 shadow-[0_8px_30px_rgba(139,92,246,0.45)] hover:shadow-[0_8px_40px_rgba(139,92,246,0.6)]"
        )}
      >
        {isOpen ? (
          <X size={24} className="text-cyan-405" />
        ) : (
          <>
            <MessageSquare size={24} className="text-indigo-50" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 border-2 border-slate-950 rounded-full animate-pulse flex items-center justify-center text-[8px] font-black text-white">
              AI
            </span>
          </>
        )}
      </motion.button>
    </div>
  );
};
