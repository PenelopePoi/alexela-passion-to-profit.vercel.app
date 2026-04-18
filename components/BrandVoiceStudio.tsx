import React, { useState, useCallback, useRef } from 'react';
import { BrandInput, BrandStrategy } from '../types';
import {
  Mic, Play, Pause, Download, Volume2, Loader2, Music, Radio, Podcast,
  RefreshCw, Headphones, Library, Zap, FileAudio, Sparkles, ListMusic,
  Clock, Wand2, Package, BookOpen, MessageSquare, Users, FileText, Rss
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateBrandVoiceScripts, generateSpeechWithVoice, fastAIResponse } from '../services/geminiService';

/* ── Types ────────────────────────────────────────────────── */

type Tab = 'voice' | 'music' | 'kit' | 'podcast' | 'sfx';
type ScriptType = 'greeting' | 'adScript' | 'podcastIntro' | 'taglineRead' | 'ivrMenu' | 'voicemail';
type MusicGenre = 'Pop' | 'R&B' | 'Hip-Hop' | 'Electronic' | 'Jazz' | 'Acoustic' | 'Cinematic' | 'Lo-Fi' | 'Gospel' | 'Country';
type MusicMood = 'Upbeat' | 'Calm' | 'Powerful' | 'Playful' | 'Mysterious' | 'Inspirational' | 'Elegant';
type MusicDuration = '15s' | '30s' | '60s' | '90s';
type MusicPurpose = 'Audio Logo' | 'Jingle' | 'Hold Music' | 'Background Music' | 'Podcast Bed';

interface MusicConcept { id: string; title: string; prompt: string; genre: MusicGenre; mood: MusicMood; duration: MusicDuration; purpose: MusicPurpose }
interface PodcastPlan { title: string; description: string; segments: string[]; duration: string; introScript: string; outroScript: string; showNotes: string; guestQuestions: string[]; thumbnailConcept: string; rssTemplate: string }

interface SFXItem { name: string; category: string; description: string }

interface BrandVoiceStudioProps { input: BrandInput; strategy: BrandStrategy }

/* ── Constants ────────────────────────────────────────────── */

const VOICE_OPTIONS = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede', 'Leda', 'Orus', 'Vale'] as const;

const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: 'voice', label: 'AI Voice', icon: <Mic className="w-4 h-4" /> },
  { key: 'music', label: 'AI Music', icon: <Music className="w-4 h-4" /> },
  { key: 'kit', label: 'Audio Kit', icon: <Package className="w-4 h-4" /> },
  { key: 'podcast', label: 'Podcast', icon: <Podcast className="w-4 h-4" /> },
  { key: 'sfx', label: 'Sound FX', icon: <Zap className="w-4 h-4" /> },
];

const SCRIPT_TYPES: Array<{ key: ScriptType; label: string; icon: React.ReactNode; desc: string }> = [
  { key: 'greeting', label: 'Phone Greeting', icon: <Volume2 className="w-4 h-4" />, desc: '15s welcome message' },
  { key: 'adScript', label: 'Ad Voiceover', icon: <Radio className="w-4 h-4" />, desc: '30s radio/podcast ad' },
  { key: 'podcastIntro', label: 'Podcast Intro', icon: <Podcast className="w-4 h-4" />, desc: '15s show opener' },
  { key: 'taglineRead', label: 'Tagline Read', icon: <Music className="w-4 h-4" />, desc: '5s brand tagline' },
  { key: 'ivrMenu', label: 'IVR Menu', icon: <ListMusic className="w-4 h-4" />, desc: 'Phone menu system' },
  { key: 'voicemail', label: 'Voicemail', icon: <FileAudio className="w-4 h-4" />, desc: 'After-hours greeting' },
];

const GENRES: MusicGenre[] = ['Pop', 'R&B', 'Hip-Hop', 'Electronic', 'Jazz', 'Acoustic', 'Cinematic', 'Lo-Fi', 'Gospel', 'Country'];
const MOODS: MusicMood[] = ['Upbeat', 'Calm', 'Powerful', 'Playful', 'Mysterious', 'Inspirational', 'Elegant'];
const DURATIONS: MusicDuration[] = ['15s', '30s', '60s', '90s'];
const PURPOSES: MusicPurpose[] = ['Audio Logo', 'Jingle', 'Hold Music', 'Background Music', 'Podcast Bed'];

