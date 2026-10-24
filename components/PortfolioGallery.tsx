import React from 'react';
import { ArrowUpRight } from 'lucide-react';
const realProjects = [
 {name:'BMXela Custom BMX Decals',tag:'BMX • Vinyl',description:'Frame, fork, wheel and rider-badge sticker collections. ShowStopper, NightShift, Swag Styler and Off the Chain explorations.'},
 {name:'LiveWire / Danbo Motorcycle Graphics',tag:'Motorcycle • Vinyl',description:'Custom chrome-script-inspired lettering, lightning accents, skull variants and mirrored motorcycle-side decals.'},
 {name:'Tops Down Tree Service',tag:'Business Identity',description:'Branding, promotional flyer and business-card designs, work-shirt graphics, yard signs and marketing layouts.'},
 {name:'DNA Remodels',tag:'Contractor Branding',description:'Trade-themed logo featuring a DNA strand, hammer and paintbrush, with apparel and promotional design.'},
 {name:'Miscellaneous Maintenance',tag:'Service Branding',description:'Service-business flyer and apparel design concepts with coordinated contact and service information.'},
 {name:'AleXelA Creative Studio',tag:'Brand & Marketing',description:'Original brand identity, printed promotional designs, QR business cards and online presence.'}
];
export const PortfolioGallery: React.FC = () => <section className="py-12 px-4 max-w-7xl mx-auto">
 <p className="text-center text-cyan-300 uppercase tracking-[.25em] text-xs">Real creative projects</p>
 <h2 className="text-center text-3xl sm:text-5xl font-black text-white mt-2 mb-4">Work from the AleXelA Studio</h2>
 <p className="text-center text-white/65 max-w-2xl mx-auto mb-8">Named studio projects, not stock client case studies. Available project artwork is being curated for this gallery.</p>
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{realProjects.map(p=><article key={p.name} className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-[#171131] to-[#090914] p-6 shadow-[0_0_22px_rgba(0,225,235,.08)]">
 <p className="uppercase tracking-widest text-xs text-fuchsia-300">{p.tag}</p><h3 className="text-xl font-bold text-white mt-2">{p.name}</h3><p className="text-sm leading-relaxed text-white/75 mt-3">{p.description}</p>
 </article>)}</div>
 <p className="text-white/45 text-xs mt-6 text-center">Project descriptions identify work developed for these brands; they do not imply every concept was manufactured or delivered.</p>
 </section>;
export default PortfolioGallery;