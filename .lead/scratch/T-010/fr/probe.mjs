import {spawn} from 'child_process';
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--remote-debugging-port=9342','--user-data-dir=/tmp/fr-chrome2','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
for(let i=0;i<50;i++){try{await fetch('http://127.0.0.1:9342/json/version');break}catch{await sleep(200)}}
const tabs=await (await fetch('http://127.0.0.1:9342/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const p=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(p.has(m.id)){p.get(m.id)(m);p.delete(m.id)}};
const send=(method,params={})=>new Promise(r=>{const i=++id;p.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
const ev=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true})).result.result.value;
const [path,w]=[process.argv[2],+process.argv[3]];
await send('Emulation.setDeviceMetricsOverride',{width:w,height:900,deviceScaleFactor:1,mobile:true});
await send('Page.navigate',{url:'http://localhost:8071'+path});await sleep(1800);
if(process.argv[4]==='calc'){await ev(`(()=>{const f=document.querySelector('[data-percentile-form]');f.querySelector('input[name=sex][value=female]').click();const s=(n,v)=>{const e=f.querySelector('[name='+n+']');e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))};s('birth_date','2026-04-21');s('measurement_date','2026-10-21');s('weight_kg','7.3');s('length_height_cm','66');f.querySelector('button[type=submit]').click()})()`);await sleep(1200);}
console.log(await ev(`JSON.stringify([...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>window.innerWidth+1&&e.getBoundingClientRect().width>0).slice(0,10).map(e=>e.tagName+'.'+e.className+' '+Math.round(e.getBoundingClientRect().left)+'-'+Math.round(e.getBoundingClientRect().right)))`), await ev('innerWidth+" "+document.documentElement.scrollWidth'));
chrome.kill();process.exit(0);
