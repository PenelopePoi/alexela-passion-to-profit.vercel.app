import React from 'react';
import { Bike, CarFront, ShoppingBag } from 'lucide-react';

const groups = [
 { title: 'BMX & Motorcycle Decal Sets', icon: Bike, items: [
  ['BMX name / number mini set','$25','2–4 pre-sized single-color decals'],
  ['BMX frame accent kit','$45','6–10 decals; one-color cut vinyl'],
  ['BMX complete custom kit','$85','Up to 16 frame, fork and badge decals; 2 colors'],
  ['BMX premium layered kit','$125','Up to 20 decals; up to 3 weedable colors'],
  ['Motorcycle tank / side accent set','$65','2 matched decals; single-color vinyl'],
  ['Motorcycle lettering / logo set','$95','Up to 6 decals; one or two colors'],
  ['Motorcycle custom multi-panel kit','$175','Up to 12 decals; 2-color vinyl'],
  ['Motorcycle premium layered kit','$275','Up to 18 decals; 3 colors; special layout']
 ] },
 { title: 'Vehicle Vinyl & Stickers', icon: CarFront, items: [
  ['Small window / body decal','$15','One single-color decal, up to 6 inches'],
  ['Medium vehicle decal','$30','One single-color decal, up to 12 inches'],
  ['Pair of door logo decals','$65','2 matched one-color logos, up to 12 inches'],
  ['Vehicle mini sticker pack','$35','5 small die-cut decals'],
  ['Vehicle 10-piece decal set','$65','10 single-color decals, up to 4 inches each'],
  ['Custom vehicle accent kit','$125','Up to 10 decals; 2 colors; no installation'],
  ['Reflective / chrome / specialty vinyl','+25%','Material surcharge, where available']
 ] },
 { title: 'Custom Merch & Promotional Products', icon: ShoppingBag, items: [
  ['Car-door magnets — pair 12×18 in','$79','Two full-color vehicle-rated magnets'],
  ['Car-door magnets — pair 12×24 in','$99','Two full-color vehicle-rated magnets'],
  ['Small fridge magnets — 10','$30','Same supplied artwork, standard size'],
  ['Ceramic mug 11 oz','$18','One custom printed mug'],
  ['Ceramic mug 15 oz','$23','One custom printed mug'],
  ['Sublimation coaster — single','$9','One printed standard coaster'],
  ['Coasters — set of 4','$30','Four coordinating printed coasters'],
  ['Canvas tote bag — one side','$22','One standard tote with print'],
  ['Canvas tote bag — two sides','$28','One standard tote with two prints'],
  ['Drawstring bag','$19','One standard printed drawstring bag'],
  ['Baseball / trucker cap','$28','One standard hat with transfer graphic'],
  ['Premium embroidered / patch hat','$38','One cap; simple front design'],
  ['Beanie with design','$26','One standard decorated beanie'],
  ['Keychains — 5','$25','Five printed standard keychains'],
  ['Water-bottle stickers — pack of 5','$20','Five laminated small stickers']
 ] }
];
export const ProductCatalog: React.FC = () => (
 <section aria-labelledby="decals-merch-title" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
  <div className="rounded-3xl border border-fuchsia-400/40 bg-[#0a071b] p-5 sm:p-10 shadow-[0_0_55px_rgba(194,44,247,0.17)]">
   <p className="text-center uppercase tracking-[0.3em] text-cyan-300 text-xs">AleXelA Creative Studio • Custom Cut & Print</p>
   <h2 id="decals-merch-title" className="text-center text-3xl sm:text-5xl font-black text-white my-4">Decals, Stickers & <span className="text-fuchsia-400">Custom Merch</span></h2>
   <p className="text-white/75 text-center max-w-3xl mx-auto mb-8">Clear starting prices for custom-made goods. Ready-to-cut vector art, precisely measured sticker sets and coordinating branded merchandise. All prices are USD.</p>
   <div className="grid gap-6 lg:grid-cols-3">{groups.map(g=><div key={g.title} className="rounded-2xl border border-cyan-300/35 bg-white/[0.06] p-5">
    <div className="flex items-center gap-2 mb-4"><g.icon className="text-cyan-300" size={24}/><h3 className="text-xl font-bold text-white">{g.title}</h3></div>
    <div className="space-y-3">{g.items.map(([name,price,detail])=><div key={name} className="border-b border-white/10 pb-3">
      <div className="flex justify-between gap-3 text-sm font-semibold text-white"><span>{name}</span><span className="text-cyan-300 whitespace-nowrap">{price}</span></div>
      <p className="text-xs text-white/65 mt-1">{detail}</p>
    </div>)}</div>
   </div>)}</div>
   <p className="text-sm text-white/80 mt-6 leading-relaxed"><strong className="text-fuchsia-300">Design setup: $50</strong> for original custom artwork when needed; waived if supplied production-ready artwork requires no design. Standard products include basic placement and a digital proof. Existing package inclusions are never billed twice. Vinyl prices assume standard outdoor adhesive vinyl; they exclude installation, removal, specialty finishes, tax and shipping. Motorcycle sets are decorative and must not cover safety labels or regulated reflectors. Merch prices are proposed starting retail rates, subject to blank-stock and vendor confirmation; minimum quantities may apply to externally fulfilled items. Bulk orders (12+) are quoted by quantity and material.</p>
   <div className="mt-7 flex flex-wrap justify-center gap-3">
    <a href="sms:+13213759685?body=Hi%20Alex%2C%20I%27d%20like%20a%20quote%20for%20custom%20decals%20or%20merch." className="rounded-full border border-cyan-300 bg-cyan-400 px-6 py-3 font-bold text-black">Text Alex for a quote</a>
    <a href="mailto:alexelas.studio@gmail.com?subject=Custom%20Decals%20%26%20Merch%20Quote" className="rounded-full border border-fuchsia-400 px-6 py-3 font-bold text-white">Email project details</a>
   </div>
  </div>
 </section>
);
export default ProductCatalog;
