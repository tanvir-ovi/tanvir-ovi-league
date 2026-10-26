import type { Participant } from '../lib/tournament';
export function Crest({player,size=48}:{player:Participant;size?:number}){
  const c=player.color;
  return <svg width={size} height={size*1.14} viewBox="0 0 80 92" fill="none" role="img" aria-label={`${player.alias} crest`}>
    <path d="M40 3 74 15v31c0 22-34 42-34 42S6 68 6 46V15L40 3Z" fill="#101a22" stroke={c} strokeWidth="2"/>
    <path d="M40 10 67 20v26c0 16-27 34-27 34S13 62 13 46V20L40 10Z" fill={c} fillOpacity=".1" stroke={c} strokeOpacity=".3"/>
    <path d="m16 21 48 46M16 38l35 34M29 15l35 34" stroke={c} strokeOpacity=".07" strokeWidth="7"/>
    <g stroke={c} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
      {player.symbol==='crown'&&<><path d="m22 33 9 8 9-16 9 16 9-8-5 25H27Z" fill={c} fillOpacity=".2"/><path d="M28 64h24M33 49h14"/></>}
      {player.symbol==='bolt'&&<path d="m45 23-22 27h15l-3 20 23-30H43l2-17Z" fill={c} fillOpacity=".25"/>}
      {player.symbol==='sun'&&<><circle cx="40" cy="45" r="13"/><path d="M40 22v6m0 34v6M17 45h6m34 0h6M24 29l4 4m24 24 4 4m0-32-4 4M28 57l-4 4"/><path d="m40 36 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill={c}/></>}
      {player.symbol==='sword'&&<><path d="m25 64 29-33 2-10-10 4-26 36m3-15 19 17m-10-6-7 10"/><path d="m55 64-29-33-2-10 10 4 26 36m-3-15L38 63m10-6 7 10"/></>}
      {player.symbol==='mountain'&&<><path d="m17 62 23-35 23 35H17Z" fill={c} fillOpacity=".18"/><path d="m31 40 9 7 9-7M27 62l13-17 13 17M40 19v-4"/></>}
      {player.symbol==='target'&&<><circle cx="40" cy="45" r="20"/><circle cx="40" cy="45" r="11"/><path d="M40 20v10m0 30v10M15 45h10m30 0h10m-25-6v12m-6-6h12"/></>}
      {player.symbol==='wing'&&<><path d="m40 65-6-16-16-8 3-14 18 15 1-20 5 17 16-12-3 15-14 10-4 13Z" fill={c} fillOpacity=".22"/><path d="m24 40 14 8m18-8-13 8m-3 4v11"/></>}
      {player.symbol==='wolf'&&<><path d="m21 26 16 9h6l16-9-3 25-16 17-16-17-3-25Z" fill={c} fillOpacity=".2"/><path d="m24 43 11 5-6 3m27-8-11 5 6 3m-16 4h10l-5 7-5-7Z"/></>}
    </g><path d="m36 76 4-2 4 2-4 2Z" fill={c}/>
  </svg>;
}
export function TrophyArt(){return <svg viewBox="0 0 360 420" fill="none" aria-hidden="true"><defs><linearGradient id="cup" x1="60" y1="0" x2="300" y2="400" gradientUnits="userSpaceOnUse"><stop stopColor="#f1ffc2"/><stop offset=".45" stopColor="#c5f44a"/><stop offset="1" stopColor="#567423"/></linearGradient><linearGradient id="glass"><stop stopColor="#c5f44a" stopOpacity=".35"/><stop offset="1" stopColor="#c5f44a" stopOpacity=".02"/></linearGradient></defs><ellipse cx="180" cy="365" rx="111" ry="24" fill="#c5f44a" fillOpacity=".07"/><g stroke="url(#cup)" strokeWidth="3"><path d="M102 66h156l-17 141c-5 37-34 64-61 64s-56-27-61-64L102 66Z" fill="url(#glass)"/><path d="M106 90H59v54c0 47 30 70 67 70m128-124h47v54c0 47-30 70-67 70M103 66l77 205 77-205M124 66l56 205 56-205M151 66l29 205 29-205M111 130h138M117 182h126M136 237h88M164 268v54h32v-54m-48 54h64l19 29H129l19-29Z"/><path d="M125 355h110v13H125Z" fill="url(#glass)"/></g><path d="m180 109 10 22 24 3-17 17 4 25-21-12-21 12 4-25-17-17 24-3 10-22Z" fill="#d5fc75"/><g fill="#c5f44a"><circle cx="63" cy="252" r="2"/><circle cx="284" cy="52" r="3"/><circle cx="292" cy="278" r="2"/></g></svg>;}
