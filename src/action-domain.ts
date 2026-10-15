/** Continuous first-person slice. No DOM, storage, or renderer dependencies. */
export interface Solid {
    x: number;
    z: number;
    w: number;
    d: number;
    h: number;
    color: string;
    kind?: 'house' | 'wall' | 'stone' | 'tree';
}
export interface Enemy {
    id: string;
    name: string;
    x: number;
    z: number;
    homeX: number;
    homeZ: number;
    hp: number;
    maxHp: number;
    phase: 'patrol' | 'chase' | 'windup' | 'recover';
    timer: number;
    boss: boolean;
}
export type Skill = 'Blade' | 'Block' | 'Destruction' | 'Restoration' | 'Athletics';
export interface ActionState {
    version: 1;
    x: number;
    z: number;
    y: number;
    vy: number;
    yaw: number;
    pitch: number;
    hp: number;
    mana: number;
    fatigue: number;
    level: number;
    coins: number;
    potions: number;
    quest: number;
    gateOpen: boolean;
    cache: boolean;
    weapon: boolean;
    ready: boolean;
    sneak: boolean;
    skills: Record<Skill, number>;
    practice: Record<Skill, number>;
    gains: number;
    enemies: Enemy[];
    bolts: Bolt[];
    cooldown: number;
    castCooldown: number;
    swing: number;
    flash: number;
    time: number;
    spell: 'fire' | 'heal';
    blocking: boolean;
    dead: boolean;
    log: string[];
}
export interface Bolt {
    x: number;
    z: number;
    y: number;
    dx: number;
    dz: number;
    dy: number;
    life: number;
}
export interface Input {
    forward: number;
    strafe: number;
    turn?: number;
    look?: number;
    run?: boolean;
    block?: boolean;
}
export type ActionCommand =
    | { type: 'aim'; yawDelta: number; pitchDelta: number }
    | { type: 'toggle-ready' }
    | { type: 'toggle-sneak' }
    | { type: 'select-spell'; spell: ActionState['spell'] }
    | { type: 'release-block' };

export function commandAction(s: ActionState, command: ActionCommand) {
    if (command.type === 'release-block') {
        s.blocking = false;
        return;
    }
    if (s.dead) return;
    switch (command.type) {
        case 'aim':
            if (!Number.isFinite(command.yawDelta) || !Number.isFinite(command.pitchDelta)) return;
            s.yaw += command.yawDelta;
            s.pitch = Math.max(-0.9, Math.min(0.9, s.pitch + command.pitchDelta));
            break;
        case 'toggle-ready':
            s.ready = !s.ready;
            s.blocking = false;
            break;
        case 'toggle-sneak':
            s.sneak = !s.sneak;
            break;
        case 'select-spell':
            s.spell = command.spell;
            break;
    }
}

