import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,act} from './domain';
test('keeper accepts request only once without duplicate reward',()=>{
 const s=fresh(); act(s,'accept'); act(s,'accept'); assert.equal(s.quest,1); assert.equal(s.coins,18);
});
import {step,path,near,restore,maxHp} from './domain';
function walk(s:ReturnType<typeof fresh>,x:number,y:number){for(const [px,py]of path(s,x,y)){step(s,px-s.x,py-s.y);if(s.fight)break;}}
test('reload preserves a peaceful position instead of teleporting home',()=>{const s=fresh();walk(s,7,3);assert.equal(restore(JSON.stringify(s))?.x,7);});
test('quests require local presence and attunement, rewards cannot repeat',()=>{
 const s=fresh();act(s,'ember');assert.equal(s.quest,0);act(s,'accept');walk(s,10,6);act(s,'ember');act(s,'ember');assert.equal(s.quest,2);assert.equal(s.xp,10);
 act(s,'attune');assert.equal(s.quest,2);walk(s,4,10);act(s,'attune');act(s,'attune');assert.equal(s.potions,4);assert.equal(s.xp,20);
});
test('optional discovery awards only once and relic sale cannot underflow',()=>{
 const s=fresh();walk(s,7,3);act(s,'cache');act(s,'cache');assert.equal(s.coins,26);assert.equal(s.relics,1);walk(s,3,9);act(s,'sell');act(s,'sell');assert.equal(s.relics,0);assert.equal(s.coins,36);
});
test('equipment purchase is one time, local, affordable and auto-equipped',()=>{
 const s=fresh();act(s,'weapon');assert.equal(s.weapon,false);walk(s,3,9);act(s,'weapon');assert.equal(s.weapon,false);
 walk(s,7,3);act(s,'cache');walk(s,3,9);act(s,'weapon');act(s,'weapon');assert.equal(s.weapon,true);assert.equal(s.coins,2);act(s,'buy');assert.equal(s.potions,3);
});
test('a charged blow is softened by guarding and restores mana',()=>{
 const s=fresh();walk(s,13,6);assert.equal(s.fight?.id,'briar');act(s,'guard');act(s,'guard');act(s,'guard');assert.equal(s.hp,52);assert.equal(s.mana,24);
});
test('spell victory grants loot once and levels refill vitality',()=>{
 const s=fresh();walk(s,10,6);act(s,'accept'); // acceptance away from Nera has no effect
 walk(s,13,6);act(s,'cast');act(s,'cast');assert.equal(s.fight,null);assert.equal(s.relics,1);assert.equal(s.xp,18);
 walk(s,17,11);act(s,'lore');assert.equal(s.level,2);assert.equal(s.hp,72);assert.equal(s.talents,1);act(s,'blade');act(s,'blade');assert.equal(s.blade,1);
});
test('death and recovery retain progress, possessions and lose bounded coins',()=>{
 const s=fresh();act(s,'accept');walk(s,13,6);
 for(let i=0;i<40&&!s.dead;i++)act(s,'guard');
 assert.equal(s.dead,true);act(s,'recover');assert.equal(s.hp,maxHp(s));assert.equal(s.quest,1);assert.equal(s.coins,10);assert.equal(s.fight,null);assert.equal(s.x,4);
});
test('retreat cannot reward and reload abandons encounters safely',()=>{
 const s=fresh();walk(s,13,6);act(s,'cast');const restored=restore(JSON.stringify(s))!;assert.equal(restored.fight,null);assert.equal(restored.x,4);assert.equal(restored.defeated.length,0);
 act(s,'retreat');assert.equal(s.xp,0);assert.equal(s.relics,0);walk(s,13,6);assert.equal(s.fight?.hp,26);
});
test('mana exhaustion and empty healing have no enemy-turn cost',()=>{
 const s=fresh();walk(s,13,6);s.mana=0;s.potions=0;act(s,'cast');act(s,'potion');assert.equal(s.fight?.turn,0);assert.equal(s.hp,60);
});
test('whole main chain supports either finale once with continued movement',()=>{
 for(const ending of ['bind','release']){
 const s=fresh();act(s,'accept');walk(s,10,6);act(s,'ember');walk(s,4,10);act(s,'attune');
 walk(s,19,4);act(s,'enter');walk(s,4,3);act(s,'chest');walk(s,10,2);assert.equal(s.fight?.id,'warden');
 while(s.fight&&!s.dead){if(s.hp<30)act(s,'potion');else if(s.mana>=6)act(s,'cast');else act(s,'strike');}
 assert.equal(s.dead,false);walk(s,11,2);act(s,'heart');assert.equal(s.quest,4);
 walk(s,2,8);if(s.fight){while(s.fight)act(s,'strike');walk(s,2,8);}act(s,'leave');walk(s,10,6);if(s.fight){while(s.fight&&!s.dead)act(s,'strike');walk(s,10,6);}act(s,ending);const coins=s.coins;act(s,ending);
 assert.equal(s.quest,5);assert.equal(s.coins,coins);assert.equal(s.ending,ending==='bind'?'bound':'released');assert.ok(restore(JSON.stringify(s)));step(s,0,-1);assert.equal(s.y,5);
 }
});
test('walls block movement and paths do not cross the Mere',()=>{
 const s=fresh();const route=path(s,17,11);assert.ok(route.length>0);assert.ok(route.every(([x,y])=>!(x>=11&&x<=14&&y>=9&&y<=12)));walk(s,10,10);step(s,1,0);assert.equal(s.x,10);
});
test('malformed, impossible and incompatible saves fail safely',()=>{
 for(const raw of ['{','null','{}',JSON.stringify({...fresh(),version:2}),JSON.stringify({...fresh(),hp:999}),JSON.stringify({...fresh(),quest:5}),JSON.stringify({...fresh(),discoveries:['unknown']}),JSON.stringify({...fresh(),potions:-1}),JSON.stringify({...fresh(),x:12,y:10}),JSON.stringify({...fresh(),coins:NaN})])assert.equal(restore(raw),null);
});
test('guardian chamber rejects an unattuned traveler without starting combat',()=>{
 const s=fresh();walk(s,19,4);act(s,'enter');walk(s,4,3);walk(s,10,1);step(s,0,1);assert.equal(s.fight,null);assert.equal(s.y,1);assert.equal(s.quest,0);
});
test('equipped armor reduces damage and healing consumes exactly one draught',()=>{
 const s=fresh();walk(s,7,3);act(s,'cache');walk(s,3,9);act(s,'armor');walk(s,13,6);act(s,'guard');assert.equal(s.hp,58);act(s,'potion');assert.equal(s.potions,2);assert.equal(s.hp,55); // healed to 60, then a five-point reply
});
