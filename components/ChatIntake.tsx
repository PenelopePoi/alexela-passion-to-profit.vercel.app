import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ChevronDown, ChevronUp, Save, Sparkles, Check, Circle } from 'lucide-react';
import type { BrandInput } from '../types';
import { logSubmission, rateLimitOk } from '../services/submissionLog';

interface ChatIntakeProps {
  onComplete: (data: BrandInput) => void;
  onSaveDraft: (data: BrandInput) => void;
}

interface ChatMsg {
  id: string;
  role: 'ai' | 'user';
  text: string;
  showVibeChips?: boolean;
  timestamp: number;
}

const VIBES = ['Modern', 'Rustic', 'Bold', 'Elegant', 'Playful', 'Industrial', 'Minimal', 'Luxury', 'Retro', 'Organic'];
const STORAGE_KEY = 'xela-chat-intake';
const INITIAL_MSG = "Hey there! I'm Xela — think of me as your brand consultant. 👋\n\nI'm so glad you're here. Let's build something you're actually proud of. I'll ask a few quick questions and your brand brief will be ready in under 3 minutes.\n\nLet's start with the fun one — **what's your business called?**";

const FIELDS: { key: keyof BrandInput; label: string; ask: string; ack: (d: Partial<BrandInput>) => string }[] = [
  { key: 'companyName', label: 'Business Name', ask: "What's your business called? (Or what are you thinking of naming it?)", ack: d => `**${d.companyName}** — I love that.` },
  { key: 'industry', label: 'Industry', ask: "So what kind of business is it? Barbershop, landscaping, food truck, anything goes.", ack: d => `${d.industry} — awesome, we've branded a ton of those.` },
  { key: 'location', label: 'Location', ask: "Where are your customers coming from? A city, a state, or 'everywhere' all work.", ack: d => `${d.location} — nice, we know that market well.` },
  { key: 'vibe', label: 'Brand Vibe', ask: "Now the fun part — how should your brand *feel*? Pick whichever speaks to you 👇", ack: d => `${d.vibe} — oh yeah, I can already picture it.` },
  { key: 'services', label: 'Services', ask: "What do you actually offer? List everything — the more detail, the better we can dial it in.", ack: d => `${(d.services as string[])?.length} services — got 'em all.` },
  { key: 'ownerName', label: 'Owner', ask: "Who's the human behind this? Your name will end up on the business cards.", ack: d => `Great to meet you, ${(d.ownerName as string)?.split(' ')[0]}.` },
  { key: 'phone', label: 'Phone', ask: "What's the best number to reach you? (This is what'll go on your cards and marketing)", ack: () => "Got your number — we won't spam you, promise." },
  { key: 'email', label: 'Email', ask: "Last one — what's the best email to send your quote to?", ack: () => "Perfect. That's everything I need from you." },
];

function isFilled(data: Partial<BrandInput>, key: keyof BrandInput) {
  const v = data[key];
  if (key === 'services') return Array.isArray(v) && v.length > 0;
  return !!v;
}

