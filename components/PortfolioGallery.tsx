import React, { useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import './portfolio.css';
export const portfolioSections = ['Logos','Business Cards','Flyers','Door Hangers','Shirts & Apparel','Merchandise','Stickers & Decals','BMX Decal Sets','Motorcycle Decal Sets'] as const;
type Category = typeof portfolioSections[number];
type Project = {name:string;category:Category;image:string};
export const portfolioProjects:Project[] = [
 {name:'AleXelA — gold sacred geometry identity',category:'Logos',image:'/portfolio/alexela-sacred-gold-logo.webp'},
 {name:'AleXelA — white-background identity',category:'Logos',image:'/portfolio/alexela-white-logo.webp'},
 {name:'AleXelA — dark sacred geometry identity',category:'Logos',image:'/portfolio/alexela-sacred-dark-logo.webp'},
 {name:'AleXelA — horizontal identity',category:'Logos',image:'/portfolio/alexela-horizontal-logo.webp'},
 {name:'DNA Remodels — emblem',category:'Logos',image:'/portfolio/dna-remodels-emblem.webp'},
 {name:'DNA Remodels — logo concept',category:'Logos',image:'/portfolio/dna-remodels-logo-concept.webp'},
 {name:'AleXelA — printed shirt',category:'Shirts & Apparel',image:'/portfolio/alexela-printed-shirt.webp'},
 {name:'AleXelA — studio promotional flyer',category:'Flyers',image:'/portfolio/alexela-studio-promotional-flyer.webp'},
 {name:'AleXelA — services business card',category:'Business Cards',image:'/portfolio/alexela-business-card-services.webp'},
 ...[['Cracked to Classy','cracked-to-classy-logo'],['Rod’s E-Bike Repair','rods-ebike-logo'],['Big Boy Toys','bigboytoys-logo'],['Cristina’s Cleaning','cristinas-cleaning-logo'],['S.L.U.G.S.','slugs-logo']].map(([name,file])=>({name,category:'Logos' as const,image:'/portfolio/'+file+'.png'})),
 ...[['Danbo Guitar Tech','01'],['Above All Tree Service','20'],['BMXela Bike Sales','29']].map(([name,file])=>({name,category:'Logos' as const,image:'/gallery/work-'+file+'.jpg'})),
 ...[['Coquina Ridge','27'],['Rod’s E-Bike Repair card','30']].map(([name,file])=>({name,category:'Business Cards' as const,image:'/gallery/work-'+file+'.jpg'})),
 ...[['Bounce House Rentals','06'],['Landscaping & Property Services','09'],['Lexi’s Landscaping','13'],['Cut to Classy / Cracked to Classy','16'],['Laci’s Fence & Deck Services','24'],['Laci’s Pressure Washing','25'],['Laci’s Property Services','26'],['Coquina Ridge Shoreline Services','28'],['Rod’s E-Bike Repair flyer','31']].map(([name,file])=>({name,category:'Flyers' as const,image:'/gallery/work-'+file+'.jpg'})),
 {name:'DNA Remodels',category:'Business Cards',image:'/portfolio/dna-remodels-business-card.webp'},
 {name:'Remodeling shirt design',category:'Shirts & Apparel',image:'/gallery/work-08.jpg'},
];
function Geometry(){return <svg className="portfolio-geometry" viewBox="0 0 400 400" fill="none" aria-hidden="true"><circle cx="200" cy="200" r="180"/>{[0,60,120,180,240,300].map(a=><circle key={a} cx="200" cy="120" r="80" transform={`rotate(${a} 200 200)`}/>)}<circle cx="200" cy="200" r="80"/><path d="M200 20 356 290H44ZM200 380 44 110H356Z"/></svg>}
export const PortfolioGallery:React.FC=()=>{
 const [filter,setFilter]=useState<Category|'All'>('All'),[active,setActive]=useState<Project|null>(null);
 const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLButtonElement|null>(null);
 const visibleProjects=portfolioProjects.filter(project=>filter==='All'||project.category===filter);
 const activeIndex=active?visibleProjects.findIndex(project=>project.image===active.image):-1;
 const move=(direction:number)=>{if(activeIndex>=0)setActive(visibleProjects[(activeIndex+direction+visibleProjects.length)%visibleProjects.length]);};
 const inquiry=(category:string,name?:string)=>'/intake.html?package=custom&product='+encodeURIComponent(category+(name?' — '+name:''));
 const close=()=>{dialog.current?.close();setActive(null);opener.current?.focus();};
 return <section id="portfolio-peek" className="alexela-portfolio" aria-labelledby="portfolio-title">
 <header className="portfolio-intro"><Geometry/><p className="portfolio-kicker">THE ALEXELA PORTFOLIO</p><h2 id="portfolio-title">Ideas made <em>visible.</em></h2><p>Explore the work by what you need. Open any image to see the full design.</p></header>
 <div className="portfolio-filters" role="group" aria-label="Filter portfolio">{(['All',...portfolioSections] as const).map(name=><button key={name} aria-pressed={filter===name} onClick={()=>setFilter(name)}>{name}</button>)}</div>
 <p aria-live="polite" className="portfolio-result-count">{filter==='All'?'All portfolio sections':filter}</p>
 {portfolioSections.filter(name=>filter==='All'||filter===name).map(name=>{const work=portfolioProjects.filter(p=>p.category===name);return <section className="portfolio-category" key={name} aria-label={name}><div className="portfolio-category-heading"><span aria-hidden="true">{String(portfolioSections.indexOf(name)+1).padStart(2,'0')}</span><h3>{name}</h3><small>{work.length} {work.length===1?'project':'projects'}</small></div>{work.length?<div className="portfolio-grid">{work.map(project=><button className="portfolio-piece" key={project.image} aria-label={`View ${project.name}`} onClick={e=>{opener.current=e.currentTarget;setActive(project);dialog.current?.showModal();}}><div className="portfolio-image"><img src={project.image.endsWith('.webp')?project.image.replace('.webp','-thumb.webp'):project.image} alt={project.name} loading="lazy" decoding="async"/><span><Plus size={20}/></span></div><div className="portfolio-caption"><h4>{project.name}</h4><ArrowUpRight size={18}/></div></button>)}</div>:<p className="portfolio-pending">Project photos are being added to this section. <a href={inquiry(name)}>Ask about {name.toLowerCase()} <ArrowUpRight size={14}/></a></p>}</section>})}
 <dialog ref={dialog} className="portfolio-lightbox" aria-label={active?.name||'Project artwork'} onCancel={()=>{setActive(null);opener.current?.focus();}} onClick={e=>{if(e.target===e.currentTarget)close();}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}}}><button className="portfolio-close" onClick={close} aria-label="Close project"><X/></button>{active&&<><img src={active.image} alt={`${active.name} full artwork`}/><p>{active.category}</p><h3>{active.name}</h3><div className="portfolio-viewer-actions"><button onClick={()=>move(-1)} disabled={visibleProjects.length<2} aria-label="Previous project"><ChevronLeft size={18}/>Previous</button><span aria-live="polite">{activeIndex+1} / {visibleProjects.length}</span><button onClick={()=>move(1)} disabled={visibleProjects.length<2} aria-label="Next project">Next<ChevronRight size={18}/></button><a href={inquiry(active.category,active.name)}>Request a similar project <ArrowUpRight size={16}/></a><a href={active.image} target="_blank" rel="noopener">Open full-resolution image <ArrowUpRight size={16}/></a></div></>}</dialog>
 </section>;
};
export default PortfolioGallery;
