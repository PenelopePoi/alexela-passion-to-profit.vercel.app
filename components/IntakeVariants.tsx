import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, ArrowLeft, Mic, Send,
  Heart, BookOpen, Blocks, Star, Music, UtensilsCrossed,
  Calendar, RotateCw, Rocket,
} from 'lucide-react';
import type { BrandInput } from '../types';
import { logSubmission, rateLimitOk } from '../services/submissionLog';

// ============================================================================
// TYPES & METADATA
// ============================================================================

export interface IntakeVariant {
  id: number;
  name: string;
  description: string;
  accent: string;
  emoji: string;
}

export const INTAKE_VARIANTS: IntakeVariant[] = [
  { id: 1,  name: 'Classic Wizard',   description: '5-step form with progress bar',         accent: 'brand-teal',   emoji: '🧙' },
  { id: 2,  name: 'Chat Bot',         description: 'One message at a time, conversational', accent: 'sky-400',      emoji: '💬' },
  { id: 3,  name: 'Speed Round',      description: '60-second rapid-fire intake',           accent: 'red-400',      emoji: '⏱️' },
  { id: 4,  name: 'Terminal Hacker',  description: 'CLI green monospace prompts',           accent: 'green-400',    emoji: '🖥️' },
  { id: 5,  name: 'Mood Board',       description: 'Pinterest-style image grid',            accent: 'pink-400',     emoji: '🎨' },
  { id: 6,  name: 'Postcard',         description: 'Letter format, Dear XELA…',             accent: 'amber-300',    emoji: '✉️' },
  { id: 7,  name: 'Quiz Show',        description: 'Buzzer-style answer buttons',           accent: 'yellow-400',   emoji: '🎯' },
  { id: 8,  name: 'Minimalist',       description: 'Single textarea, AI parses everything', accent: 'white',        emoji: '⬜' },
  { id: 9,  name: 'Comic Book',       description: 'Speech bubbles in comic panels',        accent: 'orange-400',   emoji: '💥' },
  { id: 10, name: 'Dating Profile',   description: 'Brand profile card builder',            accent: 'rose-400',     emoji: '💘' },
  { id: 11, name: 'Journal Entry',    description: 'Handwritten diary format',              accent: 'amber-200',    emoji: '📔' },
  { id: 12, name: 'Building Blocks',  description: 'Stack Lego-style answer blocks',        accent: 'red-500',      emoji: '🧱' },
  { id: 13, name: 'Horoscope',        description: 'Astrological brand reading',            accent: 'purple-400',   emoji: '🔮' },
  { id: 14, name: 'Concert Lineup',   description: 'Music festival poster style',           accent: 'fuchsia-400',  emoji: '🎤' },
  { id: 15, name: 'Menu Order',       description: 'Restaurant menu format',                accent: 'amber-500',    emoji: '🍽️' },
  { id: 16, name: 'Sticker Book',     description: 'Drag emoji stickers',                   accent: 'cyan-300',     emoji: '🌟' },
  { id: 17, name: 'Voice Note',       description: 'Big mic recording mock',                accent: 'red-500',      emoji: '🎙️' },
  { id: 18, name: 'Timeline',         description: 'Horizontal scrolling timeline',         accent: 'blue-400',     emoji: '📅' },
  { id: 19, name: 'Card Flip',        description: '3D card flip reveal',                   accent: 'indigo-400',   emoji: '🃏' },
  { id: 20, name: 'Launch Sequence',  description: 'NASA countdown system check',           accent: 'orange-500',   emoji: '🚀' },
];

export interface IntakeVariantProps {
  variantId: number;
  onComplete: (data: Partial<BrandInput>) => void;
  onSaveDraft?: (data: Partial<BrandInput>) => void;
}

// ============================================================================
// SHARED CONFIG
// ============================================================================

const VIBES = [
  { id: 'modern',   label: 'Modern & Minimalist', emoji: '✨' },
  { id: 'bold',     label: 'Bold & Energetic',    emoji: '⚡' },
  { id: 'luxury',   label: 'Luxury & High-End',   emoji: '💎' },
  { id: 'friendly', label: 'Friendly & Local',    emoji: '🤝' },
  { id: 'eco',      label: 'Eco & Organic',       emoji: '🌿' },
  { id: 'gothic',   label: 'Dark & Gothic',       emoji: '🖤' },
];

