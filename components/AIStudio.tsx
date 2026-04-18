
import React, { useState, useRef } from 'react';
import { Sparkles, Image as ImageIcon, Video, FileText, Loader2, Send, Download, Trash2, Maximize2, Wand2, Search, MapPin, Mic, Volume2 } from 'lucide-react';
import { generateImageNanoBananaPro, generateImageNanoBanana2, generateVideoVeo, analyzeMedia, transcribeAudio, generateSpeech, searchGrounding, mapsGrounding, searchWithUrlContext } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

export const AIStudio: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'image' | 'video' | 'analysis' | 'intelligence'>('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [urls, setUrls] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const url = await generateImageNanoBananaPro(prompt, imageSize, aspectRatio);
      setResult(url);
    } catch (error) {
      console.error("Image generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim() && !uploadedFile) return;
    setIsGenerating(true);
    try {
      const url = await generateVideoVeo(prompt, uploadedFile || undefined, aspectRatio as any);
      setResult(url);
    } catch (error) {
      console.error("Video generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !prompt.trim()) return;
    setIsGenerating(true);
    try {
      const mimeType = uploadedFile.split(';')[0].split(':')[1];
      const analysis = await analyzeMedia(prompt, uploadedFile, mimeType);
      setAnalysisResult(analysis);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranscribe = async () => {
    if (!uploadedFile) return;
    setIsTranscribing(true);
    try {
      const text = await transcribeAudio(uploadedFile);
      setPrompt(text);
    } catch (error) {
      console.error("Transcription failed", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTTS = async () => {
    if (!analysisResult && !prompt) return;
    setIsSpeaking(true);
    try {
      const audioBase64 = await generateSpeech(analysisResult || prompt);
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audio.play();
    } catch (error) {
      console.error("TTS failed", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSearch = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const text = await searchGrounding(prompt);
      setAnalysisResult(text);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUrlSearch = async () => {
    if (!prompt.trim() || !urls.trim()) return;
    setIsGenerating(true);
    try {
      const urlList = urls.split(',').map(u => u.trim()).filter(u => u.length > 0);
      const text = await searchWithUrlContext(prompt, urlList);
      setAnalysisResult(text);
    } catch (error) {
      console.error("URL Search failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-lavender rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-black text-brand-black tracking-tight uppercase">AI Creative Studio</h2>
            <p className="text-[10px] font-black tracking-widest text-stone-400 uppercase">Multimodal Generation & Intelligence</p>
          </div>
        </div>
        
        <div className="flex bg-white p-2 rounded-2xl shadow-md border border-stone-100">
          {[
            { id: 'image', icon: <ImageIcon size={18} />, label: 'Image' },
            { id: 'video', icon: <Video size={18} />, label: 'Video' },
            { id: 'analysis', icon: <FileText size={18} />, label: 'Analysis' },
            { id: 'intelligence', icon: <Search size={18} />, label: 'Intelligence' }
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTool === tool.id ? 'bg-brand-black text-white shadow-lg' : 'text-stone-400 hover:text-brand-black hover:bg-stone-50'}`}
            >
              {tool.icon}
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Input Controls */}
        <div className="lg:col-span-5 space-y-8">
          <div className="glass bg-white rounded-[3rem] p-10 shadow-xl border-white space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-lavender ml-2">Creative Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTool === 'image' ? "Describe the image you want to generate..." : activeTool === 'video' ? "Describe the video motion..." : "Ask a question or describe what to analyze..."}
                className="w-full h-40 p-6 bg-stone-50 border-2 border-stone-100 rounded-[2rem] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-lavender/10 focus:border-brand-lavender transition-all resize-none"
              />
            </div>

            {/* Tool Specific Options */}
            {activeTool === 'image' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Image Size</label>
                  <select 
                    value={imageSize} 
                    onChange={(e) => setImageSize(e.target.value as any)}
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl text-xs font-black uppercase tracking-widest"
                  >
                    <option value="1K">1K (Standard)</option>
                    <option value="2K">2K (High Def)</option>
                    <option value="4K">4K (Ultra HD)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Aspect Ratio</label>
                  <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl text-xs font-black uppercase tracking-widest"
                  >
                    <option value="1:1">1:1 (Square)</option>
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="4:3">4:3 (Classic)</option>
                    <option value="21:9">21:9 (Ultrawide)</option>
                  </select>
                </div>
              </div>
            )}

            {(activeTool === 'analysis' || activeTool === 'video') && (
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Upload Reference Media</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-stone-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-brand-lavender hover:bg-brand-lavender/5 transition-all group"
                >
                  {uploadedFile ? (
                    <div className="relative w-full h-full p-4">
                      {uploadedFile.startsWith('data:image') ? (
                        <img src={uploadedFile} alt="Uploaded media preview" className="w-full h-full object-contain rounded-xl" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center gap-3">
                          <FileText className="text-brand-lavender" />
                          <span className="text-xs font-black uppercase tracking-widest">Media Ready</span>
                        </div>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-all">
                        <ImageIcon className="text-stone-400 group-hover:text-brand-lavender" size={20} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Click to upload image/audio/video</p>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*,audio/*" />
                
                {uploadedFile && uploadedFile.startsWith('data:audio') && (
                  <button 
                    onClick={handleTranscribe}
                    disabled={isTranscribing}
                    className="w-full py-3 bg-brand-lavender/10 text-brand-lavender rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-lavender hover:text-white transition-all"
                  >
                    {isTranscribing ? <Loader2 className="animate-spin" size={14} /> : <Mic size={14} />}
                    Transcribe Audio to Prompt
                  </button>
                )}
              </div>
            )}

            {activeTool === 'intelligence' && (
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-teal ml-2">Reference URLs (comma separated)</label>
                <input 
                  type="text"
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  placeholder="https://example.com, https://another.com"
                  className="w-full px-6 py-4 bg-stone-50 rounded-2xl border border-stone-100 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 outline-none transition-all text-xs font-medium"
                />
                <button 
                  onClick={handleUrlSearch}
                  disabled={isGenerating || !urls.trim()}
                  className="w-full py-4 bg-brand-teal text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-black transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Search with URL Context
                </button>
              </div>
            )}

            <button
              onClick={activeTool === 'image' ? handleGenerateImage : activeTool === 'video' ? handleGenerateVideo : activeTool === 'analysis' ? handleAnalyze : handleSearch}
              disabled={isGenerating || (!prompt.trim() && !uploadedFile)}
              className="w-full py-6 bg-brand-black text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing Elite Request...
                </>
              ) : (
                <>
                  <Wand2 size={20} className="text-brand-teal" />
                  {activeTool === 'image' ? 'Generate Elite Image' : activeTool === 'video' ? 'Generate Elite Video' : activeTool === 'analysis' ? 'Analyze Media' : 'Search Intelligence'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Display */}
        <div className="lg:col-span-7 space-y-8">
          <div className="glass bg-brand-black rounded-[3rem] p-10 shadow-2xl border-stone-800 min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Output Terminal v3.1</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-brand-teal/20 rounded-full animate-ping"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="text-brand-teal animate-pulse" size={40} />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-white font-black uppercase tracking-widest text-xs">Synthesizing High-Conversion Assets</p>
                        <p className="text-stone-500 text-[10px] uppercase tracking-widest">Applying Florida Market Logic & Elite Standards</p>
                    </div>
                  </motion.div>
                ) : result ? (
                  <motion.div 
                    key="result"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full space-y-6"
                  >
                    <div className="relative group rounded-[2rem] overflow-hidden border-4 border-stone-800 shadow-2xl">
                      {activeTool === 'video' ? (
                        <video src={result} controls className="w-full aspect-video object-cover" />
                      ) : (
                        <img src={result} alt="AI-generated result" className="w-full object-contain max-h-[500px]" />
                      )}
                      <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                        <button className="p-4 bg-white text-brand-black rounded-2xl hover:scale-110 transition-all">
                          <Download size={24} />
                        </button>
                        <button className="p-4 bg-brand-teal text-white rounded-2xl hover:scale-110 transition-all">
                          <Maximize2 size={24} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => setResult(null)} className="px-8 py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                            Discard & Retry
                        </button>
                        <button className="px-8 py-3 bg-brand-teal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                            Save to Project
                        </button>
                    </div>
                  </motion.div>
                ) : analysisResult ? (
                  <motion.div 
                    key="analysis"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full space-y-6"
                  >
                    <div className="bg-stone-900/50 p-8 rounded-[2rem] border border-stone-800">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-brand-teal font-black uppercase tracking-widest text-xs">Intelligence Report</h4>
                            <button 
                                onClick={handleTTS}
                                disabled={isSpeaking}
                                className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                            >
                                {isSpeaking ? <Loader2 className="animate-spin" size={16} /> : <Volume2 size={16} />}
                            </button>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-stone-300 leading-relaxed font-medium">{analysisResult}</p>
                        </div>
                    </div>
                    <button onClick={() => setAnalysisResult(null)} className="w-full py-4 bg-white/5 text-stone-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        Clear Intelligence
                    </button>
                  </motion.div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-stone-900 rounded-3xl flex items-center justify-center mx-auto border border-stone-800">
                      <Sparkles className="text-stone-700" size={32} />
                    </div>
                    <p className="text-stone-600 font-black uppercase tracking-[0.3em] text-[10px]">Awaiting Elite Command</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
