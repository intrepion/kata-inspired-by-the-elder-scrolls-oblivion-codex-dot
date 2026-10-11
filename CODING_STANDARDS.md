# Standards
Use strict TypeScript. Keep domain transitions independent of DOM, rendering and storage. All player actions go through domain rules; quest rewards and loot are idempotent. Validate untrusted saves. Keep original art/audio self-contained. UI must escape authored and dynamic content, label buttons, support dialog cancellation, and suspend movement during overlays.
