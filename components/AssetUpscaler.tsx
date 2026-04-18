
import React, { useState, useRef } from 'react';
import { BrandInput, BrandStrategy } from '../types';
import { generateImageNanoBananaPro } from '../services/geminiService';
import { Upload, Wand2, Download, Loader2, ZoomIn, Image as ImageIcon, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AssetUpscalerProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

type MockupScene = 'storefront' | 'business-card' | 'billboard' | 'phone' | 'merch' | 'social';

const MOCKUP_SCENES: { id: MockupScene; label: string; description: string }[] = [
  { id: 'storefront', label: 'Storefront', description: 'Your brand on a modern retail exterior' },
  { id: 'business-card', label: 'Business Card', description: 'Premium card on marble surface' },
  { id: 'billboard', label: 'Billboard', description: 'Downtown billboard advertisement' },
  { id: 'phone', label: 'Mobile App', description: 'iPhone screen with your branding' },
  { id: 'merch', label: 'Merchandise', description: 'T-shirt & hat with your logo' },
  { id: 'social', label: 'Social Profile', description: 'Instagram/TikTok profile mockup' },
];

export const AssetUpscaler: React.FC<AssetUpscalerProps> = ({ input, strategy }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [mockupImages, setMockupImages] = useState<Record<string, string>>({});
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [activeMockup, setActiveMockup] = useState<MockupScene | null>(null);
  const [isGeneratingMockup, setIsGeneratingMockup] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setUpscaledImage(null);
      setMockupImages({});
    };
    reader.readAsDataURL(file);
  };

  const handleUpscale = async () => {
    if (!uploadedImage) return;
    setIsUpscaling(true);
    try {
      const prompt = `Take this brand asset and recreate it as a high-resolution, professional, clean, crisp version. Maintain exact same design, colors, layout, and text. Make it look premium, publication-ready, and ultra-sharp. Brand: ${input.companyName}. Style: ${input.vibe}. Output at maximum quality.`;
      const result = await generateImageNanoBananaPro(prompt, '4K', '1:1');
      setUpscaledImage(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleGenerateMockup = async (scene: MockupScene) => {
    setIsGeneratingMockup(scene);
    setActiveMockup(scene);
    try {
      const scenePrompts: Record<MockupScene, string> = {
        'storefront': `Photorealistic modern storefront with glass windows and clean signage displaying the brand "${input.companyName}" in ${strategy.colorPalette.primary} and ${strategy.colorPalette.secondary} colors. ${input.vibe} aesthetic. Daytime, professional photography, 8K quality.`,
        'business-card': `Photorealistic premium business card mockup on white marble surface. Card shows "${input.companyName}" with colors ${strategy.colorPalette.primary} and ${strategy.colorPalette.accent}. ${strategy.typographyRecommendation.headingFont} font. Elegant lighting, depth of field, professional product photography.`,
        'billboard': `Photorealistic downtown billboard advertisement for "${input.companyName}". Bold ${input.vibe} design using ${strategy.colorPalette.primary} and ${strategy.colorPalette.accent} colors. City environment, dramatic perspective, golden hour lighting.`,
        'phone': `Photorealistic iPhone 16 Pro showing a mobile app screen branded for "${input.companyName}". Clean UI with ${strategy.colorPalette.primary} accent color. ${input.vibe} aesthetic. Floating in space with soft shadow, studio lighting.`,
        'merch': `Photorealistic merchandise mockup: black premium t-shirt and snapback hat with "${input.companyName}" branding in ${strategy.colorPalette.accent} color. ${input.vibe} style. Clean white background, studio product photography.`,
        'social': `Photorealistic social media profile page mockup for "${input.companyName}". Instagram style profile with ${strategy.colorPalette.primary} themed content grid. Bio reads: "${strategy.taglines[0] || input.vibe}". Professional, polished, high-engagement aesthetic.`,
      };

      const result = await generateImageNanoBananaPro(scenePrompts[scene], '2K', scene === 'phone' || scene === 'social' ? '9:16' : '16:9');
      setMockupImages(prev => ({ ...prev, [scene]: result }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingMockup(null);
    }
  };

  const handleDownload = (imageData: string, filename: string) => {
    const a = document.createElement('a');
    a.href = imageData;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-black text-brand-black">Asset Upscaler</h2>
          <p className="text-stone-500 mt-1">Upload low-res logos or brand materials — get HD/4K versions and real-world mockups.</p>
        </div>
        <div className="px-4 py-2 bg-brand-teal/10 text-brand-teal rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <Sparkles size={12} /> Powered by Gemini
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="relative border-2 border-dashed border-stone-300 hover:border-brand-teal rounded-[2rem] p-12 text-center cursor-pointer transition-all hover:bg-brand-teal/5 group"
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        {uploadedImage ? (
          <div className="flex items-center gap-8">
            <img src={uploadedImage} alt="Uploaded" className="w-32 h-32 object-contain rounded-2xl bg-stone-100 p-2" />
            <div className="text-left">
              <p className="font-black text-brand-black">{uploadedFileName}</p>
              <p className="text-stone-400 text-sm mt-1">Click to replace</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload size={40} className="mx-auto text-stone-300 group-hover:text-brand-teal transition-colors" />
            <p className="font-black text-[10px] uppercase tracking-widest text-stone-400">Drop your logo or brand asset here</p>
            <p className="text-stone-300 text-sm">PNG, JPG, SVG — any resolution</p>
          </div>
        )}
      </div>

      {/* Upscale Button */}
      {uploadedImage && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={handleUpscale}
            disabled={isUpscaling}
            className="w-full py-6 bg-brand-black text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-teal transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isUpscaling ? (
              <><Loader2 size={20} className="animate-spin" /> Upscaling to 4K...</>
            ) : (
              <><ZoomIn size={20} /> Upscale to 4K</>
            )}
          </button>
        </motion.div>
      )}

      {/* Before / After */}
      {upscaledImage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Before / After</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative group">
              <div className="absolute top-4 left-4 px-3 py-1 bg-stone-900/80 text-white text-[10px] font-black uppercase tracking-widest rounded-full z-10">Original</div>
              <img src={uploadedImage!} alt="Original" className="w-full aspect-square object-contain rounded-2xl bg-stone-100 p-4" />
            </div>
            <div className="relative group">
              <div className="absolute top-4 left-4 px-3 py-1 bg-brand-teal/90 text-white text-[10px] font-black uppercase tracking-widest rounded-full z-10">4K Upscaled</div>
              <img src={upscaledImage} alt="Upscaled" className="w-full aspect-square object-contain rounded-2xl bg-stone-100 p-4" />
              <button
                onClick={() => handleDownload(upscaledImage, `${input.companyName.toLowerCase().replace(/\s+/g, '-')}-4k.png`)}
                className="absolute bottom-4 right-4 p-3 bg-brand-black text-white rounded-xl hover:bg-brand-teal transition-all shadow-lg opacity-0 group-hover:opacity-100"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mockup Generator */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-serif font-black text-brand-black">Real-World Mockups</h3>
          <p className="text-stone-400 text-sm mt-1">See your brand in context — storefronts, cards, billboards, and more.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MOCKUP_SCENES.map(scene => (
            <button
              key={scene.id}
              onClick={() => handleGenerateMockup(scene.id)}
              disabled={isGeneratingMockup === scene.id}
              className={`relative p-6 rounded-2xl border-2 transition-all text-left group ${
                mockupImages[scene.id]
                  ? 'border-brand-teal bg-brand-teal/5'
                  : 'border-stone-200 hover:border-brand-teal hover:bg-brand-teal/5'
              }`}
            >
              {isGeneratingMockup === scene.id && (
                <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center z-10">
                  <Loader2 size={24} className="animate-spin text-brand-teal" />
                </div>
              )}
              <ImageIcon size={24} className={`mb-3 ${mockupImages[scene.id] ? 'text-brand-teal' : 'text-stone-300 group-hover:text-brand-teal'} transition-colors`} />
              <p className="font-black text-[10px] uppercase tracking-widest text-brand-black">{scene.label}</p>
              <p className="text-stone-400 text-[10px] mt-1">{scene.description}</p>
              {mockupImages[scene.id] && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-brand-teal rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mockup Preview */}
      <AnimatePresence mode="wait">
        {activeMockup && mockupImages[activeMockup] && (
          <motion.div
            key={activeMockup}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-[2rem] overflow-hidden shadow-2xl group"
          >
            <img
              src={mockupImages[activeMockup]}
              alt={`${activeMockup} mockup`}
              className="w-full rounded-[2rem]"
            />
            <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDownload(mockupImages[activeMockup], `${input.companyName.toLowerCase().replace(/\s+/g, '-')}-${activeMockup}-mockup.png`)}
                className="px-6 py-3 bg-brand-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-teal transition-all shadow-lg flex items-center gap-2"
              >
                <Download size={14} /> Download
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
