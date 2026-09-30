# Orion Points — Reward Vault

A black and blue interactive redesign of Overview, Reward Store and Activity, retaining the supplied September 25, 2026 snapshot. The original `dist/data.js` is unchanged: 8,772 available Points, 943 pending, 5,943 expiring, 9,715 total earned, zero redeemed, seven rewards and ten activity records.

## Experience

- Overview connects the original account purchase, Phase 1 pass and funded milestones to their exact Points records. The sapphire/obsidian crystal represents the existing Points balance. Account history supports scrubbing and replay.
- Reward Store keeps the angular collector borders but uses benefit-led glass pass interiors: discount value, payout timing or Labs access. Real Three.js geometry supports rotation, turning, browsing and layer separation. The reverse explains how the pass is used.
- A new black titanium vault opens through a hold-to-unlock sequence and selected-pass reveal. There is an instant alternative; no random rewards, Points debit or voucher issuance occurs in the prototype.
- Activity offers timeline and table views, search, exact status filters, record details, expiry batches and CSV export.
- Local trading workspace provides session intentions/checks, an optional focus timer, a position-risk calculator based on user inputs, and an editable trade journal with delete/undo and JSON export. These tools are saved only in the current browser and award no Points.

The Points snapshot remains fixed at the user's reference date, including its expiry countdown. Variable-price rewards retain “From 1,500 Points”; no unprovided pricing formula is invented. Purchases, payouts and account changes are previews, not live transactions.

## Implementation

Static site, served from `dist`, no build required. Entry files are `blue.js`, `blue.css`, `blue-scene.js`, `blue-tools.js` and the unchanged `data.js`. Earlier concept files remain inert. Three.js 0.170.0 and Lucide 0.468.0 are bundled with licenses. Sound defaults off, reduced motion is supported, WebGL has a card fallback, and keyboard controls are included.

The Points crystal and vault are original generated bitmap assets; card geometry is real 3D. The vault opening uses layered bitmap animation and does not claim a rigged 3D model. No robot or trophy imagery is loaded in this version.

## Validation

Checked desktop and 390px layouts; WebGL rendering, card inspection/layers/reverse, vault reveal, unchanged preview balance, Activity filtering/table/search/clear, position sizing (fractional and rounded-down whole units), journal save/delete/undo including 0R, and timer start/pause/reset. Verified no mobile page overflow and no browser errors in the tested flow. Reference reward and ledger data remain unchanged.
