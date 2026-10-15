import { type ActionState, worldSolids, places, placePosition, focusEnemy, focusPlace, objectivePlace, angleTo, angleDifference } from './action-domain';
type Vertex = [
    number,
    number,
    number
];
interface Face {
    points: Vertex[];
    color: string;
    shade: number;
}
interface CameraPoint {
    x: number;
    y: number;
    z: number;
}
interface Polygon {
    points: CameraPoint[];
    color: string;
    shade: number;
    depth: number;
}
const face = (points: Vertex[], color: string, shade = 1): Face => ({ points, color, shade });
function box(mesh: Face[], x: number, y: number, z: number, w: number, h: number, d: number, color: string) { const l = x - w / 2, r = x + w / 2, b = z - d / 2, f = z + d / 2, t = y + h; mesh.push(face([[l, y, b], [r, y, b], [r, t, b], [l, t, b]], color, 0.7), face([[l, y, f], [l, t, f], [r, t, f], [r, y, f]], color, 0.9), face([[l, y, b], [l, t, b], [l, t, f], [l, y, f]], color, 0.63), face([[r, y, b], [r, y, f], [r, t, f], [r, t, b]], color, 0.8), face([[l, t, b], [r, t, b], [r, t, f], [l, t, f]], color, 1.1)); }
function pyramid(mesh: Face[], x: number, y: number, z: number, w: number, h: number, d: number, color: string) { const l = x - w / 2, r = x + w / 2, b = z - d / 2, f = z + d / 2; mesh.push(face([[l, y, b], [r, y, b], [x, y + h, z]], color, 0.65), face([[r, y, b], [r, y, f], [x, y + h, z]], color, 0.8), face([[r, y, f], [l, y, f], [x, y + h, z]], color, 1), face([[l, y, f], [l, y, b], [x, y + h, z]], color, 0.7)); }
function person(mesh: Face[], x: number, z: number, coat: string, enemy = false, windup = false, boss = false, time = 0) { const size = boss ? 1.17 : 1; box(mesh, x - 0.16 * size, 0, z, 0.2, 0.65 * size, 0.25, '#393b39'); box(mesh, x + 0.16 * size, 0, z, 0.2, 0.65 * size, 0.25, '#393b39'); box(mesh, x, 0.6 * size, z, 0.7 * size, 0.72 * size, 0.37, coat); box(mesh, x, 1.35 * size, z, 0.37 * size, 0.4 * size, 0.36, enemy ? '#a5a7aa' : '#bc9a75'); box(mesh, x, 1.7 * size, z, 0.44, 0.12, 0.42, enemy ? '#4b5058' : '#584a36'); const armY = windup ? 1.4 : 0.8; box(mesh, x + 0.48, armY, z - 0.15, 0.17, 0.42, 0.2, coat); box(mesh, x - 0.47, 0.75, z - 0.12, 0.18, 0.52, 0.2, coat); if (enemy) {
    box(mesh, x + 0.49, armY + 0.3, z - 0.16, 0.09, 0.85, 0.08, windup ? '#e7aa6b' : '#b4c1c4');
    box(mesh, x - 0.5, 0.7, z - 0.3, 0.42, 0.65, 0.15, '#545e65');
} if (boss)
    pyramid(mesh, x, 1.8, z, 0.8, 0.5, 0.65, '#8c917e'); void time; }
