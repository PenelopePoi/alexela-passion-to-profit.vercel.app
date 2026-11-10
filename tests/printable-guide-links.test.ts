// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
const source=(path:string)=>readFileSync(path,'utf8');
describe('customer printable pages',()=>{
 it('uses current print-ready HTML instead of stale static PDF links',()=>{
  const guide=source('public/price-guide.html');
  const intake=source('public/intake.html');
  const landing=source('components/StudioLanding.tsx');
  expect(guide).toContain('Print / Save as PDF');
  expect(intake).toContain('Print / Save current intake as PDF');
  expect(landing).toContain('Print / save current price guide');
  expect(guide).not.toContain('/downloads/AleXelA_Price_Guide.pdf');
  expect(intake).not.toContain('/downloads/AleXelA_Intake_Form.pdf');
  expect(landing).not.toContain('/downloads/AleXelA_Price_Guide.pdf');
 });
 it('keeps approved studio logo and geometry on both guides',()=>{
  for(const path of ['public/price-guide.html','public/intake.html']){
    const document=source(path);
    expect(document).toContain('/alexela-logo-cutout.png');
    expect(document).toContain('/sacred-geometry.css');
    expect(document).toContain('print-geometry');
  }
 });
});
