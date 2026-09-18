# Tutorial script — Swordforge loop test (landscape)

Date: 2026-09-15
Build: `Swordforge_looptest_landscape.html`
Status: **script only.** This file is the source of truth for the tutorial's copy and ordering; the
build follows it, not the other way round.

---

## Conventions

Every line of spoken copy has a permanent id — **D1, D2, …** — and never changes id once written. If a
line is cut, its id is retired rather than reused, so a `tutorialFlow` entry referring to D14 always
means the same sentence.

### Speakers

- **Dragon** — the voice of the tutorial. Lives on the forge bench, left side. Speaks in a **tailed
  bubble anchored to itself** (see below).
- **Sign** — unvoiced instruction in the existing bottom hint bar, for things nobody needs to say out
  loud. Written as `Sign:` and **not** given a D-number.

### The dragon's dialogue box

Implemented as `#dragonSay`. A speech bubble, not the customer-counter `Dialogue_box.png` panel.
Placeholder art; the shape is what matters:

- pale parchment body, rounded, dark-brown 2px border, drop shadow;
- a **tail** on the bubble's lower-left corner pointing down and left, at the dragon's head;
- anchored to the dragon element, so it follows the dragon when dragged and at any frame size;
- body text dark (`#4a3623`) — the parchment is pale, the same trap r55 hit on the counter;
- click anywhere on the bubble to advance.

Pointer arrows come from `tutArrow(from, to, opt)` and the pulsing highlight from `tutGlow(sel, on)`;
both are cleared by `tutDone()`.

Lines live in the `DIALOGUE` map. `SAY_SEQ` is the run the bubble walks: a click advances it and
the last line closes it. `say(id)` shows one line on its own; `sayHide()` clears it.

---

## Dialogue

**D1** — Dragon
> "Hm, this forge looks like it hasn't been used for a long time. Why don't we craft something simple to
> see if everything works?"

**D2** — Dragon
> "Don't worry, I know you're exhausted. I'll guide you through it."

**D3** — Dragon
> "Add 2 Iron and 2 Manganese to the smelter. Note the path it creates on the trait map."

*Stage state: the player holds **2 Iron and 2 Manganese and nothing else**. Every other metal sits at
zero, so its slot shows on the shelf but cannot be dragged — the cave is where the rest comes from.*

*Pointer: an arrow runs from the Iron slot on the rail to the crucible, and stays up until the smelter
holds 2 Iron and 2 Manganese.*

**D4** — Dragon
> "Heat up the smelter with the bellows."

*Trigger: fires by itself the moment the fourth ore lands. Pointer: an arrow down onto the bellows,
and the bellows glows. Both stay up until the smelter is actually hot — r83; they used to clear on the
first pump, so one tap left the player with no pointer, a cold smelter and no next line.*

*Note: the owner wrote "bellow"; the tool is a **bellows**, and the station caption was changed from
"Bellow" to match its own tooltip and every hint in the game.*

**D5** — Dragon
> "Tap on the smelter gate to open it."

*Trigger: fires when the heat reaches the ready mark (`HEAT_READY`, 70 of 100), which is the first
moment tapping the gate does anything. Since r83 that mark is reachable only with the bellows, so D5 is
genuinely earned by doing what D4 asks — before r83 the smelt readied itself on a 5-second timer and D5
arrived whether or not anyone pumped. Pointer: an arrow in from the left onto the gate; the gate supplies its own glow, since it
already pulses once ready. Both clear when the gate opens.*

*Note: the owner wrote "smelted door". "Smelted" is what happens to the metal, so that is a typo for
"smelter"; and the game calls it a **gate** in both places it names it, so "door" would have been a third
word for one object.*

**D6** — Dragon
> "Nice! Let's take this hot metal to the anvil."

*Trigger: the gate opening. D5's pointer hands straight over to this one, so the line lands on the same
tap that releases the metal. Pointer: an arrow the full width of the bench, from the gate the metal is
sitting at to the face of the anvil it has to land on, and the anvil glows. Both clear when the metal is
set down — dropping it back in the furnace does not count, and the pointer stays up.*

