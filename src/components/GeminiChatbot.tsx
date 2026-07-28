import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Bot, Trash2, RefreshCw, AlertCircle, MessageSquare, Zap, Brain } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export default function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<'standard' | 'low-latency' | 'thinking'>('standard');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialSuggestions = [
    "What is today's menu?",
    "Show subscription plans",
    "How can I skip a meal?",
    "Are soft ghee rotis included?"
  ];

  // Set initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: "Namaste! 🙏 I am your **PUREATY AI Tiffin Guide**. I can help you with today's homemade menu, subscription details, policies, or answer any nutritional questions. What's on your mind today?",
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom whenever messages list or open state changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [messages, isOpen]);

  // Listen for custom close event from other panels
  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    window.addEventListener('close-gemini-panel', handleClose);
    return () => window.removeEventListener('close-gemini-panel', handleClose);
  }, []);

  // When state changes to open, dispatch close to other panels
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('close-whatsapp-panel'));
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Gather chat history to send to server
      // Format history: exclude welcome message and limit to last 10 exchanges for token safety
      const relevantHistory = messages
        .filter(m => m.id !== 'welcome')
        .slice(-10)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: relevantHistory,
          mode: aiMode
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.text || "I apologize, I didn't receive a clear response. How else can I assist you?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error("Gemini Chat Error:", err);
      setError(err?.message || "Something went wrong. Please verify that the Gemini API key is configured.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: "Chat history cleared. I'm ready to help you with anything else about our healthy homemade tiffin service! 🍲",
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  // Helper function to format bold and paragraph text simple markdown
  const renderMessageContent = (text: string) => {
    // Process simple bold markdown **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-extrabold text-orange-400 dark:text-orange-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 z-40 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
        title="Ask PUREATY AI Assistant"
        id="floating-gemini-btn"
      >
        <Sparkles size={20} className="animate-pulse shrink-0" />
        
        {/* Visual Cue Badge */}
        <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-400"></span>
        </span>
      </button>

      {/* Chat Dialogue Overlay Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-[380px] h-[520px] z-50 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans"
            id="gemini-chatbot-window"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-neutral-900 to-neutral-850 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                  <Bot size={20} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    PUREATY AI Guide
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  </h4>
                  <p className="text-[10px] text-neutral-400 font-medium">Healthy Food Advisor • Active</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                  title="Clear Conversation"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                  title="Close Chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Dynamic Model Mode Selector */}
            <div className="bg-neutral-950 border-b border-neutral-850 px-3.5 py-2 flex items-center justify-between gap-1">
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider shrink-0">AI Engine:</span>
              <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 w-full max-w-[240px]">
                <button
                  onClick={() => setAiMode('low-latency')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md text-[9px] font-extrabold tracking-tight transition-all ${
                    aiMode === 'low-latency'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Super fast, low-latency responses using Gemini 3.1 Flash Lite"
                >
                  <Zap size={10} className={aiMode === 'low-latency' ? 'animate-bounce' : ''} />
                  <span>Speed</span>
                </button>
                <button
                  onClick={() => setAiMode('standard')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md text-[9px] font-extrabold tracking-tight transition-all ${
                    aiMode === 'standard'
                      ? 'bg-neutral-850 text-orange-400 border border-neutral-800 font-black'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Balanced capability and speed using Gemini 3.5 Flash"
                >
                  <Sparkles size={10} />
                  <span>Standard</span>
                </button>
                <button
                  onClick={() => setAiMode('thinking')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md text-[9px] font-extrabold tracking-tight transition-all ${
                    aiMode === 'thinking'
                      ? 'bg-purple-600 text-white shadow-sm font-black'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Advanced reasoning and high-thinking model using Gemini 3.1 Pro"
                >
                  <Brain size={10} className={aiMode === 'thinking' ? 'animate-pulse' : ''} />
                  <span>Thinker</span>
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-orange-500 text-white rounded-tr-none'
                        : 'bg-neutral-850 border border-neutral-800 text-neutral-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{renderMessageContent(msg.content)}</p>
                    <span className="text-[9px] text-neutral-500 dark:text-neutral-400 block mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Loader Dot Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-850 border border-neutral-800 rounded-2xl rounded-tl-none px-4 py-3 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    {aiMode === 'thinking' && (
                      <span className="text-[8px] text-purple-400 font-extrabold tracking-wider uppercase animate-pulse">
                        🧠 Thinking deeply...
                      </span>
                    )}
                    {aiMode === 'low-latency' && (
                      <span className="text-[8px] text-orange-400 font-extrabold tracking-wider uppercase animate-pulse">
                        ⚡ Quick responding...
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Error Box */}
              {error && (
                <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-2xl text-red-400 text-[11px] flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-extrabold">Service Unavailable</p>
                    <p className="opacity-80 mt-0.5">{error}</p>
                    <button
                      onClick={() => handleSendMessage(messages[messages.length - 1]?.content || "Hello")}
                      className="mt-2 text-xs font-extrabold text-orange-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={10} /> Retry
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 py-2 border-t border-neutral-850 flex flex-wrap gap-1.5 bg-neutral-900">
                {initialSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-[10px] font-black tracking-tight text-neutral-300 bg-neutral-850 hover:bg-orange-500/10 hover:text-orange-400 border border-neutral-800 hover:border-orange-500/20 px-2.5 py-1 rounded-full transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input Box */}
            <div className="p-3 bg-neutral-950 border-t border-neutral-850 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(input);
                }}
                disabled={isLoading}
                placeholder="Ask about weekly menu, plans, skipping..."
                className="flex-1 bg-neutral-900 border border-neutral-800 hover:border-neutral-750 focus:border-orange-500 rounded-xl px-3 py-2 text-xs font-medium text-white placeholder-neutral-500 outline-none transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 text-white p-2.5 rounded-xl flex items-center justify-center transition-all disabled:text-neutral-500 shrink-0"
                title="Send Message"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
