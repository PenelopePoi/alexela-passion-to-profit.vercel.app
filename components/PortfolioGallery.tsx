
import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, ZoomIn, Sparkles, Award } from 'lucide-react';

const portfolioItems = [
  {
    title: "S.L.U.G.S.",
    category: "Elite Identity",
    image: "input_file_0.png",
    description: "Soldiers Living Under Gods Supervision - High-impact tactical branding."
  },
  {
    title: "Coquina Ridge",
    category: "Full Marketing Suite",
    image: "input_file_1.png",
    description: "Shoreline solutions branding with high-conversion ad materials."
  },
  {
    title: "Cristina's Cleaning",
    category: "Brand Ecosystem",
    image: "input_file_2.png",
    description: "Clean, professional residential cleaning identity and marketing."
  },
  {
    title: "Gold Standard",
    category: "Audio Solutions",
    image: "input_file_3.png",
    description: "Premium audio installation and sales branding with a golden touch."
  },
  {
    title: "Car Candy",
    category: "Automotive Detailing",
    image: "input_file_4.png",
    description: "Retro-inspired high-gloss branding for elite car care."
  },
  {
    title: "DNA Remodels",
    category: "Construction",
    image: "input_file_5.png",
    description: "Modern, structural identity for high-end home remodeling."
  },
  {
    title: "Elite Estates",
    category: "Real Estate",
    image: "input_file_6.png",
    description: "Luxury property branding and high-conversion landing pages."
  },
  {
    title: "Coastal Cuisine",
    category: "Hospitality",
    image: "input_file_7.png",
    description: "Vibrant, appetizing identity for premium waterfront dining."
  },
  {
    title: "Precision Tech",
    category: "Technology",
    image: "input_file_8.png",
    description: "Sharp, innovative branding for cutting-edge software solutions."
  },
  {
    title: "Zen Wellness",
    category: "Health & Beauty",
    image: "input_file_9.png",
    description: "Calm, organic identity for high-end spa and wellness centers."
  }
];

export const PortfolioGallery: React.FC = () => {
  return (
    <div className="space-y-12 py-10">
      <div className="text-center space-y-4 max-w-3xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-lavender/10 text-brand-lavender rounded-full text-xs font-black uppercase tracking-widest border border-brand-lavender/20">
          <Award size={14} /> Elite Portfolio
        </div>
        <h2 className="text-4xl md:text-5xl font-serif font-black text-brand-black tracking-tight uppercase">
          The Xela <span className="text-brand-lavender italic">Legacy</span> Gallery
        </h2>
        <p className="text-stone-500 font-medium leading-relaxed">
          A curated showcase of high-conversion identities, marketing ecosystems, and elite brand engineering delivered to our Florida partners.
        </p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 px-6 max-w-7xl mx-auto space-y-8">
        {portfolioItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="break-inside-avoid group relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-stone-100 hover:shadow-2xl transition-all duration-500 mb-8"
          >
            <div className="relative overflow-hidden group">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('input_file_0.png')) {
                    target.src = 'input_file_0.png';
                  } else {
                    target.src = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <div className="flex gap-3 mb-4">
                  <button className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-brand-lavender transition-colors">
                    <ZoomIn size={20} />
                  </button>
                  <button className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-brand-teal transition-colors">
                    <ExternalLink size={20} />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="px-3 py-1 bg-brand-teal text-white rounded-full text-[8px] font-black uppercase tracking-widest w-fit">
                    {item.category}
                  </div>
                  <h3 className="text-xl font-serif font-black text-white uppercase tracking-tight">
                    {item.title}
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-3 bg-white">
              <p className="text-stone-500 text-xs font-medium leading-relaxed">
                {item.description}
              </p>
              <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-brand-lavender uppercase tracking-widest">Elite Case Study</span>
                <Sparkles size={14} className="text-brand-teal" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-brand-black rounded-[3rem] p-12 md:p-20 mx-6 max-w-7xl lg:mx-auto text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="relative z-10 space-y-8">
          <h3 className="text-3xl md:text-4xl font-serif font-black text-white uppercase tracking-tight">
            Ready to <span className="text-brand-teal italic">Launch</span> Your Legacy?
          </h3>
          <p className="text-stone-400 max-w-2xl mx-auto font-medium">
            Join the elite ranks of Florida entrepreneurs who have transformed their vision into a high-conversion market powerhouse.
          </p>
          <button className="px-10 py-5 bg-brand-teal text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white hover:text-brand-teal transition-all shadow-xl hover:scale-105 active:scale-95">
            Start Your Project Now
          </button>
        </div>
      </div>
    </div>
  );
};
