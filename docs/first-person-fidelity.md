# First-person mechanics slice — 2026-10-15

> Final local native acceptance completed on 2026-10-15. See [final acceptance](LOCAL_ACCEPTANCE_2026-10-15.md) for current browser evidence; pending entries below describe the earlier source handoff.


The previous implementation deliberately selected overhead tile walking and modal turn combat (ADR 0001). Those decisions were the largest fidelity mismatch in the audit. The new default mode provides a bounded embodied fantasy RPG loop while the original atlas remains at `?mode=classic`.

## Research before design

Primary source: Bethesda, *The Elder Scrolls IV: Oblivion Game of the Year Edition PC Manual*, [official hosted PDF](https://assets.ctfassets.net/rporu91m20dc/35hpuLKJ2wsgsaWgKmsqaW/1ba5c2c99d147348094c06d0c8649b79/manual_oblivion-goty_pc_en-us.pdf). Downloaded and read before implementation. Relevant printed pages:

- 4–6: continuous WASD, mouse aiming, E jump, Space activate, F sheath/ready, C cast, Shift run, Alt/RMB block, LMB attack; crosshair, target and compass; health, magicka and fatigue.
- 20–25: Blade, Block, Athletics, Destruction and Restoration skills and their uses.
- 26–27: practicing skills increases them; ten major skill increases prepare advancement; a bed is required to gain the level.
- 28–29: tap basic attack / hold power attack, fatigue-dependent effectiveness, held directional shield blocking and block-then-counter rhythm.

No Bethesda text, maps, art, audio or characters are reused. Nera, the dawn story and all geometry are original.

## Delegated design defaults

The user authorized the program to choose recommended defaults without optional interview waits. Grill with Docs supplied the decision tree and glossary discipline; Implement supplied incremental checks and review. The user's explicit no-commit instruction overrides the Implement skill's commit step. Settled branches:

1. **Foundation:** continuous first-person 3D perspective using local Canvas polygon projection, yaw/pitch, collision and jump height. No external dependency or assets.
2. **Combat:** aim/range/line-of-sight melee; tap/hold normal/power damage; real-time enemies with visible windup and recovery; facing held shield reduction; travelling aim-dependent starfire; selected healing spell; regenerating magicka and fatigue.
3. **Growth:** successful actions train Blade, Block, Destruction or Restoration; running trains Athletics. Ten skill increases allow bed advancement. This is a deliberately accelerated five-skill subset.
4. **Quest:** speak to Nera → recover shrine ember → return for attunement → open gate → defeat guardian → recover meridian heart → return to Nera for dawn binding/reward. Optional coffer, merchant, upgrades, draughts and bed support the loop.
5. **Compatibility:** independent action save key, strict parser, victories/quest persist, living threats reset on load, recovery preserves progress, action reset cannot replace the atlas save.
6. **Acceptance seam:** continuous domain actions/ticks, spatial quest actions and save parsing, plus a later normal-input browser playthrough. Domain fixtures are not browser evidence.

## Controls

| Input | Action |
| --- | --- |
| WASD | Continuous camera-relative walking |
| Mouse / drag / arrows | Aim yaw and pitch |
| Shift | Run |
| Ctrl | Toggle sneak (slower movement, reduced detection distance) |
| E | Jump |
| F | Ready / sheath blade and shield |
| LMB or J tap | Basic strike |
| LMB or J hold ≥450ms, then release | Power attack |
| RMB or Alt held | Directional shield block |
| C | Cast selected spell, including with blade equipped |
| 1 / 2 | Select starfire / mending |
| H | Healing draught |
| Space | Activate what you face nearby |
| Tab | Journal, skills and controls |
| Escape / Pause | Pause |

The on-screen buttons offer the same actions. Mouse capture is optional; drag and arrow aiming remain available. Menus, blur, pointer-lock loss and hidden tabs clear held input and stop simulation. Resume focuses the view; clicking the view captures the mouse again.

## Acceptance route for coordinated browser session

1. Enter the default action journey. Confirm first-person view, continuous movement and mouse/arrow aim, jump and F ready/sheath.
2. Walk north to Nera at the bell, face her and press Space. Accept. Observe objective/compass update.
3. Continue north to the shrine (pale road, ember). Recover the ember. A marauder roams west of the road; approach, face it and observe a strike windup without choosing a turn.
4. Hold a facing shield through a strike, counter during recovery, compare a tap/held attack, and hit with a travelling C starfire. Confirm damage/skill practice in the journal; use H or select 2/C if injured. Avoid trying to attack while the shield is held.
5. Return south to Nera; attune. Rest at the bed west of the bell or trade with Orin to the east if desired. The coffer west of the shrine supplies extra draughts/coins once.
6. Walk north to the observatory gate, Space and open. Defeat the sentinel and Hollow Astronomer with blade and/or spells. Face and activate the lens beyond them to recover the heart.
7. Return to Nera, bind dawn and observe quest completion and 30-coin reward once. Reload and confirm completion/victories persist. Pause/Tab/blur must freeze action and clear held attacks/movement.
8. Open `?mode=classic`; confirm the previous atlas still starts and uses its original save.

## Verification status

`npm run check` passed after implementation: 30/30 tests (fifteen action/input-domain checks and fifteen original atlas checks), strict `tsc --noEmit`, and a Vite production build. `git diff --check` passed. Source-domain checks cover camera-relative normalized movement, gate/wall collision, aim misses, fatigue damage, real-time attacks/blocking, projectile travel, spatial/idempotent quest stages, bed advancement, save validation and recovery. The original `main.ts` and preserved `legacy.ts` SHA-256 match exactly (`add640ef038418f9aa59b9f43ac45c09ce391bcddd03bb2213d5fa9ddc877002`). HTTP verification confirmed the pre-existing preview at port 5199 serves the rebuilt entrypoint without a restart.

Independent Standards and Spec reviews led to four corrections: capped-skill practice stays bounded so saves round-trip; held block inputs retain independent sources; aim/ready/sneak/spell changes use typed domain commands; basic hits preserve enemy windups and recovery, while power attacks can stagger. All corrections have focused regression coverage and are included in the final production build. Normal-input browser acceptance is coordinated by the parent task. No browser playthrough is claimed in this implementation handoff.

## Bounded limitations

One compact valley and open-roof ruin, three enemies, one binding ending, two spells and five accelerated skills. No full character creator, third-person camera, bow, attribute/class system, crime, lockpicking, complex NPC schedules, wilderness streaming, equipment degradation, full physics or campaign. The software 3D renderer uses flat polygon shading and painter ordering. NPC activity consists of Orin's small trading patrol and autonomous enemy patrol/chase/windup/recovery. The original atlas retains the broader authored narrative and its two endings.

Native navigation follow-up: the objective HUD now names the current target and its distance in meters, and mirrors the focused Space activation cue as DOM text. This uses the same `objectivePlace` / `focusPlace` queries as compass and interaction, preserves the active journey, and exposes no debug coordinates.
