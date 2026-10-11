import {sites,enemies,walkable,type State} from './domain';
export const project=(s:State,x:number,y:number):[number,number]=>s.area==='valley'?[x*40+20,y*40+20]:[x*60+35,y*60+10];
export function tileAt(s:State,x:number,y:number):[number,number]{return s.area==='valley'?[Math.floor(x/40),Math.floor(y/40)]:[Math.floor((x-5)/60),Math.floor((y+20)/60)];}
const noise=(x:number,y:number)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
function ellipse(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function poly(c:CanvasRenderingContext2D,pts:number[][],color:string){c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
export function landscape(c:CanvasRenderingContext2D,s:State){
 const vault=s.area==='vault';c.fillStyle=vault?'#10191e':s.ending==='released'?'#344d59':s.ending==='bound'?'#496452':'#344b45';c.fillRect(0,0,960,640);
 for(let y=0;y<16;y++)for(let x=0;x<24;x++){
 const [cx,cy]=project(s,x,y),size=vault?60:40,n=noise(x,y);
 if(vault){if(walkable('vault',x,y)){c.fillStyle=n>.5?'#26323a':'#2b363d';c.fillRect(cx-size/2+1,cy-size/2+1,size-2,size-2);c.strokeStyle='#3d4647';c.strokeRect(cx-size/2+5,cy-size/2+5,size-10,size-10);}continue;}
 const palette=s.ending==='bound'?['#607253','#53694b','#485e43']:s.ending==='released'?['#526c71','#486066','#3f545c']:['#486054','#3e584b','#354e45'];c.fillStyle=palette[n>.6?0:n>.3?1:2];c.fillRect(x*40,y*40,40,40);
 for(let j=0;j<6;j++){const a=noise(x+j,y-j);c.strokeStyle='#66836b55';c.beginPath();c.moveTo(x*40+a*39,y*40+j*6);c.lineTo(x*40+a*39+3,y*40+j*6-4);c.stroke();}
 }
 if(!vault){
 // Roads join the settlement, shrine and observatory.
 c.lineCap='round';c.lineJoin='round';c.strokeStyle='#9d956755';c.lineWidth=23;c.beginPath();c.moveTo(200,470);c.bezierCurveTo(255,370,300,280,420,260);c.bezierCurveTo(540,270,680,130,800,180);c.stroke();
 c.strokeStyle='#c2b88a44';c.lineWidth=3;c.stroke();
 // The impassable Mere, visibly aligned to blocked tiles.
 c.fillStyle='#203f48';c.fillRect(440,360,160,160);
 for(let i=0;i<25;i++){c.strokeStyle='#86b5b72a';c.beginPath();c.moveTo(446+noise(i,1)*130,370+i*6);c.lineTo(466+noise(i,1)*130,370+i*6);c.stroke();}
 c.strokeStyle='#83aaa9';c.lineWidth=2;c.strokeRect(440,360,160,160);
 // Woodland silhouettes, kept away from traveled landmarks.
 for(let y=0;y<16;y++)for(let x=0;x<24;x++){
 if((x<2||x>21||y<2||y>13||noise(x,18+y)>.84)&&!sites.some(p=>p.area==='valley'&&Math.abs(p.x-x)+Math.abs(p.y-y)<2)&&walkable('valley',x,y)){
 const px=x*40+15,py=y*40+22;ellipse(c,px+8,py+10,18,8,'#132e3066');c.fillStyle='#544b37';c.fillRect(px-3,py-12,6,28);
 poly(c,[[px,py-37],[px-19,py+2],[px+19,py+2]],'#243f3a');poly(c,[[px-3,py-37],[px-17,py-1],[px,py-6]],'#59725a');
 }}
 c.font='italic 17px Georgia';c.fillStyle='#c9d2b899';c.fillText('T H E  M E R E',459,446);c.fillText('B E L L W E T H E R',95,553);
 c.font='12px Georgia';c.fillText('WESTERN WOOD',58,94);c.fillText('THE ASHEN RIDGE',662,79);
 }else{
 c.font='italic 21px Georgia';c.fillStyle='#c3c2b388';c.fillText('THE HOLLOW OBSERVATORY',430,603);
 for(const [x,y]of [[3,2],[6,3],[9,7],[12,7]]){const [px,py]=project(s,x,y);ellipse(c,px+6,py+10,22,9,'#030708');c.fillStyle='#68757a';c.fillRect(px-10,py-24,20,40);ellipse(c,px,py-25,15,7,'#85928e');}
 }
 // Static structures are original geometric artwork.
 for(const p of sites.filter(p=>p.area===s.area)){
 const [x,y]=project(s,p.x,p.y);ellipse(c,x+7,y+18,30,12,'#0c252a66');
 if(['keeper','trader','inn'].includes(p.id)){
 c.fillStyle=p.id==='inn'?'#aea38b':'#a2a58c';c.fillRect(x-21,y-14,42,34);poly(c,[[x-29,y-15],[x,y-41],[x+29,y-15]],p.id==='trader'?'#76584c':'#7b6450');
 c.fillStyle='#263d39';c.fillRect(x-5,y+3,11,18);c.fillStyle='#e7c37d';c.fillRect(x-15,y-7,7,8);c.fillRect(x+9,y-7,7,8);
 if(p.id==='keeper'){c.strokeStyle='#d4b875';c.lineWidth=3;c.beginPath();c.arc(x,y-31,7,Math.PI,0);c.stroke();}
 }else if(p.id==='entrance'){
 c.fillStyle='#87928a';c.fillRect(x-32,y-24,64,48);ellipse(c,x,y-25,34,16,'#9da495');c.fillStyle='#1b2a2c';c.fillRect(x-10,y-9,20,34);c.strokeStyle='#d3ba7e';c.lineWidth=2;c.beginPath();c.arc(x,y-32,18,Math.PI,0);c.stroke();
 }else if(['shrine','heart'].includes(p.id)){
 ellipse(c,x,y+14,31,14,'#9fa493');c.fillStyle='#b8b49a';c.fillRect(x-8,y-22,16,34);poly(c,[[x,y-36],[x-15,y-18],[x,y-5],[x+15,y-18]],'#e3c98a');
 }else if(p.id==='exit'){poly(c,[[x-25,y+20],[x+25,y+20],[x+25,y-20],[x-25,y-20]],'#9f9d8a');for(let i=0;i<6;i++){c.fillStyle=i%2?'#4a5c61':'#718186';c.fillRect(x-25,y-20+i*7,50,5);}}
 else if(p.id==='lore'){poly(c,[[x-16,y+18],[x-12,y-30],[x+13,y-35],[x+20,y+18]],'#7e9086');c.fillStyle='#dfcb92';c.font='24px Georgia';c.fillText('✧',x-9,y);}
 else{c.fillStyle='#8b6948';c.fillRect(x-18,y-8,36,25);c.strokeStyle='#c2a369';c.lineWidth=3;c.strokeRect(x-18,y-8,36,25);c.fillStyle='#ebce8a';c.fillRect(x-3,y-2,6,10);}
 c.font='600 12px system-ui';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#20312c';const label=p.name.split(' · ')[0];c.strokeText(label,x,y+39);c.fillStyle='#e7e0c5';c.fillText(label,x,y+39);c.textAlign='left';
 }
 const grad=c.createRadialGradient(470,280,100,480,320,580);grad.addColorStop(0,'#00000000');grad.addColorStop(1,'#06141a88');c.fillStyle=grad;c.fillRect(0,0,960,640);
}
export function actors(c:CanvasRenderingContext2D,s:State,t:number,route:[number,number][]){
 for(const [x,y] of route){const [px,py]=project(s,x,y);ellipse(c,px,py,3,3,'#ecd39699');}
 for(const e of enemies.filter(e=>e.area===s.area&&!s.defeated.includes(e.id))){
 const [x,y]=project(s,e.x,e.y);ellipse(c,x,y+10,18,8,'#080b1688');poly(c,[[x,y-25],[x-17,y+15],[x+17,y+15]],e.id==='warden'?'#6d5485':'#766b70');ellipse(c,x,y-18,7,7,'#c6bc99');c.fillStyle='#dc8a6c';c.fillRect(x-4,y-20,3,2);c.fillRect(x+2,y-20,3,2);
 c.font='11px system-ui';c.textAlign='center';c.fillStyle='#f0bea4';c.fillText(e.id==='warden'?'Hollow Astronomer':e.name,x,y+30);c.textAlign='left';
 }
 const [x,y]=project(s,s.x,s.y);ellipse(c,x,y+12,15,7,'#10262388');
 const glow=c.createRadialGradient(x,y,0,x,y,29);glow.addColorStop(0,'#efdc8e44');glow.addColorStop(1,'#efdc8e00');c.fillStyle=glow;c.fillRect(x-30,y-30,60,60);
 poly(c,[[x,y-14],[x-12,y+12],[x,y+7],[x+12,y+12]],'#dfca86');poly(c,[[x,y-11],[x-9,y+11],[x,y+7]],'#9b855a');ellipse(c,x,y-17,6,7,'#e1c6a2');c.fillStyle='#3c3a32';c.fillRect(x-5,y-24,10,4);c.strokeStyle='#d8e1d8';c.lineWidth=2;c.beginPath();c.moveTo(x+11,y+6);c.lineTo(x+17,y-12);c.stroke();
 c.strokeStyle='#e6d18d';c.lineWidth=1;c.beginPath();c.ellipse(x,y+15,20+Math.sin(t/300)*2,8,0,0,Math.PI*2);c.stroke();
 for(let i=0;i<18;i++){const px=(noise(i,9)*960+t*.005*(i%2?1:-1)+960)%960,py=(noise(i,8)*640+Math.sin(t/1400+i)*8);ellipse(c,px,py,1.3,1.3,'#ecdfa155');}
}
