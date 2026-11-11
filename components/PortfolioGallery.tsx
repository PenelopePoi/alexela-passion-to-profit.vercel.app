import React, { useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import './portfolio.css';
export const portfolioSections = ['Logos','Business Cards','Album Covers','Flyers','Door Hangers','Shirts & Apparel','Clothing Brands','Merchandise','Stickers & Decals','BMX Decal Sets','Motorcycle Decal Sets'] as const;
type Category = typeof portfolioSections[number];
type Project = {name:string;category:Category;image:string;stage?:'Before'|'After';comparison?:string};
const projects:Project[] = [
 {name:'Cracked to Classy Concrete — before',category:'Business Cards',image:'/portfolio/pair-cracked-cards-before.webp',stage:'Before',comparison:'cracked-cards'},
 {name:'Cracked to Classy Concrete — after',category:'Business Cards',image:'/portfolio/pair-cracked-cards-after.webp',stage:'After',comparison:'cracked-cards'},
 {name:'DNA Remodels wordmark — before',category:'Logos',image:'/portfolio/pair-dna-wordmark-before.webp',stage:'Before',comparison:'dna-wordmark'},
 {name:'DNA Remodels wordmark — after',category:'Logos',image:'/portfolio/pair-dna-wordmark-after.webp',stage:'After',comparison:'dna-wordmark'},
 {name:'DNA Remodels helix — before',category:'Logos',image:'/portfolio/pair-dna-helix-before.webp',stage:'Before',comparison:'dna-helix'},
 {name:'DNA Remodels helix — after',category:'Logos',image:'/portfolio/pair-dna-helix-after.webp',stage:'After',comparison:'dna-helix'},
 {name:'Big Boys Toys — before',category:'Business Cards',image:'/portfolio/pair-big-boys-cards-before.webp',stage:'Before',comparison:'big-boys-cards'},
 {name:'Big Boys Toys — after',category:'Business Cards',image:'/portfolio/pair-big-boys-cards-after.webp',stage:'After',comparison:'big-boys-cards'},
 {name:'DNA Remodels — before',category:'Business Cards',image:'/portfolio/pair-dna-cards-before.webp',stage:'Before',comparison:'dna-cards'},
 {name:'DNA Remodels — after',category:'Business Cards',image:'/portfolio/pair-dna-cards-after.webp',stage:'After',comparison:'dna-cards'},
 {name:'XELA — before',category:'Album Covers',image:'/portfolio/pair-xela-album-before.webp',stage:'Before',comparison:'xela-album'},
 {name:'XELA — after',category:'Album Covers',image:'/portfolio/pair-xela-album-after.webp',stage:'After',comparison:'xela-album'},
 {name:'Coquina Ridge — before',category:'Business Cards',image:'/portfolio/pair-coquina-cards-before.webp',stage:'Before',comparison:'coquina-cards'},
 {name:'Coquina Ridge — after',category:'Business Cards',image:'/portfolio/pair-coquina-cards-after.webp',stage:'After',comparison:'coquina-cards'},
 {name:'Laci’s Exterior Solutions — before',category:'Flyers',image:'/portfolio/pair-lacis-flyers-before.webp',stage:'Before',comparison:'lacis-flyers'},
 {name:'Laci’s Exterior Solutions — after',category:'Flyers',image:'/portfolio/pair-lacis-flyers-after.webp',stage:'After',comparison:'lacis-flyers'},
 {name:'Hutch to Hitch — before',category:'BMX Decal Sets',image:'/portfolio/pair-hutch-hitch-before.webp',stage:'Before',comparison:'hutch-hitch'},
 {name:'Hutch to Hitch — after',category:'BMX Decal Sets',image:'/portfolio/pair-hutch-hitch-after.webp',stage:'After',comparison:'hutch-hitch'},
 {name:'Rod’s E-Bike Repair — updated logo',category:'Logos',image:'/portfolio/rods-ebike-after-enhanced.webp',stage:'After',comparison:'rods-ebike'},
 {name:'Cristina’s Cleaning — original logo',category:'Logos',image:'/portfolio/cristinas-cleaning-logo.png',stage:'Before',comparison:'cristinas-cleaning'},
 {name:'God Within',category:'Clothing Brands',image:'/portfolio/god-within.webp'},
 {name:'Unmarked',category:'Clothing Brands',image:'/portfolio/unmarked.webp'},
 {name:'Backwards',category:'Clothing Brands',image:'/portfolio/backwards.webp'},
 {name:'S.L.U.G.S.',category:'Clothing Brands',image:'/portfolio/slugs-logo.png'},
 {name:'AleXelA — white-background identity',category:'Logos',image:'/portfolio/alexela-white-logo.webp'},
 {name:'DNA Remodels — emblem',category:'Logos',image:'/portfolio/dna-remodels-emblem.webp'},
 {name:'AleXelA — printed shirt',category:'Shirts & Apparel',image:'/portfolio/alexela-printed-shirt.webp'},
 {name:'AleXelA — services business card',category:'Business Cards',image:'/portfolio/alexela-business-card-services.webp'},
 ...[['Cracked to Classy','cracked-to-classy-logo'],['Rod’s E-Bike Repair','rods-ebike-logo'],['Big Boy Toys','bigboytoys-logo'],['Cristina’s Cleaning','cristinas-cleaning-approved']].map(([name,file])=>({name,category:'Logos' as const,image:'/portfolio/'+file+(file==='cristinas-cleaning-approved'?'.webp':'.png')})),
 ...[['Danbo Guitar Tech','01'],['Above All Tree Service','20']].map(([name,file])=>({name,category:'Logos' as const,image:'/gallery/work-'+file+'.jpg'})),
 ...[['Coquina Ridge','27'],['Rod’s E-Bike Repair card','30']].map(([name,file])=>({name,category:'Business Cards' as const,image:'/gallery/work-'+file+'.jpg'})),
 ...[['Landscaping & Property Services','09'],['Lexi’s Landscaping','13'],['Cut to Classy / Cracked to Classy','16'],['Laci’s Fence & Deck Services','24'],['Laci’s Pressure Washing','25'],['Laci’s Property Services','26'],['Coquina Ridge Shoreline Services','28'],['Rod’s E-Bike Repair flyer','31']].map(([name,file])=>({name,category:'Flyers' as const,image:'/gallery/work-'+file+'.jpg'})),
 {name:'DNA Remodels',category:'Business Cards',image:'/portfolio/dna-remodels-business-card.webp'},
 {name:'Remodeling shirt design',category:'Shirts & Apparel',image:'/gallery/work-08.jpg',stage:'Before'},
];
// User-reviewed annotations: screenshots are references only; display original assets.
const annotatedProjects:Project[] = projects.map(project => {
 if(project.image==='/portfolio/cristinas-cleaning-approved.webp') return {...project,stage:'After',comparison:'cristinas-cleaning'};
 if(project.image==='/portfolio/cracked-to-classy-logo.png') return {...project,stage:'Before',comparison:'cracked-to-classy'};
 if(project.image==='/gallery/work-16.jpg') return {...project,stage:'After',comparison:'cracked-to-classy'};
 if(project.image==='/portfolio/rods-ebike-logo.png') return {...project,stage:'Before',comparison:'rods-ebike'};
 if(['/gallery/work-30.jpg','/gallery/work-31.jpg'].includes(project.image)) return {...project,stage:'After',comparison:'rods-ebike'};
 return project;
});
export const portfolioProjects:Project[] = annotatedProjects.flatMap((project,index) => {
 if(!project.comparison) return [project];
 const siblings=annotatedProjects.filter(p=>p.category===project.category&&p.comparison===project.comparison);
 if(siblings.length<2) return [project];
 if(index!==annotatedProjects.indexOf(siblings[0])) return [];
 return [...siblings].sort((a,b)=>(a.stage==='Before'?0:1)-(b.stage==='Before'?0:1));
});
function Geometry(){return <svg className="portfolio-geometry" viewBox="0 0 400 400" fill="none" aria-hidden="true"><circle cx="200" cy="200" r="180"/>{[0,60,120,180,240,300].map(a=><circle key={a} cx="200" cy="120" r="80" transform={`rotate(${a} 200 200)`}/>)}<circle cx="200" cy="200" r="80"/><path d="M200 20 356 290H44ZM200 380 44 110H356Z"/></svg>}
export const PortfolioGallery:React.FC=()=>{
 const [filter,setFilter]=useState<Category|'All'>('All'),[active,setActive]=useState<Project|null>(null);
 const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLButtonElement|null>(null);
 const visibleProjects=portfolioProjects.filter(project=>filter==='All'||project.category===filter);
 const relatedProjects=active?.comparison?portfolioProjects.filter(p=>p.comparison===active.comparison):[];
 const activeIndex=active?visibleProjects.findIndex(project=>project.image===active.image):-1;
 const move=(direction:number)=>{if(activeIndex>=0)setActive(visibleProjects[(activeIndex+direction+visibleProjects.length)%visibleProjects.length]);};
 const inquiry=(category:string,name?:string)=>'/intake.html?package=custom&product='+encodeURIComponent(category+(name?' — '+name:''));
 const close=()=>{dialog.current?.close();setActive(null);opener.current?.focus();};
 return <section id="portfolio-peek" className="alexela-portfolio" aria-labelledby="portfolio-title">
 <header className="portfolio-intro"><Geometry/><p className="portfolio-kicker">THE ALEXELA PORTFOLIO</p><h2 id="portfolio-title">Ideas made <em>visible.</em></h2><p>Explore the work by what you need. Open any image to see the full design.</p></header>
 <div className="portfolio-filters" role="group" aria-label="Filter portfolio">{(['All',...portfolioSections] as const).map(name=><button key={name} aria-pressed={filter===name} onClick={()=>setFilter(name)}>{name}</button>)}</div>
 <p aria-live="polite" className="portfolio-result-count">{filter==='All'?'All portfolio sections':filter}</p>
 {portfolioSections.filter(name=>filter==='All'||filter===name).map(name=>{const work=portfolioProjects.filter(p=>p.category===name);return <section className="portfolio-category" key={name} aria-label={name}><div className="portfolio-category-heading"><span aria-hidden="true">{String(portfolioSections.indexOf(name)+1).padStart(2,'0')}</span><h3>{name}</h3><small>{work.length} {work.length===1?'project':'projects'}</small></div>{name==='Logos'&&<img src="/portfolio/logos-header.webp" alt="AleXelA logo design portfolio collage" width={1536} height={1024} loading="lazy" decoding="async" style={{display:'block',width:'100%',height:'auto',borderRadius:12,marginBottom:24}}/>}{work.length?<div className="portfolio-grid">{work.map(project=><button className="portfolio-piece" key={project.image} aria-label={`View ${project.name}`} onClick={e=>{opener.current=e.currentTarget;setActive(project);dialog.current?.showModal();}}><div className="portfolio-image"><img src={project.image.endsWith('.webp')&&!project.image.startsWith('/portfolio/pair-')?project.image.replace('.webp','-thumb.webp'):project.image} alt={project.name} loading="lazy" decoding="async"/><span><Plus size={20}/></span></div><div className="portfolio-caption"><h4>{project.stage&&<span className={`portfolio-stage ${project.stage.toLowerCase()}`}>{project.stage}</span>}{project.name}</h4><ArrowUpRight size={18}/></div></button>)}</div>:<p className="portfolio-pending">Project photos are being added to this section. <a href={inquiry(name)}>Ask about {name.toLowerCase()} <ArrowUpRight size={14}/></a></p>}</section>})}
 <dialog ref={dialog} className="portfolio-lightbox" aria-label={active?.name||'Project artwork'} onCancel={()=>{setActive(null);opener.current?.focus();}} onClick={e=>{if(e.target===e.currentTarget)close();}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}}}><button className="portfolio-close" onClick={close} aria-label="Close project"><X/></button>{active&&<><img src={active.image} alt={`${active.name} full artwork`}/><p>{active.category}{active.stage?` · ${active.stage}`:''}</p><h3>{active.name}</h3>{relatedProjects.length>1&&<div className="portfolio-comparison" role="group" aria-label="Before and after artwork">{relatedProjects.map(project=><button key={project.image} aria-pressed={project.image===active.image} onClick={()=>setActive(project)}>{project.stage}: {project.name}</button>)}</div>}<div className="portfolio-viewer-actions"><button onClick={()=>move(-1)} disabled={visibleProjects.length<2||activeIndex<0} aria-label="Previous project"><ChevronLeft size={18}/>Previous</button><span aria-live="polite">{activeIndex>=0?`${activeIndex+1} / ${visibleProjects.length}`:active.stage}</span><button onClick={()=>move(1)} disabled={visibleProjects.length<2||activeIndex<0} aria-label="Next project">Next<ChevronRight size={18}/></button><a href={inquiry(active.category,active.name)}>Request a similar project <ArrowUpRight size={16}/></a><a href={active.image} target="_blank" rel="noopener">Open full-resolution image <ArrowUpRight size={16}/></a></div></>}</dialog>
 </section>;
};
export default PortfolioGallery;