function parseResponse(text: string, currentField: string, data: Partial<BrandInput>): Partial<BrandInput> {
  const updates: Partial<BrandInput> = {};
  if (!data.companyName) {
    const m = text.match(/(?:called|named?|it's|its)\s+["']?([A-Z][^"',.\n]{1,40})/i);
    if (m) updates.companyName = m[1].trim();
  }
  if (!data.location) {
    const m = text.match(/(?:in|from|based in|located in|near)\s+([A-Za-z\s]+,?\s*(?:FL|Florida|CA|TX|NY|GA|OH|PA|IL|NC|NJ|VA|WA|AZ|MA|TN|MO|MD|WI|MN|CO|AL|SC|LA|KY|OR|OK|CT|UT|IA|NV|AR|MS|KS|NM|NE|WV|ID|HI|NH|ME|MT|RI|DE|SD|ND|AK|VT|WY|DC)?)/i);
    if (m) updates.location = m[1].trim().replace(/,?\s*$/, '');
  }
  if (!data.ownerName) {
    const m = text.match(/(?:my name is|i'm|i am|name's)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (m) updates.ownerName = m[1].trim();
  }
  if (!data.industry) {
    const m = text.match(/(?:run|own|have|start)\s+(?:a|an)\s+([A-Za-z\s]{2,30}?)(?:\s+(?:in|from|shop|business|company|studio))/i);
    if (m) updates.industry = m[1].trim().replace(/^\w/, c => c.toUpperCase());
  }
  const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch && !data.phone) updates.phone = phoneMatch[0];
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch && !data.email) updates.email = emailMatch[0];

  if (Object.keys(updates).length === 0) {
    if (currentField === 'companyName') updates.companyName = text.trim();
    else if (currentField === 'industry') updates.industry = text.trim();
    else if (currentField === 'location') updates.location = text.trim();
    else if (currentField === 'ownerName') updates.ownerName = text.trim();
    else if (currentField === 'phone') updates.phone = text.trim();
    else if (currentField === 'email') updates.email = text.trim();
    else if (currentField === 'services') updates.services = text.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
  }
  return updates;
}

function generateAIResponse(data: Partial<BrandInput>, justFilled: string) {
  const next = FIELDS.find(f => !isFilled(data, f.key));
  const just = FIELDS.find(f => f.key === justFilled);
  const ack = just ? just.ack(data) : '';
  if (!next) return { message: `${ack}\n\n🎉 **Your brand brief is ready!** Give the summary a quick look and hit "Build My Brand" whenever you're good to go.`, nextField: 'done', showVibeChips: false };
  return { message: ack ? `${ack}\n\n${next.ask}` : next.ask, nextField: next.key as string, showVibeChips: next.key === 'vibe' };
}

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
      seg.startsWith('**') && seg.endsWith('**') ? <strong key={j} className="font-bold">{seg.slice(2, -2)}</strong> : seg
    );
    return <span key={i}>{parts}{i < text.split('\n').length - 1 && <br />}</span>;
  });
}

