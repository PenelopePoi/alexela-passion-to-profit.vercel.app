
import React, { useState } from 'react';
import { Scissors, Download, Eye, EyeOff, Info, CheckCircle2 } from 'lucide-react';

interface VinylStickerGeneratorProps {
  logoUrl?: string;
  companyName: string;
  primaryColor: string;
}

export const VinylStickerGenerator: React.FC<VinylStickerGeneratorProps> = ({ logoUrl, companyName, primaryColor }) => {
  const [showTransparency, setShowTransparency] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  const handleDownload = () => {
    if (!logoUrl) return;
    const link = document.createElement('a');
    link.href = logoUrl;
    link.download = `${companyName.replace(/\s+/g, '-').toLowerCase()}-sticker-vector.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass rounded-[3rem] p-10 shadow-xl border-white bg-white overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Scissors size={120} />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-lavender/10 text-brand-lavender rounded-full">
            <Scissors size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Cricut Ready</span>
          </div>
          
          <h3 className="text-3xl font-serif font-black text-brand-black leading-tight">
            Vinyl Sticker Studio
          </h3>
          
          <p className="text-stone-500 leading-relaxed">
            Prepare your logo for physical production. Our studio optimizes your design for precision cutting with the <span className="font-bold text-brand-black">Cricut Explorer 3</span> and other vinyl cutters.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-brand-teal">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-black">Transparent Background</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest">Optimized for Cricut Design Space</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-brand-lavender">
                <Info size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-black">Vector-Ready Contrast</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest">High-fidelity edge detection</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <button 
              onClick={() => setShowTransparency(!showTransparency)}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${showTransparency ? 'bg-brand-black text-white' : 'bg-stone-100 text-stone-600'}`}
            >
              {showTransparency ? <Eye size={16} /> : <EyeOff size={16} />}
              {showTransparency ? 'Hide Grid' : 'Show Grid'}
            </button>
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${highContrast ? 'bg-brand-teal text-white' : 'bg-stone-100 text-stone-600'}`}
            >
              {highContrast ? 'Original' : 'High Contrast'}
            </button>
            <button 
              onClick={handleDownload}
              className="px-8 py-3 bg-brand-lavender text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
            >
              <Download size={16} /> Download SVG/PNG
            </button>
          </div>
        </div>

        <div className="w-full lg:w-80 aspect-square relative rounded-[2rem] overflow-hidden border-4 border-stone-100 shadow-2xl">
          {/* Checkerboard Background */}
          {showTransparency && (
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'conic-gradient(#000 0.25turn, #fff 0.25turn 0.5turn, #000 0.5turn 0.75turn, #fff 0.75turn)', backgroundSize: '20px 20px' }}></div>
          )}
          {!showTransparency && <div className="absolute inset-0 bg-white"></div>}
          
          <div className="absolute inset-0 flex items-center justify-center p-12">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo for Sticker" 
                className={`max-w-full max-h-full object-contain transition-all duration-500 ${highContrast ? 'filter contrast-[2] grayscale brightness-75' : ''}`}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center space-y-2 opacity-20">
                <Scissors size={48} className="mx-auto" />
                <p className="text-xs font-bold uppercase tracking-widest">Logo Required</p>
              </div>
            )}
          </div>
          
          {/* Cut Line Overlay (Simulated) */}
          <div className="absolute inset-0 border-[12px] border-dashed border-brand-teal/20 rounded-[2rem] pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};
