# Mobile viewport fit (landscape loop-test)

**Date:** 2026-09-21 · **Build:** `Swordforge_looptest_landscape.html` · **Branch:** `sword-forge/mobile-compat`
**Status:** `canon` for how the build sizes itself to a screen.

## Problem

The owner reported the game "does not open well" on phones. On a 1356x610 Chrome Android device the
page filled the width but the bottom of the frame fell below the fold, so the bench row and the rail
buttons needed a scroll to reach.

Cause: `#frame` is a fixed `1080px x 600px` box and a viewport meta sizes the **width** only. The old
meta `width=1080` therefore fixed the width correctly and left the height to chance.

Measured before the fix (Chrome, emulated):

| Screen | Layout viewport | Frame box | Aspect | Result |
|---|---|---|---|---|
| 360x800 portrait | 1080x2400 | 1080x600 | 1.80 | fits, but uses 25% of the screen height |
| 375x812 preset | 864x1870 | 864x600 | 1.44 | clipped **and** crushed |
| 1024x768 desktop | 1024x768 | 1024x600 | 1.28 | crushed |

Two separate defects:

1. **No vertical fit.** Nothing made 600 CSS px fit the visible height.
2. **Aspect collapse.** `body` is a flex container and `#frame` had no `flex-shrink: 0`, so any
   viewport under 1080 px squeezed the frame horizontally. Every `LAYOUT` entry places props as a
   fraction of the frame, so a squeezed frame moves every prop.

## Decision

Keep the 1080x600 design box. Ask the browser to zoom the page out until 600 CSS px equals the
visible height, and let the spare room fall into side bars.

```
sfFitWidth(innerW, innerH, frameW, frameH) = max(frameW, ceil(frameH * innerW / innerH))
```

`innerW / innerH` is the visible screen's aspect ratio in whatever CSS space the current meta
creates, so the formula needs no device pixels and converges in one step.

Recorded constants: **frame 1080 x 600**, **dead band 2 px**, **rotate retries at 150 ms and 450 ms**.

Why this approach and not the alternatives:

- **Rejected: `transform: scale()` on a wrapper.** 120 code sites read `getBoundingClientRect`,
  `clientX` or `clientY`. Under a transform those return scaled values, and `tutRect()` (line ~5330)
  mixes a scaled rect with unscaled frame coordinates, so the tutorial arrow would land off target.
  Held as the fallback if a browser mishandles the meta rewrite.
- **Rejected: fluid re-layout.** 519 lines carry hardcoded px and every anchor decision reopens.

## What changed

| File | Change |
|---|---|
| `Swordforge_looptest_landscape.html` head | `sfFitWidth()` + `sfApplyFit()`, run during head parse, on `resize`, and twice after `orientationchange` |
| `Swordforge_looptest_landscape.html` CSS | `#frame { flex-shrink: 0 }`; body gets `align-items/justify-content: safe center` and `overscroll-behavior: none` |
| `tooling/mobile-fit/fit.test.mjs` | Device table, run with `node tooling/mobile-fit/fit.test.mjs`. It extracts `sfFitWidth` and `sfWantsFullscreen` **out of the HTML**, so a drifting edit goes RED. |

### Fullscreen on the first tap (r134b)

Chrome Android keeps its URL bar on a page that cannot scroll, so the fit measures the smaller
visible height and picks a wider viewport than the screen really needs: 1715 instead of 1334 on the
owner's device, which costs about 25% of the game's height. One `requestFullscreen()` on the
player's first tap gives that height back, and the resize it causes re-runs the fit.

```
sfWantsFullscreen(vpW, frameW, coarsePointer, hasApi, alreadyFullscreen)
  = hasApi AND coarsePointer AND NOT alreadyFullscreen AND vpW > frameW
```

`vpW > frameW` is the signal that the fit had to zoom out, so the screen is short and the browser
chrome is costing real height. The rules that keep it silent elsewhere: a desktop mouse
(`pointer: coarse` is false), an iPhone (no element fullscreen on iPhone Safari), a screen the frame
already fits, and a page already in fullscreen. The listener runs in the capture phase and never
calls `preventDefault`, so the tap still advances the dialogue. One attempt per page load, so a
player who leaves fullscreen is not dragged back in. A rejected request is swallowed.

Orientation lock is deliberately **not** included. `screen.orientation.lock('landscape')` works only
inside fullscreen and only on Android, and it would rotate the game under a player holding the phone
upright. That is a product call, not a fit fix.

`safe center` matters on a desktop window under 1080 px: a plain centred flex item hides its left
edge with no way to scroll to it.

## Verified

| Case | Meta chosen | Frame | Outcome |
|---|---|---|---|
| 740x333 (owner's 2.22:1 aspect) | `width=1334` | 1080x600 at x=127 | whole frame visible, no scroll, 127 px bars each side |
| 360x800 portrait | `width=1080` | 1080x600 centred | unchanged, still a small strip |
| 1024x768 desktop | `width=1080` ignored | 1080x600 | aspect held, overflow reachable |

Unit test: GREEN, 9 cases plus two properties (never clips, never goes below 1080).

## Not solved here

- **Portrait phones** still show a small centred strip. A landscape-only game needs a rotate gate.
- **Browser chrome on iPhone.** iPhone Safari has no element fullscreen, so the URL bar keeps its
  share of the height there. Add-to-home-screen is the only way back. Android is handled by r134b.
- **Payload.** The build pulls **80.8 MB** across 74 assets and **348 MB** of decoded RGBA if all
  images stay resident (`assets/map/map_base.png` alone is 2948x2948, 15.4 MB, 33 MB in RAM). That is
  above the iOS Safari tab ceiling and is a separate workstream.
- **Touch gestures.** Drag surfaces still need `touch-action: none` so the browser does not claim the
  gesture for scrolling.
- The in-build layout self-test (`?test`) is **RED before this change** on `dragon.y`
  (runtime -3.683 against recorded -2.718). Pre-existing, tracked separately.

## Reaching the preview from a phone (Windows)

The preview server binds `0.0.0.0` and answers on the host's LAN address, but a phone still times
out until two Windows settings change. Both need an elevated PowerShell, and both are one-time.

1. The Wi-Fi is classified **Public**, where inbound is blocked.
2. A past "Cancel" on a Windows firewall prompt left inbound rules named **"Node.js JavaScript
   Runtime"** with **Action: Block** on the Public profile. Block beats allow, so a port allow rule
   does nothing while those apply.

```powershell
Set-NetConnectionProfile -InterfaceAlias 'Wi-Fi' -NetworkCategory Private
New-NetFirewallRule -DisplayName 'Sword Forge phone preview' -Direction Inbound -Protocol TCP -LocalPort 5679 -Action Allow -Profile Private
```

Marking the network Private stops the Public-scoped node blocks applying, and keeps them in force on
a genuinely public network. The preview port is pinned to **5679** in `.claude/launch.json` so the
rule stays valid across sessions, with `autoPort` left on as a fallback.

## Device matrix still to run on real hardware

Emulation cannot settle viewport-meta questions: the desktop emulator applies mobile viewport rules
only below 768 px. Run on: Chrome Android, Samsung Internet, iOS Safari, iOS Chrome, and the
Instagram and WhatsApp in-app browsers. Record for each: chosen meta width, whether the whole frame
is visible, and whether a drag works without the page scrolling.
