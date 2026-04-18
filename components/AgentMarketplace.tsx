import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Palette,
  Type,
  MessageSquare,
  Users,
  Search,
  DollarSign,
  Calendar,
  Loader2,
  X,
  Send,
  ArrowRight,
  Lock,
  Globe,
  Code,
  Copy,
  Check,
} from 'lucide-react';
import { BrandInput, BrandStrategy, DeployableAgent } from '../types';
import { generateAgentResponse, generateDeployableAgentEmbed } from '../services/geminiService';

const AGENTS = [
  { id: 'logo-refiner', name: 'LogoRefiner', icon: Sparkles, description: 'Iterates logo concepts with style transfer', color: 'text-brand-teal', bg: 'bg-brand-teal/10', tier: 'free' },
  { id: 'copy-smith', name: 'CopySmith', icon: MessageSquare, description: 'Taglines, bios, elevator pitches', color: 'text-brand-lavender', bg: 'bg-brand-lavender/10', tier: 'free' },
  { id: 'color-harmonist', name: 'ColorHarmonist', icon: Palette, description: 'Palettes from mood and industry', color: 'text-pink-500', bg: 'bg-pink-500/10', tier: 'free' },
  { id: 'brand-voice', name: 'BrandVoice', icon: Type, description: 'Tone, vocabulary, guidelines', color: 'text-orange-500', bg: 'bg-orange-500/10', tier: 'premium' },
  { id: 'audience-profiler', name: 'AudienceProfiler', icon: Users, description: 'Ideal client avatars', color: 'text-blue-500', bg: 'bg-blue-500/10', tier: 'premium' },
  { id: 'competitor-scout', name: 'CompetitorScout', icon: Search, description: 'Positioning and whitespace', color: 'text-red-500', bg: 'bg-red-500/10', tier: 'elite' },
  { id: 'package-pricer', name: 'PackagePricer', icon: DollarSign, description: 'Market-based pricing recommendations', color: 'text-green-500', bg: 'bg-green-500/10', tier: 'elite' },
  { id: 'social-scheduler', name: 'SocialScheduler', icon: Calendar, description: 'Week of platform-specific posts', color: 'text-cyan-500', bg: 'bg-cyan-500/10', tier: 'elite' },
] as const;

const TIER_BADGE: Record<string, { label: string; classes: string }> = {
  free: { label: 'Free', classes: 'bg-green-100 text-green-700' },
  premium: { label: 'Premium', classes: 'bg-brand-lavender/20 text-brand-lavender' },
  elite: { label: 'Elite', classes: 'bg-amber-900 text-amber-300' },
};

interface AgentMarketplaceProps {
  input: BrandInput;
  strategy: BrandStrategy;
  onUpdateStrategy: (updated: Partial<BrandStrategy>) => void;
}

