import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
const html=readFileSync('public/intake.html','utf8');
const script=readFileSync('public/intake-studio.js','utf8');
const catalog=JSON.parse(readFileSync('public/pricing-catalog.json','utf8'));
const field=(name:string)=>document.querySelector<HTMLInputElement>(`[name="${name}"]`)!;
async function boot(){
 document.documentElement.innerHTML=html;
 document.getElementById('brand-brief')!.scrollIntoView=vi.fn();
 await new Function('fetch',`return ${script}`)(vi.fn().mockResolvedValue({ok:true,json:async()=>catalog}));
}
describe('customer intake persistence and review',()=>{
 beforeEach(()=>{localStorage.clear();sessionStorage.clear();});
 it('restores every selected product and addon while requiring a fresh acknowledgment',async()=>{
 await boot();field('Business_name').value='TEST business';
 const choices=[...document.querySelectorAll<HTMLInputElement>('[name="Requested_products[]"]')];
 choices[0].checked=true;choices[3].checked=true;
 field('Add_ons[]').checked=true;field('Quote_acknowledgment').checked=true;
 document.getElementById('save-draft')!.click();
 choices.forEach(c=>c.checked=false);field('Quote_acknowledgment').checked=true;
 document.getElementById('restore-draft')!.click();
 expect(choices.filter(c=>c.checked).map(c=>c.value)).toEqual(['Business cards','Bookmarks']);
 expect(field('Add_ons[]').checked).toBe(true);
 expect(field('Quote_acknowledgment').checked).toBe(false);
 expect(field('Business_name').value).toBe('TEST business');
 expect(document.getElementById('review-brief')!.textContent).toContain('Bookmarks');
 });
 it('updates accessible progress and preserves the premium estimate',async()=>{
 sessionStorage.setItem('alexela-quote',JSON.stringify({packageId:'ultimate',addons:['rush']}));
 await boot();
 for(const name of ['Business_name','Contact_name','Phone','Business_and_audience'])field(name).value='TEST';
 field('Email').value='test@example.com';
 document.getElementById('next-step')!.click();
 const progress=document.getElementById('step-progress') as HTMLProgressElement;
 expect(progress.value).toBe(2);expect(progress.textContent).toBe('2 of 4');
 expect(progress.getAttribute('aria-valuetext')).toContain('Step 2 of 4');
 expect(document.getElementById('estimate-total')!.textContent).toBe('$2,049');
 });
});
