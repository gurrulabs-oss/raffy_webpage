import assert from 'node:assert/strict';
import { countWords, minutesFor, syncFile } from './read_time.mjs';

const words = (n) => Array(n).fill('word').join(' ');
const html = `<main><article class="prose">
<details class="toc-mobile card"><details><summary>x</summary></details> ${words(50)}</details>
<p>Hello &amp; welcome — 3 ok</p><script>var a = ${words(20)}</script>
<div class="appx"><div>${words(30)}</div>${words(30)}</div>
<section class="sources"><section>${words(9)}</section>${words(9)}</section>
<p>más ñandú</p></article><p>${words(99)}</p></main>`;
assert.equal(countWords(html), 6); // Hello welcome 3 ok más ñandú; '&' and '—' dropped, exclusions and tail ignored
assert.equal(minutesFor(0), 1);
assert.equal(minutesFor(200), 1);
assert.equal(minutesFor(201), 2);

const card = '<a class="card a-card" href="x.html"><div class="a-meta"><span>1 min read</span></div></a>' +
  '<div class="a-meta"><span>1 min read</span><a href="x.html" class="article-link">Go</a></div>';
const page = '<span data-minutes="1">1 min read</span>' + card;
const [out, issues] = syncFile(page, 'x.html', { 'x.html': 5 });
assert.equal(issues.length, 4);
assert.equal(out.match(/5 min read/g).length, 3);
assert.deepEqual(syncFile(out, 'x.html', { 'x.html': 5 })[1], []);
console.log('ok');
