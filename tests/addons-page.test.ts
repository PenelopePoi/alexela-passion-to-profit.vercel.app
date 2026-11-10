// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
const read=(path:string)=>readFileSync(path,'utf8');
const catalog=JSON.parse(read('public/pricing-catalog.json'));
describe('AleXelA unified add-on experience',()=>{
 it('retains all ten approved starting package names and prices',()=>{
  expect(catalog.packages).toHaveLength(10);
  expect(catalog.packages[0]).toMatchObject({id:'cardcut',price:75});
  expect(catalog.packages[9]).toMatchObject({id:'ultimate',price:2000});
 });
 it('supplies unique add-ons with valid rates to the shared catalog',()=>{
  const ids=catalog.addons.map((a:{id:string})=>a.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(catalog.addons.every((a:{price:number})=>Number.isFinite(a.price)&&a.price>=0)).toBe(true);
 });
 it('uses the approved logo and sacred geometry on all customer guide pages',()=>{
  for(const path of ['public/addons.html','public/intake.html','public/price-guide.html','public/portfolio-upload.html']){
   const page=read(path);
   expect(page).toContain('href="/alexela-logo-cutout.png"');
   expect(page).toContain('href="/sacred-geometry.css"');
   expect(page).toContain('href="/addons.html"');
  }
 });
 it('loads current add-ons rather than duplicating hard-coded prices',()=>{
  expect(read('public/addons.js')).toContain("fetch('/pricing-catalog.json')");
  for(const id of ['cleanup','vector','social','calls','reviews','flyer','shirt','sign','revision','rush'])expect(catalog.addons.some((a:{id:string})=>a.id===id)).toBe(true);
  expect(read('public/addons.html')).toContain('id="digital-addons"');
  expect(read('public/addons.html')).toContain('id="physical-addons"');
  expect(read('public/addons.html')).toContain('id="support-addons"');
  expect(read('public/addons.js')).toContain("'/intake.html?addons='");
 });
 it('exposes a reachable add-ons link in desktop/mobile studio navigation',()=>{
  const src=read('components/StudioLanding.tsx');
  expect((src.match(/\/addons\.html/g)||[]).length).toBeGreaterThanOrEqual(3);
 });
});