interface FormData {
  companyName: string;
  industry: string;
  location: string;
  vibe: string;
  services: string;
  ownerName: string;
  phone: string;
  email: string;
}

const EMPTY: FormData = {
  companyName: '', industry: '', location: '', vibe: '',
  services: '', ownerName: '', phone: '', email: '',
};

const FIELDS: Array<{ key: keyof FormData; label: string; placeholder: string; type?: string }> = [
  { key: 'companyName', label: 'Company Name',  placeholder: 'Acme Tree Service' },
  { key: 'industry',    label: 'Industry',      placeholder: 'Tree care, landscaping…' },
  { key: 'location',    label: 'Location',      placeholder: 'Tampa, FL' },
  { key: 'vibe',        label: 'Brand Vibe',    placeholder: 'pick one' },
  { key: 'services',    label: 'Services',      placeholder: 'Tree removal, stump grinding…' },
  { key: 'ownerName',   label: 'Your Name',     placeholder: 'Jane Doe' },
  { key: 'phone',       label: 'Phone',         placeholder: '(555) 123-4567', type: 'tel' },
  { key: 'email',       label: 'Email',         placeholder: 'you@business.com', type: 'email' },
];

const toBrandInput = (d: FormData): Partial<BrandInput> => ({
  companyName: d.companyName,
  industry: d.industry,
  location: d.location,
  vibe: d.vibe,
  services: d.services.split(/[,\n]/).map(s => s.trim()).filter(Boolean),
  ownerName: d.ownerName,
  audience: '',
  additionalNotes: `Contact: ${d.phone} / ${d.email}`,
});

// ============================================================================
// SHARED PRIMITIVES
// ============================================================================

