
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Zap, Shield, Rocket, Star, Globe, ChevronRight, ShoppingCart, MessageCircle, FileText, Scissors, Printer, Phone, Sparkles, TrendingUp, Clock, ArrowRight, Mail, ExternalLink } from 'lucide-react';

interface PricingProps {
  onSelectPackage: (tier: 'budget' | 'premium' | 'elite') => void;
}

const P = [
  { id:'cardcut',tier:'budget' as const,price:'$75',name:'CardCut Calibrated',desc:'A pro business card design + free online profile, ready in hours',icon:Printer,
    f:['1 print-ready business card DESIGN file (300 DPI PDF, 3.5" × 2", CMYK — take to VistaPrint, Staples, Moo, or any local printer)','3 signature brand colors — exact hex codes + CMYK + Pantone values (1 primary, 1 accent, 1 neutral) — use forever on cards, signs, socials, trucks, invoices','2 licensed fonts — 1 bold headline + 1 body (Google Fonts, free for commercial use forever, no legal risk)','1 QR code (PNG + SVG) linking to your FREE 1-page XELA-hosted profile site (we build + host your own XELA-hosted profile page — no extra fee, ever)','Same-day digital delivery by email — you own the files, print 100 / 500 / 5,000 copies at any shop, forever']},
  { id:'promo',tier:'budget' as const,price:'$125',name:'Promotion Pal',desc:'Look like you\'ve been in business for years',icon:Star,
    f:['3 unique logo options (PNG + SVG + transparent) — you pick your favorite, we finalize it','1 slogan + 1 mission statement (under 15 words each, custom written)','Full color palette — 5 hex codes (primary, accent, neutral, light, dark) + 2 licensed fonts (headline + body)','FL business name check on Sunbiz.org — we confirm your name is legally available before you register']},
  { id:'sticker',tier:'budget' as const,price:'$175',name:'Sticker System',desc:'Put your name on everything',icon:Scissors,save:'Save $40',
    f:['2 custom vinyl sticker designs (die-cut, weatherproof, 3" size) — ready to print anywhere','1 business card design (same spec as CardCut — 3.5" × 2", 300 DPI, CMYK)','6 ready-to-use slogans (tested phrasing for social posts, trucks, signs)','All print files delivered: PDF + PNG + SVG + source files — yours forever']},
  { id:'sales',tier:'premium' as const,price:'$350',name:'Selling Sales Set',desc:'Start getting customers this week',icon:ShoppingCart,pop:true,save:'Save $175',
    f:['Everything in Sticker System (stickers, card, slogans, files)','1 written marketing plan PDF (4 pages — weekly action steps for 30 days)','1 flyer design (8.5" × 11", print-ready) + 5 ready-to-post ad copy blocks (for FB, Nextdoor, Google, flyers)','12 social media graphics (3 each for Facebook, Instagram, Nextdoor, Google Business)']},
  { id:'rebellion',tier:'premium' as const,price:'$500',name:'Registered Rebellion',desc:'Look legit, be legit — LLC + brand + plan',icon:Shield,save:'Save $250',
    f:['Everything in Selling Sales Set','1 Florida business launch roadmap PDF — step-by-step: LLC filing ($125), EIN (free), bank account, DBA, licenses, insurance','1 brand guidelines document (8 pages: logo usage, spacing, color codes, font rules, do\'s & don\'ts)','30-day content calendar (30 specific post ideas with captions + hashtags — you just post them)']},
  { id:'passion',tier:'premium' as const,price:'$650',name:'Premiere Passion Pal',desc:'Full digital presence — emails, ads, everything',icon:MessageCircle,save:'Save $350+',
    f:['Everything in Registered Rebellion','5 email templates (welcome, follow-up, special offer, thank-you, review request) — ready to paste into Gmail','9 ad copy blocks (3 each for Facebook, Nextdoor, Google) — headline + body + call-to-action, tested phrasing','1 brand story document (500 words — written like a real human, not AI fluff — goes on your About page)']},
  { id:'sovereign',tier:'elite' as const,price:'$850',name:'The Sovereignty Set',desc:'Look like a franchise on day one',icon:Globe,save:'Save $400+',
    f:['Everything in Premiere Passion Pal','1 Brand Bible (20-page master PDF — every color, font, logo variant, voice & tone rule, photo style)','1 Competitor Analysis (5 local competitors — their pricing, positioning, weak spots, how to beat them)','PHYSICAL printed package shipped: 250 business cards + 50 stickers + 25 flyers (real paper, delivered to your door)']},
  { id:'site',tier:'elite' as const,price:'$1,200',name:'Site Sales Solution',desc:'Customers find you and call you',icon:FileText,save:'Save $600+',
    f:['Everything in The Sovereignty Set','1 landing page designed + deployed (live URL in 24 hrs — mobile-friendly, contact form, QR lead capture)','1 neighborhood ad strategy (3 targeted audiences, $5–15/day budgets, exact copy for FB + Nextdoor + Google)','1 thirty-second video ad (vertical 9:16 + square 1:1 — ready for Reels, TikTok, FB, Stories)']},
  { id:'enterprise',tier:'elite' as const,price:'$1,500',name:'Entrepreneurship Enterprise',desc:'From pain to purpose — nothing left out',icon:Rocket,save:'Save $800+',
    f:['Everything in Site Sales Solution','Every digital + print asset XELA offers (50+ files: logos, cards, flyers, signs, menus, door hangers, social templates, email banners)','1 Full Competitive Campaign (10 competitors analyzed, 30-day paid ad run template, $300/mo recommended budget)','1 Startup Checklist PDF (40 items — LLC, EIN, bank, DBA, license, insurance, website, GBP, taxes, bookkeeping — every legal & operational box checked)']},
  { id:'ultimate',tier:'elite' as const,price:'$2,000',name:'Ultimate Premium Suite',desc:'THE I QUIT ACCELERATOR — everything, priority, lifetime',icon:Zap,save:'Save $1,200+',
    f:['Every digital deliverable XELA offers (100+ files — nothing held back)','PHYSICAL: 500 printed premium business cards + 100 die-cut stickers + 100 full-color flyers — shipped to your door (real print, not just files)','Landing page (live) + 30-sec video ad + full multi-channel ad strategy + 30-day done-for-you campaign','PRIORITY: 2-hour rush delivery on everything + LIFETIME access (come back anytime for updates, tweaks, new files — forever, no extra fee)']},
];

