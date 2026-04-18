
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Loader2, Sparkles, User, Bot, Image as ImageIcon, Package, Palette, FileText, Music, Search, Megaphone, BookOpen, PenTool, BarChart3, Mail, Calendar, Sticker, Quote } from 'lucide-react';
import { chatWithTools, ToolCallResult } from '../services/geminiService';
import { ChatMessage, BrandInput, BrandStrategy } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatbotProps {
  brandInput?: BrandInput;
  strategy?: BrandStrategy;
}

const toolIcons: Record<string, React.ReactNode> = {
  strategy: <Palette size={14} />,
  packages: <Package size={14} />,
  logos: <ImageIcon size={14} />,
  names: <PenTool size={14} />,
  mottos: <Quote size={14} />,
  calendar: <Calendar size={14} />,
  emails: <Mail size={14} />,
  flyer: <FileText size={14} />,
  ads: <Megaphone size={14} />,
  guidelines: <BookOpen size={14} />,
  competitor: <BarChart3 size={14} />,
  pitch: <Megaphone size={14} />,
  story: <BookOpen size={14} />,
  slogans: <Sticker size={14} />,
  lyrics: <Music size={14} />,
  image: <ImageIcon size={14} />,
  search: <Search size={14} />,
  calibration: <Sparkles size={14} />,
};

const toolLabels: Record<string, string> = {
  strategy: 'Brand Strategy',
  packages: 'Branding Packages',
  logos: 'Logo Concepts',
  names: 'Business Names',
  mottos: 'Mottos & Slogans',
  calendar: 'Content Calendar',
  emails: 'Email Templates',
  flyer: 'Flyer Copy',
  ads: 'Ad Assets',
  guidelines: 'Brand Guidelines',
  competitor: 'Competitor Analysis',
  pitch: 'Sales Pitch',
  story: 'Brand Story',
  slogans: 'Sticker Slogans',
  lyrics: 'Song Lyrics',
  image: 'Generated Image',
  search: 'Market Research',
  calibration: 'Alignment Calibration',
};

const ToolResultCard: React.FC<{ result: ToolCallResult }> = ({ result }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2 rounded-xl border border-brand-lavender/30 bg-brand-lavender/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-brand-lavender/10 transition-colors"
      >
        <div className="w-6 h-6 rounded-lg bg-brand-lavender/20 flex items-center justify-center text-brand-lavender">
          {toolIcons[result.displayType] || <Sparkles size={14} />}
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-brand-lavender">
          {toolLabels[result.displayType] || result.toolName}
        </span>
        <span className="ml-auto text-[10px] text-stone-400">
          {expanded ? 'collapse' : 'expand'}
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 text-xs text-stone-600 max-h-64 overflow-y-auto">
          {result.displayType === 'image' && typeof result.data === 'string' && result.data.startsWith('data:') ? (
            <img src={result.data} alt="Generated" className="w-full rounded-lg" />
          ) : result.displayType === 'logos' && Array.isArray(result.data) ? (
            <div className="flex gap-2 flex-wrap">
              {result.data.map((logo: any, i: number) => (
                <img key={i} src={logo.imageUrl} alt={logo.description} className="w-24 h-24 rounded-lg object-contain bg-white border" />
              ))}
            </div>
          ) : typeof result.data === 'string' ? (
            <p className="whitespace-pre-wrap">{result.data}</p>
          ) : Array.isArray(result.data) ? (
            <ul className="space-y-1 list-disc list-inside">
              {result.data.slice(0, 15).map((item: any, i: number) => (
                <li key={i}>{typeof item === 'string' ? item : item.name || item.title || item.subject || item.topic || JSON.stringify(item).slice(0, 120)}</li>
              ))}
              {result.data.length > 15 && <li className="text-stone-400">...and {result.data.length - 15} more</li>}
            </ul>
          ) : (
            <pre className="whitespace-pre-wrap text-[10px] leading-relaxed">{JSON.stringify(result.data, null, 2).slice(0, 2000)}</pre>
          )}
        </div>
      )}
    </div>
  );
}

export const Chatbot: React.FC<ChatbotProps> = ({ brandInput, strategy }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: "I'm Xela, your Elite Branding Assistant. I can generate logos, brand strategies, packaging, content calendars, marketing materials, and more — just ask. What are we building today?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithTools(input, brandInput, strategy);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        toolResults: response.toolResults.length > 0 ? response.toolResults : undefined
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `Something went wrong: ${error.message}. Try again or rephrase your request.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-8 z-[60]">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-brand-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-2 border-brand-lavender group"
          >
            <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-teal rounded-full animate-pulse border-2 border-white"></div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className={`bg-white rounded-[2rem] shadow-2xl border border-stone-200 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'h-16 w-64' : 'h-[560px] w-[420px]'}`}
          >
            {/* Header */}
            <div className="bg-brand-black p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-lavender rounded-lg flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Elite Assistant</p>
                  {!isMinimized && (
                    <p className="text-[10px] text-brand-teal font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-pulse" />
                      17 Tools Active
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/10 rounded transition-all">
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] ${msg.role === 'user' ? '' : ''}`}>
                        <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-brand-teal text-white rounded-tr-none' : 'bg-white text-brand-black shadow-sm border border-stone-100 rounded-tl-none'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            {msg.role === 'user' ? <User size={12} /> : <Bot size={12} className="text-brand-lavender" />}
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{msg.role === 'user' ? 'You' : 'Xela AI'}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>

                        {msg.toolResults?.map((result, i) => (
                          <ToolResultCard key={i} result={result} />
                        ))}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100 rounded-tl-none flex items-center gap-2">
                        <Loader2 className="animate-spin text-brand-lavender" size={16} />
                        <span className="text-xs text-stone-400 font-medium">Generating...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-stone-100">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Generate a logo, build my brand strategy..."
                      className="w-full pl-4 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lavender transition-all"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-black text-white rounded-lg hover:bg-brand-lavender transition-all disabled:opacity-50"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
