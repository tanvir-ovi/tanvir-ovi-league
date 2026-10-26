import type {VercelRequest,VercelResponse} from '@vercel/node';
export function prepare(req:VercelRequest,res:VercelResponse){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Vary','Origin');
 const origin=req.headers.origin;
 const allowed=[process.env.PUBLIC_ORIGIN,process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:null,'https://tanvir-ovi-league.vercel.app'];
 if(process.env.NODE_ENV!=='production')allowed.push('http://127.0.0.1:5173','http://localhost:5173');
 const validOrigin=!origin||allowed.includes(origin);
 if(origin&&validOrigin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, X-Arena-Request');res.setHeader('Access-Control-Max-Age','600');}
 if(req.method==='OPTIONS'){res.status(validOrigin?204:403).end();return false;}
 if(req.method==='POST'&&(!validOrigin||req.headers['x-arena-request']!=='1'||!req.headers['content-type']?.includes('application/json'))){res.status(403).json({error:'This request is not allowed.'});return false;}
 return true;
}
export function bodyObject(req:VercelRequest){let body=req.body;if(typeof body==='string'){if(body.length>60000)throw new Error('Request too large.');body=JSON.parse(body);}if(!body||typeof body!=='object'||JSON.stringify(body).length>60000)throw new Error('Invalid request.');return body as Record<string,unknown>;}
