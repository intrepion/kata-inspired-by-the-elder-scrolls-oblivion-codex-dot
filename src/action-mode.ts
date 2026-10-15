import './action-style.css';
import { freshAction, restoreAction, tickAction, attack, cast, jump, drink, recover, choose, dialogueFor, focusPlace, objectivePlace, maxHealth, objectives, record, commandAction, type Skill, type Dialogue } from './action-domain';
import { drawAction } from './action-render';
import { BlockInput } from './action-input';
const saveKey = 'quiet-meridian-first-person-v1';
let s = freshAction(), loaded = false, saveStatus = 'Saves on this browser';
try {
    const raw = localStorage.getItem(saveKey);
    if (raw) {
        const restored = restoreAction(raw);
        if (restored) {
            s = restored;
            loaded = true;
        }
        else
            saveStatus = 'Unreadable action save ignored';
    }
}
catch {
    saveStatus = 'Storage unavailable · play without persistence';
}
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<div class="action-shell"><header><div><span class="action-eyebrow">THE QUIET MERIDIAN</span><h1>A borrowed dawn</h1></div><nav><button id="journal">Journal & skills <kbd>Tab</kbd></button><button id="pause">Pause</button><a href="?mode=classic">Original atlas</a></nav></header><section class="action-world"><canvas id="action-view" width="1100" height="680" tabindex="0" aria-label="First-person fantasy valley. WASD walks; mouse aims; left mouse attacks; right mouse blocks; C casts; Space activates; E jumps."></canvas><div class="action-location" id="location">BELLWETHER VALLEY</div><div class="action-quest" id="objective"></div><div class="action-resources"><div><span>Health</span><meter id="health" min="0" max="100" value="100"></meter><b id="health-value"></b></div><div><span>Magicka</span><meter id="mana" min="0" max="80" value="80"></meter><b id="mana-value"></b></div><div><span>Fatigue</span><meter id="fatigue" min="0" max="100" value="100"></meter><b id="fatigue-value"></b></div></div><div class="action-spell" id="equipped"></div><div class="action-notice" id="notice" aria-live="polite"></div><div id="launch" class="action-launch"><div><span class="action-eyebrow">FIRST-PERSON ADVENTURE · A SHORT PLAYABLE SLICE</span><h2>The Quiet<br>Meridian</h2><p>Walk a valley beneath a borrowed dawn.<br>Speak to its bellkeeper. Face the hollow sun.</p><p class="action-instructions">WASD move · Mouse or arrows aim · Shift run<br>Left mouse tap / hold: strike / power attack<br>Right mouse or Alt: block · C cast · 1 / 2 spells<br>Space activate · E jump · F ready / sheath · H draught<br>Tab journal · Escape pause</p><button id="begin">${loaded ? 'Continue action journey' : 'Enter the valley'} →</button><small>The original atlas and its saves remain available above.</small></div></div></section><footer><span id="save-state"></span><span>Click the view for mouse capture; drag to look if unavailable. Arrow keys also aim.</span></footer><div class="action-buttons"><button id="strike">Strike <small>J</small></button><button id="block">Hold block <small>Alt</small></button><button id="cast">Cast <small>C</small></button><button id="activate">Activate <small>Space</small></button><button id="draught">Draught <small>H</small></button></div><p class="action-limit">A compact original valley and ruin with continuous action combat, spellcasting and use-based growth.</p></div><dialog id="action-dialog" aria-labelledby="action-title"><button id="dismiss" class="action-close" aria-label="Close dialog">×</button><div id="action-dialog-content"></div></dialog>`;
const $ = (id: string) => document.getElementById(id)!;
const canvas = $('action-view') as HTMLCanvasElement, c = canvas.getContext('2d')!, dialog = $('action-dialog') as HTMLDialogElement;
const keys = new Set<string>();
const blockInput = new BlockInput();
let started = false, paused = false, locked = false, dragging = false, mouseAttack = 0, heldAt = 0, activeTarget = '', last = 0, saveTimer = 0, lastHud = 0;
const escape = (v: string) => v.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
function clearInput() { keys.clear(); blockInput.clear(); dragging = false; mouseAttack = 0; heldAt = 0; commandAction(s, { type: 'release-block' }); }
function persist() { try {
    localStorage.setItem(saveKey, JSON.stringify(s));
    saveStatus = 'Action journey saved on this browser';
}
catch {
    saveStatus = 'Save failed · storage unavailable';
} $('save-state').textContent = saveStatus; }
function show(title: string, body: string, options: {
    id: string;
    label: string;
}[] = []) { paused = true; clearInput(); if (document.pointerLockElement === canvas)
    document.exitPointerLock(); $('action-dialog-content').innerHTML = `<span class="action-eyebrow">THE WAYFARER'S JOURNEY</span><h2 id="action-title">${escape(title)}</h2>${body}<div class="action-dialog-actions">${options.map(o => `<button data-choice="${escape(o.id)}">${escape(o.label)}</button>`).join('')}<button data-choice="close">Return to the valley</button></div>`; if (!dialog.open)
    dialog.showModal(); }
