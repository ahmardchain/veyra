import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sessionAt, completedVenueAnchor } from '../lib/session';
import { priceImmediacy, illustrativeSnapshots } from '../lib/immediacy';
import { parseReview } from '../lib/ai-review';
import { GET, POST } from '../app/api/research/route';
test('holiday and early close follow scheduled cash calendar', () => {
 assert.equal(sessionAt(Date.parse('2026-09-07T15:00:00Z')).session,'closed');
 assert.equal(sessionAt(Date.parse('2026-11-27T17:59:00Z')).session,'open');
 assert.equal(sessionAt(Date.parse('2026-11-27T18:00:00Z')).session,'closed');
});
test('incomplete final-hour candle cannot become an anchor', () => {
 const rows = [['2026-09-17T19:00:00Z',200],['2026-09-16T19:00:00Z',180]].map(([t,p]) => [Date.parse(String(t)),0,0,0,p]);
 assert.equal(completedVenueAnchor(rows,Date.parse('2026-09-17T19:30:00Z')).price,180);
});
test('book ordering and anchor difference cannot change execution cost', () => {
 const book = illustrativeSnapshots.RNVDAUSDT;
 const a = priceImmediacy(book,8000,'buy');
 const b = priceImmediacy({...book, asks:[...book.asks].reverse(),anchor:100},8000,'buy');
 assert.equal(a.averageFill,b.averageFill); assert.equal(a.posture,b.posture);
 assert.throws(()=>priceImmediacy({...book,ask:1},8000,'buy'));
});
test('AI evidence must quote the supplied packet', () => {
 const r={answer:'A conditional research answer.',expectationGap:'Unverified baseline.',counterSignal:'Margin pressure.',invalidation:'Verify the filing.',evidence:[{quote:'margin pressure',interpretation:'A risk in the packet.'}]};
 assert.equal(parseReview(JSON.stringify(r),'We face margin pressure.').evidence.length,1);
 assert.throws(()=>parseReview(JSON.stringify(r),'Demand is strong.'));
});
test('API handles missing config, provider rejection and empty JSON safely', async () => {
 delete process.env.RESEARCH_API_KEY;
 assert.equal((await GET()).status,200);
 assert.equal((await POST(new Request('https://local',{method:'POST'}))).status,503);
 process.env.RESEARCH_API_KEY='test-only'; process.env.RESEARCH_BASE_URL='https://example.invalid/v1'; process.env.RESEARCH_MODEL='mock';
 const original=globalThis.fetch;
 const request=()=>new Request('https://local',{method:'POST',body:JSON.stringify({question:'Explain this event',eventPacket:'Revenue rose with margin pressure.',asset:'rNVDA',eventSource:'illustrative',side:'buy',notional:8000,context:'Illustrative book.'})});
 try {
  globalThis.fetch=async()=>new Response('',{status:401});
  assert.match((await (await POST(request())).json()).error,/credentials/);
  globalThis.fetch=async()=>new Response('',{status:200});
  assert.match((await (await POST(request())).json()).error,/empty/);
 } finally { globalThis.fetch=original; delete process.env.RESEARCH_API_KEY; delete process.env.RESEARCH_BASE_URL; delete process.env.RESEARCH_MODEL; }
});