function scene(s: ActionState): Face[] {
    const mesh: Face[] = [];
    for (let x = -16; x < 16; x += 4)
        for (let z = -22; z < 22; z += 4) {
            const green = ((x + z) / 4) % 3 === 0 ? '#60715a' : '#586952';
            mesh.push(face([[x, 0, z], [x + 4, 0, z], [x + 4, 0, z + 4], [x, 0, z + 4]], z < -11 && Math.abs(x) < 6 ? '#626663' : green));
        }
    // A pale road gives a natural path from the village to the shrine and gate.
    for (let z = -22; z < 22; z += 4)
        mesh.push(face([[-1.5, 0.015, z], [1.5, 0.015, z], [1.5, 0.015, z + 4], [-1.5, 0.015, z + 4]], '#9b9476'));
    for (const b of worldSolids(s)) {
        box(mesh, b.x, 0, b.z, b.w, b.h, b.d, b.color);
        if (b.kind === 'house') {
            pyramid(mesh, b.x, b.h, b.z, b.w + 0.7, 2, b.d + 0.7, '#514d45');
            box(mesh, b.x, b.h * 0.1, b.z - b.d / 2 - 0.03, 1.3, 2.1, 0.06, '#353f39');
            for (const dx of [-2, 2])
                box(mesh, b.x + dx, 1.5, b.z - b.d / 2 - 0.04, 0.7, 0.8, 0.07, '#bdab74');
        }
        if (b.kind === 'tree') {
            pyramid(mesh, b.x, 1.5, b.z, 3.8, 3.3, 3.8, '#354e42');
            pyramid(mesh, b.x, 3, b.z, 2.9, 2.8, 2.9, '#416052');
        }
    }
    // Bell, shrine and original observatory apparatus.
    for (const x of [-0.8, 0.8])
        box(mesh, x, 0, 9.4, 0.18, 3, 0.2, '#6a5943');
    box(mesh, 0, 2.8, 9.4, 1.9, 0.17, 0.25, '#6a5943');
    box(mesh, 0, 2, 9.4, 0.65, 0.7, 0.6, '#c5ad66');
    box(mesh, 0, 0, -2, 1.5, 0.65, 1.2, '#a4a38d');
    box(mesh, 0, 0.65, -2, 1, 0.16, 1, '#c5bea0');
    if (s.quest === 1)
        pyramid(mesh, 0, 0.9 + Math.sin(s.time * 3) * 0.08, -2, 0.35, 0.6, 0.35, '#f7d58a');
    if (s.quest < 4) {
        pyramid(mesh, 0, 1.2 + Math.sin(s.time * 2) * 0.1, -19, 0.7, 0.8, 0.7, '#cbbce2');
        pyramid(mesh, 0, 0.8, -19, 0.7, 0.4, 0.7, '#e4c787');
    }
    if (!s.cache)
        box(mesh, -10, 0, -3, 0.9, 0.65, 0.65, '#a28754');
    else
        box(mesh, -10, 0, -3, 0.9, 0.2, 0.65, '#75664d');
    box(mesh, -7, 0, 11, 1.6, 0.5, 2.3, '#6c513b');
    box(mesh, -7, 0.5, 11, 1.5, 0.12, 2.2, '#b99d7a');
    box(mesh, -7, 0.64, 10.4, 1.3, 0.12, 0.6, '#e0d4b1');
    for (const p of places.filter(p => ['nera', 'orin'].includes(p.id))) {
        const pos = placePosition(s, p);
        person(mesh, pos.x, pos.z, p.id === 'nera' ? '#557b7b' : '#a18455');
    }
    for (const e of s.enemies)
        if (e.hp > 0)
            person(mesh, e.x, e.z, e.boss ? '#65566f' : '#805b55', true, e.phase === 'windup', e.boss, s.time);
        else
            box(mesh, e.x, 0.03, e.z, 1.4, 0.18, 0.6, '#5f5354');
    for (const bolt of s.bolts) {
        box(mesh, bolt.x, bolt.y - 0.14, bolt.z, 0.3, 0.3, 0.3, '#e8b4ef');
        pyramid(mesh, bolt.x, bolt.y + 0.16, bolt.z, 0.4, 0.25, 0.4, '#f7d5aa');
    }
    return mesh;
}
function nearClip(points: CameraPoint[]) { const result: CameraPoint[] = []; for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    if (a.z >= 0.08)
        result.push(a);
    if ((a.z >= 0.08) !== (b.z >= 0.08)) {
        const t = (0.08 - a.z) / (b.z - a.z);
        result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: 0.08 });
    }
} return result; }
function color(hex: string, shade: number, depth: number) { const fog = Math.max(0, Math.min(0.8, (depth - 8) / 50)); const values = [1, 3, 5].map((i, index) => Math.round(parseInt(hex.slice(i, i + 2), 16) * shade * (1 - fog) + [116, 135, 128][index] * fog)); return `rgb(${values.map(v => Math.min(255, v)).join(',')})`; }
export function drawAction(c: CanvasRenderingContext2D, s: ActionState, charging = 0) {
    const w = c.canvas.width, h = c.canvas.height, f = w * 0.67;
    const sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, s.quest === 5 ? '#859caa' : '#526e83');
    sky.addColorStop(0.65, '#b0b5a0');
    sky.addColorStop(1, '#6f7d63');
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h);
    const eye = 1.62 + s.y - (s.sneak ? 0.45 : 0), sin = Math.sin(s.yaw), cos = Math.cos(s.yaw), sp = Math.sin(s.pitch), cp = Math.cos(s.pitch);
    const camera = (v: Vertex): CameraPoint => { const dx = v[0] - s.x, dz = v[2] - s.z, dy = v[1] - eye, forward = dx * sin - dz * cos; return { x: dx * cos + dz * sin, y: dy * cp - forward * sp, z: forward * cp + dy * sp }; };
    const polygons: Polygon[] = [];
    for (const face of scene(s)) {
        const points = nearClip(face.points.map(camera));
        if (points.length < 3)
            continue;
        const depth = points.reduce((a, p) => a + p.z, 0) / points.length;
        polygons.push({ ...face, points, depth });
    }
    polygons.sort((a, b) => b.depth - a.depth);
    for (const p of polygons) {
        c.beginPath();
        p.points.forEach((v, i) => { const x = w / 2 + v.x / v.z * f, y = h / 2 - v.y / v.z * f; i ? c.lineTo(x, y) : c.moveTo(x, y); });
        c.closePath();
        c.fillStyle = color(p.color, p.shade, p.depth);
        c.fill();
    }
    // First-person equipped blade and shield; pose follows block and attack state.
    if (s.ready) {
        const swing = s.swing > 0 ? Math.sin((s.swing / (s.swing > 0.4 ? 0.75 : 0.4)) * Math.PI) : 0;
        const bob = Math.sin(s.time * 5) * 2;
        const bx = w * 0.78 - swing * w * 0.28, by = h * 0.9 - swing * h * 0.15 + bob;
        c.save();
        c.translate(bx, by);
        c.rotate(-0.2 - swing * 0.9 - charging * 0.4);
        c.fillStyle = '#6d4c34';
        c.fillRect(-11, -2, 22, 90);
        c.fillStyle = '#c1ad79';
        c.fillRect(-48, -12, 96, 15);
        c.beginPath();
        c.moveTo(-16, -15);
        c.lineTo(-13, -h * 0.38);
        c.lineTo(0, -h * 0.45);
        c.lineTo(15, -h * 0.38);
        c.lineTo(18, -15);
        c.closePath();
        c.fillStyle = s.weapon ? '#d1d8e3' : '#a8b3b4';
        c.fill();
        c.strokeStyle = '#e4ece7';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(0, -20);
        c.lineTo(0, -h * 0.42);
        c.stroke();
        c.restore();
        const sx = s.blocking ? w * 0.45 : w * 0.19, sy = s.blocking ? h * 0.64 : h * 0.94;
        c.save();
        c.translate(sx, sy);
        c.beginPath();
        c.moveTo(-w * 0.1, -h * 0.16);
        c.lineTo(w * 0.1, -h * 0.16);
        c.lineTo(w * 0.095, h * 0.05);
        c.lineTo(0, h * 0.18);
        c.lineTo(-w * 0.095, h * 0.05);
        c.closePath();
        c.fillStyle = '#565c59';
        c.fill();
        c.strokeStyle = '#baac7e';
        c.lineWidth = 8;
        c.stroke();
        c.fillStyle = '#b2a276';
        c.beginPath();
        c.arc(0, 0, 20, 0, Math.PI * 2);
        c.fill();
        c.restore();
    }
    if (s.castCooldown > 0) {
        c.fillStyle = `rgba(210,170,245,${s.castCooldown * 0.2})`;
        c.beginPath();
        c.arc(w * 0.28, h * 0.78, 30 + s.castCooldown * 30, 0, Math.PI * 2);
        c.fill();
    }
    if (s.flash > 0) {
        c.fillStyle = `rgba(150,35,29,${s.flash * 0.7})`;
        c.fillRect(0, 0, w, h);
    }
    c.strokeStyle = '#f2e5c3';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(w / 2 - 7, h / 2);
    c.lineTo(w / 2 - 2, h / 2);
    c.moveTo(w / 2 + 2, h / 2);
    c.lineTo(w / 2 + 7, h / 2);
    c.moveTo(w / 2, h / 2 - 7);
    c.lineTo(w / 2, h / 2 - 2);
    c.moveTo(w / 2, h / 2 + 2);
    c.lineTo(w / 2, h / 2 + 7);
    c.stroke();
    const target = focusEnemy(s);
    if (target) {
        c.fillStyle = '#171d1dcc';
        c.fillRect(w / 2 - 115, h * 0.15, 230, 28);
        c.fillStyle = '#bd6b5c';
        c.fillRect(w / 2 - 111, h * 0.15 + 22, 222 * target.hp / target.maxHp, 3);
        c.fillStyle = '#ede2c5';
        c.font = '14px Georgia';
        c.textAlign = 'center';
        c.fillText(`${target.name}${target.phase === 'windup' ? ' · strike incoming' : ''}`, w / 2, h * 0.15 + 16);
    }
    const place = focusPlace(s);
    if (place) {
        c.fillStyle = '#192523dd';
        c.fillRect(w / 2 - 155, h / 2 + 25, 310, 34);
        c.fillStyle = '#f1dfac';
        c.font = '16px Georgia';
        c.textAlign = 'center';
        c.fillText(`Space · ${place.name}`, w / 2, h / 2 + 48);
    }
    const objective = objectivePlace(s), diff = angleDifference(angleTo(s, objective.x, objective.z), s.yaw);
    const compassW = 280;
    c.fillStyle = '#172221d9';
    c.fillRect(w / 2 - compassW / 2, 20, compassW, 34);
    c.strokeStyle = '#bfae78';
    c.strokeRect(w / 2 - compassW / 2, 20, compassW, 34);
    c.font = '14px Georgia';
    c.textAlign = 'center';
    for (const [letter, a] of [['N', 0], ['E', Math.PI / 2], ['S', Math.PI], ['W', -Math.PI / 2]] as const) {
        const da = angleDifference(a, s.yaw);
        if (Math.abs(da) < 1.4) {
            c.fillStyle = '#e2ddc7';
            c.fillText(letter, w / 2 + da * 95, 43);
        }
    }
    c.fillStyle = '#edcd78';
    c.fillText('◆', w / 2 + Math.max(-1.35, Math.min(1.35, diff)) * 95, 44);
    c.fillStyle = '#f1dfb1';
    c.fillRect(w / 2 - 1, 14, 2, 7);
}
