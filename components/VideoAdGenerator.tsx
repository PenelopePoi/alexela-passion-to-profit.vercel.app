
import React, { useState, useEffect } from 'react';
import { BrandStrategy, BrandInput } from '../types';
import { Video, Sparkles, Play, Loader2, Download, Send, X, Film, Volume2, Share2, Zap, Music, Mic } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { generateSongLyrics, generateSpeech } from '../services/geminiService';

interface VideoAdGeneratorProps {
  data: BrandStrategy;
  input: BrandInput;
  primaryColor: string;
}

const AD_TYPES = [
  { id: 'bumper', label: '6s Bumper Ad', aspect: '16:9', resolution: '1080p' },
  { id: 'reel', label: '9s Social Reel', aspect: '9:16', resolution: '720p' },
  { id: 'cinematic', label: 'Cinematic Teaser', aspect: '16:9', resolution: '1080p' }
];

const AUDIO_GENRES = [
  "Upbeat Pop", "Cinematic Orchestral", "Acoustic Folk", "Modern Electronic", "Rock Anthem", "Lo-Fi Chill", "Corporate Professional"
];

const LOADING_MESSAGES = [
  "Drafting a high-conversion script...",
  "Directing cinematic angles...",
  "Applying brand color grading...",
  "Optimizing frame rates...",
  "Finalizing visual effects...",
];

