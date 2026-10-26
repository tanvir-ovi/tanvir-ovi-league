import {createServer} from 'node:http';
import tournament from '../api/tournament';
import owner from '../api/owner';
const server=createServer(async(req,res)=>{
 const parts:Buffer[]=[];for await(const part of req){parts.push(Buffer.from(part));if(Buffer.concat(parts).length>60000){res.writeHead(413).end();return;}}
 const request=req as any;request.body=Buffer.concat(parts).toString();const response=res as any;
 response.status=(code:number)=>{res.statusCode=code;return response;};response.json=(value:unknown)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));return response;};
 try{if(req.url?.split('?')[0]==='/api/tournament')await tournament(request,response);else if(req.url?.split('?')[0]==='/api/owner')await owner(request,response);else res.writeHead(404).end();}catch{res.writeHead(500).end();}
});server.listen(3001,'127.0.0.1',()=>console.log('Local API: http://127.0.0.1:3001 (isolated test schema)'));