export default function ChatIntake({ onComplete, onSaveDraft }: ChatIntakeProps) {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  const initial = saved ? JSON.parse(saved) : null;

  const [messages, setMessages] = useState<ChatMsg[]>(initial?.messages ?? [{ id: '0', role: 'ai', text: INITIAL_MSG, showVibeChips: false, timestamp: Date.now() }]);
  const [data, setData] = useState<Partial<BrandInput>>(initial?.data ?? {});
  const [currentField, setCurrentField] = useState<string>(initial?.currentField ?? 'companyName');
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filledCount = FIELDS.filter(f => isFilled(data, f.key)).length;
  const allDone = filledCount === FIELDS.length;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, data, currentField }));
  }, [messages, data, currentField]);

  const pushAI = useCallback((text: string, vibeChips: boolean) => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'ai', text, showVibeChips: vibeChips, timestamp: Date.now() }]);
    setTyping(false);
  }, []);

  const handleSend = useCallback((text: string) => {
    if (!text.trim() || typing) return;
    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: 'user', text: text.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const updates = parseResponse(text, currentField, data);
    const newData = { ...data, ...updates };
    setData(newData);
    const justFilled = Object.keys(updates)[0] || currentField;

    setTimeout(() => {
      const resp = generateAIResponse(newData, justFilled);
      setCurrentField(resp.nextField);
      pushAI(resp.message, resp.showVibeChips ?? false);
    }, 500);
  }, [currentField, data, typing, pushAI]);

  const handleVibe = useCallback((vibe: string) => {
    if (typing) return;
    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: 'user', text: vibe, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);
    const newData = { ...data, vibe };
    setData(newData);
    setTimeout(() => {
      const resp = generateAIResponse(newData, 'vibe');
      setCurrentField(resp.nextField);
      pushAI(resp.message, resp.showVibeChips ?? false);
    }, 500);
  }, [data, typing, pushAI]);

  const buildPayload = (): BrandInput => ({
    companyName: data.companyName || '', industry: data.industry || '', services: data.services || [],
    vibe: data.vibe || '', location: data.location || '', audience: '', ownerName: data.ownerName,
    phone: data.phone, email: data.email,
  });

  const handleBuild = () => {
    const finalData = buildPayload();
    if (!rateLimitOk()) { onComplete(finalData); return; }
    try {
      const body = new FormData();
      body.append('_subject', `🚨 NEW LEAD (Chat) · ${finalData.companyName || 'Unknown'} · ACTION NEEDED`);
      body.append('_template', 'box');
      body.append('_captcha', 'false');
      body.append('_honey', ''); // formsubmit.co honeypot — bots fill this
      body.append('_cc', 'bookittyfirepro@yahoo.com,bookityfirepro321@gmail.com');
      body.append('Source', 'Chat Intake');
      body.append('Company', finalData.companyName || 'Not provided');
      body.append('Industry', finalData.industry || 'Not provided');
      body.append('Location', finalData.location || 'Not provided');
      body.append('Vibe', finalData.vibe || 'Not specified');
      body.append('Services', Array.isArray(finalData.services) ? finalData.services.join(', ') : (finalData.services || 'None'));
      body.append('Owner', finalData.ownerName || 'Not provided');
      body.append('Phone', finalData.phone || 'Not provided');
      body.append('Email', finalData.email || 'Not provided');
      body.append('Action Items', `1. Review brand brief for ${finalData.companyName || 'client'}\n2. Research ${finalData.industry || 'industry'} competitors\n3. Prepare quote\n4. Call within 2 hours\n5. Send welcome email`);
      fetch('https://formsubmit.co/ajax/xelabrandingstudio@gmail.com', {
        method: 'POST',
        body,
      }).catch(() => {});
      logSubmission('chat-intake', finalData);
    } catch {}
    onComplete(finalData);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[80vh] bg-[#0a0a0a] text-white">
      {/* Mobile brief toggle */}
      <div className="lg:hidden p-3 border-b border-white/10">
        <button onClick={() => setBriefOpen(!briefOpen)} className="flex items-center gap-2 text-sm text-white/60">
          <Sparkles size={14} className="text-brand-teal" /> Brand Brief ({filledCount}/{FIELDS.length})
          {briefOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence>{briefOpen && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden"><BriefCard data={data} allDone={allDone} onSave={() => onSaveDraft(buildPayload())} onBuild={handleBuild} /></motion.div>}</AnimatePresence>
      </div>

      {/* Chat panel */}
      <div className="flex-1 lg:w-[60%] flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-brand-teal text-brand-black rounded-br-md' : 'bg-white/5 border border-white/10 rounded-bl-md'
                }`}>
                  {renderMarkdown(msg.text)}
                  {msg.showVibeChips && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {VIBES.map(v => (
                        <button key={v} onClick={() => handleVibe(v)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-brand-teal hover:text-brand-black border border-white/10 hover:border-brand-teal transition-all">
                          {v}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                {[0, 1, 2].map(i => <motion.span key={i} className="w-2 h-2 rounded-full bg-brand-teal/60" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} />)}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <form onSubmit={e => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder={allDone ? "You're all set — hit Build My Brand →" : 'Type your answer...'}
              disabled={allDone} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-brand-teal/50 disabled:opacity-40 transition-all" />
            <button type="submit" disabled={!input.trim() || typing || allDone}
              className="p-3 rounded-xl bg-brand-teal text-brand-black disabled:opacity-30 hover:brightness-110 transition-all">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Desktop brief sidebar */}
      <div className="hidden lg:block lg:w-[40%] p-6 border-l border-white/10 overflow-y-auto">
        <BriefCard data={data} allDone={allDone} onSave={() => onSaveDraft(buildPayload())} onBuild={handleBuild} />
      </div>
    </div>
  );
}

function BriefCard({ data, allDone, onSave, onBuild }: { data: Partial<BrandInput>; allDone: boolean; onSave: () => void; onBuild: () => void }) {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-[2rem] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black tracking-widest text-xs uppercase text-brand-teal">Brand Brief</h3>
        <button onClick={onSave} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"><Save size={12} /> Save Draft</button>
      </div>
      <div className="space-y-3">
        {FIELDS.map(f => {
          const filled = isFilled(data, f.key);
          const val = f.key === 'services' ? (data.services || []).join(', ') : (data[f.key] as string) || '';
          return (
            <motion.div key={f.key} layout className="flex items-start gap-3">
              <div className="mt-0.5">{filled ? <Check size={14} className="text-green-400" /> : <Circle size={14} className="text-white/15" />}</div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-white/30 font-semibold">{f.label}</p>
                <AnimatePresence mode="wait">
                  {filled ? (
                    <motion.p key="val" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-white truncate">{val}</motion.p>
                  ) : (
                    <motion.p key="empty" className="text-sm text-white/15 italic">—</motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence>
        {allDone && (
          <motion.button initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={onBuild}
            className="w-full py-3 rounded-xl bg-brand-teal text-brand-black font-bold text-sm tracking-wide hover:brightness-110 transition-all flex items-center justify-center gap-2">
            <Sparkles size={16} /> Build My Brand
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
