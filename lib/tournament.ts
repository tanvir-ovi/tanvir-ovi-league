export type Participant = { id: number; name: string; alias: string; color: string; symbol: string; active: boolean };
export type Score = { a: number; b: number };
export type Playoff = Score & { playerA: number; playerB: number; winner: number | null };
export type Tournament = {
  version: 2; title: string; announcement: string; participants: Participant[];
  scores: Record<string, Score>; playoffs: Record<string, Playoff>;
  tieOrder: number[]; schedule: Record<string, string>;
};
export const PLAYERS: Participant[] = [
  { id: 1, name: 'Tanvir Ovi', alias: 'OVI UNITED', color: '#c5f44a', symbol: 'crown', active: true },
  { id: 2, name: 'Yasin Arafat', alias: 'ARAFAT ROVERS', color: '#73bbff', symbol: 'bolt', active: true },
  { id: 3, name: 'Ahsan Sami', alias: 'SAMI ATHLETIC', color: '#fb9f63', symbol: 'sun', active: true },
  { id: 4, name: "Naf'az Mohammad", alias: 'NAFAZ KNIGHTS', color: '#c29bff', symbol: 'sword', active: true },
  { id: 5, name: 'Salmun Tamim', alias: 'TAMIM TITANS', color: '#5ce0c3', symbol: 'mountain', active: true },
  { id: 6, name: 'AL Mahmud Soikat', alias: 'SOIKAT STRIKERS', color: '#ff7c9b', symbol: 'target', active: true },
  { id: 7, name: 'Rahman Nirob', alias: 'NIROB PHOENIX', color: '#ffd875', symbol: 'wing', active: true },
  { id: 8, name: 'Sajedul Islam Tanzim', alias: 'TANZIM WOLVES', color: '#a1aaff', symbol: 'wolf', active: true },
];
export const ROUNDS = [[[1,8],[2,7],[3,6],[4,5]],[[1,7],[8,6],[2,5],[3,4]],[[1,6],[7,5],[8,4],[2,3]],[[1,5],[6,4],[7,3],[8,2]],[[1,4],[5,3],[6,2],[7,8]],[[1,3],[4,2],[5,8],[6,7]],[[1,2],[3,8],[4,7],[5,6]]];
export const MATCHES = ROUNDS.flatMap((round,r) => round.map(([a,b],j) => ({ key: `m${r*4+j+1}`, round: r+1, index: r*4+j+1, a, b })));
export const initialTournament = (): Tournament => ({version:2,title:'THE FULL LEAGUE',announcement:'Eight contenders. Seven matchdays. One champion. Welcome to the arena.',participants:structuredClone(PLAYERS),scores:{},playoffs:{},tieOrder:[],schedule:{}});
export const validScore = (n: unknown): n is number => Number.isInteger(n) && Number(n)>=0 && Number(n)<=99;
export const activeMatches = (s: Tournament) => MATCHES.filter(m => s.participants.find(p=>p.id===m.a)?.active && s.participants.find(p=>p.id===m.b)?.active);
export type Standing = Participant & { played:number; w:number; d:number; l:number; gf:number; ga:number; gd:number; pts:number; form:string[] };
export function standings(s: Tournament): { rows: Standing[]; ties: number[][]; complete: boolean } {
  const rows = s.participants.filter(p=>p.active).map(p=>({...p,played:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0,form:[] as string[]}));
  const matches=activeMatches(s);
  for (const m of matches) {
    const v=s.scores[m.key]; if(!v) continue;
    const a=rows.find(p=>p.id===m.a)!, b=rows.find(p=>p.id===m.b)!;
    a.played++; b.played++; a.gf+=v.a; a.ga+=v.b; b.gf+=v.b; b.ga+=v.a;
    if(v.a===v.b) { a.d++;b.d++;a.pts++;b.pts++;a.form.push('D');b.form.push('D'); }
    else { const win=v.a>v.b?a:b,lose=v.a>v.b?b:a;win.w++;win.pts+=3;lose.l++;win.form.push('W');lose.form.push('L'); }
  }
  rows.forEach(p=>p.gd=p.gf-p.ga);
  const basic=(a:Standing,b:Standing)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf;
  rows.sort(basic);
  const ties:number[][]=[];
  for(let i=0;i<rows.length;) {
    let end=i+1;while(end<rows.length && basic(rows[i],rows[end])===0)end++;
    const group=rows.slice(i,end);
    if(group.length===2) {
      const m=matches.find(m=>[m.a,m.b].includes(group[0].id)&&[m.a,m.b].includes(group[1].id));
      const v=m?s.scores[m.key]:null;
      if(v&&v.a!==v.b) { const winner=v.a>v.b?m!.a:m!.b;group.sort(a=>a.id===winner?-1:1);rows.splice(i,group.length,...group);i=end;continue; }
    }
    if(group.length>1) {
      if(group.every(p=>s.tieOrder.includes(p.id))) group.sort((a,b)=>s.tieOrder.indexOf(a.id)-s.tieOrder.indexOf(b.id));
      else ties.push(group.map(p=>p.id));
      rows.splice(i,group.length,...group);
    }
    i=end;
  }
  return {rows,ties,complete:matches.every(m=>!!s.scores[m.key])};
}
export function playoffWinner(p?: Playoff): number | null {
  if(!p)return null;
  return p.a>p.b?p.playerA:p.b>p.a?p.playerB:([p.playerA,p.playerB].includes(p.winner!)?p.winner:null);
}
export function bracket(s:Tournament) {
  const {rows,ties,complete}=standings(s);
  const ready=complete&&rows.length>=4&&ties.length===0;
  const pair=(key:string,a?:number,b?:number)=>{
    const score=s.playoffs[key];
    return {key,a:a??null,b:b??null,score:score&&score.playerA===a&&score.playerB===b?score:undefined};
  };
  const sf1=pair('sf1',ready?rows[0].id:undefined,ready?rows[3].id:undefined);
  const sf2=pair('sf2',ready?rows[1].id:undefined,ready?rows[2].id:undefined);
  const final=pair('final',playoffWinner(sf1.score)??undefined,playoffWinner(sf2.score)??undefined);
  return {ready,sf1,sf2,final,champion:playoffWinner(final.score)};
}
const bounded=(v:unknown,max:number)=>typeof v==='string'&&v.trim().length>0&&v.trim().length<=max;
export function validateTournament(input:unknown):Tournament {
  if(!input||typeof input!=='object')throw new Error('Invalid tournament file.');
  const s=input as Tournament;
  if(s.version!==2||!bounded(s.title,60)||typeof s.announcement!=='string'||s.announcement.length>500)throw new Error('Check the tournament title and announcement.');
  if(!Array.isArray(s.participants)||s.participants.length!==8||new Set(s.participants.map(p=>p.id)).size!==8)throw new Error('The tournament must contain the original eight participant IDs.');
  for(const p of s.participants)if(!PLAYERS.some(o=>o.id===p.id)||!bounded(p.name,60)||!bounded(p.alias,30)||typeof p.active!=='boolean'||!/^#[0-9a-f]{6}$/i.test(p.color)||!PLAYERS.some(o=>o.symbol===p.symbol))throw new Error('Invalid participant details.');
  if(s.participants.filter(p=>p.active).length<4)throw new Error('Keep at least four active participants.');
  if(!s.scores||!s.playoffs||!s.schedule||!Array.isArray(s.tieOrder))throw new Error('Missing tournament data.');
  const next:Tournament={version:2,title:s.title.trim(),announcement:s.announcement,participants:s.participants.map(p=>({id:p.id,name:p.name.trim(),alias:p.alias.trim(),color:p.color,symbol:p.symbol,active:p.active})),scores:{},playoffs:{},tieOrder:[],schedule:{}};
  for(const [key,v] of Object.entries(s.scores)){if(!MATCHES.some(m=>m.key===key)||!v||!validScore(v.a)||!validScore(v.b))throw new Error('Scores must be whole numbers from 0 to 99.');next.scores[key]={a:v.a,b:v.b};}
  if(new Set(s.tieOrder).size!==s.tieOrder.length||s.tieOrder.some(id=>!PLAYERS.some(p=>p.id===id)))throw new Error('Invalid ranking order.');next.tieOrder=s.tieOrder;
  for(const [key,date] of Object.entries(s.schedule)){if(!MATCHES.some(m=>m.key===key)||typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(date)||!Number.isFinite(Date.parse(date)))throw new Error('Invalid match schedule.');next.schedule[key]=new Date(date).toISOString();}
  for(const key of ['sf1','sf2','final']) {
    const v=s.playoffs[key];if(!v)continue;
    const pair=bracket(next)[key as 'sf1'|'sf2'|'final'];
    if(!pair.a||!pair.b||v.playerA!==pair.a||v.playerB!==pair.b||!validScore(v.a)||!validScore(v.b)||!(v.winner===null||[pair.a,pair.b].includes(v.winner)))throw new Error('Playoff scores do not match the current qualifying players.');
    next.playoffs[key]={playerA:v.playerA,playerB:v.playerB,a:v.a,b:v.b,winner:v.a===v.b?v.winner:null};
  }
  return next;
}
export function importTournament(input:unknown):Tournament {
  const data=input as Record<string,any>;
  if(data?.format==='efootball-full-league'&&data.version===1&&data.state) {
    const s=initialTournament();
    for(const m of MATCHES){const v=data.state.scores?.[m.key];if(v&&validScore(v.a)&&validScore(v.b))s.scores[m.key]={a:v.a,b:v.b};}
    const legacy=data.state.tiebreakers||{};
    const edges=Object.entries(legacy).map(([k,w])=>({ids:k.split('-').map(Number),winner:Number(w)}));
    for(const edge of edges)if(edge.ids.length!==2||new Set(edge.ids).size!==2||!edge.ids.every(id=>PLAYERS.some(p=>p.id===id))||!edge.ids.includes(edge.winner))throw new Error('The old backup contains invalid tiebreakers.');
    for(const group of standings(s).ties){
      const ids=[...group],order:number[]=[];let resolved=true;
      while(ids.length){
        const candidates=ids.filter(id=>!edges.some(e=>e.ids.includes(id)&&e.winner!==id&&ids.includes(e.winner)));
        if(candidates.length===0)throw new Error('The old backup contains conflicting tiebreakers.');
        if(candidates.length!==1){resolved=false;break;}
        const id=candidates[0];order.push(id);ids.splice(ids.indexOf(id),1);
      }
      if(resolved)s.tieOrder.push(...order);
    }
    for(const key of ['sf1','sf2','final']){const v=data.state.playoffs?.[key],pair=bracket(s)[key as 'sf1'|'sf2'|'final'];if(v&&pair.a===v.playerA&&pair.b===v.playerB&&validScore(v.a)&&validScore(v.b))s.playoffs[key]={...v,winner:v.winner??null};}
    return validateTournament(s);
  }
  if(data?.format==='efootball-arena'&&data.version===2)return validateTournament(data.tournament);
  throw new Error('Choose an eFootball Arena backup or your original Full League JSON backup.');
}