*Note on the name: the owner set the vocabulary here — **hot metal** while it glows, **metal ingot**
once it is cold. The game had been calling it "the glowing orb" in two hints, one of which is on screen
at the moment D6 speaks; those now use the new names, as does the quench hint. The inventory was already
calling it an Ingot, so the cold name needed no change. Only player-facing text moved: the element, its
id and its handlers are still `orb` in the code.*

**D7** — Dragon
> "Pick up the hammer and strike the hot metal on the anvil."

*Trigger: the metal landing on the anvil. Pointer: an arrow from the hammer to the anvil's top face,
and the hammer glows. The glow goes on the hammer's `img`, not on `#hammerTool` — the tool itself takes
`.striking` while it swings, and `#hammerTool.striking` out-specifies `.tut-glow`, so a glow on the
wrapper would be silently overridden the instant the player did what the line asks.*

**D8** — Dragon
> "Look, the sword icon moves on the trait map with each strike. Keep hammering till we reach the ‘?’."

*Trigger: **0.7s of real striking**, not the first contact — the sword has visibly moved (~46 world
units) before the line claims it does, so "Look" describes something that just happened rather than a
promise. This is the one line that **freezes the game**: `TUT_PAUSE` makes `tick()` return early, and
`#tutDim` covers the whole frame at z-index 45, under the bubble at 46 and over everything else, so it
also swallows every click. The click that closes D8 lifts both.*

*The `‘?’` is literal: an unacquired trait renders a `?` glyph on its disc, and this route ends on
Balanced, so the mark the line names is the mark the player is walking to.*

**D9** — Dragon
> "Hammering also allows you to collect experience points scattered all over the map. Collect them to
> level up."

*Trigger: picking up the first of **two small books placed on the route itself** when the fourth ore
lands (at 38% and 72% of the traversable length, so the first run cannot miss them). No freeze and no
pointer — the bubble pops while hammering carries on, since two full-screen freezes in a row would
feel like the tutorial keeps taking the controls away.*

*Two small books are 50 exp each, so the tutorial run banks exactly 100 — **level 2 precisely**, and
the player's first talent point. "Collect them to level up" is literal, not a figure of speech.*

*Note on the name: the owner asked for "skill points" on the path. The game already spends that term —
**talent points** are what a level-up awards and what the skill tree spends; the things on the map are
exp books. The pickups are books, and D9 calls them experience points, which is what they give.*

**D10** — Dragon
> "Now that we have reached a ‘?’ trait on the map, we can splash water on the metal to lock it in."

*Trigger: the sword landing on a trait (`checkTraitReach`). No pointer — D10 explains, D11 instructs,
and the arrow goes up with the instruction.*

*Note: the owner wrote "a ‘?’ trait, on the map, we can…" — the comma split "a ‘?’ trait on the map",
which is one phrase; and "trait" landed twice in one sentence, so the second became "it", which is how
the game's own hint already phrases it.*

**D11** — Dragon
> "Pick up the mug from the bucket and drag it to the metal."

*Pointer: an arrow from the mug to the metal on the anvil, and the mug glows. Both clear the moment the
pour lands, before the popup opens.*

*Note: the owner wrote "Pick the mug in the bucket" — you pick something **up**, and it comes **from**
the bucket.*

### The acquire popup

`#sfAcquireModal` already existed, with the trait's icon, name, tier and a `continue ›` button. r86
moved the name into the heading and dropped it from the body, so it reads **"New trait discovered —
Balanced"**. `tryAcquire` already computed `firstFind` for the quest counter, so the heading is honest:
re-acquiring a trait already known reads **"Trait locked in — Balanced"**, because nothing was
discovered.

**D12** — Dragon
> "Click on the metal to select the shape of the sword blade."

*Trigger: closing the acquire popup. Pointer: the metal glows (no arrow — it is the only thing being
pointed at, and it is right where the player is already looking). Clears when the shape picker opens,
which is where the tutorial currently ends.*

---

## Tapping the dragon

The dragon is a **guide while the script still has something to say, and a pet afterwards** (r87). Both
dragons behave the same — the one on the forge bench and the one in the hammering minigame.

