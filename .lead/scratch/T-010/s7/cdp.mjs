import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const PORT=9337, BASE='http://localhost:8137';
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${PORT}`,'--user-data-dir=/tmp/s7chrome','about:blank'],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,2500));
const targets=await (await fetch(`http://localhost:${PORT}/json`)).json();
const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.onopen=r);
let id=0; const pend=new Map(); const logs=[];
ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id)} else if(m.method==='Runtime.exceptionThrown') logs.push('EXC '+m.params.exceptionDetails.text+' '+(m.params.exceptionDetails.exception?.description||'')); else if(m.method==='Runtime.consoleAPICalled'&&['error','warning'].includes(m.params.type)) logs.push(m.params.type+' '+m.params.args.map(a=>a.value||a.description).join(' ')); else if(m.method==='Log.entryAdded'&&m.params.entry.level==='error') logs.push('LOG '+m.params.entry.text+' '+m.params.entry.url);};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
await send('Runtime.enable');await send('Log.enable');await send('Page.enable');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ev=async(expr)=>{const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});return r.result?.result?.value;};
async function open(url,w,h=900){await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<500});logs.length=0;await send('Page.navigate',{url:BASE+url});await sleep(1800);}
async function shot(file,full=true){let clip;if(full){const m=await send('Page.getLayoutMetrics');const cs=m.result.cssContentSize;clip={x:0,y:0,width:cs.width,height:Math.min(cs.height,6000),scale:1};}
 const r=await send('Page.captureScreenshot',{format:'png',clip});writeFileSync(file,Buffer.from(r.result.data,'base64'));}
const report=async(name)=>{const sw=await ev('document.documentElement.scrollWidth');const iw=await ev('window.innerWidth');
 const overs=await ev(`[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>window.innerWidth+1&&getComputedStyle(e).position!=='fixed').slice(0,5).map(e=>e.tagName+'.'+e.className).join(' | ')`);
 console.log(name,'scrollWidth',sw,'vw',iw,sw===iw?'OK':'OVERFLOW',overs||'', 'console:',JSON.stringify(logs));};
const OUT='.lead/attachments/T-010/';
const only=process.argv[2];
for(const w of [390,1200]){
 for(const [n,u] of [['home','/pt/index.html'],['tools-hub','/pt/ferramentas/index.html'],['library','/pt/artigos/index.html'],['article-menu','/pt/artigos/cardapio-semanal-bebe-9-meses.html'],['article-sleep','/pt/artigos/rotina-sono-bebe-por-idade.html'],['article-milestones','/pt/artigos/marcos-desenvolvimento-primeiro-ano-bebe.html'],['meal','/pt/ferramentas/planejador-cardapio-semanal-12-23-meses.html'],['diaper','/pt/ferramentas/calculadora-fraldas-eliminacao.html'],['solids','/pt/ferramentas/planejador-progresso-alimentacao.html'],['feeding','/pt/ferramentas/estimador-quantidade-alimentacao.html'],['nap','/pt/ferramentas/ajudante-transicao-sonecas.html'],['newsletter','/pt/boletim.html']]){
  await open(u,w); await report(`${n}@${w}`); if(n==='home') await shot(`${OUT}after-pt-home-${w}.png`); else await shot(`/tmp/s7-${n}-${w}.png`);
 }
 // wake
 await open('/pt/ferramentas/planejador-janelas-vigilia.html',w);
 await ev(`document.querySelector('form [type=submit]').click()`);await sleep(600);await report('wake-result@'+w);await shot(`/tmp/s7-wake-result-${w}.png`);
 await ev(`(()=>{const i=document.getElementById('age_months');i.value='99';document.querySelector('form [type=submit]').click()})()`);await sleep(600);await report('wake-error@'+w);await shot(`/tmp/s7-wake-error-${w}.png`);
 // growth
 await open('/pt/ferramentas/calculadora-percentis-bebe-oms.html',w);
 await report('growth-empty@'+w);await shot(`/tmp/s7-growth-empty-${w}.png`);
 await ev(`(()=>{const f=document.querySelector('[data-percentile-form]');const set=(n,v)=>{const e=f.elements[n];e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};
  const s=f.querySelector('input[name=sex][value=female]');s.click();const d=new Date();const b=new Date(d);b.setMonth(b.getMonth()-6);const iso=x=>x.toISOString().slice(0,10);set('birth_date',iso(b));set('measurement_date',iso(d));set('weight_kg','7.3');set('length_height_cm','66');f.querySelector('[type=submit]').click();})()`);
 await sleep(1200);await report('growth-result@'+w);
 console.log('  ->',await ev(`document.querySelector('[data-result-percentile]')?.innerText+' | '+document.querySelector('[data-result-sentence]')?.innerText+' | tabs: '+[...document.querySelectorAll('[data-result-tabs] button, .mtabs button')].map(b=>b.innerText).join(',')`));
 await shot(w===390?`${OUT}after-pt-growth-result-390.png`:`/tmp/s7-growth-result-${w}.png`);
 await ev(`(()=>{const t=[...document.querySelectorAll('.mtabs button')].find(b=>/Compr|Alt/i.test(b.innerText));t&&t.click()})()`);await sleep(600);
 console.log('  length ->',await ev(`document.querySelector('[data-result-percentile]')?.innerText+' | '+document.querySelector('[data-result-metric]')?.innerText`));
 // growth error
 await open('/pt/ferramentas/calculadora-percentis-bebe-oms.html',w);
 await ev(`document.querySelector('[data-percentile-form] [type=submit]').click()`);await sleep(600);await report('growth-error@'+w);await shot(`/tmp/s7-growth-error-${w}.png`);
}
chrome.kill();process.exit(0);
