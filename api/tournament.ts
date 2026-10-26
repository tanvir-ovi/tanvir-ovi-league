import type {VercelRequest,VercelResponse} from '@vercel/node';
import {database} from '../server/db.js';
import {prepare,bodyObject} from '../server/http.js';
import {ownerSession} from '../server/auth.js';
import {initialTournament,validateTournament} from '../lib/tournament.js';
export default async function handler(req:VercelRequest,res:VercelResponse){
 if(!prepare(req,res))return;
 try{
  const sql=database(),session=await ownerSession(req);
  if(req.method==='GET'){
    const rows=await sql`SELECT data,revision,updated_at FROM tournament WHERE id=1`;
    const history=session?await sql`SELECT action,created_at FROM tournament_history ORDER BY revision DESC LIMIT 8`:[];
    res.status(200).json({tournament:rows[0]?.data??initialTournament(),revision:rows[0]?.revision??0,updatedAt:rows[0]?.updated_at??null,canManage:!!session,signedIn:!!session,history});return;
  }
  if(req.method!=='POST'){res.status(405).json({error:'Method not allowed.'});return;}
  if(!session){res.status(401).json({error:'Sign in as the tournament owner to make changes.'});return;}
  let body;try{body=bodyObject(req);}catch{res.status(400).json({error:'Invalid tournament update.'});return;}
  if(!Number.isInteger(body.revision)||Number(body.revision)<0||typeof body.action!=='string'||body.action.length>140){res.status(400).json({error:'Invalid update.'});return;}
  let next;try{next=validateTournament(body.tournament);}catch(e){res.status(400).json({error:(e as Error).message});return;}
  // Lock and check one revision; write its previous state and update together.
  const result=await sql`WITH previous AS MATERIALIZED (SELECT data,revision FROM tournament WHERE id=1 AND revision=${Number(body.revision)} FOR UPDATE),changed AS (UPDATE tournament SET data=${JSON.stringify(next)}::jsonb,revision=tournament.revision+1,updated_at=now() FROM previous WHERE tournament.id=1 AND tournament.revision=previous.revision RETURNING tournament.revision,tournament.updated_at),audit AS (INSERT INTO tournament_history(revision,action,previous_data,created_at) SELECT changed.revision,${body.action},previous.data,changed.updated_at FROM previous CROSS JOIN changed) SELECT revision,updated_at FROM changed`;
  if(!result.length){res.status(409).json({error:'Newer results were saved elsewhere. Refresh before editing.'});return;}
  res.status(200).json({tournament:next,revision:result[0].revision,updatedAt:result[0].updated_at});
 }catch{res.status(503).json({error:'The scoreboard is temporarily unavailable. Your edits have not been published; please retry.'});}
}
