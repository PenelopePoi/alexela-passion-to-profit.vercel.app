/** Production exports are local; no contact details or artwork leave the browser. */
export const escapeXml = (value: string) => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
export const safeFilename = (value: string) => value.normalize('NFKD').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0,80) || 'alexela-design';
export function normalizeDestination(value: string): string {
  const raw = value.trim();
  if (!raw) throw new Error('Enter a real website or telephone number for the QR code.');
  if (raw.startsWith('tel:')) {
    const phone = raw.slice(4).replace(/[^\d+]/g,'');
    if (!/^\+?\d{7,15}$/.test(phone)) throw new Error('Enter a complete telephone number.');
    return `tel:${phone}`;
  }
  const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  if (!['http:','https:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) throw new Error('Use a complete public HTTP or HTTPS address.');
  return url.href;
}
const qrCache = new Map<string, Promise<string>>();
export function localQr(destination: string): Promise<string> {
  const target = normalizeDestination(destination);
  const existing = qrCache.get(target);
  if (existing) return existing;
  const promise = import('qrcode').then(qr => qr.toDataURL(target, {width:900, margin:4, errorCorrectionLevel:'M', color:{dark:'#000000',light:'#ffffff'}}));
  qrCache.set(target,promise);
  if(qrCache.size>24) qrCache.delete(qrCache.keys().next().value!);
  promise.catch(()=>qrCache.delete(target));
  return promise;
}
export function downloadBlob(blob: Blob, filename: string) {
  const url=URL.createObjectURL(blob), link=document.createElement('a');
  link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
}
export function fitFont(text:string, maxWidth:number, preferred:number, min=12):number {
  return Math.max(min, Math.min(preferred,maxWidth/Math.max(1,Array.from(text).length*.62)));
}
export function inspectPrintBrief(brief: {name:string;tagline:string;phone:string;email:string;logo?:string}, kind:string):string[] {
  const errors:string[]=[];
  if(!brief.name.trim()) errors.push('Add your business name.');
  if(kind!=='logo') {
    if(!brief.tagline.trim()) errors.push('Add your slogan before making cards or flyers.');
    if(!brief.phone.trim()&&!brief.email.trim()) errors.push('Add a real phone number or email for customers.');
    if(brief.phone&&!/^\+?[\d\s().-]{7,25}$/.test(brief.phone)) errors.push('Check the phone number.');
    if(brief.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.email)) errors.push('Check the email address.');
  }
  if(brief.name.length>90||brief.tagline.length>140) errors.push('Shorten the business name or slogan to keep it readable.');
  return errors;
}
export async function rasterizeSvg(svg:string,width:number,height:number):Promise<HTMLCanvasElement> {
  const img=new Image();
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  try {
    await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('Artwork could not be rendered. Check the uploaded logo.'));img.src=url;});
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Image export is unavailable in this browser.');
    ctx.drawImage(img,0,0,width,height);return canvas;
  }finally{URL.revokeObjectURL(url);}
}
export async function verifyFinalQr(canvas:HTMLCanvasElement,target:string) {
  const {default:jsQR}=await import('jsqr');
  const ctx=canvas.getContext('2d')!;
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
  const decoded=jsQR(pixels.data,pixels.width,pixels.height,{inversionAttempts:'dontInvert'});
  if(decoded?.data!==normalizeDestination(target))throw new Error('Final artwork QR check failed. Shorten the destination or increase the QR size.');
}
export type PrintBrief={name:string;tagline:string;phone:string;email:string;website:string;services:string;headline:string;color:string;logo?:string};
export function makePrintSvg(b:PrintBrief,kind:'logo'|'card'|'flyer',back=false,qr='',mirror=false):{svg:string;width:number;height:number} {
  const [width,height]=kind==='logo'?[1200,800]:kind==='card'?[1050,600]:[2550,3300];
  const unit=kind==='flyer'?3:1;
  const color=/^#[0-9a-f]{6}$/i.test(b.color)?b.color:'#086d73';
  const text=(value:string,x:number,y:number,size:number,fill='#102b38',anchor='start',max=width-100*unit)=>`<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${fitFont(value,max,size,12*unit)}" fill="${fill}" text-anchor="${anchor}">${escapeXml(value)}</text>`;
  // Uploaded artwork is contained, never cropped or recolored.
  const logo=(x:number,y:number,w:number,h:number)=>b.logo?`<image href="${escapeXml(b.logo)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`:text(b.name,x+w/2,y+h/2+20,60*unit,color,'middle',w-20);
  let artwork='';
  if(kind==='logo') artwork=logo(60,100,1080,600);
  else if(kind==='card') {
    artwork=`<rect width="1050" height="600" fill="#ffffff"/><rect width="18" height="600" fill="${color}"/>`;
    if(!back) artwork+=logo(80,45,890,300)+text(b.name,525,405,54,color,'middle',890)+text(b.tagline,525,465,27,'#102b38','middle',890);
    else artwork+=text(b.name,75,95,40,color,'start',900)+text(b.services,75,165,25,'#102b38','start',900)+text('LET’S MAKE IT HAPPEN',75,255,22,color)+text(b.phone,75,315,38,'#102b38','start',620)+text(b.email,75,365,26,'#102b38','start',620)+text(b.website,75,415,24,'#102b38','start',620)+(qr?`<image href="${escapeXml(qr)}" x="750" y="270" width="240" height="240"/>`:'');
  } else {
    artwork=`<rect width="2550" height="3300" fill="white"/><rect width="2550" height="42" fill="${color}"/>`+logo(225,150,2100,720)+text(b.name,1275,1050,135,color,'middle',2100)+text(b.tagline,1275,1240,66,'#102b38','middle',2100)+`<path d="M225 1390H2325" stroke="${color}" stroke-width="5"/>`+text(b.headline||'Let’s get to work.',225,1650,135,color,'start',2100)+text(b.services,225,1870,66,'#102b38','start',2100)+text('CALL • CONNECT • GET STARTED',225,2400,54,color)+text(b.phone,225,2560,105,'#102b38','start',1450)+text(b.email,225,2680,57,'#102b38','start',1450)+text(b.website,225,2800,54,'#102b38','start',1450)+(qr?`<image href="${escapeXml(qr)}" x="1770" y="2370" width="555" height="555"/>`:'');
  }
  const inches=kind==='logo'?[4,8/3]:kind==='card'?[3.5,2]:[8.5,11];
  return {width,height,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${inches[0]}in" height="${inches[1]}in" viewBox="0 0 ${width} ${height}"><title>${escapeXml(b.name)} — ${kind}${back?' back':''}</title>${mirror?`<g transform="translate(${width} 0) scale(-1 1)">${artwork}</g>`:artwork}</svg>`};
}
