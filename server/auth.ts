import type {VercelRequest} from '@vercel/node';
import {database} from './db.js';
import {digest,randomToken} from './security.js';
export async function ownerSession(req:VercelRequest){
 const authorization=req.headers.authorization;if(!authorization?.startsWith('Bearer '))return null;
 const token=authorization.slice(7);if(!/^[A-Za-z0-9_-]{43}$/.test(token))return null;
 const sql=database();const rows=await sql`SELECT s.token_hash,a.email FROM owner_sessions s JOIN owner_account a ON a.id=1 WHERE s.token_hash=${digest(token)} AND s.expires_at>now() AND a.email=${process.env.OWNER_EMAIL??''}`;
 return rows[0]??null;
}
export async function newSession(){const token=randomToken(),sql=database();await sql`INSERT INTO owner_sessions(token_hash,expires_at) VALUES(${digest(token)},now()+interval '12 hours')`;return token;}
