
import React, { useState } from 'react';
import { BrandInput, LogoCandidate } from '../types';
import { generateLogoConcepts, editLogoImage } from '../services/geminiService';
import { Image as ImageIcon, Download, RefreshCw, Wand2, Info, Heart, ThumbsDown, ArrowRight, Sparkles, Layers, Plus, MessageSquare, Send, X } from 'lucide-react';

interface LogoGeneratorProps {
  brandInput: BrandInput;
  primaryColor: string;
  candidates: LogoCandidate[];
  onUpdateCandidates: React.Dispatch<React.SetStateAction<LogoCandidate[]>>;
}

const LOGO_STYLES = ['Minimalist', 'Emblem', 'Wordmark', 'Abstract', 'Geometric', 'Neoclassical'];

const STYLE_DESCRIPTIONS: Record<string, string> = {
  'Minimalist': 'Clean lines, simple shapes, less is more.',
  'Emblem': 'Badge or crest style, traditional and authoritative.',
  'Wordmark': 'Focus on unique typography and lettering.',
  'Abstract': 'Modern, artistic, and conceptual interpretations.',
  'Geometric': 'Symmetrical, mathematical, and grid-based shapes.',
  'Neoclassical': 'Elegant, balanced, inspired by classical architecture and art.'
};

const FONT_CHOICES = [
  { name: 'Modern Sans', value: 'Clean, modern sans-serif' },
  { name: 'Elegant Serif', value: 'Sophisticated, high-contrast serif' },
  { name: 'Bold Slab', value: 'Strong, impactful slab serif' },
  { name: 'Classic Script', value: 'Elegant, flowing script' },
  { name: 'Futuristic', value: 'Minimalist, tech-forward sans-serif' },
  { name: 'Vintage', value: 'Retro-inspired, decorative' }
];

const SIGNATURE_WORKS = [
  { title: "S.L.U.G.S.", url: "input_file_0.png" },
  { title: "Xela Elite", url: "input_file_1.png" },
  { title: "Tactical Red", url: "input_file_2.png" },
  { title: "Gold Standard", url: "input_file_3.png" },
  { title: "Reference Asset", url: "input_file_4.png" },
  { title: "Premium Vinyl", url: "input_file_5.png" },
  { title: "Precision Cut", url: "input_file_6.png" },
  { title: "Elite Branding", url: "input_file_7.png" },
  { title: "Market Leader", url: "input_file_8.png" },
  { title: "Creative Flow", url: "input_file_9.png" }
];

