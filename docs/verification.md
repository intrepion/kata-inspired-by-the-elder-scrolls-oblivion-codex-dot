# Verification evidence
Verified on the user's Mac in visible Chrome through the computer-use tools. Player state was never injected, teleported, or mutated through page scripts. Normal buttons, map clicks and keyboard presses performed the adventure. Read-only DOM snapshots and screenshots supplied observations. Domain tests are separately numerical simulations.

## Automated domain evidence
15 Node test cases cover one-time request/rewards, peaceful position reload, quest locality/attunement, optional rewards and sale bounds, one-time affordable equipment, telegraphed guarding, spell victory/level recovery, death/recovery, retreat/encounter reload, failed resource actions, both full quest finales, lake collision/pathfinding, invalid saves, early guardian lock, and armor/healing.
Strict TypeScript, production Vite build, git diff whitespace checks and npm dependency audit pass locally. Audit reports zero vulnerabilities. GitHub Actions runs npm ci, the full check suite and moderate-or-higher audit.

## Actual browser play
Two complete main quest playthroughs:
1. Release route: opening cancel/reopen, acceptance, pilgrim discovery, shrine ember, peaceful reload, Nera attunement, Bladecraft level choice, relic sale, Dawnglass and healing purchase, Listening Stone spell bonus, deliberate death by guarded combat, reload/recovery, observatory entry, coffer loot, guardian using blade/starfire/charged-blow guard/draught, heart recovery, glass husk and revenant victories, release finale, continued exploration, Nera acknowledgement, armor purchase, inn rest, save/reload.
2. Binding route: reset cancellation then confirmed new journey, interrupted walk/pause, main chain without any discoveries or purchased equipment, partial boss spell then combat reload abandonment, reengagement and explicit retreat, inn rest, base-starfire guardian victory, Starfire talent, remaining foes, binding finale, Nera acknowledgement, map-click walking and optional discovery after completion.

Repeated discoveries provide no second reward. Bought equipment and insufficient money/relics disable applicable controls. Ending rewards occur once. Escape/close cancel dialogue; pause arrow input did not move the avatar. Resume requires a new walking command.

## Visual and responsive evidence
Desktop viewport used naturally. Chrome viewport overrides at 390×844 and 820×1000 were inspected, including the mobile direction controls. Tablet document width was 805 within an 820px viewport. Overrides reset afterward.
Screenshots: valley.jpg, mobile-valley.jpg, release-ending.jpg, binding-ending.jpg.
No localhost application console errors observed. Browser-extension warnings are unrelated to the game.

## Server and delivery
Port 5199 checked free before launching. scripts/serve.py launches a detached session-only loopback Vite production preview, preserving other servers. The actual Chrome page loaded after launcher exit, and HTTP 200 was verified. Restart instructions are in README.md. No public deployment or sidebar registration claimed.

## Limits
This is a compact overhead turn-based adventure, not a first-person reconstruction. Physical phones/tablets, cross-browser behavior and speaker sound quality were not tested. Web Audio enable/pause/resume controls were exercised; no listening-quality claim. Saves are local to the browser and origin. Corrupt-save rejection is domain-tested, not forced into the user's browser storage. No boot/login persistence is installed.
