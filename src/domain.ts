export type Area='valley'|'vault';
export type Ending=''|'bound'|'released';
export interface State {
 version:1; area:Area; x:number; y:number; hp:number; mana:number; coins:number; potions:number; relics:number;
 xp:number; level:number; talents:number; blade:number; spell:number; weapon:boolean; armor:boolean;
 quest:number; ending:Ending; discoveries:string[]; defeated:string[]; fight:null|{id:string;hp:number;turn:number}; dead:boolean; log:string[];
}
export const sites=[
 {id:'keeper',name:'Nera · Bellkeeper',area:'valley',x:4,y:10},
 {id:'trader',name:'Orin · Provisioner',area:'valley',x:3,y:9},
 {id:'inn',name:'The Copper Eave',area:'valley',x:5,y:11},
 {id:'shrine',name:'Mere Shrine',area:'valley',x:10,y:6},
 {id:'cache',name:'Pilgrim’s Rest',area:'valley',x:7,y:3},
 {id:'lore',name:'The Listening Stone',area:'valley',x:17,y:11},
 {id:'entrance',name:'Hollow Observatory',area:'valley',x:19,y:4},
 {id:'exit',name:'Valley stair',area:'vault',x:2,y:8},
 {id:'chest',name:'Archivist’s coffer',area:'vault',x:4,y:3},
 {id:'heart',name:'Meridian lens',area:'vault',x:11,y:2},
] as const;
export const enemies=[
 {id:'briar',name:'Briar revenant',area:'valley',x:13,y:6,hp:26,hit:8,xp:18,coins:9},
 {id:'husk',name:'Glass husk',area:'vault',x:6,y:7,hp:30,hit:9,xp:20,coins:11},
 {id:'warden',name:'The Hollow Astronomer',area:'vault',x:10,y:2,hp:66,hit:13,xp:40,coins:24},
] as const;
export const maxHp=(s:State)=>60+(s.level-1)*12;
export const maxMana=(s:State)=>24+(s.level-1)*4;
export function fresh():State {return {version:1,area:'valley',x:4,y:11,hp:60,mana:24,coins:18,potions:3,relics:0,xp:0,level:1,talents:0,blade:0,spell:0,weapon:false,armor:false,quest:0,ending:'',discoveries:[],defeated:[],fight:null,dead:false,log:['You arrive beneath a sky that has forgotten morning.']};}
export function note(s:State,text:string){s.log=[text,...s.log].slice(0,6);}
export function near(s:State,id:string){const p=sites.find(p=>p.id===id);return !!p&&p.area===s.area&&Math.abs(p.x-s.x)+Math.abs(p.y-s.y)<=1;}
export function walkable(area:Area,x:number,y:number):boolean {
 if(x<1||y<1||x>22||y>14)return false;
 if(area==='valley')return !(x>=11&&x<=14&&y>=9&&y<=12);
 return !(x>13||y>9||(x===7&&y>=2&&y<=6)||(y===5&&x>=8&&x<=11));
}
function gain(s:State,xp:number){s.xp+=xp;while(s.xp>=s.level*30){s.xp-=s.level*30;s.level++;s.talents++;s.hp=maxHp(s);s.mana=maxMana(s);note(s,'A new constellation awakens. Choose a talent in your pack.');}}
export function step(s:State,dx:number,dy:number){
 if(s.fight||s.dead||Math.abs(dx)+Math.abs(dy)!==1||!walkable(s.area,s.x+dx,s.y+dy))return;
 const e=enemies.find(e=>e.area===s.area&&e.x===s.x+dx&&e.y===s.y+dy&&!s.defeated.includes(e.id));
 if(e?.id==='warden'&&s.quest<3){note(s,'The chamber refuses your unattuned ember. Return to Nera.');return;}
 s.x+=dx;s.y+=dy;
 if(e){s.fight={id:e.id,hp:e.hp,turn:0};note(s,e.name+' rises. Its next blow is gathering.');}
}
export function act(s:State,a:string):void {
 if(s.dead){if(a==='recover'){s.dead=false;s.fight=null;s.area='valley';s.x=4;s.y=11;s.hp=maxHp(s);s.mana=maxMana(s);s.coins=Math.max(0,s.coins-8);note(s,'Nera finds you. Eight coins at most paid for rescue; all possessions remain.');}return;}
 if(s.fight){
  const e=enemies.find(e=>e.id===s.fight!.id)!; const f=s.fight;
  if(a==='retreat'){s.fight=null;s.area='valley';s.x=4;s.y=11;note(s,'You retreat to Bellwether. Your opponent recovers.');return;}
  if(!['strike','cast','guard','potion'].includes(a))return;
  if(a==='cast'&&s.mana<6){note(s,'Not enough mana. Guard to recover six.');return;}
  if(a==='potion'&&s.potions===0){note(s,'No healing draughts remain.');return;}
  if(a==='strike')f.hp-=12+s.blade*4+(s.weapon?6:0);
  if(a==='cast'){f.hp-=18+s.spell*5;s.mana-=6;}
  if(a==='potion'){s.potions--;s.hp=Math.min(maxHp(s),s.hp+32);}
  if(a==='guard')s.mana=Math.min(maxMana(s),s.mana+6);
  if(f.hp<=0){s.defeated.push(e.id);s.coins+=e.coins;s.relics++;s.fight=null;gain(s,e.xp);note(s,e.name+' falls. Recovered '+e.coins+' coins and a relic.');return;}
  const charged=f.turn%3===2; const hit=Math.max(1,e.hit+(charged?7:0)-(s.armor?3:0));
  s.hp=Math.max(0,s.hp-(a==='guard'?Math.ceil(hit/4):hit));f.turn++;
  note(s,(charged?'The charged blow lands':'Your foe answers')+'. '+(a==='guard'?'Your ward absorbs most of it.':'You lose '+hit+' health.'));
  if(s.hp===0){s.dead=true;note(s,'Your light fades. Recovery preserves your journey.');}return;
 }
 if(a==='potion'){if(s.potions&&s.hp<maxHp(s)){s.potions--;s.hp=Math.min(maxHp(s),s.hp+32);note(s,'The draught restores 32 health.');}return;}
 if(a==='blade'||a==='spell'){if(s.talents>0){s.talents--;s[a]++;note(s,a==='blade'?'Bladecraft deepens.':'Starfire grows brighter.');}return;}
 if(a==='accept'&&near(s,'keeper')&&s.quest===0){s.quest=1;note(s,'Nera asks you to recover the ember at Mere Shrine.');}
 if(a==='ember'&&near(s,'shrine')&&s.quest===1){s.quest=2;gain(s,10);note(s,'A warm ember settles into your palm. Nera can attune it.');}
 if(a==='attune'&&near(s,'keeper')&&s.quest===2){s.quest=3;gain(s,10);s.potions++;note(s,'Ember attuned. A gift of healing. Seek the Hollow Astronomer in the observatory.');}
 if(a==='heart'&&near(s,'heart')&&s.quest===3&&s.defeated.includes('warden')){s.quest=4;gain(s,20);note(s,'You recover the meridian heart. Return it to Mere Shrine and decide its future.');}
 if((a==='bind'||a==='release')&&near(s,'shrine')&&s.quest===4){s.quest=5;s.ending=a==='bind'?'bound':'released';s.coins+=30;gain(s,20);note(s,'Dawn returns. The valley will remember your choice. Thirty coins gifted by its people.');}
 if(['cache','lore','chest'].includes(a)&&near(s,a)&&!s.discoveries.includes(a)){s.discoveries.push(a);s.relics+=a==='chest'?2:1;s.coins+=8;gain(s,12);if(a==='lore')s.spell++;note(s,a==='lore'?'The stone teaches a forgotten starfire verse. Spell power increases.':'You recover a relic, eight coins, and a traveler’s story.');}
 if(a==='enter'&&near(s,'entrance')){s.area='vault';s.x=2;s.y=8;note(s,'Below the observatory, dust circles an impossible sun.');}
 if(a==='leave'&&near(s,'exit')){s.area='valley';s.x=19;s.y=5;note(s,'The valley air tastes of rain.');}
 if(a==='rest'&&near(s,'inn')){s.hp=maxHp(s);s.mana=maxMana(s);note(s,'A kindness at the Copper Eave. Health and mana restored, free of charge.');}
 if(near(s,'trader')){
  if(a==='buy'&&s.coins>=6){s.coins-=6;s.potions++;note(s,'Healing draught purchased for six coins.');}
  if(a==='sell'&&s.relics>0){s.relics--;s.coins+=10;note(s,'Orin pays ten coins for your relic.');}
  if(a==='weapon'&&!s.weapon&&s.coins>=24){s.coins-=24;s.weapon=true;note(s,'Dawnglass blade equipped. Blade strikes gain six damage.');}
  if(a==='armor'&&!s.armor&&s.coins>=20){s.coins-=20;s.armor=true;note(s,'Traveler’s mail equipped. Enemy blows lose three damage.');}
 }
}
export function restore(raw:string):State|null {
 try{
 const o=JSON.parse(raw) as State;
 if(!o||o.version!==1||!['valley','vault'].includes(o.area)||!['','bound','released'].includes(o.ending))return null;
 const ranges:Record<string,[number,number]>={x:[1,22],y:[1,14],hp:[0,240],mana:[0,84],coins:[0,100000],potions:[0,10000],relics:[0,10000],xp:[0,450],level:[1,16],talents:[0,15],blade:[0,15],spell:[0,16],quest:[0,5]};
 for(const [key,[low,high]] of Object.entries(ranges)){const v=o[key as keyof State];if(typeof v!=='number'||!Number.isInteger(v)||v<low||v>high)return null;}
 if(!walkable(o.area,o.x,o.y)||o.hp>maxHp(o)||o.mana>maxMana(o)||o.xp>=o.level*30||typeof o.weapon!=='boolean'||typeof o.armor!=='boolean'||typeof o.dead!=='boolean')return null;
 for(const [key,ids] of [['discoveries',['cache','lore','chest']],['defeated',enemies.map(e=>e.id)]] as const){if(!Array.isArray(o[key])||o[key].some(v=>!(ids as readonly string[]).includes(v))||new Set(o[key]).size!==o[key].length)return null;}
 if((o.quest===5)!==(o.ending!=='')||o.quest>=4&&!o.defeated.includes('warden')||o.dead!==(o.hp===0))return null;
 if(!Array.isArray(o.log)||o.log.length>6||o.log.some(v=>typeof v!=='string'||v.length>300))return null;
 // Encounters are deliberately abandoned on reload; no persisted enemy can attack on boot.
 const abandoned=o.fight!==null;
 o.fight=null;
 if(abandoned&&!o.dead){o.area='valley';o.x=4;o.y=11;}
 return o;
 }catch{return null;}
}
export function path(s:State,x:number,y:number):[number,number][] {
 const queue:[number,number][]=[[s.x,s.y]], previous=new Map<string,[number,number]|null>([[s.x+','+s.y,null]]);
 for(let i=0;i<queue.length;i++){
 const p=queue[i];if(p[0]===x&&p[1]===y){const result:[number,number][]=[];let at:[number,number]|null=p;while(at&&previous.get(at.join(','))){result.unshift(at);at=previous.get(at.join(','))!;}return result;}
 for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]){const q:[number,number]=[p[0]+dx,p[1]+dy];if(walkable(s.area,...q)&&!previous.has(q.join(','))){previous.set(q.join(','),p);queue.push(q);}}
 }return [];
}