export interface Place {
    id: string;
    name: string;
    x: number;
    z: number;
}
export interface Dialogue {
    title: string;
    body: string;
    options: {
        id: string;
        label: string;
    }[];
}
export const places: Place[] = [{ id: 'nera', name: 'Nera, bellkeeper', x: 0, z: 10 }, { id: 'orin', name: 'Orin, provisioner', x: 7, z: 11 }, { id: 'bed', name: 'Copper Eave bed', x: -7, z: 11 }, { id: 'shrine', name: 'Mere Shrine', x: 0, z: -2 }, { id: 'gate', name: 'Observatory gate', x: 0, z: -10.6 }, { id: 'heart', name: 'Meridian lens', x: 0, z: -19 }, { id: 'cache', name: 'Pilgrim coffer', x: -10, z: -3 }];
export const solids: Solid[] = [
    { x: -16.5, z: 0, w: 1, d: 45, h: 5, color: '#526455', kind: 'wall' }, { x: 16.5, z: 0, w: 1, d: 45, h: 5, color: '#526455', kind: 'wall' },
    { x: 0, z: -22.5, w: 34, d: 1, h: 5, color: '#526455', kind: 'wall' }, { x: 0, z: 22.5, w: 34, d: 1, h: 5, color: '#526455', kind: 'wall' },
    { x: -8, z: 16, w: 7, d: 6, h: 3.3, color: '#76634f', kind: 'house' }, { x: 8, z: 16, w: 7, d: 6, h: 3.3, color: '#74654f', kind: 'house' },
    { x: -4.4, z: -10.6, w: 5, d: 0.8, h: 3.4, color: '#677278', kind: 'wall' }, { x: 4.4, z: -10.6, w: 5, d: 0.8, h: 3.4, color: '#677278', kind: 'wall' },
    { x: -6.5, z: -16, w: 0.8, d: 11, h: 3.6, color: '#59666a', kind: 'wall' }, { x: 6.5, z: -16, w: 0.8, d: 11, h: 3.6, color: '#59666a', kind: 'wall' },
    { x: 0, z: -21.3, w: 13, d: 0.8, h: 3.6, color: '#59666a', kind: 'wall' },
    ...[-1, 1].flatMap(side => [-7, -1, 5].map((z, i) => ({ x: side * (10 + i % 2 * 2), z, w: 0.65, d: 0.65, h: 3.6, color: '#55483a', kind: 'tree' as const }))),
    { x: 0, z: -19.5, w: 1.5, d: 1, h: 0.8, color: '#79838b', kind: 'stone' },
    { x: -3.7, z: -16, w: 0.8, d: 0.8, h: 2.7, color: '#6f7b7c', kind: 'stone' }, { x: 3.7, z: -16, w: 0.8, d: 0.8, h: 2.7, color: '#6f7b7c', kind: 'stone' },
];
const gate: Solid = { x: 0, z: -10.6, w: 3.8, d: 0.5, h: 3, color: '#7c715c', kind: 'wall' };
export const worldSolids = (s: ActionState) => s.gateOpen ? solids : [...solids, gate];
const skills = (): Record<Skill, number> => ({ Blade: 25, Block: 25, Destruction: 25, Restoration: 25, Athletics: 25 });
const enemy = (id: string, name: string, x: number, z: number, hp: number, boss = false): Enemy => ({ id, name, x, z, homeX: x, homeZ: z, hp, maxHp: hp, phase: 'patrol', timer: 0, boss });
export function freshAction(): ActionState { return { version: 1, x: 0, z: 14, y: 0, vy: 0, yaw: 0, pitch: 0, hp: 100, mana: 80, fatigue: 100, level: 1, coins: 18, potions: 3, quest: 0, gateOpen: false, cache: false, weapon: false, ready: true, sneak: false, skills: skills(), practice: { Blade: 0, Block: 0, Destruction: 0, Restoration: 0, Athletics: 0 }, gains: 0, enemies: [enemy('briar', 'Briar marauder', -3, -5, 54), enemy('sentinel', 'Hollow sentinel', 3, -14, 64), enemy('astronomer', 'Hollow Astronomer', 0, -17.5, 125, true)], bolts: [], cooldown: 0, castCooldown: 0, swing: 0, flash: 0, time: 0, spell: 'fire', blocking: false, dead: false, log: ['Speak to Nera at the bell ahead. Space activates what you face.'] }; }
export const maxHealth = (s: ActionState) => 100 + (s.level - 1) * 10;
export function record(s: ActionState, message: string) { s.log.unshift(message); s.log = s.log.slice(0, 6); }
export function practice(s: ActionState, skill: Skill, amount = 1) {
    if (s.skills[skill] >= 100) {
        s.practice[skill] = 0;
        return;
    }
    s.practice[skill] += amount;
    const threshold = skill === 'Athletics' ? 18 : 3;
    while (s.practice[skill] >= threshold && s.skills[skill] < 100) {
        s.practice[skill] -= threshold;
        s.skills[skill]++;
        s.gains++;
        record(s, `${skill} increased to ${s.skills[skill]}.${s.gains >= 10 ? ' Rest in the Copper Eave bed to advance a level.' : ''}`);
    }
    if (s.skills[skill] === 100) s.practice[skill] = 0;
}
export function canStand(s: ActionState, x: number, z: number, radius = 0.28) { return worldSolids(s).every(b => x + radius <= b.x - b.w / 2 || x - radius >= b.x + b.w / 2 || z + radius <= b.z - b.d / 2 || z - radius >= b.z + b.d / 2); }
function move(s: ActionState, dx: number, dz: number) { if (canStand(s, s.x + dx, s.z))
    s.x += dx; if (canStand(s, s.x, s.z + dz))
    s.z += dz; }