export const VideoAdGenerator: React.FC<VideoAdGeneratorProps> = ({ data, input, primaryColor }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [adType, setAdType] = useState(AD_TYPES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [prompt, setPrompt] = useState(`Cinematic shot of ${input.industry} services for ${input.companyName}, ${input.vibe} style.`);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);

  // Audio State
  const [audioGenre, setAudioGenre] = useState(AUDIO_GENRES[0]);
  const [lyrics, setLyrics] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isGenerating) {
      interval = window.setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleEnhancePrompt = async () => {
    setIsEnhancingPrompt(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Create a detailed, cinematic visual prompt for a ${adType.label} video ad for ${input.companyName}, a ${input.industry} company. 
            Vibe: ${input.vibe}. 
            Colors: ${primaryColor}. 
            Services: ${input.services.join(', ')}. 
            Keep it under 40 words, focused on visual description for an AI video generator.`
        });
        if (response.text) setPrompt(response.text);
    } catch (e) {
        console.error(e);
    } finally {
        setIsEnhancingPrompt(false);
    }
  };

  const handleGenerateAd = async () => {
    setIsGenerating(true);
    setVideoUrl(null);
    
    try {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `${prompt}. Professional lighting, 4k, cinematic movement, commercial quality.`,
        config: {
          numberOfVideos: 1,
          resolution: adType.resolution as any,
          aspectRatio: adType.aspect as any
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (uri) {
        const res = await fetch(uri, {
          headers: {
            'x-goog-api-key': process.env.API_KEY || ''
          }
        });
        const blob = await res.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (e: any) {
      console.error("Ad generation failed", e);
      if (e?.message?.includes("Requested entity was not found")) {
          if ((window as any).aistudio) {
              await (window as any).aistudio.openSelectKey();
          }
      }
      alert("Failed to generate video ad. Please ensure you have a valid paid API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLyrics = async () => {
    setIsGeneratingLyrics(true);
    try {
        const result = await generateSongLyrics(input, audioGenre);
        if (result.lyrics) setLyrics(result.lyrics);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingLyrics(false);
    }
  };

  const handleSynthesizeAudio = async () => {
    if (!lyrics) return;
    setIsSynthesizing(true);
    try {
        const url = await generateSpeech(lyrics);
        if (url) setAudioUrl(url);
    } catch (e) {
        console.error(e);
    } finally {
        setIsSynthesizing(false);
    }
  };

  return (
    <div className="glass rounded-[3.5rem] shadow-2xl border-white overflow-hidden flex flex-col h-full animate-fade-in-up">
      <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-white/60">
        <div>
          <h3 className="font-black text-stone-900 flex items-center gap-4 text-xl tracking-tight">
            <div className="p-3 bg-stone-900 text-white rounded-2xl shadow-xl">
              {activeTab === 'video' ? <Film size={24} /> : <Music size={24} />}
            </div>
            AI {activeTab === 'video' ? 'Video Ad' : 'Jingle'} Generator
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-2 ml-14">
            Powered by Google {activeTab === 'video' ? 'Veo 3.1' : 'Gemini Audio'}
          </p>
        </div>
        <div className="flex gap-2 bg-stone-100 p-1 rounded-xl">
            <button 
                onClick={() => setActiveTab('video')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'video' ? 'bg-white text-brand-black shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
                Video
            </button>
            <button 
                onClick={() => setActiveTab('audio')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'audio' ? 'bg-white text-brand-black shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
                Audio
            </button>
        </div>
      </div>

      <div className="flex-1 bg-stone-50 p-8 flex flex-col items-center justify-center relative min-h-[500px]">
        {activeTab === 'video' ? (
            <>
                {/* Video Content */}
                <div className="absolute top-8 right-8 z-10 flex gap-2">
                    {AD_TYPES.map(type => (
                        <button 
                        key={type.id} 
                        onClick={() => setAdType(type)}
                        style={adType.id === type.id ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent ${adType.id === type.id ? 'text-white shadow-lg' : 'bg-stone-100 text-stone-400 hover:text-stone-600'}`}
                        >
                        {type.label}
                        </button>
                    ))}
                </div>

                {isGenerating ? (
                <div className="flex flex-col items-center gap-8 text-center animate-fade-in-up">
                    <div className="relative">
                    <div className="w-32 h-32 border-4 border-stone-200 rounded-full animate-spin" style={{ borderTopColor: primaryColor }}></div>
                    <Video className="absolute inset-0 m-auto animate-pulse" size={32} style={{ color: primaryColor }} />
                    </div>
                    <div className="space-y-2">
                    <h4 className="text-2xl font-serif font-black italic">{LOADING_MESSAGES[loadingMsgIdx]}</h4>
                    <p className="text-xs text-stone-400 uppercase tracking-[0.3em]">Processing frame-by-frame</p>
                    </div>
                </div>
                ) : videoUrl ? (
                <div className="w-full h-full flex flex-col gap-6 animate-fade-in-up pt-12">
                    <div className={`relative mx-auto shadow-2xl rounded-3xl overflow-hidden bg-black border-[12px] border-stone-900 ${adType.aspect === '9:16' ? 'max-w-[300px] aspect-[9/16]' : 'w-full aspect-video'}`}>
                    <video src={videoUrl} autoPlay loop controls className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-[8px] font-black text-white uppercase tracking-widest">
                        Preview Only
                    </div>
                    </div>
                    <div className="flex justify-center gap-4">
                    <button onClick={handleGenerateAd} className="px-8 py-4 bg-white text-stone-900 rounded-full font-black text-xs uppercase tracking-widest border border-stone-200 shadow-xl hover:bg-stone-50 transition-all flex items-center gap-2">
                        <Sparkles size={16} style={{ color: primaryColor }} /> Remaster Ad
                    </button>
                    <a href={videoUrl} download={`${input.companyName}_Ad.mp4`} className="px-10 py-4 bg-stone-900 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2">
                        <Download size={16} style={{ color: primaryColor }} /> Export HD
                    </a>
                    </div>
                </div>
                ) : (
                <div className="w-full max-w-md space-y-6 pt-12">
                    <div className="relative">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        style={{ borderColor: isEnhancingPrompt ? primaryColor : undefined }}
                        className="w-full p-6 rounded-[2rem] border-2 border-stone-200 bg-white focus:border-current outline-none text-sm font-medium min-h-[140px] resize-none shadow-inner leading-relaxed transition-colors"
                        placeholder="Describe your video ad..."
                    />
                    <button 
                        onClick={handleEnhancePrompt}
                        disabled={isEnhancingPrompt}
                        className="absolute bottom-4 right-4 px-3 py-1.5 bg-stone-100 hover:text-white rounded-lg transition-colors text-[10px] font-black uppercase tracking-wider flex items-center gap-2 group"
                    >
                        <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" style={{ backgroundColor: primaryColor }} />
                        <span className="relative z-10 flex items-center gap-2">
                            {isEnhancingPrompt ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                            Enhance Prompt
                        </span>
                    </button>
                    </div>

                    <button 
                    onClick={handleGenerateAd}
                    disabled={isGenerating || !prompt}
                    className="w-full py-5 bg-stone-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    Generate {adType.label} <Film size={18} style={{ color: primaryColor }} />
                    </button>
                    
                    <div className="flex items-center justify-center gap-6 text-stone-400">
                    <div className="flex items-center gap-2"><Zap size={14} /> <span className="text-[9px] font-black uppercase">No Editing Required</span></div>
                    <div className="flex items-center gap-2"><Volume2 size={14} /> <span className="text-[9px] font-black uppercase">Visual Ad Only</span></div>
                    </div>
                </div>
                )}
            </>
        ) : (
            <div className="w-full max-w-md space-y-8 animate-fade-in-up">
                {/* Audio Generation Tab */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Select Genre</label>
                    <div className="flex flex-wrap gap-2">
                        {AUDIO_GENRES.map(genre => (
                            <button
                                key={genre}
                                onClick={() => setAudioGenre(genre)}
                                style={audioGenre === genre ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${audioGenre === genre ? 'text-white' : 'bg-white border-stone-200 text-stone-400 hover:border-stone-300'}`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Lyrics / Script</label>
                        <button 
                            onClick={handleGenerateLyrics}
                            disabled={isGeneratingLyrics}
                            className="text-[10px] font-black uppercase tracking-widest text-brand-black hover:text-brand-lavender flex items-center gap-2 transition-colors"
                        >
                            {isGeneratingLyrics ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                            Write for me
                        </button>
                    </div>
                    <textarea 
                        value={lyrics}
                        onChange={(e) => setLyrics(e.target.value)}
                        className="w-full p-6 rounded-[2rem] border-2 border-stone-200 bg-white focus:border-brand-lavender outline-none text-sm font-medium min-h-[140px] resize-none shadow-inner leading-relaxed"
                        placeholder="Enter lyrics or generate them..."
                    />
                </div>

                {audioUrl && (
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-stone-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white">
                            <Music size={18} />
                        </div>
                        <audio src={audioUrl} controls className="flex-1" />
                    </div>
                )}

                <button 
                    onClick={handleSynthesizeAudio}
                    disabled={isSynthesizing || !lyrics}
                    className="w-full py-5 bg-stone-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSynthesizing ? (
                        <>Synthesizing <Loader2 size={18} className="animate-spin" /></>
                    ) : (
                        <>Generate Audio <Mic size={18} style={{ color: primaryColor }} /></>
                    )}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
