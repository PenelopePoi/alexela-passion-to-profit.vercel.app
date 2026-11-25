// @vitest-environment node
import { describe,it,expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
function open(){return new JSDOM(readFileSync('public/passion-to-profit.html','utf8'),{runScripts:'dangerously',url:'https://example.com/passion-to-profit.html',beforeParse(w){w.confirm=()=>true;w.print=()=>{};}});}
describe('business planner',()=>{
 it('calculates margin and rejects invalid margin without infinity',()=>{const dom=open(),d=dom.window.document;d.querySelector<HTMLButtonElement>('#calculate')!.click();expect(d.querySelector('#price')!.textContent).toContain('$100.00');d.querySelector<HTMLInputElement>('#margin')!.value='100';d.querySelector<HTMLButtonElement>('#calculate')!.click();expect(d.querySelector('#price')!.textContent).toContain('less than 100');dom.window.close()});
 it('saves and deletes notes without treating text as markup',()=>{const dom=open(),d=dom.window.document;const text=d.querySelector('textarea')!;text.value='<script>private text</script>';d.querySelector<HTMLButtonElement>('#save')!.click();expect(dom.window.localStorage.getItem('creator-resource:/passion-to-profit.html')).toContain('private text');d.querySelector<HTMLButtonElement>('#clear')!.click();expect(text.value).toBe('');expect(dom.window.localStorage.length).toBe(0);dom.window.close()});
 it('imports same-workbook notes but rejects cross-workbook or invalid values atomically',async()=>{const dom=open(),w=dom.window,d=w.document,input=d.querySelector<HTMLInputElement>('#import-notes')!;async function upload(value:unknown){Object.defineProperty(input,'files',{configurable:true,value:[new w.File([JSON.stringify(value)],'notes.json',{type:'application/json'})]});input.dispatchEvent(new w.Event('change'));await new Promise(resolve=>setTimeout(resolve,30));}
 await upload({title:d.title,responses:{offer:'A clear offer',check0:true}});expect(d.querySelector('textarea')!.value).toBe('A clear offer');expect(w.localStorage.length).toBe(0);
 await upload({title:'Other workbook',responses:{offer:'overwrite'}});expect(d.querySelector('textarea')!.value).toBe('A clear offer');expect(d.querySelector('#status')!.textContent).toContain('same workbook');
 await upload({title:d.title,responses:{offer:'partial overwrite',check0:'not boolean'}});expect(d.querySelector('textarea')!.value).toBe('A clear offer');dom.window.close();});
});
