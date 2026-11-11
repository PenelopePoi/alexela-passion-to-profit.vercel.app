import React,{useMemo,useState} from 'react';
import type {BrandInput,BrandStrategy} from '../types';
import {downloadBlob,inspectPrintBrief,localQr,makePrintSvg,normalizeDestination,rasterizeSvg,safeFilename,verifyFinalQr,type PrintBrief} from '../services/productionExport';
import './production-studio.css';

export default function ProductionStudio({input,data,logoUrl}:{input?:BrandInput;data?:BrandStrategy;logoUrl?:string}) {
 const [brief,setBrief]=useState<PrintBrief>({name:input?.companyName||'',tagline:data?.taglines?.[0]||'',phone:input?.phone||'',email:input?.email||'',website:input?.website||'',services:input?.services?.join(' · ')||'',headline:data?.flyerCopy?.headline||'',color:data?.colorPalette?.primary||'#086d73',logo:logoUrl});
 const [kind,setKind]=useState<'logo'|'card'|'flyer'>('card'),[back,setBack]=useState(false),[mirror,setMirror]=useState(false),[busy,setBusy]=useState(false),[status,setStatus]=useState(''),[qr,setQr]=useState('');
 const errors=useMemo(()=>inspectPrintBrief(brief,kind),[brief,kind]);
 const preview=useMemo(()=>makePrintSvg(brief,kind,back,qr,mirror),[brief,kind,back,qr,mirror]);
 const field=(key:keyof PrintBrief,label:string,type='text')=><label>{label}<input type={type} value={brief[key]||''} maxLength={key==='services'?140:200} onChange={e=>{setBrief(v=>({...v,[key]:e.target.value}));setStatus('');if(key==='website')setQr('');}}/></label>;
 const target=brief.website||(brief.phone?`tel:${brief.phone}`:'');
 const upload=async(file?:File)=>{
  if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>8*1024*1024){setStatus('Choose a PNG, JPEG or WebP logo smaller than 8 MB.');return;}
  const reader=new FileReader();reader.onload=()=>{setBrief(v=>({...v,logo:String(reader.result)}));setStatus('Original logo retained. No cropping or recoloring.');};reader.readAsDataURL(file);
 };
 const exportDesign=async(format:'svg'|'png'|'pdf')=>{
  if(busy)return;
  if(errors.length){setStatus(errors.join(' '));return;}
  setBusy(true);setStatus('Preparing your files…');
  try {
   let embedded=brief.logo;
   if(embedded&&!embedded.startsWith('data:')) {
    const response=await fetch(embedded);if(!response.ok)throw new Error('The logo could not be loaded. Upload the original logo.');
    const blob=await response.blob();
    embedded=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(blob);});
   }
   const current={...brief,logo:embedded};
   const qrData=kind==='logo'?'':await localQr(target);setQr(qrData);
   const sides=kind==='card'?[false,true]:[false];
   // Decode the final, full-size raster on the QR-bearing side before any file is released.
   const rendered=[];
   for(const side of sides){const design=makePrintSvg(current,kind,side,qrData,mirror);const canvas=await rasterizeSvg(design.svg,design.width,design.height);if(kind!=='logo'&&(kind==='flyer'||side)){if(mirror)throw new Error('QR codes must remain unmirrored. Use mirroring for logo heat transfers only.');await verifyFinalQr(canvas,target);}rendered.push({...design,canvas,side});}
   const base=`${safeFilename(brief.name)}-${kind}${mirror?'-MIRRORED-IRON-ON':''}`;
   if(format==='pdf') {
    const {jsPDF}=await import('jspdf');
    const size=kind==='card'?[3.5,2]:kind==='flyer'?[8.5,11]:[4,8/3];
    const pdf=new jsPDF({unit:'in',format:size,orientation:size[0]>size[1]?'landscape':'portrait',compress:true});
    for(const [i,r]of rendered.entries()){if(i)pdf.addPage(size,size[0]>size[1]?'landscape':'portrait');pdf.addImage(r.canvas.toDataURL('image/png'),'PNG',0,0,size[0],size[1]);}
    pdf.save(`${base}-PRINT.pdf`);
   }else for(const r of rendered){const suffix=kind==='card'?(r.side?'-BACK':'-FRONT'):'';if(format==='svg')downloadBlob(new Blob([r.svg],{type:'image/svg+xml'}),`${base}${suffix}-EDITABLE.svg`);else {const blob=await new Promise<Blob>((resolve,reject)=>r.canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG export failed.')),'image/png'));downloadBlob(blob,`${base}${suffix}-300PPI.png`);}}
   setStatus(kind==='logo'?'Exported. Editable SVG retains live type; outline text in a vector editor before cutting.':'Exported at exact trim size and 300 pixels per inch. Final artwork QR decoded and matched your destination.');
  }catch(e){setStatus(e instanceof Error?e.message:'Export failed. Please try again.');}finally{setBusy(false);}
 };
 return <section className="production-studio" aria-labelledby="production-title"><div className="production-heading"><p>THE FINISHING STUDIO</p><h2 id="production-title">Your brand. <em>Ready for the world.</em></h2><p>Make a clean logo wordmark, a two-sided card or a letter-size flyer. Keep your original artwork, edit the details and download actual files.</p></div><div className="production-layout"><div className="production-controls"><div className="production-switch" aria-label="Choose design type">{(['logo','card','flyer'] as const).map(v=><button key={v} aria-pressed={kind===v} onClick={()=>{setKind(v);setBack(false);setMirror(false);setStatus('');}}>{v==='card'?'Business card':v==='logo'?'Logo':'Flyer'}</button>)}</div>{field('name','Business name')}{field('tagline','Slogan / tagline')}{field('phone','Phone','tel')}{field('email','Email','email')}{field('website','Website / QR destination')}{field('services','Services (short list)')}{kind==='flyer'&&field('headline','Flyer headline')}{field('color','Accent color','color')}<label>Keep your existing logo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>void upload(e.target.files?.[0])}/></label>{brief.logo&&<button className="production-secondary" onClick={()=>setBrief(v=>({...v,logo:undefined}))}>Use a wordmark instead</button>}{kind==='logo'&&<label className="production-check"><input type="checkbox" checked={mirror} onChange={e=>setMirror(e.target.checked)}/>Mirror entire logo for iron-on</label>}<p className="production-note">{kind==='logo'?'Transparent background. Live text stays editable. This is a design SVG, not an outlined Cricut cut file.':kind==='card'?'3.5 × 2 in · front + back · 300 PPI · trim-size artwork':'8.5 × 11 in · portrait · 300 PPI · trim-size artwork'}</p><p className="production-note">For edge-to-edge printing, confirm your printer’s bleed requirements. These files use generous white margins; Avery sheet alignment is not included.</p></div><div className="production-output">{kind==='card'&&<div className="production-switch"><button aria-pressed={!back} onClick={()=>setBack(false)}>Front</button><button aria-pressed={back} onClick={()=>setBack(true)}>Back</button></div>}<div className="production-proof"><img src={'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(preview.svg)} alt={`${kind} ${back?'back':'front'} proof`}/></div><div className="production-preflight"><strong>Before you export</strong>{errors.length?<ul>{errors.map(error=><li key={error}>{error}</li>)}</ul>:<p>Business details ready. QR verification runs on the final artwork during export.</p>}<p>Review spelling and your contact details in the proof.</p></div><div className="production-downloads">{(['svg','png','pdf'] as const).map(f=><button key={f} disabled={busy||errors.length>0} onClick={()=>void exportDesign(f)}>{busy?'Preparing…':`Download ${f.toUpperCase()}`}</button>)}</div><p role="status" aria-live="polite" className="production-status">{status}</p></div></div></section>;
}
