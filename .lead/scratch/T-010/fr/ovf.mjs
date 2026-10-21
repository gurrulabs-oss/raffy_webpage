import {spawn} from 'child_process';
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--remote-debugging-port=9343','--user-data-dir=/tmp/fr-chrome3','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
for(let i=0;i<50;i++){try{await fetch('http://127.0.0.1:9343/json/version');break}catch{await sleep(200)}}
const tabs=await (await fetch('http://127.0.0.1:9343/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const p=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(p.has(m.id)){p.get(m.id)(m);p.delete(m.id)}};
const send=(method,params={})=>new Promise(r=>{const i=++id;p.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
const ev=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true})).result.result.value;
const L={en:['tools',['baby-growth-percentile-calculator-who','wake-window-planner','nap-transition-helper','solids-progression-planner','diaper-output-tracker','feeding-quantity-estimator']],
es:['herramientas',['calculadora-percentiles-bebe-oms','planificador-ventanas-sueno','ayudante-transicion-siestas','planificador-progresion-solidos','calculadora-panales-eliminacion','estimador-cantidad-alimentacion']],
fr:['outils',['calculateur-percentiles-bebe-oms','planificateur-fenetres-eveil','assistant-transition-siestes','planificateur-progression-diversification','calculateur-couches-elimination','estimateur-quantites-alimentation']],
pt:['ferramentas',['calculadora-percentis-bebe-oms','planejador-janelas-vigilia','ajudante-transicao-sonecas','planejador-progresso-alimentacao','calculadora-fraldas-eliminacao','estimador-quantidade-alimentacao']]};
const measure=`(()=>{const g=document.querySelector('.gtool');const gr=g.getBoundingClientRect().right;let worst=0,who='';for(const e of g.querySelectorAll('*')){const r=e.getBoundingClientRect();if(!r.width||e.closest('[hidden]')||e.closest('[data-carousel-track]'))continue;if(getComputedStyle(e).position==='absolute')continue;const o=r.right-gr;if(o>worst){worst=o;who=e.tagName+'.'+e.className}}let clip=[];for(const e of g.querySelectorAll('button,a.btn,label,.big-text,.tag,h2,h3')){if(e.closest('[hidden]'))continue;if(e.scrollWidth>e.clientWidth+1&&e.clientWidth>0)clip.push(e.tagName+':'+e.innerText.slice(0,15))}return Math.round(worst*10)/10+' '+who+' clip='+clip.join(',')+' | pane '+Math.round(document.querySelector('.pane').getBoundingClientRect().width)+' vw '+innerWidth})()`;
const calc=`(()=>{const f=document.querySelector('[data-percentile-form]');f.querySelector('input[name=sex][value=female]').click();const s=(n,v)=>{const e=f.querySelector('[name='+n+']');e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))};s('birth_date','2026-04-21');s('measurement_date','2026-10-21');s('weight_kg','7.3');s('length_height_cm','66');f.querySelector('button[type=submit]').click()})()`;
const widths=process.argv.slice(2).map(Number);
for(const w of widths)for(const [loc,[dir,pages]] of Object.entries(L))for(const [i,pg] of pages.entries()){
 const states=i==0?['empty','result']:['empty','result','error'];
 for(const st of states){
  await send('Emulation.setDeviceMetricsOverride',{width:w,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:`http://localhost:8071/${loc}/${dir}/${pg}.html`});await sleep(1300);
  if(st==='result'){await ev(i==0?calc:`document.querySelector('form button[type=submit]').click()`);await sleep(900);}
  if(st==='error'&&i>0){await ev(`(()=>{document.querySelector('#age_months').value='99';document.querySelector('form button[type=submit]').click()})()`);await sleep(500);}
  console.log(w,loc,i==0?'growth':pg.slice(0,14),st,await ev(measure));
 }}
chrome.kill();process.exit(0);