const SFX_LIBRARY: SFXItem[] = [
  { name: 'Ping', category: 'Notifications', description: 'Short bright ping for alerts' },
  { name: 'Chime', category: 'Notifications', description: 'Melodic two-tone chime' },
  { name: 'Alert', category: 'Notifications', description: 'Attention-grabbing alert tone' },
  { name: 'Success', category: 'Notifications', description: 'Positive confirmation sound' },
  { name: 'Error', category: 'Notifications', description: 'Gentle error notification' },
  { name: 'Swoosh', category: 'Transitions', description: 'Smooth left-to-right swoosh' },
  { name: 'Whoosh', category: 'Transitions', description: 'Fast air movement transition' },
  { name: 'Fade Rise', category: 'Transitions', description: 'Building tension riser' },
  { name: 'Drop', category: 'Transitions', description: 'Bass drop impact' },
  { name: 'Shimmer', category: 'Transitions', description: 'Sparkling shimmer fade' },
  { name: 'Click', category: 'UI', description: 'Tactile button click' },
  { name: 'Tap', category: 'UI', description: 'Soft touch feedback' },
  { name: 'Toggle', category: 'UI', description: 'Switch on/off sound' },
  { name: 'Slide', category: 'UI', description: 'Smooth slider movement' },
  { name: 'Popup', category: 'UI', description: 'Modal appear sound' },
  { name: 'Office', category: 'Ambient', description: 'Quiet office atmosphere' },
  { name: 'Nature', category: 'Ambient', description: 'Birds and gentle breeze' },
  { name: 'Cafe', category: 'Ambient', description: 'Coffee shop background chatter' },
  { name: 'City', category: 'Ambient', description: 'Urban street soundscape' },
  { name: 'Rain', category: 'Ambient', description: 'Soft rain on windows' },
  { name: 'Stinger', category: 'Transitions', description: 'Short dramatic hit' },
];

/* ── Waveform animation (CSS-only) ───────────────────────── */

