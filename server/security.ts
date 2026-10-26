import {createHash,randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
export const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
export const randomToken=()=>randomBytes(32).toString('base64url');
export function equalDigest(a:string,b:string){return /^[a-f0-9]{64}$/i.test(a)&&/^[a-f0-9]{64}$/i.test(b)&&timingSafeEqual(Buffer.from(a,'hex'),Buffer.from(b,'hex'));}
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const hash=await scrypt(password,salt,64) as Buffer;return `${salt}:${hash.toString('hex')}`;}
export async function verifyPassword(password:string,record:string){const [salt,expected]=record.split(':');if(!/^[a-f0-9]{32}$/i.test(salt)||!/^[a-f0-9]{128}$/i.test(expected))return false;const actual=await scrypt(password,salt,64) as Buffer;return timingSafeEqual(actual,Buffer.from(expected,'hex'));}
export function validPassword(password:unknown):password is string{return typeof password==='string'&&password.length>=12&&password.length<=128;}
export function authorizedEmail(email:unknown){return !!process.env.OWNER_EMAIL&&typeof email==='string'&&email.trim().toLowerCase()===process.env.OWNER_EMAIL.toLowerCase();}
