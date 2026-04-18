import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, Sparkles, Plus, Trash2, MessageSquare, Loader2, Check, Zap, Volume2 } from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import { buildBrandBotFromChat } from '../services/geminiService';

interface BrandBot {
  id: string;
  name: string;
  purpose: string;
  systemPrompt: string;
  triggerPhrases: string[];
  createdAt: number;
  invokeCount: number;
}

interface BuilderMessage {
  role: 'user' | 'builder';
  text: string;
}

interface BrandBotBuilderProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

const INITIAL_BUILDER_MESSAGE: BuilderMessage = {
  role: 'builder',
  text: "Hey! I'm going to help you create a personal branding assistant. What should your bot do? For example: 'Write Instagram captions in my brand voice' or 'Draft client emails'",
};

export const BrandBotBuilder: React.FC<BrandBotBuilderProps> = ({ input, strategy }) => {
  const [bots, setBots] = useState<BrandBot[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [builderMessages, setBuilderMessages] = useState<BuilderMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [builderMessages]);

  const userMessageCount = builderMessages.filter(m => m.role === 'user').length;

  const startNewBot = () => {
    setIsBuilding(true);
    setSelectedBotId(null);
    setBuilderMessages([INITIAL_BUILDER_MESSAGE]);
    setUserInput('');
  };

  const handleSend = () => {
    if (!userInput.trim() || isProcessing) return;

    const newUserMsg: BuilderMessage = { role: 'user', text: userInput.trim() };
    setBuilderMessages(prev => [...prev, newUserMsg]);
    setUserInput('');
    setIsProcessing(true);

    // Simulate builder follow-up questions
    setTimeout(() => {
      const followUps = [
        "Great choice! What tone should this bot use — professional, casual, witty, or something else?",
        "Nice. Should it reference any specific topics, products, or services from your brand?",
        "Almost there! Any specific phrases or words your brand always uses (or avoids)?",
        "Got it. I think I have enough to build your bot. Hit 'Finalize Bot' when you're ready!",
      ];
      const idx = Math.min(userMessageCount, followUps.length - 1);
      const builderReply: BuilderMessage = { role: 'builder', text: followUps[idx] };
      setBuilderMessages(prev => [...prev, builderReply]);
      setIsProcessing(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFinalize = async () => {
    setIsProcessing(true);
    setBuilderMessages(prev => [
      ...prev,
      { role: 'builder', text: '⚡ Building your bot now...' },
    ]);

    try {
      const conversation = builderMessages.map(m => ({ role: m.role, text: m.text }));
      const brandContext = {
        companyName: input.companyName,
        industry: input.industry,
        vibe: input.vibe,
        audience: input.audience,
        brandVoice: strategy.brandVoice || '',
      };

      const result = await buildBrandBotFromChat(conversation, brandContext);

      const newBot: BrandBot = {
        id: crypto.randomUUID(),
        name: result.name,
        purpose: result.purpose,
        systemPrompt: result.systemPrompt,
        triggerPhrases: result.triggerPhrases,
        createdAt: Date.now(),
        invokeCount: 0,
      };

      setBots(prev => [...prev, newBot]);
      setSelectedBotId(newBot.id);
      setIsBuilding(false);
      setBuilderMessages([]);
    } catch {
      setBuilderMessages(prev => [
        ...prev,
        { role: 'builder', text: 'Something went wrong building your bot. Try again?' },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteBot = (id: string) => {
    setBots(prev => prev.filter(b => b.id !== id));
    if (selectedBotId === id) setSelectedBotId(null);
  };

  const selectedBot = bots.find(b => b.id === selectedBotId);

  return (
    <div className="flex gap-6 w-full min-h-[600px]">
      {/* Left Column — My BrandBots */}
      <div className="w-[40%] bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-lg tracking-tight text-brand-black">My BrandBots</h2>
          <span className="bg-brand-lavender/20 text-brand-lavender text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            {bots.length}
          </span>
        </div>

        <button
          onClick={startNewBot}
          className="w-full py-4 bg-brand-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all flex items-center justify-center gap-2 mb-6"
        >
          <Plus className="w-4 h-4" />
          Create New Bot
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <AnimatePresence>
            {bots.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-stone-400 gap-3 py-12"
              >
                <Bot className="w-10 h-10" />
                <p className="text-sm text-center">No bots yet — create your first!</p>
              </motion.div>
            ) : (
              bots.map(bot => (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => { setSelectedBotId(bot.id); setIsBuilding(false); }}
                  className={`bg-white rounded-2xl p-5 border border-stone-100 hover:shadow-lg transition-all cursor-pointer ${
                    selectedBotId === bot.id ? 'ring-2 ring-brand-lavender shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-brand-teal" />
                      <span className="font-black text-sm text-brand-black">{bot.name}</span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteBot(bot.id); }}
                      className="text-stone-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-stone-500 mb-3">{bot.purpose}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded-full">
                      {bot.invokeCount} invokes
                    </span>
                    {bot.triggerPhrases.slice(0, 3).map((phrase, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full"
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Column — Bot Builder / Detail */}
      <div className="w-[60%] bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 flex flex-col">
        {!isBuilding && !selectedBot ? (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-300 gap-4">
            <Bot className="w-16 h-16" />
            <p className="text-sm font-medium">Select a bot or create a new one</p>
          </div>
        ) : !isBuilding && selectedBot ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-brand-teal" />
              </div>
              <div>
                <h3 className="font-black text-brand-black">{selectedBot.name}</h3>
                <p className="text-xs text-stone-500">{selectedBot.purpose}</p>
              </div>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">System Prompt</p>
              <p className="text-sm text-stone-600 leading-relaxed">{selectedBot.systemPrompt}</p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Trigger Phrases</p>
              <div className="flex flex-wrap gap-2">
                {selectedBot.triggerPhrases.map((phrase, i) => (
                  <span
                    key={i}
                    className="bg-brand-lavender/10 text-brand-lavender text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3 h-3" />
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Building conversation */
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles className="w-5 h-5 text-brand-lavender" />
              </motion.div>
              <h3 className="font-black text-brand-black">Building your bot...</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
              <AnimatePresence initial={false}>
                {builderMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-brand-black text-white rounded-br-sm'
                          : 'bg-stone-50 text-stone-700 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-stone-50 px-5 py-3 rounded-2xl rounded-bl-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what your bot should do..."
                disabled={isProcessing}
                className="flex-1 bg-white border border-stone-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lavender/50 placeholder:text-stone-300 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!userInput.trim() || isProcessing}
                className="w-11 h-11 rounded-xl bg-brand-black text-white flex items-center justify-center hover:bg-brand-lavender transition-all disabled:opacity-30"
              >
                <Send className="w-4 h-4" />
              </button>
              {userMessageCount >= 3 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleFinalize}
                  disabled={isProcessing}
                  className="bg-brand-teal text-white rounded-2xl px-6 py-3 font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Finalize Bot
                </motion.button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
