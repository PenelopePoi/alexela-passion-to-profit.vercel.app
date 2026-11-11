// @vitest-environment node
import {describe,it,expect} from 'vitest';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {escapeXml,fitFont,inspectPrintBrief,makePrintSvg,normalizeDestination,safeFilename} from '../services/productionExport';
import {firebaseConfiguration} from '../api/_lib/firebaseConfig';
const brief={name:'Ali & Co <Studio>',tagline:'From idea to income',phone:'321-375-9685',email:'hello@example.com',website:'example.com',services:'Branding · Print · Design',headline:'Make it real.',color:'#086d73'};
describe('production exports',()=>{
 it('escapes client text and creates valid physical trim sizes',()=>{
  const front=makePrintSvg(brief,'card');expect(front.svg).toContain('width="3.5in" height="2in"');expect(front.width).toBe(1050);expect(front.height).toBe(600);expect(front.svg).toContain('Ali &amp; Co &lt;Studio&gt;');expect(front.svg).not.toContain('<Studio>');
  const flyer=makePrintSvg(brief,'flyer');expect(flyer.width).toBe(2550);expect(flyer.height).toBe(3300);expect(flyer.svg).toContain('width="8.5in" height="11in"');
 });
 it('requires real details and a slogan rather than fabricating contact information',()=>{
  expect(inspectPrintBrief({...brief,tagline:'',phone:'',email:''},'card')).toHaveLength(2);
  expect(inspectPrintBrief({...brief,email:'bad-email'},'flyer')).toContain('Check the email address.');
  expect(inspectPrintBrief(brief,'card')).toEqual([]);
 });
 it('creates transparent logos and mirrors the entire group including text',()=>{
  const logo=makePrintSvg(brief,'logo',false,'',true);expect(logo.svg).not.toContain('<rect');expect(logo.svg).toContain('translate(1200 0) scale(-1 1)');
 });
 it('contains the full uploaded logo without cropping',()=>{
  expect(makePrintSvg({...brief,logo:'data:image/png;base64,AAA'},'card').svg).toContain('preserveAspectRatio="xMidYMid meet"');
 });
 it('places contact details and QR on the card back',()=>{
  expect(makePrintSvg(brief,'card',false).svg).not.toContain(brief.phone);
  expect(makePrintSvg(brief,'card',true,'data:image/png;base64,AAA').svg).toContain(brief.phone);
 });
 it('normalizes web and telephone destinations and rejects unsafe destinations',()=>{
  expect(normalizeDestination('example.com/path')).toBe('https://example.com/path');expect(normalizeDestination('tel:(321) 375-9685')).toBe('tel:3213759685');
  for(const invalid of ['','javascript:alert(1)','https://user:pass@example.com','tel:123'])expect(()=>normalizeDestination(invalid)).toThrow();
 });
 it('uses four quiet-zone modules and locally generated codes decode exactly',()=>{
  const target=normalizeDestination(brief.website),qr=QRCode.create(target,{errorCorrectionLevel:'M'}),scale=8,margin=4,n=(qr.modules.size+margin*2)*scale;
  const rgba=new Uint8ClampedArray(n*n*4);rgba.fill(255);
  for(let y=0;y<qr.modules.size;y++)for(let x=0;x<qr.modules.size;x++)if(qr.modules.get(y,x))for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++){const i=(((y+margin)*scale+dy)*n+(x+margin)*scale+dx)*4;rgba[i]=rgba[i+1]=rgba[i+2]=0;}
  expect(jsQR(rgba,n,n)?.data).toBe(target);
 });
 it('safely names downloads and fits long names',()=>{expect(safeFilename('../My Business!?')).toBe('My-Business');expect(fitFont('A long business name',200,60)).toBeLessThan(60);expect(escapeXml('"&')).toBe('&quot;&amp;');});
});
describe('Firebase service account configuration',()=>{
 it('accepts a service-account project_id without the redundant project variable',()=>{
  expect(firebaseConfiguration({FIREBASE_SERVICE_ACCOUNT_KEY:JSON.stringify({project_id:'sample',client_email:'service@example.com',private_key:'test'})})).toEqual({configured:true,projectId:'sample'});
 });
 it('rejects malformed or incomplete service account configuration',()=>{expect(firebaseConfiguration({FIREBASE_SERVICE_ACCOUNT_KEY:'bad'}).configured).toBe(false);expect(firebaseConfiguration({FIREBASE_SERVICE_ACCOUNT_KEY:'{}'}).configured).toBe(false);});
});
