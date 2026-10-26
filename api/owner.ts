import type {VercelRequest,VercelResponse} from '@vercel/node';
import {database} from '../server/db.js';
import {prepare,bodyObject} from '../server/http.js';
import {authorizedEmail,digest,equalDigest,hashPassword,validPassword,verifyPassword} from '../server/security.js';
import {newSession,ownerSession} from '../server/auth.js';
export default async function handler(req:VercelRequest,res:VercelResponse){
 if(!prepare(req,res))return;
 if(req.method!=='POST'){res.status(405).json({error:'Use the owner sign-in form.'});return;}
 try{
  const body=bodyObject(req),sql=database();
  if(body.action==='logout'){const session=await ownerSession(req);if(session)await sql`DELETE FROM owner_sessions WHERE token_hash=${session.token_hash}`;res.status(200).json({ok:true});return;}
  const ip=digest(String(req.headers['x-forwarded-for']??req.socket?.remoteAddress??'unknown').split(',')[0]);
  const limits=await sql`INSERT INTO owner_attempts(ip_hash,attempts,window_start) VALUES(${ip},1,now()) ON CONFLICT(ip_hash) DO UPDATE SET attempts=CASE WHEN owner_attempts.window_start<now()-interval '15 minutes' THEN 1 ELSE owner_attempts.attempts+1 END,window_start=CASE WHEN owner_attempts.window_start<now()-interval '15 minutes' THEN now() ELSE owner_attempts.window_start END RETURNING attempts`;
  if(limits[0].attempts>8){res.status(429).json({error:'Too many sign-in attempts. Wait 15 minutes and try again.'});return;}
  if(!authorizedEmail(body.email)||!validPassword(body.password)){res.status(401).json({error:'Check your owner email and password.'});return;}
  if(body.action==='activate'){
    if(typeof body.token!=='string'||!equalDigest(digest(body.token),process.env.OWNER_SETUP_TOKEN_HASH??'')){res.status(403).json({error:'This activation link is not valid.'});return;}
    const passwordHash=await hashPassword(body.password);
    const created=await sql`INSERT INTO owner_account(id,email,password_hash) VALUES(1,${process.env.OWNER_EMAIL!},${passwordHash}) ON CONFLICT(id) DO NOTHING RETURNING id`;
    if(!created.length){res.status(409).json({error:'The owner account is already activated. Sign in with your password.'});return;}
  }else if(body.action==='login'){
    const account=await sql`SELECT password_hash FROM owner_account WHERE id=1 AND email=${process.env.OWNER_EMAIL!}`;
    const valid=await verifyPassword(body.password,account[0]?.password_hash??'00000000000000000000000000000000:'+('0'.repeat(128)));
    if(!account.length||!valid){res.status(401).json({error:'Check your owner email and password. Use your private activation link if this is your first visit.'});return;}
  }else{res.status(400).json({error:'Invalid sign-in action.'});return;}
  const token=await newSession();await sql`DELETE FROM owner_attempts WHERE ip_hash=${ip}`;
  res.status(200).json({token});
 }catch{res.status(503).json({error:'Owner sign in is unavailable. Please try again.'});}
}
