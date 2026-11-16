// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
const xml=readFileSync('public/sitemap.xml','utf8');
describe('customer discovery sitemap',()=>{
 it('lists all primary public purchase-decision pages',()=>{
  for(const path of ['/','/intake.html','/price-guide.html','/addons.html','/services/logo-design-cocoa-fl.html','/services/business-card-design-florida.html']){
   expect(xml).toContain('<loc>https://alexela-passion-to-profit.vercel.app'+path+'</loc>');
  }
 });
 it('has unique URLs with corresponding public pages',()=>{
  const paths=[...xml.matchAll(/<loc>https:\/\/alexela-passion-to-profit\.vercel\.app([^<]*)<\/loc>/g)].map(x=>x[1]);
  expect(paths.length).toBe(new Set(paths).size);
  for(const path of paths){
   if(path==='/'||path.startsWith('/?'))continue;
   expect(existsSync('public'+path),path+' should exist in public/').toBe(true);
  }
 });
});