- **During the tutorial:** a tap replays the last line shown (`sayAgain`), so a player who dismissed a
  line can always get it back.
- **After the tutorial:** a tap pops hearts, the same burst as petting the dragon in the bedroom.

"After" means **the last line in `DIALOGUE` has been shown**. `lastLine()` is just the final key of the
map, so this point moves on its own as new lines are written — today it is D26; add D27 and the dragon
keeps guiding until D13 has played. Nothing needs updating by hand. A new game restores the guide.

Inside the hammering minigame the bubble rises above the modal panel and anchors to the minigame
dragon's head instead of the bench one.

---

**D13** — Dragon
> "I'll help you heat up the metal again so you can start shaping it!"

**D14** — Dragon
> "Just hold on the metal and I will heat that part for you to hammer."

*Trigger: opening the hammering minigame; D13 shows, a click gives D14. The bubble rises above the
modal panel and anchors to the minigame dragon (r87).*

*Note: the owner wrote "Just tap on the metal". The control is press-and-hold (their own choice in
r87), so a tap gives a puff of flame and almost no heat — a player following the line literally would
conclude the game was broken. Reworded to "hold".*

**D15** — Dragon
> "It is hot enough. Now pick up your hammer and strike the hot metal!"

*Trigger: the heat crossing `HM_FORGE.workMin` (0.35) upward for the first time — the exact moment a
strike starts moving the metal, which is what the line claims.*

*Note: the owner wrote "pick you hammer".*

**D16** — Dragon
> "The metal cools down slowly. You will have to heat it again. Tell me where to FIRE!"

*Trigger: the **first** time the heat falls below `workMin`, which in practice is a strike carrying
it there rather than the metal cooling on its own — so the line lands mid-hammering, while the blade is
still half shaped (r89). The deliberate final quench does not count as going cold. This is currently
the **last line in the script**, so showing it is what flips the dragon from guide to pet (see Tapping
the dragon).*

**D17** — Dragon
> "Pick up the mug and splash water on the blade to finish."

*Trigger: the blade reaching full shape (`hmProg >= 2`), which is the same moment the mug becomes
usable. No pointer of its own — the mug already pulses once it is live, and `.ready` and `.tut-glow`
both animate `filter`, so a glow on top would only fight it.*

*This is now the last line in the script, so it is what flips the dragon from guide to pet. D16 can
still be skipped entirely by a player who keeps the metal hot all the way through — that is fine; it is
a "you let it cool" line and nothing later depends on it.*

**D18** — Dragon
> "Wow, what a nice blade! We are the perfect team! Let's go and see what the counter of this forge looks like!"

*Trigger: closing the first Sword Crafted result. The dragon is **silent while that window is up** (r92) — the result stands on its own and the next line waits for the close. The player is guided by the existing tutorial arrow to click the left arrow and move from the forge to the customer counter.*

**D19** — Dragon
> "Not too bad. We can use it. But you should really consider decorating it later!"

*Trigger: arrival on the customer counter during this first tutorial visit. The counter is empty: no customer panel, response controls, or sword is shown. The dragon appears on the screen and speaks from its own anchored tutorial bubble. After this line, normal dragon pet behavior and later customer behavior resume.*

### Bram intro branch after D19

**D20** — Bram
> “Oh, God, save me! I didn't think I would find anyone here. Who are you?”

**D21** — Bram
> “A blacksmith? How lucky! Can you give me a sword, any sword! Assassins are after me.”

**D22** — Bram
> “You don’t need to know who I am! Assassins are after me. I lost my sword too!”

After D19 is dismissed, the counter dragon and its bubble leave the screen. Bram appears using assets/customer/Bram.png and is identified as **BRAM**. The player chooses either response above. The response buttons hide after selection and Bram remains at the counter for the later give/sell flow. The placeholder copy and SELL/DENY controls are hidden during this intro. The counter dragon can be dragged with pointer/touch inside the screen bounds; a tap retains its dialogue behavior and a drag does not advance it. Its bubble follows during dragging. New Game clears this branch and restores the dragon’s starting position.

### Bram first sale after D21/D22

