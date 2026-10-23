# Map trait icons open the craft book (2026-10-06), r220

Owner: "I want the trait icons on the map to be clickable. Clicking on them opens up the most recent
saved page for that trait." `tooling/map/map.test.mjs` asserts the rule below (between the `MAP-PURE`
markers) and its wiring.

## Rule

- **The page:** of the craft book pages (`RECIPES`) whose traits include the clicked trait, the one
  saved last (largest `at`). The book opens on it (`CB_SEL`, `openBook()`). A page for a combination
  ("Fire + Swift") counts for each of its traits.
- **No page yet** for a discovered trait: a toast, "No saved page for <Trait> yet".
- **An undiscovered trait** (shown as "?"): a toast, "Discover this trait first".
- **A trait still in the fog:** nothing happens (a click must not reveal what the fog hides).
- **What counts as a click:** the map pans by drag and captures the pointer, so the click is read on
  the map: a press and release less than 6 px apart, landing within the icon's circle (radius 17 map
  units + 4). A drag never opens the book.
- Discovered traits show the pointer cursor.

## Revised (owner, 2026-10-20), r278: a trait card, not the book

Owner: "When we click on the trait icons on the map, instead of the craft book, pop up a smaller window that has the
element icon, the description, and 'craft 1' and 'continue from here' buttons only. Add a separate button on this
window that says 'craft book', which opens the craft book."

- The page is chosen as before (the newest page with that trait, `CB_SEL`); the toasts and the fog rule are unchanged.
- A tap now opens the **trait card** (`#sfTraitModal`), not the book. It shows the trait's icon (its symbol), the page's
  name ("Fire Sword") and the page's description (`swordDesc`, as in the book), and three buttons:
  - **CRAFT 1**: the book's CRAFT 1 for that page (shape pick, then the sword); disabled when the book's would be
    (`ftueCraftLocked`, r239);
  - **CONTINUE FROM HERE**: the book's, for that page;
  - **CRAFT BOOK**: shuts the card and opens the book on that page.
- A small close button (x) shuts the card without doing anything. It is not in the owner's list; a window needs a way
  out, so Claude added it (owner to confirm).
- The FTUE's map route (GC5, D92n) points at the card's CRAFT 1 once the card is open, where it pointed at the
  book's. D92n still says "Tap on the trait to open the craft book directly."; the owner decides whether it changes.

Build (r278): `openTraitCard`, `closeTraitCard`, `tcCraft1`, `tcContinue`, `tcBook`, `traitCardOpen`; `mapTraitTap` ends
`CB_SEL=k; openTraitCard();`. The FTUE's book step (`ftueBookStep`, `ftueBookSig`) knows the card. Asserted by
`tooling/map/map.test.mjs` (17) and the FTUE test (544), written first. Checked in the browser (part 5 save): a tap on
the fire icon opens the card (fire symbol, "Fire Sword", its description, the three buttons visible and live), not the
book; CRAFT BOOK opens the book on the Fire page; CRAFT 1 opens the shape pick; CONTINUE FROM HERE puts the metal on the
anvil; the x and a tap outside close it. GC5's map route: the trait is lit in the dim, the tap opens the card, the dim
goes and the card's CRAFT 1 blinks. No console errors.