function close() { dialog.close(); paused = false; activeTarget = ''; clearInput(); canvas.focus(); persist(); }
function conversation(d: Dialogue) { show(d.title, `<p>${escape(d.body)}</p>`, d.options); }
function activate() { if (!started || paused || s.dead)
    return; const p = focusPlace(s); if (!p) {
    record(s, 'Face a nearby person, shrine or gate, then press Space.');
    return;
} activeTarget = p.id; const d = dialogueFor(s, p.id); if (d)
    conversation(d); }
function journal() { if (!started || dialog.open)
    return; activeTarget = ''; show('Journal & skills', `<p class="action-current-quest">${escape(objectives[s.quest])}</p><p>Level ${s.level} · ${s.coins} coins · ${s.potions} healing draughts<br>${s.weapon ? 'Dawnglass blade' : 'Traveler’s iron blade'} and shield · ${s.gains}/10 skill gains toward next level</p><div class="action-skill-grid">${(Object.keys(s.skills) as Skill[]).map(k => `<div><span>${k}</span><strong>${s.skills[k]}</strong><small>Practice ${Math.floor(s.practice[k])}/${k === 'Athletics' ? 18 : 3}</small></div>`).join('')}</div><p>Land blade strikes, block incoming blows, hit with starfire, mend injuries or run to improve the skill you use. Ten increases prepare a level; sleep at the Copper Eave bed to advance.</p><details><summary>Controls & travel notes</summary><p>WASD move · mouse or arrows aim · Shift run · Ctrl sneak · E jump · F ready/sheath · LMB strike (hold for power) · RMB/Alt block · J keyboard strike (hold for power) · C cast · 1 starfire / 2 mending · H draught · Space activate · Tab journal · Escape pause.</p><p>Nera waits by the bell north of your starting place. Follow the pale road to Mere Shrine, return for attunement, then continue north to the observatory gate. The bed lies west of the village bell; Orin trades to the east. The gold compass diamond marks your current objective.</p></details><div class="action-log">${s.log.map(t => `<p>${escape(t)}</p>`).join('')}</div>`, [{ id: 'new', label: 'Begin another action journey…' }]); }
function pause() { if (!started || dialog.open)
    return; activeTarget = ''; show('The valley waits', '<p>Your journey is paused. Resume when you are ready.</p>'); }
function capture() { if (paused || !started)
    return; canvas.focus(); if (document.pointerLockElement !== canvas)
    try {
        const request = canvas.requestPointerLock();
        if (request && typeof request.catch === 'function')
            request.catch(() => { $('notice').textContent = 'Mouse capture unavailable. Drag the view or use arrows to aim.'; });
    }
    catch {
        $('notice').textContent = 'Drag the view or use arrows to aim.';
    } }
$('begin').onclick = () => { started = true; $('launch').remove(); canvas.focus(); capture(); persist(); };
$('journal').onclick = journal;
$('pause').onclick = pause;
$('dismiss').onclick = close;
$('strike').onclick = () => { if (started && !paused)
    attack(s); };
$('cast').onclick = () => { if (started && !paused)
    cast(s); };
$('activate').onclick = activate;
$('draught').onclick = () => { if (started && !paused)
    drink(s); };
$('block').addEventListener('pointerdown', e => { if (!started || paused)
    return; blockInput.press(`button:${e.pointerId}`); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); });
$('block').addEventListener('pointerup', e => blockInput.release(`button:${e.pointerId}`));
$('block').addEventListener('pointercancel', e => blockInput.release(`button:${e.pointerId}`));
dialog.addEventListener('cancel', e => { e.preventDefault(); if (s.dead)
    return; close(); });
dialog.addEventListener('click', e => { const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-choice]'); if (!b)
    return; const id = b.dataset.choice!; if (id === 'close') {
    if (!s.dead)
        close();
    return;
} if (id === 'recover') {
    recover(s);
    close();
    return;
} if (id === 'new') {
    show('Begin another action journey?', '<p>This replaces only this mode’s save. The original atlas save remains available.</p>', [{ id: 'reset', label: 'Replace action save and begin' }]);
    return;
} if (id === 'reset') {
    s = freshAction();
    close();
    return;
} if (choose(s, activeTarget, id)) {
    persist();
    const d = dialogueFor(s, activeTarget);
    if (d)
        conversation(d);
    else
        close();
} });
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('pointerdown', e => { if (!started || paused)
    return; if (!locked) {
    dragging = true;
    canvas.setPointerCapture(e.pointerId);
    capture();
} if (e.button === 0 && locked)
    mouseAttack = performance.now(); if (e.button === 2)
    blockInput.press(`mouse:${e.pointerId}`); });
