import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
const html=readFileSync('public/intake.html','utf8');
const script=readFileSync('public/intake-studio.js','utf8');
const original=JSON.parse(readFileSync('public/pricing-catalog.json','utf8'));

async function boot(catalog: typeof original){
 document.documentElement.innerHTML=html;
 document.getElementById('brand-brief')!.scrollIntoView=vi.fn();
 await new Function('fetch',`return ${script}`)(vi.fn().mockResolvedValue({ok:true,json:async()=>catalog}));
}

describe('intake and site share the single price catalog',()=>{
 beforeEach(()=>{localStorage.clear();sessionStorage.clear();});
 it('populates every package and add-on in the same order and with the same current price',async()=>{
  await boot(original);
  const packages=Array.from(document.querySelectorAll<HTMLOptionElement>('#package option')).filter(x=>x.value!=='custom');
  const addons=Array.from(document.querySelectorAll<HTMLInputElement>('.intake-addons input[name="Add_ons[]"]'));
  expect(packages.map(x=>x.value)).toEqual(original.packages.map((p:{id:string})=>p.id));
  expect(addons.map(x=>x.value)).toEqual(original.addons.map((p:{id:string})=>p.id));
  for(const p of original.packages)expect(packages.find(x=>x.value===p.id)?.textContent).toContain('$'+p.price.toLocaleString('en-US'));
  for(const a of original.addons)expect(addons.find(x=>x.value===a.id)?.closest('label')?.textContent).toContain('$'+a.price.toLocaleString('en-US'));
 });
 it('reflects price updates without altering static HTML, including deep-link selections',async()=>{
  const catalog=structuredClone(original);
  catalog.packages[1].price=145;
  catalog.addons[0].price=30;
  history.replaceState({},'','/?package=promo&addons=cleanup');
  await boot(catalog);
  expect((document.querySelector('#package') as HTMLSelectElement).value).toBe('promo');
  expect((document.querySelector('[name="Add_ons[]"][value="cleanup"]') as HTMLInputElement).checked).toBe(true);
  expect(document.getElementById('estimate-total')?.textContent).toBe('$175');
  expect(document.querySelector('#package option[value="promo"]')?.textContent).toContain('$145');
 });
});
