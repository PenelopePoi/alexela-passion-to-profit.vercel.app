import React from 'react';
import { ColorPalette as ColorPaletteType } from '../types';
import { Palette, Copy, Check, Edit2 } from 'lucide-react';

interface ColorPaletteProps {
  palette: ColorPaletteType;
  onColorChange?: (key: keyof ColorPaletteType, value: string) => void;
}

const ColorSwatch: React.FC<{ 
    color: string; 
    label: string; 
    onEdit?: (val: string) => void 
}> = ({ color, label, onEdit }) => {
  const [copied, setCopied] = React.useState(false);
  const colorInputRef = React.useRef<HTMLInputElement>(null);
  const copyTimerRef = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color);
    setCopied(true);
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex flex-col gap-3">
      <div 
        className="h-32 w-full rounded-2xl shadow-sm hover:shadow-lg border border-black/5 transition-all duration-300 group-hover:-translate-y-1 relative overflow-hidden cursor-pointer ring-1 ring-black/5"
        style={{ backgroundColor: color }}
        onClick={() => colorInputRef.current?.click()}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[2px] gap-2">
            <button 
                onClick={copyToClipboard}
                className={`bg-white text-stone-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl transform scale-90 hover:scale-100 transition-all ${copied ? 'bg-brand-teal text-white' : ''}`}
            >
                {copied ? 'Copied!' : 'Copy Hex'}
            </button>
            <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-stone-700 shadow-sm pointer-events-none">
                <Edit2 size={10} /> Change
            </div>
        </div>
        <input 
            ref={colorInputRef}
            type="color" 
            value={color} 
            onChange={(e) => onEdit?.(e.target.value)}
            className="absolute -top-10 -left-10 opacity-0"
        />
        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-white/20 to-transparent skew-x-12 opacity-50"></div>
      </div>
      <div className="text-center">
         <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{label}</p>
         <input 
            type="text" 
            value={color}
            onChange={(e) => onEdit?.(e.target.value)}
            className="text-sm text-stone-800 font-mono font-medium bg-transparent border-none focus:ring-0 text-center w-full uppercase"
         />
      </div>
    </div>
  );
};

export const ColorPaletteDisplay: React.FC<ColorPaletteProps> = ({ palette, onColorChange }) => {
  return (
    <div className="glass rounded-3xl shadow-lg border-white/50 p-8 h-full flex flex-col">
      <div className="mb-8">
         <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-brand-teal/10 text-brand-teal rounded-lg">
                <Palette size={18} />
            </div>
            Color Palette
        </h3>
        <p className="text-xs text-stone-500 ml-9">Curated specifically for your brand vibe. Click a swatch to customize.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <ColorSwatch color={palette.primary} label="Primary" onEdit={(val) => onColorChange?.('primary', val)} />
        <ColorSwatch color={palette.secondary} label="Secondary" onEdit={(val) => onColorChange?.('secondary', val)} />
        <ColorSwatch color={palette.accent} label="Accent" onEdit={(val) => onColorChange?.('accent', val)} />
        <ColorSwatch color={palette.background} label="Neutral" onEdit={(val) => onColorChange?.('background', val)} />
      </div>

      <div className="bg-white/60 rounded-xl p-5 mt-auto border border-white shadow-sm">
        <p className="text-sm text-stone-700 italic leading-relaxed font-serif">
          "{palette.explanation}"
        </p>
      </div>
    </div>
  );
};
