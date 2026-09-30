# Orion Points — Nocturne concept

A complete dark redesign of Overview, Reward Store and Activity. Obsidian panels, violet glass and black-chrome artwork support a continuous interactive rewards experience.

The prototype preserves the supplied September 25, 2026 Orion Points snapshot: 8,772 available Points, 943 pending, 5,943 expiring, 9,715 total earned, zero redeemed, seven rewards and ten activity entries. Reward costs, account references, dates and the supplied checkout restrictions are retained in `dist/data.js` and the interface.

## Experience

- Overview: responsive reward emblem with pointer tilt and drag rotation; reward progress; account milestone maps with keyboard-accessible scrubbing and playback; earning-source exploration; recent activity.
- Session focus: review an account milestone, save a session intention and explore a reward. Completion and the optional note are saved on the current device only. These actions award no Points.
- Reward Store: actual WebGL 3D cards, mouse/touch browsing, card turning, keyboard controls and a fallback surface. A selected reward moves through hold-to-unlock, case opening and card reveal. An instant-open alternative and reduced-motion controls are included.
- Activity: animated timeline, exact ledger table, status filters, account/event search, detail dialogs, CSV export and grouped expiry dates.

Reward reveals are previews: they neither debit Points nor issue vouchers. The selected reward is known before opening. Variable-price perks retain “From 1,500 Points”; no unavailable pricing formula is assumed. Other application areas are represented for context and are not connected to a backend. The prototype is private.

## Implementation

Serve `dist` with a static HTTP server. No build step is required. The entrypoint loads `concept.css`, `concept.js`, `data.js` and `scene.js`; older prototype files remain inert and are not loaded. Three.js 0.170.0 powers the card geometry and lighting. Lucide 0.468.0 supplies interface icons. Bundled license files are in `dist/vendor`.

Black-chrome reward artwork is original generated imagery developed from the user's creative references. Artwork is a bitmap, while the reward cards are real 3D geometry. No claim is made that the bitmap case is a rigged 3D model. Animation is implemented with CSS, pointer interactions and Three.js. Sound is optional and off by default; system reduced-motion preferences are respected.

## Validation

Reviewed desktop and 390px mobile layouts; verified reward selection, card turn/reveal, the locked $100 reward, account switching, repeated keyboard milestone navigation, session-note validation, Activity filters, table/search, and reduced-motion controls. Browser checks confirmed WebGL rendering and no horizontal page overflow at the mobile breakpoint. Original reward and activity data are retained without changes.
