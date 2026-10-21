import {spawn} from 'child_process';
import fs from 'fs';
const PORT=9341, SRV='http://localhost:8071';
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${PORT}`,'--user-data-dir=/tmp/fr-chrome','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ver; for(let i=0;i<50;i++){try{ver=await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();break}catch{await sleep(200)}}
const tabs=await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();const logs=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id)}
 else if(m.method==='Runtime.exceptionThrown')logs.push('EXC '+m.params.exceptionDetails.text+' '+(m.params.exceptionDetails.exception?.description||''));
 else if(m.method==='Runtime.consoleAPICalled'&&['error','assert'].includes(m.params.type))logs.push('CONSOLE '+m.params.args.map(a=>a.value||a.description).join(' '));
 else if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')logs.push('LOG '+m.params.entry.text+' '+(m.params.entry.url||''));};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
const ev=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true})).result?.result?.value;
await send('Runtime.enable');await send('Log.enable');await send('Page.enable');
async function open(path,w,h=900){await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<500});logs.length=0;await send('Page.navigate',{url:SRV+path});await sleep(1800);}
async function shot(name,full=true){
 const sw=await ev('document.documentElement.scrollHeight');
 const w=await ev('window.innerWidth');
 await send('Emulation.setDeviceMetricsOverride',{width:w,height:Math.min(sw,6000),deviceScaleFactor:1,mobile:w<500});await sleep(300);
 const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(name,Buffer.from(r.result.data,'base64'));}
const overflow=async()=>ev('[document.documentElement.scrollWidth, window.innerWidth]');
const out={};
const pages=['/fr/','/fr/outils/','/fr/outils/calculateur-percentiles-bebe-oms.html','/fr/outils/planificateur-fenetres-eveil.html','/fr/outils/assistant-transition-siestes.html','/fr/outils/calculateur-couches-elimination.html','/fr/outils/estimateur-quantites-alimentation.html','/fr/outils/planificateur-progression-diversification.html','/fr/outils/planificateur-repas-hebdomadaire-12-23-mois.html','/fr/articles/','/fr/articles/menu-hebdomadaire-bebe-9-mois.html','/fr/articles/etapes-developpement-premiere-annee-bebe.html','/fr/articles/routine-sommeil-bebe-par-age.html','/fr/newsletter.html'];
for(const w of [390,1200]) for(const p of pages){await open(p,w);const [sw,iw]=await overflow();console.log(w,p,sw===iw?'ok':`OVERFLOW ${sw}>${iw}`,logs.length?logs.join(' | '):'');}
const A='/Users/unaidiaz-chiron/AndroidStudioProjects/raffy_webpage/.lead/attachments/T-010/';
for(const w of [390,1200]){
 await open('/fr/',w);await shot(A+`after-fr-home-${w}.png`);
 await open('/fr/outils/',w);await shot(`/tmp/fr-hub-${w}.png`);
 // growth
 await open('/fr/outils/calculateur-percentiles-bebe-oms.html',w);await shot(`/tmp/fr-growth-empty-${w}.png`);
 const d=new Date();const iso=x=>x.toISOString().slice(0,10);const m=new Date(d);const b=new Date(d);b.setMonth(b.getMonth()-6);
 await ev(`(()=>{const f=document.querySelector('[data-percentile-form]');f.querySelector('input[name=sex][value=female]').click();const s=(n,v)=>{const e=f.querySelector('[name='+n+']');e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};s('birth_date','${iso(b)}');s('measurement_date','${iso(m)}');s('weight_kg','7.3');s('length_height_cm','66');f.querySelector('button[type=submit]').click();})()`);
 await sleep(1200);
 console.log(w,'growth result:',await ev(`document.querySelector('[data-state-result]').innerText.replace(/\\n/g,' / ')`),'| tabs',await ev(`[...document.querySelectorAll('[data-result-tabs] [role=tab]')].map(t=>t.innerText).join(',')`),logs.join('|'));
 console.log(w,'sticky',await ev(`getComputedStyle(document.querySelector('.sticky-cta')).display+' '+document.querySelector('.sticky-cta').className`));
 await shot(A+`after-fr-growth-result-${w}.png`);
 // length tab
 const len=await ev(`(()=>{const t=[...document.querySelectorAll('[data-result-tabs] [role=tab]')].find(t=>/Long|Taille/.test(t.innerText));if(t){t.click();return 1}return 0})()`);await sleep(500);
 console.log(w,'length tab',len,await ev(`document.querySelector('[data-state-result]').innerText.replace(/\\n/g,' / ')`));
 const [sw,iw]=await overflow();console.log(w,'growth result overflow',sw,iw);
 // error
 await open('/fr/outils/calculateur-percentiles-bebe-oms.html',w);
 await ev(`document.querySelector('[data-percentile-form] button[type=submit]').click()`);await sleep(600);await shot(`/tmp/fr-growth-error-${w}.png`);
 console.log(w,'growth err',await ev(`document.querySelector('[data-state-error]').hidden+' '+[...document.querySelectorAll('.err')].map(e=>e.innerText).filter(Boolean).join(' / ')+' '+document.querySelector('[data-form-error]').innerText`));
 // wake
 await open('/fr/outils/planificateur-fenetres-eveil.html',w);
 await ev(`document.querySelector('form button[type=submit]').click()`);await sleep(700);await shot(A+`after-fr-wake-result-${w}.png`);
 console.log(w,'wake result',await ev(`document.querySelector('[data-state=result]').innerText.replace(/\\n/g,' / ').slice(0,300)`),logs.join('|'));
 await open('/fr/outils/planificateur-fenetres-eveil.html',w);
 await ev(`(()=>{const i=document.querySelector('#age_months');i.value='99';document.querySelector('form button[type=submit]').click()})()`);await sleep(700);await shot(A+`after-fr-wake-error-${w}.png`);
 console.log(w,'wake err',await ev(`document.querySelector('.gtool').innerHTML.length+' '+getComputedStyle(document.querySelector('[data-state=error]')).display+' '+document.querySelector('#age_months-err').innerText`),logs.join('|'));
 await open('/fr/articles/menu-hebdomadaire-bebe-9-mois.html',w);await shot(`/tmp/fr-art-${w}.png`);
 await open('/fr/articles/',w);await shot(`/tmp/fr-lib-${w}.png`);
}
ws.close();chrome.kill();process.exit(0);
