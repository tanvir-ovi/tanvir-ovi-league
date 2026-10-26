import test from 'node:test';
import assert from 'node:assert/strict';
import { MATCHES, ROUNDS, initialTournament, standings, activeMatches, bracket, validateTournament, importTournament, playoffWinner } from '../lib/tournament.ts';
const completed=()=>{const s=initialTournament();for(const m of MATCHES)s.scores[m.key]={a:m.a<m.b?3:0,b:m.a<m.b?0:3};return s;};
test('28 original fixtures, seven unique rounds and every opponent once',()=>{
  assert.equal(MATCHES.length,28);assert.equal(new Set(MATCHES.map(m=>[m.a,m.b].sort().join('-'))).size,28);
  for(const round of ROUNDS)assert.equal(new Set(round.flat()).size,8);
  for(let id=1;id<=8;id++)assert.equal(MATCHES.filter(m=>m.a===id||m.b===id).length,7);
});
test('standings calculate points, wins, goals, form and automatic seeds',()=>{
  const s=completed(),{rows,complete,ties}=standings(s);assert.equal(complete,true);assert.deepEqual(ties,[]);
  assert.deepEqual(rows.map(p=>p.id),[1,2,3,4,5,6,7,8]);assert.equal(rows[0].pts,21);assert.equal(rows[0].gf,21);assert.equal(rows[0].gd,21);assert.equal(rows[0].played,7);
  assert.equal(rows.at(-1).l,7);assert.equal(bracket(s).sf1.a,1);assert.equal(bracket(s).sf1.b,4);assert.equal(bracket(s).sf2.a,2);assert.equal(bracket(s).sf2.b,3);
});
test('unplayed league and unresolved multiway draws lock knockouts',()=>{
  const s=initialTournament();assert.equal(bracket(s).ready,false);for(const m of MATCHES)s.scores[m.key]={a:1,b:1};
  assert.equal(standings(s).rows[0].pts,7);assert.equal(standings(s).ties[0].length,8);assert.equal(bracket(s).ready,false);
  s.tieOrder=[8,7,6,5,4,3,2,1];assert.equal(bracket(s).ready,true);assert.equal(bracket(s).sf1.a,8);assert.equal(bracket(s).sf1.b,5);
});
test('semifinals, drawn penalty winners and champion progress correctly',()=>{
  const s=completed();s.playoffs.sf1={playerA:1,playerB:4,a:2,b:2,winner:4};s.playoffs.sf2={playerA:2,playerB:3,a:4,b:0,winner:null};
  assert.equal(bracket(s).final.a,4);assert.equal(bracket(s).final.b,2);s.playoffs.final={playerA:4,playerB:2,a:1,b:1,winner:2};assert.equal(bracket(s).champion,2);assert.doesNotThrow(()=>validateTournament(s));
  s.playoffs.sf1.winner=null;assert.equal(bracket(s).final.a,null);assert.equal(bracket(s).champion,null);assert.throws(()=>validateTournament(s),/Playoff/);
});
test('stale pairing cannot carry a winner into a new bracket',()=>{
  const s=completed();s.playoffs.sf1={playerA:8,playerB:7,a:9,b:0,winner:null};assert.equal(bracket(s).sf1.score,undefined);assert.throws(()=>validateTournament(s),/Playoff/);
  assert.equal(playoffWinner({playerA:1,playerB:2,a:0,b:0,winner:99}),null);
});
test('withdrawal voids every affected game and reinstatement restores scores',()=>{
  const s=completed();s.participants[0].active=false;assert.equal(activeMatches(s).length,21);assert.equal(standings(s).rows.length,7);assert.equal(standings(s).rows[0].id,2);assert.equal(standings(s).rows[0].played,6);assert.equal(standings(s).rows[0].pts,18);assert.equal(Object.keys(s.scores).length,28);
  s.participants[0].active=true;assert.equal(standings(s).rows[0].pts,21);assert.equal(activeMatches(s).length,28);
  s.participants.slice(0,5).forEach(p=>p.active=false);assert.throws(()=>validateTournament(s),/four active/);
});
test('server validation rejects bad scores, duplicate IDs and invalid decisions',()=>{
  for(const n of [-1,100,1.5,'2',null]){const s=initialTournament();s.scores.m1={a:n,b:0};assert.throws(()=>validateTournament(s));}
  const s=initialTournament();s.participants[1].id=1;assert.throws(()=>validateTournament(s));
  const t=completed();t.tieOrder=[1,1];assert.throws(()=>validateTournament(t),/ranking/);
  const x=initialTournament();x.schedule.m1='not-a-date';assert.throws(()=>validateTournament(x),/schedule/);
});
test('JSON backups roundtrip and original Full League exports migrate',()=>{
  const s=completed();assert.deepEqual(importTournament({format:'efootball-arena',version:2,tournament:s}),s);
  const old={format:'efootball-full-league',version:1,state:{scores:s.scores,playoffs:{},tiebreakers:{}}};assert.deepEqual(importTournament(old).scores,s.scores);
  assert.throws(()=>importTournament({}),/Choose an eFootball/);
});
test('partial legacy tiebreakers cannot silently decide unrelated tied players',()=>{
  const s=initialTournament();for(const m of MATCHES)s.scores[m.key]={a:0,b:0};
  const old={format:'efootball-full-league',version:1,state:{scores:s.scores,playoffs:{},tiebreakers:{'1-2':1}}};
  const imported=importTournament(old);assert.equal(bracket(imported).ready,false);assert.deepEqual(imported.tieOrder,[]);
});
