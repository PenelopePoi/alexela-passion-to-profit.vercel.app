// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { setCorsHeaders } from '../api/_lib/cors';
function response(){const headers:Record<string,string>={};return {headers,setHeader:(key:string,value:string)=>{headers[key]=value;}};}
describe('AleXelA API origin restrictions',()=>{
 it('allows official production and preview domains',()=>{
  for(const origin of ['https://alexela-passion-to-profit.vercel.app','https://alexela-passion-to-profit-abc123.vercel.app']){
   const res=response();setCorsHeaders({headers:{origin}} as any,res as any);
   expect(res.headers['Access-Control-Allow-Origin']).toBe(origin);
  }
 });
 it('rejects arbitrary Vercel tenants and hostile origins',()=>{
  for(const origin of ['https://unrelated.vercel.app','https://alexela-passion-to-profit.vercel.app.evil.example','http://alexela-passion-to-profit.vercel.app']){
   const res=response();setCorsHeaders({headers:{origin}} as any,res as any);
   expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
  }
 });
});
