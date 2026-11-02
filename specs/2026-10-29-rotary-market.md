# The rotary market (2026-10-29)

**Status:** canon. **Build:** `Swordforge_looptest_landscape.html`, step R38 of
`specs/2026-10-23-ftue-smelter-rework-plan.md`. **Test:** `tooling/market/market.test.mjs` reads `MK_ROT`, `MARKET_DESC`
and the rules below out of the build and asserts them against this record.
**Supersedes:** the market grid of `specs/2026-10-07-ftue-v3-rework.md` (the window's look only; its prices, shapes,
states and the dragon's lessons D2-D16 stand).

## Source

Owner, 2026-10-29, with `assets/Anchor-images/marker_rotary.png` (placement guide, not shipped) and
`assets/ui/market_rotary.png` (the art):

- "clicking the rotary market opens up this window. On the wooden wheel, we see the traits. we can swipe through them
  to rotate. think of it like a wheel with traits labeled all around it. only 4 are going to be visible at a time. the
  second from top is the one that appears on the pages."
- "The page only shows one blueprint shape at a time ... with a description of the claymore. the preview of the shape.
  and a circular buy button with gold value. we can swipe this page up and down to see other blueprint."

Answers to the 13 questions (same day), and a second reference (the Claymore page with a PURCHASED stamp): the MARKET
button opens it; the background has the black overlay; an undiscovered trait shows as "?"; "the swipe motion
determines how much it rotates"; the wheel wraps; each trait has its own tag colour; a tag tapped turns to it; "every
shape gets a page. shortsword shows owned, rest purchased if the players own it. this owned and purchased sits on top
of the buy button hiding it"; swiping past a trait's last page goes on into the next trait and "the wheel on the right
moves as well"; existing images as placeholder previews; "one line per trait and shape"; a plain circular buy button
for now (art later); the tutorial solution of question 13 (below, Tutorial).

## The window

| Item | Rule |
|---|---|
| Opens | The MARKET button on the counter (`openMarket`), as before. Closed market: "Play more to unlock", as before. |
| Background | The modal's black overlay (`rgba(0,0,0,.55)`) over the whole frame, HUD included. |
| Art | `assets/ui/market_rotary.webp` (from the 1920x1080 png), drawn on a 16:9 stage centred in the frame; every position below is in that art's pixels. |
| Close | A tap anywhere off the paper and off the wheel. Also a small round close button at the paper's top right corner (an addition: the tutorial needs a target to light; the reference has none). |
| Gold | A small gold count beside the close button (the dragon's top-up coins land on it, D12). |
| Dragon | His lines while the window is open show in a strip at the top right, off the paper (as before). |

## The wheel (the traits)

| Rule | Value |
|---|---|
| Tags | All 25 traits, in `MARKET.traits` order, around the drum. |
| Undiscovered | A grey tag reading "?". |
| Visible | 4 at a time (`MK_ROT.visible`); the **second from the top** (`MK_ROT.sel` = 1) is the trait on the pages. |
| Wraps | After Dark comes Balanced again (a ring). |
| Drag | The tags follow the finger, one tag per tag spacing dragged. |
| Fling | On release the wheel carries on: speed (tags per second) x `MK_ROT.fling` (0.35 s) more tags, then snaps to the nearest tag. A slow drag barely carries; a fast flick spins through many. |
| Tap | A tag tapped turns to the selected slot. |
| Pages follow | When the wheel settles on another trait, the pages show that trait's first page (its Shortsword). |
| Geometry | A cylinder: a tag `off` places from the selected slot sits at angle `selDeg + off x stepDeg` (-14 deg + off x 27 deg), y = 900 + 230 sin(angle), x = 1258 + 18 sin(angle); it fades out between -48 and -62 deg (over the top of the drum) and is gone past 58 deg (below the frame). |

Tag colours (fill, border), the reference's four first:

| Trait | Fill | Border |
|---|---|---|
| balanced | #ffffff | #5f6670 |
| fire | #ffc9c4 | #e8452c |
| swift | #fdeaa0 | #f0c43a |
| gale | #c6f6f0 | #4fd1c5 |
| durable | #e3d3bd | #8a6a45 |
| flexible | #d9f2c4 | #6fb04a |
| heavy | #cfd3d8 | #4c5560 |
| celestial | #d9d4ff | #6b5bd6 |
| cloud | #f2f6fb | #9fb3c8 |
| rainbow | #ffe0f0 | #d94fa0 |
| luck | #c9f2cf | #2f9e48 |
| lightning | #fff6b8 | #d9a400 |
| noble | #f1dcff | #8a3fc2 |
| grace | #fde4ec | #d97aa0 |
| floral | #ffd9e8 | #e05a94 |
| fury | #ffd0b8 | #d9531e |
| ice | #dff4ff | #4aa8e0 |
| water | #cfe6ff | #2f7fd6 |
| magma | #ffd1a8 | #c4400f |
| mist | #e4e7ea | #8d969e |
| poison | #d6f5b8 | #5c9e1e |
| savage | #f2dcc0 | #a8642a |
| blood | #f5c4c8 | #a3162a |
| cursed | #ddd0e6 | #5a3a6e |
| dark | #c9c4d0 | #2c2533 |
| ? (undiscovered) | #d9d2c3 | #8a7f6a |

## The pages (the blueprints)

| Rule | Value |
|---|---|
| One page | One blueprint: one trait and one shape. Every shape of every trait has a page (`marketShapes`, 10 per trait, 250 in all). |
| Order | By trait in wheel order; within a trait, the Shortsword first, then the price order (`marketSteps`), so prices rise as you swipe. |
| Title | "<Shape> blueprint" (the second reference: "Claymore blueprint"; the wheel names the trait). |
| Line | The trait and shape's own line from the table below (`MARKET_DESC`). Undiscovered trait: "Find this trait on the map to read this blueprint." |
| Preview | Placeholder: the blade the forge uses for that trait and shape (`bladeFor`) with the trait's first guard, grip and pommel, on the art's diagonal. Undiscovered trait: the same, as a dark silhouette. |
| Buy button | A circle: "Buy for", a coin and the price (`marketPrice`). A tap buys (`marketBuy`, unchanged). |
| Stamps | Over the buy button, hiding it: the Shortsword "OWNED" (`MK_ROT.stamp.free`); a bought blueprint "PURCHASED" (`MK_ROT.stamp.owned`). |
| Locked | Market closed or trait undiscovered: the circle shows a padlock and the price. The dragon will pay (R13): a padlock, no price. |
| Too dear | The price in red; a tap says "Not enough gold" (as before). |
| Swipe | Up turns to the next page, down to the previous one; one page per swipe. A drag of `MK_ROT.turn` (12%) of the paper's height, or a flick faster than `MK_ROT.flick` (0.5 px/ms), turns it. |
| Across traits | Past a trait's last page comes the next trait's first page, and the wheel turns with it; before its first page, the previous trait's last page. The pages wrap with the wheel (Dark's last page, then Balanced's Shortsword). |

## Tutorial

| Case | Rule |
|---|---|
| Guided buy (`FTUE_MK.step` 'buy') | The window opens on the ordered blueprint's page (the wheel turned to its trait) and the buy button is lit. |
| The dragon pays (D10) | Same page; his coins fly to the buy button, then it is stamped PURCHASED. |
| Top-up (D12) | His coins land on the gold count, then the buy button is lit. |
| Come later (r253) | Gale Katana's page, lit; after `MK_ROT.laterMs` (1600 ms) Fire Claymore's page, lit; then the close button is lit. Closing gives D107d, as before. |
| Swiping | Locked (wheel and pages) while the dragon pays, during a guided buy and during the come-later show, so the lit button stays on screen. |

## Values (`MK_ROT`, in the build's MARKET-CONFIG block)

| Key | Value | Meaning |
|---|---|---|
| visible | 4 | tags visible on the wheel |
| sel | 1 | the selected slot, from the top (0-based): the second |
| fling | 0.35 | s; release speed (tags/s) x this = extra tags turned |
| turn | 0.12 | share of the paper's height a drag needs to turn a page |
| flick | 0.5 | px/ms; a quicker swipe turns a page however short |
| laterMs | 1600 | ms Gale Katana stays before Fire Claymore (come later) |
| stamp | free OWNED, owned PURCHASED | the stamps over the buy button |
| geo | stepDeg 27, selDeg -14, cy 900, r 230, x 1258, dx 18, fadeDeg -48, goneDeg -62, botDeg 58 | the cylinder (art pixels) |

## The blueprint lines (`MARKET_DESC`)

Owner's examples: Balanced Shortsword and Fire Shortsword. The Balanced Claymore line is the first reference's text.
Every other line is a draft for the owner's review: change a line here and in `MARKET_DESC` together (the test
compares them). Rules: one line per trait and shape, at most 64 characters, no two alike, straight quotes, no dashes.

| Trait | Shape | Price | Line |
|---|---|---|---|
| balanced | Shortsword | 0 | Compact, clean and simple. The most basic sword. |
| balanced | Longsword | 50 | More reach, same calm. A sword for every job. |
| balanced | Broadsword | 100 | Wide and steady. It never picks a fight it cannot finish. |
| balanced | Katana | 150 | One clean curve, one clean cut. |
| balanced | Cutlass | 200 | Made for ships and tight corners. Simple and sure. |
| balanced | Machete | 250 | Clears the path ahead. Plain, sharp and useful. |
| balanced | Saber | 300 | A light curve for a quick hand. |
| balanced | Scimitar | 350 | A long curve that keeps its balance. |
| balanced | Claymore | 400 | A broad, imposing blade built to command attention. |
| balanced | Dagger | 450 | Short and honest. Good for close work. |
| fire | Shortsword | 0 | Small, but fiery. Do not underestimate. It will get angry. |
| fire | Longsword | 100 | A long flame with a short temper. |
| fire | Broadsword | 150 | Wide and hot. Stand back when it swings. |
| fire | Katana | 200 | Cuts like a flash of flame. |
| fire | Cutlass | 250 | Warm enough to dry a wet deck. |
| fire | Machete | 300 | Burns a path through anything green. |
| fire | Saber | 350 | Quick, bright and always smoking. |
| fire | Scimitar | 400 | A curve of fire that leaves the air glowing. |
| fire | Claymore | 450 | Huge and blazing. It wants everyone to look. |
| fire | Dagger | 500 | A little spark. Keep it away from the curtains. |
| swift | Shortsword | 0 | Light as a feather. Gone before you see it. |
| swift | Longsword | 150 | Long, but never slow. |
| swift | Dagger | 200 | Blink and it has already struck. |
| swift | Katana | 250 | Drawn and back in the sheath in one breath. |
| swift | Cutlass | 300 | Quick on deck, quicker in a fight. |
| swift | Machete | 350 | Fast hands, fast blade, short path. |
| swift | Saber | 400 | Made for the charge. It never waits. |
| swift | Scimitar | 450 | A quick curve that dances past a guard. |
| swift | Claymore | 500 | A giant sword that somehow moves like a small one. |
| swift | Rapier | 550 | A needle in the wind. Strikes first, every time. |
| gale | Shortsword | 0 | A small gust with a sharp edge. |
| gale | Longsword | 200 | It sings when the wind blows through it. |
| gale | Rapier | 250 | Thin as a breeze, and just as hard to catch. |
| gale | Katana | 300 | Each cut leaves a little storm behind. |
| gale | Cutlass | 350 | Smells of sea wind. Every sailor wants one. |
| gale | Machete | 400 | Cuts through the tall grass like a gale. |
| gale | Saber | 450 | Rides the wind into every charge. |
| gale | Scimitar | 500 | A curve of wind that bends around a shield. |
| gale | Claymore | 550 | Swing it once and the trees bow. |
| gale | Dagger | 600 | A pocket of wind. It whistles when thrown. |
| durable | Shortsword | 0 | Small and stubborn. It will outlast you. |
| durable | Longsword | 250 | Long, tough and hard to chip. |
| durable | Broadsword | 300 | A wall of steel you can swing. |
| durable | Katana | 350 | A fine edge that refuses to dull. |
| durable | Cutlass | 400 | Salt, rain and battle. It does not care. |
| durable | Machete | 450 | Chop wood all day. Still sharp tomorrow. |
| durable | Saber | 500 | Takes every blow and asks for more. |
| durable | Scimitar | 550 | A curve that keeps its shape for life. |
| durable | Claymore | 600 | Heavy, tough and nearly unbreakable. |
| durable | Dagger | 650 | Bends nothing, breaks nothing. |
| flexible | Shortsword | 0 | It bends, it springs back, it wins. |
| flexible | Longsword | 300 | A long blade with a little give. |
| flexible | Broadsword | 350 | Wide, yet it flexes like a reed. |
| flexible | Katana | 400 | Supple steel with a straight answer. |
| flexible | Cutlass | 450 | Springs back from every parry. |
| flexible | Machete | 500 | Whips through brush like a willow branch. |
| flexible | Saber | 550 | Bends in the charge and snaps back in time. |
| flexible | Scimitar | 600 | A curve that curves even further. |
| flexible | Claymore | 650 | Big and bendy. Nobody expects that. |
| flexible | Dagger | 700 | Bends around a guard to find its mark. |
| heavy | Shortsword | 0 | Small, but it lands like a hammer. |
| heavy | Longsword | 350 | Every swing feels like a falling tree. |
| heavy | Broadsword | 400 | Do not drop it on your foot. |
| heavy | Katana | 450 | A slow draw and a very heavy cut. |
| heavy | Cutlass | 500 | Sinks ships. Also sinks if dropped. |
| heavy | Machete | 550 | One chop is all it needs. |
| heavy | Saber | 600 | A cavalry blade for a strong arm. |
| heavy | Scimitar | 650 | The curve adds weight to every blow. |
| heavy | Claymore | 700 | Two hands, strong back, no regrets. |
| heavy | Dagger | 750 | The heaviest little knife in town. |
| celestial | Shortsword | 0 | A small sword with stars in the steel. |
| celestial | Longsword | 400 | Forged under the night sky. It still glows. |
| celestial | Broadsword | 450 | Wide as the sky after sunset. |
| celestial | Katana | 500 | Its edge follows the path of the moon. |
| celestial | Cutlass | 550 | Sailors steer by the light on its blade. |
| celestial | Machete | 600 | Cuts a path the stars would follow. |
| celestial | Saber | 650 | A comet in the charge. |
| celestial | Scimitar | 700 | Curved like a new moon. |
| celestial | Claymore | 750 | A blade as big as the heavens. |
| celestial | Dagger | 800 | A fallen star with a point. |
| cloud | Shortsword | 0 | Soft to look at, sharp to touch. |
| cloud | Longsword | 450 | Light as a cloud, long as a summer day. |
| cloud | Broadsword | 500 | A wide, white blade that seems to float. |
| cloud | Katana | 550 | Drifts in, cuts clean, drifts away. |
| cloud | Cutlass | 600 | Smells of rain over the sea. |
| cloud | Machete | 650 | Clears the fog off a jungle path. |
| cloud | Saber | 700 | Rides high and comes down fast. |
| cloud | Scimitar | 750 | A curve as soft as the edge of a cloud. |
| cloud | Claymore | 800 | A thunderhead you can carry. |
| cloud | Dagger | 850 | A wisp of cloud with a point. |
| rainbow | Shortsword | 0 | Small and bright. Every colour at once. |
| rainbow | Longsword | 500 | A long arc of colour. |
| rainbow | Broadsword | 550 | Wide enough to hold all seven colours. |
| rainbow | Katana | 600 | Each cut leaves a trail of light. |
| rainbow | Cutlass | 650 | Pirates say there is gold at the end of it. |
| rainbow | Machete | 700 | Paints the jungle as it cuts. |
| rainbow | Saber | 750 | A bright flash on the charge. |
| rainbow | Scimitar | 800 | Already curved like a rainbow. |
| rainbow | Claymore | 850 | Huge, loud and very colourful. |
| rainbow | Dagger | 900 | A little spark of colour. |
| luck | Shortsword | 0 | Small, lucky and always in the right place. |
| luck | Longsword | 550 | Long odds, but this blade likes them. |
| luck | Broadsword | 600 | Wide blade, wide luck. |
| luck | Katana | 650 | It finds the gap every time. Pure luck? |
| luck | Cutlass | 700 | Every pirate swears by it. |
| luck | Machete | 750 | Somehow it always misses the rocks. |
| luck | Saber | 800 | The coin landed on heads again. |
| luck | Scimitar | 850 | A lucky curve. Carry it on game night. |
| luck | Claymore | 900 | Big blade, bigger luck. |
| luck | Dagger | 950 | A lucky charm with a point. |
| lightning | Shortsword | 0 | Small, quick and crackling. |
| lightning | Longsword | 600 | Strikes twice in the same place. |
| lightning | Broadsword | 650 | A storm with a handle. |
| lightning | Katana | 700 | The flash comes first. The thunder comes later. |
| lightning | Cutlass | 750 | Keep it below deck in a storm. |
| lightning | Machete | 800 | Every chop crackles. |
| lightning | Saber | 850 | A bolt from the sky on the charge. |
| lightning | Scimitar | 900 | Curved like a fork of lightning. |
| lightning | Claymore | 950 | Raise it high and the sky answers. |
| lightning | Dagger | 1000 | A small spark that bites. |
| noble | Shortsword | 0 | Small, proud and polished. |
| noble | Longsword | 650 | Fit for a knight. Fit for a king. |
| noble | Broadsword | 700 | Wide, gilded and full of honour. |
| noble | Katana | 750 | A blade of old and noble houses. |
| noble | Cutlass | 800 | A captain carries this one. |
| noble | Machete | 850 | Even the palace gardeners use one. |
| noble | Saber | 900 | For parades and for duels. |
| noble | Scimitar | 950 | A royal curve, with gold on the hilt. |
| noble | Claymore | 1000 | Lifted only for the crown. |
| noble | Dagger | 1050 | Worn at court, never without reason. |
| grace | Shortsword | 0 | Small, light and lovely to hold. |
| grace | Longsword | 700 | Every swing looks like a dance. |
| grace | Broadsword | 750 | Wide, yet it moves with grace. |
| grace | Katana | 800 | A cut so smooth it seems polite. |
| grace | Cutlass | 850 | Dances across the deck. |
| grace | Machete | 900 | Even chopping looks elegant. |
| grace | Saber | 950 | Light, fast and very elegant. |
| grace | Scimitar | 1000 | A curve as graceful as a swan. |
| grace | Claymore | 1050 | A giant sword with good manners. |
| grace | Dagger | 1100 | Gentle hands, sharp point. |
| floral | Shortsword | 0 | Small and sweet. It smells of spring. |
| floral | Longsword | 750 | Long as a rose stem, and as thorny. |
| floral | Broadsword | 800 | A wide blade in full bloom. |
| floral | Katana | 850 | Cuts like a falling petal. |
| floral | Cutlass | 900 | Flowers on the deck, steel in the hand. |
| floral | Machete | 950 | Made for gardens. Trims a hedge in one swing. |
| floral | Saber | 1000 | Blooms on the charge. |
| floral | Scimitar | 1050 | Curved like a lily leaf. |
| floral | Claymore | 1100 | A tree in full bloom, with an edge. |
| floral | Dagger | 1150 | A thorn you can carry. |
| fury | Shortsword | 0 | Small and furious. Do not make it wait. |
| fury | Longsword | 800 | A long blade with a short fuse. |
| fury | Broadsword | 850 | Wide, loud and always angry. |
| fury | Katana | 900 | Calm sheath, furious blade. |
| fury | Cutlass | 950 | Picks fights in every port. |
| fury | Machete | 1000 | Chops harder when it is cross. |
| fury | Saber | 1050 | Charges first. Thinks later. |
| fury | Scimitar | 1100 | A curve that never cools down. |
| fury | Claymore | 1150 | Pure rage, two hands wide. |
| fury | Dagger | 1200 | Small rage, sharp point. |
| ice | Shortsword | 0 | Small and cold. Frost on every edge. |
| ice | Longsword | 850 | A long, cold silence. |
| ice | Broadsword | 900 | A wide sheet of ice with a handle. |
| ice | Katana | 950 | Cuts clean and leaves frost behind. |
| ice | Cutlass | 1000 | Freezes the spray off the sea. |
| ice | Machete | 1050 | Cuts through snow like butter. |
| ice | Saber | 1100 | A cold wind on the charge. |
| ice | Scimitar | 1150 | Curved like a frozen wave. |
| ice | Claymore | 1200 | A glacier you can swing. |
| ice | Dagger | 1250 | An icicle with a point. |
| water | Shortsword | 0 | Small and calm, like a still pond. |
| water | Longsword | 900 | Flows like a river. |
| water | Broadsword | 950 | A wide wave of steel. |
| water | Katana | 1000 | Cuts like a waterfall. |
| water | Cutlass | 1050 | At home on the sea. |
| water | Machete | 1100 | Clears a path through the rain forest. |
| water | Saber | 1150 | Rushes in like the tide. |
| water | Scimitar | 1200 | Curved like a breaking wave. |
| water | Claymore | 1250 | A flood in two hands. |
| water | Dagger | 1300 | A drop of water with a point. |
| magma | Shortsword | 0 | Small and molten. Hold it by the handle. |
| magma | Longsword | 950 | A long river of molten rock. |
| magma | Broadsword | 1000 | Wide, heavy and still glowing. |
| magma | Katana | 1050 | Cuts through stone like warm wax. |
| magma | Cutlass | 1100 | Boils the sea where it is dipped. |
| magma | Machete | 1150 | Melts the vines it cuts. |
| magma | Saber | 1200 | Hot on the charge, hotter after. |
| magma | Scimitar | 1250 | A curve of lava. |
| magma | Claymore | 1300 | A volcano you can carry. Mostly. |
| magma | Dagger | 1350 | A drop of magma that never cools. |
| mist | Shortsword | 0 | Small and hard to see. |
| mist | Longsword | 1000 | Long, grey and quiet. |
| mist | Broadsword | 1050 | Wide, yet it vanishes in the fog. |
| mist | Katana | 1100 | You hear the cut. You never see it. |
| mist | Cutlass | 1150 | Made for foggy decks and quiet raids. |
| mist | Machete | 1200 | Cuts a path no one can follow. |
| mist | Saber | 1250 | Charges out of the morning mist. |
| mist | Scimitar | 1300 | A curve you see only once. |
| mist | Claymore | 1350 | A huge sword nobody saw coming. |
| mist | Dagger | 1400 | Gone into the mist before it is missed. |
| poison | Shortsword | 0 | Small, green and nasty. |
| poison | Longsword | 1050 | One scratch is enough. |
| poison | Broadsword | 1100 | Wide blade, slow venom. |
| poison | Katana | 1150 | A clean cut with a bitter end. |
| poison | Cutlass | 1200 | A snake on a pirate ship. |
| poison | Machete | 1250 | Do not use it on the vegetables. |
| poison | Saber | 1300 | Strikes fast. The venom is slower. |
| poison | Scimitar | 1350 | Curved like a snake fang. |
| poison | Claymore | 1400 | A big blade with a mean streak. |
| poison | Dagger | 1450 | The classic. Keep it away from your dinner. |
| savage | Shortsword | 0 | Small, wild and full of teeth. |
| savage | Longsword | 1100 | A long claw. |
| savage | Broadsword | 1150 | Wide, rough and hungry. |
| savage | Katana | 1200 | A wild beast with a fine edge. |
| savage | Cutlass | 1250 | For pirates with no manners. |
| savage | Machete | 1300 | Rips through the jungle. |
| savage | Saber | 1350 | Runs with the pack. |
| savage | Scimitar | 1400 | A curve like a tiger claw. |
| savage | Claymore | 1450 | A monster of a sword. |
| savage | Dagger | 1500 | A fang you can hold. |
| blood | Shortsword | 0 | Small, red and always thirsty. |
| blood | Longsword | 1150 | A long, red line. |
| blood | Broadsword | 1200 | Wide and dark red. |
| blood | Katana | 1250 | One cut, one drop. |
| blood | Cutlass | 1300 | Red sails, red blade. |
| blood | Machete | 1350 | Chops and stains. |
| blood | Saber | 1400 | Red on the charge. |
| blood | Scimitar | 1450 | A curve as red as wine. |
| blood | Claymore | 1500 | A huge blade that is never satisfied. |
| blood | Dagger | 1550 | A small blade with a big thirst. |
| cursed | Shortsword | 0 | Small and unlucky. Mostly for others. |
| cursed | Longsword | 1200 | Long and cold. It whispers at night. |
| cursed | Broadsword | 1250 | Wide and heavy with an old curse. |
| cursed | Katana | 1300 | Once drawn, it will not go back in. |
| cursed | Cutlass | 1350 | Found on a ghost ship. |
| cursed | Machete | 1400 | The path it cuts grows back black. |
| cursed | Saber | 1450 | Its last owner charged and never returned. |
| cursed | Scimitar | 1500 | A crooked curve with a crooked past. |
| cursed | Claymore | 1550 | Big, old and very cursed. Handle with care. |
| cursed | Dagger | 1600 | Nobody remembers who made it. |
| dark | Shortsword | 0 | Small and black as night. |
| dark | Longsword | 1250 | A long shadow with an edge. |
| dark | Broadsword | 1300 | Wide enough to block out the sun. |
| dark | Katana | 1350 | Cuts the light itself. |
| dark | Cutlass | 1400 | Sails on moonless nights. |
| dark | Machete | 1450 | Cuts a path through the night. |
| dark | Saber | 1500 | A shadow on the charge. |
| dark | Scimitar | 1550 | A curve of night. |
| dark | Claymore | 1600 | Darkness, two hands wide. |
| dark | Dagger | 1650 | Made for the darkest corner. |
