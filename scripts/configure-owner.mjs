import{randomBytes,createHash}from'node:crypto';
import{mkdir,writeFile,appendFile}from'node:fs/promises';
import{spawnSync}from'node:child_process';
const token=randomBytes(32).toString('base64url'),hash=createHash('sha256').update(token).digest('hex');
const values={OWNER_EMAIL:'tanvirovi6@gmail.com',OWNER_SETUP_TOKEN_HASH:hash,PUBLIC_ORIGIN:'https://tanvir-ovi.github.io'};
for(const[name,value]of Object.entries(values)){
 const result=spawnSync('vercel.cmd',['env','add',name,'--environment','production',name==='PUBLIC_ORIGIN'?'--no-sensitive':'--sensitive','--force','--yes'],{shell:true,input:value,encoding:'utf8',windowsHide:true});
 if(result.status!==0)throw new Error(`Could not configure ${name}: ${result.stderr}`);console.log(`${name} configured securely.`);
}
await appendFile('.env.local','\n'+Object.entries(values).map(([k,v])=>`${k}=${JSON.stringify(v)}`).join('\n')+'\n');
await mkdir('private',{recursive:true});
await writeFile('private/activate-owner.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1"><title>tanvir-ovi — Private owner activation</title><style>body{background:#0b1016;color:#f1f4f5;font:16px/1.8 Arial,sans-serif;max-width:580px;margin:12vh auto;padding:24px}h1{color:#c5f44a}a{display:inline-block;background:#c5f44a;color:#0b1016;text-decoration:none;font-weight:bold;padding:15px 22px;margin:16px 0}small{color:#8da0ab}</style><h1>Make the arena yours.</h1><p>Your owner account is <b>tanvirovi6@gmail.com</b>. Follow this private link and choose a password of at least 12 characters.</p><a href="https://tanvir-ovi.github.io/tanvir-ovi-league/#activate=${token}" rel="noreferrer">Activate my owner account →</a><p><small>This activation link works once. Keep this file private until you finish setting your password. Your password will never be included in the website source.</small></p></html>`);
console.log('Private activation page created. No password was chosen or stored.');
