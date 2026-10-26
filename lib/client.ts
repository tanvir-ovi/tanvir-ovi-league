export const asset=(path:string)=>`${import.meta.env.BASE_URL}${path.replace(/^\//,'')}`;
export const apiUrl=(path:string)=>`${(import.meta.env.VITE_API_BASE||'').replace(/\/$/,'')}${path}`;
const sessionKey='tanbirobi-owner-session';
export function ownerToken(){try{return sessionStorage.getItem(sessionKey);}catch{return null;}}
export function setOwnerToken(token:string|null){if(token)sessionStorage.setItem(sessionKey,token);else sessionStorage.removeItem(sessionKey);}
export function authHeaders():Record<string,string>{const token=ownerToken();return token?{Authorization:`Bearer ${token}`}:{ };}