const Input: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  autoFocus?: boolean;
  onEnter?: () => void;
}> = ({ value, onChange, placeholder, type = 'text', className = '', autoFocus, onEnter }) => (
  <input
    type={type}
    value={value}
    autoFocus={autoFocus}
    onChange={(e) => onChange(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
    placeholder={placeholder}
    className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition ${className}`}
  />
);

const VibePicker: React.FC<{ value: string; onChange: (v: string) => void; accent: string }> = ({ value, onChange, accent }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
    {VIBES.map(v => (
      <button
        key={v.id}
        onClick={() => onChange(v.id)}
        className={`px-3 py-3 rounded-lg border text-left transition ${
          value === v.id
            ? `bg-${accent}/20 border-${accent} text-white`
            : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
        }`}
      >
        <div className="text-xl">{v.emoji}</div>
        <div className="text-xs mt-1">{v.label}</div>
      </button>
    ))}
  </div>
);

const NextBtn: React.FC<{ onClick: () => void; label?: string; accent?: string; disabled?: boolean }> = ({ onClick, label = 'Next', accent = 'brand-teal', disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`group px-6 py-3 rounded-lg bg-${accent} text-brand-black font-bold flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-${accent}/40 hover:brightness-110 active:scale-95 transition-all`}
  >
    {label} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-disabled:translate-x-0" />
  </button>
);

// ============================================================================
// SHARED STEPPED FORM (drives most variants)
// ============================================================================

interface SteppedShellProps {
  data: FormData;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
  onComplete: () => void;
  accent: string;
  renderField?: (field: typeof FIELDS[number], idx: number, total: number) => React.ReactNode;
  wrapperClass?: string;
  cardClass?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const SteppedShell: React.FC<SteppedShellProps> = ({
  data, setData, onComplete, accent, renderField, wrapperClass = '', cardClass = '', header, footer,
}) => {
  const [step, setStep] = useState(0);
  const total = FIELDS.length;
  const field = FIELDS[step];
  const value = data[field.key];

  const next = () => {
    if (step >= total - 1) onComplete();
    else setStep(s => s + 1);
  };
  const prev = () => setStep(s => Math.max(0, s - 1));

  return (
    <div className={wrapperClass}>
      {header}
      <div className={`max-w-xl mx-auto ${cardClass}`}>
        <div className="mb-6">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Step {step + 1} / {total}</span>
            <span>{Math.round(((step + 1) / total) * 100)}%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-${accent}`}
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {renderField ? renderField(field, step, total) : (
              <>
                <label className="block text-sm uppercase tracking-wider text-white/60 mb-3">
                  {field.label}
                </label>
                {field.key === 'vibe' ? (
                  <VibePicker value={value} onChange={(v) => setData(d => ({ ...d, vibe: v }))} accent={accent} />
                ) : field.key === 'services' ? (
                  <textarea
                    autoFocus
                    value={value}
                    onChange={(e) => setData(d => ({ ...d, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/40"
                  />
                ) : (
                  <Input
                    autoFocus
                    type={field.type}
                    value={value}
                    onChange={(v) => setData(d => ({ ...d, [field.key]: v }))}
                    placeholder={field.placeholder}
                    onEnter={next}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={prev}
            disabled={step === 0}
            className="px-4 py-2 text-white/60 disabled:opacity-20 flex items-center gap-1 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <NextBtn onClick={next} label={step === total - 1 ? 'Submit' : 'Next'} accent={accent} disabled={!value} />
        </div>
      </div>
      {footer}
    </div>
  );
};

// ============================================================================
// VARIANT 1 — CLASSIC WIZARD
// ============================================================================

const ClassicWizard: React.FC<{ data: FormData; setData: any; onComplete: () => void }> = ({ data, setData, onComplete }) => (
  <div className="min-h-screen bg-brand-black p-8 flex items-center">
    <SteppedShell
      data={data}
      setData={setData}
      onComplete={onComplete}
      accent="brand-teal"
      cardClass="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur"
      header={<h1 className="text-center text-3xl font-bold text-white mb-8">Brand Intake</h1>}
    />
  </div>
);

// ============================================================================
// VARIANT 2 — CHAT BOT
// ============================================================================

const ChatBot: React.FC<{ data: FormData; setData: any; onComplete: () => void }> = ({ data, setData, onComplete }) => {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');
  const messages = FIELDS.slice(0, step + 1);
  const field = FIELDS[step];

  const send = () => {
    if (!draft.trim()) return;
    setData((d: FormData) => ({ ...d, [field.key]: draft }));
    setDraft('');
    if (step >= FIELDS.length - 1) setTimeout(onComplete, 400);
    else setStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-brand-black p-4 flex flex-col">
      <div className="max-w-lg w-full mx-auto flex-1 flex flex-col">
        <div className="text-center py-4 border-b border-white/10">
          <div className="text-sky-400 font-bold">XELA Bot</div>
          <div className="text-xs text-white/40">online</div>
        </div>
        <div className="flex-1 py-6 space-y-4 overflow-y-auto">
          {messages.map((f, i) => (
            <div key={f.key}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[80%] text-white">
                {`What's your ${f.label.toLowerCase()}?`}
              </motion.div>
              {data[f.key] && i < step && (
                <div className="bg-sky-400 px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%] text-brand-black ml-auto mt-2">
                  {data[f.key]}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 py-4">
          <input
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white"
          />
          <button onClick={send} className="w-12 h-12 rounded-full bg-sky-400 flex items-center justify-center text-brand-black">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VARIANT 3 — SPEED ROUND
// ============================================================================

const SpeedRound: React.FC<{ data: FormData; setData: any; onComplete: () => void }> = ({ data, setData, onComplete }) => {
  const [time, setTime] = useState(60);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (time <= 0) { onComplete(); return; }
    const t = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(t);
  }, [time, onComplete]);

  const field = FIELDS[step];
  const next = () => {
    if (step >= FIELDS.length - 1) onComplete();
    else setStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ scale: time < 10 ? [1, 1.1, 1] : 1 }}
        transition={{ repeat: Infinity, duration: 0.5 }}
        className={`text-7xl font-bold mb-8 ${time < 10 ? 'text-red-400' : 'text-white'}`}
      >
        {time}
      </motion.div>
      <div className="text-red-400 uppercase tracking-widest text-sm mb-4">Speed Round</div>
      <div className="text-3xl text-white font-bold mb-6">{field.label}?</div>
      {field.key === 'vibe' ? (
        <div className="max-w-md"><VibePicker value={data.vibe} onChange={(v) => { setData((d: FormData) => ({ ...d, vibe: v })); next(); }} accent="red-400" /></div>
      ) : (
        <Input
          autoFocus
          value={data[field.key]}
          onChange={(v) => setData((d: FormData) => ({ ...d, [field.key]: v }))}
          placeholder={field.placeholder}
          className="max-w-md text-2xl text-center"
          onEnter={next}
        />
      )}
      <button onClick={next} className="mt-6 text-white/60 hover:text-white text-sm">skip →</button>
    </div>
  );
};

// ============================================================================
// VARIANT 4 — TERMINAL HACKER
// ============================================================================

const TerminalHacker: React.FC<{ data: FormData; setData: any; onComplete: () => void }> = ({ data, setData, onComplete }) => {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');
  const field = FIELDS[step];

  const submit = () => {
    if (!draft.trim()) return;
    setData((d: FormData) => ({ ...d, [field.key]: draft }));
    setDraft('');
    if (step >= FIELDS.length - 1) setTimeout(onComplete, 400);
    else setStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-black p-6 font-mono text-green-400">
      <div className="max-w-2xl mx-auto">
        <div className="text-xs opacity-60 mb-4">XELA-OS v1.0 — brand intake module loaded</div>
        {FIELDS.slice(0, step).map((f) => (
          <div key={f.key} className="mb-2">
            <div>$ xela --ask "{f.label}"</div>
            <div className="text-green-200">→ {data[f.key]}</div>
          </div>
        ))}
        <div>$ xela --ask "{field.label}"</div>
        <div className="flex items-center gap-2">
          <span>→</span>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="flex-1 bg-transparent outline-none border-none text-green-200"
          />
          <span className="animate-pulse">▌</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VARIANT 5 — MOOD BOARD
// ============================================================================

const MoodBoard: React.FC<{ data: FormData; setData: any; onComplete: () => void }> = ({ data, setData, onComplete }) => {
  const [phase, setPhase] = useState<'vibe' | 'rest'>('vibe');
  if (phase === 'vibe') {
    return (
      <div className="min-h-screen bg-brand-black p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Pick your vibe</h1>
        <p className="text-white/50 text-center mb-8">Tap the board that feels right</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {VIBES.map(v => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              key={v.id}
              onClick={() => { setData((d: FormData) => ({ ...d, vibe: v.id })); setPhase('rest'); }}
              className="aspect-square rounded-2xl bg-gradient-to-br from-pink-400/20 to-purple-500/20 border border-white/10 flex flex-col items-center justify-center"
            >
              <div className="text-6xl mb-2">{v.emoji}</div>
              <div className="text-white">{v.label}</div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-brand-black p-8 flex items-center">
      <SteppedShell data={data} setData={setData} onComplete={onComplete} accent="pink-400" />
    </div>
  );
};

// ============================================================================
// VARIANT 6 — POSTCARD
// ============================================================================

const Postcard: React.FC<{ data: FormData; setData: any; onComplete: () => void }> = ({ data, setData, onComplete }) => (
  <div className="min-h-screen bg-amber-50 p-8 flex items-center justify-center">
    <div className="max-w-2xl w-full bg-amber-100 border border-amber-300 rounded-lg p-10 shadow-2xl" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="text-right text-amber-700 text-sm mb-6">{new Date().toLocaleDateString()}</div>
      <div className="text-amber-900 text-lg leading-relaxed">
        <div className="mb-4">Dear XELA,</div>
        <div className="space-y-3">
          <div>My business is called <em className="border-b border-amber-500"><Input value={data.companyName} onChange={(v) => setData((d: FormData) => ({ ...d, companyName: v }))} className="!bg-transparent !border-0 !text-amber-900 inline-block !w-48 !p-0" /></em></div>
          <div>and we work in <em><Input value={data.industry} onChange={(v) => setData((d: FormData) => ({ ...d, industry: v }))} className="!bg-transparent !border-0 !text-amber-900 inline-block !w-48 !p-0" /></em></div>
          <div>here in <em><Input value={data.location} onChange={(v) => setData((d: FormData) => ({ ...d, location: v }))} className="!bg-transparent !border-0 !text-amber-900 inline-block !w-40 !p-0" /></em>.</div>
          <div>We offer: <Input value={data.services} onChange={(v) => setData((d: FormData) => ({ ...d, services: v }))} className="!bg-transparent !border-0 !text-amber-900 inline-block !w-full !p-0" /></div>
          <div>Our vibe is:</div>
          <div className="flex flex-wrap gap-2">
            {VIBES.map(v => (
              <button key={v.id} onClick={() => setData((d: FormData) => ({ ...d, vibe: v.id }))} className={`px-3 py-1 rounded ${data.vibe === v.id ? 'bg-amber-500 text-white' : 'bg-amber-200 text-amber-900'}`}>{v.emoji} {v.label}</button>
            ))}
          </div>
          <div className="pt-4">Sincerely, <Input value={data.ownerName} onChange={(v) => setData((d: FormData) => ({ ...d, ownerName: v }))} placeholder="your name" className="!bg-transparent !border-0 !text-amber-900 inline-block !w-40 !p-0" /></div>
          <div className="text-sm">Reach me at <Input value={data.phone} onChange={(v) => setData((d: FormData) => ({ ...d, phone: v }))} placeholder="phone" className="!bg-transparent !border-0 !text-amber-900 inline-block !w-32 !p-0" /> or <Input value={data.email} onChange={(v) => setData((d: FormData) => ({ ...d, email: v }))} placeholder="email" className="!bg-transparent !border-0 !text-amber-900 inline-block !w-48 !p-0" /></div>
        </div>
      </div>
      <button onClick={onComplete} className="mt-6 px-6 py-2 bg-amber-700 text-amber-50 rounded">Mail It →</button>
    </div>
  </div>
);

// ============================================================================
// VARIANT 7 — QUIZ SHOW
// ============================================================================

const QuizShow: React.FC<{ data: FormData; setData: any; onComplete: () => void }> = ({ data, setData, onComplete }) => {
  const [step, setStep] = useState(0);
  const field = FIELDS[step];
  const next = () => step >= FIELDS.length - 1 ? onComplete() : setStep(s => s + 1);
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-brand-black p-8 flex flex-col items-center justify-center">
      <div className="text-yellow-400 uppercase tracking-widest text-xs mb-4">Question {step + 1}</div>
      <h1 className="text-5xl font-black text-white text-center mb-12 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]">
        {field.label.toUpperCase()}?
      </h1>
      <div className="max-w-xl w-full">
        {field.key === 'vibe' ? (
          <VibePicker value={data.vibe} onChange={(v) => { setData((d: FormData) => ({ ...d, vibe: v })); next(); }} accent="yellow-400" />
        ) : (
          <Input autoFocus value={data[field.key]} onChange={(v) => setData((d: FormData) => ({ ...d, [field.key]: v }))} placeholder={field.placeholder} onEnter={next} className="!text-2xl !text-center !py-4" />
        )}
      </div>
      <button onClick={next} className="mt-8 px-12 py-4 bg-yellow-400 text-purple-900 rounded-full font-black text-2xl shadow-2xl hover:scale-110 transition">
        BUZZ IN!
      </button>
    </div>
  );
};

// ============================================================================
// VARIANT 8 — MINIMALIST
// ============================================================================

const Minimalist: React.FC<{ data: FormData; setData: any; onComplete: () => void }> = ({ data, setData, onComplete }) => {
  const [text, setText] = useState('');
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-white text-2xl font-light mb-2">Tell us about your brand.</h1>
        <p className="text-white/40 text-sm mb-6">In your own words. Our AI will figure out the rest.</p>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => { setText(e.target.value); setData((d: FormData) => ({ ...d, additionalNotes: e.target.value, companyName: e.target.value.split(' ').slice(0, 3).join(' ') })); }}
          rows={12}
          placeholder="My business is..."
          className="w-full bg-transparent border-0 border-b border-white/20 text-white text-xl py-4 focus:outline-none focus:border-white resize-none placeholder-white/20"
        />
        <button onClick={onComplete} disabled={text.length < 20} className="mt-6 text-white/60 hover:text-white disabled:opacity-20 flex items-center gap-2">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// THEMED VARIANT (covers 9-20 with config-driven theming)
// ============================================================================

interface Theme {
  bg: string;
  card: string;
  accent: string;
  title: string;
  icon: React.ReactNode;
  fontFamily?: string;
  preLabel?: string;
}

const ThemedVariant: React.FC<{ theme: Theme; data: FormData; setData: any; onComplete: () => void }> = ({ theme, data, setData, onComplete }) => (
  <div className={`min-h-screen ${theme.bg} p-8 flex items-center`} style={theme.fontFamily ? { fontFamily: theme.fontFamily } : undefined}>
    <SteppedShell
      data={data}
      setData={setData}
      onComplete={onComplete}
      accent={theme.accent}
      cardClass={theme.card}
      header={
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            className="flex justify-center mb-3"
          >
            {theme.icon}
          </motion.div>
          {theme.preLabel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-xs uppercase tracking-widest text-${theme.accent} mb-2 font-black`}
            >
              {theme.preLabel}
            </motion.div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-4xl md:text-5xl font-black ${theme.title}`}
          >
            Tell Us About Your Brand
          </motion.h1>
        </motion.div>
      }
    />
  </div>
);

const THEMES: Record<number, Theme> = {
  9:  { bg: 'bg-yellow-300',                          card: 'bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0_rgba(0,0,0,1)]', accent: 'orange-400', title: 'text-black', icon: <div className="text-6xl">💥</div>, preLabel: 'KAPOW! Brand Origin Story' },
  10: { bg: 'bg-gradient-to-br from-rose-900 to-pink-900', card: 'bg-white/10 backdrop-blur rounded-3xl p-8 border border-rose-400/30', accent: 'rose-400', title: 'text-white', icon: <Heart className="w-12 h-12 text-rose-400" />, preLabel: 'Brand Profile' },
  11: { bg: 'bg-amber-50',                            card: 'bg-amber-100 rounded p-8 border-l-4 border-amber-700', accent: 'amber-600', title: 'text-amber-900', fontFamily: 'cursive', icon: <BookOpen className="w-10 h-10 text-amber-700" />, preLabel: `Dear Diary, ${new Date().toLocaleDateString()}` },
  12: { bg: 'bg-gradient-to-b from-red-600 to-red-900', card: 'bg-white/10 rounded-lg p-8 border-4 border-yellow-400', accent: 'yellow-400', title: 'text-white', icon: <Blocks className="w-12 h-12 text-yellow-400" />, preLabel: 'Stack Your Brand' },
  13: { bg: 'bg-gradient-to-b from-indigo-950 to-purple-950', card: 'bg-white/5 rounded-2xl p-8 border border-purple-400/30', accent: 'purple-400', title: 'text-purple-200', icon: <Star className="w-12 h-12 text-purple-300" />, preLabel: 'Your Brand Horoscope' },
  14: { bg: 'bg-gradient-to-b from-fuchsia-900 to-black', card: 'bg-black/60 rounded-lg p-8 border border-fuchsia-400', accent: 'fuchsia-400', title: 'text-fuchsia-300', icon: <Music className="w-12 h-12 text-fuchsia-400" />, preLabel: 'Brand Festival Lineup' },
  15: { bg: 'bg-stone-100',                           card: 'bg-white rounded p-10 border border-stone-300 shadow-lg', accent: 'amber-600', title: 'text-stone-900', fontFamily: 'Georgia, serif', icon: <UtensilsCrossed className="w-10 h-10 text-amber-700" />, preLabel: 'The XELA Menu' },
  16: { bg: 'bg-cyan-100',                            card: 'bg-white rounded-3xl p-8 border-4 border-cyan-400 shadow-xl', accent: 'cyan-500', title: 'text-cyan-900', icon: <div className="text-6xl">🌟</div>, preLabel: 'Sticker Book Brand' },
  17: { bg: 'bg-brand-black',                         card: 'bg-white/5 rounded-3xl p-8 border border-red-500/30', accent: 'red-500', title: 'text-white', icon: (
    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
      <Mic className="w-16 h-16 text-red-500" />
    </motion.div>
  ), preLabel: '● REC' },
  18: { bg: 'bg-gradient-to-r from-brand-black via-blue-950 to-brand-black', card: 'bg-white/5 rounded-2xl p-8 border-l-4 border-blue-400', accent: 'blue-400', title: 'text-blue-200', icon: <Calendar className="w-12 h-12 text-blue-400" />, preLabel: 'Brand Timeline' },
  19: { bg: 'bg-gradient-to-br from-indigo-900 to-violet-900', card: 'bg-white/10 backdrop-blur rounded-2xl p-8 border border-indigo-400/30', accent: 'indigo-400', title: 'text-white', icon: (
    <motion.div animate={{ rotateY: [0, 360] }} transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}>
      <RotateCw className="w-12 h-12 text-indigo-300" />
    </motion.div>
  ), preLabel: 'Card Flip Intake' },
  20: { bg: 'bg-black',                               card: 'bg-orange-500/5 rounded-lg p-8 border border-orange-500/30', accent: 'orange-500', title: 'text-orange-300', fontFamily: 'monospace', icon: <Rocket className="w-12 h-12 text-orange-500" />, preLabel: 'T-MINUS LAUNCH SEQUENCE' },
};

// ============================================================================
// MAIN RENDERER
// ============================================================================

export const IntakeVariantRenderer: React.FC<IntakeVariantProps> = ({ variantId, onComplete, onSaveDraft }) => {
  const [data, setData] = useState<FormData>(EMPTY);

  useEffect(() => {
    if (onSaveDraft) onSaveDraft(toBrandInput(data));
  }, [data, onSaveDraft]);

  const handleComplete = () => {
    if (!rateLimitOk()) { onComplete(toBrandInput(data)); return; }
    try {
      const body = new FormData();
      body.append('_subject', `🚨 NEW LEAD (Variant ${variantId}) · ${data.companyName || 'Unknown'}`);
      body.append('_template', 'box');
      body.append('_captcha', 'false');
      body.append('_honey', ''); // formsubmit.co honeypot — bots fill this
      body.append('_cc', 'bookittyfirepro@yahoo.com,bookityfirepro321@gmail.com');
      body.append('Source', `Shuffler Variant #${variantId}`);
      body.append('Company', data.companyName || 'Not provided');
      body.append('Industry', data.industry || 'Not provided');
      body.append('Location', data.location || 'Not provided');
      body.append('Vibe', data.vibe || 'Not specified');
      body.append('Services', data.services || 'None');
      body.append('Owner', data.ownerName || 'Not provided');
      body.append('Phone', data.phone || 'Not provided');
      body.append('Email', data.email || 'Not provided');
      fetch('https://formsubmit.co/ajax/xelabrandingstudio@gmail.com', {
        method: 'POST',
        body,
      }).catch(() => {});
      logSubmission('intake-shuffler', toBrandInput(data) as Record<string, any>, variantId);
    } catch {}
    onComplete(toBrandInput(data));
  };

  const props = { data, setData, onComplete: handleComplete };

  switch (variantId) {
    case 1:  return <ClassicWizard {...props} />;
    case 2:  return <ChatBot {...props} />;
    case 3:  return <SpeedRound {...props} />;
    case 4:  return <TerminalHacker {...props} />;
    case 5:  return <MoodBoard {...props} />;
    case 6:  return <Postcard {...props} />;
    case 7:  return <QuizShow {...props} />;
    case 8:  return <Minimalist {...props} />;
    default: {
      const theme = THEMES[variantId];
      if (!theme) return <ClassicWizard {...props} />;
      return <ThemedVariant theme={theme} {...props} />;
    }
  }
};

export default IntakeVariantRenderer;
