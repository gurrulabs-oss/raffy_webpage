import fs from 'fs';
// usage: splice(enFile, frFile, [[en,fr],...])  replaces fr <main>..</main> (+ sticky) with EN's, strings swapped
export function splice(enF, frF, pairs, opts={}){
  const en=fs.readFileSync(enF,'utf8'); let fr=fs.readFileSync(frF,'utf8');
  let blk=en.match(/<main[\s\S]*?<\/main>(\s*<div class="sticky-cta"[\s\S]*?<\/button>\s*<\/div>)?/)[0];
  const missed=[];
  for(const [a,b] of pairs){ if(!blk.includes(a)) missed.push(a); blk=blk.split(a).join(b); }
  if(missed.length) console.error('NOT FOUND in',enF,missed);
  fr=fr.replace(/<main[\s\S]*?<\/main>(\s*<div class="sticky-cta"[\s\S]*?<\/button>\s*<\/div>)?/,()=>blk);
  const bc=en.match(/<body class="([^"]*)"/);
  if(bc && !/<body class=/.test(fr)) fr=fr.replace('<body ',`<body class="${bc[1]}" `);
  fs.writeFileSync(frF,fr);
  return blk;
}