export const AgentMarketplace: React.FC<AgentMarketplaceProps> = ({
  input,
  strategy,
  onUpdateStrategy,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; text: string }>>([]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Deploy State
  const [showDeploy, setShowDeploy] = useState(false);
  const [deployType, setDeployType] = useState<'chat' | 'faq' | 'recommender' | 'booking'>('chat');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ systemPrompt: string; welcomeMessage: string; suggestedQuestions: string[]; embedCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const result = await generateDeployableAgentEmbed(input, strategy, deployType);
      const embedCode = `<script src="https://cdn.xela.studio/agent-widget.js" data-brand="${input.companyName}" data-type="${deployType}"></script>`;
      setDeployResult({ ...result, embedCode });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopyEmbed = () => {
    if (deployResult) {
      navigator.clipboard.writeText(deployResult.embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentTier = input.selectedTier || 'budget';

  const isTierUnlocked = (agentTier: string) => {
    if (agentTier === 'free') return true;
    if (agentTier === 'premium') return currentTier === 'premium' || currentTier === 'elite';
    if (agentTier === 'elite') return currentTier === 'elite';
    return false;
  };

  const openAgent = (agentId: string) => {
    const agent = AGENTS.find((a) => a.id === agentId);
    if (!agent || !isTierUnlocked(agent.tier)) return;
    setSelectedAgent(agentId);
    setMessages([]);
    setUserInput('');
  };

  const closePanel = () => {
    setSelectedAgent(null);
    setMessages([]);
    setUserInput('');
    setIsThinking(false);
  };

  const handleSend = async () => {
    if (!userInput.trim() || !selectedAgent || isThinking) return;

    const newUserMsg = { role: 'user' as const, text: userInput.trim() };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setUserInput('');
    setIsThinking(true);

    try {
      const response = await generateAgentResponse(
        selectedAgent,
        newUserMsg.text,
        {
          companyName: input.companyName,
          industry: input.industry,
          vibe: input.vibe,
          audience: input.audience,
          brandVoice: strategy.brandVoice || '',
        },
        updatedMessages
      );
      setMessages((prev) => [...prev, { role: 'agent', text: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'agent', text: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeAgent = AGENTS.find((a) => a.id === selectedAgent);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-brand-teal" />
        <h2 className="text-2xl font-black tracking-widest uppercase">
          Agent Marketplace
        </h2>
        <span className="ml-2 px-3 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold tracking-wider">
          {AGENTS.length} Agents
        </span>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          const locked = !isTierUnlocked(agent.tier);
          const badge = TIER_BADGE[agent.tier];

          return (
            <motion.div
              key={agent.id}
              whileHover={locked ? {} : { scale: 1.02 }}
              whileTap={locked ? {} : { scale: 0.98 }}
              onClick={() => openAgent(agent.id)}
              className={`bg-white rounded-[2rem] p-6 border border-stone-100 hover:shadow-xl transition-all relative overflow-hidden ${
                locked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
              }`}
            >
              {/* Tier badge */}
              <span
                className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.classes}`}
              >
                {badge.label}
              </span>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl ${agent.bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${agent.color}`} />
              </div>

              {/* Name + description */}
              <h3 className="font-bold text-brand-black text-sm mb-1">{agent.name}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{agent.description}</p>

              {!locked && (
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-teal">
                  <span>Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Locked overlay */}
              {locked && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center gap-2">
                  <Lock className="w-6 h-6 text-stone-400" />
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Upgrade to unlock
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Deploy to Client Site */}
      <div className="mt-8 bg-gradient-to-r from-brand-black to-stone-900 rounded-[2.5rem] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-teal/10 rounded-full blur-3xl -mr-12 -mt-12" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe size={16} className="text-brand-teal" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal">Deploy to Client Site</span>
              </div>
              <h3 className="text-xl font-black text-white">Embed Brand Agents on Any Website</h3>
              <p className="text-stone-400 text-sm mt-1">Generate embeddable AI agents trained on your brand</p>
            </div>
            <button
              onClick={() => setShowDeploy(!showDeploy)}
              className="px-6 py-3 bg-brand-teal text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-teal/80 transition-all"
            >
              {showDeploy ? 'Close' : 'Configure'}
            </button>
          </div>

          {showDeploy && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
              <div className="grid grid-cols-4 gap-3">
                {(['chat', 'faq', 'recommender', 'booking'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setDeployType(type)}
                    className={`p-4 rounded-xl text-center transition-all ${deployType === type ? 'bg-white text-brand-black shadow-xl' : 'bg-white/10 text-stone-300 hover:bg-white/20'}`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="w-full py-4 bg-white text-brand-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-stone-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeploying ? <><Loader2 size={14} className="animate-spin" /> Generating Agent...</> : <><Code size={14} /> Generate Embed Code</>}
              </button>

              {deployResult && (
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Welcome Message</p>
                    <p className="text-white text-sm">{deployResult.welcomeMessage}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Embed Code</p>
                      <button onClick={handleCopyEmbed} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-brand-teal hover:text-white transition-colors">
                        {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>
                    <code className="text-xs text-green-400 block bg-black/40 p-3 rounded-lg font-mono break-all">{deployResult.embedCode}</code>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Suggested Questions</p>
                    <div className="flex flex-wrap gap-2">
                      {deployResult.suggestedQuestions.map((q, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white/10 text-white text-xs rounded-full">{q}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Agent Run Panel */}
      <AnimatePresence>
        {selectedAgent && activeAgent && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Slide-in panel */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center gap-3 p-6 border-b border-stone-100">
                <div className={`w-10 h-10 rounded-xl ${activeAgent.bg} flex items-center justify-center`}>
                  <activeAgent.icon className={`w-5 h-5 ${activeAgent.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-brand-black">{activeAgent.name}</h3>
                  <p className="text-xs text-stone-400">{activeAgent.description}</p>
                </div>
                <button
                  onClick={closePanel}
                  className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                >
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && !isThinking && (
                  <div className="text-center text-stone-400 text-sm mt-12">
                    <activeAgent.icon className={`w-10 h-10 mx-auto mb-3 ${activeAgent.color} opacity-40`} />
                    <p>Ask {activeAgent.name} anything about your brand.</p>
                    <p className="text-xs mt-1 text-stone-300">Context from your brand profile is included automatically.</p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-brand-black text-white rounded-br-md'
                          : 'bg-stone-50 text-stone-800 rounded-bl-md border border-stone-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-stone-50 rounded-2xl rounded-bl-md px-4 py-3 border border-stone-100 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />
                      <span className="text-sm text-stone-400">Thinking...</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input bar */}
              <div className="p-4 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask ${activeAgent.name}...`}
                    disabled={isThinking}
                    className="flex-1 bg-stone-50 rounded-xl px-4 py-3 text-sm outline-none border border-stone-100 focus:border-brand-teal/40 transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!userInput.trim() || isThinking}
                    className="w-10 h-10 rounded-xl bg-brand-teal flex items-center justify-center text-white hover:bg-brand-teal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
