# First-person fidelity update

The default journey now uses a continuous first-person 3D camera, aim-dependent blade/block/spell action and use-based skill growth. Follow Nera’s ember quest into the observatory and return its dawn. See [controls, source research and acceptance route](docs/first-person-fidelity.md).

Preview: http://localhost:5199 · [Original atlas mode](http://localhost:5199/?mode=classic)

The original atlas and its browser save remain under `?mode=classic`; the action journey has a separate save. This is a bounded local vertical slice, not a full recreation. Production/browser acceptance status is recorded by the fidelity program; the original delivery notes below describe the atlas.

## Default action controls

WASD walks continuously relative to the first-person camera; mouse/drag/arrows aim. Shift runs, E jumps, F readies or sheathes the blade, J or left mouse taps/holds a strike, and Alt or right mouse holds a facing block. C casts the spell selected with 1/2; H uses a draught. Space activates the nearby object you face. Tab opens the journal and Escape pauses. Blur pauses and clears held input. [Full controls and separate action-save contract](docs/first-person-fidelity.md) · [completed native acceptance and 30-test/build result](docs/LOCAL_ACCEPTANCE_2026-10-15.md).

## Original atlas (`?mode=classic`)

The following historical delivery notes apply only to the overhead atlas and its original save.
An original compact fantasy exploration RPG. Walk Bellwether Valley, trade with its people, descend beneath a ruined observatory, and choose the fate of a borrowed dawn.

Inspired by the freedom to wander, civic conversations, ruins and character growth associated with fantasy exploration RPGs. This is an overhead tactical adventure, with entirely original world, names, dialogue, maps, procedural artwork and synthesized music. It does not reproduce a commercial game's assets or story.

## Play locally
Requires Node.js 24 and Python 3. No paid services or public deployment.
```sh
npm ci
npm run build
python3 scripts/serve.py 5199
```
Open http://127.0.0.1:5199/ in Chrome. The preview launches in a detached session, logs to preview.log and writes its PID to .server.pid. It persists after the task terminal exits, until the process stops or the Mac restarts. No boot/login autostart. The launcher refuses an occupied port and does not kill any server; choose another free port if needed. For foreground development: `npm run dev -- --port 5199 --strictPort` (after ensuring the port is free).

### Atlas controls and rules
- Click land or a named landmark to walk along a real path; enemies interrupt travel.
- WASD / arrows move one tile. E interacts with a nearby place. Mobile arrow buttons do the same.
- Close dialogue or press Escape to cancel it. No quest changes until selecting its action.
- Blade attacks cost no mana. Starfire costs six mana. Guard restores six and greatly reduces the next blow. Charged attacks are telegraphed.
- Draughts restore 32 health and cost a combat turn. Retreat returns to the village; the enemy recovers.
- Orin buys relics, sells healing and equips purchased blade/mail automatically. Quest items cannot be sold.
- XP grants levels, full resources and a talent to spend in Pack. Rest is free at the Copper Eave.
- Death requires recovery, losing up to eight coins and keeping all possessions/progress.
- Every world step and action autosaves on this browser. Save journey saves manually. Reload keeps peaceful position/progress; a live encounter is abandoned to the village with current resources. Storage failures appear visibly. Saves do not sync between browsers.
- Pause stops walking; resume requires a new travel command. New journey requires a second confirmation.
- Both endings complete the main chain and leave the world open for remaining discoveries and trading. Enemies and one-time rewards stay resolved. There are no endless respawns or additional postgame quests.

### Atlas adventure
One valley, one observatory, three named village services, three optional discoveries, three enemy encounters including the guardian, distinct blade and magic routes, two equipment purchases, two talents, and two authored finale choices. The main quest is complete; the world is deliberately compact.

### Atlas verification
`npm run check` runs domain tests, strict TypeScript and production build.
`npm audit --audit-level=moderate` checks dependencies. GitHub Actions repeats these gates on every push.
See [verification](docs/verification.md), [reviews](docs/reviews.md), and [screenshots](docs/screenshots).

Actual Mac Chrome play is separate from domain simulation. Responsive Chrome checks are not physical phone/tablet tests. Audio activation was checked; speaker quality was not judged. No first-person/AAA fidelity, multiplayer, cloud saving or public hosting is claimed.
