# Sword Grid Game - Game Design Document (GDD)

## 1. Overview
**Sword Grid Game** is a 2D grid-based exploration and blacksmith crafting game. The player acts as a blacksmith exploring a dark, hazardous map to uncover unique weapon traits, gather resources, forge custom blades, and sell them to discerning customers or through a passive shopfront. 

## 2. Core Gameplay Loop
1. **Gather:** Passively generate metals (Steel, Silver, Iron, Gold) via the Smelter.
2. **Explore:** Spend metals to move across a 50x50 fog-of-war grid using the Purify mini-game to dash.
3. **Discover & Heat:** Avoid hazards (explosions), find hidden traits, and play the Heating mini-game to extract them at varying quality levels.
4. **Forge:** Combine extracted traits and spent metals, choose a sword shape, and craft a finished weapon.
5. **Sell & Upgrade:** Fulfill specific NPC requests to earn Reputation and Gold, or sell passively in the Shop. Reinvest Gold to upgrade metal generation or unlock the Shop.
6. **Repeat:** Save successful blueprints for auto-crafting or reset the map to find new trait layouts.

---

## 3. Detailed Mechanics

### 3.1. Grid & Movement (The Purify Mini-Game)
* **The Grid:** 50x50 cells. The player starts at (25, 25). Vision radius clears fog of war dynamically.
* **Hazards:** 20% of the map contains Explosion hazards (💥). Hitting one instantly deducts 20 Health (from a max of 100). Reaching 0 Health shatters the active blade, losing all currently held traits and invested metals, and resets the player to the center.
* **Movement Cost:** Moving Up (Steel), Down (Iron), Left (Silver), Right (Gold).
* **Purify Mini-Game:** Instead of moving 1 square per click, movement triggers the **Purify Mini-Game**.
    * **Cost:** Exactly 1 metal of the corresponding direction.
    * **UI:** A fast-moving slider (Speed: 0.15) with three zones.
    * **Outcomes:**
        * **Weak (50% of bar - Edges):** Player dashes 1 block.
        * **Fine (30% of bar - Mid):** Player dashes 2 blocks.
        * **Epic (20% of bar - Center):** Player dashes 3 blocks.
    * *Note:* The dash stops early if the player hits the edge of the map or dies to a hazard.

### 3.2. Traits & The Heating Mini-Game
* **Traits:** 24 base traits (e.g., Durable 🛡️, Cursed ☠️, Flame 🔥) hidden across the map.
* **Value Scaling:** A trait's base value is determined by its distance from the starting center point (0 to 100 scale). Further = More Valuable.
* **Heating Mini-Game:** Triggered by pressing 'H' or clicking "Heat" on a discovered trait.
    * **UI:** A fast-moving slider (Speed: 0.15) with three heavily weighted zones.
    * **Outcomes & Qualities:**
        * **Weak (65% of bar - Edges):** +0 Gold value modifier.
        * **Fine (30% of bar - Mid):** +5 Gold value modifier.
        * **Epic (5% of bar - Dead Center):** +20 Gold value modifier.
* *Limitation:* A specific trait ID can only be applied once per active blade.

### 3.3. Forging & Weapon Shapes
* **Forging Requirement:** Must have spent at least 1 metal (by moving).
* **Shape Selection:** Clicking "Forge Blade" opens a modal to select 1 of 11 shapes (Shortsword, Cutlass, Claymore, Rapier, Longsword, Broadsword, Scimitar, Katana, Machete, Saber, Dagger).
* **Completion:** Selecting a shape clears the active forge, moves the completed sword (with its calculated Value, Traits, Quality, Shape, and Recipe) to the Inventory, and resets the player to (25, 25) with full health.

### 3.4. Economy & Resource Generation
* **Metals:** Steel, Iron, Silver, Gold. Generated passively by the Smelter.
* **Smelter Upgrades:** Starts at 1 metal/sec. Can be upgraded infinitely for 50 Gold per tier (+1 metal/sec per upgrade).

---

## 4. Selling & Progression

### 4.1. Active NPC Customers
* **Requests:** NPCs spawn with a request for a specific Trait. There is a **10% chance** they will also request a specific Weapon Shape.
* **Selling:** Giving the NPC a matching sword from the Inventory yields:
    * **Base Gold:** Equal to the sword's calculated value (Trait distance base + Quality bonus). Base value is 5g if the sword has zero traits.
    * **Reputation Multipliers:** * Negative Rep (< 0): Gold earned is reduced by 20%.
        * High Rep (> 10): Gold earned is increased by 20%.
    * **Reputation Gain:** +1 Rep for a successful sale.
* **Refusals:** Refusing a customer incurs a -1 Reputation penalty and summons a new customer after 1.8 seconds.

### 4.2. Passive Shopfront
* **Unlock:** Costs 50 Gold to open.
* **Mechanic:** Players can move swords from their Inventory to the Shop.
* **Selling Logic:** A background loop runs every 10 seconds. Each sword in the shop has an independent **5% chance** to sell.
* **Revenue:** Sold for exact calculated sword value. Does not affect Reputation. 

### 4.3. Blueprints (Saved Recipes)
* **Saving:** Players can save their current active traits and used metals as a Blueprint.
* **Auto-Crafting:** If the player has enough raw metals in their available pool, they can 1-click "Auto-Craft" the blueprint. This triggers the shape selection modal and outputs directly to the Inventory.

### 4.4. Map Travel
* **Reset:** Players can reset the 50x50 grid at any time.
* **Retained:** Gold, Available Metals, Reputation, Inventory, Shop Contents, Blueprints, and Smelter Upgrades.
* **Cleared:** Map Layout, Fog of War, Active Forge (resets to 0), Player Position (resets to center).

---

## 5. UI / UX Design Specs
* **Theme:** Clean, modern block-color interface with emoji-based graphics.
* **Layout:**
    * Top: NPC Dialogue and Refuse button.
    * Left Column: Status Panel (Health, Rep, Gold, Active Traits), 50x50 Scrollable/Draggable Viewport, Movement/Purify controls.
    * Right Column: Action Buttons, Resource Panels (Smelter Upgrade, Available vs. Used), Expandable Accordions for Inventory, Shop, and Blueprints.
* **Feedback:** Flash animations on damage (Red), heating (Orange), and passive shop sales (Green pulse on Gold text).