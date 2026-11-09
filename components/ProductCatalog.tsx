import React from 'react';
import { Bike, CarFront, ShoppingBag } from 'lucide-react';
import catalog from '../public/pricing-catalog.json';

const groups = catalog.products.map((g,i)=>({...g,icon:[Bike,CarFront,ShoppingBag][i % 3]}));
export const ProductCatalog: React.FC = () => (
 <section aria-labelledby="decals-merch-title" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
  <div className="rounded-3xl border border-amber-300/25 bg-[#0b1a2a] p-5 sm:p-10 shadow-[0_0_55px_rgba(233,184,93,0.06)]">
   <p className="text-center uppercase tracking-[0.3em] text-cyan-300 text-xs">AleXelA Creative Studio • Custom Cut & Print</p>
   <h2 id="decals-merch-title" className="text-center text-3xl sm:text-5xl font-black text-white my-4">Decals, Stickers & <span className="text-amber-200">Custom Merch</span></h2>
   <p className="text-white/75 text-center max-w-3xl mx-auto mb-8">Clear starting prices for custom-made goods. Ready-to-cut vector art, precisely measured sticker sets and coordinating branded merchandise. All prices are USD.</p>
   <div className="grid gap-6 lg:grid-cols-3">{groups.map(g=><div key={g.title} className="rounded-2xl border border-cyan-300/35 bg-white/[0.06] p-5">
    <div className="flex items-center gap-2 mb-4"><g.icon className="text-cyan-300" size={24}/><h3 className="text-xl font-bold text-white">{g.title}</h3></div>
    <div className="space-y-3">{g.items.map(({name,price,description:detail})=><a href={'/intake.html?package=custom&product='+encodeURIComponent(name+' | Starting price '+price+' | '+detail)} aria-label={'Request '+name+' quote'} key={name} className="block border-b border-white/10 pb-3 hover:bg-white/5 rounded-md transition-colors">
      <div className="flex justify-between gap-3 text-sm font-semibold text-white"><span>{name}</span><span className="text-cyan-300 whitespace-nowrap">{price}</span></div>
      <p className="text-xs text-white/65 mt-1">{detail} <span className="text-cyan-300">Request →</span></p>
    </a>)}</div>
   </div>)}</div>
   <p className="text-sm text-white/80 mt-6 leading-relaxed"><strong className="text-amber-200">Design setup: $50</strong> for original custom artwork when needed; waived if supplied production-ready artwork requires no design. Standard products include basic placement and a digital proof. Existing package inclusions are never billed twice. Vinyl prices assume standard outdoor adhesive vinyl; they exclude installation, removal, specialty finishes, tax and shipping. Motorcycle sets are decorative and must not cover safety labels or regulated reflectors. Merch prices are proposed starting retail rates, subject to blank-stock and vendor confirmation; minimum quantities may apply to externally fulfilled items. Bulk orders (12+) are quoted by quantity and material.</p>
   <div className="mt-7 flex flex-wrap justify-center gap-3">
    <a href="sms:+13213759685?body=Hi%20Alex%2C%20I%27d%20like%20a%20quote%20for%20custom%20decals%20or%20merch." className="rounded-full border border-cyan-300 bg-cyan-400 px-6 py-3 font-bold text-black">Text Alex for a quote</a>
    <a href="mailto:xelabrandingstudio@gmail.com?subject=Custom%20Decals%20%26%20Merch%20Quote" className="rounded-full border border-amber-200/50 px-6 py-3 font-bold text-white">Email project details</a>
   </div>
  </div>
 </section>
);
export default ProductCatalog;