**D23** — Dragon
> “Find the sword you just made in your inventory and place it on the counter”

**D24** — Dragon
> “He looks pleased and he is offering gold! Tap the sell button to confirm the trade.”

**D25** — Bram
> “Thanks! If I survive the night I will come back to thank you properly.”

**D26** — Dragon
> “Phew- that was a lot of hard work.”

After either D21 or D22, the tutorial converges. SELL is visible but disabled until the newly crafted sword is dragged from inventory to the counter. DENY remains disabled and visibly grey. Placing the sword enables SELL and shows D24. The existing sale path then pays gold, reputation, popularity, XP, and ledger credit exactly once, removes the counter sword, and shows D25 in Bram’s dialogue. The only response is **Take care**; clicking it removes Bram and shows D26 from the dragon. New Game clears the Bram sale state, counter sword, and dialogue UI.

---

## Where the script ends (r91)

The tutorial runs **D1–D26** and the dragon guides the whole way. `lastLine()` is the final key of
`DIALOGUE`, so the guide-to-pet switch moves on its own as lines are added.

A round on 2026-09-17 hardcoded `lastLine()` to `'D19'`, which ended the tutorial at the counter
arrival and made the dragon a pet for the entire Bram branch — tapping it during **D23** ("Find the
sword you just made in your inventory and place it on the counter") popped hearts instead of repeating
the instruction, at exactly the moment a stuck player taps it. Reverted in r91.

Verified after the fix: tapping the dragon with D19, D23 or D24 last shown replays that line and pops
no hearts; with D26 shown it pops hearts and does not replay.

---

**D27** — Dragon
> "I found a bell for you. You can ring it to signal to the next customer that you are available."

**D28** — Dragon
> "Go ahead, try it!"

*Trigger: D26 now opens a run of three — D26, D27, D28 — so a click walks them. Showing **D27** is what
puts the bell on the counter, lit with the tutorial glow; D28 waits for the tap.*

**D29** — Customer (man1)
> "I saw a man walk out of this place. He couldn't stop beaming at his sword. I want to see what kind
> of swords you are crafting here. Give me a good, sharp one."

*Trigger: ringing the bell. Spoken in the customer's own panel and **typed** like Bram's lines. The
dragon waits for it to finish before answering.*

*Note: the owner wrote "gleaming at his sword" — a sword gleams; a person beams.*

**D30** — Dragon
> "I didn't think you would get so many customers on your first day!"

**D31** — Dragon
> "No tea break for us, I guess. Let's see how to make a sword and sharpen it to perfection! Back to the
> forge we go."

*Trigger: D30 fires once D29 has finished typing, and a click gives D31, which points an arrow at the
right-hand screen arrow. Arriving at the forge clears it. D31 is the last line in the script, so this is
where the dragon becomes a pet.*

*Note: the owner wrote "Back to the craft room we go" — the game has no room by that name; the screen is
the forge.*

---

## Back at the forge — D32–D38

**D32** — Dragon
> "I found 1 iron and 1 manganese. Last time we used 2 of each."

*Trigger: arriving at the forge after D31. The stock is set to exactly 1 iron and 1 manganese.*

**D33** — Dragon
> "We won't get the balanced trait we discovered last time if we forge this sword in the same way."

*Showing this line draws a blinking red **what-if path** on the map — the route 1 raw iron + 1 raw
manganese would actually make, ending in the same ✕ the real route uses. It ends at (1259, 1025) with
Balanced at (1120, 1020), so it visibly falls about half short, which is the point the line is making.
Nothing reads this path; it is drawn and thrown away.*

**D34** — Dragon
> "But don't worry, if we grind them properly, we can still craft a good sword."

**D35** — Dragon
> "Drag one iron to the grinding wheel. Hold the handle and rotate the wheel. Note how the path on the
> map is getting longer."

*Clicking through to D35 clears the what-if path and its ✕, and arms the grind step. The path growing
as you grind was already true — the preview redraws from the grind fraction.*

*Note: the owner wrote "the grinder". The station is captioned **Grind · wheel** and its own hint calls
it the wheel, so this says grinding wheel.*

**D36** — Dragon
> "Drag the ground ore to the smelter."

*Trigger: the iron reaching a **full** grind (1.0), not merely being ground.*

**D37** — Dragon
> "Do the same with manganese ore."

*Trigger: the fully ground iron going into the smelter.*

**D38** — Dragon
> "Great, the path is going all the way to the balanced trait we discovered last time."

*Trigger: the fully ground manganese going in. Literally true: the route ends at (1119, 1018) against
Balanced at (1120, 1020) — two world units.*

**D39** — Dragon
> "Heat up the smelter. Oh, I almost forgot to tell you!"

**D40** — Dragon
> "The hotter the metal is, the faster the sword icon travels on the defined path when you hammer."

*D38 now runs into both of these on clicks. The owner wrote D40 lowercase and unpunctuated as a
continuation; it is its own bubble, so it takes a capital and a full stop.*

**D41** — Dragon
> "Hot enough! Move it to the anvil and start hammering."

*Trigger: the heat reaching the ready mark. After this the second run is guided by **arrows only** —
the player has been told how every station works once already.*

**D42** — Dragon
> "Wait, since we discovered how to craft a 'balanced' sword using lesser ores, we should update our
> crafting process. It will be helpful later. Tap 'record craft'."

*Trigger: acquiring the trait. The 💾 button is now labelled **RECORD CRAFT** so the line names
something the player can read, and the shape picker refuses to open until the craft is recorded.*

**D43** — Dragon
> "You can compare the old one with the new one. Tap update to replace the old one, or tap 'record new'
> to add a new page and keep both."

*Trigger: the composition window opening. It now has a third button, **Record new**, which keeps both
pages instead of replacing.*

### Idle guidance

From D35 to the record, if the player does nothing for **4 seconds** (`HINT_IDLE_MS`, already the
build's idle threshold) an arrow points at the next step: ore→wheel, wheel→smelter, the bellows, the
gate, metal→anvil, hammer→anvil, mug→metal, then the panel toggle and RECORD CRAFT. Any interaction
clears it.

---

## Shaping the second sword — D44–D47

**D44** — Dragon
> "Tap on the metal to select a shape."

*Trigger: the craft being recorded (either **Update** or **Record new**). The metal on the anvil glows
and the shape picker, which the record step held shut, opens on a tap.*

**D45** — Dragon
> "You remember what to do, right? Go ahead, I'm ready!"

*Trigger: the hammering minigame opening for the second time. Nothing is re-taught here — D13–D17 did
that during the first craft and are all one-shot.*

*Note: the owner wrote "You remember what to do right?"; a tag question takes a comma.*

### D46 and D47 are idle prompts, not steps

From D45 until the blade is quenched, the dragon speaks **only if the player does nothing for 4
seconds** (`HINT_IDLE_MS`), and **re-speaks on every further 4 seconds of inactivity**. Any interaction
resets the clock and clears the pointer.

**D46** — Dragon
> "Tell me where to FIRE, and hammer the blade."

*Fires while the blade is unfinished. No pointer: where to aim is the player's choice.*

*Note: the owner wrote lowercase "fire". Capitalised to agree with **D16**, "Tell me where to FIRE!",
which teaches the same action in the first craft.*

**D47** — Dragon
> "Splash water to cool the blade and finish crafting."

*Fires once the mug goes live (the blade fully shaped). An arrow points from the mug to the blade,
lifted over the minigame panel.*

*Note: the owner wrote "splash water to cool the blade" — sentence case and a full stop added, and
"and finish crafting" appended so it does not read as a third, different account of what water does
after **D10** ("lock it in") and **D17** ("to finish"). "Blade" over "metal" is the owner's call.*

*After the splash the minigame closes as usual and the **Sword Crafted** window shows the sword and its
details. No new copy there. Because D47 is optional, the guide-to-pet switch is made explicitly when
that sword is crafted rather than waiting on the script's last line being seen.*

### Tap, not click

The build is a mobile game, so no player-facing string says "click". Corrected with this beat: **D12**
("Click on the metal to select the shape of the sword blade.") and the dialogue bubble's own
"click to continue" / "click to close" affordance.
