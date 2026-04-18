import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, DollarSign, Calendar, Target, Loader2, Download, AlertCircle, Sparkles, ChevronDown } from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import { generateGrantProposal } from '../services/geminiService';

interface GrantProposal {
  projectTitle: string;
  narrative: string;
  budgetBreakdown: Array<{ item: string; amount: string; justification: string }>;
  timeline: Array<{ phase: string; duration: string; deliverables: string }>;
  portfolioStrategy: string;
  submissionChecklist: string[];
  talkingPoints: string[];
}

const KNOWN_OPPORTUNITIES = [
  { name: 'Artlist $100K Creator Fund', amount: '$100,000', platform: 'Artlist', deadline: 'Rolling' },
  { name: 'Adobe Creative Residency', amount: '$50,000', platform: 'Adobe', deadline: 'Annual' },
  { name: 'Canva Creator Fund', amount: '$25,000', platform: 'Canva', deadline: 'Quarterly' },
  { name: 'YouTube Shorts Fund', amount: '$10,000', platform: 'YouTube', deadline: 'Rolling' },
  { name: 'Custom Opportunity', amount: '', platform: '', deadline: '' },
];

interface GrantProposalGeneratorProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

export const GrantProposalGenerator: React.FC<GrantProposalGeneratorProps> = ({ input, strategy }) => {
  const [selectedOpp, setSelectedOpp] = useState(0);
  const [customGrant, setCustomGrant] = useState({ name: '', amount: '', platform: '', description: '', deadline: '' });
  const [proposal, setProposal] = useState<GrantProposal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ narrative: true });
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const isCustom = selectedOpp === KNOWN_OPPORTUNITIES.length - 1;
  const currentOpp = KNOWN_OPPORTUNITIES[selectedOpp];

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const grantName = isCustom ? customGrant.name : currentOpp.name;
      const grantAmount = isCustom ? customGrant.amount : currentOpp.amount;
      const grantPlatform = isCustom ? customGrant.platform : currentOpp.platform;
      const grantDescription = isCustom ? customGrant.description : undefined;

      if (!grantName) {
        setError('Please provide a grant name.');
        return;
      }

      const result = await generateGrantProposal(
        input,
        strategy,
        grantName,
        grantAmount,
        grantPlatform,
        grantDescription
      );
      setProposal(result);
      setCheckedItems({});
      setExpandedSections({ narrative: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate proposal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!proposal) return;
    const blob = new Blob([JSON.stringify(proposal, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grant-proposal-${proposal.projectTitle.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sectionCard = (
    key: string,
    icon: React.ReactNode,
    title: string,
    children: React.ReactNode
  ) => (
    <div
      className="bg-white rounded-[2rem] p-6 border border-stone-100 cursor-pointer hover:shadow-lg transition-all"
      onClick={() => toggleSection(key)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-black text-[10px] uppercase tracking-widest text-stone-700">{title}</span>
        </div>
        <motion.div animate={{ rotate: expandedSections[key] ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-stone-400" />
        </motion.div>
      </div>
      {expandedSections[key] && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
          onClick={e => e.stopPropagation()}
        >
          {children}
        </motion.div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="w-7 h-7 text-brand-teal" />
        <div>
          <h2 className="text-2xl font-black tracking-tight text-stone-900">Grant Proposals</h2>
          <p className="text-stone-500 text-sm">Win funding with AI-powered applications</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 space-y-6">
        {/* Opportunity Selector */}
        <div>
          <label className="font-black text-[10px] uppercase tracking-widest text-stone-600 mb-2 block">
            Select Opportunity
          </label>
          <select
            value={selectedOpp}
            onChange={e => setSelectedOpp(Number(e.target.value))}
            className="w-full bg-white rounded-2xl px-5 py-3 border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
          >
            {KNOWN_OPPORTUNITIES.map((opp, i) => (
              <option key={i} value={i}>
                {opp.name}{opp.amount ? ` — ${opp.amount}` : ''}{opp.deadline ? ` (${opp.deadline})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Fields */}
        {isCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              placeholder="Grant Name"
              value={customGrant.name}
              onChange={e => setCustomGrant(prev => ({ ...prev, name: e.target.value }))}
              className="bg-white rounded-2xl px-5 py-3 border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
            />
            <input
              type="text"
              placeholder="Amount (e.g. $10,000)"
              value={customGrant.amount}
              onChange={e => setCustomGrant(prev => ({ ...prev, amount: e.target.value }))}
              className="bg-white rounded-2xl px-5 py-3 border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
            />
            <input
              type="text"
              placeholder="Platform / Organization"
              value={customGrant.platform}
              onChange={e => setCustomGrant(prev => ({ ...prev, platform: e.target.value }))}
              className="bg-white rounded-2xl px-5 py-3 border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
            />
            <input
              type="text"
              placeholder="Deadline"
              value={customGrant.deadline}
              onChange={e => setCustomGrant(prev => ({ ...prev, deadline: e.target.value }))}
              className="bg-white rounded-2xl px-5 py-3 border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
            />
            <textarea
              placeholder="Description / Requirements"
              value={customGrant.description}
              onChange={e => setCustomGrant(prev => ({ ...prev, description: e.target.value }))}
              className="md:col-span-2 bg-white rounded-2xl px-5 py-3 border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 min-h-[80px]"
            />
          </motion.div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 text-red-700 rounded-2xl px-5 py-3 border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-brand-teal text-white rounded-2xl px-8 py-4 font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-3"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Proposal...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Proposal
            </>
          )}
        </button>
      </div>

      {/* Generated Proposal */}
      {proposal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Project Title */}
          <h3 className="text-3xl font-black tracking-tight text-stone-900">{proposal.projectTitle}</h3>

          {/* Narrative */}
          {sectionCard('narrative', <Target className="w-5 h-5 text-brand-teal" />, 'Project Narrative',
            <p className="text-stone-700 leading-relaxed whitespace-pre-line">{proposal.narrative}</p>
          )}

          {/* Budget Breakdown */}
          {sectionCard('budget', <DollarSign className="w-5 h-5 text-brand-teal" />, 'Budget Breakdown',
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-2 font-black text-[10px] uppercase tracking-widest text-stone-500">Item</th>
                    <th className="text-left py-2 font-black text-[10px] uppercase tracking-widest text-stone-500">Amount</th>
                    <th className="text-left py-2 font-black text-[10px] uppercase tracking-widest text-stone-500">Justification</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.budgetBreakdown?.map((row, i) => (
                    <tr key={i} className="border-b border-stone-50">
                      <td className="py-2 text-stone-800 font-medium">{row.item}</td>
                      <td className="py-2 text-brand-teal font-bold">{row.amount}</td>
                      <td className="py-2 text-stone-600">{row.justification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Timeline */}
          {sectionCard('timeline', <Calendar className="w-5 h-5 text-brand-teal" />, 'Timeline',
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-2 font-black text-[10px] uppercase tracking-widest text-stone-500">Phase</th>
                    <th className="text-left py-2 font-black text-[10px] uppercase tracking-widest text-stone-500">Duration</th>
                    <th className="text-left py-2 font-black text-[10px] uppercase tracking-widest text-stone-500">Deliverables</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.timeline?.map((row, i) => (
                    <tr key={i} className="border-b border-stone-50">
                      <td className="py-2 text-stone-800 font-medium">{row.phase}</td>
                      <td className="py-2 text-brand-teal font-bold">{row.duration}</td>
                      <td className="py-2 text-stone-600">{row.deliverables}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Portfolio Strategy */}
          {sectionCard('portfolio', <Sparkles className="w-5 h-5 text-brand-teal" />, 'Portfolio Strategy',
            <p className="text-stone-700 leading-relaxed">{proposal.portfolioStrategy}</p>
          )}

          {/* Submission Checklist */}
          {sectionCard('checklist', <FileText className="w-5 h-5 text-brand-teal" />, 'Submission Checklist',
            <ul className="space-y-2">
              {proposal.submissionChecklist?.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => toggleCheck(i)}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                    checkedItems[i] ? 'bg-brand-teal border-brand-teal text-white' : 'border-stone-300'
                  }`}>
                    {checkedItems[i] && <span className="text-xs font-bold">✓</span>}
                  </div>
                  <span className={`text-sm transition-colors ${checkedItems[i] ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Talking Points */}
          {sectionCard('talking', <Target className="w-5 h-5 text-brand-teal" />, 'Talking Points',
            <ul className="space-y-2">
              {proposal.talkingPoints?.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-brand-teal shrink-0" />
                  <span className="text-sm text-stone-700">{point}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="bg-brand-teal text-white rounded-2xl px-8 py-4 font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-3"
          >
            <Download className="w-4 h-4" />
            Download Proposal JSON
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};