export function lineClear(s: ActionState, x: number, z: number, tx: number, tz: number) { const d = Math.hypot(tx - x, tz - z), steps = Math.ceil(d / 0.12); for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (!canStand(s, x + (tx - x) * t, z + (tz - z) * t, 0))
        return false;
} return true; }
export const angleTo = (s: ActionState, x: number, z: number) => Math.atan2(x - s.x, -(z - s.z));
export const angleDifference = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
export function placePosition(s: ActionState, p: Place) { return p.id === 'orin' ? { ...p, x: p.x + Math.sin(s.time * 0.18) * 0.7 } : p; }
function placeVisible(s: ActionState, p: Place) {
    // Gate activation aims at its front surface, rather than tracing through the gate itself.
    const distance = Math.hypot(p.x - s.x, p.z - s.z), inset = p.id === 'gate' ? Math.min(0.5, distance) : 0;
    const ratio = distance > 0 ? inset / distance : 0;
    return lineClear(s, s.x, s.z, p.x + (s.x - p.x) * ratio, p.z + (s.z - p.z) * ratio);
}
export function focusPlace(s: ActionState): Place | undefined { return places.map(p => placePosition(s, p)).filter(p => Math.hypot(p.x - s.x, p.z - s.z) < 2.9 && Math.abs(angleDifference(angleTo(s, p.x, p.z), s.yaw)) < 0.48 && Math.abs(s.pitch) < 0.75 && placeVisible(s, p)).sort((a, b) => Math.hypot(a.x - s.x, a.z - s.z) - Math.hypot(b.x - s.x, b.z - s.z))[0]; }
export function focusEnemy(s: ActionState, range = 24) { return s.enemies.filter(e => e.hp > 0 && Math.hypot(e.x - s.x, e.z - s.z) < range && Math.abs(angleDifference(angleTo(s, e.x, e.z), s.yaw)) < 0.25 && Math.abs(s.pitch) < 0.4 && lineClear(s, s.x, s.z, e.x, e.z)).sort((a, b) => Math.hypot(a.x - s.x, a.z - s.z) - Math.hypot(b.x - s.x, b.z - s.z))[0]; }
function woundEnemy(s: ActionState, e: Enemy, damage: number, stagger = false) {
    e.hp = Math.max(0, e.hp - damage);
    if (!e.hp) {
        record(s, `${e.name} defeated. ${e.boss ? 'The meridian lens is within reach.' : 'The road is safer.'}`);
        s.coins += e.boss ? 12 : 5;
    } else if (stagger) {
        // Basic hits and spells preserve telegraphed strikes and natural recovery.
        e.phase = 'recover';
        e.timer = 0.7;
    }
}
export function attack(s: ActionState, power = false) { if (s.dead || !s.ready || s.blocking || s.cooldown > 0)
    return; const cost = power ? 28 : 9, ratio = 0.45 + 0.55 * s.fatigue / 100; s.fatigue = Math.max(0, s.fatigue - cost); s.cooldown = power ? 0.95 : 0.43; s.swing = power ? 0.75 : 0.4; const e = focusEnemy(s, 2.5); if (e) {
    const damage = Math.round((power ? 34 : 18) * (1 + (s.skills.Blade - 25) * 0.025) * (s.weapon ? 1.2 : 1) * ratio);
    woundEnemy(s, e, damage, power);
    practice(s, 'Blade');
    record(s, `${power ? 'Power attack' : 'Blade strike'}: ${damage} damage.`);
}
else
    record(s, 'Your blade cuts empty air. Aim and close the distance.'); }
