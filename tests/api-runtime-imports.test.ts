// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

function files(dir: string): string[] {
 return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):e.name.endsWith('.ts')?[join(dir,e.name)]:[]);
}
describe('Node 24 serverless import integrity',()=>{
 it('uses explicit .js extensions for all relative API module imports',()=>{
  for(const file of files('api')){
   const source=readFileSync(file,'utf8');
   const imports=[...source.matchAll(/(?:from\s*['"]|import\s*\(\s*['"])(\.[^'"]+)['"]/g)].map(m=>m[1]);
   for(const spec of imports){
    expect(spec.endsWith('.js'),file+' imports '+spec+' without a .js extension').toBe(true);
    expect(existsSync(resolve(dirname(file),spec.replace(/\.js$/,'.ts'))),file+' imports missing '+spec).toBe(true);
   }
  }
 });
});
