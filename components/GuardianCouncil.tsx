import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Shield, Sparkles, Palette, TrendingUp, Lock, Heart, Lightbulb, DollarSign, Send, Loader2, AlertCircle, Check, X, RefreshCw, Battery, Brain, Eye, ChevronDown } from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import {
  initializeCouncil, recordVote, restoreVoter, calculateConsensus, getCouncilHealth,
  GuardianVoter, VoteDecision
} from '../services/guardianVoters';
import { chatWithGemini } from '../services/geminiService';

interface GuardianCouncilProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

const ROLE_ICONS: Record<string, any> = {
  ethics: Shield,
  quality: Sparkles,
  brand: Palette,
  market: TrendingUp,
  security: Lock,
  'user-advocate': Heart,
  creative: Lightbulb,
  financial: DollarSign
};

const ROLE_COLORS: Record<string, string> = {
  ethics: 'text-blue-500 bg-blue-500/10 border-blue-200',
  quality: 'text-purple-500 bg-purple-500/10 border-purple-200',
  brand: 'text-pink-500 bg-pink-500/10 border-pink-200',
  market: 'text-green-500 bg-green-500/10 border-green-200',
  security: 'text-red-500 bg-red-500/10 border-red-200',
  'user-advocate': 'text-rose-500 bg-rose-500/10 border-rose-200',
  creative: 'text-amber-500 bg-amber-500/10 border-amber-200',
  financial: 'text-emerald-500 bg-emerald-500/10 border-emerald-200'
};

const DECISION_STYLES: Record<VoteDecision, string> = {
  approve: 'bg-green-100 text-green-700 border-green-300',
  reject: 'bg-red-100 text-red-700 border-red-300',
  revise: 'bg-amber-100 text-amber-700 border-amber-300',
  abstain: 'bg-stone-100 text-stone-500 border-stone-300'
};

const DECISION_ICONS: Record<VoteDecision, React.ReactNode> = {
  approve: <Check className="w-3.5 h-3.5" />,
  reject: <X className="w-3.5 h-3.5" />,
  revise: <RefreshCw className="w-3.5 h-3.5" />,
  abstain: <Eye className="w-3.5 h-3.5" />
};

