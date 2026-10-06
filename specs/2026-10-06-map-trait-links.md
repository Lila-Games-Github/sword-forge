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
