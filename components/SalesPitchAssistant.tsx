import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import {
  matchPitch,
  SALES_PITCHES,
  PitchCategory,
} from '../services/salesPitches';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  followUp?: string;
  timestamp: number;
}

const SUGGESTION_CHIPS: { label: string; query: string }[] = [
  { label: 'Pricing?', query: 'How much does it cost?' },
  { label: 'How fast?', query: 'How fast is delivery?' },
  { label: 'What do I get?', query: 'What do I actually get?' },
  { label: 'Why trust you?', query: 'Why should I trust you with my brand?' },
  { label: 'AI quality?', query: 'Is AI lower quality than a real designer?' },
  { label: 'Payment plan?', query: 'Do you offer a payment plan?' },
];

export const SalesPitchAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text:
        "Hey! I'm here to answer any questions you have about XELA — pricing, process, quality, anything. What's on your mind?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const sendQuery = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Match to a pitch
    const pitch = matchPitch(text);

    setTimeout(() => {
      const response: ChatMessage = {
        role: 'assistant',
        text:
          pitch?.pitch ||
          "Great question! Let me connect you with Alex directly — give us a call at (321) 375-9685 and we'll answer that in detail. We'd rather give you a real human answer than guess.",
        followUp: pitch?.followUp,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 700);
  };

  const handleSend = () => sendQuery(input);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Find the most recent assistant message with a follow-up
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const showFollowUp = lastAssistant?.followUp && !isTyping;

  return (
    <>
      {/* Floating button — bottom-left to avoid Chatbot conflict */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/40 transition-transform hover:scale-110"
        aria-label="Open sales assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="relative"
            >
              <MessageCircle className="h-6 w-6 text-white" />
              <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-yellow-300" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 left-6 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">Ask XELA Anything</h3>
                <p className="text-xs text-white/60">Real answers, no pressure</p>
              </div>
              <span className="flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 border-b border-white/5 bg-white/[0.02] p-3">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => sendQuery(chip.query)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 transition-all hover:border-purple-400/50 hover:bg-purple-500/10 hover:text-white"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto p-4"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                        : 'border border-white/10 bg-white/5 text-white/90'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" />
                  </div>
                </motion.div>
              )}

              {/* Follow-up chip */}
              {showFollowUp && lastAssistant?.followUp && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-start"
                >
                  <button
                    onClick={() => sendQuery(lastAssistant.followUp!)}
                    className="rounded-full border border-purple-400/40 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-200 transition-all hover:bg-purple-500/20 hover:text-white"
                  >
                    {lastAssistant.followUp}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-4 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about XELA..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-white/40">
                Alex typically replies in seconds — call (321) 375-9685
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SalesPitchAssistant;