export function cast(s: ActionState) { if (s.dead || s.castCooldown > 0)
    return; const cost = s.spell === 'heal' ? 18 : 14; if (s.mana < cost) {
    record(s, 'Not enough magicka. Let it regenerate.');
    return;
} if (s.spell === 'heal' && s.hp >= maxHealth(s)) {
    record(s, 'Your health is already full.');
    return;
} s.mana -= cost; s.castCooldown = 0.8; if (s.spell === 'heal') {
    s.hp = Math.min(maxHealth(s), s.hp + 28 + (s.skills.Restoration - 25));
    practice(s, 'Restoration');
    record(s, 'Mending light restores your health.');
    return;
} const pitch = s.pitch; s.bolts.push({ x: s.x + Math.sin(s.yaw) * 0.4, z: s.z - Math.cos(s.yaw) * 0.4, y: 1.25 + s.y, dx: Math.sin(s.yaw) * Math.cos(pitch) * 11, dz: -Math.cos(s.yaw) * Math.cos(pitch) * 11, dy: Math.sin(pitch) * 11, life: 2.5 }); }
export function jump(s: ActionState) { if (!s.dead && s.y === 0) {
    s.vy = 4.5;
    s.fatigue = Math.max(0, s.fatigue - 7);
} }
export function drink(s: ActionState) { if (!s.dead && s.potions > 0 && s.hp < maxHealth(s)) {
    s.potions--;
    s.hp = Math.min(maxHealth(s), s.hp + 45);
    record(s, 'Healing draught consumed.');
} }
export function recover(s: ActionState) { if (!s.dead)
    return; s.x = 0; s.z = 14; s.y = 0; s.vy = 0; s.yaw = 0; s.hp = maxHealth(s); s.mana = 80; s.fatigue = 100; s.dead = false; s.coins = Math.max(0, s.coins - 8); for (const e of s.enemies)
    if (e.hp > 0) {
        e.hp = e.maxHp;
        e.x = e.homeX;
        e.z = e.homeZ;
        e.phase = 'patrol';
        e.timer = 0;
    } s.bolts = []; record(s, 'Nera carried you home. Quest items and completed discoveries survive.'); }
