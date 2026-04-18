import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Send, Loader2, FileText, MessageSquare, Users, Target, Sparkles, Copy, Check, Volume2, AlertCircle } from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import { generateCallScript, simulateClientResponse } from '../services/geminiService';

interface CallScript {
  opener: string;
  valueProposition: string;
  objectionResponses: Array<{ objection: string; response: string }>;
  closingStatement: string;
  followUpActions: string[];
}

type CallObjective = 'pitch' | 'followup' | 'booking' | 'negotiation';
type ClientPersona = 'friendly' | 'skeptical' | 'busy' | 'price-sensitive';

interface CallCoachProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

export const CallCoach: React.FC<CallCoachProps> = ({ input, strategy }) => {
  const [activePanel, setActivePanel] = useState<'script' | 'rehearsal' | 'history'>('script');
  const [clientName, setClientName] = useState('');
  const [clientBusiness, setClientBusiness] = useState('');
  const [objective, setObjective] = useState<CallObjective>('pitch');
  const [objections, setObjections] = useState('');
  const [script, setScript] = useState<CallScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [persona, setPersona] = useState<ClientPersona>('friendly');
  const [rehearsalMessages, setRehearsalMessages] = useState<Array<{ role: 'user' | 'client'; text: string }>>([]);
  const [rehearsalInput, setRehearsalInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [savedScripts, setSavedScripts] = useState<Array<{ clientName: string; objective: string; script: CallScript; timestamp: number }>>([]);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const objectives: { key: CallObjective; label: string; icon: React.ReactNode }[] = [
    { key: 'pitch', label: 'Cold Pitch', icon: <Phone className="w-3.5 h-3.5" /> },
    { key: 'followup', label: 'Follow-Up', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { key: 'booking', label: 'Booking', icon: <Target className="w-3.5 h-3.5" /> },
    { key: 'negotiation', label: 'Negotiation', icon: <Users className="w-3.5 h-3.5" /> },
  ];

  const personas: { key: ClientPersona; label: string; color: string }[] = [
    { key: 'friendly', label: 'Friendly', color: 'bg-green-100 text-green-700 border-green-200' },
    { key: 'skeptical', label: 'Skeptical', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { key: 'busy', label: 'Busy', color: 'bg-red-100 text-red-700 border-red-200' },
    { key: 'price-sensitive', label: 'Price-Sensitive', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  ];

  const handleGenerateScript = async () => {
    if (!clientName.trim() || !clientBusiness.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateCallScript(input, strategy, clientName, clientBusiness, objective, objections || undefined);
      setScript(result);
      setSavedScripts(prev => [{ clientName, objective, script: result, timestamp: Date.now() }, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendRehearsal = async () => {
    if (!rehearsalInput.trim() || isSimulating) return;
    const userMsg = rehearsalInput.trim();
    setRehearsalInput('');
    const updated = [...rehearsalMessages, { role: 'user' as const, text: userMsg }];
    setRehearsalMessages(updated);
    setIsSimulating(true);
    try {
      const reply = await simulateClientResponse(userMsg, persona, clientName || 'the client', clientBusiness || 'their business', updated);
      setRehearsalMessages(prev => [...prev, { role: 'client', text: reply }]);
    } catch {
      setRehearsalMessages(prev => [...prev, { role: 'client', text: "Sorry, can you repeat that?" }]);
    } finally {
      setIsSimulating(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const CopyBtn = ({ text, section }: { text: string; section: string }) => (
    <button onClick={() => copyToClipboard(text, section)} className="ml-auto flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-600 transition-colors">
      {copiedSection === section ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copiedSection === section ? 'Copied' : 'Copy'}
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-teal/10 rounded-2xl flex items-center justify-center">
          <Phone className="w-5 h-5 text-brand-teal" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight text-brand-black">CallCoach</h2>
          <p className="text-xs text-stone-400 tracking-wide">Sales rehearsal & script generator</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex bg-white p-2 rounded-2xl shadow-md border border-stone-100 mb-8">
        {([
          { key: 'script' as const, label: 'Script Builder', icon: <FileText className="w-4 h-4" /> },
          { key: 'rehearsal' as const, label: 'Voice Rehearsal', icon: <Volume2 className="w-4 h-4" /> },
          { key: 'history' as const, label: 'Call History', icon: <MessageSquare className="w-4 h-4" /> },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActivePanel(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activePanel === tab.key ? 'bg-brand-black text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel 1: Script Builder */}
      {activePanel === 'script' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Inputs */}
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="e.g., Sarah Johnson"
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Client Business</label>
              <input
                type="text"
                value={clientBusiness}
                onChange={e => setClientBusiness(e.target.value)}
                placeholder="e.g., Sunshine Bakery"
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Call Objective</label>
              <div className="flex flex-wrap gap-2">
                {objectives.map(o => (
                  <button
                    key={o.key}
                    onClick={() => setObjective(o.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                      objective === o.key
                        ? 'bg-brand-teal text-white border-brand-teal shadow-md'
                        : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {o.icon}
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Known Objections <span className="text-stone-300">(optional)</span></label>
              <input
                type="text"
                value={objections}
                onChange={e => setObjections(e.target.value)}
                placeholder="e.g., too expensive, already has a designer, not now"
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateScript}
              disabled={isGenerating || !clientName.trim() || !clientBusiness.trim()}
              className="bg-brand-teal text-white rounded-2xl px-8 py-4 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'Generating...' : 'Generate Script'}
            </motion.button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>

          {/* Right — Generated Script */}
          <div className="space-y-4">
            {!script && !isGenerating && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 text-stone-300">
                <FileText className="w-12 h-12 mb-3" />
                <p className="text-sm font-medium">Fill in client details and generate a script</p>
              </div>
            )}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 text-stone-400">
                <Loader2 className="w-10 h-10 animate-spin mb-3 text-brand-teal" />
                <p className="text-sm font-medium">Crafting your script...</p>
              </div>
            )}
            {script && !isGenerating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Opener</span>
                    <CopyBtn text={script.opener} section="opener" />
                  </div>
                  <p className="text-sm text-green-900 leading-relaxed">{script.opener}</p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Value Proposition</span>
                    <CopyBtn text={script.valueProposition} section="value" />
                  </div>
                  <p className="text-sm text-blue-900 leading-relaxed">{script.valueProposition}</p>
                </div>

                <div className="space-y-2">
                  {script.objectionResponses?.map((obj, i) => (
                    <div key={i} className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-3.5 h-3.5 text-orange-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">Objection {i + 1}</span>
                        <CopyBtn text={`Objection: ${obj.objection}\nResponse: ${obj.response}`} section={`obj-${i}`} />
                      </div>
                      <p className="text-xs font-semibold text-orange-800 mb-1">"{obj.objection}"</p>
                      <p className="text-sm text-orange-900 leading-relaxed">{obj.response}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-brand-lavender/10 rounded-2xl p-6 border border-brand-lavender/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-brand-lavender" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-lavender">Closing Statement</span>
                    <CopyBtn text={script.closingStatement} section="closing" />
                  </div>
                  <p className="text-sm text-stone-800 leading-relaxed">{script.closingStatement}</p>
                </div>

                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-stone-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">Follow-Up Actions</span>
                    <CopyBtn text={script.followUpActions.join('\n')} section="followup" />
                  </div>
                  <ul className="space-y-2">
                    {script.followUpActions?.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                        <span className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Panel 2: Voice Rehearsal */}
      {activePanel === 'rehearsal' && (
        <div className="space-y-5">
          {/* Persona Selector */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Client Persona</label>
            <div className="flex flex-wrap gap-2">
              {personas.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPersona(p.key)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                    persona === p.key ? `${p.color} border-current shadow-md` : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-stone-400 italic">AI is playing a <span className="font-semibold text-stone-500">{persona}</span> client. Practice your pitch!</p>

          {/* Message History */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm min-h-[320px] max-h-[480px] overflow-y-auto p-5 space-y-3">
            {rehearsalMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-stone-300 text-center">
                <Volume2 className="w-10 h-10 mb-2" />
                <p className="text-sm">Start the conversation below</p>
              </div>
            )}
            {rehearsalMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-black text-white rounded-br-md'
                    : 'bg-stone-100 text-stone-800 rounded-bl-md'
                }`}>
                  {msg.role === 'client' && (
                    <span className={`inline-block text-[9px] font-black uppercase tracking-widest mb-1 px-2 py-0.5 rounded-full ${
                      personas.find(p => p.key === persona)?.color || 'bg-stone-200 text-stone-600'
                    }`}>
                      {persona} client
                    </span>
                  )}
                  <p>{msg.text}</p>
                </div>
              </motion.div>
            ))}
            {isSimulating && (
              <div className="flex justify-start">
                <div className="bg-stone-100 px-4 py-3 rounded-2xl rounded-bl-md">
                  <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={rehearsalInput}
              onChange={e => setRehearsalInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendRehearsal()}
              placeholder="Type your sales pitch..."
              className="flex-1 px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendRehearsal}
              disabled={isSimulating || !rehearsalInput.trim()}
              className="bg-brand-teal text-white rounded-2xl px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Panel 3: Call History */}
      {activePanel === 'history' && (
        <div className="space-y-3">
          {savedScripts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-stone-300 text-center">
              <FileText className="w-12 h-12 mb-3" />
              <p className="text-sm font-medium">No scripts yet</p>
              <p className="text-xs mt-1">Generate a script to see it here</p>
            </div>
          )}
          {savedScripts.map((entry, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                setScript(entry.script);
                setActivePanel('script');
              }}
              className="w-full text-left bg-white rounded-2xl p-5 border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-brand-black">{entry.clientName}</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mt-0.5">{entry.objective}</p>
                </div>
                <span className="text-xs text-stone-300">{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
