# The craft book's trait list (R139, 2026-11-17)

Build: `Swordforge_looptest_landscape.html`. Tracker: R139 in `specs/2026-10-23-ftue-smelter-rework-plan.md`. Test:
`node tooling/ftue/ftue.test.mjs` (the R139 checks).

Owner (2026-11-17), on a picture of the open craft book: "Add a tab on the left side of the book (just like the top paper marks)
rotated. This tab will have a list of all traits, discovered and undiscovered (the same as the shape selection) in boxes.
Discovered ones will show the icons and undiscovered ones will show questionmark, greyedout."

Owner choices (2026-11-17): tapping a discovered trait opens its recipe page; one grid in the map's order; the tab shows a star
and the count found.

## The tab

- One bookmark on the **left edge** of the book: the top bookmarks' paper (`bookmark_paper.webp`), turned to lie sideways, in the
  book's side strip (`#cbMarksSide`, empty until now), behind the page so only its end shows.
- It reads **"⭐ 5/25"**, upright on the sideways tab: the traits found and the traits there are (`TRAITS`, 25).
- Tapping it turns the book to the trait list; it shows lit (as the open page's top bookmark does) while the list is open.
- Tapping a top bookmark turns back to that recipe page. Opening the book always starts on the recipe pages.

## The list

- **Left page, titled "All Traits":** one grid of 25 boxes, 5 x 5, in the map's own order (`TRAITS`: the five centre traits,
  Swift, Balanced, Durable, Flexible, Heavy, then the outer field), styled like the shape window's boxes.
- **A discovered trait** (lit on the map, `traits[].discovered`): its icon and name. If a recorded page has that trait (its own
  page first, else the first page that has it among several, `cbTraitPageOf`), the box can be tapped and opens that page, and
  shows a gold edge on hover. With no page yet, the box only shows.
- **An undiscovered trait:** a grey box with a grey "?", no name, not a button.
- **Right page, titled "Discovered":** the count ("5 / 25", "traits discovered") and "Tap a discovered trait to open its page."
- While the list is open the recipe page's parts (the sword, the boxes, ERASE, CONTINUE FROM HERE, CRAFT 1) are hidden; CLOSE
  stays.