export const LogoGenerator: React.FC<LogoGeneratorProps> = ({ brandInput, primaryColor, candidates, onUpdateCandidates }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('Minimalist');
  const [selectedFont, setSelectedFont] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [iteration, setIteration] = useState(0);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditingLoading, setIsEditingLoading] = useState(false);

  const likedLogos = candidates.filter(c => c.status === 'liked');
  const currentSelection = likedLogos.length > 0 ? likedLogos[likedLogos.length - 1] : candidates[0];

  const handleGenerate = async (useReference = false, specificReferenceUrl?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let referenceImage: string | undefined = undefined;
      
      if (specificReferenceUrl) {
          referenceImage = specificReferenceUrl;
          // Just use a random ID or marker for UI tracking if iterating on specific image
          setReferenceId('specific-ref');
      } else if (useReference) {
        if (likedLogos.length > 0) {
           const lastLiked = likedLogos[likedLogos.length - 1];
           referenceImage = lastLiked.imageUrl;
           setReferenceId(lastLiked.id);
        }
      } else {
        setReferenceId(null);
      }
      
      // Generate 5 concepts in parallel for diversity
      const conceptPromises = Array(5).fill(null).map(() => 
        generateLogoConcepts(brandInput, selectedStyle, primaryColor, referenceImage, selectedFont)
      );
      
      const results = await Promise.all(conceptPromises);
      const allConcepts = results.flat();
      
      const newCandidates: LogoCandidate[] = allConcepts.map(concept => ({
        id: Math.random().toString(36).substr(2, 9),
        imageUrl: concept.imageUrl,
        description: concept.description,
        status: 'neutral'
      }));

      onUpdateCandidates(prev => [...newCandidates, ...prev]);
      setIteration(prev => prev + 1);

    } catch (err) {
      setError("Failed to generate logos. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editPrompt.trim()) return;

    setIsEditingLoading(true);
    const candidateToEdit = candidates.find(c => c.id === editingId);
    
    if (!candidateToEdit) {
        setIsEditingLoading(false);
        return;
    }

    try {
        const newImageUrl = await editLogoImage(candidateToEdit.imageUrl, editPrompt);
        
        const newCandidate: LogoCandidate = {
            id: Math.random().toString(36).substr(2, 9),
            imageUrl: newImageUrl,
            status: 'liked' // Automatically like the edited version to make it the new selection
        };

        // Replace the original card with the edited one, and deselect others to ensure this is primary
        onUpdateCandidates(prev => prev.map(c => {
             if (c.id === editingId) {
                 return newCandidate;
             }
             // Ensure only the new one is 'liked' if we want it to be the definite primary
             return c.status === 'liked' ? { ...c, status: 'neutral' } : c;
        }));
        
        setEditingId(null);
        setEditPrompt("");

    } catch (err) {
        setError("Failed to edit image. Try a different instruction.");
    } finally {
        setIsEditingLoading(false);
    }
  };

  const handleStatusChange = (id: string, status: 'liked' | 'disliked') => {
    onUpdateCandidates(prev => prev.map(c => 
      c.id === id 
        ? { ...c, status: c.status === status ? 'neutral' : status }
        : c
    ));
  };

  const handleDownload = (url: string, id: string) => {
    const safeCompanyName = brandInput.companyName.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'brand';
    const filename = `logo-${safeCompanyName}-${id}.png`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasLikes = candidates.some(c => c.status === 'liked');

  return (
    <div className="glass rounded-3xl shadow-lg border-white/50 overflow-hidden h-full flex flex-col group hover:shadow-xl transition-all duration-500">
      
      {/* Header */}
      <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-white/40">
        <div className="flex flex-col">
            <h3 className="font-bold text-forest-900 flex items-center gap-2">
            <div className="p-1.5 bg-forest-100 text-forest-600 rounded-lg">
                <ImageIcon size={18} />
            </div>
            Logo Concepts 
            </h3>
            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">Golden Ratio • Artistic • Memorable</p>
            {iteration > 0 && (
                 <div className="flex items-center gap-2 mt-1 ml-9">
                     {referenceId ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-100">
                             <Layers size={10} />
                             <span>Refining Selection</span>
                        </div>
                     ) : (
                        <span className="text-[10px] text-stone-400">Batch {iteration}</span>
                     )}
                 </div>
            )}
        </div>
        
        {candidates.length > 0 && !isLoading && (
          <div className="flex items-center gap-2">
            <select 
              value={selectedFont} 
              onChange={(e) => setSelectedFont(e.target.value)}
              className="text-[10px] bg-white border border-stone-200 rounded-lg text-stone-600 font-bold uppercase tracking-widest focus:ring-1 focus:ring-forest-300 py-1.5 pl-2 pr-7 cursor-pointer shadow-sm hover:border-forest-300 transition-colors"
            >
              <option value="">Auto Font</option>
              {FONT_CHOICES.map(f => <option key={f.name} value={f.value}>{f.name}</option>)}
            </select>
            <select 
              value={selectedStyle} 
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="text-xs bg-white border border-stone-200 rounded-lg text-stone-600 font-medium focus:ring-1 focus:ring-forest-300 py-1.5 pl-2 pr-7 cursor-pointer shadow-sm hover:border-forest-300 transition-colors"
            >
              {LOGO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button 
                onClick={() => handleGenerate(false)}
                className="p-1.5 bg-forest-100 text-forest-700 rounded-lg hover:bg-forest-200 transition-colors border border-forest-200 shadow-sm"
                title="Generate 3 new variations"
            >
                <Plus size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-white/60 min-h-[400px] relative scrollbar-thin">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>

        {candidates.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto z-10 py-12">
            <div className="w-20 h-20 mx-auto bg-white rounded-2xl rotate-3 flex items-center justify-center shadow-md border border-stone-100 group-hover:rotate-6 transition-transform duration-500">
              <ImageIcon className="text-stone-300 group-hover:text-forest-400 transition-colors" size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-stone-800 font-bold text-lg font-serif">Visualize Your Brand</p>
              <p className="text-sm text-stone-500">Select a style to generate multiple concepts.</p>
            </div>
                        <div className="flex flex-col items-center gap-4 my-4 w-full bg-white/50 p-4 rounded-xl border border-stone-100">
              <div className="flex flex-wrap justify-center gap-2">
                {LOGO_STYLES.map(style => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-1.5 text-xs rounded-full border font-medium transition-all duration-200 ${
                      selectedStyle === style 
                        ? 'bg-forest-800 text-white border-forest-800 shadow-md transform scale-105' 
                        : 'bg-transparent text-stone-500 border-stone-200 hover:border-forest-300 hover:text-forest-700'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {FONT_CHOICES.map(font => (
                  <button
                    key={font.name}
                    onClick={() => setSelectedFont(font.value)}
                    className={`px-3 py-1 text-[10px] rounded-full border font-bold uppercase tracking-widest transition-all duration-200 ${
                      selectedFont === font.value 
                        ? 'bg-stone-800 text-white border-stone-800 shadow-md' 
                        : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300 hover:text-stone-600'
                    }`}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
              <div className="text-xs text-stone-500 flex items-center gap-1.5">
                  <Info size={12} className="text-stone-400" />
                  <span>{STYLE_DESCRIPTIONS[selectedStyle]}</span>
              </div>
            </div>

            <button
              onClick={() => handleGenerate(false)}
              className="w-full py-3 bg-gradient-to-r from-forest-600 to-forest-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all hover:scale-[1.02] shadow-forest-200 flex items-center justify-center gap-2"
            >
              <Wand2 size={16} /> Generate 5 Diverse Concepts
            </button>

            {/* Signature Inspiration */}
            <div className="w-full pt-8 space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Sparkles size={14} className="text-brand-lavender" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Xela Signature Inspiration</h4>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {SIGNATURE_WORKS.map((work, idx) => (
                        <div 
                          key={idx} 
                          className="aspect-square rounded-lg overflow-hidden border border-stone-100 group/sig relative cursor-pointer"
                          onClick={() => handleGenerate(true, work.url)}
                          title={`Iterate based on ${work.title}`}
                        >
                            <img 
                              src={work.url} 
                              alt={work.title} 
                              className="w-full h-full object-cover group-hover/sig:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = brandInput.existingLogo || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=200';
                                (e.target as HTMLImageElement).className = "w-full h-full object-contain p-2 opacity-20";
                              }}
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover/sig:opacity-100 transition-opacity flex items-center justify-center">
                                <Wand2 size={12} className="text-white" />
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-[8px] text-stone-400 text-center uppercase tracking-widest italic">Click an example to use as a style reference</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
             {isLoading && (
                <div className="col-span-1 sm:col-span-2 bg-forest-50/50 border border-forest-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-pulse h-64 shadow-inner">
                    <div className="w-16 h-16 bg-forest-200 rounded-full flex items-center justify-center mb-4 relative">
                        <Wand2 className="text-forest-600 animate-spin-slow relative z-10" size={24} />
                    </div>
                    <p className="text-forest-800 font-bold text-sm">
                        {referenceId ? "Refining your selection..." : "Dreaming up new designs..."}
                    </p>
                    <p className="text-forest-500 text-xs mt-1">Generating unique variations powered by Gemini</p>
                </div>
             )}
             
             {isEditingLoading && (
                 <div className="col-span-1 sm:col-span-2 bg-white border border-forest-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-pulse h-64 shadow-lg ring-4 ring-forest-50">
                    <div className="w-12 h-12 bg-forest-100 rounded-lg flex items-center justify-center mb-4">
                        <MessageSquare className="text-forest-600 animate-bounce" size={20} />
                    </div>
                    <p className="text-forest-800 font-bold text-sm">Applying your edit...</p>
                    <p className="text-forest-500 text-xs mt-1">"{editPrompt}"</p>
                 </div>
             )}

              {candidates.map((candidate) => (
                <div 
                  key={candidate.id} 
                  className={`
                     group/card relative bg-white rounded-2xl border p-4 transition-all duration-500 hover:shadow-lg flex flex-col
                     ${candidate.status === 'liked' ? 'ring-2 ring-forest-500 border-forest-500 shadow-md scale-[1.02]' : 'border-stone-200 hover:border-forest-200'}
                     ${candidate.status === 'disliked' ? 'opacity-40 grayscale scale-95' : 'opacity-100'}
                  `}
                >
                   {editingId === candidate.id && (
                       <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center justify-center animate-fade-in-up">
                           <button 
                              onClick={() => setEditingId(null)} 
                              className="absolute top-2 right-2 p-1 text-stone-400 hover:text-stone-600"
                           >
                              <X size={16} />
                           </button>
                           <h4 className="font-bold text-forest-900 text-sm mb-3 flex items-center gap-2">
                               <Sparkles size={14} /> Conversational Edit
                           </h4>
                           <form onSubmit={handleEditSubmit} className="w-full">
                               <textarea
                                 value={editPrompt}
                                 onChange={(e) => setEditPrompt(e.target.value)}
                                 placeholder="E.g., 'Make it simpler' or 'Use a thinner line style'"
                                 className="w-full h-20 p-3 text-xs border border-stone-200 rounded-lg focus:ring-2 focus:ring-forest-300 focus:border-forest-300 outline-none resize-none mb-3 bg-stone-50"
                                 autoFocus
                               />
                               <button 
                                 type="submit" 
                                 disabled={!editPrompt.trim()}
                                 className="w-full py-2 bg-forest-800 text-white rounded-lg text-xs font-bold hover:bg-forest-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                               >
                                   Edit with Gemini <Send size={12} />
                               </button>
                           </form>
                       </div>
                   )}

                   <div className="relative aspect-square w-full flex items-center justify-center bg-stone-50 rounded-xl mb-3 overflow-hidden">
                      <img 
                        src={candidate.imageUrl} 
                        alt="Logo Concept" 
                        className="max-w-full max-h-full object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover/card:scale-105"
                      />
                      
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-2">
                         <button
                           onClick={() => setEditingId(candidate.id)}
                           className="p-2 bg-white text-stone-700 rounded-full hover:bg-forest-50 hover:text-forest-700 shadow-lg transition-colors"
                           title="Quick Edit"
                         >
                             <MessageSquare size={16} />
                         </button>
                         <button
                           onClick={() => handleGenerate(true, candidate.imageUrl)}
                           className="p-2 bg-white text-stone-700 rounded-full hover:bg-forest-50 hover:text-forest-700 shadow-lg transition-colors"
                           title="Iterate based on this design"
                         >
                             <Wand2 size={16} />
                         </button>
                         <button 
                           onClick={() => handleDownload(candidate.imageUrl, candidate.id)}
                           className="p-2 bg-white text-stone-700 rounded-full hover:bg-forest-50 hover:text-forest-700 shadow-lg transition-colors"
                           title="Download PNG"
                         >
                           <Download size={16} />
                         </button>
                      </div>
                   </div>

                   {candidate.description && (
                     <div className="mb-3 px-1">
                       <p className="text-[10px] text-stone-500 leading-relaxed line-clamp-3 group-hover/card:line-clamp-none transition-all">
                         {candidate.description}
                       </p>
                     </div>
                   )}

                   <div className="flex items-center justify-between px-1">
                       <div className="flex gap-1">
                         <button 
                             onClick={() => handleStatusChange(candidate.id, 'disliked')}
                             className={`p-2 rounded-lg transition-all ${
                                 candidate.status === 'disliked' 
                                 ? 'bg-red-100 text-red-600' 
                                 : 'text-stone-300 hover:bg-stone-100 hover:text-red-400'
                             }`}
                             title="Dislike"
                         >
                             <ThumbsDown size={16} />
                         </button>
                         <button 
                             onClick={() => handleStatusChange(candidate.id, 'liked')}
                             className={`p-2 rounded-lg transition-all ${
                                 candidate.status === 'liked' 
                                 ? 'bg-forest-100 text-forest-600' 
                                 : 'text-stone-300 hover:bg-stone-100 hover:text-forest-400'
                             }`}
                             title="Like"
                         >
                             <Heart size={16} fill={candidate.status === 'liked' ? "currentColor" : "none"} />
                         </button>
                       </div>

                       <button 
                         onClick={() => setEditingId(candidate.id)}
                         className="text-[10px] text-stone-400 hover:text-forest-600 font-black uppercase tracking-widest flex items-center gap-1 px-2 py-1 rounded-md hover:bg-forest-50 transition-colors"
                       >
                          <Sparkles size={10} /> Edit
                       </button>
                   </div>
                </div>
              ))}
              
              {/* Not happy section */}
              <div className="col-span-1 sm:col-span-2 mt-4 p-6 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-center space-y-3">
                  <p className="text-xs font-bold text-stone-500">Not happy with these concepts?</p>
                  <div className="flex flex-wrap justify-center gap-2">
                      <button 
                        onClick={() => handleGenerate(false)}
                        className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-100 transition-colors shadow-sm"
                      >
                          Generate New Batch
                      </button>
                      <button 
                        onClick={() => {
                            const nextStyle = LOGO_STYLES[(LOGO_STYLES.indexOf(selectedStyle) + 1) % LOGO_STYLES.length];
                            setSelectedStyle(nextStyle);
                            handleGenerate(false);
                        }}
                        className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-100 transition-colors shadow-sm"
                      >
                          Try Different Style
                      </button>
                  </div>
              </div>
          </div>
        )}

        {error && (
            <div className="absolute bottom-20 left-6 right-6 bg-red-50 text-red-600 text-xs p-3 rounded-lg text-center border border-red-100 shadow-sm z-20">
                {error}
            </div>
        )}
      </div>

      <div className="p-4 bg-white/80 backdrop-blur border-t border-stone-100 flex gap-3 z-20">
             <button 
                onClick={() => handleGenerate(false)}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl border border-stone-200 text-stone-600 text-sm font-bold hover:bg-stone-50 transition-colors disabled:opacity-50"
             >
                <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                    <span>Generate 5 New</span>
                </div>
             </button>
             
             <button 
                onClick={() => handleGenerate(true)}
                disabled={isLoading || !hasLikes}
                className={`flex-[2] py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    hasLikes ? 'bg-forest-800 hover:bg-forest-900' : 'bg-stone-300'
                }`}
             >
                <div className="flex items-center justify-center gap-2">
                    <Wand2 size={16} />
                    <span>Iterate Liked</span>
                    <ArrowRight size={16} className="opacity-60" />
                </div>
             </button>
          </div>
    </div>
  );
};
