import React, { useRef, useState } from 'react';
import { ArrowUpRight, Plus, X } from 'lucide-react';
import './portfolio.css';
export const portfolioSections = ['Logos','Business Cards','Flyers','Door Hangers','Shirts & Apparel','Merchandise','Stickers & Decals','BMX Decal Sets','Motorcycle Decal Sets'] as const;
type Category = typeof portfolioSections[number];
type Project = {name:string;category:Category;image:string};
export const portfolioProjects:Project[] = [
 ...[['Cracked to Classy','cracked-to-classy-logo'],['Rod’s E-Bike Repair','rods-ebike-logo'],['Big Boy Toys','bigboytoys-logo'],['Cristina’s Cleaning','cristinas-cleaning-logo'],['S.L.U.G.S.','slugs-logo']].map(([name,file])=>({name,category:'Logos' as const,image:'/portfolio/'+file+'.png'})),
 ...[['Danbo Guitar Tech','01'],['Above All Tree Service','20'],['BMXela Bike Sales','29']].map(([name,file])=>({name,category:'Logos' as const,image:'/gallery/work-'+file+'.jpg'})),
 ...[['DNA Remodels','11'],['Coquina Ridge','27'],['Rod’s E-Bike Repair card','30']].map(([name,file])=>({name,category:'Business Cards' as const,image:'/gallery/work-'+file+'.jpg'})),
 ...[['Bounce House Rentals','06'],['Landscaping & Property Services','09'],['Lexi’s Landscaping','13'],['Cut to Classy / Cracked to Classy','16'],['Laci’s Fence & Deck Services','24'],['Laci’s Pressure Washing','25'],['Laci’s Property Services','26'],['Coquina Ridge Shoreline Services','28'],['Rod’s E-Bike Repair flyer','31']].map(([name,file])=>({name,category:'Flyers' as const,image:'/gallery/work-'+file+'.jpg'})),
 {name:'Remodeling shirt design',category:'Shirts & Apparel',image:'/gallery/work-08.jpg'},
];
function Geometry(){return <svg className="portfolio-geometry" viewBox="0 0 400 400" fill="none" aria-hidden="true"><circle cx="200" cy="200" r="180"/>{[0,60,120,180,240,300].map(a=><circle key={a} cx="200" cy="120" r="80" transform={`rotate(${a} 200 200)`}/>)}<circle cx="200" cy="200" r="80"/><path d="M200 20 356 290H44ZM200 380 44 110H356Z"/></svg>}
export const PortfolioGallery:React.FC=()=>{
 const [filter,setFilter]=useState<Category|'All'>('All'),[active,setActive]=useState<Project|null>(null);
 const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLButtonElement|null>(null);
 const close=()=>{dialog.current?.close();setActive(null);opener.current?.focus();};
 return <section id="portfolio-peek" className="alexela-portfolio" aria-labelledby="portfolio-title">
 <header className="portfolio-intro"><Geometry/><p className="portfolio-kicker">THE ALEXELA PORTFOLIO</p><h2 id="portfolio-title">Ideas made <em>visible.</em></h2><p>Explore the work by what you need. Open any image to see the full design.</p></header>
 <div className="portfolio-filters" role="group" aria-label="Filter portfolio">{(['All',...portfolioSections] as const).map(name=><button key={name} aria-pressed={filter===name} onClick={()=>setFilter(name)}>{name}</button>)}</div>
 <p aria-live="polite" className="portfolio-result-count">{filter==='All'?'All portfolio sections':filter}</p>
 {portfolioSections.filter(name=>filter==='All'||filter===name).map(name=>{const work=portfolioProjects.filter(p=>p.category===name);return <section className="portfolio-category" key={name} aria-label={name}><div className="portfolio-category-heading"><span aria-hidden="true">{String(portfolioSections.indexOf(name)+1).padStart(2,'0')}</span><h3>{name}</h3><small>{work.length} {work.length===1?'project':'projects'}</small></div>{work.length?<div className="portfolio-grid">{work.map(project=><button className="portfolio-piece" key={project.image} aria-label={`View ${project.name}`} onClick={e=>{opener.current=e.currentTarget;setActive(project);dialog.current?.showModal();}}><div className="portfolio-image"><img src={project.image} alt={project.name} loading="lazy" decoding="async"/><span><Plus size={20}/></span></div><div className="portfolio-caption"><h4>{project.name}</h4><ArrowUpRight size={18}/></div></button>)}</div>:<p className="portfolio-pending">Project photos are being added to this section. <a href="/intake.html">Ask about {name.toLowerCase()} <ArrowUpRight size={14}/></a></p>}</section>})}
 <dialog ref={dialog} className="portfolio-lightbox" aria-label={active?.name||'Project artwork'} onCancel={()=>{setActive(null);opener.current?.focus();}} onClick={e=>{if(e.target===e.currentTarget)close();}}><button className="portfolio-close" onClick={close} aria-label="Close project"><X/></button>{active&&<><img src={active.image} alt={`${active.name} full artwork`}/><p>{active.category}</p><h3>{active.name}</h3></>}</dialog>
 </section>;
};
export default PortfolioGallery;