export const Pricing: React.FC<PricingProps> = ({ onSelectPackage }) => {
  const [hovered, setHovered] = useState<string|null>(null);

  const tiers = [
    { key:'budget' as const, label:'Get Started', sub:'Look professional from day one', range:'$75 – $175', pkgs: P.filter(p=>p.tier==='budget'),
      cls:'tier-section-budget bg-white/[0.03] border border-white/10', textCls:'text-white', priceCls:'text-brand-teal drop-shadow-[0_0_20px_rgba(0,224,198,0.35)]', accentCls:'text-brand-teal', btnCls:'bg-brand-teal text-brand-black hover:bg-white', featureAccent:'bg-brand-teal/15 text-brand-teal' },
    { key:'premium' as const, label:'Get Customers', sub:'The engine that gets you paid', range:'$350 – $650', pkgs: P.filter(p=>p.tier==='premium'),
      cls:'tier-section-premium bg-white/[0.04] border border-white/10 bg-gradient-to-br from-brand-lavender/[0.06] to-transparent', textCls:'text-white', priceCls:'text-brand-lavender drop-shadow-[0_0_20px_rgba(210,85,255,0.4)]', accentCls:'text-brand-lavender', btnCls:'bg-brand-lavender text-white hover:bg-white hover:text-brand-lavender', featureAccent:'bg-brand-lavender/15 text-brand-lavender' },
    { key:'elite' as const, label:'Get Everything', sub:'Full business launch — pain to purpose', range:'$850 – $2,000', pkgs: P.filter(p=>p.tier==='elite'),
      cls:'tier-section-elite', textCls:'text-white', priceCls:'gradient-text drop-shadow-[0_0_24px_rgba(210,85,255,0.5)]', accentCls:'text-brand-lavender', btnCls:'bg-brand-lavender text-white hover:bg-white hover:text-brand-lavender', featureAccent:'bg-brand-lavender/10 text-brand-lavender' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto py-28 px-4 sm:px-6 lg:px-8">

      {/* ════ HEADER ════ */}
      <motion.div initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.7}}
        className="text-center mb-16 space-y-8">
        <span className="section-label text-brand-teal inline-block px-5 py-2 rounded-full bg-brand-teal/5 border border-brand-teal/15">
          The "I Quit" Accelerator
        </span>
        <h2 className="text-4xl sm:text-6xl md:text-8xl tier-title text-white leading-[0.85]">
          From Pain<br/>
          <span className="gradient-text">to Purpose.</span>
        </h2>
        <p className="text-lg text-white/60 max-w-2xl mx-auto font-medium leading-relaxed">
          Get more calls. Look legit. Make money.<br className="hidden sm:block"/>
          Built for Florida service businesses — delivered today.
        </p>
        <p className="text-sm text-white/40 italic">"Whatever you do, work at it with all your heart, as working for the Lord." — Col 3:23</p>
      </motion.div>

      {/* ════ URGENCY ════ */}
      <motion.div initial={{opacity:0,scale:0.96}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}
        className="urgency-bar text-center mb-20 py-4 px-8 bg-brand-black rounded-2xl max-w-xl mx-auto shadow-2xl">
        <p className="text-white text-[13px] font-bold tracking-wide relative z-10">
          <Clock size={13} className="inline mr-2 -mt-0.5 text-brand-teal"/>
          Pricing locked for today. <span className="text-brand-teal">Goes up after this visit.</span>
        </p>
      </motion.div>

      {/* ════ TIER SECTIONS ════ */}
      {tiers.map((tier, tIdx) => (
        <motion.section key={tier.key} initial={{opacity:0,y:50}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-80px'}} transition={{duration:0.6,delay:tIdx*0.1}}
          className={`${tier.cls} rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 lg:p-12 mb-8 sm:mb-12 shadow-xl`}>

          {/* Tier Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className={`section-label ${tier.key === 'elite' ? 'text-brand-lavender' : tier.key === 'premium' ? 'text-brand-lavender' : 'text-brand-teal'} inline-block mb-3`}>
                {tier.key === 'premium' ? '★ Most Popular' : tier.key === 'elite' ? '◆ Best Value' : 'Start Here'}
              </span>
              <h3 className={`text-4xl lg:text-5xl tier-title ${tier.textCls} leading-none mb-2`}>{tier.label}</h3>
              <p className={`text-sm font-medium ${tier.key === 'elite' ? 'text-white/40' : 'text-white/60'}`}>{tier.sub}</p>
            </div>
            <div className={`text-right`}>
              <span className={`text-2xl font-display font-black tracking-tight ${tier.key === 'elite' ? 'text-white/50' : 'text-white/40'}`}>{tier.range}</span>
            </div>
          </div>

          {/* Package Grid */}
          <div className={`grid gap-6 ${tier.pkgs.length === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {tier.pkgs.map((pkg, i) => {
              const Icon = pkg.icon;
              const isE = tier.key === 'elite';
              const isH = hovered === pkg.id;
              const isPop = 'pop' in pkg && pkg.pop;

              return (
                <motion.div key={pkg.id}
                  initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.07}}
                  onMouseEnter={()=>setHovered(pkg.id)} onMouseLeave={()=>setHovered(null)}
                  className={`pricing-card rounded-2xl p-6 flex flex-col relative
                    ${isE
                      ? `bg-white/[0.04] border border-white/[0.08] ${isH ? 'border-brand-lavender/40 shadow-[0_20px_50px_-12px_rgba(210,85,255,0.2)]' : ''}`
                      : `bg-white/[0.05] border border-white/10 ${isH ? 'border-white/25 bg-white/[0.07] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)]' : 'shadow-lg'}`
                    }
                    ${isPop ? 'ring-2 ring-brand-lavender/40 ring-offset-4 ring-offset-transparent popular-glow' : ''}
                    transition-all duration-300 ${isH ? '-translate-y-1.5' : ''}
                  `}>

                  {isPop && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-lavender text-white section-label rounded-full shadow-lg whitespace-nowrap">
                      Most Popular
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300 ${isE ? 'bg-brand-lavender/15' : 'bg-white/[0.06] group-hover:bg-brand-teal/15'}`}>
                    <Icon size={20} className={isE ? 'text-brand-lavender' : 'text-brand-teal'}/>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className={`price-display text-4xl ${tier.priceCls}`}>{pkg.price}</span>
                    <span className={`text-xs font-semibold ml-1.5 ${isE ? 'text-white/50' : 'text-white/40'}`}>one-time</span>
                  </div>

                  {/* Name + Desc */}
                  <h4 className={`pkg-name text-[15px] mb-1.5 ${tier.textCls}`}>{pkg.name}</h4>
                  <p className={`text-[12px] leading-relaxed mb-6 ${isE ? 'text-white/50' : 'text-white/60'}`}>{pkg.desc}</p>

                  {/* Features */}
                  <ul className="space-y-3 flex-1 mb-6">
                    {pkg.f.map((feat, fi) => (
                      <li key={fi} className={`flex items-start gap-2.5 text-[12px] font-medium leading-snug ${isE ? 'text-white/75' : 'text-white/80'}`}>
                        <div className={`mt-0.5 p-0.5 rounded-full shrink-0 ${
                          fi === 0 && tier.key !== 'budget'
                            ? `${tier.featureAccent}`
                            : isE ? 'bg-white/[0.08] text-brand-lavender' : 'bg-white/[0.08] text-brand-teal'
                        }`}>
                          {fi === 0 && tier.key !== 'budget' ? <Zap size={11}/> : <Check size={11}/>}
                        </div>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {/* Savings */}
                  {'save' in pkg && pkg.save && (
                    <div className={`mb-5 py-2 px-3 rounded-xl text-[11px] font-black tracking-wide text-center shadow-md ${isE ? 'bg-brand-lavender text-white' : 'bg-brand-teal text-brand-black'}`}>
                      {pkg.save}
                    </div>
                  )}

                  {/* CTA */}
                  <button onClick={()=>onSelectPackage(tier.key)}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-[0.12em] text-[10px] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md ${tier.btnCls}`}>
                    Get Started <ArrowRight size={14}/>
                  </button>
                  <p className="text-center text-[10px] text-white/35 mt-2.5 font-medium flex items-center justify-center gap-1.5">
                    <Shield size={10} className="text-green-500/70" /> 100% money-back guarantee
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      ))}

      {/* ════ GOAL-BASED SELLING ════ */}
      <motion.section initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
        className="mb-8 sm:mb-16 py-8 sm:py-14 px-4 sm:px-8 lg:px-12 bg-white/[0.03] rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 shadow-xl">
        <div className="text-center mb-8 sm:mb-10">
          <span className="section-label text-brand-teal">Quick Match</span>
          <h3 className="text-3xl lg:text-4xl tier-title text-white mt-3">What's your #1 goal?</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto">
          {[
            {goal:'Get more calls',pkg:'Selling Sales Set',price:'$350',tier:'premium' as const,icon:Phone,color:'brand-teal'},
            {goal:'Look professional',pkg:'Promotion Pal',price:'$125',tier:'budget' as const,icon:Sparkles,color:'brand-lavender'},
            {goal:'Start my business',pkg:'Registered Rebellion',price:'$500',tier:'premium' as const,icon:Rocket,color:'brand-teal'},
            {goal:'Grow faster',pkg:'Site Sales Solution',price:'$1,200',tier:'elite' as const,icon:TrendingUp,color:'brand-lavender'},
          ].map((g,i)=>{
            const GI=g.icon;
            const goalColorMap: Record<string, { bg: string; bgHover: string; text: string }> = {
              'brand-teal': { bg: 'bg-brand-teal/10', bgHover: 'group-hover:bg-brand-teal/20', text: 'text-brand-teal' },
              'brand-lavender': { bg: 'bg-brand-lavender/10', bgHover: 'group-hover:bg-brand-lavender/20', text: 'text-brand-lavender' },
            };
            const gc = goalColorMap[g.color] ?? goalColorMap['brand-teal'];
            return (
              <button key={i} onClick={()=>onSelectPackage(g.tier)}
                aria-label={`${g.goal} — ${g.pkg} ${g.price}`}
                className="goal-card p-4 sm:p-6 rounded-2xl border border-white/10 bg-white/[0.04] text-left hover:border-brand-teal/40 hover:bg-white/[0.06] group transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${gc.bg} ${gc.bgHover} transition-colors`}>
                  <GI size={18} className={gc.text}/>
                </div>
                <p className="font-bold text-white text-sm mb-1">{g.goal}</p>
                <p className={`text-[11px] font-semibold ${gc.text}`}>→ {g.pkg} ({g.price})</p>
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* ════ FAST TRACK ════ */}
      <motion.section initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
        className="mb-8 sm:mb-16 py-8 sm:py-14 px-4 sm:px-8 lg:px-12 tier-section-elite rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)',backgroundSize:'24px 24px'}}/>
        <div className="relative z-10">
          <div className="text-center mb-10">
            <span className="section-label text-brand-teal">Add to Any Package</span>
            <h3 className="text-3xl lg:text-4xl tier-title text-white mt-3">Fast Track Add-Ons</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              {name:'Rush Delivery',sub:'2 hours',price:'$49',desc:'Get your brand today, not tomorrow',icon:Clock},
              {name:'Call Script',sub:'+ Voicemail',price:'$35',desc:'Know exactly what to say when the phone rings',icon:Phone},
              {name:'5-Star Reviews',sub:'Automated',price:'$45',desc:'More reviews = more calls. Set it and forget it.',icon:Star},
            ].map((a,i)=>(
              <div key={i} className="addon-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-brand-teal/10"><a.icon size={18} className="text-brand-teal"/></div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{a.name}</p>
                    <p className="text-[10px] text-white/50">{a.sub}</p>
                  </div>
                  <span className="price-display text-xl text-brand-teal">{a.price}</span>
                </div>
                <p className="text-[12px] text-white/60 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ════ MONTHLY ════ */}
      <motion.section initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
        className="mb-8 sm:mb-16 py-8 sm:py-14 px-4 sm:px-8 lg:px-12 bg-white/[0.03] rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 shadow-xl">
        <div className="text-center mb-8 sm:mb-10">
          <span className="section-label text-brand-lavender">Recurring Revenue</span>
          <h3 className="text-3xl lg:text-4xl tier-title text-white mt-3">Keep It Growing</h3>
          <p className="text-sm text-white/60 mt-2">Brand is built. Now keep the customers coming every month.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {[
            {name:'Social Media',price:'$150',desc:'3 posts/week, 2 platforms. We run your socials.',icon:MessageCircle},
            {name:'Google Business',price:'$99',desc:'Weekly posts, photos, review responses. Stay on top.',icon:Globe},
            {name:'FB + Nextdoor Ads',price:'$199',desc:'Targeted ads to your service area. We handle it all.',icon:TrendingUp},
          ].map((m,i)=>(
            <div key={i} className="monthly-card bg-white/[0.04] rounded-2xl p-6 border border-white/10 hover:border-brand-lavender/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-brand-teal/15"><m.icon size={18} className="text-brand-teal"/></div>
                <p className="font-bold text-white text-sm flex-1">{m.name}</p>
              </div>
              <div className="mb-3">
                <span className="price-display text-3xl text-white">{m.price}</span>
                <span className="text-sm font-semibold text-white/40">/mo</span>
              </div>
              <p className="text-[12px] text-white/60 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ════ TRUST ════ */}
      <motion.div initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} className="text-center pt-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 mb-8">
          {[
            {icon:Shield,label:'Secure Payments',sub:'Zelle · Cash App · Stripe · Cash'},
            {icon:MessageCircle,label:'Built for Florida',sub:'Service businesses · Contractors · Creators'},
            {icon:Clock,label:'Same-Day Delivery',sub:'Walk in with an idea, leave with a brand'},
          ].map((t,i)=>(
            <div key={i} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/[0.05] shadow-md border border-white/10 flex items-center justify-center text-brand-teal"><t.icon size={20}/></div>
              <div className="text-left">
                <p className="section-label text-white/50 mb-0.5">{t.label}</p>
                <p className="text-xs font-bold text-white/80">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6 mt-6">
          <a href="tel:3213759685" className="flex items-center gap-1.5 text-brand-teal hover:text-white transition-colors text-xs font-bold">
            <Phone size={12} /> (321) 375-9685
          </a>
          <span className="hidden sm:inline text-white/10">|</span>
          <a href="mailto:xelabrandingstudio@gmail.com" className="flex items-center gap-1.5 text-brand-lavender hover:text-white transition-colors text-xs font-bold">
            <Mail size={12} /> xelabrandingstudio@gmail.com
          </a>
          <span className="hidden sm:inline text-white/10">|</span>
          <a href="https://www.google.com/search?q=XELA+Creative+Branding+Studio+Cocoa+FL" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-xs font-bold">
            <Globe size={12} /> Find Us on Google <ExternalLink size={10} className="text-white/30" />
          </a>
        </div>
        <p className="text-xs text-white/40 italic">"For I know the plans I have for you," declares the Lord. — Jeremiah 29:11</p>
      </motion.div>
    </div>
  );
};
