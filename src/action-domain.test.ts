import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshAction, tickAction } from './action-domain';
test('continuous movement follows the camera and diagonal input is normalized', () => {
    const straight = freshAction(), diagonal = freshAction();
    tickAction(straight, { forward: 1, strafe: 0 }, 0.2);
    tickAction(diagonal, { forward: 1, strafe: 1 }, 0.2);
    assert.ok(straight.z < 14 && straight.z > 13);
    assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.z - 14) - Math.hypot(straight.x, straight.z - 14)) < 0.001);
});
import { attack, cast, canStand, choose, dialogueFor, focusPlace, restoreAction, angleTo, recover, worldSolids } from './action-domain';
function face(s: ReturnType<typeof freshAction>, x: number, z: number) { s.yaw = angleTo(s, x, z); s.pitch = 0; }
const idle = { forward: 0, strafe: 0 };
function seconds(s: ReturnType<typeof freshAction>, n: number, block = false) { for (let i = 0; i < n * 50; i++)
    tickAction(s, { ...idle, block }, 0.02); }
test('walls and a sealed gate stop continuous travel; attunement opens a traversable gate', () => {
    const s = freshAction();
    s.z = -8;
    s.quest = 3;
    face(s, 0, -10.6);
    assert.equal(focusPlace(s)?.id, 'gate');
    seconds(s, 0.2);
    for (let i = 0; i < 20; i++)
        tickAction(s, { forward: 1, strafe: 0 }, 0.2);
    assert.ok(s.z > -10.1);
    assert.equal(choose(s, 'gate', 'open'), true);
    for (let i = 0; i < 5; i++)
        tickAction(s, { forward: 1, strafe: 0 }, 0.2);
    assert.ok(s.z < -10.6);
    assert.ok(canStand(s, s.x, s.z));
});
test('melee misses behind the player, low fatigue weakens blows, and only landed hits train Blade', () => {
    const s = freshAction(), e = s.enemies[0];
    s.x = e.x;
    s.z = e.z + 2;
    s.yaw = Math.PI;
    attack(s);
    assert.equal(e.hp, 54);
    assert.equal(s.practice.Blade, 0);
    s.cooldown = 0;
    s.fatigue = 100;
    face(s, e.x, e.z);
    attack(s);
    assert.equal(e.hp, 36);
    assert.equal(s.practice.Blade, 1);
    s.cooldown = 0;
    s.fatigue = 0;
    attack(s);
    assert.equal(e.hp, 28);
});
test('an enemy attacks in real time and a facing held shield reduces damage and trains Block', () => {
    const open = freshAction(), blocked = freshAction();
    for (const s of [open, blocked]) {
        s.x = -3;
        s.z = -3.3;
        face(s, -3, -5);
    }
    seconds(open, 1.2);
    seconds(blocked, 1.2, true);
    assert.ok(open.hp < 100);
    assert.ok(blocked.hp > open.hp);
    assert.ok(blocked.practice.Block > 0);
});
test('cast creates a travelling aim-dependent projectile and successful spell use trains Destruction', () => {
    const s = freshAction(), e = s.enemies[0];
    s.x = e.x;
    s.z = e.z + 4;
    face(s, e.x, e.z);
    cast(s);
    assert.equal(e.hp, 54);
    assert.equal(s.mana, 66);
    seconds(s, 0.5);
    assert.equal(e.hp, 29);
    assert.equal(s.practice.Destruction, 1);
});
test('spatial quest loop and discoveries reward once; unattuned gate and remote choices fail', () => {
    const s = freshAction();
    s.z = 12;
    face(s, 0, 10);
    assert.ok(dialogueFor(s, 'nera'));
    assert.equal(choose(s, 'nera', 'accept'), true);
    assert.equal(choose(s, 'nera', 'accept'), false);
    s.x = 0;
    s.z = 0;
    face(s, 0, -2);
    assert.equal(choose(s, 'shrine', 'ember'), true);
    assert.equal(choose(s, 'nera', 'attune'), false);
    s.z = 12;
    face(s, 0, 10);
    assert.equal(choose(s, 'nera', 'attune'), true);
    assert.equal(s.potions, 4);
    s.z = -8;
    face(s, 0, -10.6);
    assert.equal(choose(s, 'gate', 'open'), true);
    s.z = -17;
    face(s, 0, -19);
    assert.equal(choose(s, 'heart', 'heart'), false);
    s.enemies.find(e => e.boss)!.hp = 0;
    assert.equal(choose(s, 'heart', 'heart'), true);
    s.z = 12;
    face(s, 0, 10);
    assert.equal(choose(s, 'nera', 'finish'), true);
    assert.equal(s.quest, 5);
    assert.equal(s.coins, 48);
    assert.equal(choose(s, 'nera', 'finish'), false);
});
test('use-based skill gains prepare advancement; sleeping advances only after ten gains', () => {
    const s = freshAction();
    s.x = -7;
    s.z = 9;
    face(s, -7, 11);
    choose(s, 'bed', 'rest');
    assert.equal(s.level, 1);
    s.gains = 12;
    s.hp = 20;
    assert.equal(choose(s, 'bed', 'rest'), true);
    assert.equal(s.level, 2);
    assert.equal(s.hp, 110);
    assert.equal(s.gains, 2);
});
test('save round-trip preserves victories and original-mode data is rejected; malformed position is contained', () => {
    const s = freshAction();
    s.enemies[0].hp = 0;
    s.quest = 3;
    const saved = restoreAction(JSON.stringify(s));
    assert.equal(saved?.enemies[0].hp, 0);
    assert.equal(saved?.quest, 3);
    assert.equal(restoreAction('{"version":1}'), undefined);
    s.x = Infinity;
    assert.equal(restoreAction(JSON.stringify(s)), undefined);
    s.x = -8;
    s.z = 16;
    const recovered = restoreAction(JSON.stringify(s));
    assert.equal(recovered?.x, 0);
    assert.equal(recovered?.z, 14);
});
test('recovery preserves quest and defeated enemies while resetting live threats', () => {
    const s = freshAction();
    s.quest = 3;
    s.enemies[0].hp = 0;
    s.enemies[1].hp = 10;
    s.dead = true;
    s.hp = 0;
    recover(s);
    assert.equal(s.quest, 3);
    assert.equal(s.enemies[0].hp, 0);
    assert.equal(s.enemies[1].hp, 64);
    assert.equal(s.hp, 100);
    assert.equal(s.z, 14);
});