function hitPlayer(s: ActionState, e: Enemy) { const facing = Math.abs(angleDifference(angleTo(s, e.x, e.z), s.yaw)) < 1.1; const blocked = s.blocking && s.ready && facing && s.fatigue > 3; const amount = blocked ? 3 : (e.boss ? 18 : 12); s.hp = Math.max(0, s.hp - amount); s.flash = blocked ? 0.1 : 0.4; if (blocked) {
    s.fatigue = Math.max(0, s.fatigue - 9);
    practice(s, 'Block');
    record(s, 'Shield block. Counter while your foe recovers.');
}
else
    record(s, `${e.name} hits for ${amount}.`); if (!s.hp) {
    s.dead = true;
    s.blocking = false;
    record(s, 'You fell. Recover at Bellwether to continue.');
} }
export function tickAction(s: ActionState, input: Input, seconds: number) {
    if (s.dead)
        return;
    let remaining = Math.max(0, Math.min(seconds, 0.25));
    while (remaining > 0) {
        const dt = Math.min(remaining, 0.02);
        remaining -= dt;
        s.time += dt;
        s.yaw += (input.turn ?? 0) * dt * 1.9;
        s.pitch = Math.max(-0.9, Math.min(0.9, s.pitch + (input.look ?? 0) * dt * 1.3));
        s.blocking = !!input.block && s.ready && s.cooldown <= 0;
        s.cooldown = Math.max(0, s.cooldown - dt);
        s.castCooldown = Math.max(0, s.castCooldown - dt);
        s.swing = Math.max(0, s.swing - dt);
        s.flash = Math.max(0, s.flash - dt);
        const mag = Math.hypot(input.forward, input.strafe), scale = mag > 1 ? 1 / mag : 1;
        const speed = (s.sneak ? 1.4 : input.run ? 4.7 : 3.1) * (s.blocking ? 0.48 : 1);
        const dx = (Math.sin(s.yaw) * input.forward + Math.cos(s.yaw) * input.strafe) * scale * speed * dt, dz = (-Math.cos(s.yaw) * input.forward + Math.sin(s.yaw) * input.strafe) * scale * speed * dt;
        const ox = s.x, oz = s.z;
        move(s, dx, dz);
        if (input.run)
            practice(s, 'Athletics', Math.hypot(s.x - ox, s.z - oz));
        s.mana = Math.min(80, s.mana + 3.8 * dt);
        s.fatigue = Math.min(100, s.fatigue + (input.run && mag ? 3 : 13) * dt);
        if (s.y > 0 || s.vy > 0) {
            s.vy -= 12 * dt;
            s.y = Math.max(0, s.y + s.vy * dt);
            if (s.y === 0)
                s.vy = 0;
        }
        for (const e of s.enemies) {
            if (e.hp <= 0)
                continue;
            const distance = Math.hypot(e.x - s.x, e.z - s.z);
            const visible = lineClear(s, e.x, e.z, s.x, s.z);
            if (e.phase === 'windup') {
                e.timer -= dt;
                if (e.timer <= 0) {
                    if (distance < 2.5 && visible && s.y < 0.8)
                        hitPlayer(s, e);
                    e.phase = 'recover';
                    e.timer = e.boss ? 1.4 : 1.15;
                }
            }
            else if (e.phase === 'recover') {
                e.timer -= dt;
                if (e.timer <= 0)
                    e.phase = 'chase';
            }
            else if (visible && distance < (s.sneak ? 4 : 8)) {
                if (distance < 1.9) {
                    e.phase = 'windup';
                    e.timer = e.boss ? 1 : 0.85;
                }
                else {
                    e.phase = 'chase';
                    const step = (e.boss ? 1.55 : 1.8) * dt;
                    const nx = e.x + (s.x - e.x) / distance * step, nz = e.z + (s.z - e.z) / distance * step;
                    if (canStand(s, nx, nz, 0.35)) {
                        e.x = nx;
                        e.z = nz;
                    }
                }
            }
            else {
                e.phase = 'patrol';
                const tx = e.homeX + Math.sin(s.time * 0.5) * 0.7, tz = e.homeZ + Math.cos(s.time * 0.5) * 0.5;
                if (canStand(s, tx, tz, 0.35)) {
                    e.x = tx;
                    e.z = tz;
                }
            }
        }
        for (const b of s.bolts) {
            b.x += b.dx * dt;
            b.z += b.dz * dt;
            b.y += b.dy * dt;
            b.life -= dt;
            if (b.y < 0 || !canStand(s, b.x, b.z, 0)) {
                b.life = 0;
                continue;
            }
            const hit = s.enemies.find(e => e.hp > 0 && Math.hypot(e.x - b.x, e.z - b.z) < 0.65 && b.y > 0.15 && b.y < 2.3);
            if (hit) {
                const damage = 25 + (s.skills.Destruction - 25);
                woundEnemy(s, hit, damage);
                practice(s, 'Destruction');
                record(s, `Starfire hits ${hit.name}: ${damage} damage.`);
                b.life = 0;
            }
        }
        s.bolts = s.bolts.filter(b => b.life > 0);
        if (s.dead)
            break;
    }
}
export const objectives = ['Speak with Nera by the village bell.', 'Recover the ember at Mere Shrine, north along the road.', 'Return the ember to Nera for attunement.', 'Open the observatory gate; defeat its guardian and recover the heart.', 'Return the meridian heart to Nera.', 'Dawn restored. Continue exploring or rest at the inn.'];
export function objectivePlace(s: ActionState) { return places.find(p => p.id === (s.quest === 1 ? 'shrine' : s.quest === 3 ? (s.gateOpen ? 'heart' : 'gate') : 'nera'))!; }
export function dialogueFor(s: ActionState, id: string): Dialogue | undefined { if (focusPlace(s)?.id !== id || s.dead)
    return; const options: Dialogue['options'] = []; let body = ''; const p = places.find(p => p.id === id)!; if (id === 'nera') {
    body = ['“The dawn is trapped in the observatory. Bring me the ember from Mere Shrine so I can open its gate.”', '“Mere Shrine lies north along the road. Watch for marauders. You may use blade or starfire.”', '“You found it. I can attune this ember to the observatory gate. Its guardian still holds the dawn.”', '“The attuned ember opens the northern gate. The lens beyond its guardian holds our dawn.”', '“The meridian heart! Will you bind its light to our bell and give this valley a morning?”', '“The bell rings again. You are always welcome here, wayfarer.”'][s.quest];
    if (s.quest === 0)
        options.push({ id: 'accept', label: 'I will recover the ember' });
    if (s.quest === 2)
        options.push({ id: 'attune', label: 'Attune the ember' });
    if (s.quest === 4)
        options.push({ id: 'finish', label: 'Return the heart · bind the dawn' });
}
else if (id === 'shrine') {
    body = s.quest === 1 ? 'An ember warms the old shrine. Its inscription speaks of a dawn held below the observatory.' : 'The empty shrine remembers a warm light.';
    if (s.quest === 1)
        options.push({ id: 'ember', label: 'Recover the sleeping ember' });
}
else if (id === 'gate') {
    body = s.gateOpen ? 'The gate stands open. The guardian and its lens lie to the north.' : s.quest >= 3 ? 'Your attuned ember glows against the gate.' : 'The gate is sealed. Nera must attune an ember from Mere Shrine.';
    if (!s.gateOpen && s.quest >= 3)
        options.push({ id: 'open', label: 'Open the observatory gate' });
}
else if (id === 'heart') {
    const alive = s.enemies.some(e => e.boss && e.hp > 0);
    body = alive ? 'The Hollow Astronomer still guards this lens.' : 'The meridian heart floats above the lens. Bellwether waits for its dawn.';
    if (!alive && s.quest === 3)
        options.push({ id: 'heart', label: 'Recover the meridian heart' });
}
else if (id === 'bed') {
    body = `The Copper Eave offers a safe bed. Health, magicka and fatigue recover fully.${s.gains >= 10 ? ' Your practice has prepared you to advance a level.' : ''}`;
    options.push({ id: 'rest', label: s.gains >= 10 ? 'Sleep and advance a level' : 'Sleep until rested' });
}
else if (id === 'orin') {
    body = `“A sharp blade and a full flask, friend.” You carry ${s.coins} coins and ${s.potions} draughts.`;
    if (s.coins >= 6)
        options.push({ id: 'buy', label: 'Healing draught · 6 coins' });
    if (!s.weapon && s.coins >= 24)
        options.push({ id: 'weapon', label: 'Dawnglass blade · 24 coins' });
}
else {
    body = s.cache ? 'The pilgrim coffer is empty.' : 'A pilgrim coffer holds two draughts and twelve coins.';
    if (!s.cache)
        options.push({ id: 'cache', label: 'Take the supplies' });
} return { title: p.name, body, options }; }
export function choose(s: ActionState, target: string, option: string) { const d = dialogueFor(s, target); if (!d?.options.some(o => o.id === option))
    return false; if (option === 'accept')
    s.quest = 1; if (option === 'ember')
    s.quest = 2; if (option === 'attune') {
    s.quest = 3;
    s.potions++;
} if (option === 'open')
    s.gateOpen = true; if (option === 'heart')
    s.quest = 4; if (option === 'finish') {
    s.quest = 5;
    s.coins += 30;
    record(s, 'Dawn is bound to Bellwether. Quest complete · 30 coins.');
} if (option === 'rest') {
    while (s.gains >= 10) {
        s.gains -= 10;
        s.level++;
    }
    s.hp = maxHealth(s);
    s.mana = 80;
    s.fatigue = 100;
    record(s, `Rested at the Copper Eave. Level ${s.level}.`);
} if (option === 'buy') {
    s.coins -= 6;
    s.potions++;
} if (option === 'weapon') {
    s.coins -= 24;
    s.weapon = true;
} if (option === 'cache') {
    s.cache = true;
    s.potions += 2;
    s.coins += 12;
} if (['accept', 'ember', 'attune', 'heart'].includes(option))
    record(s, objectives[s.quest]); return true; }