window.addEventListener('pointerup', e => { if (e.button === 0 && mouseAttack && started && !paused) {
    attack(s, performance.now() - mouseAttack >= 450);
    mouseAttack = 0;
} if (e.button === 2)
    blockInput.release(`mouse:${e.pointerId}`); dragging = false; });
window.addEventListener('pointercancel', e => { blockInput.release(`mouse:${e.pointerId}`); dragging = false; });
document.addEventListener('mousemove', e => { if (!started || paused || (!locked && !dragging))
    return; commandAction(s, { type: 'aim', yawDelta: Math.max(-100, Math.min(100, e.movementX)) * 0.003, pitchDelta: -Math.max(-100, Math.min(100, e.movementY)) * 0.0025 }); });
document.addEventListener('pointerlockchange', () => { const wasLocked = locked; locked = document.pointerLockElement === canvas; if (wasLocked && !locked && started && !paused)
    pause(); });
window.addEventListener('keydown', e => { if (!started || dialog.open)
    return; const key = e.key.toLowerCase(); if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'tab', 'alt', 'control', 'shift', 'e', 'f', 'c', 'h', 'j', '1', '2', 'escape'].includes(key))
    e.preventDefault(); if (paused)
    return; keys.add(key); if (key === 'alt') blockInput.press(`keyboard:${e.code || 'Alt'}`); if (e.repeat)
    return; if (key === 'escape') {
    pause();
    return;
} if (key === 'tab') {
    journal();
    return;
} if (key === ' ')
    activate(); if (key === 'e')
    jump(s); if (key === 'f')
    commandAction(s, { type: 'toggle-ready' }); if (key === 'control')
    commandAction(s, { type: 'toggle-sneak' }); if (key === 'c')
    cast(s); if (key === 'h')
    drink(s); if (key === '1')
    commandAction(s, { type: 'select-spell', spell: 'fire' }); if (key === '2')
    commandAction(s, { type: 'select-spell', spell: 'heal' }); if (key === 'j')
    heldAt = performance.now(); });
window.addEventListener('keyup', e => { const key = e.key.toLowerCase(); keys.delete(key); if (key === 'alt') blockInput.release(`keyboard:${e.code || 'Alt'}`); if (key === 'j' && heldAt && started && !paused) {
    attack(s, performance.now() - heldAt >= 450);
    heldAt = 0;
} });
window.addEventListener('blur', () => { clearInput(); if (started && !paused)
    pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) {
    clearInput();
    if (started && !paused)
        pause();
} });
function hud() { const values: [
    string,
    number,
    number
][] = [['health', s.hp, maxHealth(s)], ['mana', s.mana, 80], ['fatigue', s.fatigue, 100]]; for (const [id, value, max] of values) {
    const meter = $(id) as HTMLMeterElement;
    meter.max = max;
    meter.value = value;
    $(id + '-value').textContent = `${Math.ceil(value)} / ${max}`;
}
    const target = objectivePlace(s), focused = focusPlace(s);
    const distance = Math.ceil(Math.hypot(target.x - s.x, target.z - s.z));
    $('objective').textContent = `${objectives[s.quest]} · ${target.name}: ${distance} m${focused ? ` · Space: ${focused.name}` : ''}`; $('location').textContent = s.z < -10 ? 'HOLLOW OBSERVATORY' : 'BELLWETHER VALLEY'; $('equipped').textContent = `${s.ready ? 'Blade & shield' : 'Weapon sheathed'} · ${s.spell === 'fire' ? '1 · Starfire' : '2 · Mending'} · C cast · ${s.potions} draughts`; $('notice').textContent = s.log[0]; $('save-state').textContent = saveStatus; }
function frame(t: number) {
    const dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;
    if (started && !paused && !document.hidden) {
        tickAction(s, { forward: Number(keys.has('w')) - Number(keys.has('s')), strafe: Number(keys.has('d')) - Number(keys.has('a')), turn: Number(keys.has('arrowright')) - Number(keys.has('arrowleft')), look: Number(keys.has('arrowup')) - Number(keys.has('arrowdown')), run: keys.has('shift'), block: blockInput.held }, dt);
        saveTimer += dt;
        if (saveTimer > 2) {
            persist();
            saveTimer = 0;
        }
        if (s.dead) {
            activeTarget = '';
            show('The light returns to you', '<p>Nera can carry you home. Quest progress, victories and discoveries survive. Recovery costs up to eight coins.</p>', [{ id: 'recover', label: 'Wake in Bellwether' }]);
            $('dismiss').hidden = true;
        }
        else
            $('dismiss').hidden = false;
    }
    const held = mouseAttack || heldAt;
    drawAction(c, s, held ? Math.min(1, (t - held) / 450) : 0);
    if (t - lastHud > 100) {
        hud();
        lastHud = t;
    }
    requestAnimationFrame(frame);
}
hud();
requestAnimationFrame(frame);