const WaveformBars: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="flex items-end gap-[2px] h-5">
    {[0.6, 1, 0.4, 0.8, 0.5, 0.9, 0.3, 0.7].map((h, i) => (
      <div
        key={i}
        className={`w-[3px] rounded-full transition-all duration-300 ${active ? 'bg-brand-teal animate-pulse' : 'bg-stone-600'}`}
        style={{ height: active ? `${h * 20}px` : '4px', animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

/* ── Component ────────────────────────────────────────────── */

export const BrandVoiceStudio: React.FC<BrandVoiceStudioProps> = ({ input, strategy }) => {
  const [activeTab, setActiveTab] = useState<Tab>('voice');

  // Voice tab state
  const [voiceName, setVoiceName] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [customScript, setCustomScript] = useState('');
  const [scripts, setScripts] = useState<Record<string, string> | null>(null);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState<Record<string, boolean>>({});
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Music tab state
  const [genre, setGenre] = useState<MusicGenre>('Pop');
  const [mood, setMood] = useState<MusicMood>('Upbeat');
  const [duration, setDuration] = useState<MusicDuration>('30s');
  const [purpose, setPurpose] = useState<MusicPurpose>('Jingle');
  const [musicConcepts, setMusicConcepts] = useState<MusicConcept[]>([]);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);

  // Podcast tab state
  const [podcastTopic, setPodcastTopic] = useState('');
  const [podcastPlan, setPodcastPlan] = useState<PodcastPlan | null>(null);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);

  // SFX state
  const [sfxPrompts, setSfxPrompts] = useState<Record<string, string>>({});
  const [isGeneratingSfx, setIsGeneratingSfx] = useState<Record<string, boolean>>({});

  // Shared
  const [error, setError] = useState<string | null>(null);

  /* ── Voice handlers ──────────────────────────────────────── */

  const handleGenerateScripts = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const base = await generateBrandVoiceScripts(input, strategy, voiceName || input.companyName);
      const extraPrompt = `Generate 2 more voice scripts for ${input.companyName}. Brand voice: ${strategy.brandVoice}. Vibe: ${input.vibe}. Industry: ${input.industry}. Return JSON: {"ivrMenu": "IVR phone menu script with options 1-4", "voicemail": "After-hours voicemail greeting"}`;
      const extraRaw = await fastAIResponse(extraPrompt);
      let extra: Record<string, string> = {};
      try { extra = JSON.parse(extraRaw); } catch { extra = { ivrMenu: 'Press 1 for sales, 2 for support...', voicemail: `You\'ve reached ${input.companyName}...` }; }
      setScripts({ ...base, ...extra });
      setAudioUrls({});
    } catch {
      setError('Script generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [input, strategy, voiceName]);

  const handleSynthesize = useCallback(async (key: string, text: string) => {
    setIsSynthesizing(prev => ({ ...prev, [key]: true }));
    try {
      const data = await generateSpeechWithVoice(text, selectedVoice);
      setAudioUrls(prev => ({ ...prev, [key]: data }));
    } catch {
      setError('Voice synthesis failed.');
    } finally {
      setIsSynthesizing(prev => ({ ...prev, [key]: false }));
    }
  }, [selectedVoice]);

  const handleSynthesizeCustom = useCallback(async () => {
    if (!customScript.trim()) return;
    await handleSynthesize('custom', customScript);
  }, [customScript, handleSynthesize]);

  const handleBulkGenerate = useCallback(async () => {
    if (!scripts) return;
    const keys = Object.keys(scripts);
    for (const key of keys) {
      if (!audioUrls[key] && scripts[key]) {
        await handleSynthesize(key, scripts[key]);
      }
    }
  }, [scripts, audioUrls, handleSynthesize]);

  const handlePlayPause = useCallback((key: string) => {
    if (playingKey === key && audioRefs.current[key]) {
      audioRefs.current[key].pause();
      setPlayingKey(null);
      return;
    }
    if (playingKey && audioRefs.current[playingKey]) {
      audioRefs.current[playingKey].pause();
    }
    const audio = new Audio(`data:audio/wav;base64,${audioUrls[key]}`);
    audio.onended = () => setPlayingKey(null);
    audio.play();
    audioRefs.current[key] = audio;
    setPlayingKey(key);
  }, [playingKey, audioUrls]);

  const handleDownload = useCallback((key: string) => {
    const a = document.createElement('a');
    a.href = `data:audio/wav;base64,${audioUrls[key]}`;
    a.download = `${input.companyName.replace(/\s+/g, '-').toLowerCase()}-${key}.wav`;
    a.click();
  }, [audioUrls, input.companyName]);

  /* ── Music handlers ──────────────────────────────────────── */

  const handleGenerateMusic = useCallback(async (variations = 1) => {
    setIsGeneratingMusic(true);
    setError(null);
    try {
      const prompt = `Generate ${variations} music concept(s) for ${input.companyName} (${input.industry}, ${input.vibe} vibe).
Genre: ${genre}. Mood: ${mood}. Duration: ${duration}. Purpose: ${purpose}.
Brand voice: ${strategy.brandVoice}.
Return JSON array: [{"title":"concept name","prompt":"detailed Suno/Udio AI music prompt including genre, mood, instruments, tempo, structure, duration"}]`;
      const raw = await fastAIResponse(prompt);
      let parsed: Array<{ title: string; prompt: string }> = [];
      try { parsed = JSON.parse(raw); } catch { parsed = [{ title: `${input.companyName} ${purpose}`, prompt: raw }]; }
      const newConcepts: MusicConcept[] = parsed.map((c, i) => ({
        id: `${Date.now()}-${i}`, title: c.title, prompt: c.prompt, genre, mood, duration, purpose,
      }));
      setMusicConcepts(prev => [...newConcepts, ...prev]);
    } catch {
      setError('Music concept generation failed.');
    } finally {
      setIsGeneratingMusic(false);
    }
  }, [input, strategy, genre, mood, duration, purpose]);

  /* ── Podcast handlers ────────────────────────────────────── */

  const handleGeneratePodcast = useCallback(async () => {
    if (!podcastTopic.trim()) return;
    setIsGeneratingPodcast(true);
    setError(null);
    try {
      const prompt = `Create a complete podcast episode plan for ${input.companyName} (${input.industry}).
Topic: ${podcastTopic}. Brand voice: ${strategy.brandVoice}. Vibe: ${input.vibe}.
Return JSON: {"title":"episode title","description":"episode description","segments":["segment 1","segment 2","segment 3","segment 4"],"duration":"estimated duration","introScript":"15s podcast intro script","outroScript":"15s outro script","showNotes":"formatted show notes with timestamps","guestQuestions":["question 1","question 2","question 3","question 4","question 5"],"thumbnailConcept":"text description of episode thumbnail","rssTemplate":"RSS feed item XML template with placeholders"}`;
      const raw = await fastAIResponse(prompt);
      let parsed: PodcastPlan;
      try { parsed = JSON.parse(raw); } catch { parsed = { title: podcastTopic, description: '', segments: [], duration: '30 min', introScript: '', outroScript: '', showNotes: '', guestQuestions: [], thumbnailConcept: '', rssTemplate: '' }; }
      setPodcastPlan(parsed);
    } catch {
      setError('Podcast plan generation failed.');
    } finally {
      setIsGeneratingPodcast(false);
    }
  }, [podcastTopic, input, strategy]);

  /* ── SFX handlers ────────────────────────────────────────── */

  const handleGenerateSfxPrompt = useCallback(async (sfx: SFXItem) => {
    setIsGeneratingSfx(prev => ({ ...prev, [sfx.name]: true }));
    try {
      const prompt = `Create a custom sound effect prompt for ${input.companyName} (${input.industry}, ${input.vibe} vibe).
Sound: ${sfx.name} (${sfx.category}): ${sfx.description}.
Write a detailed audio generation prompt that matches the brand personality. Return only the prompt text, no JSON.`;
      const result = await fastAIResponse(prompt);
      setSfxPrompts(prev => ({ ...prev, [sfx.name]: result }));
    } catch {
      setError('SFX prompt generation failed.');
    } finally {
      setIsGeneratingSfx(prev => ({ ...prev, [sfx.name]: false }));
    }
  }, [input]);

  /* ── Shared UI helpers ───────────────────────────────────── */

  const Pill: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${active ? 'bg-brand-teal text-white' : 'bg-white/10 text-stone-400 hover:bg-white/20'}`}>
      {children}
    </button>
  );

  const allVoiceAssets = Object.keys(audioUrls).filter(k => audioUrls[k]);
  const sfxCategories = [...new Set(SFX_LIBRARY.map(s => s.category))];

  /* ── Render ──────────────────────────────────────────────── */

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-black to-stone-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
        <Mic className="absolute top-6 right-6 w-40 h-40 text-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Headphones className="w-6 h-6 text-brand-teal" />
            <h2 className="text-3xl font-black tracking-widest uppercase">Audio Branding Studio</h2>
          </div>
          <p className="text-stone-400">Full sonic identity for {input.companyName}</p>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === t.key ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20' : 'bg-brand-black/80 text-stone-400 hover:text-white'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 text-red-300 rounded-2xl px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-bold">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 font-black text-xs uppercase tracking-widest">Dismiss</button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

          {/* ═══════ TAB 1: AI VOICE ═══════ */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              {/* Config Row */}
              <div className="bg-brand-black/60 backdrop-blur rounded-[2rem] p-8 border border-white/5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-black text-[10px] uppercase tracking-widest text-stone-400">Voice Persona</label>
                    <input type="text" value={voiceName} onChange={e => setVoiceName(e.target.value)} placeholder={input.companyName}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-brand-teal/40" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-black text-[10px] uppercase tracking-widest text-stone-400">AI Voice</label>
                    <div className="grid grid-cols-3 gap-2">
                      {VOICE_OPTIONS.map(v => (
                        <button key={v} onClick={() => setSelectedVoice(v)}
                          className={`py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${selectedVoice === v ? 'bg-brand-teal text-white' : 'bg-white/5 text-stone-400 hover:bg-white/10'}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Script */}
                <div className="space-y-2">
                  <label className="font-black text-[10px] uppercase tracking-widest text-stone-400">Custom Script (paste your own)</label>
                  <textarea value={customScript} onChange={e => setCustomScript(e.target.value)} rows={3} placeholder="Type or paste any text to synthesize..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 resize-none" />
                  {customScript.trim() && (
                    <button onClick={handleSynthesizeCustom} disabled={isSynthesizing['custom']}
                      className="px-6 py-3 bg-brand-lavender text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-teal transition-all flex items-center gap-2 disabled:opacity-40">
                      {isSynthesizing['custom'] ? <><Loader2 className="w-3 h-3 animate-spin" /> Synthesizing</> : <><Volume2 className="w-3 h-3" /> Synthesize Custom</>}
                    </button>
                  )}
                  {audioUrls['custom'] && (
                    <div className="flex items-center gap-3 mt-2">
                      <WaveformBars active={playingKey === 'custom'} />
                      <button onClick={() => handlePlayPause('custom')} className="px-4 py-2 bg-brand-teal text-white rounded-xl text-xs font-bold flex items-center gap-2">
                        {playingKey === 'custom' ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Play</>}
                      </button>
                      <button onClick={() => handleDownload('custom')} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 text-stone-300"><Download className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>

                {/* Generate + Bulk Buttons */}
                <div className="flex gap-3">
                  <button onClick={handleGenerateScripts} disabled={isGenerating}
                    className="flex-1 py-4 bg-brand-teal text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                    {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : scripts ? <><RefreshCw className="w-4 h-4" /> Regenerate</> : <><Sparkles className="w-4 h-4" /> Generate All Scripts</>}
                  </button>
                  {scripts && (
                    <button onClick={handleBulkGenerate}
                      className="px-6 py-4 bg-brand-lavender/80 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Bulk Synthesize
                    </button>
                  )}
                </div>
              </div>

              {/* Script Cards */}
              {scripts && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SCRIPT_TYPES.map((st, i) => (
                    <motion.div key={st.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="bg-brand-black/60 backdrop-blur rounded-2xl p-5 border border-white/5 hover:border-brand-teal/30 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="text-brand-teal">{st.icon}</div>
                          <span className="font-black text-sm text-white">{st.label}</span>
                        </div>
                        <span className="text-[10px] text-stone-500 uppercase">{st.desc}</span>
                      </div>
                      {scripts[st.key] && (
                        <div className="space-y-3">
                          <p className="text-xs text-stone-300 bg-white/5 rounded-xl p-3 leading-relaxed max-h-24 overflow-y-auto">{scripts[st.key]}</p>
                          {!audioUrls[st.key] ? (
                            <button onClick={() => handleSynthesize(st.key, scripts[st.key])} disabled={isSynthesizing[st.key]}
                              className="w-full py-3 bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-teal transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                              {isSynthesizing[st.key] ? <><Loader2 className="w-3 h-3 animate-spin" /> Synthesizing</> : <><Volume2 className="w-3 h-3" /> Synthesize</>}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <WaveformBars active={playingKey === st.key} />
                              <button onClick={() => handlePlayPause(st.key)}
                                className="flex-1 py-2.5 bg-brand-teal text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all flex items-center justify-center gap-2">
                                {playingKey === st.key ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Play</>}
                              </button>
                              <button onClick={() => handleDownload(st.key)} className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 text-stone-300"><Download className="w-4 h-4" /></button>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════ TAB 2: AI MUSIC ═══════ */}
          {activeTab === 'music' && (
            <div className="space-y-6">
              <div className="bg-brand-black/60 backdrop-blur rounded-[2rem] p-8 border border-white/5 space-y-6">
                {/* Genre */}
                <div className="space-y-2">
                  <label className="font-black text-[10px] uppercase tracking-widest text-stone-400">Genre</label>
                  <div className="flex flex-wrap gap-2">{GENRES.map(g => <Pill key={g} active={genre === g} onClick={() => setGenre(g)}>{g}</Pill>)}</div>
                </div>
                {/* Mood */}
                <div className="space-y-2">
                  <label className="font-black text-[10px] uppercase tracking-widest text-stone-400">Mood</label>
                  <div className="flex flex-wrap gap-2">{MOODS.map(m => <Pill key={m} active={mood === m} onClick={() => setMood(m)}>{m}</Pill>)}</div>
                </div>
                {/* Duration + Purpose */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-black text-[10px] uppercase tracking-widest text-stone-400">Duration</label>
                    <div className="flex flex-wrap gap-2">{DURATIONS.map(d => <Pill key={d} active={duration === d} onClick={() => setDuration(d)}>{d}</Pill>)}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-black text-[10px] uppercase tracking-widest text-stone-400">Purpose</label>
                    <div className="flex flex-wrap gap-2">{PURPOSES.map(p => <Pill key={p} active={purpose === p} onClick={() => setPurpose(p)}>{p}</Pill>)}</div>
                  </div>
                </div>
                {/* Buttons */}
                <div className="flex gap-3">
                  <button onClick={() => handleGenerateMusic(1)} disabled={isGeneratingMusic}
                    className="flex-1 py-4 bg-brand-teal text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                    {isGeneratingMusic ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Music className="w-4 h-4" /> Generate Concept</>}
                  </button>
                  <button onClick={() => handleGenerateMusic(3)} disabled={isGeneratingMusic}
                    className="px-6 py-4 bg-brand-lavender/80 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all flex items-center gap-2 disabled:opacity-40">
                    <RefreshCw className="w-4 h-4" /> 3 Variations
                  </button>
                </div>
              </div>

              {/* Music Concept Cards */}
              {musicConcepts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {musicConcepts.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                      className="bg-brand-black/60 backdrop-blur rounded-2xl p-5 border border-white/5 hover:border-brand-peach/30 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-black text-sm text-white">{c.title}</h4>
                        <div className="flex gap-1">
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal font-bold">{c.genre}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-lavender/20 text-brand-lavender font-bold">{c.mood}</span>
                        </div>
                      </div>
                      <p className="text-xs text-stone-300 bg-white/5 rounded-xl p-3 leading-relaxed mb-3">{c.prompt}</p>
                      <div className="flex items-center justify-between text-[10px] text-stone-500">
                        <span><Clock className="w-3 h-3 inline mr-1" />{c.duration}</span>
                        <span>{c.purpose}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════ TAB 3: AUDIO KIT ═══════ */}
          {activeTab === 'kit' && (
            <div className="space-y-6">
              {/* Voice Assets */}
              <div className="bg-brand-black/60 backdrop-blur rounded-[2rem] p-8 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Mic className="w-5 h-5 text-brand-teal" />
                  <h3 className="font-black text-lg text-white uppercase tracking-widest">Voice Assets</h3>
                  <span className="text-xs text-stone-500 ml-auto">{allVoiceAssets.length} generated</span>
                </div>
                {allVoiceAssets.length === 0 ? (
                  <p className="text-stone-500 text-sm">No voice assets yet. Generate scripts in the AI Voice tab.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {allVoiceAssets.map(k => (
                      <div key={k} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                        <WaveformBars active={playingKey === k} />
                        <span className="text-xs text-white font-bold flex-1 truncate">{k}</span>
                        <button onClick={() => handlePlayPause(k)} className="p-1.5 rounded-lg bg-brand-teal/20 text-brand-teal hover:bg-brand-teal hover:text-white transition-all">
                          {playingKey === k ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                        <button onClick={() => handleDownload(k)} className="p-1.5 rounded-lg bg-white/10 text-stone-400 hover:bg-white/20 transition-all"><Download className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Music Assets */}
              <div className="bg-brand-black/60 backdrop-blur rounded-[2rem] p-8 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Music className="w-5 h-5 text-brand-peach" />
                  <h3 className="font-black text-lg text-white uppercase tracking-widest">Music Concepts</h3>
                  <span className="text-xs text-stone-500 ml-auto">{musicConcepts.length} concepts</span>
                </div>
                {musicConcepts.length === 0 ? (
                  <p className="text-stone-500 text-sm">No music concepts yet. Create some in the AI Music tab.</p>
                ) : (
                  <div className="space-y-2">
                    {musicConcepts.slice(0, 6).map(c => (
                      <div key={c.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                        <Music className="w-4 h-4 text-brand-peach" />
                        <span className="text-xs text-white font-bold flex-1">{c.title}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal">{c.genre}</span>
                        <span className="text-[9px] text-stone-500">{c.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Brand Audio Style Guide */}
              <div className="bg-brand-black/60 backdrop-blur rounded-[2rem] p-8 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-brand-lavender" />
                  <h3 className="font-black text-lg text-white uppercase tracking-widest">Audio Style Guide</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/5 rounded-xl p-4 space-y-2">
                    <h4 className="font-black text-xs text-brand-teal uppercase tracking-widest">Tone & Energy</h4>
                    <p className="text-stone-300 text-xs leading-relaxed">Based on the {input.vibe} brand vibe, audio should feel {input.vibe.toLowerCase() === 'modern' ? 'clean, forward-thinking, and polished' : input.vibe.toLowerCase() === 'rustic' ? 'warm, organic, and authentic' : 'confident, clear, and professional'}. Voice talent should match {strategy.brandVoice?.toLowerCase() || 'the established'} tone.</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 space-y-2">
                    <h4 className="font-black text-xs text-brand-lavender uppercase tracking-widest">Instrument Palette</h4>
                    <p className="text-stone-300 text-xs leading-relaxed">Recommended: {input.vibe.toLowerCase() === 'modern' ? 'synth pads, clean guitar, subtle electronic drums' : input.vibe.toLowerCase() === 'rustic' ? 'acoustic guitar, piano, light percussion' : 'full band, balanced mix, clean tones'}. Avoid jarring or overly aggressive sounds.</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 space-y-2">
                    <h4 className="font-black text-xs text-brand-peach uppercase tracking-widest">Usage Guide</h4>
                    <ul className="text-stone-300 text-xs space-y-1">
                      <li>Audio Logo: website load, video intros, app startup</li>
                      <li>Jingle: social ads, radio spots, YouTube pre-roll</li>
                      <li>Hold Music: phone system, live chat queue</li>
                      <li>Voice Greetings: phone system, IVR, voicemail</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 space-y-2">
                    <h4 className="font-black text-xs text-stone-400 uppercase tracking-widest">Download Kit</h4>
                    <p className="text-stone-400 text-xs mb-2">{allVoiceAssets.length} voice files + {musicConcepts.length} music concepts ready</p>
                    <button disabled={allVoiceAssets.length === 0} onClick={() => allVoiceAssets.forEach(k => handleDownload(k))}
                      className="w-full py-2.5 bg-brand-teal text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all flex items-center justify-center gap-2 disabled:opacity-30">
                      <Download className="w-3 h-3" /> Download All Audio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ TAB 4: PODCAST ═══════ */}
          {activeTab === 'podcast' && (
            <div className="space-y-6">
              <div className="bg-brand-black/60 backdrop-blur rounded-[2rem] p-8 border border-white/5 space-y-4">
                <label className="font-black text-[10px] uppercase tracking-widest text-stone-400">Episode Topic</label>
                <input type="text" value={podcastTopic} onChange={e => setPodcastTopic(e.target.value)} placeholder={`e.g., "How ${input.companyName} approaches ${input.industry}"`}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-brand-teal/40" />
                <button onClick={handleGeneratePodcast} disabled={isGeneratingPodcast || !podcastTopic.trim()}
                  className="w-full py-4 bg-brand-teal text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                  {isGeneratingPodcast ? <><Loader2 className="w-4 h-4 animate-spin" /> Planning Episode...</> : <><Podcast className="w-4 h-4" /> Generate Episode Plan</>}
                </button>
              </div>

              {podcastPlan && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title & Description */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-brand-black/60 backdrop-blur rounded-2xl p-5 border border-white/5 md:col-span-2">
                    <h3 className="font-black text-lg text-white mb-2">{podcastPlan.title}</h3>
                    <p className="text-stone-300 text-sm mb-2">{podcastPlan.description}</p>
                    <span className="text-[10px] text-brand-teal font-bold"><Clock className="w-3 h-3 inline mr-1" />{podcastPlan.duration}</span>
                  </motion.div>
                  {/* Segments */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-brand-black/60 backdrop-blur rounded-2xl p-5 border border-white/5">
                    <h4 className="font-black text-xs text-brand-teal uppercase tracking-widest mb-3"><Library className="w-3 h-3 inline mr-1" />Segments</h4>
                    <ol className="space-y-2 text-xs text-stone-300 list-decimal list-inside">{podcastPlan.segments.map((s, i) => <li key={i}>{s}</li>)}</ol>
                  </motion.div>
                  {/* Intro/Outro */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-brand-black/60 backdrop-blur rounded-2xl p-5 border border-white/5 space-y-4">
                    <div>
                      <h4 className="font-black text-xs text-brand-teal uppercase tracking-widest mb-2">Intro Script</h4>
                      <p className="text-xs text-stone-300 bg-white/5 rounded-xl p-3">{podcastPlan.introScript}</p>
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-brand-lavender uppercase tracking-widest mb-2">Outro Script</h4>
                      <p className="text-xs text-stone-300 bg-white/5 rounded-xl p-3">{podcastPlan.outroScript}</p>
                    </div>
                  </motion.div>
                  {/* Guest Questions */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-brand-black/60 backdrop-blur rounded-2xl p-5 border border-white/5">
                    <h4 className="font-black text-xs text-brand-peach uppercase tracking-widest mb-3"><Users className="w-3 h-3 inline mr-1" />Guest Questions</h4>
                    <ol className="space-y-2 text-xs text-stone-300 list-decimal list-inside">{podcastPlan.guestQuestions.map((q, i) => <li key={i}>{q}</li>)}</ol>
                  </motion.div>
                  {/* Show Notes */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-brand-black/60 backdrop-blur rounded-2xl p-5 border border-white/5">
                    <h4 className="font-black text-xs text-stone-400 uppercase tracking-widest mb-3"><FileText className="w-3 h-3 inline mr-1" />Show Notes</h4>
                    <p className="text-xs text-stone-300 bg-white/5 rounded-xl p-3 whitespace-pre-wrap max-h-40 overflow-y-auto">{podcastPlan.showNotes}</p>
                  </motion.div>
                  {/* Thumbnail Concept */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-brand-black/60 backdrop-blur rounded-2xl p-5 border border-white/5">
                    <h4 className="font-black text-xs text-brand-lavender uppercase tracking-widest mb-3"><MessageSquare className="w-3 h-3 inline mr-1" />Thumbnail Concept</h4>
                    <p className="text-xs text-stone-300 bg-white/5 rounded-xl p-3">{podcastPlan.thumbnailConcept}</p>
                  </motion.div>
                  {/* RSS */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-brand-black/60 backdrop-blur rounded-2xl p-5 border border-white/5 md:col-span-2">
                    <h4 className="font-black text-xs text-stone-400 uppercase tracking-widest mb-3"><Rss className="w-3 h-3 inline mr-1" />RSS Template</h4>
                    <pre className="text-[10px] text-stone-400 bg-white/5 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap font-mono">{podcastPlan.rssTemplate}</pre>
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {/* ═══════ TAB 5: SOUND FX ═══════ */}
          {activeTab === 'sfx' && (
            <div className="space-y-6">
              {sfxCategories.map(cat => (
                <div key={cat} className="bg-brand-black/60 backdrop-blur rounded-[2rem] p-6 border border-white/5">
                  <h3 className="font-black text-sm text-white uppercase tracking-widest mb-4">
                    {cat === 'Notifications' && <Zap className="w-4 h-4 inline mr-2 text-brand-teal" />}
                    {cat === 'Transitions' && <RefreshCw className="w-4 h-4 inline mr-2 text-brand-peach" />}
                    {cat === 'UI' && <Wand2 className="w-4 h-4 inline mr-2 text-brand-lavender" />}
                    {cat === 'Ambient' && <Headphones className="w-4 h-4 inline mr-2 text-stone-400" />}
                    {cat}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SFX_LIBRARY.filter(s => s.category === cat).map((sfx, i) => (
                      <motion.div key={sfx.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-brand-teal/20 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-xs text-white">{sfx.name}</span>
                          <button onClick={() => handleGenerateSfxPrompt(sfx)} disabled={isGeneratingSfx[sfx.name]}
                            className="px-3 py-1 rounded-lg bg-brand-teal/20 text-brand-teal text-[9px] font-bold uppercase tracking-widest hover:bg-brand-teal hover:text-white transition-all disabled:opacity-40 flex items-center gap-1">
                            {isGeneratingSfx[sfx.name] ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Wand2 className="w-2.5 h-2.5" />}
                            Brand It
                          </button>
                        </div>
                        <p className="text-[10px] text-stone-500 mb-2">{sfx.description}</p>
                        {sfxPrompts[sfx.name] && (
                          <div className="bg-white/5 rounded-lg p-2.5 mt-2">
                            <p className="text-[10px] text-brand-teal font-bold uppercase tracking-widest mb-1">Custom Prompt</p>
                            <p className="text-[10px] text-stone-300 leading-relaxed">{sfxPrompts[sfx.name]}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