export function restoreAction(raw: string): ActionState | undefined {
    try {
        const v: unknown = JSON.parse(raw);
        if (!v || typeof v !== 'object' || Array.isArray(v))
            return;
        const a = v as Record<string, unknown>, s = freshAction();
        if (a.version !== 1)
            return;
        for (const k of ['x', 'z', 'yaw', 'pitch', 'hp', 'mana', 'fatigue', 'level', 'coins', 'potions', 'quest', 'gains'] as const) {
            const n = a[k];
            if (typeof n !== 'number' || !Number.isFinite(n))
                return;
        }
        if ((a.quest as number) % 1 || Number(a.quest) < 0 || Number(a.quest) > 5 || Number(a.level) < 1 || Number(a.level) > 50 || Number(a.level) % 1 || Number(a.coins) < 0 || Number(a.coins) > 100000 || Number(a.potions) < 0 || Number(a.potions) > 1000 || Number(a.gains) < 0 || Number(a.gains) > 1000)
            return;
        for (const k of ['x', 'z', 'yaw', 'pitch', 'hp', 'mana', 'fatigue', 'level', 'coins', 'potions', 'quest', 'gains'] as const)
            s[k] = a[k] as number;
        for (const k of ['gateOpen', 'cache', 'weapon', 'ready', 'sneak', 'dead'] as const) {
            if (typeof a[k] !== 'boolean')
                return;
            s[k] = a[k] as boolean;
        }
        if (s.hp < 0 || s.hp > maxHealth(s) || s.mana < 0 || s.mana > 80 || s.fatigue < 0 || s.fatigue > 100 || Math.abs(s.pitch) > 0.9 || Math.abs(s.x) > 16 || Math.abs(s.z) > 22)
            return;
        for (const key of ['skills', 'practice'] as const) {
            if (!a[key] || typeof a[key] !== 'object' || Array.isArray(a[key]))
                return;
            const values = a[key] as Record<string, unknown>;
            for (const skill of Object.keys(s.skills) as Skill[]) {
                const n = values[skill];
                if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 100 || key === 'skills' && (n < 25 || n % 1))
                    return;
                s[key][skill] = n;
            }
        }
        if (!Array.isArray(a.enemies) || a.enemies.length !== s.enemies.length)
            return;
        for (const e of s.enemies) {
            const saved = a.enemies.find((v: unknown) => v && typeof v === 'object' && (v as Enemy).id === e.id) as Enemy | undefined;
            if (!saved || typeof saved.hp !== 'number' || !Number.isFinite(saved.hp) || saved.hp < 0 || saved.hp > e.maxHp)
                return;
            if (saved.hp === 0)
                e.hp = 0;
        }
        s.dead = s.hp === 0;
        if (!canStand(s, s.x, s.z)) {
            s.x = 0;
            s.z = 14;
        }
        s.log = ['Journey restored. Living enemies returned to their posts; your victories and quest progress remain.'];
        return s;
    }
    catch {
        return;
    }
}