const HealthBar = ({ label, value, gradient }: { label: string; value: number; gradient: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 w-16 shrink-0">{label}</span>
    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${gradient}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
    <span className="text-[10px] font-mono text-stone-400 w-8 text-right">{value}</span>
  </div>
);

export const GuardianCouncil: React.FC<GuardianCouncilProps> = ({ input, strategy }) => {
  const [council, setCouncil] = useState<GuardianVoter[]>(initializeCouncil());
  const [question, setQuestion] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const [currentVotes, setCurrentVotes] = useState<Array<{ voterId: string; decision: VoteDecision; reasoning: string; confidence: number }>>([]);
  const [consensus, setConsensus] = useState<{ decision: VoteDecision; confidence: number; unanimous: boolean } | null>(null);
  const [expandedVoters, setExpandedVoters] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const health = getCouncilHealth(council);

  const toggleExpand = (id: string) => {
    setExpandedVoters(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRestoreAll = () => {
    setCouncil(prev => prev.map(v => v.state === 'resting' ? restoreVoter(v) : v));
  };

  const handleRestoreOne = (id: string) => {
    setCouncil(prev => prev.map(v => v.id === id ? restoreVoter(v) : v));
  };

  const handleCallVote = async () => {
    if (!question.trim() || isVoting) return;
    setIsVoting(true);
    setCurrentVotes([]);
    setConsensus(null);
    setError(null);

    const updatedCouncil = [...council];
    const voteRecords: Array<{ decision: VoteDecision; reasoning: string; confidence: number }> = [];

    for (let i = 0; i < updatedCouncil.length; i++) {
      const voter = updatedCouncil[i];
      if (voter.state === 'resting') {
        continue;
      }

      try {
        const prompt = `You are ${voter.name}, a ${voter.role} specialist. Your values: ${voter.world.values.join(', ')}. Your rules: ${voter.world.rules.join(', ')}. Question: ${question}. Brand context: ${input.companyName} (${input.industry}). Respond with EXACTLY this JSON: {"decision": "approve|reject|revise|abstain", "reasoning": "one sentence", "confidence": 0-100}`;

        const raw = await chatWithGemini(prompt);
        let parsed: { decision: VoteDecision; reasoning: string; confidence: number };

        try {
          const jsonMatch = raw.match(/\{[\s\S]*?\}/);
          parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
          if (!['approve', 'reject', 'revise', 'abstain'].includes(parsed.decision)) {
            parsed.decision = 'abstain';
          }
          parsed.confidence = Math.max(0, Math.min(100, Number(parsed.confidence) || 50));
        } catch {
          parsed = { decision: 'abstain', reasoning: 'Could not parse response', confidence: 0 };
        }

        updatedCouncil[i] = recordVote(voter, question, parsed.decision, parsed.reasoning, parsed.confidence);
        voteRecords.push(parsed);

        setCurrentVotes(prev => [...prev, {
          voterId: voter.id,
          decision: parsed.decision,
          reasoning: parsed.reasoning,
          confidence: parsed.confidence
        }]);
        setCouncil([...updatedCouncil]);

        // staggered delay for visual effect
        if (i < updatedCouncil.length - 1) {
          await new Promise(r => setTimeout(r, 500));
        }
      } catch (err) {
        setError(prev => prev ? prev + ` | ${voter.name} failed` : `${voter.name} failed to vote`);
        voteRecords.push({ decision: 'abstain', reasoning: 'Error during voting', confidence: 0 });
        setCurrentVotes(prev => [...prev, {
          voterId: voter.id,
          decision: 'abstain',
          reasoning: 'Error during voting',
          confidence: 0
        }]);
      }
    }

    // Calculate consensus
    const records = voteRecords.map((v, i) => ({
      id: String(i),
      timestamp: new Date().toISOString(),
      question,
      decision: v.decision,
      reasoning: v.reasoning,
      confidence: v.confidence,
      energyCost: 0
    }));
    const result = calculateConsensus(records);
    setConsensus(result);
    setIsVoting(false);
  };

  const statCards = [
    { label: 'Active', value: health.activeCount, icon: Users },
    { label: 'Resting', value: health.restingCount, icon: Battery },
    { label: 'Avg Energy', value: `${health.avgEnergy}%`, icon: Brain },
    { label: 'Avg Clarity', value: `${health.avgClarity}%`, icon: Eye },
    { label: 'Decisions', value: health.totalDecisions, icon: Check },
  ];

  return (
    <div className="space-y-8">
      {/* Section 1: Council Health Overview */}
      <div className="bg-brand-black rounded-[3rem] p-10 text-white">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-7 h-7 text-brand-lavender" />
            <h2 className="text-2xl font-black tracking-widest uppercase">Guardian Council</h2>
          </div>
          {health.restingCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRestoreAll}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Restore All
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white/5 rounded-2xl p-4 text-center">
                <Icon className="w-5 h-5 mx-auto mb-2 text-white/50" />
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-[11px] uppercase tracking-widest text-white/40 mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Voter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {council.map(voter => {
          const Icon = ROLE_ICONS[voter.role] || Shield;
          const colors = ROLE_COLORS[voter.role] || ROLE_COLORS.ethics;
          const isExpanded = expandedVoters.has(voter.id);
          const stateColor = voter.state === 'active' || voter.state === 'restored'
            ? 'bg-green-100 text-green-700'
            : voter.state === 'resting'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-blue-100 text-blue-700';

          return (
            <motion.div
              key={voter.id}
              layout
              className={`border rounded-2xl p-5 bg-white ${colors.split(' ').find(c => c.startsWith('border-')) || 'border-stone-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.split(' ').slice(0, 2).join(' ')}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-stone-800">{voter.name}</div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{voter.role}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${stateColor}`}>
                  {voter.state}
                </span>
              </div>

              <div className="space-y-1.5 mb-3">
                <HealthBar label="Energy" value={voter.health.energy} gradient="bg-gradient-to-r from-green-400 to-green-500" />
                <HealthBar label="Clarity" value={voter.health.clarity} gradient="bg-gradient-to-r from-blue-400 to-blue-500" />
                <HealthBar label="Align" value={voter.health.alignment} gradient="bg-gradient-to-r from-purple-400 to-purple-500" />
                <HealthBar label="Fatigue" value={voter.health.fatigue} gradient="bg-gradient-to-r from-red-400 to-red-500" />
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-400 mb-2">
                <span>{voter.health.decisionsToday} decisions today</span>
                <span>v{voter.incarnation}</span>
              </div>

              <button
                onClick={() => toggleExpand(voter.id)}
                className="w-full flex items-center justify-center gap-1 text-[11px] font-semibold text-stone-400 hover:text-stone-600 transition-colors py-1"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                {isExpanded ? 'Collapse' : 'Details'}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 border-t border-stone-100 space-y-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Values</div>
                        <div className="flex flex-wrap gap-1">
                          {voter.world.values.map((v, i) => (
                            <span key={i} className="text-[10px] bg-stone-50 text-stone-600 px-2 py-0.5 rounded-full">{v}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Rules</div>
                        <ul className="space-y-0.5">
                          {voter.world.rules.map((r, i) => (
                            <li key={i} className="text-[10px] text-stone-500">- {r}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Bias Checks</div>
                        <ul className="space-y-0.5">
                          {voter.world.biasChecks.map((b, i) => (
                            <li key={i} className="text-[10px] text-stone-500 italic">"{b}"</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Physics</div>
                        <p className="text-[10px] text-stone-500">{voter.world.customPhysics}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {voter.state === 'resting' && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRestoreOne(voter.id)}
                  className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restore
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Section 3: Voting Chamber */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-brand-lavender" />
          <h3 className="text-xl font-black tracking-widest uppercase text-stone-800">Ask the Council</h3>
        </div>

        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Describe the decision or question for the council to vote on..."
          className="w-full h-32 bg-stone-50 border border-stone-200 rounded-2xl p-5 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-lavender resize-none"
          disabled={isVoting}
        />

        <div className="flex justify-end mt-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCallVote}
            disabled={isVoting || !question.trim()}
            className="flex items-center gap-2 px-8 py-3 bg-brand-black text-white font-bold text-sm uppercase tracking-widest rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-800 transition-colors"
          >
            {isVoting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Voting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Call Vote
              </>
            )}
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Consensus Banner */}
        <AnimatePresence>
          {consensus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`mt-6 p-6 rounded-2xl border-2 text-center ${DECISION_STYLES[consensus.decision]}`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {DECISION_ICONS[consensus.decision]}
                <span className="text-lg font-black uppercase tracking-widest">{consensus.decision}</span>
              </div>
              <div className="text-sm font-semibold">{consensus.confidence}% confidence</div>
              {consensus.unanimous && (
                <div className="text-xs mt-1 font-medium opacity-70">Unanimous decision</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vote Cards */}
        <AnimatePresence>
          {currentVotes.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-3"
            >
              {currentVotes.map((vote, idx) => {
                const voter = council.find(v => v.id === vote.voterId);
                if (!voter) return null;
                const Icon = ROLE_ICONS[voter.role] || Shield;
                const colors = ROLE_COLORS[voter.role] || ROLE_COLORS.ethics;

                return (
                  <motion.div
                    key={vote.voterId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-4 p-4 bg-stone-50 rounded-2xl"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.split(' ').slice(0, 2).join(' ')}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-stone-800">{voter.name}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${DECISION_STYLES[vote.decision]}`}>
                          {DECISION_ICONS[vote.decision]}
                          {vote.decision}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 ml-auto">{vote.confidence}%</span>
                      </div>
                      <p className="text-xs text-stone-500 leading-relaxed">{vote.reasoning}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
