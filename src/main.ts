import './style.css';
import {act,fresh,restore,step,near,path,sites,enemies,maxHp,maxMana,note,type State} from './domain';
import {landscape,actors,tileAt} from './art';
import {toggleAudio,chime,suspendAudio} from './audio';
const key='quiet-meridian-v1';
let s:State=fresh(),loaded=false,saveStatus='Autosave ready';
try{const saved=localStorage.getItem(key);if(saved){const restored=restore(saved);if(restored){s=restored;loaded=true;}else saveStatus='Unreadable save ignored · new journey ready';}}catch{saveStatus='Storage unavailable · this journey cannot persist';}
let started=false,paused=false,route:[number,number][]=[];
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<header><a class="wordmark" href="./"><span class="sigil">✧</span><span>THE QUIET MERIDIAN<small>A tale of a borrowed dawn</small></span></a><nav><button id="sound">Sound off</button><button id="pack">Pack & talents</button><button id="pause">Pause</button></nav></header>
<main><section class="world"><div class="world-top"><div><span class="eyebrow">THE WAYFARER'S ATLAS</span><h1 id="region">Bellwether Valley</h1></div><span id="coordinate"></span></div><div id="map-wrap"><canvas id="map" width="960" height="640" tabindex="0" aria-label="Traversable fantasy world. Click to walk, or use arrows and E to interact."></canvas><div class="map-corner">N ↑<small>✧ Wayfarer &nbsp; ◆ Places &nbsp; ● Foes</small></div></div><div class="map-bottom"><span>Click land to walk · WASD / arrows · E interact</span><button id="interact">Look around</button></div><div class="touch"><button data-move="0,-1" aria-label="Walk north">↑</button><button data-move="-1,0" aria-label="Walk west">←</button><button data-move="0,1" aria-label="Walk south">↓</button><button data-move="1,0" aria-label="Walk east">→</button></div><div id="resources"></div></section>
<aside><span class="eyebrow">YOUR CHRONICLE</span><h2>A sky without morning</h2><p class="intro-copy">Beyond the village roofs, a quiet light waits to be found.</p><div id="journal"></div><div class="divider"></div><span class="eyebrow">WALK THE VALLEY</span><div id="landmarks"></div><details><summary>Traveler's notes</summary><div id="log" aria-live="polite"></div></details><div id="save-status"></div><button id="save">Save journey</button></aside></main>
<footer><span>Original world · Original art · A small adventure with room to wander</span><button id="new">New journey</button></footer>
<dialog id="dialog" aria-labelledby="dialog-title"><button class="close" id="close" aria-label="Close dialogue">×</button><div id="dialog-content"></div></dialog>
<div id="intro"><div class="intro-card"><span class="eyebrow">AN ORIGINAL FANTASY ADVENTURE</span><div class="intro-sigil">✧</div><h2>The Quiet<br>Meridian</h2><p>The sun has stopped at the edge of the world.<br>Someone must teach it how to rise.</p><div class="intro-rule"></div><p class="intro-instructions">Walk a forgotten valley. Speak with its keepers.<br>Follow the light below the old observatory.<br>Choose what dawn will become.</p><button id="begin">${loaded?'Continue journey':'Enter the valley'} →</button><small>Mouse, keyboard, or touch · Saves on this browser</small></div></div>`;
const $=(id:string)=>document.getElementById(id)!;
const canvas=$('map') as HTMLCanvasElement,c=canvas.getContext('2d')!;
const bg=document.createElement('canvas');bg.width=960;bg.height=640;const bc=bg.getContext('2d')!;
const dialog=$('dialog') as HTMLDialogElement;
let current='',bgSignature='';
const escape=(v:string)=>v.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]!));
const button=(action:string,label:string,disabled=false)=>`<button data-action="${action}" ${disabled?'disabled':''}>${label}</button>`;
function persist(){try{localStorage.setItem(key,JSON.stringify(s));saveStatus='Journey saved on this browser';}catch{saveStatus='Save failed · storage unavailable';}$('save-status').textContent=saveStatus;}
const objectives=['Speak with Nera in Bellwether.','Recover the ember at Mere Shrine.','Return to Nera for attunement.','Defeat the Hollow Astronomer; recover the meridian heart.','Return to Mere Shrine. Choose to bind or release dawn.','Dawn has returned. Your story continues.'];
function render(){
 const vault=s.area==='vault';$('region').textContent=vault?'Hollow Observatory':'Bellwether Valley';
 $('coordinate').textContent=(route.length?'Walking · ':'')+s.x+' / '+s.y;
 $('resources').innerHTML=`<div><span>VITALITY</span><strong>${s.hp} / ${maxHp(s)}</strong><meter min="0" max="${maxHp(s)}" value="${s.hp}"></meter></div><div><span>STARLIGHT</span><strong>${s.mana} / ${maxMana(s)}</strong><meter class="mana" min="0" max="${maxMana(s)}" value="${s.mana}"></meter></div><div><span>WAYFARER</span><strong>Level ${s.level} <small>· ${s.xp}/${s.level*30} XP</small></strong></div><div><span>YOUR PURSE</span><strong>${s.coins} <small>coins</small> · ${s.potions} <small>draughts</small></strong></div>`;
 $('journal').innerHTML=`<div class="quest"><span class="quest-count">CHAPTER ${Math.min(5,s.quest+1)} / 5</span><h3>${['The bellkeeper','A sleeping ember','Kindle the key','The hollow sun','A dawn of your choosing','The next morning'][s.quest]}</h3><p>${objectives[s.quest]}</p>${s.ending?`<span class="badge">${s.ending==='bound'?'Dawn bound to Bellwether':'Dawn released to the wider world'}</span>`:''}</div><div class="discoveries"><span>Discoveries</span><strong>${s.discoveries.length} / 3</strong></div>`;
 $('landmarks').innerHTML=sites.filter(p=>p.area===s.area).map(p=>`<button class="landmark" data-walk="${p.id}"><span>◆ &nbsp;${p.name}</span><small>${p.x}, ${p.y} ↗</small></button>`).join('');
 $('log').innerHTML=s.log.map(t=>`<p>${escape(t)}</p>`).join('');
 $('save-status').textContent=saveStatus;
 const p=sites.find(p=>near(s,p.id));$('interact').textContent=p?'Interact · '+p.name.split(' · ')[0]:'Look around';
 $('pause').textContent=paused?'Resume':'Pause';
 if(!paused){if(s.dead)showDeath();else if(s.fight)showCombat();}
}
function open(title:string,body:string,buttons:string,type=''){
 route=[];current=type;
 $('dialog-content').innerHTML=`<span class="eyebrow">${type==='combat'?'ENCOUNTER':type==='pack'?'THE WAYFARER':'A MOMENT IN YOUR JOURNEY'}</span><h2 id="dialog-title">${title}</h2>${body}<div class="dialog-actions">${buttons}</div>`;
 if(!dialog.open)dialog.showModal();
 $('close').hidden=type==='combat'||type==='death';
}
function close(){if(current==='pause'){paused=false;suspendAudio(false);}dialog.close();current='';canvas.focus();if(s.dead)showDeath();else if(s.fight)showCombat();render();}
function showCombat(){const e=enemies.find(e=>e.id===s.fight!.id)!;const f=s.fight!;open(e.name,`<div class="enemy-art">${e.id==='warden'?'☉':'⟡'}</div><p class="telegraph">${f.turn%3===2?'A charged blow gathers. Guard now to soften it.':'Your foe prepares a measured strike.'}</p><p>Enemy vitality <strong>${f.hp} / ${e.hp}</strong> · Your vitality <strong>${s.hp}</strong><br>Starlight ${s.mana} · Draughts ${s.potions}</p><p class="combat-log">${escape(s.log[0])}</p>`,button('strike','Blade · '+(12+s.blade*4+(s.weapon?6:0)))+button('cast','Starfire · '+(18+s.spell*5)+' (6 mana)',s.mana<6)+button('guard','Guard · +6 mana')+button('potion','Draught · +32 health',!s.potions)+button('retreat','Retreat to village'),'combat');}
function showDeath(){open('The light returns to you','<p>You fell beneath a sky without morning. Nera will carry you home. Your discoveries, quest progress and possessions survive. Rescue costs up to eight coins.</p>',button('recover','Wake in Bellwether'),'death');}
function pack(){open('What you carry',`<p><strong>${s.coins} coins · ${s.relics} relics · ${s.potions} healing draughts</strong></p><div class="equipment"><p>Blade: ${s.weapon?'Dawnglass (+6 damage)':'Traveler’s iron'}<br>Armor: ${s.armor?'Traveler’s mail (−3 damage taken)':'Wool and leather'}</p><p>Bladecraft ${s.blade} · Starfire ${s.spell}<br>Unspent talents: <strong>${s.talents}</strong></p></div><p>Every level restores your resources and grants a talent.<br>Quest items remain protected from trade.</p>`,button('potion','Drink draught (+32 health)',!s.potions||s.hp===maxHp(s))+button('blade','Learn Bladecraft (+4 damage)',!s.talents)+button('spell','Learn Starfire (+5 damage)',!s.talents),'pack');}
function interact(id?:string){
 if(paused||s.fight||s.dead)return;
 const p=sites.find(p=>id?p.id===id&&near(s,p.id):near(s,p.id));
 if(!p){note(s,'Only wind and the scent of wet cedar. Walk toward a named landmark to interact.');render();return;}
 current=p.id;
 if(p.id==='keeper'){
 const text=s.quest===0?'“I am Nera. Once, this bell called morning over the Mere. Now it rings into silence. Will you bring its ember home? You will find it at the shrine northeast of here.”':s.quest===2?'“There it is. Warm as a held breath. Let me attune it to the observatory gate. The Hollow Astronomer keeps the dawn below those broken stairs.”':s.quest>=4?'“No bellkeeper should choose for the valley. Take the heart to Mere Shrine. Bind it here, or send its light beyond our hills.”':s.quest===3?'“The chamber will recognize your ember. The observatory stands on the northeastern ridge. Rest before you descend.”':'“Follow the road to Mere Shrine. Its old stone still remembers sunrise.”';
 open('Nera, the bellkeeper',`<div class="portrait nera">✧</div><p>${text}</p><p class="aside-text">“Orin trades by the western roof. The Copper Eave offers a bed without charge.”</p>`,s.quest===0?button('accept','I will find your ember'):s.quest===2?button('attune','Attune the ember'):'',p.id);
 }else if(p.id==='trader'){
 open('Orin, the provisioner',`<div class="portrait orin">◇</div><p>“A good road needs a sharp blade and a full flask. Relics from the old world? Ten coins each. Their stories are worth more, but stories do not mend boots.”</p><p><strong>${s.coins} coins · ${s.relics} relics · ${s.potions} draughts</strong></p><p>Dawnglass adds 6 blade damage. Mail reduces every enemy blow by 3.</p>`,button('buy','Draught · 6 coins',s.coins<6)+button('sell','Sell relic · +10 coins',!s.relics)+button('weapon',s.weapon?'Dawnglass equipped':'Dawnglass blade · 24 coins',s.weapon||s.coins<24)+button('armor',s.armor?'Mail equipped':'Traveler’s mail · 20 coins',s.armor||s.coins<20),p.id);
 }else if(p.id==='inn'){open('The Copper Eave','<p>Tess sets a bowl beside the fire. “No charge for a wayfarer trying to bring back the sun. Rest as often as you need.”</p>',button('rest','Rest · restore health & starlight'),p.id);}
 else if(p.id==='shrine'){
 if(s.quest===4){open('A dawn of your choosing','<div class="enemy-art gold">✧</div><p>The meridian heart beats in your hands. Bind it to the bell: Bellwether will always have morning, and its keepers will guard the light. Release it: dawn will wander beyond these hills, and the valley must learn to live without a promise.</p><p>Both choices finish your adventure. You may continue exploring afterward.</p>',button('bind','Bind dawn to Bellwether')+button('release','Release dawn to the world'),p.id);}
 else open('Mere Shrine','<p>Old stone cradles a small warmth. A worn inscription reads: “Light held too tightly becomes a cage. Light freely given becomes a road.”</p>',s.quest===1?button('ember','Recover the sleeping ember'):'',p.id);
 }else if(p.id==='entrance')open('Hollow Observatory','<p>The ancient astronomers sought to chart tomorrow. Their last lens caught the dawn itself. Steps spiral beneath the broken dome.</p><p class="aside-text">Bring healing and an attuned ember. The guardian waits below.</p>',button('enter','Descend into the observatory'),p.id);
 else if(p.id==='exit')open('The valley stair','<p>Dayless air drifts down from above. The stair leads back to the observatory ridge.</p>',button('leave','Return to the valley'),p.id);
 else if(p.id==='heart')open('The meridian lens',`<p>${s.defeated.includes('warden')?'With its keeper fallen, the lens opens. A living heart of dawn floats within.':'The Hollow Astronomer guards this light. Defeat it before reaching for the heart.'}</p>`,s.quest===3&&s.defeated.includes('warden')?button('heart','Recover the meridian heart'):'',p.id);
 else{
 const text={cache:'A pilgrim left supplies here with a note: “If the road becomes too dark, remember that someone walked it before you.”',lore:'The stone whispers the names of stars that no longer shine. You learn a verse of starfire: +1 spell talent, even before leveling.',chest:'The archivist’s coffer holds two silver relics and a letter: “We mistook possession for understanding. Forgive us.”'}[p.id]!;
 open(p.name,`<p>${text}</p><p>${s.discoveries.includes(p.id)?'You have already recovered this discovery.':'Recover the relics, eight coins and 12 experience.'}</p>`,s.discoveries.includes(p.id)?'':button(p.id,'Recover discovery'),p.id);
 }
}
function doAction(a:string){
 const before=s.quest,wasFight=!!s.fight,old=current;act(s,a);persist();chime();
 if(wasFight&&!s.fight&&!s.dead)close();
 if(s.dead){render();return;}
 if(s.quest===5&&before===4){
 open(s.ending==='bound'?'The bell rings at morning':'Dawn takes the open road',`<div class="enemy-art gold">☉</div><p>${s.ending==='bound'?'A warm note crosses the Mere. Windows kindle, one by one. Nera leaves the bell tower unlocked: its light belongs to everyone now.':'The heart breaks into a thousand bright birds. They rise beyond the ridge. Bellwether greets a fragile morning, and somewhere a stranger sees the first of your stars.'}</p><p class="aside-text">Adventure complete · 30 coins gifted · The valley remains open. Find its remaining discoveries, trade your relics, or begin another journey.</p>`,button('continue','Keep wandering'),'ending');
 }else if(a==='continue')close();
 else if(old==='pack')pack();
 else if(!s.fight&&old!=='combat'&&old!=='death'&&dialog.open)interact(old);
 render();
}
function travel(id:string){
 if(!started||paused||dialog.open||s.fight||s.dead)return;
 const p=sites.find(p=>p.id===id&&p.area===s.area)!;route=path(s,p.x,p.y);if(!route.length)interact(p.id);render();
}
$('begin').onclick=()=>{started=true;$('intro').remove();canvas.focus();render();if(s.dead)showDeath();};
$('close').onclick=close;
dialog.addEventListener('cancel',e=>{if(s.fight||s.dead)e.preventDefault();else{if(current==='pause'){paused=false;suspendAudio(false);}current='';route=[];render();}});
$('pack').onclick=()=>{if(started&&!s.fight&&!s.dead&&!paused)pack();};
$('interact').onclick=()=>interact();
$('sound').onclick=async()=>{$('sound').textContent=(await toggleAudio())?'Sound on':'Sound off';};
$('pause').onclick=()=>{if(!started)return;paused=!paused;route=[];suspendAudio(paused);if(paused)open('The valley waits','<p>Your journey is paused. Take your time; even the stars can wait.</p>',button('resume','Resume journey'),'pause');else close();render();};
$('save').onclick=()=>{persist();};
$('new').onclick=()=>{if(!started)return;open('Begin another journey?','<p>This replaces the saved journey on this browser. Your current discoveries, equipment and ending will be erased.</p>',button('reset','Replace save and start again'),'reset');};
app.addEventListener('click',e=>{
 const b=(e.target as HTMLElement).closest<HTMLButtonElement>('button');if(!b||b.disabled)return;
 if(b.dataset.action){const a=b.dataset.action;if(a==='resume'){paused=false;suspendAudio(false);close();render();}else if(a==='reset'){s=fresh();paused=false;close();persist();render();}else doAction(a);}
 if(b.dataset.walk)travel(b.dataset.walk);
 if(b.dataset.move){const [dx,dy]=b.dataset.move.split(',').map(Number);move(dx,dy);}
});
function move(dx:number,dy:number){if(!started||paused||dialog.open||s.fight||s.dead)return;route=[];step(s,dx,dy);persist();render();}
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&!dialog.open&&started){$('pause').click();return;}
 if(dialog.open||!started||paused)return;
 const dir:Record<string,[number,number]>={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
 if(dir[e.key]){e.preventDefault();move(...dir[e.key]);}if(e.key.toLowerCase()==='e'){e.preventDefault();interact();}
});
canvas.addEventListener('click',e=>{if(!started||paused||dialog.open||s.fight||s.dead)return;const r=canvas.getBoundingClientRect(),[x,y]=tileAt(s,(e.clientX-r.left)*960/r.width,(e.clientY-r.top)*640/r.height);route=path(s,x,y);render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){route=[];suspendAudio(true);}else suspendAudio(paused);});
let last=0;
function frame(t:number){
 if(started&&!paused&&!dialog.open&&route.length&&t-last>95){last=t;const [x,y]=route.shift()!;const prevX=s.x,prevY=s.y;step(s,x-s.x,y-s.y);if(s.fight||(s.x===prevX&&s.y===prevY))route=[];persist();render();if(!route.length&&!s.fight&&!s.dead)interact();}
 const sig=s.area+s.ending;if(sig!==bgSignature){bgSignature=sig;landscape(bc,s);}c.drawImage(bg,0,0);actors(c,s,t,route);requestAnimationFrame(frame);
}
render();requestAnimationFrame(frame);
