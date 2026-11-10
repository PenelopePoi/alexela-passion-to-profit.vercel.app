(function () {
'use strict';
const groups={digital:['cleanup','vector','social','calls','reviews'],physical:['flyer','shirt','sign'],support:['revision','rush']};
const selected=new Set();
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const show=(items)=>{
const containers={digital:document.getElementById('digital-addons'),physical:document.getElementById('physical-addons'),support:document.getElementById('support-addons')};
const all=new Map(items.map(x=>[x.id,x]));
const update=()=>{
const chosen=[...selected].map(x=>all.get(x)).filter(Boolean);
document.getElementById('selection-total').textContent=money(chosen.reduce((a,x)=>a+x.price,0));
document.getElementById('selection-summary').textContent=chosen.length?chosen.map(x=>x.name).join(' · '):'Choose any extras above to estimate design costs.';
document.getElementById('quote-link').href='/intake.html?addons='+chosen.map(x=>encodeURIComponent(x.id)).join(',');
};
for(const [group,ids] of Object.entries(groups)){
const box=containers[group];
for(const id of ids){const item=all.get(id);if(!item)continue;
const label=document.createElement('label');label.className='addons-option';
const input=document.createElement('input');input.type='checkbox';input.value=id;input.name='Add_ons[]';input.setAttribute('aria-label',item.name+' — '+money(item.price));
input.addEventListener('change',()=>{input.checked?selected.add(id):selected.delete(id);update();});
const details=document.createElement('span');details.className='addons-description';
const name=document.createElement('strong');name.textContent=item.name;
const sub=document.createElement('small');sub.textContent=item.description;
details.append(name,sub);
const price=document.createElement('b');price.textContent=money(item.price);
label.append(input,details,price);box.append(label);
}}
document.getElementById('clear-selection').addEventListener('click',()=>{selected.clear();document.querySelectorAll('.addons-option input').forEach(x=>x.checked=false);update();});
const query=new URLSearchParams(location.search);
(query.get('addons')||'').split(',').filter(Boolean).forEach(id=>{if(all.has(id)){selected.add(id);const el=document.querySelector('.addons-option input[value="'+CSS.escape(id)+'"]');if(el)el.checked=true;}});
update();
};
fetch('/pricing-catalog.json').then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json();}).then(data=>{if(!Array.isArray(data.addons))throw Error('Add-ons not available');show(data.addons);}).catch(()=>{document.getElementById('addons-error').textContent='The current price list could not be loaded. Please open the price guide or contact the studio to request a quote.';});
})();