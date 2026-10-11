# The Quiet Meridian
Design choices delegated by the user; no interactive interview occurred. Exact repository deliberately omits IV.

A compact original overhead fantasy adventure, built from original procedural Canvas artwork and synthesized Web Audio. Inspiration is free exploration, civic NPCs, ruins and flexible character growth. No commercial text, lore, maps, assets or external media.

## Decision tree, settled by delegated recommendations
- Scope: one open valley and one observatory dungeon; 15–25 minute vertical slice.
- Presentation: illustrated map with moving avatar, atmospheric landscape, readable HTML panels; keyboard, map click pathfinding and touch arrows.
- Agency: explore destinations in any order; guardian remains locked until a keeper attunes the ember. Optional lore/cache gives permanent advantage.
- Main chain: accept Nera's request; recover ember at Mere Shrine; return to Nera for attunement; defeat observatory guardian; return to shrine and choose to bind or release the dawn. Each ending changes epilogue and valley palette; continued exploration remains available.
- Combat: discrete player/enemy turns, blade, ranged spell, guard restoring mana, potion, retreat. Telegraphs permit guard timing; defeated enemies stay defeated; retreat restores enemy health. No attack while dialogs/pause are open.
- Economy: limited starting coins, buy healing, sell recovered relics, purchase blade/mail once. Rewards and discoveries only once. Equipped upgrades automatic.
- Growth: XP thresholds; choose blade or spell talent on each earned level. Optional content and quest grant XP.
- Death: manual recovery to village at full resources; lose up to 8 coins, keep quests/loot. Combat resets.
- Saves: versioned validated localStorage snapshot after every action, manual save and reload; no combat resume, reload abandons fight at safe location. Corrupt/incompatible saves start safely with notice. Storage failure visibly reported. Pause cancels walking; close dialog has no quest effect. Reset requires a second visible confirmation.
- Tests: public domain transition and save parser seams are authorized by delegated test request. Target quests/rewards, combat/death, inventory/economy, progression, malformed saves and pause/dialog UI.
- Delivery: private GitHub, CI test/typecheck/build/audit, independent standards/spec reviews, actual Mac Chrome play via visible controls. Report distinctions from simulation and physical mobile/audio verification.