import { practice } from './action-domain';
test('reaching a skill cap clears practice and repeated use keeps the full save restorable', () => {
    const s = freshAction();
    s.skills.Athletics = 99;
    s.practice.Athletics = 17.9;
    s.quest = 3;
    s.cache = true;
    s.enemies[0].hp = 0;
    practice(s, 'Athletics', 0.2);
    assert.equal(s.skills.Athletics, 100);
    assert.equal(s.practice.Athletics, 0);
    assert.equal(s.gains, 1);
    for (let i = 0; i < 2000; i++) practice(s, 'Athletics', 0.1);
    assert.equal(s.gains, 1);
    const restored = restoreAction(JSON.stringify(s));
    assert.ok(restored);
    assert.equal(restored.skills.Athletics, 100);
    assert.equal(restored.practice.Athletics, 0);
    assert.equal(restored.quest, 3);
    assert.equal(restored.cache, true);
    assert.equal(restored.enemies[0].hp, 0);
});

import { commandAction } from './action-domain';
import { BlockInput } from './action-input';
test('releasing one block source preserves other mouse, keyboard and on-screen holds', () => {
    const sources = ['mouse:1', 'keyboard:AltLeft', 'keyboard:AltRight', 'button:4', 'button:5'];
    for (const first of sources) for (const second of sources.filter(v => v !== first)) {
        const input = new BlockInput(), s = freshAction();
        input.press(first);
        input.press(second);
        input.release(first);
        tickAction(s, { ...idle, block: input.held }, 0.02);
        assert.equal(s.blocking, true, `${second} remains held after ${first} releases`);
        input.release(second);
        tickAction(s, { ...idle, block: input.held }, 0.02);
        assert.equal(s.blocking, false);
    }
    const input = new BlockInput();
    for (const source of sources) input.press(source);
    input.clear();
    assert.equal(input.held, false);
});
test('typed aim commands bound pitch and drive camera-relative movement', () => {
    const s = freshAction();
    commandAction(s, { type: 'aim', yawDelta: Math.PI / 2, pitchDelta: 100 });
    assert.equal(s.pitch, 0.9);
    tickAction(s, { forward: 1, strafe: 0 }, 0.1);
    assert.ok(s.x > 0.3);
    assert.equal(s.z, 14);
    commandAction(s, { type: 'aim', yawDelta: 0, pitchDelta: -100 });
    assert.equal(s.pitch, -0.9);
});
test('typed ready, sneak and spell commands enforce action behavior in the domain', () => {
    const s = freshAction();
    tickAction(s, { ...idle, block: true }, 0.02);
    assert.equal(s.blocking, true);
    commandAction(s, { type: 'toggle-ready' });
    assert.equal(s.ready, false);
    assert.equal(s.blocking, false);
    attack(s);
    assert.equal(s.cooldown, 0);
    commandAction(s, { type: 'toggle-sneak' });
    assert.equal(s.sneak, true);
    tickAction(s, { forward: 1, strafe: 0, run: true }, 0.1);
    assert.ok(s.z > 13.85 && s.z < 14);
    s.hp = 50;
    commandAction(s, { type: 'select-spell', spell: 'heal' });
    cast(s);
    assert.equal(s.hp, 78);
    assert.equal(s.bolts.length, 0);
    commandAction(s, { type: 'select-spell', spell: 'fire' });
    assert.equal(s.spell, 'fire');
});

test('sustained basic strikes cannot suppress the guardian attack windup', () => {
    const s = freshAction();
    for (const e of s.enemies) if (!e.boss) e.hp = 0;
    const guardian = s.enemies.find(e => e.boss)!;
    s.x = guardian.x;
    s.z = guardian.z + 1.7;
    face(s, guardian.x, guardian.z);
    for (let i = 0; i < 200 && guardian.hp > 0; i++) {
        if (s.cooldown === 0) attack(s);
        tickAction(s, idle, 0.02);
    }
    assert.ok(s.hp < 100, 'guardian must be able to retaliate against basic-attack spam');
    assert.equal(guardian.hp, 0);
});
test('a power attack interrupts a windup while a basic strike leaves its timing intact', () => {
    const basic = freshAction(), power = freshAction();
    for (const s of [basic, power]) {
        const e = s.enemies[0];
        s.x = e.x;
        s.z = e.z + 1.7;
        face(s, e.x, e.z);
        e.phase = 'windup';
        e.timer = 0.4;
    }
    attack(basic);
    assert.equal(basic.enemies[0].phase, 'windup');
    assert.equal(basic.enemies[0].timer, 0.4);
    attack(power, true);
    assert.equal(power.enemies[0].phase, 'recover');
    assert.equal(power.enemies[0].timer, 0.7);
});
