const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {WebSocketServer,WebSocket}=require('ws');
const rooms = new Map();
const html=fs.readFileSync(path.join(__dirname,'index.html'));
const server=http.createServer((req,res)=>{if(req.url==='/health'){res.writeHead(200);return res.end('ok')}if(req.url==='/'||req.url.startsWith('/?')){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(html)}res.writeHead(404);res.end('Not found')});
const wss=new WebSocketServer({server});
function send(ws,obj){if(ws&&ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(obj))}
function broadcast(room,obj){room.players.forEach(p=>send(p,obj))}
function state(room){broadcast(room,{type:'state',code:room.code,round:room.round,players:room.players.length,submitted:room.answers.map(Boolean),history:room.history,finished:room.finished})}
function clean(s){return String(s||'').normalize('NFKC').trim().replace(/\s+/g,' ').slice(0,40)}
function code(){let c;do{c=crypto.randomBytes(4).toString('hex').slice(0,6).toUpperCase()}while(rooms.has(c));return c}
wss.on('connection',ws=>{ws.room=null;ws.index=-1;ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch{return}if(!m||typeof m!=='object')return;
if(m.type==='create'||m.type==='join'){
if(ws.room)return send(ws,{type:'error',message:'你已经在房间中'});
let room;if(m.type==='create'){const c=code();room={code:c,players:[],answers:[null,null],history:[],round:1,finished:false};rooms.set(c,room)}else{room=rooms.get(String(m.code||'').trim().toUpperCase());if(!room)return send(ws,{type:'error',message:'房间不存在或已关闭'});if(room.players.length>=2)return send(ws,{type:'error',message:'房间已满'})}
ws.room=room;ws.index=room.players.length;room.players.push(ws);send(ws,{type:'joined',code:room.code,index:ws.index});state(room);return}
const room=ws.room;if(!room)return send(ws,{type:'error',message:'请先创建或加入房间'});
if(m.type==='submit'){if(room.players.length!==2)return send(ws,{type:'error',message:'等待另一位玩家加入'});if(room.finished)return;if(room.answers[ws.index])return;const word=clean(m.word);if(!word)return;room.answers[ws.index]=word;state(room);if(room.answers.every(Boolean)){const matched=room.answers[0].toLocaleLowerCase()===room.answers[1].toLocaleLowerCase();const result={round:room.round,words:[...room.answers],matched};room.history.push(result);room.finished=matched;broadcast(room,{type:'reveal',result});room.round++;room.answers=[null,null];state(room)}return}
if(m.type==='restart'){if(!room.finished)return;room.answers=[null,null];room.history=[];room.round=1;room.finished=false;broadcast(room,{type:'restart'});state(room)}
});ws.on('close',()=>{const room=ws.room;if(!room)return;rooms.delete(room.code);room.players.forEach(p=>{if(p!==ws){send(p,{type:'closed',message:'对方已离开，房间已关闭'});p.room=null;p.index=-1}})})});
server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Sameword game ready'));
